<template>
  <Teleport to="body">
    <div v-if="cur" class="lightbox" @click="close">
      <div ref="stage" class="lb-stage" :class="{ tall, wide }" @touchstart.passive="onTouchStart" @touchend="onTouchEnd" @click.stop="onStageClick">
        <!-- 无热区时保持原来的裸 img，避免影响其它灯箱 -->
        <img v-if="!cur.spots?.length" :key="cur.src" :src="hi || cur.src" :alt="cur.caption || ''" :style="fitStyle" @load="onLoad" />
        <!-- 有热区（官方平面图）：图片外包一层定位容器，热区按归一化坐标叠在上面 -->
        <div v-else class="lb-hot-wrap">
          <img :key="cur.src" :src="hi || cur.src" :alt="cur.caption || ''" :style="fitStyle" @load="onLoad" />
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
          <!-- 气泡：单 IP 点一下就能跳，多 IP 列出各 IP 分行点选 -->
          <div v-if="pickedSpot" class="lb-bub" :style="bubStyle" @click.stop>
            <div class="lb-bub-no">{{ pickedSpot.label }}</div>
            <button v-for="it in pickedSpot.items" :key="it.id" type="button" class="lb-bub-row" @click.stop="emit('open', it.id)">
              {{ it.ip }} <span class="lb-bub-go">攻略 ›</span>
            </button>
            <div v-if="!pickedSpot.items.length" class="lb-bub-row" style="opacity:.7">暂无该展位数据</div>
          </div>
        </div>
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
//   横幅（如官方场馆平面图、花车路线图）按舞台高度铺满、左右滚动，此时横向滑动留给滚动，不再翻页；
//   其余整图 contain 放进舞台——注意手机上舞台本身很竖，普通 3:4 海报也「比舞台宽」，
//   所以横幅判定额外要求图片本身宽高比 ≥ 1.6，否则海报会被铺成满高、两侧裁掉（9/14 修）；
//   小图（PIN 缩略图只有 110–320px）在 contain 下最多放大 3 倍，既能看清又不会糊成一片。
// item.full：原像素大图地址（如 5.5MB 的平面图）。先显示 src 缩略图，full 在后台预载完成后再替换，避免点开一片空白。
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({ items: { type: Array, default: () => [] }, index: { type: Number, default: null } })
const emit = defineEmits(['update:index', 'open'])

const list = computed(() => props.items.map((it) => (typeof it === 'string' ? { src: it } : it)))
const cur = computed(() => (props.index === null || props.index === undefined ? null : list.value[props.index] || null))
const stage = ref(null)
const tall = ref(false)
const wide = ref(false)
const fitStyle = ref(null) // contain 模式下的放大上限（小图用），tall / wide 模式下为 null
// 平面图热区：单击选中并弹气泡；单 IP 的展位可以直接双击进攻略，多 IP 的只能点气泡里的 IP
const picked = ref(null)
const pickedSpot = computed(() => (cur.value?.spots || []).find((s) => s.no === picked.value) || null)
const bubStyle = computed(() => {
  const sp = pickedSpot.value
  if (!sp) return null
  const [x, y, w, h] = sp.rect
  const below = y + h < 0.75
  return {
    left: (x + w / 2) * 100 + '%',
    top: below ? (y + h) * 100 + '%' : 'auto',
    bottom: below ? 'auto' : (1 - y) * 100 + '%',
  }
})
function pick(sp) {
  picked.value = picked.value === sp.no ? null : sp.no
}
function dbl(sp) {
  if (sp.items.length === 1) emit('open', sp.items[0].id)
  else picked.value = sp.no
}
const WIDE_MIN = 1.6 // 判为横幅所需的最小宽高比
const MAX_UPSCALE = 3 // 小图最多放大到原始像素的几倍
const hi = ref(null) // 已预载完成的 full 大图地址
let centered = false

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
  hi.value = null
  centered = false
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

let sx = 0
let sy = 0
let swipedAt = 0
function onTouchStart(e) {
  const t = e.changedTouches[0]
  sx = t.clientX
  sy = t.clientY
}
function onTouchEnd(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - sx
  const dy = t.clientY - sy
  if (wide.value) return // 宽图：横向滑动用于滚动地图，不翻页
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
watch(
  cur,
  (v) => {
    if (v) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
