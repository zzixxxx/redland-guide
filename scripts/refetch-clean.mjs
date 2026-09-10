// 把已抓取的小红书笔记图重新拉成无水印版（ci.xiaohongshu.com/<fileId>?imageView2/2/w/1080/format/jpg），
// 覆盖 public/img 下已保留的同名图（按文件名里的序号对应原图 imageList 下标），并把 fileIds 写回 note.json。
// 用法：node scripts/refetch-clean.mjs <目录...>   例：node scripts/refetch-clean.mjs public/img/booths/A24 public/img/rules/pin
//   目录下每个 note*.json 视为一条笔记：note.json ↔ NN.jpg，note-<ip>.json ↔ <ip>-NN.jpg。
//   页面地址取 note.json 的 finalUrl；没有时用环境变量 FALLBACK_<目录名>（如 FALLBACK_A06=https://xhslink.cn/o/xxx）。
// 只下载到 <目录>/_clean/，不压缩；压缩与归档由调用方（见 CLAUDE.md §6）处理。
import fs from 'node:fs'
import path from 'node:path'

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const dirs = process.argv.slice(2)
if (!dirs.length) { console.error('用法: node scripts/refetch-clean.mjs <目录...>'); process.exit(1) }

async function loadNote(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
  const html = await res.text()
  const m = html.match(/window\.__INITIAL_STATE__\s*=\s*/)
  if (!m) throw new Error('no __INITIAL_STATE__: ' + res.url)
  const start = m.index + m[0].length
  const end = html.indexOf('</script>', start)
  const state = JSON.parse(html.slice(start, end).trim().replace(/;$/, '').replace(/(^|[^A-Za-z0-9_])undefined(?![A-Za-z0-9_])/g, '$1null'))
  const note = state?.noteData?.data?.noteData
  if (!note) throw new Error('no noteData: ' + res.url)
  return note
}

for (const dir of dirs) {
  const base = path.basename(dir)
  const metas = fs.readdirSync(dir).filter((f) => /^note(-[a-z0-9]+)?[.]json$/.test(f))
  for (const metaFile of metas) {
    const prefix = metaFile === 'note.json' ? '' : metaFile.replace(/^note-(.+)\.json$/, '$1-')
    const meta = JSON.parse(fs.readFileSync(path.join(dir, metaFile), 'utf8'))
    const url = meta.finalUrl || process.env['FALLBACK_' + base.replace(/[^A-Za-z0-9]/g, '_')]
    if (!url) { console.error(`[${base}/${metaFile}] 无 finalUrl，跳过（可设 FALLBACK_${base}）`); continue }
    let note
    try { note = await loadNote(url) } catch (e) { console.error(`[${base}/${metaFile}] 页面失败：${e.message}`); continue }
    const kept = fs.readdirSync(dir).filter((f) => new RegExp('^' + prefix + '[0-9][0-9][.]jpg$').test(f))
    const outDir = path.join(dir, '_clean'); fs.mkdirSync(outDir, { recursive: true })
    const fileIds = (note.imageList || []).map((im) => im.fileId || null)
    for (const f of kept) {
      const idx = Number(f.slice(prefix.length, prefix.length + 2))
      const fid = fileIds[idx]
      if (!fid) { console.error(`[${base}] ${f} 无 fileId，跳过`); continue }
      const r = await fetch(`https://ci.xiaohongshu.com/${fid}?imageView2/2/w/1080/format/jpg`, { headers: { 'User-Agent': UA, Referer: 'https://www.xiaohongshu.com/' } })
      if (!r.ok) { console.error(`[${base}] ${f} HTTP ${r.status}`); continue }
      const buf = Buffer.from(await r.arrayBuffer())
      fs.writeFileSync(path.join(outDir, f), buf)
      console.error(`[${base}] ${f} <- ${fid} ${(buf.length / 1024) | 0}KB`)
    }
    meta.fileIds = fileIds
    meta.clean = true
    fs.writeFileSync(path.join(dir, metaFile), JSON.stringify(meta, null, 2), 'utf8')
  }
}
