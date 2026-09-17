<template>
  <div class="page" v-if="booth">
    <PageHeader :title="booth.ip" :sub="`${booth.zone} 区 · 展位 ${booth.no}`" back>
      <template #right>
        <button v-if="onMap" class="pbtn sm" :class="inPlan(id) ? 'red' : 'ghost'" @click="togglePlan(id)">
          {{ inPlan(id) ? '✓ 在清单' : '＋ 加清单' }}
        </button>
        <button class="pbtn sm" :class="isChecked(booth.id) ? 'red' : 'ghost'" @click="toggle(booth.id)">
          {{ isChecked(booth.id) ? '★ 已打卡' : '☆ 打卡' }}
        </button>
      </template>
    </PageHeader>

    <!-- 官方一句话 -->
    <div class="pcard sand">
      <div class="pcard-body">
        <div class="row wrap">
          <span class="tag">{{ booth.no }}</span>
          <!-- 页头已写「A 区 · 展位 A06」，这里带上区域名才不重复（用户 9/17） -->
          <span class="tag blue text">{{ booth.zone }} 区 · {{ regionName }}</span>
          <span v-if="detail" class="tag green text">已收录</span>
        </div>
        <div class="mt-10" style="font-size:15px;color:var(--brown);font-weight:700">{{ booth.blurb }}</div>
        <div class="small muted mt-6">—— 官方「IP 展位一览」</div>
        <div class="row wrap mt-10" style="gap:8px">
          <!-- 在官方平面图上画出从登岛起点到这个展位的路线（用户 9/17） -->
          <button v-if="mapNo" type="button" class="pbtn sm" :title="`在平面图上导航到 ${mapNo}`" @click="navOnMap()">🧭 导航</button>
          <a v-if="booth.xhs" class="pbtn sm red" :href="profileUrl(booth.xhs.uid)" target="_blank" rel="noopener" @click="openProfile($event, booth.xhs.uid)">📕 小红书主页 @{{ booth.xhs.name }}</a>
          <a class="pbtn sm ghost" :href="searchUrl(keyword)" target="_blank" rel="noopener" @click="openSearch($event, keyword)">🔍 搜「{{ booth.ip }} RED LAND」</a>
        </div>
        <!-- 这个 IP 在月光舞台节目单 / 头号花车名单 / 专属花车里出现过：一键跳过去并定位到那一条（用户 9/17） -->
        <div v-if="crossLinks.length" class="mt-10">
          <div class="small muted">这个 IP 还出现在</div>
          <div class="row wrap mt-6" style="gap:6px">
            <router-link v-for="l in crossLinks" :key="l.key" class="pbtn sm ghost" :to="l.to">{{ l.label }}</router-link>
          </div>
        </div>
        <div v-if="extraAccounts.length" class="mt-10">
          <div class="small muted">各 IP 官方账号</div>
          <div class="row wrap mt-6" style="gap:6px">
            <a v-for="a in extraAccounts" :key="a.uid" class="pbtn sm ghost" :href="profileUrl(a.uid)" target="_blank" rel="noopener" @click="openProfile($event, a.uid)">📕 {{ a.name }}</a>
          </div>
        </div>
        <div v-if="!booth.xhs" class="small muted mt-6">尚未记录该 IP 的小红书官方账号，抓到其展台笔记后会补上主页入口。</div>
        <div v-else-if="mobile" class="small muted mt-6">手机端点主页 / 搜索按钮会先询问是否打开小红书 App，在 App 内直接看主页、搜结果可跳过网页验证。</div>
      </div>
    </div>

    <template v-if="detail">
      <!-- 展会信息 -->
      <div class="pcard mt-14">
        <div class="pcard-body">
          <div class="pcard-title">📌 展会信息</div>
          <div class="mt-6">{{ detail.intro }}</div>
          <div class="row wrap mt-6">
            <span class="pill">⏰ {{ event.dateText }}</span>
            <span v-if="detail.hours" class="pill hot">🕒 {{ detail.hours }}</span>
            <span class="pill warm">📍 展位号 {{ detail.boothNo }}</span>
            <span v-if="regionText" class="pill">{{ regionText }}</span>
          </div>
          <div v-if="detail.notes?.length" class="mt-6">
            <div v-for="n in detail.notes" :key="n" class="small muted">* {{ n }}</div>
          </div>
        </div>
      </div>

      <!-- 展台活动 -->
      <div v-if="detail.activities?.length" class="pcard mt-14">
        <div class="pcard-body">
          <!-- 标题行整行可点：右上角三角收起 / 展开整张卡的内容，默认展开 -->
          <div class="fold-head" @click="openAct = !openAct">
            <div class="pcard-title">🎪 展台活动</div>
            <span class="fold-arrow" :class="{ open: openAct }">&gt;</span>
          </div>
          <!-- 多 IP 共用展位（如阅文）：条目带 ip 字段时按 IP 分组，点组名展开 -->
          <template v-for="g in openAct ? actGroups : []" :key="g.ip || '_'">
            <button v-if="g.ip" class="linkbtn ipgroup" @click="toggleGroup('a:' + g.ip)">
              {{ isGroupOpen('a:' + g.ip) ? '▾' : '▸' }} {{ g.ip }} <span class="small muted">{{ g.items.length }} 项</span>
            </button>
            <template v-if="!g.ip || isGroupOpen('a:' + g.ip)">
              <div v-for="(a, i) in g.items" :key="i" class="mt-10">
                <div class="row wrap">
                  <b style="font-size:15px;color:var(--brown)">{{ a.title }}</b>
                  <span v-if="a.needBooking" class="tag yellow text" style="font-size:10px;padding:2px 6px">需预约</span>
                </div>
                <div v-if="a.desc" class="small mt-6">{{ a.desc }}</div>
                <StepList v-if="a.items?.length" :items="a.items" :ordered="a.ordered !== false" :ip="booth.ip" />
                <div v-if="a.partner" class="small muted">合作伙伴：{{ a.partner }}</div>
                <div v-if="a.note" class="small muted mt-4">* {{ a.note }}</div>
                <div v-if="a.follow?.length" class="row wrap mt-4">
                  <a v-for="f in a.follow" :key="f.uid || f.name" class="tag text btn follow" :href="f.uid ? profileUrl(f.uid) : undefined" :target="f.uid ? '_blank' : undefined" rel="noopener" @click="f.uid && openProfile($event, f.uid)">📕 关注 {{ f.name }}<i v-if="!f.uid">（{{ f.via || '微信公众号' }}）</i></a>
                </div>
                <div v-if="a.rewards?.length" class="row wrap">
                  <span v-for="r in a.rewards" :key="r" class="pill warm">🎁 {{ r }}</span>
                </div>
                <div v-if="i < g.items.length - 1" class="hr" />
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- 摊位名单（集市型展位） -->
      <div v-if="detail.stalls?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="row between">
            <div class="pcard-title">🛍 摊位名单</div>
            <span class="tag yellow text" style="font-size:10px;padding:2px 6px">{{ detail.stalls.length }} 个 IP</span>
          </div>
          <div class="row wrap mt-6">
            <span v-for="s in detail.stalls" :key="s.name" class="pill" :class="{ warm: s.featured, hot: s.note }">
              {{ s.name }}<template v-if="s.note">（{{ s.note }}）</template>
            </span>
          </div>
          <div v-if="detail.stallsNote" class="small muted mt-6">* {{ detail.stallsNote }}</div>
        </div>
      </div>

      <!-- 菜单 / 售卖品（餐车型展位） -->
      <div v-if="detail.menu?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="pcard-title">🍱 菜单</div>
          <div v-for="m in detail.menu" :key="m.name" class="row between small" style="padding:6px 0;border-top:1.5px dashed #eadfc4">
            <span><b>{{ m.name }}</b><span v-if="m.note" class="muted" style="margin-left:6px">{{ m.note }}</span></span>
            <span class="tag yellow" style="font-size:9px">{{ m.price }}</span>
          </div>
          <div v-if="detail.menuNote" class="small muted mt-6">* {{ detail.menuNote }}</div>
        </div>
      </div>

      <!-- 舞台活动 -->
      <div v-if="stageView.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="fold-head" @click="openStage = !openStage">
            <div class="pcard-title">🎤 舞台活动</div>
            <span class="fold-arrow" :class="{ open: openStage }">&gt;</span>
          </div>
          <div v-for="(s, i) in openStage ? stageView : []" :key="i" class="mt-10">
            <b style="font-size:15px;color:var(--brown)">{{ s.title }}</b>
            <div v-if="s.desc" class="small mt-6">{{ s.desc }}</div>
            <div v-if="s.schedule?.length" class="mt-6">
              <div v-for="g in s.schedule" :key="g.day" class="row small" style="padding:4px 0;border-top:1.5px dashed #eadfc4;align-items:flex-start">
                <span class="tag blue" style="font-size:9px;flex:none;margin-top:4px">{{ g.day }}</span>
                <div style="flex:1;min-width:0">
                  <!-- 排了 times 的场次（场次多的展台，如宝可梦）：时段胶囊并在同一行，出席名单用黑色小字顿号分隔 -->
                  <template v-if="g.times?.length">
                    <div class="row wrap" style="gap:0">
                      <span v-for="t in g.times" :key="t" class="pill">{{ t }}</span>
                    </div>
                    <div v-if="g.guests?.length" class="sched-guests">{{ g.guests.join('、') }}</div>
                  </template>
                  <!-- 其余保持原样：嘉宾胶囊，带时间前缀时按整点时段分行（17:00 与 17:30 同一行） -->
                  <template v-else>
                    <div v-for="(names, ri) in g.rows" :key="ri" class="row wrap" style="gap:0">
                      <span v-for="name in names" :key="name" class="pill" :class="pillCls(name)">{{ name }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div v-if="i < stageView.length - 1" class="hr" />
          </div>
        </div>
      </div>

      <!-- 展台任务 -->
      <div v-if="detail.tasks?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="fold-head" @click="openTask = !openTask">
            <div class="pcard-title">✅ 展台任务</div>
            <span class="fold-arrow" :class="{ open: openTask }">&gt;</span>
          </div>
          <template v-for="g in openTask ? taskGroups : []" :key="g.ip || '_'">
            <button v-if="g.ip" class="linkbtn ipgroup" @click="toggleGroup('t:' + g.ip)">
              {{ isGroupOpen('t:' + g.ip) ? '▾' : '▸' }} {{ g.ip }} <span class="small muted">{{ g.items.length }} 项</span>
            </button>
            <template v-if="!g.ip || isGroupOpen('t:' + g.ip)">
              <div v-for="(t, i) in g.items" :key="i" class="mt-10">
                <b style="font-size:15px;color:var(--brown)">{{ t.title }}</b>
                <div v-if="t.desc" class="small mt-6">{{ t.desc }}</div>
                <StepList v-if="t.items?.length" :items="t.items" :ordered="t.ordered !== false" :ip="booth.ip" />
                <div v-if="t.tags?.length" class="row wrap">
                  <span v-for="tg in t.tags" :key="tg" class="pill hot">{{ tg }}</span>
                </div>
                <div v-if="t.note" class="small muted mt-4">* {{ t.note }}</div>
                <div v-if="t.follow?.length" class="row wrap mt-4">
                  <a v-for="f in t.follow" :key="f.uid || f.name" class="tag text btn follow" :href="f.uid ? profileUrl(f.uid) : undefined" :target="f.uid ? '_blank' : undefined" rel="noopener" @click="f.uid && openProfile($event, f.uid)">📕 关注 {{ f.name }}<i v-if="!f.uid">（{{ f.via || '微信公众号' }}）</i></a>
                </div>
                <div v-if="t.rewards?.length" class="row wrap">
                  <span v-for="r in t.rewards" :key="r" class="pill warm">🎁 {{ r }}</span>
                </div>
                <PostCopyBtn v-if="t.tags?.length || t.post" :ip="booth.ip" :tags="t.tags || []" :post="t.post" :min-chars="t.minChars" />
                <div v-if="i < g.items.length - 1" class="hr" />
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- 奖励一览 -->
      <div v-if="detail.rewards?.length" class="pcard sand mt-14">
        <div class="pcard-body">
          <div class="row between">
            <div class="pcard-title">🎁 展台奖励一览</div>
            <span v-if="detail.rewards.some((r) => r.pin && pinsFor(r).length)" class="small muted">点 PIN 标签看预览图</span>
          </div>
          <div v-for="r in detail.rewards" :key="r.name" class="row between small" style="padding:6px 0;border-top:1.5px dashed #eadfc4">
            <span>
              <b>{{ r.name }}</b>
              <button v-if="r.pin && pinsFor(r).length" class="tag text btn" style="font-size:10px;padding:1px 5px;margin-left:4px" @click="showPins(r)">PIN</button>
              <span v-else-if="r.pin" class="tag text" style="font-size:10px;padding:1px 5px;margin-left:4px">PIN</span>
            </span>
            <span class="muted" style="text-align:right;flex:0 0 45%">{{ r.how }}</span>
          </div>
          <div v-if="detail.footnote" class="small muted mt-6">* {{ detail.footnote }}</div>
        </div>
      </div>

      <!-- 原图 -->
      <div v-if="detail.images?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="row between">
            <div class="pcard-title">🖼 官方笔记原图</div>
            <span class="small muted">点击放大 · 左右滑动翻页</span>
          </div>
          <div class="gallery mt-10">
            <img v-for="(img, i) in detail.images" :key="imgSrc(img)" :src="imgSrc(img)" :alt="imgCap(img)" :title="imgCap(img)" loading="lazy" @click="openImgs(noteImages, i)" />
          </div>
        </div>
      </div>

      <!-- 来源 -->
      <div class="pcard mt-14">
        <div class="pcard-body">
          <div class="small muted">来源：{{ detail.source.author }} · {{ detail.source.publishedAt }}</div>
          <div class="small mt-6"><b>{{ detail.source.title }}</b></div>
          <a class="pbtn red block mt-10" :href="detail.source.url" target="_blank" rel="noopener">去小红书看原笔记</a>
          <template v-if="detail.moreSources?.length">
            <div class="small muted mt-10">同展位其他官方笔记</div>
            <a v-for="m in detail.moreSources" :key="m.url" class="pbtn block mt-6" :href="m.url" target="_blank" rel="noopener">{{ m.author }} · {{ m.title }}</a>
          </template>
        </div>
      </div>
    </template>

    <!-- 独立游戏名单（C04）：数据 src/data/indie.js，每款可选 xhs（📕 跳小红书）/ url（攻略链接） -->
    <div v-if="booth.id === 'C04'" class="pcard mt-14">
      <div class="pcard-body">
        <div class="row between">
          <div class="pcard-title">🕹 独立游戏试玩名单</div>
          <span class="tag yellow text" style="font-size:10px;padding:2px 6px">{{ indieCount }} 款</span>
        </div>
        <div class="small muted mt-6">近百款独立游戏集中上桌，欢迎登岛品鉴；官方按首字母缩写排列（官方页 {{ indieSource.lastEditTime.slice(0, 10) }} 更新）</div>
        <div v-for="g in indieGames" :key="g.letter" class="mt-10">
          <span class="tag blue" style="font-size:10px">{{ g.letter }}</span>
          <div class="row wrap mt-6" style="gap:0">
            <template v-for="n in g.games" :key="n.name">
              <a v-if="n.xhs" class="pill" :href="profileUrl(n.xhs.uid)" target="_blank" rel="noopener" @click="openProfile($event, n.xhs.uid)">📕 {{ n.name }}</a>
              <a v-else-if="n.url" class="pill warm" :href="n.url" target="_blank" rel="noopener">{{ n.name }} ↗</a>
              <span v-else class="pill">{{ n.name }}<span v-if="n.en" class="muted"> / {{ n.en }}</span></span>
            </template>
          </div>
        </div>
        <div class="small muted mt-10">来源：{{ indieSource.author }}「{{ indieSource.title }}」</div>
        <a class="pbtn sm ghost mt-6" :href="indieSource.url" target="_blank" rel="noopener">去小红书看官方独立游戏聚合页</a>
      </div>
    </div>

    <!-- 无详情 -->
    <div v-if="!detail" class="pcard mt-14">
      <div class="pcard-body">
        <div class="pcard-title">📝 展台详情待补充</div>
        <div class="small mt-6">该 IP 官方账号发布「展台活动详情」笔记后会同步到这里。可先用上方按钮去小红书主页 / 搜索核对最新动态，搜索关键词：</div>
        <div class="pill warm mt-6" style="display:block;word-break:break-all">{{ keyword }}</div>
        <div class="row mt-10">
          <button class="pbtn sm ghost" @click="copy">复制关键词</button>
        </div>
        <div v-if="copied" class="small mt-6" style="color:var(--green-dark)">已复制</div>
      </div>
    </div>

    <Lightbox :items="lb.items" v-model:index="lb.i" :nav-to="lb.navTo" @open="goBooth" />
  </div>
  <div v-else class="page">
    <PageHeader title="未找到展位" back />
    <div class="pcard"><div class="empty">没有这个展位编号</div></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import Lightbox from '../components/Lightbox.vue'
import StepList from '../components/StepList.vue'
import PostCopyBtn from '../components/PostCopyBtn.vue'
import { boothMap, zones } from '../data/booths.js'
import boothDetails from '../data/boothDetails.js'
import { indieGames, indieSource, indieCount } from '../data/indie.js'
import { event, venueMap } from '../data/rules.js'
import { stageDays } from '../data/stage.js'
import { paradeDays, themeFloats } from '../data/parade.js'
import { ipRefersTo } from '../utils/ipMatch.js'
import { pins, zoneThumbs } from '../data/pins.js'
import { mapSpots, mapSpotList } from '../data/mapSpots.js'
import { useChecked, usePlan } from '../composables/useStore.js'
import { profileUrl, searchUrl, boothSearchKeyword, openProfile, openSearch, isMobile } from '../utils/xhs.js'

const props = defineProps({ id: String })
const booth = computed(() => boothMap[props.id])
const detail = computed(() => boothDetails[props.id])
const { isChecked, toggle } = useChecked()
const { inPlan, togglePlan } = usePlan()
const router = useRouter()
const regionName = computed(() => zones.find((z) => z.key === booth.value?.zone)?.region || '')
// 月光舞台 / 头号花车按日各一颗按钮，专属花车一颗；目标页读 query 切 DAY / tab 并滚到那一条（utils/ipMatch.js 对名字）
const crossLinks = computed(() => {
  const b = booth.value
  if (!b) return []
  const out = []
  for (const d of stageDays) {
    if (d.items.some((it) => it.ip && ipRefersTo(it.ip, b))) out.push({ key: 's' + d.day, label: `🎤 月光舞台 DAY${d.day}`, to: { path: '/stage', query: { day: d.day, booth: b.id } } })
  }
  for (const d of paradeDays) {
    if (d.entries.some((e) => ipRefersTo(e.ip, b))) out.push({ key: 'p' + d.day, label: `🎏 头号花车 DAY${d.day}`, to: { path: '/parade', query: { tab: 'head', day: d.day, booth: b.id } } })
  }
  if (themeFloats.some((f) => ipRefersTo([f.ip, ...(f.ips || [])].join(' / '), b))) out.push({ key: 'f', label: '🚗 专属花车', to: { path: '/parade', query: { tab: 'theme', booth: b.id } } })
  return out
})
// 这个展位在平面图上的展位号：id 去掉 a/b/c 后缀（A25a → A25），再退回官方展位号原文里的各段（B02 / B17）；
// 图上没有热区的展位（待解锁 / 游荡）拿不到，就不给「加清单」「导航」按钮
const mapNo = computed(() => {
  if (!booth.value) return null
  const cands = [props.id.replace(/[a-z]$/, ''), ...String(booth.value.no || '').split('/').map((s) => s.trim())]
  return cands.find((no) => mapSpots[no]) || null
})
const onMap = computed(() => !!mapNo.value)
const base = import.meta.env.BASE_URL
const mobile = isMobile()
const copied = ref(false)

// 展台活动 / 舞台活动 / 展台任务的收起展开（默认展开；换展位时复位）
const openAct = ref(true)
const openStage = ref(true)
const openTask = ref(true)
watch(
  () => props.id,
  () => {
    openAct.value = true
    openStage.value = true
    openTask.value = true
  },
)

const keyword = computed(() => (booth.value ? boothSearchKeyword(booth.value) : ''))
// 多 IP 共用展位的其他官方账号（去掉与 booth.xhs 重复的主账号）
const extraAccounts = computed(() => (detail.value?.accounts || []).filter((a) => a.uid !== booth.value?.xhs?.uid))

// ---- 灯箱：笔记原图 / PIN 预览 / 平面图导航共用 ----
const lb = reactive({ items: [], i: null, navTo: null })
const openImgs = (items, i, navTo = null) => {
  lb.navTo = navTo
  lb.items = items
  lb.i = i
}
// 官方平面图三切片（与首页同一套），P2 带热区；「导航」打开 P2 并让灯箱自动画起点 → 本展位的路线
const mapSlices = venueMap.slices.map((m) => ({
  src: base + m.src,
  caption: m.alt,
  full: m.full ? base + m.full : undefined,
  spots: m.spots ? mapSpotList : undefined,
  fitH: m.fitH,
}))
const MAP_P2 = venueMap.slices.findIndex((m) => m.spots)
const navOnMap = () => mapNo.value && openImgs(mapSlices, MAP_P2, mapNo.value)
// 灯箱气泡里点了别的 IP：关灯箱、换到那个展位的攻略
function goBooth(id) {
  lb.i = null
  if (id && id !== props.id) router.push(`/booth/${id}`)
}
// images 每项可以是路径字符串，或 { src, caption }（阅文拼接长图带子页说明）
const imgSrc = (x) => base + (typeof x === 'string' ? x : x.src)
const imgCap = (x) => (typeof x === 'string' ? '' : x.caption || '')
const noteImages = computed(() => (detail.value?.images || []).map((x) => ({ src: imgSrc(x), caption: imgCap(x) })))

// ---- 奖励里的 PIN 预览：优先按 reward.pinId / pinIds 精确匹配，否则取该展位全部 PIN ----
const boothPins = computed(() => pins.filter((p) => p.booth === props.id))
function pinsFor(r) {
  const ids = r.pinIds || (r.pinId ? [r.pinId] : null)
  if (ids) return ids.map((id) => pins.find((p) => p.id === id)).filter(Boolean)
  return boothPins.value
}
function showPins(r) {
  const list = pinsFor(r).map((p) => ({
    src: base + (p.thumb || zoneThumbs[p.zone]),
    caption: `${p.no} · ${p.name}${p.thumb ? '' : '（官方样式待公布，此为区域通用「?」软盘示意）'}`,
  }))
  if (list.length) openImgs(list, 0)
}

// ---- 舞台时间表：嘉宾字符串带「HH:MM 」前缀时按整点时段分行（17:00 / 17:30 同一行），否则全部一行；胶囊文字保持原文 ----
const TIME_RE = /^(\d{1,2}):(\d{2})\s*/
function byHour(guests) {
  if (!guests?.some((g) => TIME_RE.test(g))) return [guests || []]
  const groups = new Map()
  for (const g of guests) {
    const m = g.match(TIME_RE)
    const hh = m ? m[1].padStart(2, '0') : '99'
    if (!groups.has(hh)) groups.set(hh, [])
    groups.get(hh).push(g)
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, list]) => list)
}
const stageView = computed(() =>
  (detail.value?.stage || []).map((s) => ({ ...s, schedule: s.schedule?.map((g) => ({ ...g, rows: byHour(g.guests) })) })),
)

// ---- 展会信息：「📍 展位号 X」一枚胶囊；location 去掉展位号后若还有区域信息（翻身时空港 / 黄金海岸线「宝藏码头」…）再单独一枚 ----
const regionText = computed(() => {
  const d = detail.value
  if (!d?.location) return ''
  let r = d.location
  const nos = String(d.boothNo).split(/[（(]/)[0].split('/')
  for (const n of nos) {
    const t = n.trim()
    if (t) r = r.replace(new RegExp(t.replace(/-/g, '-?') + '\\s*$'), '')
  }
  r = r.trim()
  return /^上海\s*[·・]?\s*复兴岛$/.test(r) ? '' : r
})

const pillCls = (s) => ({ warm: /神秘|人气|待/.test(s), hot: /夜间/.test(s) })

// ---- 多 IP 共用展位：activities / tasks 条目带 ip 时按相邻 ip 分组，组名可点开（默认收起） ----
const groupBy = (list) => {
  const out = []
  for (const it of list || []) {
    const ip = it.ip || null
    const last = out[out.length - 1]
    if (last && last.ip === ip) last.items.push(it)
    else out.push({ ip, items: [it] })
  }
  return out
}
const actGroups = computed(() => groupBy(detail.value?.activities))
const taskGroups = computed(() => groupBy(detail.value?.tasks))
const openGroups = ref({})
const isGroupOpen = (k) => !!openGroups.value[k]
const toggleGroup = (k) => (openGroups.value = { ...openGroups.value, [k]: !openGroups.value[k] })

async function copy() {
  try {
    await navigator.clipboard.writeText(keyword.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* 部分浏览器不支持，忽略 */
  }
}
</script>
