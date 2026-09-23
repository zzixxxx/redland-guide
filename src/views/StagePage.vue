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
        <!-- 补充演出情报笔记的图（如拳头游戏音乐 DJ 专场）：小缩略图一排，点开灯箱 -->
        <div v-if="p.images" class="fl-thumbs">
          <img v-for="(im, i) in p.images" :key="im" :src="base + im" :alt="p.performer" loading="lazy" @click="openImgs(p.images.map((x) => ({ src: base + x, caption: p.performer })), i)" />
        </div>
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

        <!-- 头车小舞台每日日程（RED LAND 官方号 9/22）：主理人 / 团建小赛 / ending 跟随页面 DAY，可折叠、默认收起 -->
        <div class="hr" />
        <div class="fold-head" @click="openCamp = !openCamp">
          <div class="pcard-title" style="font-size:15px">🎪 {{ campProgram.title }}</div>
          <span class="fold-arrow" :class="{ open: openCamp }">&gt;</span>
        </div>
        <div class="small muted mt-6">{{ campProgram.subtitle }}</div>
        <template v-if="openCamp">
          <div class="row wrap mt-10">
            <span class="tag text">DAY{{ current.day }} 主理人</span>
            <span class="pill warm">{{ hostOf(current.day).name }} ·「{{ hostOf(current.day).role }}」</span>
          </div>
          <div v-for="s in campProgram.schedule" :key="s.time" class="small mt-6">
            <span class="pill">{{ s.time }}</span> <b>{{ s.name }}</b>
            <div v-if="s.desc" class="mt-4 muted">{{ s.desc }}</div>
          </div>
          <div class="hr" />
          <div class="small"><b>DAY{{ current.day }} 团建小赛 · {{ contestOf(current.day).theme }}</b><span v-if="contestOf(current.day).sub" class="muted">（{{ contestOf(current.day).sub }}）</span></div>
          <div class="small mt-4" style="color:var(--brown)">任务：{{ contestOf(current.day).task }}</div>
          <div class="small mt-4">{{ contestOf(current.day).content }}</div>
          <div class="small mt-10"><b>DAY{{ current.day }} ending 大合影</b></div>
          <div class="small mt-4">{{ endingOf(current.day) }}</div>
          <div class="hr" />
          <div class="small"><b>📷 拍照出片</b></div>
          <div v-for="ph in campProgram.photo" :key="ph.name" class="small mt-6">
            <b>{{ ph.name }}</b> <span class="pill" style="margin-left:4px">{{ ph.time }}</span>
            <div class="mt-4">{{ ph.desc }}</div>
          </div>
          <div class="small mt-6">📰 DAY{{ current.day }} 主题报纸：{{ newspaperOf(current.day) }}</div>
          <div class="small mt-6" style="color:var(--brown)">💡 {{ campProgram.tip }}</div>
          <div class="mt-10" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
            <img v-for="(im, i) in campProgram.images" :key="im.src" :src="base + im.src" :alt="im.alt" :title="im.alt" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs(campImages, i)" />
          </div>
          <div class="small muted mt-6">图源：{{ campProgram.source.author }}「{{ campProgram.source.title }}」{{ campProgram.source.publishedAt }} · <a :href="campProgram.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a></div>
        </template>
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

    <!-- 来源：可收起，默认展开；样式与详情页来源卡一致（用户 9/17） -->
    <div class="pcard mt-14">
      <div class="pcard-body">
        <div class="fold-head" @click="openSrc = !openSrc">
          <div class="pcard-title">📎 来源</div>
          <span class="fold-arrow" :class="{ open: openSrc }">&gt;</span>
        </div>
        <template v-if="openSrc">
          <div class="small muted mt-6">来源：{{ stageSources.main.author }} · {{ stageSources.main.publishedAt }}</div>
          <div class="small mt-6"><b>{{ stageSources.main.title }}</b></div>
          <a class="pbtn red block mt-10" :href="stageSources.main.url" target="_blank" rel="noopener">去官方活动页看原文</a>
          <div class="small muted mt-10">补充演出情报的官方笔记</div>
          <a v-for="m in stageSources.more" :key="m.url" class="pbtn block mt-6" :href="m.url" target="_blank" rel="noopener">{{ m.author }} · {{ m.title }}</a>
        </template>
      </div>
    </div>

    <Lightbox :items="lb.items" v-model:index="lb.i" />
  </div>
</template>

<script>
export default { name: 'StagePage' }
</script>

<script setup>
import { ref, reactive, computed, watch, nextTick, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import DayChips from '../components/DayChips.vue'
import Lightbox from '../components/Lightbox.vue'
import { campInfo, campProgram, stageDays, stageSources } from '../data/stage.js'
import { boothMap } from '../data/booths.js'
import { useDay } from '../composables/useStore.js'
import { ipRefersTo } from '../utils/ipMatch.js'
import { flashAnchor } from '../utils/anchor.js'

const { day } = useDay()

const current = computed(() => stageDays.find((d) => d.day === day.value) || stageDays[0])
const base = import.meta.env.BASE_URL
// 头车小舞台日程按 DAY 取当日主理人 / 团建 / ending / 报纸
const openCamp = ref(false)
const hostOf = (d) => campProgram.hosts.find((h) => h.day === d) || { name: '待公布', role: '' }
const contestOf = (d) => campProgram.contests.find((c) => c.day === d) || { theme: '待公布', task: '', content: '' }
const endingOf = (d) => campProgram.endings.find((e) => e.day === d)?.desc || '待公布'
const newspaperOf = (d) => campProgram.newspapers.find((n) => n.day === d)?.name || '待公布'
const campImages = campProgram.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const openSrc = ref(true)

// 灯箱：节目条目里补充笔记的图
const lb = reactive({ items: [], i: null })
const openImgs = (items, i) => {
  lb.items = items
  lb.i = i
}

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
