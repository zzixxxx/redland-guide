// 平面图上的寻路：在 mapSpots.js 的可走网格上跑 A*，把「起点 → 展位」连成一条折线。
// 网格按官方图画出来的线判可走（详见 mapSpots.js），展位框不挖、只加通行代价，
// 路线因此优先走展位之间的过道，绕不开时才从展位上过。坐标一律用 P2 切片的归一化 0–1。
//
// 性能（14175 个可走格 / 5 万条无向边，2026-09-14 实测）：
//   单次查询 —— 原来开表用线性扫最小值是 O(V²)，改二叉堆后 4.2ms → 2.7ms；
//   多点距离 —— 用 findDistances 一次单源 Dijkstra 拿到到所有目标的距离（9ms），
//   81×81 的全矩阵 81 次即可（318ms）；按 n² 次 A* 要 3240 次约 13.4 秒，差 42 倍。
// 没上双向 Dijkstra / ALT / Contraction Hierarchies：这三种是为百万级路网准备的，
// 本图只有 1.4 万格且是「粗带状」的均匀网格（度分布里 69% 的格子度数为 8，没有一个度为 2 的格），
// 既没有可收缩的链，也没有 CH 依赖的「高速—乡道」层级，收缩只会造出海量 shortcut。
// 实测双向 Dijkstra 2.75ms，和堆版 A* 打平（图太小，两个小圆并不比一个圆省）。

const IDX = (g, x, y) => y * g.w + x

// rows 里 '2' = 图上真的画了线的格，'1' = 闭运算补出来的桥接格，'0' = 不可走。
// 桥接格要贵一些，否则跨空地的桥会被当成捷径，路线就不走出入口了。
// 但也不能太贵：官方图上大量真过道是粉色细虚线 / 被展位文字压断的线，闭运算补出来的就是桥接格。
// 定 25 时，穿过一个 5 格深的桥（B 区 B02↔B01 那个出入口）要付 125 代价 ≈ 300m 的真线，
// A* 于是宁可绕 700m 走「真线」—— 去 B10 要 1.1km（实际 370m）、去 A14 绕到场外南侧马路（用户 9/15 两次反馈）。
// 改成 6 后：短桥（出入口、虚线缺口 2–6 格）付得起，长桥（横穿广场几十格）仍然划不来。
const BRIDGE_COST = 6
// 展位格的额外代价：够让 A* 宁愿绕一圈
const SPOT_COST = 6
// 八邻域：dx, dy, 基础步长
const NB = [
  [-1, -1, Math.SQRT2], [0, -1, 1], [1, -1, Math.SQRT2],
  [-1, 0, 1], [1, 0, 1],
  [-1, 1, Math.SQRT2], [0, 1, 1], [1, 1, Math.SQRT2],
]

// 最小二叉堆（key 为 Float64，val 为节点下标）。原来用数组线性找最小，节点一多就是平方复杂度。
class MinHeap {
  constructor(cap) {
    this.k = new Float64Array(cap)
    this.v = new Int32Array(cap)
    this.n = 0
  }
  push(key, val) {
    if (this.n === this.k.length) {
      const k = new Float64Array(this.n * 2)
      const v = new Int32Array(this.n * 2)
      k.set(this.k)
      v.set(this.v)
      this.k = k
      this.v = v
    }
    let i = this.n++
    this.k[i] = key
    this.v[i] = val
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.k[p] <= this.k[i]) break
      this.swap(p, i)
      i = p
    }
  }
  pop() {
    const val = this.v[0]
    this.n--
    if (this.n > 0) {
      this.k[0] = this.k[this.n]
      this.v[0] = this.v[this.n]
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < this.n && this.k[l] < this.k[m]) m = l
        if (r < this.n && this.k[r] < this.k[m]) m = r
        if (m === i) break
        this.swap(m, i)
        i = m
      }
    }
    return val
  }
  swap(a, b) {
    const k = this.k[a]
    this.k[a] = this.k[b]
    this.k[b] = k
    const v = this.v[a]
    this.v[a] = this.v[b]
    this.v[b] = v
  }
}

// 网格解析只做一次，结果挂在 grid 上复用
function prepare(grid, spots) {
  if (!grid._cells) {
    const n = grid.w * grid.h
    const cells = new Uint8Array(n)
    const base = new Float32Array(n)
    for (let y = 0; y < grid.h; y++) {
      const row = grid.rows[y]
      for (let x = 0; x < grid.w; x++) {
        const c = row.charCodeAt(x)
        const i = IDX(grid, x, y)
        cells[i] = c === 48 ? 0 : 1
        base[i] = c === 50 ? 1 : BRIDGE_COST
      }
    }
    grid._cells = cells
    grid._base = base
  }
  if (!grid._cost) {
    const cost = Float32Array.from(grid._base)
    for (const [x, y, w, h] of Object.values(spots || {})) {
      for (let gy = Math.floor(y * grid.h); gy < Math.ceil((y + h) * grid.h); gy++) {
        for (let gx = Math.floor(x * grid.w); gx < Math.ceil((x + w) * grid.w); gx++) {
          if (gx >= 0 && gy >= 0 && gx < grid.w && gy < grid.h) cost[IDX(grid, gx, gy)] *= SPOT_COST
        }
      }
    }
    grid._cost = cost
  }
  return grid
}

// 起点 / 终点可能正好落在不可走格（展位框里、装饰上），就近找一个可走格
function nearestWalkable(grid, x, y, maxR = 34) {
  const cells = grid._cells
  if (x >= 0 && y >= 0 && x < grid.w && y < grid.h && cells[IDX(grid, x, y)]) return IDX(grid, x, y)
  for (let r = 1; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= grid.w || ny >= grid.h) continue
        if (cells[IDX(grid, nx, ny)]) return IDX(grid, nx, ny)
      }
    }
  }
  return -1
}
const nodeOf = (grid, p) => nearestWalkable(grid, Math.round(p.x * grid.w), Math.round(p.y * grid.h))

// 八方向扩展：斜着走要求两个正交邻格也可走，免得从展位角上「擦」过去
function relax(grid, u, dist, visit) {
  const { w, h, _cells: cells, _cost: cost } = grid
  const ux = u % w
  const uy = (u / w) | 0
  for (let i = 0; i < 8; i++) {
    const dx = NB[i][0]
    const dy = NB[i][1]
    const nx = ux + dx
    const ny = uy + dy
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
    const v = ny * w + nx
    if (!cells[v]) continue
    if (dx && dy && (!cells[uy * w + nx] || !cells[ny * w + ux])) continue
    const nd = dist[u] + NB[i][2] * cost[v]
    if (nd < dist[v]) visit(v, nd)
  }
}

/**
 * 起点 → 终点的折线（归一化坐标）。无解返回 null。
 * `to` 可以是一个点，也可以是一组点（展位有多个到达门时）：多目标 A*，
 * 启发值取「到最近那个目标」，先弹出哪个就走哪个，不是按直线距离先猜一个（用户 9/15）。
 * @param {{w:number,h:number,rows:string[]}} grid mapSpots.walkGrid
 * @param {{x:number,y:number}} from
 * @param {{x:number,y:number}|{x:number,y:number}[]} to
 * @param {Record<string, number[]>} spots 展位框（加通行代价用）
 */
export function findRoute(grid, from, to, spots) {
  prepare(grid, spots)
  const goals = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (!goals.length) return null
  const s = nodeOf(grid, from)
  const ids = goals.map((p) => nodeOf(grid, p))
  const keep = ids.map((i, k) => [i, k]).filter(([i]) => i >= 0)
  if (s < 0 || !keep.length) return null
  const isGoal = new Set(keep.map(([i]) => i))
  const n = grid.w * grid.h
  const dist = new Float64Array(n).fill(Infinity)
  const prev = new Int32Array(n).fill(-1)
  const done = new Uint8Array(n)
  const gx = keep.map(([i]) => i % grid.w)
  const gy = keep.map(([i]) => (i / grid.w) | 0)
  const hx = (i) => {
    const ix = i % grid.w
    const iy = (i / grid.w) | 0
    let best = Infinity
    for (let k = 0; k < gx.length; k++) {
      const dx = Math.abs(ix - gx[k])
      const dy = Math.abs(iy - gy[k])
      const d = Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy)
      if (d < best) best = d
    }
    return best
  }
  const pq = new MinHeap(1 << 12)
  dist[s] = 0
  pq.push(hx(s), s)
  let t = -1
  while (pq.n) {
    const u = pq.pop()
    if (done[u]) continue
    done[u] = 1
    if (isGoal.has(u)) {
      t = u
      break
    }
    relax(grid, u, dist, (v, nd) => {
      dist[v] = nd
      prev[v] = u
      pq.push(nd + hx(v), v)
    })
  }
  if (t < 0) {
    if (!isGoal.has(s)) return null
    t = s
  }
  const goal = goals[keep.find(([i]) => i === t)[1]]
  return trace(grid, prev, s, t, goal)
}

/**
 * 一次单源 Dijkstra 拿到「起点 → 每个目标」的距离。做多点顺序（待打卡清单）时用它建距离矩阵：
 * n 个点跑 n 次即可，不要按 n² 次 findRoute。
 * @returns {number[]} 与 targets 等长，不可达为 Infinity
 */
export function findDistances(grid, from, targets, spots) {
  prepare(grid, spots)
  const s = nodeOf(grid, from)
  const ids = targets.map((p) => nodeOf(grid, p))
  if (s < 0) return targets.map(() => Infinity)
  const n = grid.w * grid.h
  const dist = new Float64Array(n).fill(Infinity)
  const done = new Uint8Array(n)
  const pq = new MinHeap(1 << 12)
  dist[s] = 0
  pq.push(0, s)
  let left = new Set(ids.filter((i) => i >= 0)).size
  while (pq.n && left > 0) {
    const u = pq.pop()
    if (done[u]) continue
    done[u] = 1
    if (ids.includes(u)) left--
    relax(grid, u, dist, (v, nd) => {
      dist[v] = nd
      pq.push(nd, v)
    })
  }
  return ids.map((i) => (i < 0 ? Infinity : dist[i]))
}

// 回溯 + 折线简化：只保留方向变化的拐点；终点截到「路线上离目标最近的那一格」
// （A* 的目标格是就近可走格，可能已经绕过了展位口，走到最近点就该停）
function trace(grid, prev, s, t, to) {
  let path = []
  for (let i = t; i !== -1; i = prev[i]) {
    path.push(i)
    if (i === s) break
  }
  path.reverse()
  let best = path.length - 1
  let bestD = Infinity
  for (let k = 0; k < path.length; k++) {
    const dx = (path[k] % grid.w) / grid.w - to.x
    const dy = Math.floor(path[k] / grid.w) / grid.h - to.y
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = k
    }
  }
  path = path.slice(0, best + 1)
  const pts = []
  let lastDir = null
  for (let k = 0; k < path.length; k++) {
    const x = path[k] % grid.w
    const y = Math.floor(path[k] / grid.w)
    if (k > 0 && k < path.length - 1) {
      const px = path[k - 1] % grid.w
      const py = Math.floor(path[k - 1] / grid.w)
      const dir = `${Math.sign(x - px)},${Math.sign(y - py)}`
      if (dir === lastDir) {
        pts[pts.length - 1] = { x, y }
        continue
      }
      lastDir = dir
    }
    pts.push({ x, y })
  }
  return pts.map((p) => ({ x: (p.x + 0.5) / grid.w, y: (p.y + 0.5) / grid.h }))
}
