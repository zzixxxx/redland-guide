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
          <!-- 主角专属装备包（RED LAND 官方号 9/15）：入场安检后到装备区人人可领，是主线的第一步，所以放在主线玩法卡里（用户 9/17） -->
          <div class="hr" />
          <div class="fold-head" @click="openEquip = !openEquip">
            <div class="pcard-title" style="font-size:15px">🎒 {{ equipPack.title }}</div>
            <span class="fold-arrow" :class="{ open: openEquip }">&gt;</span>
          </div>
          <template v-if="openEquip">
          <div class="small mt-6" style="color:var(--brown)">{{ equipPack.desc }}</div>
          <div v-for="(it, i) in equipPack.items" :key="it.name" class="small mt-6">
            <b>{{ i + 1 }}. {{ it.name }}</b>
            <div>{{ it.desc }}</div>
            <div class="muted">* {{ it.note }}</div>
          </div>
          <div v-for="n in equipPack.notes" :key="n" class="small mt-6" style="color:var(--brown)">⚠️ {{ n }}</div>
          <div class="mt-6" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
            <img v-for="(im, i) in equipPack.images" :key="im.src" :src="base + im.src" :alt="im.alt" :title="im.alt" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs(equipImages, i)" />
          </div>
          <div class="small muted mt-6">图源：{{ equipPack.source.author }}「{{ equipPack.source.title }}」{{ equipPack.source.publishedAt }} · <a :href="equipPack.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a></div>
          </template>
          <div class="hr" />
          <div class="fold-head" @click="openEggs = !openEggs">
            <div class="pcard-title" style="font-size:15px">🎈 {{ eggs.title }}</div>
            <span class="fold-arrow" :class="{ open: openEggs }">&gt;</span>
          </div>
          <template v-if="openEggs">
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
          </template>

          <!-- 展位活动预约指南（RED LAND 官方号 2026-09-19）：用户 9/22 要求从独立卡并入主线玩法，与装备包 / 彩蛋并列，各自可折叠。
               收起时仍显示三枚时间胶囊（9/28–9/30 那枚 .pill.hot），只有少数展位的限额活动要预约 -->
          <div class="hr" />
          <div class="fold-head" @click="openBooking = !openBooking">
            <div class="pcard-title" style="font-size:15px">🗓 {{ booking.title }}</div>
            <span class="fold-arrow" :class="{ open: openBooking }">&gt;</span>
          </div>
          <div class="row wrap mt-6">
            <span v-for="t in booking.timeline" :key="t.date" class="pill" :class="{ hot: t.date === '9月28日 – 9月30日' }">{{ t.date }} {{ t.name }}</span>
          </div>
          <template v-if="openBooking">
            <div class="small muted mt-6">{{ booking.subtitle }}</div>
            <div v-for="t in booking.timeline" :key="t.date" class="mt-6 small">
              <span class="tag text">{{ t.date }}</span>
              <b style="margin-left:6px">{{ t.name }}</b>
              <div class="mt-6">{{ t.desc }}</div>
              <div class="muted">⚠️ {{ t.warn }}</div>
            </div>
            <ol class="steps mt-10">
              <li v-for="s in booking.steps" :key="s.no">
                <span class="step-no cjk">{{ s.no }}</span>
                <div class="step-body">
                  <b class="step-title">{{ s.title }}</b>
                  <div v-for="it in s.items" :key="it" class="small mt-4">{{ it }}</div>
                </div>
              </li>
            </ol>
            <button class="linkbtn foldline small mt-6" style="font-weight:700;text-decoration:none" @click="openBookRules = !openBookRules">📜 预约规则全文（{{ booking.rules.length }} 组）{{ openBookRules ? '▴' : '▾' }}</button>
            <div v-if="openBookRules">
              <div v-for="g in booking.rules" :key="g.title" class="mt-10">
                <b class="small">{{ g.title }}</b>
                <ul class="small mt-6" style="padding-left:18px">
                  <li v-for="it in g.items" :key="it">{{ it }}</li>
                </ul>
              </div>
            </div>
            <div class="small mt-10" style="color:var(--brown)">💡 {{ booking.note }}</div>
            <div class="mt-10" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
              <img v-for="(im, i) in booking.images" :key="im.src" :src="base + im.src" :alt="im.alt" :title="im.alt" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs(bookingImages, i)" />
            </div>
            <div class="small muted mt-6">
              图源：{{ booking.source.author }}「{{ booking.source.title }}」{{ booking.source.publishedAt }} ·
              <a :href="booking.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a>
            </div>
          </template>

          <!-- 岛上吃喝与场外福利：餐饮指南（RED LAND 官方号 2026-09-21）+ 商圈票根联动优惠（2026-09-20）。
               用户 9/22 要求这两节也并进主线玩法卡，与装备包 / 彩蛋 / 预约指南并列，各自折叠、默认收起 -->
          <div class="hr" />
          <div class="fold-head" @click="openDining = !openDining">
            <div class="pcard-title" style="font-size:15px">🍴 {{ dining.title }}</div>
            <span class="fold-arrow" :class="{ open: openDining }">&gt;</span>
          </div>
          <div class="small muted mt-6">{{ dining.subtitle }}</div>
          <template v-if="openDining">
            <div v-for="t in dining.points" :key="t" class="small mt-6" style="color:var(--brown)">{{ t }}</div>
            <div class="hr" />
            <b class="small">📊 {{ dining.survey.title }}</b>
            <ul class="small mt-6" style="padding-left:18px">
              <li v-for="it in dining.survey.items" :key="it">{{ it }}</li>
            </ul>
            <div class="mt-10" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
              <img v-for="(im, i) in dining.images" :key="im.src" :src="base + im.src" :alt="im.alt" :title="im.alt" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs(diningImages, i)" />
            </div>
            <div class="small mt-6" style="color:var(--brown)">💡 {{ dining.note }}</div>
            <div class="small muted mt-6">图源：{{ dining.source.author }}「{{ dining.source.title }}」{{ dining.source.publishedAt }} · <a :href="dining.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a></div>
          </template>

          <div class="hr" />
          <div class="fold-head" @click="openMall = !openMall">
            <div class="pcard-title" style="font-size:15px">🛒 {{ mallDeals.title }}</div>
            <span class="fold-arrow" :class="{ open: openMall }">&gt;</span>
          </div>
          <div class="small muted mt-6">{{ mallDeals.subtitle }}</div>
          <template v-if="openMall">
            <div class="row wrap mt-6">
              <span v-for="m in mallDeals.malls" :key="m" class="pill">{{ m }}</span>
            </div>
            <div class="row wrap mt-6">
              <span v-for="k in mallDeals.kinds" :key="k" class="tag text" style="font-size:10px;padding:2px 5px">{{ k }}</span>
            </div>
            <div v-for="t in mallDeals.points" :key="t" class="small mt-6" style="color:var(--brown)">· {{ t }}</div>
            <div class="mt-10" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
              <img v-for="(im, i) in mallDeals.images" :key="im.src" :src="base + im.src" :alt="im.alt" :title="im.alt" loading="lazy" style="border:2px solid var(--navy);border-radius:2px" @click="openImgs(mallImages, i)" />
            </div>
            <div class="small mt-6" style="color:var(--brown)">💡 {{ mallDeals.note }}</div>
            <div class="small muted mt-6">图源：{{ mallDeals.source.author }}「{{ mallDeals.source.title }}」{{ mallDeals.source.publishedAt }} · <a :href="mallDeals.source.url" target="_blank" rel="noopener" style="text-decoration:underline">原笔记</a></div>
          </template>

          <div class="hr" />
          <div v-for="p in places" :key="p.key" class="mt-6 small">
            <span class="tag text" :class="p.key === 'night' ? 'blue' : p.key === 'camp' ? 'green' : ''">{{ p.tag }}</span>
            <b style="margin-left:6px">{{ p.name }}</b>
            <div class="mt-6">{{ p.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 场馆平面图：上半部分为 RED LAND 官方号 2026-09-11 公布的官方功能地图（原 LOADING 占位处），下半部分保留 2025 年网友参考图 -->
    <div class="pcard dark mt-14">
      <div class="pcard-body">
        <div class="row between">
          <div>
            <div class="pcard-title" style="font-size:15px">🗺 场馆平面图</div>
            <div class="small" style="color:#c9c8ea">官方功能地图 · 点开可双指缩放、拖动；在地图上点展位看攻略、导航</div>
          </div>
          <button class="tag text btn" style="flex:none" @click="openMap26 = !openMap26">登岛地图 {{ openMap26 ? '▴' : '▾' }}</button>
        </div>
        <div v-if="openMap26">
          <button class="linkbtn foldline small mt-10" style="color:#ffe27a;font-weight:700;text-decoration:none" @click="openTips26 = !openTips26">🚇 2026 交通要点（{{ venueMap.tips.length }} 条）{{ openTips26 ? '▴' : '▾' }}</button>
          <ul v-if="openTips26" class="dot-list small mt-6" style="color:#e8e7ff;background:#1c1b40;border:2px dashed #4a4980;padding:8px 10px 8px 22px">
            <li v-for="t in venueMap.tips" :key="t">{{ t }}</li>
            <li>地图已标出的回血点位：{{ venueMap.facilities.join('、') }}</li>
          </ul>
          <button class="linkbtn foldline small mt-10" style="color:#ffe27a;font-weight:700;text-decoration:none" @click="openFac = !openFac">🧭 {{ venueFacilities.title }}（{{ facCount }} 条 · {{ venueFacilities.images.length }} 张图）{{ openFac ? '▴' : '▾' }}</button>
          <div v-if="openFac" class="small mt-6" style="color:#e8e7ff;background:#1c1b40;border:2px dashed #4a4980;padding:8px 10px">
            <div v-for="(g, gi) in venueFacilities.groups" :key="g.title" :class="gi ? 'mt-10' : ''">
              <div style="color:#ffe27a;font-weight:700">{{ g.title }}</div>
              <ul class="dot-list" style="padding-left:6px">
                <li v-for="t in g.items" :key="t">{{ t }}</li>
              </ul>
            </div>
            <div class="mt-10" style="color:#c9c8ea">{{ venueFacilities.note }}</div>
            <div class="gallery mt-6">
              <img v-for="(m, i) in facImages" :key="m.src" :src="m.src" :alt="m.caption" :title="m.caption" loading="lazy" @click="openImgs(facImages, i)" />
            </div>
            <div class="mt-6" style="color:#a9a8cc">
              来源：RED LAND 官方号 · {{ venueFacilities.source.publishedAt }}
              <a :href="venueFacilities.source.url" target="_blank" rel="noopener" style="color:#ffe27a">原笔记</a>
            </div>
          </div>
          <!-- 三张切片按原图从左到右排一行，地图在中间；点哪张开哪张（用户 9/14） -->
          <div class="gallery slices mt-10">
            <img
              v-for="(m, i) in mapSlices"
              :key="m.src"
              :src="m.src"
              :alt="m.caption"
              :title="m.caption"
              loading="lazy"
              @click="openImgs(mapSlices, i)"
            />
          </div>
          <div class="row wrap mt-10" style="gap:6px">
            <span v-for="r in venueMap.routes" :key="r.name" class="pill">
              <i :style="{ display: 'inline-block', width: '10px', height: '10px', background: r.color, border: '1px solid var(--navy)', verticalAlign: '-1px', marginRight: '5px' }" />{{ r.name }}
            </span>
          </div>
          <div class="small mt-6" style="color:#c9c8ea">{{ venueMap.routeTip }}</div>
        </div>
        <div class="small mt-6" style="color:#a9a8cc">
          来源：RED LAND 官方号 · {{ venueMap.source.publishedAt }}
          <a :href="venueMap.source.url" target="_blank" rel="noopener" style="color:#ffe27a">原笔记</a>
        </div>
        <div class="hr" style="border-color:#4a4980" />
        <div class="row between">
          <button class="tag yellow text btn" @click="openMap = !openMap">🗺 {{ venueMapRef.title }} {{ openMap ? '▴' : '▾' }}</button>
          <span class="small" style="color:#a9a8cc;flex:none">交通要点 · {{ venueMapRef.images.length }} 张图</span>
        </div>
        <div v-if="openMap">
          <div class="small mt-6" style="color:#c9c8ea">{{ venueMapRef.warn }}</div>
          <button class="linkbtn foldline small mt-10" style="color:#ffe27a;font-weight:700;text-decoration:none" @click="openTips = !openTips">🚇 2025 交通要点（{{ venueMapRef.tips.length }} 条）{{ openTips ? '▴' : '▾' }}</button>
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

    <!-- 待打卡清单：自动排最少回头路，也可以自己上下调（见 utils/plan.js） -->
    <div v-if="planCount" class="pcard sand mt-14">
      <div class="pcard-body">
        <div class="fold-head" @click="openPlan = !openPlan">
          <div class="pcard-title">待打卡清单 <span class="tag" style="font-size:9px">{{ planCount }}</span></div>
          <span class="fold-arrow" :class="{ open: openPlan }">&gt;</span>
        </div>
        <template v-if="openPlan">
          <!-- 不显示距离（用户 9/17）：现场人的位置一直在变，从固定起点算的米数没意义；排序仍按最少回头路 -->
          <div v-if="planResult" class="small muted mt-6">
            {{ planResult.manual ? '按你调好的顺序（↑↓ 可再调，或点「重排最短」）' : '已按最少回头路排好，↑↓ 可自己调' }}
          </div>
          <!-- 一行一个 IP；同一展位号下加了多个 IP 时并排成相邻几行，距离只标在第一行。
               最多显示 5 行，多了在这个容器里滚（用户 9/17） -->
          <div class="plan-scroll mt-6" :class="{ more: planCount > 5 }">
          <ol class="plan-list">
            <template v-for="(no, i) in planResult ? planResult.order : []" :key="no">
              <li v-for="(b, k) in pickedOf(no)" :key="b.id" :class="{ sub: k > 0 }">
                <span v-if="k === 0" class="plan-no">{{ i + 1 }}</span>
                <span v-else class="plan-no ghost">↳</span>
                <span class="plan-body">
                  <b class="plan-bno">{{ no }}</b>
                  <button type="button" class="plan-ip" :class="{ done: isChecked(b.id) }" @click="go(b)">{{ b.ip }}</button>
                  <span v-if="k > 0" class="muted small">· 同一展位</span>
                </span>
                <span class="plan-acts">
                  <button
                    class="star sm"
                    :class="{ off: !isChecked(b.id) }"
                    :aria-label="isChecked(b.id) ? '取消打卡' : '标记打卡'"
                    @click="toggle(b.id)"
                  >★</button>
                  <button class="star sm ghost" :disabled="k > 0 || i === 0" aria-label="上移" @click="movePlan(planResult.order, i, -1)">↑</button>
                  <button class="star sm ghost" :disabled="k > 0 || i === planResult.order.length - 1" aria-label="下移" @click="movePlan(planResult.order, i, 1)">↓</button>
                  <button class="star sm ghost" aria-label="移出清单" @click="togglePlan(b.id)">✕</button>
                </span>
              </li>
            </template>
          </ol>
          </div>
          <div v-if="planCount > 5" class="small muted mt-4">共 {{ planCount }} 行，在清单里上下滚动查看</div>
          <div class="row wrap mt-10" style="gap:8px">
            <button class="pbtn sm" @click="openImgs(mapSlices, MAP_P2)">在地图上看路线</button>
            <button v-if="planResult && planResult.manual" class="pbtn sm ghost" @click="autoPlan()">重排最短</button>
            <button class="pbtn sm ghost" @click="clearPlan()">清空</button>
          </div>
        </template>
      </div>
    </div>

    <!-- 展位列表 -->
    <div class="mt-14">
      <div class="row between mb-6">
        <a class="sticker" :href="boothSource.url" target="_blank" rel="noopener" @click="openPage($event, boothSource.url)">IP 展位一览</a>
        <span class="small" style="color:#fff;text-shadow:1px 1px 0 var(--navy);text-align:right">点击展位看活动 / 任务 / 奖励<br />📕 跳转该 IP 小红书主页</span>
      </div>
      <input v-model.trim="q" class="search" placeholder="搜索 IP 名 / 拼音 / 编号，如 星布谷地、xbgd、A06" />
      <div class="chips mt-10">
        <button class="chip" :class="{ on: zone === 'ALL' }" @click="zone = 'ALL'">全部<small>{{ booths.length }}</small></button>
        <button v-for="z in zones" :key="z.key" class="chip" :class="{ on: zone === z.key }" @click="zone = z.key">
          {{ z.name }}<small>{{ z.region }}（{{ z.count }}）</small>
        </button>
        <!-- 需预约：boothDetails 里带 needBooking 的展位（用户 9/23 要求放在 C 区之后） -->
        <button class="chip" :class="{ on: zone === 'BOOK' }" @click="zone = 'BOOK'">需预约<small>{{ bookingCount }}</small></button>
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
                <!-- 需预约：boothDetails 里任一活动 / 任务 / 舞台条目（含分步项）带 needBooking（用户 9/22） -->
                <span v-if="needsBooking(b.id)" class="tag yellow text" style="font-size:10px;padding:2px 5px">需预约</span>
                <span v-if="hasDetail(b.id)" class="tag green text" style="font-size:10px;padding:2px 5px">攻略</span>
                <span v-if="isChecked(b.id)" class="tag yellow text" style="font-size:10px;padding:2px 5px">已打卡</span>
                <!-- 加清单挪到 IP 名这一行（用户 9/15）：右侧按钮列最多两颗高，＋ 也不再套星星样式 -->
                <button
                  v-if="mapSpots[noOf(b)]"
                  type="button"
                  class="tag text btn plan-add"
                  :class="{ on: inPlan(b.id) }"
                  @click.stop="togglePlan(b.id)"
                >{{ inPlan(b.id) ? '✓ 已在清单' : '＋ 清单' }}</button>
              </div>
              <div class="blurb">{{ b.blurb }}</div>
            </div>
            <div class="booth-acts">
              <button class="star" :class="{ off: !isChecked(b.id) }" @click.stop="toggle(b.id)" :aria-label="isChecked(b.id) ? '取消打卡' : '标记打卡'">★</button>
              <a v-if="b.xhs" class="star xhs" :href="profileUrl(b.xhs.uid)" target="_blank" rel="noopener" @click.stop="openProfile($event, b.xhs.uid)" :title="`小红书 @${b.xhs.name}`">📕</a>
            </div>
          </div>
        </template>
        <div v-else class="empty">没有匹配的展位</div>
      </div>
      <div class="small mt-10" style="color:#fff;text-shadow:1px 1px 0 var(--navy)">
        * 展位编号以官方「IP 展位一览」为准；★ 可标记已完成任务 / 已领 PIN，仅保存在本机。
        <router-link to="/dev" class="devlink">开发者模式</router-link>
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

    <Lightbox :items="lb.items" v-model:index="lb.i" :plan="planResult" @open="openBooth" />
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
import boothPinyin from '../data/boothPinyin.js'
import { event, venueNav, mainline, eggs, places, dailySchedule, venueMap, venueMapRef, venueFacilities, equipPack, booking, dining, mallDeals } from '../data/rules.js'
import { mapSpotList, mapSpots } from '../data/mapSpots.js'
import { planRoute } from '../utils/plan.js'
import { roaming } from '../data/roaming.js'
import { useChecked, usePlan } from '../composables/useStore.js'
import { profileUrl, openProfile, openPage } from '../utils/xhs.js'

const router = useRouter()
const { isChecked, toggle, count, checked } = useChecked()
const { plan, planOrder, planNos, inPlan, togglePlan, clearPlan, movePlan, autoPlan, planCount } = usePlan()
const q = ref('')
const zone = ref('ALL')
const openRules = ref(false)
const openMap = ref(false)
const openTips = ref(false)
const openMap26 = ref(false)
const openTips26 = ref(false)
const openFac = ref(false)
const openEquip = ref(false)
const openEggs = ref(false)
const openDining = ref(false)
const openMall = ref(false)
const openBooking = ref(false)
const openBookRules = ref(false)
const openPlan = ref(true)
// 清单变化时重算（12 个点约 50ms，全 81 个约 370ms）；planOrder 非空就按用户调好的顺序走。
// 清单按 IP（展位 id）存，但地图上同号多 IP 是同一个点，所以先去重成展位号再排路线
const planResult = computed(() => (planNos.value.length ? planRoute(planNos.value, planOrder.value) : null))
// 某个展位号下「用户真的加进清单的」那些 IP —— 不是这个号下的全部 IP
const pickedOf = (no) => boothsOf(no).filter((b) => inPlan(b.id))
// 「B02 / B17」这类共用编号在地图上是同一个点，一律取第一个编号
const noOf = (b) => String(b.no).split(/\s*\/\s*/)[0]
const boothsOf = (no) => booths.filter((b) => String(b.no).split('/').some((s) => s.trim() === no))

const base = import.meta.env.BASE_URL
// 多图灯箱：items 为 { src, caption } 或路径，左右滑动翻页
const lb = reactive({ items: [], i: null })
function openBooth(id) {
  lb.i = null
  router.push(`/booth/${id}`)
}
const openImgs = (items, i) => {
  lb.items = items
  lb.i = i
}
const mainlineImages = mainline.images.map((im) => ({ src: base + im.src, caption: im.alt }))
// 2026 官方图暂时只展示全图（用户 9/11：三区分图与图例先隐藏），hidden 的留在数据里
// 灯箱里换成按比例切好的 3 张，默认停在 P2（中间地图）；P2 挂展位热区，点展位可看攻略 / 导航
const mapSlices = venueMap.slices.map((m) => ({
  src: base + m.src,
  caption: m.alt,
  full: m.full ? base + m.full : undefined,
  spots: m.spots ? mapSpotList : undefined,
  fitH: m.fitH, // 三张切片在灯箱里统一按高度铺满，比例一致
}))
const MAP_P2 = venueMap.slices.findIndex((m) => m.spots)
// 展位一览的出处：官方主会场专题页（点标题跳过去核对最新阵容）
const boothSource = { url: 'https://fe.xiaohongshu.com/ditto/vincent/1875a92b788843718d0b335dd77b1a41?naviHidden=yes&fullscreen=true' }
const mapImages = venueMapRef.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const facImages = venueFacilities.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const equipImages = equipPack.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const bookingImages = booking.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const diningImages = dining.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const mallImages = mallDeals.images.map((m) => ({ src: base + m.src, caption: m.alt }))
const facCount = venueFacilities.groups.reduce((n, g) => n + g.items.length, 0)

const hasDetail = (id) => !!boothDetails[id]

// 需要预约的展位：boothDetails 里任一 activities / tasks / stage 条目（含 items 分步项）带 needBooking，
// 列表行的 IP 名后面出现亮黄「需预约」标签（用户 9/22）。新补详情时别忘了给要预约的活动加这个字段
const bookingIds = new Set(
  Object.entries(boothDetails)
    .filter(([, d]) =>
      ['activities', 'tasks', 'stage'].some((k) =>
        (d[k] || []).some((x) => x.needBooking || (x.items || []).some((i) => i && i.needBooking)),
      ),
    )
    .map(([id]) => id),
)
const needsBooking = (id) => bookingIds.has(id)
const bookingCount = booths.filter((b) => bookingIds.has(b.id)).length
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
  else if (zone.value === 'BOOK') arr = arr.filter((b) => needsBooking(b.id))
  else if (zone.value !== 'ALL') arr = arr.filter((b) => b.zone === zone.value)
  const k = q.value.toLowerCase()
  if (k) {
    // 纯字母输入再走拼音（scripts/gen-pinyin.mjs 预生成的 boothPinyin）：全拼按包含、首字母按前缀，如 xingbu / xbgd 都出星布谷地
    const py = /^[a-z\s-]+$/.test(k) ? k.replace(/[\s-]/g, '') : ''
    const hitPy = (b) => {
      const e = py && boothPinyin[b.id]
      return !!e && (e.f.some((t) => t.includes(py)) || e.i.some((t) => t.startsWith(py)))
    }
    arr = arr.filter((b) =>
      b.ip.toLowerCase().includes(k) ||
      b.no.toLowerCase().replace(/\s/g, '').includes(k.replace(/\s|-/g, '')) ||
      (b.alias || '').toLowerCase().includes(k) ||
      searchExtra(b).includes(k) ||
      b.blurb.includes(k) ||
      hitPy(b),
    )
  }
  return arr
})

function go(b) {
  router.push({ name: 'booth', params: { id: b.id } })
}
</script>
