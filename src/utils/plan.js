// 待打卡清单的路线规划：先按逛展动线序号（mapSeq 蛇形序）排个初始顺序，再用 2-opt 局部改进。
//
// 为什么是这套组合（2026-09-14 在真实路网上实测，数据见 docs 13.14）：
//   · 仓库那五种经典拣货策略（穿越 / 返回 / 中点 / 最大间隙 / 组合）在本场地都打不过最近邻，
//     因为展区是开放广场、画出来的线之间横向连通很多，「走完整条巷道」的代价白付；
//   · 但加上 2-opt 之后所有初始顺序都收敛到相差 0.5–3%，40 / 81 个点时蛇形种子反而略优；
//   · 蛇形种子 O(n log n)、结果稳定且可解释（从东往西一条巷道一条巷道扫），所以用它当种子。
// 距离矩阵用 findDistances（一次单源 Dijkstra 覆盖所有目标），n 个点跑 n 次，
// 不要按 n² 次 findRoute —— 81 个点是 240ms 对 13.4 秒的差别。
import { walkGrid, mapStart, mapSpots, mapSeq, doorPoint } from '../data/mapSpots.js'
import { findDistances, findRoute } from './route.js'

// 每个展位的到达点用「朝向过道的那条边」（mapDoors），不是几何中心
const center = (no) => doorPoint(no)

/**
 * 给一组展位号排出走法。
 * @param {string[]} stops 展位号（booths[].no，如 'A06'）
 * @returns {{order:string[], legs:{from:string|null,to:string,points:{x:number,y:number}[]}[], steps:number[], total:number}}
 *          order 访问顺序；legs 每段折线（第一段从登岛起点出发）；steps 每段长度；total 总长（P2 像素）
 */
export function planRoute(stops) {
  const list = [...new Set(stops)].filter((n) => mapSpots[n])
  if (!list.length) return { order: [], legs: [], steps: [], total: 0 }

  // 距离矩阵：第 0 行 / 列是登岛起点
  const pts = [mapStart, ...list.map(center)]
  const D = pts.map((p) => findDistances(walkGrid, p, pts, mapSpots))
  const cost = (a, b) => D[a][b]

  // 初始顺序：蛇形序（没有 seq 的排到最后，按展位号兜底）
  let idx = list.map((_, i) => i + 1)
  idx.sort((a, b) => (mapSeq[list[a - 1]] ?? 999) - (mapSeq[list[b - 1]] ?? 999) || (list[a - 1] < list[b - 1] ? -1 : 1))

  // 2-opt：反转区间，只比较受影响的两条边（起点固定，终点开放）
  const tourLen = (o) => {
    let d = cost(0, o[0])
    for (let i = 1; i < o.length; i++) d += cost(o[i - 1], o[i])
    return d
  }
  for (let round = 0; round < 80; round++) {
    let improved = false
    for (let i = 0; i < idx.length - 1; i++) {
      for (let j = i + 1; j < idx.length; j++) {
        const a = i === 0 ? 0 : idx[i - 1]
        const b = idx[i]
        const c = idx[j]
        const d = j + 1 < idx.length ? idx[j + 1] : null
        const before = cost(a, b) + (d === null ? 0 : cost(c, d))
        const after = cost(a, c) + (d === null ? 0 : cost(b, d))
        if (after < before - 1e-9) {
          const seg = idx.slice(i, j + 1).reverse()
          idx = [...idx.slice(0, i), ...seg, ...idx.slice(j + 1)]
          improved = true
        }
      }
    }
    if (!improved) break
  }

  // 2-opt 用的是带权代价（桥接格 ×25、展位格 ×6），只适合比较；对外给的距离要用折线的实际几何长度
  const order = idx.map((i) => list[i - 1])
  const legs = []
  const steps = []
  let prev = mapStart
  let prevNo = null
  for (const no of order) {
    const to = center(no)
    const points = findRoute(walkGrid, prev, to, mapSpots) || []
    legs.push({ from: prevNo, to: no, points })
    steps.push(polyLen(points))
    prev = to
    prevNo = no
  }
  return { order, legs, steps, total: steps.reduce((a, b) => a + b, 0) }
}

// P2 切片按 2400×1738 的缩略图坐标算折线长度（归一化 → 像素）
const PX_W = 2400
const PX_H = 1738
function polyLen(pts) {
  let d = 0
  for (let i = 1; i < pts.length; i++) {
    d += Math.hypot((pts[i].x - pts[i - 1].x) * PX_W, (pts[i].y - pts[i - 1].y) * PX_H)
  }
  return d
}

// 比例尺取自官方图自己标的那条箭头「入口距离：地铁12号线·复兴岛站200M」——
// 箭头在 2400 宽的 P2 缩略图上长约 290px，即 1px ≈ 0.69m。是图上直线距离的量级参考，界面上标「约」。
const M_PER_PX = 200 / 290
export const fmtDist = (d) => {
  const m = Math.round(d * M_PER_PX)
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`
}
