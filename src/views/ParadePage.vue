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

    <!-- 花车巡礼路线图（RED LAND 官方号 9/11） -->
    <div class="pcard mt-14">
      <div class="pcard-body">
        <div class="pcard-title">🗺 {{ paradeRoute.title }}</div>
        <div class="gallery mt-10">
          <img class="span-all" :src="base + paradeRoute.image" :alt="paradeRoute.title" :title="paradeRoute.title" loading="lazy" @click="openImgs(routeImages, 0)" />
        </div>
        <div class="small mt-6">{{ paradeRoute.desc }}</div>
        <div class="small mt-6">🚩 {{ paradeRoute.route }}</div>
        <div class="small mt-6">🎉 {{ paradeRoute.encounters }}</div>
        <div class="small muted mt-6">{{ paradeRoute.legend }}</div>
        <div class="small muted mt-6">
          来源：RED LAND 官方号 · {{ paradeRoute.source.publishedAt }}
          <a :href="paradeRoute.source.url" target="_blank" rel="noopener">原笔记</a>
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
            <!-- 专属花车笔记（9/5）：出席嘉宾按当前 DAY 显示，day 'all' 为 DAY1–DAY5 全程 -->
            <template v-if="guestsFor(f)">
              <div class="small mt-6" style="font-weight:700;color:var(--brown)">{{ guestLabel(f) }}</div>
              <div class="row wrap">
                <span v-for="c in guestsFor(f).chars" :key="c" class="pill" :class="{ warm: /神秘|人气|待/.test(c) }">{{ c }}</span>
              </div>
              <div v-if="f.guestNote" class="small muted mt-6">* {{ f.guestNote }}</div>
            </template>
            <div v-if="f.images" class="gallery mt-6">
              <img v-for="(im, i) in f.images" :key="im" :src="base + im" :alt="f.ip + ' 专属花车'" loading="lazy" @click="openImgs(floatImages(f), i)" />
            </div>
            <div v-if="f.source" class="small muted mt-6">
              来源：RED LAND 官方号 · {{ f.source.publishedAt }}
              <a :href="f.source.url" target="_blank" rel="noopener">原笔记</a>
            </div>
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

    <Lightbox :items="lb.items" v-model:index="lb.i" />
  </div>
</template>

<script>
export default { name: 'ParadePage' }
</script>

<script setup>
import { computed, reactive } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import DayChips from '../components/DayChips.vue'
import Lightbox from '../components/Lightbox.vue'
import { paradeInfo, paradeDays, paradeRoute, themeFloats, playerSquad } from '../data/parade.js'
import { useDay } from '../composables/useStore.js'

const { day } = useDay()
const current = computed(() => paradeDays.find((d) => d.day === day.value) || paradeDays[0])
const base = import.meta.env.BASE_URL

// 专属花车出席嘉宾：优先当前 DAY 的名单，没有按日名单的取 'all'
const guestsFor = (f) => f.guests?.find((g) => g.day === day.value) || f.guests?.find((g) => g.day === 'all')
const guestLabel = (f) => {
  const g = guestsFor(f)
  if (!g) return ''
  const head = g.day === 'all' ? 'DAY1–DAY5 出席嘉宾' : `DAY${current.value.day} · ${current.value.date} 出席嘉宾`
  return g.label ? `${head} · ${g.label}` : head
}

// 灯箱：路线图 / 各花车笔记图
const lb = reactive({ items: [], i: null })
const openImgs = (items, i) => {
  lb.items = items
  lb.i = i
}
const routeImages = [{ src: base + paradeRoute.image, caption: paradeRoute.title }]
const floatImages = (f) => f.images.map((x) => ({ src: base + x, caption: `${f.ip} 专属花车` }))
</script>
