<template>
  <div class="page">
    <PageHeader title="花车巡礼" sub="每日头号花车出场角色 · 专属花车 · 主角方阵" />

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

    <!-- 花车巡礼路线图（RED LAND 官方号 9/11）；来源统一收在页尾「来源」卡（用户 9/17） -->
    <div class="pcard mt-14">
      <div class="pcard-body">
        <!-- 标题行可收起 / 展开，默认展开（用户 9/17）；箭头样式与首页「主线玩法」、详情页三张卡一致 -->
        <div class="fold-head" @click="openRoute = !openRoute">
          <div class="pcard-title">🗺 {{ paradeRoute.title }}</div>
          <span class="fold-arrow" :class="{ open: openRoute }">&gt;</span>
        </div>
        <template v-if="openRoute">
          <div class="gallery mt-10">
            <img class="span-all" :src="base + paradeRoute.image" :alt="paradeRoute.title" :title="paradeRoute.title" loading="lazy" @click="openImgs(routeImages, 0)" />
          </div>
          <div class="small mt-6">{{ paradeRoute.desc }}</div>
          <div class="small mt-6">🚩 {{ paradeRoute.route }}</div>
          <div class="small mt-6">🎉 {{ paradeRoute.encounters }}</div>
          <div class="small muted mt-6">{{ paradeRoute.legend }}</div>
        </template>
      </div>
    </div>

    <!-- 头号花车 / 专属花车：两张贴纸当 tab 切换（用户 9/17），DAY 芯片两边共用；黄色横条已删 -->
    <div class="mt-14">
      <div class="row wrap" style="gap:12px">
        <button v-for="t in TABS" :key="t.key" type="button" class="sticker tab" :class="{ off: tab !== t.key }" @click="tab = t.key">
          {{ t.name }}
        </button>
      </div>
      <div class="mt-10"><DayChips v-model="day" /></div>

      <!-- 头号花车：当日出场角色。id 供详情页「头号花车 DAYx」锚点定位 -->
      <template v-if="tab === 'head'">
        <div class="pcard mt-10">
          <div v-for="(e, i) in current.entries" :key="e.ip" :id="'pr-' + i" class="pr-entry">
            <div class="ip">{{ e.ip }}</div>
            <div class="chars">
              <span v-for="c in e.chars" :key="c" class="pill" :class="{ warm: /神秘|人气|待/.test(c) }">{{ c }}</span>
            </div>
          </div>
        </div>
        <div class="small mt-6" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">* {{ paradeInfo.disclaimer }}</div>
      </template>

      <!-- 专属花车：8 台，出席嘉宾按当前 DAY 显示 -->
      <template v-else>
        <div class="pcard mt-10">
          <div v-for="f in themeFloats" :key="f.ip" :id="'fl-' + f.id" class="booth">
            <div class="body">
              <div class="ip">{{ f.ip }}</div>
              <div class="blurb">{{ f.desc }}</div>
              <div class="small muted">🚗 {{ f.look }}</div>
              <!-- 专属花车笔记（9/5）：出席嘉宾按当前 DAY 显示，day 'all' 为 DAY1–DAY5 全程 -->
              <template v-if="guestsFor(f)">
                <div class="small mt-6" style="font-weight:700;color:var(--brown)">{{ guestLabel(f) }}</div>
                <!-- 嘉宾名单用普通文字顿号拼接，不套胶囊（用户 9/17），与详情页 .sched-guests 一致 -->
                <div class="small sched-guests">{{ guestsFor(f).chars.join('、') }}</div>
                <div v-if="f.guestNote" class="small muted mt-6">* {{ f.guestNote }}</div>
              </template>
              <div v-if="f.images" class="gallery mt-6">
                <img v-for="(im, i) in f.images" :key="im" :src="base + im" :alt="f.ip + ' 专属花车'" loading="lazy" @click="openImgs(floatImages(f), i)" />
              </div>
            </div>
          </div>
        </div>
      </template>
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

    <!-- 来源：全页来源集中在页尾，可收起，默认展开（用户 9/17） -->
    <div class="pcard mt-14">
      <div class="pcard-body">
        <div class="fold-head" @click="openSrc = !openSrc">
          <div class="pcard-title">📎 来源</div>
          <span class="fold-arrow" :class="{ open: openSrc }">&gt;</span>
        </div>
        <ul v-if="openSrc" class="dot-list small">
          <li v-for="s in sources" :key="s.key">
            <b style="color:var(--brown)">{{ s.what }}</b>
            <span class="muted"> · {{ s.author }} · {{ s.publishedAt }}</span>
            <a v-if="s.url" class="srclink" :href="s.url" target="_blank" rel="noopener">{{ s.linkText || '原笔记' }}</a>
          </li>
        </ul>
      </div>
    </div>

    <Lightbox :items="lb.items" v-model:index="lb.i" />
  </div>
</template>

<script>
export default { name: 'ParadePage' }
</script>

<script setup>
import { ref, computed, reactive, watch, nextTick, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import DayChips from '../components/DayChips.vue'
import Lightbox from '../components/Lightbox.vue'
import { paradeInfo, paradeDays, paradeRoute, themeFloats, playerSquad } from '../data/parade.js'
import { boothMap } from '../data/booths.js'
import { useDay } from '../composables/useStore.js'
import { ipRefersTo } from '../utils/ipMatch.js'
import { flashAnchor } from '../utils/anchor.js'

const { day } = useDay()
const current = computed(() => paradeDays.find((d) => d.day === day.value) || paradeDays[0])
const base = import.meta.env.BASE_URL

// 两张贴纸当 tab：头号花车 / 专属花车（用户 9/17）
const TABS = [
  { key: 'head', name: '头号花车' },
  { key: 'theme', name: '专属花车' },
]
const tab = ref('head')
// 路线图卡 / 来源卡的收起展开，默认展开（用户 9/17），只存组件内
const openRoute = ref(true)
const openSrc = ref(true)

// 专属花车出席嘉宾：优先当前 DAY 的名单，没有按日名单的取 'all'
const guestsFor = (f) => f.guests?.find((g) => g.day === day.value) || f.guests?.find((g) => g.day === 'all')
const guestLabel = (f) => {
  const g = guestsFor(f)
  if (!g) return ''
  const head = g.day === 'all' ? 'DAY1–DAY5 出席嘉宾' : `DAY${current.value.day} · ${current.value.date} 出席嘉宾`
  return g.label ? `${head} · ${g.label}` : head
}

// 页尾「来源」卡：官方半层 + 路线图笔记 + 每台专属花车的笔记
const sources = computed(() => [
  { key: 'info', what: '打卡 / 巡游时间、头号花车出场角色、主角方阵', ...paradeInfo.source, linkText: '官方活动页' },
  { key: 'route', what: paradeRoute.title, author: 'RED LAND 官方号', publishedAt: paradeRoute.source.publishedAt, url: paradeRoute.source.url },
  ...themeFloats
    .filter((f) => f.source)
    .map((f) => ({ key: f.id, what: `${f.ip} 专属花车`, author: f.source.author, publishedAt: f.source.publishedAt, url: f.source.url })),
])

// 灯箱：路线图 / 各花车笔记图
const lb = reactive({ items: [], i: null })
const openImgs = (items, i) => {
  lb.items = items
  lb.i = i
}
const routeImages = [{ src: base + paradeRoute.image, caption: paradeRoute.title }]
const floatImages = (f) => f.images.map((x) => ({ src: base + x, caption: `${f.ip} 专属花车` }))

// 详情页「头号花车 DAYx / 专属花车」快捷跳转过来带 ?tab=&day=&booth=：切 tab、切 DAY，再滚到对应条目闪一下（用户 9/17）。
// 本页在 keep-alive 里，用 onActivated 而不是 onMounted；已在本页时 query 变了也要响应
const route = useRoute()
function applyQuery() {
  if (route.name !== 'parade') return
  const q = route.query
  if (q.tab === 'head' || q.tab === 'theme') tab.value = q.tab
  const d = Number(q.day)
  if (d && paradeDays.some((x) => x.day === d)) day.value = d
  const b = q.booth && boothMap[q.booth]
  if (!b) return
  nextTick(() =>
    setTimeout(() => {
      let el = null
      if (tab.value === 'theme') {
        const f = themeFloats.find((x) => ipRefersTo(x.ip, b))
        el = f && document.getElementById('fl-' + f.id)
      } else {
        const i = current.value.entries.findIndex((e) => ipRefersTo(e.ip, b))
        el = i >= 0 && document.getElementById('pr-' + i)
      }
      flashAnchor(el)
    }, 80),
  )
}
onActivated(applyQuery)
watch(() => route.query, applyQuery)
</script>
