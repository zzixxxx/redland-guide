// 节目单 / 花车名单里的 IP 文案 ↔ 展位的对应关系（详情页「这个 IP 还出现在…」快捷跳转、舞台 / 花车页锚点定位用）。
// 三处数据的 IP 名字写法不完全一致（「《火影忍者》手游」「逆水寒手游 · 新世界」「奥星热浪 / 命运扳机 / 归环」），
// 所以：去掉空格与标点后先做精确匹配；精确对上了别的展位就不再做包含匹配（「王者荣耀」不能同时命中「王者荣耀世界」）；
// 否则允许一方包含另一方（「刺客信条：黑旗 记忆重置」→ 刺客信条）。alias（旧名）同样参与。
import { booths } from '../data/booths.js'

export const normIp = (s) =>
  String(s || '')
    .replace(/[\s·・:：\-—《》「」()（）｜|]/g, '')
    .toLowerCase()

// 「A / B / C」这类合写按斜杠拆开
const splitIps = (s) => String(s || '').split(/\s*\/\s*/).filter(Boolean)

let exactSet = null
const hasExact = (n) => {
  if (!exactSet) exactSet = new Set(booths.map((b) => normIp(b.ip)))
  return exactSet.has(n)
}

/** 名单里的一段 IP 文案（可含「A / B」）是否指这个展位 */
export function ipRefersTo(text, booth) {
  if (!booth) return false
  const bn = normIp(booth.ip)
  const ba = normIp(booth.alias)
  if (!bn) return false
  return splitIps(text).some((part) => {
    const n = normIp(part)
    if (!n) return false
    if (n === bn || (ba && n === ba)) return true
    if (hasExact(n)) return false
    return bn.includes(n) || n.includes(bn) || (ba && (ba.includes(n) || n.includes(ba)))
  })
}
