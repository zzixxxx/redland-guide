<template>
  <div class="page">
    <PageHeader title="冒险者攻略" :sub="`${event.dateText} · ${event.venue}`">
      <template #right>
        <span class="tag yellow">{{ count }}/{{ booths.length }}</span>
      </template>
    </PageHeader>

    <!-- 每日时刻 -->
    <div class="timeline">
      <div v-for="t in dailySchedule" :key="t.name" class="tl-item" :class="t.kind">
        <div class="t">{{ t.time }}</div>
        <div class="n">{{ t.name }}</div>
        <div class="w">{{ t.where }}</div>
      </div>
    </div>

    <!-- 主线玩法 -->
    <div class="pcard sand mt-10">
      <div class="pcard-body">
        <div class="fold-head" @click="openRules = !openRules">
          <div class="pcard-title">🕹 {{ mainline.title }}</div>
          <span class="fold-arrow" :class="{ open: openRules }">&gt;</span>
        </div>
        <div class="small muted mt-6">{{ mainline.subtitle }}</div>

        <div class="mt-10">
          <div class="row between small">
            <b>我的存档进度</b>
            <span class="muted">已打卡 {{ count }} 个展位</span>
          </div>
          <div class="row mt-6" style="gap:6px;align-items:flex-start">
            <div v-for="z in zones" :key="z.key" style="flex:1;min-width:0">
              <div class="row between" style="font-size:11px">
                <b>{{ z.name }}</b><span class="muted">{{ zoneDone(z.key) }}/{{ z.count }}</span>
              </div>
              <div class="bar"><i :style="{ width: Math.min(100, (zoneDone(z.key) / z.need) * 100) + '%' }" /></div>
              <div style="font-size:10px;color:var(--brown);margin-top:3px;line-height:1.3">
                {{ z.region }}<span v-if="!z.confirmed" class="muted">（推测）</span>
                <span :style="{ color: zoneDone(z.key) >= z.need ? 'var(--green-dark)' : 'var(--muted)' }"> · 开图 {{ Math.min(zoneDone(z.key), z.need) }}/{{ z.need }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-show="openRules">
          <ul class="dot-list mt-10">
            <li v-for="(s, i) in mainline.steps" :key="i">{{ s }}</li>
          </ul>
          <div class="row wrap mt-6">
            <span v-for="r in mainline.regions" :key="r.name" class="pill warm">{{ r.name }} · 打卡 {{ r.need }} 个 IP</span>
          </div>
          <div class="hr" />
          <div v-for="t in mainline.tips" :key="t" class="small" style="color:var(--brown)">💡 {{ t }}</div>
          <div class="hr" />
          <div class="pcard-title" style="font-size:15px">🎈 {{ eggs.title }}</div>
          <div v-for="e in eggs.items" :key="e.name" class="mt-6 small">
            <b>{{ e.name }}</b>
            <div>{{ e.desc }}</div>
            <div class="muted">*{{ e.note }}</div>
          </div>
          <div class="hr" />
          <div v-for="p in places" :key="p.key" class="mt-6 small">
            <span class="tag text" :class="p.key === 'night' ? 'blue' : p.key === 'camp' ? 'green' : ''">{{ p.tag }}</span>
            <b style="margin-left:6px">{{ p.name }}</b>
            <div class="mt-6">{{ p.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 场馆平面图占位 -->
    <div class="pcard dark mt-14">
      <div class="pcard-body row between">
        <div>
          <div class="pcard-title" style="font-size:15px">🗺 场馆平面图</div>
          <div class="small" style="color:#c9c8ea">官方尚未公布，公布后将在此处展示区域 / 展位分布</div>
        </div>
        <span class="tag gray">LOADING</span>
      </div>
    </div>

    <!-- 展位列表 -->
    <div class="mt-14">
      <div class="row between mb-6">
        <span class="sticker">IP 展位一览</span>
        <span class="small" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">点击展位查看展台活动 / 任务 / 奖励</span>
      </div>
      <input v-model.trim="q" class="search" placeholder="搜索 IP 名 / 编号，如 星布谷地、A06" />
      <div class="chips mt-10">
        <button class="chip" :class="{ on: zone === 'ALL' }" @click="zone = 'ALL'">全部<small>{{ booths.length }}</small></button>
        <button v-for="z in zones" :key="z.key" class="chip" :class="{ on: zone === z.key }" @click="zone = z.key">
          {{ z.name }}<small>{{ z.region }}{{ z.confirmed ? '' : '?' }} · {{ z.count }} IP</small>
        </button>
        <button class="chip" :class="{ on: zone === 'DETAIL' }" @click="zone = 'DETAIL'">有攻略<small>{{ detailCount }}</small></button>
        <button class="chip" :class="{ on: zone === 'DONE' }" @click="zone = 'DONE'">已打卡<small>{{ count }}</small></button>
      </div>

      <div class="pcard mt-6">
        <template v-if="list.length">
          <div v-for="b in list" :key="b.id" class="booth" :class="{ done: isChecked(b.id) }" @click="go(b)">
            <span class="tag no">{{ b.no }}</span>
            <div class="body">
              <div class="ip">
                {{ b.ip }}
                <span v-if="hasDetail(b.id)" class="tag green text" style="font-size:10px;padding:2px 5px">攻略</span>
                <span v-if="isChecked(b.id)" class="tag yellow text" style="font-size:10px;padding:2px 5px">已打卡</span>
              </div>
              <div class="blurb">{{ b.blurb }}</div>
            </div>
            <button class="star" :class="{ off: !isChecked(b.id) }" @click.stop="toggle(b.id)" :aria-label="isChecked(b.id) ? '取消打卡' : '标记打卡'">★</button>
          </div>
        </template>
        <div v-else class="empty">没有匹配的展位</div>
      </div>
      <div class="small mt-10" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">
        * 展位编号以官方「IP 展位一览」为准；★ 可标记已完成任务 / 已领 PIN，仅保存在本机。
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'BoothsPage' }
</script>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { booths, zones } from '../data/booths.js'
import boothDetails from '../data/boothDetails.js'
import { event, mainline, eggs, places, dailySchedule } from '../data/rules.js'
import { useChecked } from '../composables/useStore.js'

const router = useRouter()
const { isChecked, toggle, count, checked } = useChecked()
const q = ref('')
const zone = ref('ALL')
const openRules = ref(false)

const hasDetail = (id) => !!boothDetails[id]
const detailCount = Object.keys(boothDetails).length
const zoneDone = (z) => booths.filter((b) => b.zone === z && checked.value.has(b.id)).length

const list = computed(() => {
  let arr = booths
  if (zone.value === 'DETAIL') arr = arr.filter((b) => hasDetail(b.id))
  else if (zone.value === 'DONE') arr = arr.filter((b) => isChecked(b.id))
  else if (zone.value !== 'ALL') arr = arr.filter((b) => b.zone === zone.value)
  const k = q.value.toLowerCase()
  if (k) {
    arr = arr.filter((b) =>
      b.ip.toLowerCase().includes(k) ||
      b.no.toLowerCase().replace(/\s/g, '').includes(k.replace(/\s|-/g, '')) ||
      (b.alias || '').toLowerCase().includes(k) ||
      b.blurb.includes(k),
    )
  }
  return arr
})

function go(b) {
  router.push({ name: 'booth', params: { id: b.id } })
}
</script>
