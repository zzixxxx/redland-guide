// 给展位列表的搜索框生成拼音索引：src/data/boothPinyin.js（自动生成，勿手改）。
//
// 用法：node scripts/gen-pinyin.mjs      —— npm run build 前会通过 prebuild 自动跑一遍，本地开发改了 booths.js / boothDetails.js 后手动跑
//
// 为什么预生成而不是运行时转：pinyin-pro 的字典有几百 KB，首屏没必要背它；93 个展位的关键词在构建期算好只有几 KB。
// 每个展位收 4 类关键词：IP 名、alias、主账号昵称、详情里 accounts / moreSources 的账号名（与 BoothsPage 的 searchExtra 同一批词，
// 这样「搜得到中文」的词也「搜得到拼音」）。每个词出两份：全拼（去空格）与首字母；非汉字（RED LAND / 2077）按原文小写保留。
import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { pinyin } from 'pinyin-pro'

const here = dirname(fileURLToPath(import.meta.url))
const { booths } = await import(pathToFileURL(resolve(here, '../src/data/booths.js')).href)
const details = (await import(pathToFileURL(resolve(here, '../src/data/boothDetails.js')).href)).default

const clean = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
function keys(text) {
  const toks = pinyin(text, { toneType: 'none', type: 'string', nonZh: 'consecutive', v: true })
    .split(/\s+/)
    .map(clean)
    .filter(Boolean)
  if (!toks.length) return null
  return { f: toks.join(''), i: toks.map((t) => t[0]).join('') }
}

const out = {}
for (const b of booths) {
  const d = details[b.id]
  const phrases = [b.ip, b.alias, b.xhs?.name, ...(d?.accounts || []).map((a) => a.name), ...(d?.moreSources || []).map((m) => m.author)]
    .filter(Boolean)
    // alias 里用空格并列了多个词（如「独立游戏 联想 ROG 西昊 傲风 雷蛇」），拆开各算
    .flatMap((p) => p.split(/\s+/))
  const f = new Set()
  const i = new Set()
  for (const p of phrases) {
    const k = keys(p)
    if (!k) continue
    f.add(k.f)
    if (k.i.length >= 2) i.add(k.i)
  }
  out[b.id] = { f: [...f], i: [...i] }
}

const body = Object.entries(out)
  .map(([id, v]) => `  ${id}: { f: ${JSON.stringify(v.f)}, i: ${JSON.stringify(v.i)} },`)
  .join('\n')
writeFileSync(
  resolve(here, '../src/data/boothPinyin.js'),
  `// 自动生成，勿手改：node scripts/gen-pinyin.mjs（npm run build 前自动跑）。展位搜索的拼音索引：f = 全拼（含 alias / 账号名），i = 首字母\nexport default {\n${body}\n}\n`,
)
console.log(`boothPinyin.js: ${Object.keys(out).length} 个展位，示例 A06 →`, out.A06)
