<template>
  <div class="page dev">
    <PageHeader title="开发者模式" subtitle="手动校正平面图数据（只存本机）" back />

    <div class="dev-bar">
      <div class="chips">
        <button v-for="m in MODES" :key="m.key" class="chip" :class="{ on: mode === m.key }" @click="pick(m.key)">
          {{ m.name }}
        </button>
      </div>
      <div class="row wrap mt-6" style="gap:6px;align-items:center">
        <button class="pbtn sm ghost" @click="setZoom(-1)">－</button>
        <span class="small muted" style="min-width:52px;text-align:center">{{ Math.round(imgW) }}px</span>
        <button class="pbtn sm ghost" @click="setZoom(1)">＋</button>
        <button class="pbtn sm ghost" @click="fit()">适屏</button>
        <span v-if="dirty" class="tag text" style="font-size:10px">已改 {{ dirty }} 处</span>
      </div>
    </div>

    <!-- 地图：原生滚动平移，点/拖在图上编辑 -->
    <div ref="scroller" class="dev-map">
      <div class="dev-canvas" :style="{ width: imgW + 'px', height: imgH + 'px' }">
        <img ref="img" :src="mapSrc" :width="imgW" :height="imgH" draggable="false" @load="onImgLoad" />

        <!-- 展位热区 -->
        <div
          v-for="(rect, no) in spots"
          :key="no"
          class="dev-rect"
          :class="{ on: sel === no, dim: mode !== 'spot' && mode !== 'door' }"
          :style="boxStyle(rect)"
          @pointerdown.stop="onRectDown($event, no)"
        >
          <i class="dev-lab">{{ no }}</i>
          <template v-if="sel === no && mode === 'spot'">
            <b v-for="h in HANDLES" :key="h" class="dev-h" :class="h" @pointerdown.stop="onRectDown($event, no, h)"></b>
          </template>
          <!-- 到达门：每条配了门的边都标一段粗线 -->
          <u v-for="d in sidesOf(no)" :key="d" class="dev-door" :class="d"></u>
        </div>

        <!-- 出入口覆盖 -->
        <span
          v-for="(g, i) in gates"
          :key="'g' + i"
          class="dev-gate"
          :class="g.mode"
          :style="gateStyle(g)"
          @pointerdown.stop="removeGate(i)"
        ></span>

        <!-- 起点 -->
        <span class="dev-start" :style="dotStyle(start)"></span>

        <!-- 测试路线 -->
        <svg v-if="testPts.length" class="dev-route" :viewBox="`0 0 ${imgW} ${imgH}`">
          <polyline :points="testPts.map((p) => `${p.x * imgW},${p.y * imgH}`).join(' ')" />
        </svg>

        <!-- 点击层：新建热区 / 放出入口 / 移起点 -->
        <div v-if="mode !== 'spot' || drawing" class="dev-catch" @pointerdown="onCanvasDown"></div>
      </div>
    </div>

    <!-- 编辑面板 -->
    <div class="pcard mt-10">
      <div class="pcard-body">
        <template v-if="mode === 'spot' || mode === 'door'">
          <div class="row wrap" style="gap:6px;align-items:center">
            <select v-model="sel" class="dev-sel">
              <option :value="null">— 选展位 —</option>
              <option v-for="no in noList" :key="no" :value="no">{{ no }} {{ ipOf(no) }}</option>
            </select>
            <button class="pbtn sm ghost" :class="{ on: drawing }" @click="drawing = !drawing">
              {{ drawing ? '取消新建' : '新建热区' }}
            </button>
            <button class="pbtn sm ghost" :disabled="!sel" @click="removeSpot()">删除</button>
          </div>

          <template v-if="sel">
            <div class="small muted mt-6">{{ ipOf(sel) || '（booths.js 里没有这个展位号，热区会点不出东西）' }}</div>
            <div class="dev-nums mt-6">
              <label v-for="(k, i) in ['x', 'y', 'w', 'h']" :key="k">
                {{ k }}
                <input type="number" step="0.0005" :value="spots[sel][i]" @input="setNum(i, $event.target.value)" />
              </label>
            </div>
            <div class="small muted mt-6">选中后可拖动整块、拖四角改大小，方向键微调（Shift 加速）。</div>

            <div class="row wrap mt-10" style="gap:6px;align-items:center">
              <span class="small" style="font-weight:700">到达门</span>
              <button
                v-for="d in DOORS"
                :key="d.key"
                class="chip"
                :class="{ on: sidesOf(sel).includes(d.key) }"
                @click="toggleDoor(d.key)"
              >{{ d.key }} {{ d.name }}<small :class="{ far: gapOf(d.key) > 3 }">{{ gapOf(d.key) }}</small></button>
            </div>
            <div class="small muted mt-6">
              可以选多条边（最少 1、最多 4），导航自动停在最近的那个门。
              芯片上的数字是这条边离最近一格「图上真有线」几格：<b>0</b> 说明这边正对过道、适合开门，
              <b class="far">&gt;3</b> 说明这边没有路，别选。
            </div>
          </template>
        </template>

        <template v-else-if="mode === 'gate'">
          <div class="row wrap" style="gap:6px;align-items:center">
            <button class="chip" :class="{ on: gateMode === 'open' }" @click="gateMode = 'open'">开口</button>
            <button class="chip" :class="{ on: gateMode === 'block' }" @click="gateMode = 'block'">封死</button>
            <span class="small">半径 {{ gateR }} 格</span>
            <input type="range" min="1" max="10" v-model.number="gateR" />
          </div>
          <div class="small muted mt-6">
            点图上任意位置放一个方块：开口 = 把这片强制变成可走的真线（补出入口 / 补断掉的过道），
            封死 = 禁止通行（堵住图上画了线但实际走不通的地方）。点已有的方块可删除。当前 {{ gates.length }} 个。
          </div>
        </template>

        <template v-else>
          <div class="small">点图上任意位置把导航起点挪过去。</div>
          <div class="small muted mt-6">现在：x {{ start.x.toFixed(4) }} · y {{ start.y.toFixed(4) }}</div>
        </template>

        <!-- 试走一条：改完立刻验证 -->
        <div class="row wrap mt-10" style="gap:6px;align-items:center">
          <button class="pbtn sm" :disabled="!sel" @click="runTest()">从起点试走到 {{ sel || '…' }}</button>
          <span v-if="testLen" class="small muted">约 {{ testLen }}</span>
          <button v-if="testPts.length" class="pbtn sm ghost" @click="testPts = []">清掉路线</button>
        </div>
      </div>
    </div>

    <!-- 导出 -->
    <div class="pcard mt-10">
      <div class="pcard-body">
        <div class="fold-head" @click="openOut = !openOut">
          <div class="pcard-title">导出代码</div>
          <span class="fold-arrow" :class="{ open: openOut }">&gt;</span>
        </div>
        <template v-if="openOut">
          <div class="small muted mt-6">贴回 src/data/mapSpots.js 后，回来点「清空本机覆盖」。</div>
          <textarea class="dev-out mt-6" readonly :value="exported"></textarea>
          <div class="row wrap mt-6" style="gap:6px">
            <button class="pbtn sm" @click="copyOut()">{{ copied ? '已复制' : '复制' }}</button>
            <button class="pbtn sm ghost" @click="wipe()">清空本机覆盖</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'DevMapPage' }
</script>

<script setup>
// 开发者模式（用户 9/15）：脚本识别出来的热区 / 到达门 / 出入口难免有偏差，这里可以直接在图上改，
// 存本机 localStorage（rl26.dev）并立刻对导航生效（mapSpots.js 底部的 applyDev 原地合并），
// 核对好了再导出代码贴回 src/data/mapSpots.js。不挂在底栏里，走 #/dev 进。
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { booths } from '../data/booths.js'
import { venueMap } from '../data/rules.js'
import { mapSpots, mapDoors, mapStart, mapGates, walkGrid, doorPoints, DOOR_SIDES, loadDev, saveDev, clearDev } from '../data/mapSpots.js'
import { findRoute } from '../utils/route.js'
import { fmtDist } from '../utils/plan.js'

const MODES = [
  { key: 'spot', name: '热区' },
  { key: 'door', name: '到达门' },
  { key: 'gate', name: '出入口' },
  { key: 'start', name: '起点' },
]
const DOORS = [
  { key: 'A', name: '左' },
  { key: 'B', name: '上' },
  { key: 'C', name: '右' },
  { key: 'D', name: '下' },
]
const HANDLES = ['nw', 'ne', 'sw', 'se']

const base = import.meta.env.BASE_URL
const p2 = venueMap.slices.find((s) => s.spots)
const mapSrc = base + (p2.full || p2.src)

const ov = ref(loadDev())
const mode = ref('spot')
const sel = ref(null)
const drawing = ref(false)
const gateMode = ref('open')
const gateR = ref(3)
const openOut = ref(false)
const copied = ref(false)
const testPts = ref([])
const testLen = ref('')

// 直接读共享对象（applyDev 已经把覆盖合并进去了），改的时候同时写 ov 与共享对象
// 这三个都是 ref 包住共享对象：一定要「通过 .value 改」，直接改原对象 Vue 收不到通知
const spots = ref(mapSpots)
const doors = ref(mapDoors)
const start = ref(mapStart)
const gates = computed(() => ov.value.gates || [])
const noList = computed(() => Object.keys(spots.value).sort())
const ipOf = (no) => booths.filter((b) => String(b.no).split('/').some((s) => s.trim() === no)).map((b) => b.ip).join(' / ')
const sidesOf = (no) => [...String(doors.value[no] || '')].filter((c) => 'ABCD'.includes(c))
const dirty = computed(
  () => Object.keys(ov.value.spots).length + Object.keys(ov.value.doors).length + ov.value.gates.length + (ov.value.start ? 1 : 0) + ov.value.removed.length,
)

// ---- 图的显示尺寸 ----
const NAT = { w: 6000, h: 4344 }
const imgW = ref(1200)
const imgH = computed(() => Math.round((imgW.value * NAT.h) / NAT.w))
const scroller = ref(null)
const img = ref(null)
const onImgLoad = () => {}
const setZoom = (d) => {
  imgW.value = Math.max(300, Math.min(6000, Math.round(imgW.value * (d > 0 ? 1.5 : 1 / 1.5))))
}
const fit = () => {
  imgW.value = Math.max(300, Math.round(scroller.value?.clientWidth || 360))
}
// 把某个归一化坐标滚到可视区中间（试走 / 选展位后用）
function scrollTo(p) {
  const el = scroller.value
  if (!el) return
  el.scrollLeft = p.x * imgW.value - el.clientWidth / 2
  el.scrollTop = p.y * imgH.value - el.clientHeight / 2
}
onMounted(() => {
  fit()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// ---- 坐标换算 ----
function norm(e) {
  const r = img.value.getBoundingClientRect()
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
}
const pct = (v) => `${(v * 100).toFixed(4)}%`
const boxStyle = (r) => ({ left: pct(r[0]), top: pct(r[1]), width: pct(r[2]), height: pct(r[3]) })
const dotStyle = (p) => ({ left: pct(p.x), top: pct(p.y) })
const gateStyle = (g) => {
  const w = ((2 * (g.r ?? 3) + 1) / walkGrid.w) * imgW.value
  const h = ((2 * (g.r ?? 3) + 1) / walkGrid.h) * imgH.value
  return { left: pct(g.x), top: pct(g.y), width: `${w}px`, height: `${h}px` }
}

// ---- 落盘 ----
function commit() {
  saveDev(JSON.parse(JSON.stringify(ov.value)))
}
function putSpot(no, rect) {
  const r = rect.map((v) => Math.round(v * 1e4) / 1e4)
  ov.value.spots[no] = r
  if (spots.value[no]) spots.value[no].splice(0, 4, ...r)
  else spots.value[no] = [...r]
  commit()
}

// ---- 热区拖动 ----
let drag = null
function onRectDown(e, no, handle) {
  sel.value = no
  if (mode.value !== 'spot') return
  e.preventDefault()
  drag = { no, handle, start: norm(e), rect: [...spots.value[no]] }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
function onMove(e) {
  if (!drag) return
  const p = norm(e)
  const dx = p.x - drag.start.x
  const dy = p.y - drag.start.y
  let [x, y, w, h] = drag.rect
  if (!drag.handle) {
    x += dx
    y += dy
  } else {
    if (drag.handle.includes('w')) {
      x += dx
      w -= dx
    } else w += dx
    if (drag.handle.includes('n')) {
      y += dy
      h -= dy
    } else h += dy
  }
  putSpot(drag.no, [x, y, Math.max(0.004, w), Math.max(0.004, h)])
}
function onUp() {
  drag = null
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

// ---- 画布点击：新建热区 / 放出入口 / 移起点 ----
function onCanvasDown(e) {
  const p = norm(e)
  if (mode.value === 'gate') {
    ov.value.gates.push({ x: round4(p.x), y: round4(p.y), r: gateR.value, mode: gateMode.value })
    commit()
    return
  }
  if (mode.value === 'start') {
    ov.value.start = { x: round4(p.x), y: round4(p.y) }
    Object.assign(start.value, ov.value.start)
    commit()
    return
  }
  if (drawing.value) {
    const no = window.prompt('新热区的展位号（如 A41）')
    if (!no) return
    putSpot(no.trim().toUpperCase(), [p.x, p.y, 0.03, 0.02])
    sel.value = no.trim().toUpperCase()
    drawing.value = false
  }
}
const round4 = (v) => Math.round(v * 1e4) / 1e4
function removeGate(i) {
  if (mode.value !== 'gate') return
  ov.value.gates.splice(i, 1)
  commit()
}
function removeSpot() {
  if (!sel.value) return
  const no = sel.value
  delete spots.value[no]
  delete ov.value.spots[no]
  if (!ov.value.removed.includes(no)) ov.value.removed.push(no)
  sel.value = null
  commit()
}
function setNum(i, v) {
  const r = [...spots.value[sel.value]]
  r[i] = Number(v)
  putSpot(sel.value, r)
}
// 到达门可以配多条边：最少留 1 条（点掉最后一条无效），最多 4 条；顺序固定 A→B→C→D
function toggleDoor(d) {
  const cur = sidesOf(sel.value)
  const next = cur.includes(d) ? cur.filter((c) => c !== d) : [...cur, d]
  if (!next.length) return
  const v = [...DOOR_SIDES].filter((c) => next.includes(c)).join('')
  ov.value.doors[sel.value] = v
  doors.value[sel.value] = v
  commit()
}
function pick(m) {
  mode.value = m
  drawing.value = false
}

// 方向键微调选中热区（一格 = 图上 1px）
function onKey(e) {
  if (!sel.value || mode.value !== 'spot') return
  const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const d = map[e.key]
  if (!d) return
  e.preventDefault()
  const k = (e.shiftKey ? 10 : 1) / NAT.w
  const ky = (e.shiftKey ? 10 : 1) / NAT.h
  const r = [...spots.value[sel.value]]
  if (e.altKey) {
    r[2] += d[0] * k
    r[3] += d[1] * ky
  } else {
    r[0] += d[0] * k
    r[1] += d[1] * ky
  }
  putSpot(sel.value, r)
}

// 门离最近一格真线有多远（>3 格基本就是开在死面上了），每条边各算一个
function gapAt(p) {
  const cx = Math.round(p.x * walkGrid.w)
  const cy = Math.round(p.y * walkGrid.h)
  for (let r = 0; r <= 25; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= walkGrid.w || y >= walkGrid.h) continue
        if (walkGrid.rows[y][x] === '2') return r
      }
    }
  }
  return 99
}
// 四条边各自离最近一格真线几格：0 = 正对过道，>3 = 这边没有路
const PAD = 0.006
const sideGaps = computed(() => {
  const r = sel.value && spots.value[sel.value]
  if (!r) return {}
  const [x, y, w, h] = r
  return {
    A: gapAt({ x: x - PAD, y: y + h / 2 }),
    B: gapAt({ x: x + w / 2, y: y - PAD }),
    C: gapAt({ x: x + w + PAD, y: y + h / 2 }),
    D: gapAt({ x: x + w / 2, y: y + h + PAD }),
  }
})
const gapOf = (d) => sideGaps.value[d] ?? 99

function runTest() {
  const pts = findRoute(walkGrid, mapStart, doorPoints(sel.value), mapSpots) || []
  testPts.value = pts
  const r = spots.value[sel.value]
  scrollTo({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 })
  const PX_W = 2400
  const PX_H = 1738
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.hypot((pts[i].x - pts[i - 1].x) * PX_W, (pts[i].y - pts[i - 1].y) * PX_H)
  testLen.value = pts.length ? fmtDist(d) : '走不通'
}

// ---- 导出 ----
const exported = computed(() => {
  const o = ov.value
  const out = []
  const sp = Object.keys(o.spots).sort()
  if (sp.length) {
    out.push('// mapSpots 改动')
    for (const no of sp) out.push(`  ${no}: [${spots.value[no].join(', ')}],`)
  }
  if (o.removed.length) out.push(`// 删掉的热区：${o.removed.join(' / ')}`)
  const dr = Object.keys(o.doors).sort()
  if (dr.length) {
    out.push('// mapDoors 改动')
    for (const no of dr) out.push(`  ${no}: '${doors.value[no]}',`)
  }
  if (o.start) out.push(`// mapStart\nexport const mapStart = { x: ${start.value.x}, y: ${start.value.y}, name: '${start.value.name}' }`)
  if (o.gates.length) {
    out.push('// mapSpots.js 的 mapGates 换成这个（已含原有的）')
    out.push('export const mapGates = [')
    for (const g of [...mapGates, ...o.gates]) out.push(`  { x: ${g.x}, y: ${g.y}, r: ${g.r}, mode: '${g.mode}' },`)
    out.push(']')
  }
  return out.length ? out.join('\n') : '（本机还没有改动）'
})
function copyOut() {
  navigator.clipboard?.writeText(exported.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1200)
}
function wipe() {
  if (!window.confirm('清掉本机所有覆盖并刷新页面？')) return
  clearDev()
  location.reload()
}
</script>
