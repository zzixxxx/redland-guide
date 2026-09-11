#!/usr/bin/env node
/**
 * 按 uid 读取小红书账号主页的公开信息（昵称 / 小红书号 / 认证类型 / 简介 / 粉丝数），用于核对 booths.js 里的 xhs 账号是不是官方号。
 *
 * 用法：
 *   node scripts/xhs-profile.mjs <uid> [<uid> ...]
 *   node scripts/xhs-profile.mjs --all          # 检查 src/data/booths.js 里所有已填的 xhs.uid
 *
 * 说明：
 * - 主页 user/profile/<uid> 用手机 UA 会 302 到验证码页，桌面 Chrome UA 能拿到 SSR 的 window.__INITIAL_STATE__：
 *   user.userPageData.basicInfo（nickname / redId / desc / ipLocation）、verifyInfo.redOfficialVerifyType（官方 / 企业认证为 2，0 = 未认证）。
 *   笔记列表在 SSR 里没有 noteId，拿不到笔记链接。
 * - 有风控：同一 IP 连续查约 3 个 uid 后会 302 到 /login，之后要等一段时间（或换网络）再查；脚本每次间隔 20s，一次别查太多。
 * - 只能「按 uid 查」，不能按名字搜；发现新账号仍要靠该 IP 的笔记链接（fetch-note.mjs 的 user.userId）或用户在 App 里分享的主页链接。
 */
import fs from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const GAP_MS = 20000

async function profile(uid) {
  const res = await fetch(`https://www.xiaohongshu.com/user/profile/${uid}`, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'zh-CN,zh;q=0.9' },
    redirect: 'manual',
  })
  if (res.status !== 200) return { uid, error: `HTTP ${res.status} ${(res.headers.get('location') || '').slice(0, 60)}（多半是风控，稍后再试）` }
  const html = await res.text()
  const m = html.match(/window\.__INITIAL_STATE__\s*=\s*/)
  if (!m) return { uid, error: 'no __INITIAL_STATE__' }
  const raw = html.slice(m.index + m[0].length, html.indexOf('</script>', m.index)).trim().replace(/;$/, '').replace(/\bundefined\b/g, 'null')
  const st = JSON.parse(raw)
  const pd = st.user?.userPageData || {}
  const b = pd.basicInfo || {}
  const fans = (pd.interactions || []).find((x) => x.type === 'fans')?.count
  const notes = (st.user?.notes?.[0] || []).map((n) => n.noteCard?.displayTitle).filter(Boolean)
  return {
    uid,
    nickname: b.nickname,
    redId: b.redId,
    verifyType: pd.verifyInfo?.redOfficialVerifyType ?? null,
    ipLocation: b.ipLocation,
    fans,
    desc: (b.desc || '').replace(/\n/g, ' ').slice(0, 80),
    recentNotes: notes.slice(0, 5),
  }
}

let uids = process.argv.slice(2)
const names = {}
if (uids[0] === '--all') {
  const src = fs.readFileSync(new URL('../src/data/booths.js', import.meta.url), 'utf8')
  uids = []
  for (const line of src.split('\n')) {
    const m = line.match(/id: '(\w+)'.*xhs: \{ uid: '([0-9a-f]{24})', name: '([^']+)'/)
    if (!m) continue
    if (!uids.includes(m[2])) uids.push(m[2])
    names[m[2]] = (names[m[2]] ? names[m[2]] + ' / ' : '') + `${m[1]} ${m[3]}`
  }
}
if (!uids.length) {
  console.error('用法: node scripts/xhs-profile.mjs <uid> [...] | --all')
  process.exit(1)
}
for (const [i, uid] of uids.entries()) {
  if (i) await new Promise((r) => setTimeout(r, GAP_MS))
  try {
    const p = await profile(uid)
    const tag = names[uid] ? `[${names[uid]}] ` : ''
    if (p.error) console.log(`${tag}${uid}  ✗ ${p.error}`)
    else console.log(`${tag}${uid}  ${p.nickname}  小红书号 ${p.redId}  认证 ${p.verifyType}  粉丝 ${p.fans}  ${p.ipLocation || ''}\n    ${p.desc}\n    近期：${p.recentNotes.join(' / ')}`)
  } catch (e) {
    console.log(`${uid}  ✗ ${e.message}`)
  }
}
