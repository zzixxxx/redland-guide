<template>
  <div class="page">
    <PageHeader title="冒险者攻略" :sub="`${event.dateText} · 复兴岛船台 PARK`" :venue="venueNav">
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
              <div class="bar"><i :style="{ width: Math.min(100, (zoneDone(z.key) / z.need) * 100) + '%', background: z.color }" /></div>
              <div style="font-size:10px;color:var(--brown);margin-top:3px;line-height:1.3">
                {{ z.region }}
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
            <span v-for="r in mainline.regions" :key="r.name" class="pill warm">
              <i :style="{ display: 'inline-block', width: '9px', height: '9px', background: r.color, border: '1px solid #5a3e2b', marginRight: '4px', verticalAlign: '-1px' }" />
              {{ r.name }}（{{ r.zone }} 区）· {{ r.pin }} × {{ r.need }} → 冒险者拼图
            </span>
            <span class="pill hot">
              <i :style="{ display: 'inline-block', width: '9px', height: '9px', background: mainline.nightPin.color, border: '1px solid #5a3e2b', marginRight: '4px', verticalAlign: '-1px' }" />
              {{ mainline.nightPin.name }} · 夜间发放
            </span>
          </div>
          <div class="small mt-6" style="color:var(--brown)">🌙 {{ mainline.nightPin.desc }}</div>
          <div class="hr" />
          <div v-for="t in mainline.tips" :key="t" class="small" style="color:var(--brown)">💡 {{ t }}</div>
          <div class="mt-10" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <img v-for="(im, i) in mainline.images" :key="im.src" :src="base + im.src" :alt="im.alt" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs(mainlineImages, i)" />
          </div>
          <div class="small muted mt-6">图源：{{ mainline.source.author }}「{{ mainline.source.title }}」{{ mainline.source.publishedAt }} · <a :href="mainline.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a></div>
          <div class="hr" />
          <div class="pcard-title" style="font-size:15px">🎈 {{ eggs.title }}</div>
          <div v-for="e in eggs.items" :key="e.name" class="mt-6 small">
            <b>{{ e.name }}</b>
            <div>{{ e.desc }}</div>
            <div v-if="e.pins" class="row wrap mt-6">
              <span v-for="p in e.pins" :key="p" class="pill hot">{{ p }}</span>
            </div>
            <div class="muted">*{{ e.note }}</div>
            <div v-if="e.image || e.images" class="mt-6" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
              <img v-for="(im, i) in (e.images || [e.image])" :key="im" :src="base + im" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs((e.images || [e.image]).map((x) => base + x), i)" />
            </div>
          </div>
          <div class="small muted mt-6">图源：{{ eggs.source.author }}「{{ eggs.source.title }}」{{ eggs.source.publishedAt }} · <a :href="eggs.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a></div>
          <div class="hr" />
          <div v-for="p in places" :key="p.key" class="mt-6 small">
            <span class="tag text" :class="p.key === 'night' ? 'blue' : p.key === 'camp' ? 'green' : ''">{{ p.tag }}</span>
            <b style="margin-left:6px">{{ p.name }}</b>
            <div class="mt-6">{{ p.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 场馆平面图：2026 官方未公布，先放 2025 年参考图 -->
    <div class="pcard dark mt-14">
      <div class="pcard-body">
        <div class="row between">
          <div>
            <div class="pcard-title" style="font-size:15px">🗺 场馆平面图</div>
            <div class="small" style="color:#c9c8ea">2026 官方平面图尚未公布，公布后在此展示区域 / 展位分布</div>
          </div>
          <span class="tag gray" style="flex:none">LOADING</span>
        </div>
        <div class="hr" style="border-color:#4a4980" />
        <div class="row between">
          <button class="tag yellow text btn" @click="openMap = !openMap">🗺 {{ venueMapRef.title }} {{ openMap ? '▴' : '▾' }}</button>
          <span class="small" style="color:#a9a8cc;flex:none">交通要点 · {{ venueMapRef.images.length }} 张图</span>
        </div>
        <div v-if="openMap">
          <div class="small mt-6" style="color:#c9c8ea">{{ venueMapRef.warn }}</div>
          <button class="linkbtn small mt-10" style="color:#ffe27a;font-weight:700;text-decoration:none" @click="openTips = !openTips">🚇 2025 交通要点（{{ venueMapRef.tips.length }} 条）{{ openTips ? '▴' : '▾' }}</button>
          <ul v-if="openTips" class="dot-list small mt-6" style="color:#e8e7ff;background:#1c1b40;border:2px dashed #4a4980;padding:8px 10px 8px 22px">
            <li v-for="t in venueMapRef.tips" :key="t">{{ t }}</li>
          </ul>
          <div class="small mt-10" style="color:#ffe27a;font-weight:700">🗺 2025 场地图（点击放大，左右滑动翻页）</div>
          <div class="gallery mt-6">
            <img v-for="(m, i) in venueMapRef.images" :key="m.src" :src="base + m.src" :alt="m.alt" :title="m.alt" loading="lazy" @click="openImgs(mapImages, i)" />
          </div>
        </div>
        <div class="small mt-6" style="color:#a9a8cc">
          来源：网友 @{{ venueMapRef.source.author }} 整理 · {{ venueMapRef.source.publishedAt }}（非官方）
          <a :href="venueMapRef.source.url" target="_blank" rel="noopener" style="color:#ffe27a">原笔记</a>
        </div>
      </div>
    </div>

    <!-- 展位列表 -->
    <div class="mt-14">
      <div class="row between mb-6">
        <span class="sticker">IP 展位一览</span>
        <span class="small" style="color:#fff;text-shadow:1px 1px 0 var(--navy);text-align:right">点击展位看活动 / 任务 / 奖励<br />📕 跳转该 IP 小红书主页</span>
      </div>
      <input v-model.trim="q" class="search" placeholder="搜索 IP 名 / 编号，如 星布谷地、A06" />
      <div class="chips mt-10">
        <button class="chip" :class="{ on: zone === 'ALL' }" @click="zone = 'ALL'">全部<small>{{ booths.length }}</small></button>
        <button v-for="z in zones" :key="z.key" class="chip" :class="{ on: zone === z.key }" @click="zone = z.key">
          {{ z.name }}<small>{{ z.region }}（{{ z.count }}）</small>
        </button>
        <button class="chip" :class="{ on: zone === 'DETAIL' }" @click="zone = 'DETAIL'">有攻略<small>{{ detailCount }}</small></button>
        <button class="chip" :class="{ on: zone === 'DONE' }" @click="zone = 'DONE'">已打卡<small>{{ count }}</small></button>
      </div>

      <div class="pcard mt-6">
        <template v-if="list.length">
          <div v-for="b in list" :key="b.id" class="booth" :class="{ done: isChecked(b.id) }" @click="go(b)">
            <!-- 展位号；「B02 / B17」这类共用编号拆成上下两个标签，保证 IP 名与其他行对齐 -->
            <div class="no-col">
              <span v-for="n in b.no.split(/\s*\/\s*/)" :key="n" class="tag no">{{ n }}</span>
            </div>
            <div class="body">
              <div class="ip">
                {{ b.ip }}
                <span v-if="hasDetail(b.id)" class="tag green text" style="font-size:10px;padding:2px 5px">攻略</span>
                <span v-if="isChecked(b.id)" class="tag yellow text" style="font-size:10px;padding:2px 5px">已打卡</span>
              </div>
              <div class="blurb">{{ b.blurb }}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;flex:0 0 auto">
              <button class="star" :class="{ off: !isChecked(b.id) }" @click.stop="toggle(b.id)" :aria-label="isChecked(b.id) ? '取消打卡' : '标记打卡'">★</button>
              <a v-if="b.xhs" class="star xhs" :href="profileUrl(b.xhs.uid)" target="_blank" rel="noopener" @click.stop="openProfile($event, b.xhs.uid)" :title="`小红书 @${b.xhs.name}`">📕</a>
            </div>
          </div>
        </template>
        <div v-else class="empty">没有匹配的展位</div>
      </div>
      <div class="small mt-10" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">
        * 展位编号以官方「IP 展位一览」为准；★ 可标记已完成任务 / 已领 PIN，仅保存在本机。
      </div>
    </div>

    <!-- 无固定展位、场内自由游荡的 IP -->
    <div v-if="roaming.length" class="mt-14">
      <div class="row between mb-6">
        <span class="sticker">自由游荡的 IP</span>
        <span class="small" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">无固定展位 · 场内分发物料</span>
      </div>
      <div v-for="r in roaming" :key="r.id" class="pcard sand">
        <div class="pcard-body">
          <div class="row between">
            <div>
              <div class="pcard-title" style="font-size:15px">{{ r.name }}</div>
              <div class="small muted">{{ r.chars }}</div>
            </div>
            <span class="tag blue text" style="flex:none">{{ r.dateText }}</span>
          </div>
          <div class="row mt-10" style="gap:10px;align-items:flex-start">
            <img :src="base + r.image" :alt="r.name" loading="lazy" style="width:96px;flex:none;border:2px solid var(--navy);border-radius:2px" @click="openImgs([base + r.image], 0)" />
            <div style="flex:1;min-width:0">
              <div class="small">{{ r.where }}</div>
              <div class="row wrap mt-6" style="gap:0">
                <span v-for="it in r.items" :key="it.name" class="pill" :class="{ warm: /读者|关注/.test(it.how) }">{{ it.name }} · {{ it.how }}</span>
              </div>
              <div v-if="r.note" class="small muted mt-6">* {{ r.note }}</div>
            </div>
          </div>
          <div class="row mt-10" style="gap:8px">
            <a v-if="r.xhs" class="pbtn sm" :href="profileUrl(r.xhs.uid)" target="_blank" rel="noopener" @click="openProfile($event, r.xhs.uid)">📕 @{{ r.xhs.name }}</a>
            <a class="pbtn sm ghost" :href="r.source.url" target="_blank" rel="noopener">原笔记 · {{ r.source.publishedAt }}</a>
          </div>
        </div>
      </div>
    </div>

    <Lightbox :items="lb.items" v-model:index="lb.i" />
  </div>
</template>

<script>
export default { name: 'BoothsPage' }
</script>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import Lightbox from '../components/Lightbox.vue'
import { booths, zones } from '../data/booths.js'
import boothDetails from '../data/boothDetails.js'
import { event, venueNav, mainline, eggs, places, dailySchedule, venueMapRef } from '../data/rules.js'
import { roaming } from '../data/roaming.js'
import { useChecked } from '../composables/useStore.js'
import { profileUrl, openProfile } from '../utils/xhs.js'

const router = useRouter()
const { isChecked, toggle, count, checked } = useChecked()
const q = ref('')
const zone = ref('ALL')
const openRules = ref(false)
const openMap = ref(false)
const openTips = ref(false)
const base = import.meta.env.BASE_URL
// 多图灯箱：items 为 { src, caption } 或路径，左右滑动翻页
const lb = reactive({ items: [], i: null })
const openImgs = (items, i) => {
  lb.items = items
  lb.i = i
}
const mainlineImages = mainline.images.map((im) => ({ src: base + im.src, caption: im.alt }))
const mapImages = venueMapRef.images.map((m) => ({ src: base + m.src, caption: m.alt }))

const hasDetail = (id) => !!boothDetails[id]
// 搜索附加关键词：主账号昵称 + 详情里各 IP 官方账号 / 其他官方笔记作者（多 IP 共用展位时能搜到子 IP，如搜「魔兽」「炉石」出暴雪游戏，搜「假面骑士」出 SCLA）
const extraKeys = Object.fromEntries(
  booths.map((b) => {
    const d = boothDetails[b.id]
    const parts = [b.xhs?.name, ...(d?.accounts || []).map((a) => a.name), ...(d?.moreSources || []).map((m) => m.author)]
    return [b.id, parts.filter(Boolean).join(' ').toLowerCase()]
  }),
)
const searchExtra = (b) => extraKeys[b.id] || ''
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
      searchExtra(b).includes(k) ||
      b.blurb.includes(k),
    )
  }
  return arr
})

function go(b) {
  router.push({ name: 'booth', params: { id: b.id } })
}
</script>
