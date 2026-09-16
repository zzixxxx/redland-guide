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
      <!-- 图层开关：热区 / 到达门 / 出入口 / 起点 / 路网全部画在图上，当前模式那一层才能拖 -->
      <div class="row wrap mt-6" style="gap:4px;align-items:center">
        <span class="small muted">显示</span>
        <button v-for="l in LAYERS" :key="l.key" class="dev-layer" :class="{ on: show[l.key] }" @click="show[l.key] = !show[l.key]">
          <i class="dev-sw" :class="l.key"></i>{{ l.name }}
        </button>
      </div>
    </div>

    <!-- 地图：原生滚动平移，点/拖在图上编辑 -->
    <div ref="scroller" class="dev-map">
      <div class="dev-canvas" :style="{ width: imgW + 'px', height: imgH + 'px' }">
        <img ref="img" :src="mapSrc" :width="imgW" :height="imgH" draggable="false" />

        <!-- 点击层（压在图上、其他图层之下）：新建热区 / 放出入口 / 移起点。
             不属于当前模式的图层带 .off（pointer-events:none），点下去会穿透到这里 -->
        <div v-if="mode !== 'spot' || drawing" class="dev-catch" @pointerdown="onCanvasDown"></div>

        <!-- 路网：青 = 图上真有线（'2'），紫 = 闭运算补出来的桥接格（'1'）。出入口改动后重画 -->
        <canvas v-show="show.grid" ref="gridCv" class="dev-grid" :width="walkGrid.w" :height="walkGrid.h"></canvas>

        <!-- 展位热区 -->
        <template v-if="show.spot">
          <div
            v-for="(rect, no) in spots"
            :key="no"
            class="dev-rect"
            :class="{ on: sel === no, dim: mode !== 'spot' && mode !== 'door', off: mode === 'gate' || mode === 'start' || drawing }"
            :style="boxStyle(rect)"
            @pointerdown.stop="onRectDown($event, no)"
          >
            <i class="dev-lab">{{ no }}</i>
            <template v-if="sel === no && mode === 'spot'">
              <b v-for="h in HANDLES" :key="h" class="dev-h" :class="h" @pointerdown.stop="onRectDown($event, no, h)"></b>
            </template>
            <!-- 到达门：每条配了门的边都标一段粗线 -->
            <template v-if="show.door">
              <u v-for="d in sidesOf(no)" :key="d" class="dev-door" :class="d"></u>
            </template>
          </div>
        </template>

        <!-- 出入口：代码里固化的（虚线框，改要改 mapSpots.js）+ 本机的（可选中、可拖） -->
        <template v-if="show.gate">
          <span v-for="(g, i) in mapGates" :key="'f' + i" class="dev-gate fixed" :class="g.mode" :style="gateStyle(g)">
            <i class="dev-lab cjk">固化 · {{ g.mode === 'block' ? '封死' : '开口' }}</i>
          </span>
          <span
            v-for="(g, i) in gates"
            :key="'g' + i"
            class="dev-gate"
            :class="[g.mode, { on: selGate === i, off: mode !== 'gate' }]"
            :style="gateStyle(g)"
            @pointerdown.stop="onGateDown($event, i)"
          >
            <i class="dev-lab cjk">{{ i + 1 }} {{ g.mode === 'block' ? '封死' : '开口' }} r{{ g.r }}</i>
          </span>
        </template>

        <!-- 起点：十字标，起点模式下可以直接拖 -->
        <span v-show="show.start" class="dev-start" :class="{ off: mode !== 'start' }" :style="dotStyle(start)" @pointerdown.stop="onStartDown">
          <i class="dev-lab cjk">起点</i>
        </span>

        <!-- 试走路线：全部展位的淡线 + 当前这条的粗线，末端圆点 = 实际停下的那一格 -->
        <svg v-if="testPts.length || allPts.length" class="dev-route" :viewBox="`0 0 ${imgW} ${imgH}`">
          <polyline v-for="(pts, i) in allPts" :key="i" class="all" :points="poly(pts)" />
          <template v-if="testPts.length">
            <polyline :points="poly(testPts)" />
            <circle :cx="testPts[testPts.length - 1].x * imgW" :cy="testPts[testPts.length - 1].y * imgH" r="6" />
          </template>
        </svg>
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
          <template v-if="curGate">
            <div class="row wrap" style="gap:6px;align-items:center">
              <span class="small" style="font-weight:700">出入口 {{ selGate + 1 }}</span>
              <button class="chip" :class="{ on: curGate.mode === 'open' }" @click="setGate({ mode: 'open' })">开口</button>
              <button class="chip" :class="{ on: curGate.mode === 'block' }" @click="setGate({ mode: 'block' })">封死</button>
              <button class="pbtn sm ghost" @click="removeGate(selGate)">删除</button>
              <button class="pbtn sm ghost" @click="selGate = null">放新的</button>
            </div>
            <div class="dev-nums mt-6">
              <label>x <input type="number" step="0.0005" :value="curGate.x" @input="setGate({ x: Number($event.target.value) })" /></label>
              <label>y <input type="number" step="0.0005" :value="curGate.y" @input="setGate({ y: Number($event.target.value) })" /></label>
              <label style="grid-column:1 / -1">
                半径 {{ curGate.r }} 格
                <input type="range" min="0" max="10" :value="curGate.r" @input="setGate({ r: Number($event.target.value) })" />
              </label>
            </div>
            <div class="small muted mt-6">
              拖动方块挪位置，方向键微调一格（Shift ×10），Delete 删除。这块盖住路网第 {{ cellOf(curGate).x }},{{ cellOf(curGate).y }} 格周围
              {{ 2 * curGate.r + 1 }}×{{ 2 * curGate.r + 1 }} 格：开口 = 强制变成可走的真线，封死 = 禁止通行。
              开着「路网」图层就能看到盖上去的效果。
            </div>
          </template>
          <template v-else>
            <div class="row wrap" style="gap:6px;align-items:center">
              <span class="small" style="font-weight:700">新放一个</span>
              <button class="chip" :class="{ on: gateMode === 'open' }" @click="gateMode = 'open'">开口</button>
              <button class="chip" :class="{ on: gateMode === 'block' }" @click="gateMode = 'block'">封死</button>
              <span class="small">半径 {{ gateR }} 格</span>
              <input type="range" min="0" max="10" v-model.number="gateR" />
            </div>
            <div class="small muted mt-6">
              点图上空白处放一个方块，点已有的方块选中它（选中后可拖、可改半径 / 类型、可删）。
              开口 = 把这片强制变成可走的真线（补出入口 / 补断掉的过道），封死 = 禁止通行（堵住图上画了线但实际走不通的地方）。
              本机 {{ gates.length }} 个<template v-if="mapGates.length">，代码里固化 {{ mapGates.length }} 个（虚线框，在这里改不了）</template>。
            </div>
          </template>
        </template>

        <template v-else>
          <div class="small">拖动图上的起点十字标，或点图上任意位置把导航起点挪过去；方向键微调一格（Shift ×10）。</div>
          <div class="small muted mt-6">现在：x {{ start.x.toFixed(4) }} · y {{ start.y.toFixed(4) }}<template v-if="ov.start">（本机已改）</template></div>
        </template>

        <!-- 试走：改完立刻验证；改了出入口 / 起点 / 到达门后画着的路线会自动重算 -->
        <div class="row wrap mt-10" style="gap:6px;align-items:center">
          <select v-if="mode === 'gate' || mode === 'start'" v-model="sel" class="dev-sel">
            <option :value="null">— 选展位 —</option>
            <option v-for="no in noList" :key="no" :value="no">{{ no }} {{ ipOf(no) }}</option>
          </select>
          <button class="pbtn sm" :disabled="!sel" @click="runTest()">从起点试走到 {{ sel || '…' }}</button>
          <span v-if="testLen" class="small muted">约 {{ testLen }}</span>
        </div>
        <div class="row wrap mt-6" style="gap:6px;align-items:center">
          <button class="pbtn sm ghost" @click="runAll()">试走全部 {{ noList.length }} 个展位</button>
          <span v-if="allInfo" class="small muted">{{ allInfo }}</span>
          <button v-if="testPts.length || allPts.length" class="pbtn sm ghost" @click="clearRoutes()">清掉路线</button>
        </div>
        <div class="small muted mt-6">
          画着的路线在改动出入口 / 起点 / 到达门 / 热区后会自动重算，盯着看有没有穿广场、越围栏、专程折返。
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
// 用户 9/16：不止热区，起点 / 出入口 / 到达门 / 路网都要常显在图上、能直接拖，方便复核规划出来的路线。
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
// 图层（与图上的颜色一致）：热区红框 / 到达门黄边 / 出入口绿（开）红（封）块 / 起点红十字 / 路网青（真线）紫（桥）
const LAYERS = [
  { key: 'spot', name: '热区' },
  { key: 'door', name: '到达门' },
  { key: 'gate', name: '出入口' },
  { key: 'start', name: '起点' },
  { key: 'grid', name: '路网' },
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
const show = ref({ spot: true, door: true, gate: true, start: true, grid: true })
const sel = ref(null)
const selGate = ref(null)
const drawing = ref(false)
const gateMode = ref('open')
const gateR = ref(3)
const openOut = ref(false)
const copied = ref(false)
const testPts = ref([])
const testLen = ref('')
const allPts = ref([])
const allInfo = ref('')

// 直接读共享对象（applyDev 已经把覆盖合并进去了），改的时候同时写 ov 与共享对象
// 这三个都是 ref 包住共享对象：一定要「通过 .value 改」，直接改原对象 Vue 收不到通知
const spots = ref(mapSpots)
const doors = ref(mapDoors)
const start = ref(mapStart)
const gates = computed(() => ov.value.gates || [])
const curGate = computed(() => (selGate.value != null ? gates.value[selGate.value] || null : null))
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
const gridCv = ref(null)
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
  drawGrid()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// ---- 路网叠加：把 walkGrid 按格画到一张 360×260 的 canvas 上，CSS 拉伸到图的尺寸（pixelated） ----
// 青 = '2' 图上真有线，紫 = '1' 闭运算补出来的桥接格（走它要付 BRIDGE_COST 倍代价），'0' 透明
function drawGrid() {
  const cv = gridCv.value
  if (!cv) return
  const { w, h, rows } = walkGrid
  const ctx = cv.getContext('2d')
  const im = ctx.createImageData(w, h)
  const d = im.data
  for (let y = 0; y < h; y++) {
    const row = rows[y]
    for (let x = 0; x < w; x++) {
      const c = row.charCodeAt(x)
      if (c === 48) continue
      const i = (y * w + x) * 4
      if (c === 50) {
        d[i] = 0
        d[i + 1] = 229
        d[i + 2] = 255
        d[i + 3] = 120
      } else {
        d[i] = 255
        d[i + 1] = 0
        d[i + 2] = 200
        d[i + 3] = 150
      }
    }
  }
  ctx.putImageData(im, 0, 0)
}

// ---- 坐标换算 ----
function norm(e) {
  const r = img.value.getBoundingClientRect()
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
}
const round4 = (v) => Math.round(v * 1e4) / 1e4
const pct = (v) => `${(v * 100).toFixed(4)}%`
const boxStyle = (r) => ({ left: pct(r[0]), top: pct(r[1]), width: pct(r[2]), height: pct(r[3]) })
const dotStyle = (p) => ({ left: pct(p.x), top: pct(p.y) })
// 出入口方块画成它实际盖住的格数（2r+1 格），和 stampGates 的取整方式一致：按格中心对齐
const cellOf = (g) => ({ x: Math.round(g.x * walkGrid.w), y: Math.round(g.y * walkGrid.h) })
const gateStyle = (g) => {
  const c = cellOf(g)
  const r = Math.max(0, Math.round(g.r ?? 3))
  return {
    left: pct((c.x + 0.5) / walkGrid.w),
    top: pct((c.y + 0.5) / walkGrid.h),
    width: `${((2 * r + 1) / walkGrid.w) * imgW.value}px`,
    height: `${((2 * r + 1) / walkGrid.h) * imgH.value}px`,
  }
}
const poly = (pts) => pts.map((p) => `${p.x * imgW.value},${p.y * imgH.value}`).join(' ')

// ---- 落盘 ----
// 拖动过程中每一步都落盘（刷新也不丢），但路线重算只在松手后做一次（81 条全量约 120ms，跟着指针跑会卡）
let dragging = false
function commit() {
  saveDev(JSON.parse(JSON.stringify(ov.value)))
  if (dragging) return
  drawGrid()
  rerun()
}
function rerun() {
  if (testPts.value.length && sel.value) runTest(false)
  if (allPts.value.length) runAll()
}
function putSpot(no, rect) {
  const r = rect.map((v) => Math.round(v * 1e4) / 1e4)
  ov.value.spots[no] = r
  if (spots.value[no]) spots.value[no].splice(0, 4, ...r)
  else spots.value[no] = [...r]
  commit()
}

// 通用拖动：onDelta 收归一化位移，松手后 onEnd(moved)
function startDrag(e, onDelta, onEnd) {
  e.preventDefault()
  const s = norm(e)
  let moved = false
  dragging = true
  const mv = (ev) => {
    const p = norm(ev)
    moved = true
    onDelta(p.x - s.x, p.y - s.y)
  }
  const up = () => {
    window.removeEventListener('pointermove', mv)
    window.removeEventListener('pointerup', up)
    dragging = false
    onEnd?.(moved)
  }
  window.addEventListener('pointermove', mv)
  window.addEventListener('pointerup', up)
}

// ---- 热区拖动 ----
function onRectDown(e, no, handle) {
  sel.value = no
  if (mode.value !== 'spot') return
  const rect = [...spots.value[no]]
  startDrag(
    e,
    (dx, dy) => {
      let [x, y, w, h] = rect
      if (!handle) {
        x += dx
        y += dy
      } else {
        if (handle.includes('w')) {
          x += dx
          w -= dx
        } else w += dx
        if (handle.includes('n')) {
          y += dy
          h -= dy
        } else h += dy
      }
      putSpot(no, [x, y, Math.max(0.004, w), Math.max(0.004, h)])
    },
    (moved) => moved && commit(),
  )
}

// ---- 出入口拖动 / 编辑 ----
function onGateDown(e, i) {
  if (mode.value !== 'gate') return
  selGate.value = i
  const g = ov.value.gates[i]
  const { x, y } = g
  startDrag(
    e,
    (dx, dy) => {
      g.x = round4(x + dx)
      g.y = round4(y + dy)
    },
    (moved) => moved && commit(),
  )
}
function setGate(patch) {
  const g = curGate.value
  if (!g) return
  // 输入框清空时是 NaN，别写进去
  for (const k of Object.keys(patch)) if (typeof patch[k] === 'number' && !Number.isFinite(patch[k])) return
  Object.assign(g, patch)
  commit()
}
function removeGate(i) {
  if (i == null || !ov.value.gates[i]) return
  ov.value.gates.splice(i, 1)
  selGate.value = null
  commit()
}

// ---- 起点拖动 ----
function moveStart(p) {
  ov.value.start = { x: round4(p.x), y: round4(p.y) }
  Object.assign(start.value, ov.value.start)
}
function onStartDown(e) {
  if (mode.value !== 'start') return
  const { x, y } = start.value
  startDrag(
    e,
    (dx, dy) => moveStart({ x: x + dx, y: y + dy }),
    (moved) => moved && commit(),
  )
}

// ---- 画布点击：新建热区 / 放出入口 / 移起点 ----
function onCanvasDown(e) {
  const p = norm(e)
  if (mode.value === 'gate') {
    ov.value.gates.push({ x: round4(p.x), y: round4(p.y), r: gateR.value, mode: gateMode.value })
    selGate.value = ov.value.gates.length - 1
    commit()
    return
  }
  if (mode.value === 'start') {
    moveStart(p)
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

// 键盘：热区模式微调选中热区（一格 = 图上 1px，Alt 改宽高）；出入口 / 起点模式按路网一格挪、Delete 删出入口
function onKey(e) {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target?.tagName)) return
  const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const d = map[e.key]
  const mul = e.shiftKey ? 10 : 1
  if (mode.value === 'gate') {
    const g = curGate.value
    if (!g) return
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      removeGate(selGate.value)
      return
    }
    if (!d) return
    e.preventDefault()
    setGate({ x: round4(g.x + (d[0] * mul) / walkGrid.w), y: round4(g.y + (d[1] * mul) / walkGrid.h) })
    return
  }
  if (mode.value === 'start') {
    if (!d) return
    e.preventDefault()
    moveStart({ x: start.value.x + (d[0] * mul) / walkGrid.w, y: start.value.y + (d[1] * mul) / walkGrid.h })
    commit()
    return
  }
  if (!sel.value || mode.value !== 'spot' || !d) return
  e.preventDefault()
  const k = mul / NAT.w
  const ky = mul / NAT.h
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

// ---- 试走 ----
// 折线长度换成米：与 utils/plan.js 的 fmtDist 同一比例尺（按 2400 宽的 P2 像素算）
const PX_W = 2400
const PX_H = 1738
function pathLen(pts) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.hypot((pts[i].x - pts[i - 1].x) * PX_W, (pts[i].y - pts[i - 1].y) * PX_H)
  return d
}
function runTest(scroll = true) {
  if (!sel.value) return
  const pts = findRoute(walkGrid, mapStart, doorPoints(sel.value), mapSpots) || []
  testPts.value = pts
  testLen.value = pts.length ? fmtDist(pathLen(pts)) : '走不通'
  const r = spots.value[sel.value]
  if (scroll && r) scrollTo({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 })
}
// 全部展位各画一条淡线：一眼看出哪条穿了广场、越了围栏或专程折返
function runAll() {
  const out = []
  const bad = []
  let total = 0
  for (const no of noList.value) {
    const pts = findRoute(walkGrid, mapStart, doorPoints(no), mapSpots)
    if (pts?.length) {
      out.push(pts)
      total += pathLen(pts)
    } else bad.push(no)
  }
  allPts.value = out
  allInfo.value = `${out.length} 条可达，合计约 ${fmtDist(total)}${bad.length ? `；走不通：${bad.join(' / ')}` : ''}`
}
function clearRoutes() {
  testPts.value = []
  testLen.value = ''
  allPts.value = []
  allInfo.value = ''
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
