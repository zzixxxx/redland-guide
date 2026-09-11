<template>
  <Teleport to="body">
    <div v-if="cur" class="lightbox" @click="close">
      <div ref="stage" class="lb-stage" :class="{ tall, wide }" @touchstart.passive="onTouchStart" @touchend="onTouchEnd" @click.stop="onStageClick">
        <img :key="cur.src" :src="hi || cur.src" :alt="cur.caption || ''" @load="onLoad" />
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
// 图片高宽比明显超过视口时（如阅文拼接长图）按视口宽度显示并允许上下滚动，而不是缩成一小条。
// 反过来，宽高比明显超过视口时（如官方场馆平面图）按视口高度显示并允许左右滚动；此时横向滑动留给滚动，不再翻页。
// item.full：原像素大图地址（如 5.5MB 的平面图）。先显示 src 缩略图，full 在后台预载完成后再替换，避免点开一片空白。
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({ items: { type: Array, default: () => [] }, index: { type: Number, default: null } })
const emit = defineEmits(['update:index'])

const list = computed(() => props.items.map((it) => (typeof it === 'string' ? { src: it } : it)))
const cur = computed(() => (props.index === null || props.index === undefined ? null : list.value[props.index] || null))
const stage = ref(null)
const tall = ref(false)
const wide = ref(false)
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
  const view = st.clientHeight / st.clientWidth
  tall.value = img.naturalHeight / img.naturalWidth > view * 1.2
  wide.value = !tall.value && img.naturalWidth / img.naturalHeight > (1 / view) * 1.2
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
