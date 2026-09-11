<template>
  <div class="row wrap mt-6" style="gap:8px;align-items:center">
    <button class="pbtn sm ghost" @click="copy">{{ copied ? '✅ 已复制，去小红书粘贴' : '📋 复制发帖文案' }}</button>
    <button class="linkbtn small" @click="show = !show">{{ show ? '收起' : '预览文案' }}</button>
  </div>
  <pre v-if="show" class="post-preview">{{ text }}</pre>
</template>

<script setup>
// 带话题 / 有字数要求的打卡任务：一键复制发帖文案（官方话题 + 占位提示），到现场直接粘贴到小红书发布框
import { ref, computed } from 'vue'

const props = defineProps({ tags: { type: Array, default: () => [] }, post: String, ip: String })
const copied = ref(false)
const show = ref(false)

const text = computed(
  () =>
    props.post ||
    `【RED LAND 2026 · ${props.ip || ''}】展台打卡✨\n（写一两句现场感受，配上现场照片）\n\n${props.tags.join(' ')}`,
)

async function copy() {
  try {
    await navigator.clipboard.writeText(text.value)
  } catch {
    // 旧浏览器 / 非 https 回退
    const ta = document.createElement('textarea')
    ta.value = text.value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>
