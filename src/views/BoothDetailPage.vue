<template>
  <div class="page" v-if="booth">
    <PageHeader :title="booth.ip" :sub="`${booth.zone} 区 · 展位 ${booth.no}`" back>
      <template #right>
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
          <span class="tag blue text">{{ booth.zone }} 区</span>
          <span v-if="detail" class="tag green text">已收录展台详情</span>
        </div>
        <div class="mt-10" style="font-size:15px;color:var(--brown);font-weight:700">{{ booth.blurb }}</div>
        <div class="small muted mt-6">—— 官方「IP 展位一览」</div>
        <div class="row wrap mt-10" style="gap:8px">
          <a v-if="booth.xhs" class="pbtn sm red" :href="profileUrl(booth.xhs.uid)" target="_blank" rel="noopener">📕 小红书主页 @{{ booth.xhs.name }}</a>
          <a class="pbtn sm ghost" :href="searchUrl(keyword)" target="_blank" rel="noopener">🔍 搜「{{ booth.ip }} RED LAND」</a>
        </div>
        <div v-if="!booth.xhs" class="small muted mt-6">尚未记录该 IP 的小红书官方账号，抓到其展台笔记后会补上主页入口。</div>
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
            <span class="pill">📍 {{ detail.location || '上海 · 复兴岛' }}</span>
            <span class="pill warm">展位号 {{ detail.boothNo }}</span>
          </div>
          <div v-if="detail.notes?.length" class="mt-6">
            <div v-for="n in detail.notes" :key="n" class="small muted">* {{ n }}</div>
          </div>
        </div>
      </div>

      <!-- 展台活动 -->
      <div v-if="detail.activities?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="pcard-title">🎪 展台活动</div>
          <div v-for="(a, i) in detail.activities" :key="i" class="mt-10">
            <div class="row wrap">
              <b style="font-size:15px;color:var(--brown)">{{ a.title }}</b>
              <span v-if="a.needBooking" class="tag yellow text" style="font-size:10px;padding:2px 6px">需预约</span>
            </div>
            <div class="small mt-6">{{ a.desc }}</div>
            <div v-if="a.partner" class="small muted">合作伙伴：{{ a.partner }}</div>
            <div v-if="a.rewards?.length" class="row wrap">
              <span v-for="r in a.rewards" :key="r" class="pill warm">🎁 {{ r }}</span>
            </div>
            <div v-if="i < detail.activities.length - 1" class="hr" />
          </div>
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
      <div v-if="detail.stage?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="pcard-title">🎤 舞台活动</div>
          <div v-for="(s, i) in detail.stage" :key="i" class="mt-10">
            <b style="font-size:15px;color:var(--brown)">{{ s.title }}</b>
            <div class="small mt-6">{{ s.desc }}</div>
            <div v-if="s.schedule?.length" class="mt-6">
              <div v-for="g in s.schedule" :key="g.day" class="row small" style="padding:4px 0;border-top:1.5px dashed #eadfc4">
                <span class="tag blue" style="font-size:9px">{{ g.day }}</span>
                <span>{{ g.guests.join(' & ') }}</span>
              </div>
            </div>
            <div v-if="i < detail.stage.length - 1" class="hr" />
          </div>
        </div>
      </div>

      <!-- 展台任务 -->
      <div v-if="detail.tasks?.length" class="pcard mt-14">
        <div class="pcard-body">
          <div class="pcard-title">✅ 展台任务</div>
          <div v-for="(t, i) in detail.tasks" :key="i" class="mt-10">
            <b style="font-size:15px;color:var(--brown)">{{ t.title }}</b>
            <div class="small mt-6">{{ t.desc }}</div>
            <div v-if="t.tags?.length" class="row wrap">
              <span v-for="tg in t.tags" :key="tg" class="pill hot">{{ tg }}</span>
            </div>
            <div v-if="t.rewards?.length" class="row wrap">
              <span v-for="r in t.rewards" :key="r" class="pill warm">🎁 {{ r }}</span>
            </div>
            <div v-if="i < detail.tasks.length - 1" class="hr" />
          </div>
        </div>
      </div>

      <!-- 奖励一览 -->
      <div v-if="detail.rewards?.length" class="pcard sand mt-14">
        <div class="pcard-body">
          <div class="pcard-title">🎁 展台奖励一览</div>
          <div v-for="r in detail.rewards" :key="r.name" class="row between small" style="padding:6px 0;border-top:1.5px dashed #eadfc4">
            <span><b>{{ r.name }}</b> <span v-if="r.pin" class="tag text" style="font-size:10px;padding:1px 5px;margin-left:4px">PIN</span></span>
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
            <span class="small muted">点击放大</span>
          </div>
          <div class="gallery mt-10">
            <img v-for="(img, i) in detail.images" :key="img" :src="base + img" loading="lazy" @click="lb = i" />
          </div>
        </div>
      </div>

      <!-- 来源 -->
      <div class="pcard mt-14">
        <div class="pcard-body">
          <div class="small muted">来源：{{ detail.source.author }} · {{ detail.source.publishedAt }}</div>
          <div class="small mt-6"><b>{{ detail.source.title }}</b></div>
          <a class="pbtn red block mt-10" :href="detail.source.url" target="_blank" rel="noopener">去小红书看原笔记</a>
        </div>
      </div>
    </template>

    <!-- 独立游戏名单（C04） -->
    <div v-if="booth.id === 'C04'" class="pcard mt-14">
      <div class="pcard-body">
        <div class="pcard-title">🕹 独立游戏试玩名单</div>
        <div class="small muted">近百款独立游戏集中上桌，按首字母排列</div>
        <div v-for="g in indieGames" :key="g.letter" class="mt-10">
          <span class="tag blue" style="font-size:10px">{{ g.letter }}</span>
          <div class="row wrap mt-6">
            <span v-for="n in g.games" :key="n" class="pill">{{ n }}</span>
          </div>
        </div>
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

    <!-- 灯箱 -->
    <Teleport to="body">
      <div v-if="lb !== null" class="lightbox" @click="lb = null">
        <img :src="base + detail.images[lb]" />
        <div class="nav" @click.stop>
          <button class="pbtn sm ghost" :disabled="lb === 0" @click="lb = Math.max(0, lb - 1)">上一张</button>
          <span class="tag yellow">{{ lb + 1 }}/{{ detail.images.length }}</span>
          <button class="pbtn sm ghost" :disabled="lb === detail.images.length - 1" @click="lb = Math.min(detail.images.length - 1, lb + 1)">下一张</button>
          <button class="pbtn sm red" @click="lb = null">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
  <div v-else class="page">
    <PageHeader title="未找到展位" back />
    <div class="pcard"><div class="empty">没有这个展位编号</div></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { boothMap } from '../data/booths.js'
import boothDetails from '../data/boothDetails.js'
import { indieGames } from '../data/indie.js'
import { event } from '../data/rules.js'
import { useChecked } from '../composables/useStore.js'
import { profileUrl, searchUrl, boothSearchKeyword } from '../utils/xhs.js'

const props = defineProps({ id: String })
const booth = computed(() => boothMap[props.id])
const detail = computed(() => boothDetails[props.id])
const { isChecked, toggle } = useChecked()
const base = import.meta.env.BASE_URL
const lb = ref(null)
const copied = ref(false)

const keyword = computed(() => (booth.value ? boothSearchKeyword(booth.value) : ''))

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
