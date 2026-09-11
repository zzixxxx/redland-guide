<template>
  <div class="page">
    <PageHeader title="月光舞台" sub="冒险者营地 · 每日节目单 19:00 – 21:00" />

    <DayChips v-model="day" />

    <div class="theme-banner moon">
      <div class="day">DAY{{ current.day }} · {{ current.date }} · {{ campInfo.moon.short }}</div>
      <div class="name">{{ current.theme }}</div>
      <div class="hint">👗 {{ current.hint }}</div>
    </div>

    <div class="pcard mt-10">
      <div v-for="(p, i) in current.items" :key="i" class="prog">
        <div class="who">
          {{ p.performer }}
          <span v-if="p.ip" class="tag blue text" style="font-size:10px;padding:2px 6px">{{ p.ip }}</span>
        </div>
        <div class="songs">
          <span v-for="s in p.songs" :key="s" class="song">{{ s }}</span>
        </div>
        <div v-if="p.note" class="note">{{ p.note }}</div>
      </div>
    </div>
    <div class="small mt-6" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">* 节目及顺序以现场实际演出为准</div>

    <!-- 营地说明 -->
    <div class="pcard sand mt-14">
      <div class="pcard-body">
        <div class="pcard-title">⛺ {{ campInfo.title }}</div>
        <div class="small mt-6">{{ campInfo.desc }}</div>
        <div class="hr" />
        <div class="row wrap">
          <span class="tag yellow text">☀ {{ campInfo.sun.name }} {{ campInfo.sun.time }}</span>
        </div>
        <div class="small mt-6">{{ campInfo.sun.desc }}</div>
        <div class="row wrap mt-10">
          <span class="tag blue text">🌙 {{ campInfo.moon.name }} {{ campInfo.moon.time }}</span>
        </div>
        <div class="small mt-6">{{ campInfo.moon.desc }}</div>
      </div>
    </div>

    <!-- 五日主题总览 -->
    <div class="pcard mt-14">
      <div class="pcard-body">
        <div class="pcard-title">📅 营地每日主题</div>
        <div v-for="d in stageDays" :key="d.day" class="row small" style="padding:6px 0;border-top:1.5px dashed #eadfc4;cursor:pointer" @click="day = d.day">
          <span class="tag" :class="d.day === day ? '' : 'gray'" style="font-size:9px">DAY{{ d.day }}</span>
          <b style="color:var(--brown)">{{ d.theme }}</b>
          <span class="muted" style="flex:1;text-align:right">{{ d.date }}</span>
        </div>
      </div>
    </div>

    <div class="pcard dark mt-14">
      <div class="pcard-body small">{{ campInfo.disclaimer }}</div>
    </div>
  </div>
</template>

<script>
export default { name: 'StagePage' }
</script>

<script setup>
import { computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import DayChips from '../components/DayChips.vue'
import { campInfo, stageDays } from '../data/stage.js'
import { useDay } from '../composables/useStore.js'

const { day } = useDay()
const current = computed(() => stageDays.find((d) => d.day === day.value) || stageDays[0])
</script>
