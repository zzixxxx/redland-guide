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
            <span class="pill">📍 上海 · 复兴岛</span>
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
        <div class="small mt-6">该 IP 官方账号发布「展台活动详情」笔记后会同步到这里。你也可以直接去小红书搜索：</div>
        <div class="pill warm mt-6" style="display:block;word-break:break-all">{{ keyword }}</div>
        <div class="row mt-10">
          <button class="pbtn sm ghost" @click="copy">复制关键词</button>
          <a class="pbtn sm red" :href="searchUrl" target="_blank" rel="noopener">打开小红书搜索</a>
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

const props = defineProps({ id: String })
const booth = computed(() => boothMap[props.id])
const detail = computed(() => boothDetails[props.id])
const { isChecked, toggle } = useChecked()
const base = import.meta.env.BASE_URL
const lb = ref(null)
const copied = ref(false)

const keyword = computed(() => `RED LAND2026 ${booth.value?.ip} 展台活动详情`)
const searchUrl = computed(() => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword.value)}`)

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
