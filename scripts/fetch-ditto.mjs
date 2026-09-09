#!/usr/bin/env node
/**
 * 抓取小红书 ditto 低代码 H5 页面（fe.xiaohongshu.com/ditto/vincent/<id> 或 xhslink 短链 302 过去的页面）的
 * 全部图片与热区跳转，用于收录「专题页」型官方内容（例：阅文 × RED LAND「读档！就现在」）。
 *
 * 用法：
 *   node scripts/fetch-ditto.mjs <链接或页面id> <输出目录> [--sub]
 *   例：node scripts/fetch-ditto.mjs "https://xhslink.com/m/xxxx" public/img/booths/A35/raw --sub
 *
 * 产出：
 *   <输出目录>/00.png ...            页面内所有「自定义图片 / 热区图」原图（PNG，1125 宽；再用 Pillow 压成 810px JPEG）
 *   <输出目录>/ditto.json            页面配置摘要：pageName / shareTitle / lastEditTime / 每张图的 CDN 地址、尺寸、热区跳转、关注组件 uid
 *   --sub 时，热区跳转到的其他 ditto 子页递归抓到 <输出目录>/sub-<n>/（只抓一层）
 *
 * 说明：ditto 页面配置内联在 window.__SETUP_SERVER_STATE__，图片在 growth-img.xhscdn.com/ditto/<id>，
 * 加 ?imageView2/2/w/1125/format/png 可取 PNG；关注组件（OnixDittoFollowNew）的 userId 就是该 IP 官方账号 uid。
 */
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const withSub = args.includes('--sub')
const [linkOrId, outDir] = args.filter((a) => !a.startsWith('--'))
if (!linkOrId || !outDir) {
  console.error('用法: node scripts/fetch-ditto.mjs <链接或页面id> <输出目录> [--sub]')
  process.exit(1)
}

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const toLink = (s) => (/^https?:/.test(s) ? s : `https://fe.xiaohongshu.com/ditto/vincent/${s}?naviHidden=yes&fullscreen=true`)

async function fetchState(link) {
  const res = await fetch(link, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  const html = await res.text()
  const m = html.match(/window\.__SETUP_SERVER_STATE__\s*=\s*/)
  if (!m) throw new Error(`页面里没有 __SETUP_SERVER_STATE__（不是 ditto 页？）最终 URL: ${res.url}`)
  const start = m.index + m[0].length
  const end = html.indexOf('</script>', start)
  const raw = html.slice(start, end).trim().replace(/;$/, '').replace(/\bundefined\b/g, 'null')
  return { state: JSON.parse(raw), finalUrl: res.url }
}

async function grab(link, dir, depth) {
  const { state, finalUrl } = await fetchState(link)
  fs.mkdirSync(dir, { recursive: true })
  const pc = state.DSL?.pageConfig || {}
  const nodes = state.DSL?.componentsTree?.[0]?.children || []
  const pageId = (finalUrl.match(/vincent\/([0-9a-f]{32})/) || [])[1]
  const out = {
    pageId,
    finalUrl,
    pageName: pc.pageName,
    shareTitle: pc.shareTitle,
    shareDesc: pc.shareDesc,
    lastEditTime: pc.lastEditTime,
    startTime: pc.startTime,
    endTime: pc.endTime,
    follow: [],
    images: [],
  }
  let i = 0
  const subs = []
  for (const n of nodes) {
    if (n.componentName === 'OnixDittoFollowNew') {
      out.follow.push({ userId: n.props?.userId, remark: n.extra?.remarkName })
      continue
    }
    const img = n.props?.imgUrl?.originImgInfo || n.props?.imgInfo?.originImgInfo
    if (!img?.url) continue
    const name = `${String(i).padStart(2, '0')}.png`
    const links = (n.props?.areaLinkList || []).map((a) => {
      const c = a.eventInfo?.configs || {}
      return { id: a.id, left: a.left, top: a.top, width: a.width, height: a.height, dittoPageId: c.dittoPageId, link: c.dittoPageLink || c.link || c.url }
    })
    try {
      const r = await fetch(img.url + '?imageView2/2/w/1125/format/png', { headers: { 'User-Agent': UA } })
      const buf = Buffer.from(await r.arrayBuffer())
      fs.writeFileSync(path.join(dir, name), buf)
      console.error(`${dir}/${name} ${(buf.length / 1024) | 0}KB ${img.width}x${img.height} ${links.map((l) => l.link || '').join(' ')}`)
    } catch (e) {
      console.error('image failed', img.url, e.message)
    }
    out.images.push({ file: name, component: n.componentName, remark: n.extra?.remarkName, url: img.url, width: img.width, height: img.height, links })
    for (const l of links) if (l.dittoPageId) subs.push(l.dittoPageId)
    i++
  }
  fs.writeFileSync(path.join(dir, 'ditto.json'), JSON.stringify(out, null, 2), 'utf8')
  console.log(`[${pc.pageName || pageId}] ${out.images.length} 张图, 关注组件 uid: ${out.follow.map((f) => f.userId).join(', ') || '无'}`)
  if (withSub && depth === 0 && subs.length) {
    for (const [k, id] of [...new Set(subs)].entries()) await grab(toLink(id), path.join(dir, `sub-${k}`), depth + 1)
  } else if (subs.length) {
    console.log('热区跳转的子页:', [...new Set(subs)].join(' '), withSub ? '' : '（加 --sub 一并抓取）')
  }
}

await grab(toLink(linkOrId), outDir, 0)
