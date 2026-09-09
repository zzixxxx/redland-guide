<template>
  <div class="page">
    <PageHeader title="花车巡礼" sub="每日头号花车出场角色 · 主题花车 · 主角方阵" />

    <!-- 时间 -->
    <div class="row" style="gap:10px">
      <div v-for="t in paradeInfo.times" :key="t.name" class="pcard" style="flex:1;margin:0">
        <div class="pcard-body" style="padding:10px 12px">
          <div class="tag yellow" style="font-size:9px">{{ t.time }}</div>
          <div style="font-weight:800;color:var(--brown);margin-top:6px">{{ t.name }}</div>
          <div class="small muted">{{ t.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 每日角色 -->
    <div class="mt-14">
      <span class="sticker">头号花车 · 每日出场角色</span>
      <div class="mt-10"><DayChips v-model="day" /></div>
      <div class="theme-banner">
        <div class="day">DAY{{ current.day }} · {{ current.date }}</div>
        <div class="name">头号花车出战表</div>
        <div class="hint">{{ paradeInfo.headFloat }} · 共 {{ current.entries.length }} 组 IP</div>
      </div>
      <div class="pcard mt-10">
        <div v-for="e in current.entries" :key="e.ip" class="pr-entry">
          <div class="ip">{{ e.ip }}</div>
          <div class="chars">
            <span v-for="c in e.chars" :key="c" class="pill" :class="{ warm: /神秘|人气|待/.test(c) }">{{ c }}</span>
          </div>
        </div>
      </div>
      <div class="small mt-6" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">* {{ paradeInfo.disclaimer }}</div>
    </div>

    <!-- 主题花车 -->
    <div class="mt-14">
      <span class="sticker">加入巡礼的次元伙伴</span>
      <div class="pcard mt-10">
        <div v-for="f in themeFloats" :key="f.ip" class="booth">
          <div class="body">
            <div class="ip">{{ f.ip }}</div>
            <div class="blurb">{{ f.desc }}</div>
            <div class="small muted">🚗 {{ f.look }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主角方阵 -->
    <div class="pcard sand mt-14">
      <div class="pcard-body">
        <div class="pcard-title">🎭 {{ playerSquad.title }}</div>
        <div class="small mt-6">{{ playerSquad.desc }}</div>
      </div>
    </div>

    <div class="pcard dark mt-14">
      <div class="pcard-body small">{{ paradeInfo.desc }}</div>
    </div>
  </div>
</template>

<script>
export default { name: 'ParadePage' }
</script>

<script setup>
import { computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import DayChips from '../components/DayChips.vue'
import { paradeInfo, paradeDays, themeFloats, playerSquad } from '../data/parade.js'
import { useDay } from '../composables/useStore.js'

const { day } = useDay()
const current = computed(() => paradeDays.find((d) => d.day === day.value) || paradeDays[0])
</script>
