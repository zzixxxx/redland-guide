<template>
  <header class="hdr">
    <div class="hdr-inner">
      <button v-if="back" class="hdr-back" @click="goBack" aria-label="返回">&lt;</button>
      <a v-else class="logo" :href="profileUrl(REDLAND_XHS.uid)" target="_blank" rel="noopener" title="RED LAND 小红书官方号" @click="openProfile($event, REDLAND_XHS.uid)">RED<br />LAND<br />2026</a>
      <div style="flex:1;min-width:0">
        <div class="hdr-title">{{ title }}</div>
        <button v-if="venue" class="hdr-sub hdr-nav" @click="showNav = !showNav">
          📍 {{ sub }} <span class="hdr-nav-tag">{{ showNav ? '收起' : '导航' }}</span>
        </button>
        <div v-else-if="sub" class="hdr-sub">{{ sub }}</div>
      </div>
      <slot name="right" />
    </div>
    <div v-if="venue && showNav" class="hdr-navbox">
      <div class="small"><b>{{ venue.name }}</b></div>
      <div class="small muted">{{ venue.address }}</div>
      <div class="row wrap mt-6" style="gap:6px">
        <a v-for="l in venue.links" :key="l.label" class="pbtn sm" :href="l.url" target="_blank" rel="noopener">{{ l.label }}</a>
        <button class="pbtn sm ghost" @click="copyAddr">{{ copied ? '已复制' : '复制地址' }}</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { profileUrl, openProfile, REDLAND_XHS } from '../utils/xhs.js'

const props = defineProps({ title: String, sub: String, back: Boolean, venue: Object })
const router = useRouter()
const showNav = ref(false)
const copied = ref(false)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/booths')
}
async function copyAddr() {
  try {
    await navigator.clipboard.writeText(props.venue.copyText || props.venue.address)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* 不支持剪贴板时忽略 */
  }
}
</script>
