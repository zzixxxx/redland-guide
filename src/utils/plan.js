// 待打卡清单的路线规划：目标是「最少回头路」，不是按展位号排（用户 9/15）。
//
// 做法（2026-09-15 改）：距离矩阵 → 多个初始顺序 → 2-opt + Or-opt 反复改进 → 取最短的那条。
//   · 初始顺序给三个：最近邻（从登岛起点贪心）、逛展动线蛇形序、展位号顺序。
//     单看初始顺序最近邻最好，但 2-opt 之后差距只剩 0.5–3%，三个都跑一遍再取最优最稳。
//   · 2-opt 反转一段（解开交叉），Or-opt 把 1–3 个连续站点整体挪到别处（把顺路的点插进去），
//     两种邻域轮流跑到不再改进为止。只有 2-opt 时常见「一个点被落下、最后专程折返」，Or-opt 专治这个。
//   · 起点固定在登岛起点，终点开放（逛完就散，不用回到起点）。
// 距离矩阵用 findDistances（一次单源 Dijkstra 覆盖所有目标），n 个点跑 n 次，
// 不要按 n² 次 findRoute —— 81 个点是 240ms 对 13.4 秒的差别。
//
// 用户可以自己调顺序：传 fixedOrder 就完全按它走，不再优化（BoothsPage 的 ↑ ↓ 按钮，存 rl26.planOrder）。
import { walkGrid, mapStart, mapSpots, mapSeq, doorPoint } from '../data/mapSpots.js'
import { findDistances, findRoute } from './route.js'

// 每个展位的到达点用「朝向过道的那条边」（mapDoors），不是几何中心
const center = (no) => doorPoint(no)

/**
 * 给一组展位号排出走法。
 * @param {string[]} stops 展位号（booths[].no，如 'A06'）
 * @param {string[]|null} fixedOrder 用户手动调过的顺序；给了就照走，不再优化
 * @returns {{order:string[], legs:{from:string|null,to:string,points:{x:number,y:number}[]}[], steps:number[], total:number, manual:boolean}}
 *          order 访问顺序；legs 每段折线（第一段从登岛起点出发）；steps 每段长度；total 总长（P2 像素）
 */
export function planRoute(stops, fixedOrder = null) {
  const list = [...new Set(stops)].filter((n) => mapSpots[n])
  if (!list.length) return { order: [], legs: [], steps: [], total: 0, manual: false }

  // 手动顺序：成员一致才认，否则（刚加 / 删了点）退回自动
  const manual = !!fixedOrder && sameSet(fixedOrder, list)
  let order
  if (manual) {
    order = fixedOrder.filter((n) => list.includes(n))
  } else {
    // 距离矩阵：第 0 行 / 列是登岛起点
    const pts = [mapStart, ...list.map(center)]
    const D = pts.map((p) => findDistances(walkGrid, p, pts, mapSpots))
    const cost = (a, b) => D[a][b]
    const n = list.length
    const byNo = [...Array(n).keys()].map((i) => i + 1)

    const seeds = [
      nearestNeighbour(n, cost),
      [...byNo].sort((a, b) => (mapSeq[list[a - 1]] ?? 999) - (mapSeq[list[b - 1]] ?? 999) || cmp(list[a - 1], list[b - 1])),
      [...byNo].sort((a, b) => cmp(list[a - 1], list[b - 1])),
    ]
    let best = null
    let bestLen = Infinity
    for (const seed of seeds) {
      const t = improve(seed, cost)
      const L = tourLen(t, cost)
      if (L < bestLen - 1e-9) {
        bestLen = L
        best = t
      }
    }
    order = best.map((i) => list[i - 1])
  }

  // 优化用的是带权代价（桥接格、展位格更贵），只适合比较；对外给的距离要用折线的实际几何长度
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
  return { order, legs, steps, total: steps.reduce((a, b) => a + b, 0), manual }
}

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const sameSet = (a, b) => a.length === b.length && new Set(a).size === new Set([...a, ...b]).size

// 路线长度：起点固定为 0，终点开放
function tourLen(o, cost) {
  let d = cost(0, o[0])
  for (let i = 1; i < o.length; i++) d += cost(o[i - 1], o[i])
  return d
}

// 最近邻：每次从当前点跳到最近的未访问点
function nearestNeighbour(n, cost) {
  const left = new Set([...Array(n).keys()].map((i) => i + 1))
  const out = []
  let cur = 0
  while (left.size) {
    let pick = -1
    let bestD = Infinity
    for (const i of left) {
      const d = cost(cur, i)
      if (d < bestD) {
        bestD = d
        pick = i
      }
    }
    out.push(pick)
    left.delete(pick)
    cur = pick
  }
  return out
}

// 2-opt（反转一段）+ Or-opt（把 1–3 个连续站点整段挪走），轮流跑到收敛
function improve(seed, cost) {
  let o = [...seed]
  const at = (arr, i) => (i < 0 ? 0 : arr[i]) // -1 代表起点
  for (let round = 0; round < 120; round++) {
    let improved = false

    // 2-opt：反转 [i, j]，只比较受影响的两条边
    for (let i = 0; i < o.length - 1; i++) {
      for (let j = i + 1; j < o.length; j++) {
        const a = at(o, i - 1)
        const b = o[i]
        const c = o[j]
        const d = j + 1 < o.length ? o[j + 1] : null
        const before = cost(a, b) + (d === null ? 0 : cost(c, d))
        const after = cost(a, c) + (d === null ? 0 : cost(b, d))
        if (after < before - 1e-9) {
          o = [...o.slice(0, i), ...o.slice(i, j + 1).reverse(), ...o.slice(j + 1)]
          improved = true
        }
      }
    }

    // Or-opt：取出长度 1–3 的一段，插到别的位置（正插 / 反插都试）
    for (let len = 1; len <= 3 && len < o.length; len++) {
      for (let i = 0; i + len <= o.length; i++) {
        const seg = o.slice(i, i + len)
        const rest = [...o.slice(0, i), ...o.slice(i + len)]
        const base = tourLen(o, cost)
        for (let k = 0; k <= rest.length; k++) {
          if (k === i) continue
          for (const s of [seg, [...seg].reverse()]) {
            const cand = [...rest.slice(0, k), ...s, ...rest.slice(k)]
            if (tourLen(cand, cost) < base - 1e-9) {
              o = cand
              improved = true
              break
            }
          }
          if (improved) break
        }
        if (improved) break
      }
      if (improved) break
    }

    if (!improved) break
  }
  return o
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
