<template>
  <nav class="tabbar">
    <router-link v-for="t in tabs" :key="t.to" :to="t.to" :class="{ on: route.path.startsWith(t.match) }">
      <span class="ico">{{ t.icon }}</span>
      <span>{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const tabs = [
  { to: '/booths', match: '/booth', icon: '🗺️', label: '展位攻略' },
  { to: '/parade', match: '/parade', icon: '🎠', label: '花车巡礼' },
  { to: '/stage', match: '/stage', icon: '🎤', label: '月光舞台' },
]
</script>
