<template>
  <header class="hdr">
    <div class="hdr-inner">
      <button v-if="back" class="hdr-back" @click="goBack" aria-label="返回">&lt;</button>
      <div v-else class="logo">RED<br />LAND<br />2026</div>
      <div style="flex:1;min-width:0">
        <div class="hdr-title">{{ title }}</div>
        <div v-if="sub" class="hdr-sub">{{ sub }}</div>
      </div>
      <slot name="right" />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
defineProps({ title: String, sub: String, back: Boolean })
const router = useRouter()
function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/booths')
}
</script>
