<template>
  <Teleport to="body">
    <div v-if="cur" class="lightbox" @click="close">
      <div
        ref="stage"
        class="lb-stage"
        :class="{ map: true }"
        @touchstart.passive="onTouchStart"
        @touchend="onTouchEnd"
        @click.stop="onStageClick"
        @dblclick.stop="onStageDblClick"
        @wheel="onWheel"
      >
        <!-- 所有图都包一层定位容器：整层一起缩放平移（用户 9/14 要求每张图都能放大缩小），
             带热区的官方平面图还会在上面叠热区 / 路线 / 气泡 -->
        <div class="lb-hot-wrap" :style="wrapStyle">
          <img :key="cur.src" :src="hi || cur.src" :alt="cur.caption || ''" @load="onLoad" />
          <!-- 功能点位遮罩：整层压暗，只在选中的那一类点位上开洞并加亮圈 -->
          <svg v-if="facSel" class="lb-mask" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <mask :id="maskId">
                <rect x="0" y="0" width="100" height="100" fill="#fff" />
                <rect v-for="(pt, i) in facSel.points" :key="i" :x="pt[0] * 100" :y="pt[1] * 100" :width="pt[2] * 100" :height="pt[3] * 100" fill="#000" />
              </mask>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="rgba(10,12,30,0.68)" :mask="`url(#${maskId})`" />
          </svg>
          <span
            v-for="(pt, i) in facSel ? facSel.points : []"
            :key="'f' + i"
            class="lb-facdot"
            :style="{ left: pt[0] * 100 + '%', top: pt[1] * 100 + '%', width: pt[2] * 100 + '%', height: pt[3] * 100 + '%' }"
          />
          <!-- 导航路线：viewBox 用 0–100，点坐标直接就是百分比。plan 为待打卡清单的整条多点路线 -->
          <svg v-if="lines.length" class="lb-route" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline v-for="(ln, i) in lines" :key="'h' + i" :points="ln" class="lb-route-halo" />
            <polyline v-for="(ln, i) in lines" :key="'l' + i" :points="ln" class="lb-route-line" />
          </svg>
          <span v-if="startDot" class="lb-route-dot" :style="{ left: startDot.x * 100 + '%', top: startDot.y * 100 + '%' }" />
          <span
            v-for="(st, i) in planStops"
            :key="'s' + i"
            class="lb-stop"
            :style="{ left: st.x * 100 + '%', top: st.y * 100 + '%' }"
          >{{ i + 1 }}</span>
          <!-- 单条导航的终点标记：气泡收起后还能看出目的地是谁 -->
          <span v-if="endDot" class="lb-stop" :style="{ left: endDot.x * 100 + '%', top: endDot.y * 100 + '%' }">{{ routeTo }}</span>
          <button
            v-for="sp in cur.spots"
            :key="sp.no"
            type="button"
            class="lb-hot"
            :class="{ on: picked === sp.no }"
            :style="{ left: sp.rect[0] * 100 + '%', top: sp.rect[1] * 100 + '%', width: sp.rect[2] * 100 + '%', height: sp.rect[3] * 100 + '%' }"
            :title="sp.label"
            @click.stop="pick(sp)"
            @dblclick.stop="dbl(sp)"
          />
          <!-- 气泡：直接点 IP 名字进攻略；「导航」在图上画一条从起点过来的路线 -->
          <div v-if="pickedSpot" class="lb-bub" :style="bubStyle" @click.stop>
            <!-- 展位号那一行右侧放「导航」，和下面的 IP 名分属两块，不占额外行高（用户 9/15） -->
            <div class="lb-bub-hd">
              <span class="lb-bub-no">{{ pickedSpot.label }}</span>
              <button type="button" class="lb-bub-nav" :class="{ on: routeTo === pickedSpot.no }" @click.stop="nav(pickedSpot)">
                {{ routeTo === pickedSpot.no ? '收起' : '导航' }}
              </button>
            </div>
            <button v-for="it in pickedSpot.items" :key="it.id" type="button" class="lb-bub-row" @click.stop="emit('open', it.id)">
              {{ it.ip }}
            </button>
            <div v-if="!pickedSpot.items.length" class="lb-bub-row" style="opacity:.7">暂无该展位数据</div>
          </div>
        </div>
      </div>
      <div v-if="hasSpots" class="lb-fac" @click.stop>
        <button type="button" :class="{ on: facKey === 'all' }" @click.stop="facKey = facKey === 'all' ? null : 'all'">
          ✳ 全部<i>{{ facAllCount }}</i>
        </button>
        <button
          v-for="f in mapFacilities"
          :key="f.key"
          type="button"
          :class="{ on: facKey === f.key }"
          @click.stop="facKey = facKey === f.key ? null : f.key"
        >
          {{ f.icon }} {{ f.name }}<i>{{ f.points.length }}{{ f.points.length < f.official ? '/' + f.official : '' }}</i>
        </button>
      </div>
      <div class="lb-zoom" @click.stop>
        <button type="button" @click="zoomBy(1 / 1.6)">－</button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button type="button" @click="zoomBy(1.6)">＋</button>
      </div>
      <div v-if="cur.caption" class="lb-cap" @click.stop>{{ cur.caption }}</div>
      <div class="nav" @click.stop>
        <template v-if="list.length > 1">
          <button class="pbtn sm ghost" :disabled="index === 0" @click="go(-1)">‹ 上一张</button>
          <span class="tag yellow">{{ index + 1 }}/{{ list.length }}</span>
          <button class="pbtn sm ghost" :disabled="index === list.length - 1" @click="go(1)">下一张 ›</button>
        </template>
        <button class="pbtn sm red" @click="close">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// 通用灯箱：items 为图片地址或 { src, caption }，index 为当前下标（null = 关闭）。
// 手机端左右滑动切换上一张 / 下一张，竖向滑动留给长图滚动；PC 端支持 ← → Esc。
// 打开时的缩放按图片自身尺寸自适应，灯箱外框尺寸不变：
//   长图（如阅文拼接长图）比舞台更细长时按舞台宽度铺满、上下滚动，而不是缩成一小条；
//   横幅（如花车路线图）按舞台高度铺满、左右滚动，此时横向滑动留给滚动，不再翻页；
//   其余整图 contain 放进舞台——注意手机上舞台本身很竖，普通 3:4 海报也「比舞台宽」，
//   所以横幅判定额外要求图片本身宽高比 ≥ 1.6，否则海报会被铺成满高、两侧裁掉（9/14 修）；
//   小图（PIN 缩略图只有 110–320px）在 contain 下最多放大 3 倍，既能看清又不会糊成一片。
// item.full：原像素大图地址。先显示 src 缩略图，full 在后台预载完成后再替换，避免点开一片空白。
// item.spots：展位热区（官方平面图 P2 专用，见 data/mapSpots.js）。带 spots 的图走「地图模式」：
//   整图 contain 放进舞台（用户 9/14「按图片大小缩放」），缩放平移由组件自己用 transform 实现，
//   并把 iOS Safari 的双指缩放（gesture* 事件）拦掉，优先响应图里的功能；
//   单击热区选中并弹气泡，点气泡里的 IP 名直接进攻略，只有一个 IP 的展位还可以双击直接跳；
//   气泡里的「导航」在图上画一条从登岛起点到该展位的路线（utils/route.js 在可走网格上跑 A*）。
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { walkGrid, mapStart, mapSpots, mapFacilities, doorPoints } from '../data/mapSpots.js'
import { findRoute } from '../utils/route.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  index: { type: Number, default: null },
  // 待打卡清单的整条路线：{ legs: [{ to, points }] }，传了就常显在地图上
  plan: { type: Object, default: null },
})
const emit = defineEmits(['update:index', 'open'])

const list = computed(() => props.items.map((it) => (typeof it === 'string' ? { src: it } : it)))
const cur = computed(() => (props.index === null || props.index === undefined ? null : list.value[props.index] || null))
const hasSpots = computed(() => !!cur.value?.spots?.length)
// 「地图模式」= 官方平面图的三张切片：都按高度铺满、同一个缩放比例，自己接管缩放平移。
// 三张是同一张原图切的（原高相同），按高度铺满后左右滑过去才像同一张图的三段（用户 9/14）。
const isMap = computed(() => hasSpots.value || !!cur.value?.fitH)
const stage = ref(null)
const tall = ref(false)
const wide = ref(false)
const WIDE_MIN = 1.6 // 判为横幅所需的最小宽高比
const MAX_UPSCALE = 3 // 小图最多放大到原始像素的几倍
const hi = ref(null) // 已预载完成的 full 大图地址

// ---- 地图模式：自己实现的缩放平移（transform），不依赖浏览器缩放 ----
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
// 地图模式下把「整图 contain 后的像素尺寸」直接算出来写在容器上：
// 只靠 max-height:100% 不行——容器高度是 auto，百分比 max-height 解析不了，横屏时图会溢出被裁掉。
const natural = ref({ w: 0, h: 0 })
const stageSize = ref({ w: 0, h: 0 })
// 100% 的含义按图片类型定：长图按舞台宽度铺满、宽幅与平面图切片按高度铺满、其余整图 contain。
// 最小可以缩到「整张图都看得见」，再往下没意义。
const baseK = computed(() => {
  const { w: nw, h: nh } = natural.value
  const { w: sw, h: sh } = stageSize.value
  if (!nw || !sw) return 0
  if (tall.value) return sw / nw
  if (wide.value || cur.value?.fitH) return sh / nh
  return Math.min(sw / nw, sh / nh)
})
const fitBox = computed(() => {
  const { w: nw, h: nh } = natural.value
  const k = baseK.value
  return k ? { w: nw * k, h: nh * k } : null
})
const minZoom = computed(() => {
  const { w: nw, h: nh } = natural.value
  const { w: sw, h: sh } = stageSize.value
  if (!nw || !sw || !baseK.value) return 1
  return Math.min(1, Math.min(sw / nw, sh / nh) / baseK.value)
})
const overflowX = computed(() => (fitBox.value ? fitBox.value.w * zoom.value > stageSize.value.w + 1 : false))
const wrapStyle = computed(() => {
  const box = fitBox.value
  return {
    ...(box ? { width: `${box.w}px`, height: `${box.h}px` } : null),
    transform: `translate(${pan.value.x}px, ${pan.value.y}px) scale(${zoom.value})`,
  }
})
function measure() {
  const st = stage.value
  if (st) stageSize.value = { w: st.clientWidth, h: st.clientHeight }
}
function clampPan() {
  const box = fitBox.value
  const { w: sw, h: sh } = stageSize.value
  if (!box || !sw) return
  const lx = Math.max(0, (box.w * zoom.value - sw) / 2)
  const ly = Math.max(0, (box.h * zoom.value - sh) / 2)
  pan.value = { x: Math.min(lx, Math.max(-lx, pan.value.x)), y: Math.min(ly, Math.max(-ly, pan.value.y)) }
}
function zoomBy(k, ox = 0, oy = 0) {
  const z = Math.min(6, Math.max(minZoom.value, zoom.value * k))
  const f = z / zoom.value
  pan.value = { x: (pan.value.x - ox) * f + ox, y: (pan.value.y - oy) * f + oy }
  zoom.value = z
  clampPan()
}
function resetView() {
  zoom.value = 1 // 100% = 按高度铺满
  pan.value = { x: 0, y: 0 }
}
function onWheel(e) {
  e.preventDefault()
  const r = stage.value.getBoundingClientRect()
  zoomBy(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2)
}

// ---- 功能点位：选中一类后遮罩压暗、只点亮这类点 ----
const facKey = ref(null)
const facAllCount = mapFacilities.reduce((n, f) => n + f.points.length, 0)
const facSel = computed(() => {
  if (facKey.value === 'all') return { key: 'all', name: '全部功能点位', points: mapFacilities.flatMap((f) => f.points) }
  return mapFacilities.find((f) => f.key === facKey.value) || null
})
const maskId = `lbmask-${Math.random().toString(36).slice(2, 8)}`

// ---- 热区选中 / 气泡 ----
const picked = ref(null)
const pickedSpot = computed(() => (cur.value?.spots || []).find((s) => s.no === picked.value) || null)
const bubStyle = computed(() => {
  const sp = pickedSpot.value
  if (!sp) return null
  const [x, y, w, h] = sp.rect
  const below = y + h < 0.72
  const cx = x + w / 2
  // 靠边的展位（C 区最左、A 区最右）气泡要贴边对齐，否则会被图的边缘切掉
  const side = cx < 0.22 ? 'left' : cx > 0.78 ? 'right' : 'center'
  const shiftX = side === 'left' ? '0' : side === 'right' ? '-100%' : '-50%'
  return {
    left: side === 'right' ? 'auto' : (side === 'left' ? x : cx) * 100 + '%',
    right: side === 'right' ? (1 - (x + w)) * 100 + '%' : 'auto',
    top: below ? (y + h) * 100 + '%' : 'auto',
    bottom: below ? 'auto' : (1 - y) * 100 + '%',
    // 图放大时气泡反向缩回去，保持可读大小
    transform: `translateX(${shiftX}) scale(${1 / zoom.value})`,
    transformOrigin: `${below ? 'top' : 'bottom'} ${side}`,
  }
})
function pick(sp) {
  picked.value = picked.value === sp.no ? null : sp.no
}
function dbl(sp) {
  if (sp.items.length === 1) emit('open', sp.items[0].id)
  else picked.value = sp.no
}

// ---- 导航：起点 → 展位，在可走网格上跑 A* ----
const route = ref([])
const routeTo = ref(null)
const asPoints = (pts) => pts.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')
// 画在图上的折线：优先单条导航路线，没有时画清单路线
const lines = computed(() => {
  if (route.value.length > 1) return [asPoints(route.value)]
  const legs = props.plan?.legs?.filter((l) => l.points?.length > 1) || []
  return legs.map((l) => asPoints(l.points))
})
const startDot = computed(() => {
  if (route.value.length > 1) return route.value[0]
  const first = props.plan?.legs?.[0]?.points
  return first?.length ? first[0] : null
})
const endDot = computed(() => (route.value.length > 1 ? route.value[route.value.length - 1] : null))
// 清单路线上的编号站点
const planStops = computed(() =>
  route.value.length > 1 ? [] : (props.plan?.legs || []).map((l) => l.points?.[l.points.length - 1]).filter(Boolean),
)
// 起点：活动期间若能拿到现场定位就用实时位置，否则用登岛起点（安检票检区）。
// 现场定位还没接——官方图没给经纬度参照点，要等 10 月到现场量几个点做配准（见 CLAUDE.md §10）。
function startPoint() {
  return { x: mapStart.x, y: mapStart.y, name: mapStart.name }
}
function nav(sp) {
  if (routeTo.value === sp.no) {
    route.value = []
    routeTo.value = null
    picked.value = null // 收起路线时把气泡一起关掉（用户 9/14）
    return
  }
  const [x, y, w, h] = sp.rect
  const from = startPoint()
  // 终点固定落在该展位朝向过道的那条边（mapDoors），不用中心点 —— 否则每次停的位置乱跳（用户 9/15）；
  // 配了多个门就交给 findRoute 多目标，自动停在最近的那个
  const to = doorPoints(sp.no)
  if (!to.length) to.push({ x: x + w / 2, y: y + h / 2 })
  const path = findRoute(walkGrid, from, to, mapSpots)
  const ok = path && path.length > 1
  route.value = ok ? path : [from, to[0]]
  routeTo.value = sp.no
  picked.value = null // 画完就把气泡收起来，不然一直挡着看不到路线（用户 9/15）
}

const close = () => emit('update:index', null)
function go(d) {
  const n = props.index + d
  if (n >= 0 && n < list.value.length) emit('update:index', n)
}
watch(cur, (v) => {
  tall.value = false
  wide.value = false
  picked.value = null
  route.value = []
  routeTo.value = null
  facKey.value = null
  hi.value = null
  resetView()
  if (v?.full) {
    const pre = new Image()
    pre.onload = () => {
      if (cur.value === v) hi.value = v.full
    }
    pre.src = v.full
  }
})

function onLoad(e) {
  const img = e.target
  const st = stage.value
  if (!st || !img.naturalWidth || !st.clientWidth) return
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const sw = st.clientWidth
  const sh = st.clientHeight
  if (!isMap.value) {
    // 长图按宽铺满（阅文拼接长图）、明显的横幅按高铺满；其余 contain，小图最多放大 3 倍
    tall.value = nh / nw > (sh / sw) * 1.2
    wide.value = !tall.value && nw / nh > Math.max((sw / sh) * 1.2, WIDE_MIN)
    if (!tall.value && !wide.value && Math.min(sw / nw, sh / nh) > MAX_UPSCALE) {
      natural.value = { w: nw * MAX_UPSCALE, h: nh * MAX_UPSCALE }
      measure()
      return
    }
  }
  natural.value = { w: nw, h: nh }
  measure()
}

// ---- 手势 ----
let sx = 0
let sy = 0
let swipedAt = 0
let pinch = null
let dragging = null
const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
function onTouchStart(e) {
  const t = e.changedTouches[0]
  sx = t.clientX
  sy = t.clientY
  if (e.touches.length === 2) {
    const r = stage.value.getBoundingClientRect()
    pinch = {
      d: dist(e.touches),
      cx: (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left - r.width / 2,
      cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top - r.height / 2,
    }
    dragging = null
  } else if (e.touches.length === 1 && (zoom.value > 1 || overflowX.value)) {
    // 记下按下时是否已经贴到左右边界：贴边了还继续往同方向滑，就当翻页
    const box = fitBox.value
    const lx = box ? Math.max(0, (box.w * zoom.value - stageSize.value.w) / 2) : 0
    dragging = {
      x: t.clientX,
      y: t.clientY,
      px: pan.value.x,
      py: pan.value.y,
      atLeft: pan.value.x >= lx - 1,
      atRight: pan.value.x <= -lx + 1,
    }
  }
}
// 地图模式下自己接管双指缩放与拖动，同时阻止 iOS Safari 的页面缩放 / 橡皮筋
function onMapTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    if (!pinch) return
    const d = dist(e.touches)
    if (pinch.d > 0) zoomBy(d / pinch.d, pinch.cx, pinch.cy)
    pinch.d = d
    swipedAt = Date.now()
  } else if (dragging && e.touches.length === 1) {
    e.preventDefault()
    pan.value = { x: dragging.px + e.touches[0].clientX - dragging.x, y: dragging.py + e.touches[0].clientY - dragging.y }
    clampPan()
    swipedAt = Date.now()
  }
}
function onTouchEnd(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - sx
  const dy = t.clientY - sy
  if (pinch || dragging) {
    if (!e.touches.length) {
      const d = dragging
      pinch = null
      dragging = null
      swipedAt = Date.now()
      // 已经拖到边界还继续往同方向滑 → 翻到上 / 下一张
      if (d && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx > 0 && d.atLeft) go(-1)
        else if (dx < 0 && d.atRight) go(1)
      }
    }
    return
  }
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    swipedAt = Date.now()
    go(dx < 0 ? 1 : -1)
  }
}
// 单击空白：有气泡先只关气泡（别挡着看路线，用户 9/14），没有气泡才关灯箱。
// 关闭要延后一点执行，否则双击的第一下就把灯箱关了，dblclick 根本不会触发（用户 9/14 反馈双击复位没用）。
let clickTimer = null
function onStageClick() {
  if (Date.now() - swipedAt < 400) return
  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => {
    // 点空白：先收气泡 → 再清路线 → 都没有才关灯箱
    if (picked.value) picked.value = null
    else if (routeTo.value) {
      route.value = []
      routeTo.value = null
    } else close()
  }, 260)
}
function onStageDblClick() {
  clearTimeout(clickTimer) // 双击不算「点空白」
  resetView()
}

function onKey(e) {
  if (!cur.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}
// iOS Safari 的双指缩放走 gesture* 事件；不 preventDefault 会把整页放大，盖掉图里的缩放
const stopGesture = (e) => e.preventDefault()
const GES = ['gesturestart', 'gesturechange', 'gestureend']
watch(
  cur,
  (v) => {
    if (v) {
      window.addEventListener('keydown', onKey)
      GES.forEach((n) => document.addEventListener(n, stopGesture, { passive: false }))
      window.addEventListener('resize', measure)
      window.addEventListener('orientationchange', measure)
      nextTick(() => {
        measure()
        stage.value?.addEventListener('touchmove', onMapTouchMove, { passive: false })
      })
    } else {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
      GES.forEach((n) => document.removeEventListener(n, stopGesture))
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', measure)
  window.removeEventListener('orientationchange', measure)
  GES.forEach((n) => document.removeEventListener(n, stopGesture))
})
</script>
