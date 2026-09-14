<template>
  <Teleport to="body">
    <div v-if="cur" class="lightbox" @click="close">
      <div
        ref="stage"
        class="lb-stage"
        :class="{ tall, wide, map: hasSpots }"
        @touchstart.passive="onTouchStart"
        @touchend="onTouchEnd"
        @click.stop="onStageClick"
        @dblclick.stop="resetView"
        @wheel="onWheel"
      >
        <!-- 无热区时保持原来的裸 img，避免影响其它灯箱 -->
        <img v-if="!hasSpots" :key="cur.src" :src="hi || cur.src" :alt="cur.caption || ''" :style="fitStyle" @load="onLoad" />
        <!-- 有热区（官方平面图 P2）：图片外包一层定位容器，热区 / 路线 / 气泡都叠在上面，整层一起缩放平移 -->
        <div v-else class="lb-hot-wrap" :style="wrapStyle">
          <img :key="cur.src" :src="hi || cur.src" :alt="cur.caption || ''" @load="onLoad" />
          <!-- 导航路线：viewBox 用 0–100，点坐标直接就是百分比 -->
          <svg v-if="route.length > 1" class="lb-route" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline :points="routePoints" class="lb-route-halo" />
            <polyline :points="routePoints" class="lb-route-line" />
          </svg>
          <span v-if="route.length > 1" class="lb-route-dot" :style="{ left: route[0].x * 100 + '%', top: route[0].y * 100 + '%' }" />
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
            <div class="lb-bub-hd">
              <span class="lb-bub-no">{{ pickedSpot.label }}</span>
              <button type="button" class="lb-bub-nav" :class="{ on: routeTo === pickedSpot.no }" @click.stop="nav(pickedSpot)">
                {{ routeTo === pickedSpot.no ? '✕ 收起路线' : '🧭 导航' }}
              </button>
            </div>
            <button v-for="it in pickedSpot.items" :key="it.id" type="button" class="lb-bub-row" @click.stop="emit('open', it.id)">
              {{ it.ip }}
            </button>
            <div v-if="!pickedSpot.items.length" class="lb-bub-row" style="opacity:.7">暂无该展位数据</div>
            <div v-if="routeTo === pickedSpot.no" class="lb-bub-tip">{{ routeTip }}</div>
          </div>
        </div>
      </div>
      <div v-if="hasSpots" class="lb-zoom" @click.stop>
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
import { walkGrid, mapStart, mapSpots } from '../data/mapSpots.js'
import { findRoute } from '../utils/route.js'

const props = defineProps({ items: { type: Array, default: () => [] }, index: { type: Number, default: null } })
const emit = defineEmits(['update:index', 'open'])

const list = computed(() => props.items.map((it) => (typeof it === 'string' ? { src: it } : it)))
const cur = computed(() => (props.index === null || props.index === undefined ? null : list.value[props.index] || null))
const hasSpots = computed(() => !!cur.value?.spots?.length)
const stage = ref(null)
const tall = ref(false)
const wide = ref(false)
const fitStyle = ref(null) // contain 模式下的放大上限（小图用），tall / wide / 地图模式下为 null
const WIDE_MIN = 1.6 // 判为横幅所需的最小宽高比
const MAX_UPSCALE = 3 // 小图最多放大到原始像素的几倍
const hi = ref(null) // 已预载完成的 full 大图地址
let centered = false

// ---- 地图模式：自己实现的缩放平移（transform），不依赖浏览器缩放 ----
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
// 地图模式下把「整图 contain 后的像素尺寸」直接算出来写在容器上：
// 只靠 max-height:100% 不行——容器高度是 auto，百分比 max-height 解析不了，横屏时图会溢出被裁掉。
const natural = ref({ w: 0, h: 0 })
const stageSize = ref({ w: 0, h: 0 })
const fitBox = computed(() => {
  const { w: nw, h: nh } = natural.value
  const { w: sw, h: sh } = stageSize.value
  if (!nw || !sw) return null
  const k = Math.min(sw / nw, sh / nh)
  return { w: nw * k, h: nh * k }
})
const wrapStyle = computed(() => {
  if (!hasSpots.value) return null
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
  const st = stage.value
  if (!st) return
  const lx = (st.clientWidth * (zoom.value - 1)) / 2
  const ly = (st.clientHeight * (zoom.value - 1)) / 2
  pan.value = { x: Math.min(lx, Math.max(-lx, pan.value.x)), y: Math.min(ly, Math.max(-ly, pan.value.y)) }
}
function zoomBy(k, ox = 0, oy = 0) {
  const z = Math.min(6, Math.max(1, zoom.value * k))
  const f = z / zoom.value
  pan.value = { x: (pan.value.x - ox) * f + ox, y: (pan.value.y - oy) * f + oy }
  zoom.value = z
  clampPan()
}
function resetView() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}
function onWheel(e) {
  if (!hasSpots.value) return
  e.preventDefault()
  const r = stage.value.getBoundingClientRect()
  zoomBy(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2)
}

// ---- 热区选中 / 气泡 ----
const picked = ref(null)
const pickedSpot = computed(() => (cur.value?.spots || []).find((s) => s.no === picked.value) || null)
const bubStyle = computed(() => {
  const sp = pickedSpot.value
  if (!sp) return null
  const [x, y, w, h] = sp.rect
  const below = y + h < 0.72
  return {
    left: (x + w / 2) * 100 + '%',
    top: below ? (y + h) * 100 + '%' : 'auto',
    bottom: below ? 'auto' : (1 - y) * 100 + '%',
    // 图放大时气泡反向缩回去，保持可读大小
    transform: `translateX(-50%) scale(${1 / zoom.value})`,
    transformOrigin: below ? 'top center' : 'bottom center',
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
const routeTip = ref('')
const routePoints = computed(() => route.value.map((p) => `${p.x * 100},${p.y * 100}`).join(' '))
// 起点：活动期间若能拿到现场定位就用实时位置，否则用登岛起点（安检票检区）。
// 现场定位还没接——官方图没给经纬度参照点，要等 10 月到现场量几个点做配准（见 CLAUDE.md §10）。
function startPoint() {
  return { x: mapStart.x, y: mapStart.y, name: mapStart.name }
}
function nav(sp) {
  if (routeTo.value === sp.no) {
    route.value = []
    routeTo.value = null
    return
  }
  const [x, y, w, h] = sp.rect
  const from = startPoint()
  const to = { x: x + w / 2, y: y + h / 2 }
  const path = findRoute(walkGrid, from, to, mapSpots)
  const ok = path && path.length > 1
  route.value = ok ? path : [from, to]
  routeTo.value = sp.no
  routeTip.value = `从「${from.name}」出发${ok ? '，沿图上画出的路线走' : '（暂只有直线指引）'}`
}

const close = () => emit('update:index', null)
function go(d) {
  const n = props.index + d
  if (n >= 0 && n < list.value.length) emit('update:index', n)
}
watch(cur, (v) => {
  tall.value = false
  wide.value = false
  fitStyle.value = null
  picked.value = null
  route.value = []
  routeTo.value = null
  hi.value = null
  centered = false
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
  if (hasSpots.value) {
    natural.value = { w: img.naturalWidth, h: img.naturalHeight }
    measure()
    return // 地图模式：容器尺寸算好后交给 transform 缩放
  }
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const sw = st.clientWidth
  const sh = st.clientHeight
  tall.value = nh / nw > (sh / sw) * 1.2
  wide.value = !tall.value && nw / nh > Math.max((sw / sh) * 1.2, WIDE_MIN)
  fitStyle.value =
    tall.value || wide.value
      ? null
      : { maxWidth: `min(100%, ${nw * MAX_UPSCALE}px)`, maxHeight: `min(100%, ${nh * MAX_UPSCALE}px)` }
  // 宽图改为横向滚动后默认停在最左（左侧多是标题卡），滚到中间更接近原来的「整图居中」；换成 full 大图重新触发 load 时保持用户已滚到的位置
  if (wide.value && !centered) {
    centered = true
    nextTick(() => (st.scrollLeft = (st.scrollWidth - st.clientWidth) / 2))
  }
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
  if (!hasSpots.value) return
  if (e.touches.length === 2) {
    const r = stage.value.getBoundingClientRect()
    pinch = {
      d: dist(e.touches),
      cx: (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left - r.width / 2,
      cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top - r.height / 2,
    }
    dragging = null
  } else if (e.touches.length === 1 && zoom.value > 1) {
    dragging = { x: t.clientX, y: t.clientY, px: pan.value.x, py: pan.value.y }
  }
}
// 地图模式下自己接管双指缩放与拖动，同时阻止 iOS Safari 的页面缩放 / 橡皮筋
function onMapTouchMove(e) {
  if (!hasSpots.value) return
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
      pinch = null
      dragging = null
      swipedAt = Date.now()
    }
    return
  }
  if (wide.value) return // 宽图：横向滑动用于滚动地图，不翻页
  if (hasSpots.value && zoom.value > 1) return // 地图放大后横滑是平移，不翻页
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    swipedAt = Date.now()
    go(dx < 0 ? 1 : -1)
  }
}
function onStageClick() {
  if (Date.now() - swipedAt < 400) return
  if (picked.value) {
    picked.value = null // 有选中的展位时，点空白先取消选中，不直接关灯箱
    return
  }
  close()
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
