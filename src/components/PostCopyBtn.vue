<template>
  <div class="row wrap mt-6" style="gap:8px;align-items:center">
    <button class="pbtn sm ghost" @click="copy">{{ copied ? '✅ 已复制，去小红书粘贴' : '📋 复制发帖文案' }}</button>
    <button class="linkbtn small" @click="show = !show">{{ show ? '收起' : '预览文案' }}</button>
    <span v-if="minChars" class="small muted">正文约 {{ bodyLen }} 字 · 要求不少于 {{ minChars }} 字</span>
  </div>
  <template v-if="show">
    <pre class="post-preview">{{ text }}</pre>
    <div class="small muted mt-4">* 按官方信息生成，发布前可按实际体验修改；话题为官方要求原文。</div>
  </template>
</template>

<script setup>
// 带话题 / 有字数要求的打卡任务：一键复制可直接发布的文案（官方话题原文 + 按官方信息写好的正文），
// 有字数要求的任务在数据里给 post（写够字数的正文）与 minChars，没有 post 时按 IP 名自动生成一句
import { ref, computed } from 'vue'

const props = defineProps({ tags: { type: Array, default: () => [] }, post: String, ip: String, minChars: Number })
const copied = ref(false)
const show = ref(false)

const text = computed(() => props.post || `今天在 RED LAND 2026 打卡了「${props.ip || ''}」展台，现场氛围太好了！\n\n${props.tags.join(' ')}`)
// 正文字数：去掉话题行与空白后的字符数
const bodyLen = computed(() => text.value.replace(/#\S+/g, '').replace(/\s/g, '').length)

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
