#!/usr/bin/env node
/**
 * 抓取小红书笔记（分享短链或 discovery/item 链接）的文字与图片，用于补充展台详情。
 *
 * 用法：
 *   node scripts/fetch-note.mjs <小红书链接> <展位id>
 *   例：node scripts/fetch-note.mjs "https://xhslink.cn/o/2KHjtNJUxgl" A06
 *
 * 产出：
 *   public/img/booths/<展位id>/00.jpg ...   笔记图片（原图，建议再压一遍）
 *   public/img/booths/<展位id>/note.json     笔记原始数据（title / desc / tags / user / images）
 *   控制台打印可直接粘贴到 src/data/boothDetails.js 的骨架
 *
 * 说明：小红书分享页会在 HTML 内联 window.__INITIAL_STATE__，其中 noteData.data.noteData 含完整正文与图片列表。
 * 展台活动 / 任务 / 奖励几乎都写在图片里，需要人工（或让 Claude）看图后填入 boothDetails.js。
 */
import fs from 'node:fs'
import path from 'node:path'

const [, , link, boothId] = process.argv
if (!link || !boothId) {
  console.error('用法: node scripts/fetch-note.mjs <小红书链接> <展位id>')
  process.exit(1)
}

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const res = await fetch(link, { headers: { 'User-Agent': UA }, redirect: 'follow' })
const html = await res.text()
const m = html.match(/window\.__INITIAL_STATE__\s*=\s*/)
if (!m) {
  console.error('页面里没有 __INITIAL_STATE__，可能被风控或链接失效。最终 URL:', res.url)
  process.exit(2)
}
const start = m.index + m[0].length
const end = html.indexOf('</script>', start)
const raw = html.slice(start, end).trim().replace(/;$/, '').replace(/\bundefined\b/g, 'null')
const state = JSON.parse(raw)
const note = state?.noteData?.data?.noteData
if (!note) {
  console.error('未解析到 noteData。最终 URL:', res.url)
  process.exit(3)
}

const outDir = path.resolve('public/img/booths', boothId)
fs.mkdirSync(outDir, { recursive: true })

// 无水印原图：分享页给的 !h5_1080jpg 样式会在图中央叠「小红书」水印；
// 用 fileId 直接拼 ci.xiaohongshu.com 的 imageView2 地址可拿到同尺寸（1080 宽）无水印 JPEG。没有 fileId 时回退到带水印地址。
const cleanUrl = (im) => (im.fileId ? `https://ci.xiaohongshu.com/${im.fileId}?imageView2/2/w/1080/format/jpg` : null)

const images = []
const fileIds = []
for (const [i, im] of (note.imageList || []).entries()) {
  const url = cleanUrl(im) || im.urlDefault || im.url || im.infoList?.[0]?.url
  if (!url) continue
  fileIds.push(im.fileId || null)
  const name = `${String(i).padStart(2, '0')}.jpg`
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://www.xiaohongshu.com/' } })
    const buf = Buffer.from(await r.arrayBuffer())
    fs.writeFileSync(path.join(outDir, name), buf)
    images.push(`img/booths/${boothId}/${name}`)
    console.error(`saved ${name} ${(buf.length / 1024) | 0}KB`)
  } catch (e) {
    console.error('image failed', url, e.message)
  }
}

const meta = {
  noteId: note.noteId,
  title: note.title,
  desc: note.desc,
  user: note.user,
  tags: (note.tagList || []).map((t) => t.name),
  time: note.time,
  finalUrl: res.url,
  images,
  fileIds, // 各图 fileId，可用 scripts/refetch-clean.mjs 重新拉无水印原图
}
fs.writeFileSync(path.join(outDir, 'note.json'), JSON.stringify(meta, null, 2), 'utf8')

const date = new Date(note.time || Date.now())
const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const skeleton = {
  source: { title: note.title, url: link, noteId: note.noteId, author: note.user?.nickName || note.user?.nickname, publishedAt: iso },
  boothNo: (note.desc.match(/展位号[:：]\s*([A-Z]-?\d+)/) || [])[1] || boothId,
  intro: (note.desc.split('\n')[0] || '').trim(),
  notes: note.desc.split('\n').filter((l) => l.trim().startsWith('*')).map((l) => l.replace(/^\*\s*/, '').trim()),
  activities: [],
  stage: [],
  tasks: [],
  rewards: [],
  footnote: '',
  images,
}
console.log(`\n// ---- 粘贴到 src/data/boothDetails.js（key: ${boothId}），看图补齐 activities / stage / tasks / rewards ----`)
console.log(`${boothId}: ${JSON.stringify(skeleton, null, 2)},`)
console.log(`\n// 正文：\n${note.desc}`)
