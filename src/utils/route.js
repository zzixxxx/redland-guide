// 平面图上的简易寻路：在 mapSpots.js 的可走网格上跑 A*，把「起点 → 展位」连成一条折线。
// 网格按官方图配色判出海水 / 草地 / 外框为不可走；展位框不挖（挖了会切断窄过道导致无解），
// 而是给展位内的格子加通行代价 —— 路线优先走展位之间的过道，绕不开时才从展位上过。
// 坐标一律用 P2 切片的归一化 0–1。

const IDX = (g, x, y) => y * g.w + x

function buildCells(grid) {
  if (grid._cells) return grid._cells
  const cells = new Uint8Array(grid.w * grid.h)
  for (let y = 0; y < grid.h; y++) {
    const row = grid.rows[y]
    for (let x = 0; x < grid.w; x++) cells[IDX(grid, x, y)] = row.charCodeAt(x) === 49 ? 1 : 0
  }
  grid._cells = cells
  return cells
}

// 起点 / 终点可能正好落在不可走格（展位框里、装饰上），就近找一个可走格
function nearestWalkable(grid, cells, x, y, maxR = 34) {
  if (cells[IDX(grid, x, y)]) return [x, y]
  for (let r = 1; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= grid.w || ny >= grid.h) continue
        if (cells[IDX(grid, nx, ny)]) return [nx, ny]
      }
    }
  }
  return null
}

// 展位格的额外代价：走过道 1，穿展位 6，够让 A* 宁愿绕一圈
const SPOT_COST = 6
function buildCost(grid, spots) {
  if (grid._cost) return grid._cost
  const cost = new Float32Array(grid.w * grid.h).fill(1)
  for (const rect of Object.values(spots || {})) {
    const [x, y, w, h] = rect
    for (let gy = Math.floor(y * grid.h); gy < Math.ceil((y + h) * grid.h); gy++) {
      for (let gx = Math.floor(x * grid.w); gx < Math.ceil((x + w) * grid.w); gx++) {
        if (gx >= 0 && gy >= 0 && gx < grid.w && gy < grid.h) cost[IDX(grid, gx, gy)] = SPOT_COST
      }
    }
  }
  grid._cost = cost
  return cost
}

/**
 * @param {{w:number,h:number,rows:string[]}} grid 可走网格
 * @param {{x:number,y:number}} from 起点（归一化）
 * @param {{x:number,y:number}} to   终点（归一化）
 * @param {Record<string, number[]>} spots 展位框（加通行代价用）
 * @returns {{x:number,y:number}[]|null} 归一化折线，无解返回 null
 */
export function findRoute(grid, from, to, spots) {
  const cells = buildCells(grid)
  const cost = buildCost(grid, spots)
  const s = nearestWalkable(grid, cells, Math.round(from.x * grid.w), Math.round(from.y * grid.h))
  const t = nearestWalkable(grid, cells, Math.round(to.x * grid.w), Math.round(to.y * grid.h))
  if (!s || !t) return null
  const n = grid.w * grid.h
  const start = IDX(grid, s[0], s[1])
  const goal = IDX(grid, t[0], t[1])
  const gScore = new Float32Array(n).fill(Infinity)
  const prev = new Int32Array(n).fill(-1)
  const open = [start]
  const fScore = new Float32Array(n).fill(Infinity)
  const hx = (i) => {
    const dx = Math.abs((i % grid.w) - t[0])
    const dy = Math.abs(Math.floor(i / grid.w) - t[1])
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy)
  }
  gScore[start] = 0
  fScore[start] = hx(start)
  const inOpen = new Uint8Array(n)
  inOpen[start] = 1
  while (open.length) {
    // 网格只有 2 万多格，线性取最小比堆简单且够快
    let bi = 0
    for (let i = 1; i < open.length; i++) if (fScore[open[i]] < fScore[open[bi]]) bi = i
    const cur = open.splice(bi, 1)[0]
    inOpen[cur] = 0
    if (cur === goal) break
    const cx = cur % grid.w
    const cy = Math.floor(cur / grid.w)
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const nx = cx + dx
        const ny = cy + dy
        if (nx < 0 || ny < 0 || nx >= grid.w || ny >= grid.h) continue
        const ni = IDX(grid, nx, ny)
        if (!cells[ni]) continue
        // 斜着走要求两个正交邻格也可走，免得从展位角上「擦」过去
        if (dx && dy && (!cells[IDX(grid, cx + dx, cy)] || !cells[IDX(grid, cx, cy + dy)])) continue
        const step = (dx && dy ? 1.414 : 1) * cost[ni]
        const ng = gScore[cur] + step
        if (ng < gScore[ni]) {
          gScore[ni] = ng
          prev[ni] = cur
          fScore[ni] = ng + hx(ni)
          if (!inOpen[ni]) {
            inOpen[ni] = 1
            open.push(ni)
          }
        }
      }
    }
  }
  if (prev[goal] === -1 && goal !== start) return null
  let path = []
  for (let i = goal; i !== -1; i = prev[i]) path.push(i)
  path.reverse()
  // 终点截到「路线上离展位最近的一格」：A* 的目标格是就近可走格，可能已经绕过了展位口，
  // 走到最近点就该停（用户 9/14）
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
  // 折线简化：只保留方向变化的拐点
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
