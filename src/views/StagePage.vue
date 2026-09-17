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
      <!-- id 供详情页「月光舞台 DAYx」锚点定位 -->
      <div v-for="(p, i) in current.items" :key="i" :id="'st-' + i" class="prog">
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
import { computed, watch, nextTick, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import DayChips from '../components/DayChips.vue'
import { campInfo, stageDays } from '../data/stage.js'
import { boothMap } from '../data/booths.js'
import { useDay } from '../composables/useStore.js'
import { ipRefersTo } from '../utils/ipMatch.js'
import { flashAnchor } from '../utils/anchor.js'

const { day } = useDay()
const current = computed(() => stageDays.find((d) => d.day === day.value) || stageDays[0])

// 详情页「月光舞台 DAYx」快捷跳转过来带 ?day=&booth=：切 DAY 后滚到该 IP 的节目条目闪一下（用户 9/17）。
// 本页在 keep-alive 里，用 onActivated 而不是 onMounted；已在本页时 query 变了也要响应
const route = useRoute()
function applyQuery() {
  if (route.name !== 'stage') return
  const d = Number(route.query.day)
  if (d && stageDays.some((x) => x.day === d)) day.value = d
  const b = route.query.booth && boothMap[route.query.booth]
  if (!b) return
  nextTick(() =>
    setTimeout(() => {
      const i = current.value.items.findIndex((p) => p.ip && ipRefersTo(p.ip, b))
      flashAnchor(i >= 0 && document.getElementById('st-' + i))
    }, 80),
  )
}
onActivated(applyQuery)
watch(() => route.query, applyQuery)
</script>
