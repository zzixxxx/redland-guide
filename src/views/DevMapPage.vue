<template>
  <div class="page dev">
    <PageHeader title="开发者模式" subtitle="手动校正平面图数据（只存本机）" back />

    <div class="dev-bar">
      <div class="chips">
        <button v-for="m in MODES" :key="m.key" class="chip" :class="{ on: mode === m.key }" @click="pick(m.key)">
          {{ m.name }}
        </button>
      </div>
      <div class="row wrap mt-6" style="gap:6px;align-items:center">
        <button class="pbtn sm ghost" @click="setZoom(-1)">－</button>
        <span class="small muted" style="min-width:52px;text-align:center">{{ Math.round(imgW) }}px</span>
        <button class="pbtn sm ghost" @click="setZoom(1)">＋</button>
        <button class="pbtn sm ghost" @click="fit()">适屏</button>
        <!-- 已改 N 处：点开气泡逐条看 / 定位 / 单独撤销（用户 9/17） -->
        <button v-if="changes.length" class="tag text btn" :class="{ on: popOpen }" style="font-size:10px" @click="popOpen = !popOpen">
          已改 {{ changes.length }} 处 {{ popOpen ? '▴' : '▾' }}
        </button>
      </div>
      <!-- 图层开关：热区 / 到达门 / 出入口 / 画笔 / 起点 / 路网全部画在图上，当前模式那一层才能拖 -->
      <div class="row wrap mt-6" style="gap:4px;align-items:center">
        <span class="small muted">显示</span>
        <button v-for="l in LAYERS" :key="l.key" class="dev-layer" :class="{ on: show[l.key] }" @click="show[l.key] = !show[l.key]">
          <i class="dev-sw" :class="l.key"></i>{{ l.name }}
        </button>
      </div>

      <div v-if="popOpen && changes.length" class="dev-pop">
        <div class="row between" style="align-items:center">
          <span class="small" style="font-weight:700">本机改动（点名称定位，点 ✕ 撤销这一处）</span>
          <button class="pbtn sm ghost" @click="popOpen = false">收起</button>
        </div>
        <div v-for="c in changes" :key="c.id" class="dev-pop-row">
          <i class="dev-sw" :class="c.kind"></i>
          <button class="dev-pop-name" @click="locate(c)">{{ c.label }}</button>
          <span v-if="c.detail" class="small muted dev-pop-detail">{{ c.detail }}</span>
          <button class="pbtn sm ghost dev-pop-x" title="撤销这一处" @click="undo(c)">✕</button>
        </div>
        <div class="row wrap mt-6" style="gap:6px">
          <button class="pbtn sm ghost" @click="wipe()">全部清空</button>
        </div>
      </div>
    </div>

    <!-- 地图：原生滚动平移，点/拖在图上编辑 -->
    <div ref="scroller" class="dev-map">
      <div class="dev-canvas" :style="{ width: imgW + 'px', height: imgH + 'px' }">
        <img ref="img" :src="mapSrc" :width="imgW" :height="imgH" draggable="false" />

        <!-- 点击层（压在图上、其他图层之下）：新建热区 / 放出入口 / 移起点 / 画笔。
             不属于当前模式的图层带 .off（pointer-events:none），点下去会穿透到这里 -->
        <div
          v-if="mode !== 'spot' || drawing"
          class="dev-catch"
          :class="{ brush: mode === 'brush' && !brushPan }"
          @pointerdown="onCanvasDown"
          @pointermove="onCanvasMove"
          @pointerleave="hover = null"
          @dblclick.prevent="endChain()"
        ></div>

        <!-- 路网：青 = 图上真有线（'2'），紫 = 闭运算补出来的桥接格（'1'）。出入口 / 画笔改动后重画 -->
        <canvas v-show="show.grid" ref="gridCv" class="dev-grid" :width="walkGrid.w" :height="walkGrid.h"></canvas>

        <!-- 画笔：笔迹青线 = 铺的真线，红线 = 封路；框选按类型描边；代码里固化的画虚线。正在画的那笔 / 正在拖的框实时跟着手指 -->
        <svg v-show="show.brush" class="dev-strokes" :viewBox="`0 0 ${imgW} ${imgH}`">
          <rect v-for="(q, i) in mapRects" :key="'fr' + i" class="dev-rq fixed" :class="q.mode" v-bind="rectBox(q)" />
          <rect v-for="(q, i) in rects" :key="'r' + i" class="dev-rq" :class="[q.mode, { on: selRect === i }]" v-bind="rectBox(q)" />
          <rect v-if="rectDraft" class="dev-rq draft" v-bind="rectBox(rectDraft)" />
          <g v-for="(s, i) in mapStrokes" :key="'fs' + i" class="fixed" :class="s.mode">
            <polyline v-if="s.pts.length > 1" :points="cellPoly(s.pts)" :style="{ strokeWidth: cellPx(s.r) + 'px' }" />
            <rect v-else v-bind="cellRect(s.pts[0], s.r)" />
          </g>
          <g v-for="(s, i) in strokes" :key="'s' + i" :class="[s.mode, { on: selStroke === i }]">
            <polyline v-if="s.pts.length > 1" :points="cellPoly(s.pts)" :style="{ strokeWidth: cellPx(s.r) + 'px' }" />
            <rect v-else v-bind="cellRect(s.pts[0], s.r)" />
            <text class="dev-slab" :x="cellX(s.pts[0][0])" :y="cellY(s.pts[0][1]) - 6">{{ i + 1 }}</text>
          </g>
          <g v-if="cur" :class="[cur.mode, 'cur']">
            <polyline v-if="cur.pts.length > 1" :points="cellPoly(cur.pts)" :style="{ strokeWidth: cellPx(cur.r) + 'px' }" />
            <rect v-else v-bind="cellRect(cur.pts[0], cur.r)" />
          </g>
          <!-- 直线工具：从上一段末端到指针的橡皮筋预览 + 末端小圆点 -->
          <g v-if="chainStroke" :class="[chainStroke.mode, 'rubber']">
            <polyline v-if="hover" :points="cellPoly([chainLast, hover])" :style="{ strokeWidth: cellPx(chainStroke.r) + 'px' }" />
            <circle :cx="cellX(chainLast[0])" :cy="cellY(chainLast[1])" r="5" />
          </g>
        </svg>

        <!-- 展位热区 -->
        <template v-if="show.spot">
          <div
            v-for="(rect, no) in spots"
            :key="no"
            class="dev-rect"
            :class="{ on: sel === no, dim: mode !== 'spot' && mode !== 'door', off: mode === 'gate' || mode === 'start' || mode === 'brush' || drawing }"
            :style="boxStyle(rect)"
            @pointerdown.stop="onRectDown($event, no)"
          >
            <i class="dev-lab">{{ no }}</i>
            <template v-if="sel === no && mode === 'spot'">
              <b v-for="h in HANDLES" :key="h" class="dev-h" :class="h" @pointerdown.stop="onRectDown($event, no, h)"></b>
            </template>
            <!-- 到达门：每条配了门的边都标一段粗线 -->
            <template v-if="show.door">
              <u v-for="d in sidesOf(no)" :key="d" class="dev-door" :class="d"></u>
            </template>
          </div>
        </template>

        <!-- 出入口：代码里固化的（虚线框，改要改 mapSpots.js）+ 本机的（可选中、可拖） -->
        <template v-if="show.gate">
          <span v-for="(g, i) in mapGates" :key="'f' + i" class="dev-gate fixed" :class="g.mode" :style="gateStyle(g)">
            <i class="dev-lab cjk">固化 · {{ g.mode === 'block' ? '封死' : '开口' }}</i>
          </span>
          <span
            v-for="(g, i) in gates"
            :key="'g' + i"
            class="dev-gate"
            :class="[g.mode, { on: selGate === i, off: mode !== 'gate' }]"
            :style="gateStyle(g)"
            @pointerdown.stop="onGateDown($event, i)"
          >
            <i class="dev-lab cjk">{{ i + 1 }} {{ g.mode === 'block' ? '封死' : '开口' }} r{{ g.r }}</i>
          </span>
        </template>

        <!-- 起点：十字标，起点模式下可以直接拖 -->
        <span v-show="show.start" class="dev-start" :class="{ off: mode !== 'start' }" :style="dotStyle(start)" @pointerdown.stop="onStartDown">
          <i class="dev-lab cjk">起点</i>
        </span>

        <!-- 试走路线：全部展位的淡线 + 当前这条的粗线，末端圆点 = 实际停下的那一格 -->
        <svg v-if="testPts.length || allPts.length" class="dev-route" :viewBox="`0 0 ${imgW} ${imgH}`">
          <polyline v-for="(pts, i) in allPts" :key="i" class="all" :points="poly(pts)" />
          <template v-if="testPts.length">
            <polyline :points="poly(testPts)" />
            <circle :cx="testPts[testPts.length - 1].x * imgW" :cy="testPts[testPts.length - 1].y * imgH" r="6" />
          </template>
        </svg>
      </div>
    </div>
    <div class="small muted mt-6 dev-legend">
      <i class="dev-sw grid2"></i>青 = 图上真有线（代价 1）
      <i class="dev-sw grid1"></i>紫 = 补出来的桥接格（代价 ×6）
      <i class="dev-sw open"></i>画笔铺的真线
      <i class="dev-sw block"></i>画笔封的路
      <i class="dev-sw route"></i>试走路线
    </div>

    <!-- 编辑面板 -->
    <div class="pcard mt-10">
      <div class="pcard-body">
        <template v-if="mode === 'spot' || mode === 'door'">
          <div class="row wrap" style="gap:6px;align-items:center">
            <select v-model="sel" class="dev-sel">
              <option :value="null">— 选展位 —</option>
              <option v-for="no in noList" :key="no" :value="no">{{ no }} {{ ipOf(no) }}</option>
            </select>
            <button class="pbtn sm ghost" :class="{ on: drawing }" @click="drawing = !drawing">
              {{ drawing ? '取消新建' : '新建热区' }}
            </button>
            <button class="pbtn sm ghost" :disabled="!sel" @click="removeSpot()">删除</button>
          </div>

          <template v-if="sel">
            <div class="small muted mt-6">{{ ipOf(sel) || '（booths.js 里没有这个展位号，热区会点不出东西）' }}</div>
            <div class="dev-nums mt-6">
              <label v-for="(k, i) in ['x', 'y', 'w', 'h']" :key="k">
                {{ k }}
                <input type="number" step="0.0005" :value="spots[sel][i]" @input="setNum(i, $event.target.value)" />
              </label>
            </div>
            <div class="small muted mt-6">选中后可拖动整块、拖四角改大小，方向键微调（Shift 加速）。</div>

            <div class="row wrap mt-10" style="gap:6px;align-items:center">
              <span class="small" style="font-weight:700">到达门</span>
              <button
                v-for="d in DOORS"
                :key="d.key"
                class="chip"
                :class="{ on: sidesOf(sel).includes(d.key) }"
                @click="toggleDoor(d.key)"
              >{{ d.key }} {{ d.name }}<small :class="{ far: gapOf(d.key) > 3 }">{{ gapOf(d.key) }}</small></button>
            </div>
            <div class="small muted mt-6">
              可以选多条边（最少 1、最多 4），导航自动停在最近的那个门。
              芯片上的数字是这条边离最近一格「图上真有线」几格：<b>0</b> 说明这边正对过道、适合开门，
              <b class="far">&gt;3</b> 说明这边没有路，别选。
            </div>
          </template>
        </template>

        <template v-else-if="mode === 'gate'">
          <template v-if="curGate">
            <div class="row wrap" style="gap:6px;align-items:center">
              <span class="small" style="font-weight:700">出入口 {{ selGate + 1 }}</span>
              <button class="chip" :class="{ on: curGate.mode === 'open' }" @click="setGate({ mode: 'open' })">开口</button>
              <button class="chip" :class="{ on: curGate.mode === 'block' }" @click="setGate({ mode: 'block' })">封死</button>
              <button class="pbtn sm ghost" @click="removeGate(selGate)">删除</button>
              <button class="pbtn sm ghost" @click="selGate = null">放新的</button>
            </div>
            <div class="dev-nums mt-6">
              <label>x <input type="number" step="0.0005" :value="curGate.x" @input="setGate({ x: Number($event.target.value) })" /></label>
              <label>y <input type="number" step="0.0005" :value="curGate.y" @input="setGate({ y: Number($event.target.value) })" /></label>
              <label style="grid-column:1 / -1">
                半径 {{ curGate.r }} 格
                <input type="range" min="0" max="10" :value="curGate.r" @input="setGate({ r: Number($event.target.value) })" />
              </label>
            </div>
            <div class="small muted mt-6">
              拖动方块挪位置，方向键微调一格（Shift ×10），Delete 删除。这块盖住路网第 {{ cellOf(curGate).x }},{{ cellOf(curGate).y }} 格周围
              {{ 2 * curGate.r + 1 }}×{{ 2 * curGate.r + 1 }} 格：开口 = 强制变成可走的真线，封死 = 禁止通行。
              开着「路网」图层就能看到盖上去的效果。要沿着一条路连续铺 / 封，用「路网画笔」更顺手。
            </div>
          </template>
          <template v-else>
            <div class="row wrap" style="gap:6px;align-items:center">
              <span class="small" style="font-weight:700">新放一个</span>
              <button class="chip" :class="{ on: gateMode === 'open' }" @click="gateMode = 'open'">开口</button>
              <button class="chip" :class="{ on: gateMode === 'block' }" @click="gateMode = 'block'">封死</button>
              <span class="small">半径 {{ gateR }} 格</span>
              <input type="range" min="0" max="10" v-model.number="gateR" />
            </div>
            <div class="small muted mt-6">
              点图上空白处放一个方块，点已有的方块选中它（选中后可拖、可改半径 / 类型、可删）。
              开口 = 把这片强制变成可走的真线（补出入口 / 补断掉的过道），封死 = 禁止通行（堵住图上画了线但实际走不通的地方）。
              本机 {{ gates.length }} 个<template v-if="mapGates.length">，代码里固化 {{ mapGates.length }} 个（虚线框，在这里改不了）</template>。
            </div>
          </template>
        </template>

        <template v-else-if="mode === 'brush'">
          <div class="row wrap" style="gap:6px;align-items:center">
            <span class="small" style="font-weight:700">工具</span>
            <button v-for="t in TOOLS" :key="t.key" class="chip" :class="{ on: brushTool === t.key }" @click="setTool(t.key)">{{ t.name }}</button>
            <button class="pbtn sm ghost" :class="{ on: brushPan }" @click="brushPan = !brushPan">{{ brushPan ? '拖图中，点回画笔' : '手指拖图' }}</button>
          </div>
          <div v-if="brushTool !== 'rect'" class="row wrap mt-6" style="gap:6px;align-items:center">
            <button class="chip" :class="{ on: brushMode === 'open' }" @click="brushMode = 'open'">铺真线</button>
            <button class="chip" :class="{ on: brushMode === 'block' }" @click="brushMode = 'block'">封路</button>
            <span class="small">笔宽 {{ 2 * brushR + 1 }} 格</span>
            <input type="range" min="0" max="3" v-model.number="brushR" />
            <template v-if="brushTool === 'line' && chainStroke">
              <button class="pbtn sm" @click="endChain()">结束这条线（{{ chainStroke.pts.length }} 点）</button>
              <button class="pbtn sm ghost" @click="chainBack()">退一个点</button>
            </template>
          </div>
          <div v-else class="row wrap mt-6" style="gap:6px;align-items:center">
            <button v-for="m in RECT_MODES" :key="m.key" class="chip" :class="{ on: rectMode === m.key }" @click="rectMode = m.key">{{ m.name }}</button>
          </div>
          <div class="small muted mt-6">
            <template v-if="brushTool === 'line'">
              点一下起点、再点一下终点就是一段直线；接着点就从上一段末端继续画（点到已有线的端点附近会自动吸上去，线就接上了）。
              Esc / 双击 / 「结束这条线」收笔，Backspace 退掉上一个点。
            </template>
            <template v-else-if="brushTool === 'free'">按住拖动，沿着手指铺真线或封路；松手算一笔。手指画容易歪，要直线用「直线」工具。</template>
            <template v-else>
              拖一个框：「紫→真线」把框内的紫色桥接格铺成真线，「紫→封路」把框内的紫色封死，原来的真线和封死都不动；
              「全部真线 / 全部封路」不管原来是什么。画笔的线最后盖，不会被框选误伤。
            </template>
            改完路线立刻重算；导出后是 mapStrokes / mapRects。
          </div>
          <!-- 只认我画的：原路网真线全部降为紫色，其余没画的部分保持紫色或封死（用户 9/17） -->
          <label class="row mt-6 small dev-check">
            <input type="checkbox" :checked="!!ov.demote" @change="toggleDemote()" />
            <span>只认我画的：把原路网所有真线降成紫色桥接格（代价 ×6），只有画出来的才是真线，其余没画的保持紫色或封死</span>
          </label>
          <div v-if="strokes.length || rects.length" class="row wrap mt-6" style="gap:4px;align-items:center">
            <span class="small" style="font-weight:700">笔迹</span>
            <button
              v-for="(s, i) in strokes"
              :key="'s' + i"
              class="dev-layer"
              :class="{ on: selStroke === i }"
              @click="selectStroke(i)"
            ><i class="dev-sw" :class="s.mode"></i>{{ i + 1 }} · {{ s.mode === 'block' ? '封' : '铺' }} {{ strokeLen(s) }} 格</button>
            <button
              v-for="(q, i) in rects"
              :key="'r' + i"
              class="dev-layer"
              :class="{ on: selRect === i }"
              @click="selectRect(i)"
            ><i class="dev-sw" :class="rectSw(q.mode)"></i>框 {{ i + 1 }} · {{ rectName(q.mode) }}</button>
            <button class="pbtn sm ghost" :disabled="selStroke == null && selRect == null" @click="removeSel()">删除选中</button>
            <button class="pbtn sm ghost" @click="undoLast()">撤销上一笔</button>
          </div>
          <div v-if="mapStrokes.length || mapRects.length || mapDemoteBase" class="small muted mt-6">
            代码里还固化了 {{ mapStrokes.length }} 笔线、{{ mapRects.length }} 个框<template v-if="mapDemoteBase">，且已开「只认我画的」</template>（虚线显示，在这里改不了）。
          </div>
        </template>

        <template v-else>
          <div class="small">拖动图上的起点十字标，或点图上任意位置把导航起点挪过去；方向键微调一格（Shift ×10）。</div>
          <div class="small muted mt-6">现在：x {{ start.x.toFixed(4) }} · y {{ start.y.toFixed(4) }}<template v-if="ov.start">（本机已改，原值 x {{ mapOrig.start.x }} · y {{ mapOrig.start.y }}）</template></div>
        </template>

        <!-- 试走：改完立刻验证；改了出入口 / 画笔 / 起点 / 到达门后画着的路线会自动重算 -->
        <div class="row wrap mt-10" style="gap:6px;align-items:center">
          <select v-if="mode !== 'spot' && mode !== 'door'" v-model="sel" class="dev-sel">
            <option :value="null">— 选展位 —</option>
            <option v-for="no in noList" :key="no" :value="no">{{ no }} {{ ipOf(no) }}</option>
          </select>
          <button class="pbtn sm" :disabled="!sel" @click="runTest()">从起点试走到 {{ sel || '…' }}</button>
          <span v-if="testLen" class="small muted">约 {{ testLen }}</span>
        </div>
        <div class="row wrap mt-6" style="gap:6px;align-items:center">
          <button class="pbtn sm ghost" @click="runAll()">试走全部 {{ noList.length }} 个展位</button>
          <span v-if="allInfo" class="small muted">{{ allInfo }}</span>
          <button v-if="testPts.length || allPts.length" class="pbtn sm ghost" @click="clearRoutes()">清掉路线</button>
        </div>
        <div class="small muted mt-6">
          画着的路线在改动出入口 / 画笔 / 起点 / 到达门 / 热区后会自动重算，盯着看有没有穿广场、越围栏、专程折返。
        </div>
      </div>
    </div>

    <!-- 导出 -->
    <div class="pcard mt-10">
      <div class="pcard-body">
        <div class="fold-head" @click="openOut = !openOut">
          <div class="pcard-title">导出代码</div>
          <span class="fold-arrow" :class="{ open: openOut }">&gt;</span>
        </div>
        <template v-if="openOut">
          <div class="small muted mt-6">贴回 src/data/mapSpots.js 后，回来点「已改 N 处 → 全部清空」。</div>
          <textarea class="dev-out mt-6" readonly :value="exported"></textarea>
          <div class="row wrap mt-6" style="gap:6px">
            <button class="pbtn sm" @click="copyOut()">{{ copied ? '已复制' : '复制' }}</button>
            <button class="pbtn sm ghost" @click="wipe()">清空本机覆盖</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'DevMapPage' }
</script>

<script setup>
// 开发者模式（用户 9/15）：脚本识别出来的热区 / 到达门 / 出入口难免有偏差，这里可以直接在图上改，
// 存本机 localStorage（rl26.dev）并立刻对导航生效（mapSpots.js 底部的 applyDev 原地合并），
// 核对好了再导出代码贴回 src/data/mapSpots.js。不挂在底栏里，走 #/dev 进。
// 用户 9/16：不止热区，起点 / 出入口 / 到达门 / 路网都要常显在图上、能直接拖，方便复核规划出来的路线。
// 用户 9/17：加「路网画笔」；「已改 N 处」点开气泡逐条定位 / 单独撤销；
//            画笔再加「直线」（两点一段、接着上一段末端画、吸附端点）、「框选」（紫→真线 / 紫→封路）、「只认我画的」开关。
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { booths } from '../data/booths.js'
import { venueMap } from '../data/rules.js'
import {
  mapSpots, mapDoors, mapStart, mapGates, mapStrokes, mapRects, mapDemoteBase, mapOrig, walkGrid,
  doorPoints, lineCells, DOOR_SIDES, loadDev, saveDev, clearDev,
} from '../data/mapSpots.js'
import { findRoute } from '../utils/route.js'
import { fmtDist } from '../utils/plan.js'

const MODES = [
  { key: 'spot', name: '热区' },
  { key: 'door', name: '到达门' },
  { key: 'gate', name: '出入口' },
  { key: 'brush', name: '路网画笔' },
  { key: 'start', name: '起点' },
]
// 图层（与图上的颜色一致）：热区红框 / 到达门黄边 / 出入口绿（开）红（封）块 / 画笔青（铺）红（封）线 / 起点红十字 / 路网青（真线）紫（桥）
const LAYERS = [
  { key: 'spot', name: '热区' },
  { key: 'door', name: '到达门' },
  { key: 'gate', name: '出入口' },
  { key: 'brush', name: '画笔' },
  { key: 'start', name: '起点' },
  { key: 'grid', name: '路网' },
]
const DOORS = [
  { key: 'A', name: '左' },
  { key: 'B', name: '上' },
  { key: 'C', name: '右' },
  { key: 'D', name: '下' },
]
const HANDLES = ['nw', 'ne', 'sw', 'se']
const TOOLS = [
  { key: 'line', name: '直线' },
  { key: 'free', name: '自由画' },
  { key: 'rect', name: '框选' },
]
const RECT_MODES = [
  { key: 'fillOpen', name: '紫→真线' },
  { key: 'fillBlock', name: '紫→封路' },
  { key: 'open', name: '全部真线' },
  { key: 'block', name: '全部封路' },
]
const rectName = (m) => RECT_MODES.find((x) => x.key === m)?.name || m
const rectSw = (m) => (m === 'fillBlock' || m === 'block' ? 'block' : 'open')

const base = import.meta.env.BASE_URL
const p2 = venueMap.slices.find((s) => s.spots)
const mapSrc = base + (p2.full || p2.src)

const ov = ref(loadDev())
const mode = ref('spot')
const show = ref({ spot: true, door: true, gate: true, brush: true, start: true, grid: true })
const sel = ref(null)
const selGate = ref(null)
const selStroke = ref(null)
const selRect = ref(null)
const drawing = ref(false)
const gateMode = ref('open')
const gateR = ref(3)
const brushTool = ref('line')
const brushMode = ref('open')
const brushR = ref(0)
const brushPan = ref(false)
const rectMode = ref('fillOpen')
const cur = ref(null) // 自由画正在画的一笔 { mode, r, pts: [[gx, gy], …] }
const chain = ref(null) // 直线工具正在接着画的那条折线在 ov.strokes 里的下标
const hover = ref(null) // 直线工具：指针所在格（画橡皮筋用）
const rectDraft = ref(null) // 框选正在拖的框 { x0, y0, x1, y1 }
const popOpen = ref(false)
const openOut = ref(false)
const copied = ref(false)
const testPts = ref([])
const testLen = ref('')
const allPts = ref([])
const allInfo = ref('')

// 直接读共享对象（applyDev 已经把覆盖合并进去了），改的时候同时写 ov 与共享对象
// 这三个都是 ref 包住共享对象：一定要「通过 .value 改」，直接改原对象 Vue 收不到通知
const spots = ref(mapSpots)
const doors = ref(mapDoors)
const start = ref(mapStart)
const gates = computed(() => ov.value.gates || [])
const strokes = computed(() => ov.value.strokes || [])
const rects = computed(() => ov.value.rects || [])
const curGate = computed(() => (selGate.value != null ? gates.value[selGate.value] || null : null))
const chainStroke = computed(() => (chain.value != null ? strokes.value[chain.value] || null : null))
const chainLast = computed(() => chainStroke.value?.pts[chainStroke.value.pts.length - 1] || null)
const noList = computed(() => Object.keys(spots.value).sort())
const ipOf = (no) => booths.filter((b) => String(b.no).split('/').some((s) => s.trim() === no)).map((b) => b.ip).join(' / ')
const sidesOf = (no) => [...String(doors.value[no] || '')].filter((c) => 'ABCD'.includes(c))

// ---- 本机改动清单（「已改 N 处」气泡）：每条能定位、能单独撤销 ----
const fmtRect = (r) => r.map((v) => v.toFixed(4)).join(', ')
const changes = computed(() => {
  const o = ov.value
  const out = []
  for (const no of Object.keys(o.spots).sort()) {
    const orig = mapOrig.spots[no]
    out.push({
      id: 'spot:' + no,
      kind: 'spot',
      no,
      label: `热区 ${no}${orig ? '' : '（新建）'}`,
      detail: orig ? `原 [${fmtRect(orig)}] → [${fmtRect(spots.value[no] || o.spots[no])}]` : `[${fmtRect(o.spots[no])}]`,
    })
  }
  for (const no of o.removed) out.push({ id: 'removed:' + no, kind: 'spot', no, label: `删掉了热区 ${no}`, detail: mapOrig.spots[no] ? '撤销即恢复原框' : '' })
  for (const no of Object.keys(o.doors).sort()) {
    out.push({ id: 'door:' + no, kind: 'door', no, label: `到达门 ${no}`, detail: `${mapOrig.doors[no] || '（无）'} → ${doors.value[no]}` })
  }
  o.gates.forEach((g, i) =>
    out.push({ id: 'gate:' + i, kind: 'gate', i, label: `出入口 ${i + 1} · ${g.mode === 'block' ? '封死' : '开口'} r${g.r}`, detail: `x ${g.x} · y ${g.y}` }),
  )
  if (o.demote) out.push({ id: 'demote', kind: 'grid', label: '只认我画的：原路网真线全部降为紫色', detail: '撤销即恢复原路网真线' })
  ;(o.rects || []).forEach((q, i) =>
    out.push({ id: 'rect:' + i, kind: 'brush', i, label: `框选 ${i + 1} · ${rectName(q.mode)}`, detail: `格 (${q.x0},${q.y0}) – (${q.x1},${q.y1})` }),
  )
  o.strokes.forEach((s, i) =>
    out.push({ id: 'stroke:' + i, kind: 'brush', i, label: `画笔 ${i + 1} · ${s.mode === 'block' ? '封' : '铺'} ${strokeLen(s)} 格`, detail: `笔宽 ${2 * s.r + 1} 格，${s.pts.length} 个折点` }),
  )
  if (o.start) out.push({ id: 'start', kind: 'start', label: '起点', detail: `原 (${mapOrig.start.x}, ${mapOrig.start.y}) → (${o.start.x}, ${o.start.y})` })
  return out
})
// 点名称：切到对应模式、选中、滚到它那儿
function locate(c) {
  if (c.kind === 'spot') {
    pick(mode.value === 'door' ? 'door' : 'spot')
    if (spots.value[c.no]) {
      sel.value = c.no
      const r = spots.value[c.no]
      scrollTo({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 })
    }
  } else if (c.kind === 'door') {
    pick('door')
    sel.value = c.no
    const r = spots.value[c.no]
    if (r) scrollTo({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 })
  } else if (c.kind === 'gate') {
    pick('gate')
    selGate.value = c.i
    scrollTo(gates.value[c.i])
  } else if (c.id.startsWith('rect:')) {
    pick('brush')
    selectRect(c.i)
    const q = rects.value[c.i]
    scrollTo({ x: ((q.x0 + q.x1) / 2 + 0.5) / walkGrid.w, y: ((q.y0 + q.y1) / 2 + 0.5) / walkGrid.h })
  } else if (c.kind === 'brush') {
    pick('brush')
    selectStroke(c.i)
    const [gx, gy] = strokes.value[c.i].pts[0]
    scrollTo({ x: (gx + 0.5) / walkGrid.w, y: (gy + 0.5) / walkGrid.h })
  } else if (c.kind === 'grid') {
    pick('brush')
  } else if (c.kind === 'start') {
    pick('start')
    scrollTo(start.value)
  }
}
// 点 ✕：只撤销这一处，其余改动保留。热区 / 到达门 / 起点靶回 mapOrig 的原值（覆盖是原地改的）
function undo(c) {
  const o = ov.value
  if (c.id.startsWith('removed:')) {
    o.removed = o.removed.filter((n) => n !== c.no)
    if (mapOrig.spots[c.no] && !spots.value[c.no]) spots.value[c.no] = [...mapOrig.spots[c.no]]
  } else if (c.kind === 'spot') {
    delete o.spots[c.no]
    const orig = mapOrig.spots[c.no]
    if (orig) spots.value[c.no].splice(0, 4, ...orig)
    else delete spots.value[c.no]
    if (sel.value === c.no && !spots.value[c.no]) sel.value = null
  } else if (c.kind === 'door') {
    delete o.doors[c.no]
    if (mapOrig.doors[c.no]) doors.value[c.no] = mapOrig.doors[c.no]
    else delete doors.value[c.no]
  } else if (c.kind === 'gate') {
    o.gates.splice(c.i, 1)
    selGate.value = null
  } else if (c.id.startsWith('rect:')) {
    o.rects.splice(c.i, 1)
    selRect.value = null
  } else if (c.kind === 'brush') {
    endChain()
    o.strokes.splice(c.i, 1)
    selStroke.value = null
  } else if (c.kind === 'grid') {
    o.demote = false
  } else if (c.kind === 'start') {
    o.start = null
    Object.assign(start.value, mapOrig.start)
  }
  commit()
  if (!changes.value.length) popOpen.value = false
}

// ---- 图的显示尺寸 ----
const NAT = { w: 6000, h: 4344 }
const imgW = ref(1200)
const imgH = computed(() => Math.round((imgW.value * NAT.h) / NAT.w))
const scroller = ref(null)
const img = ref(null)
const gridCv = ref(null)
const setZoom = (d) => {
  imgW.value = Math.max(300, Math.min(6000, Math.round(imgW.value * (d > 0 ? 1.5 : 1 / 1.5))))
}
const fit = () => {
  imgW.value = Math.max(300, Math.round(scroller.value?.clientWidth || 360))
}
// 把某个归一化坐标滚到可视区中间（试走 / 选展位 / 定位改动后用）
function scrollTo(p) {
  const el = scroller.value
  if (!el || !p) return
  el.scrollLeft = p.x * imgW.value - el.clientWidth / 2
  el.scrollTop = p.y * imgH.value - el.clientHeight / 2
}
onMounted(() => {
  fit()
  drawGrid()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// ---- 路网叠加：把 walkGrid 按格画到一张 360×260 的 canvas 上，CSS 拉伸到图的尺寸（pixelated） ----
// 青 = '2' 图上真有线，紫 = '1' 闭运算补出来的桥接格（走它要付 BRIDGE_COST 倍代价），'0' 透明
function drawGrid() {
  const cv = gridCv.value
  if (!cv) return
  const { w, h, rows } = walkGrid
  const ctx = cv.getContext('2d')
  const im = ctx.createImageData(w, h)
  const d = im.data
  for (let y = 0; y < h; y++) {
    const row = rows[y]
    for (let x = 0; x < w; x++) {
      const c = row.charCodeAt(x)
      if (c === 48) continue
      const i = (y * w + x) * 4
      if (c === 50) {
        d[i] = 0
        d[i + 1] = 229
        d[i + 2] = 255
        d[i + 3] = 120
      } else {
        d[i] = 170
        d[i + 1] = 60
        d[i + 2] = 255
        d[i + 3] = 165
      }
    }
  }
  ctx.putImageData(im, 0, 0)
}

// ---- 坐标换算 ----
function norm(e) {
  const r = img.value.getBoundingClientRect()
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
}
const round4 = (v) => Math.round(v * 1e4) / 1e4
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const pct = (v) => `${(v * 100).toFixed(4)}%`
const boxStyle = (r) => ({ left: pct(r[0]), top: pct(r[1]), width: pct(r[2]), height: pct(r[3]) })
const dotStyle = (p) => ({ left: pct(p.x), top: pct(p.y) })
// 出入口方块画成它实际盖住的格数（2r+1 格），和 stampGates 的取整方式一致：按格中心对齐
const cellOf = (g) => ({ x: Math.round(g.x * walkGrid.w), y: Math.round(g.y * walkGrid.h) })
const gateStyle = (g) => {
  const c = cellOf(g)
  const r = Math.max(0, Math.round(g.r ?? 3))
  return {
    left: pct((c.x + 0.5) / walkGrid.w),
    top: pct((c.y + 0.5) / walkGrid.h),
    width: `${((2 * r + 1) / walkGrid.w) * imgW.value}px`,
    height: `${((2 * r + 1) / walkGrid.h) * imgH.value}px`,
  }
}
const poly = (pts) => pts.map((p) => `${p.x * imgW.value},${p.y * imgH.value}`).join(' ')
// 画笔用的格坐标 ↔ 像素：格 (gx, gy) 的中心
const cellX = (gx) => ((gx + 0.5) / walkGrid.w) * imgW.value
const cellY = (gy) => ((gy + 0.5) / walkGrid.h) * imgH.value
const cellPx = (r) => ((2 * r + 1) / walkGrid.w) * imgW.value
const cellPoly = (pts) => pts.map(([gx, gy]) => `${cellX(gx)},${cellY(gy)}`).join(' ')
const cellRect = ([gx, gy], r) => ({
  x: ((gx - r) / walkGrid.w) * imgW.value,
  y: ((gy - r) / walkGrid.h) * imgH.value,
  width: cellPx(r),
  height: ((2 * r + 1) / walkGrid.h) * imgH.value,
})
// 框选的格矩形（闭区间）→ 像素框
const rectBox = (q) => {
  const x0 = Math.min(q.x0, q.x1)
  const y0 = Math.min(q.y0, q.y1)
  const x1 = Math.max(q.x0, q.x1)
  const y1 = Math.max(q.y0, q.y1)
  return {
    x: (x0 / walkGrid.w) * imgW.value,
    y: (y0 / walkGrid.h) * imgH.value,
    width: ((x1 - x0 + 1) / walkGrid.w) * imgW.value,
    height: ((y1 - y0 + 1) / walkGrid.h) * imgH.value,
  }
}
const cellAt = (p) => [clamp(Math.floor(p.x * walkGrid.w), 0, walkGrid.w - 1), clamp(Math.floor(p.y * walkGrid.h), 0, walkGrid.h - 1)]
// 一笔盖了多少格（沿折线数，不含笔宽）
function strokeLen(s) {
  let n = 1
  for (let i = 1; i < s.pts.length; i++) n += Math.max(Math.abs(s.pts[i][0] - s.pts[i - 1][0]), Math.abs(s.pts[i][1] - s.pts[i - 1][1]))
  return n
}

// ---- 落盘 ----
// 拖动过程中每一步都落盘（刷新也不丢），但路线重算只在松手后做一次（81 条全量约 120ms，跟着指针跑会卡）
let dragging = false
function commit() {
  saveDev(JSON.parse(JSON.stringify(ov.value)))
  if (dragging) return
  drawGrid()
  rerun()
}
function rerun() {
  if (testPts.value.length && sel.value) runTest(false)
  if (allPts.value.length) runAll()
}
function putSpot(no, rect) {
  const r = rect.map((v) => Math.round(v * 1e4) / 1e4)
  ov.value.spots[no] = r
  if (spots.value[no]) spots.value[no].splice(0, 4, ...r)
  else spots.value[no] = [...r]
  commit()
}

// 通用拖动：onDelta 收归一化位移，松手后 onEnd(moved)
function startDrag(e, onDelta, onEnd) {
  e.preventDefault()
  const s = norm(e)
  let moved = false
  dragging = true
  const mv = (ev) => {
    const p = norm(ev)
    moved = true
    onDelta(p.x - s.x, p.y - s.y)
  }
  const up = () => {
    window.removeEventListener('pointermove', mv)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    dragging = false
    onEnd?.(moved)
  }
  window.addEventListener('pointermove', mv)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
}

// ---- 热区拖动 ----
function onRectDown(e, no, handle) {
  sel.value = no
  if (mode.value !== 'spot') return
  const rect = [...spots.value[no]]
  startDrag(
    e,
    (dx, dy) => {
      let [x, y, w, h] = rect
      if (!handle) {
        x += dx
        y += dy
      } else {
        if (handle.includes('w')) {
          x += dx
          w -= dx
        } else w += dx
        if (handle.includes('n')) {
          y += dy
          h -= dy
        } else h += dy
      }
      putSpot(no, [x, y, Math.max(0.004, w), Math.max(0.004, h)])
    },
    (moved) => moved && commit(),
  )
}

// ---- 出入口拖动 / 编辑 ----
function onGateDown(e, i) {
  if (mode.value !== 'gate') return
  selGate.value = i
  const g = ov.value.gates[i]
  const { x, y } = g
  startDrag(
    e,
    (dx, dy) => {
      g.x = round4(x + dx)
      g.y = round4(y + dy)
    },
    (moved) => moved && commit(),
  )
}
function setGate(patch) {
  const g = curGate.value
  if (!g) return
  // 输入框清空时是 NaN，别写进去
  for (const k of Object.keys(patch)) if (typeof patch[k] === 'number' && !Number.isFinite(patch[k])) return
  Object.assign(g, patch)
  commit()
}
function removeGate(i) {
  if (i == null || !ov.value.gates[i]) return
  ov.value.gates.splice(i, 1)
  selGate.value = null
  commit()
}

// ---- 路网画笔 ----
function setTool(t) {
  endChain()
  brushTool.value = t
}
function selectStroke(i) {
  selStroke.value = selStroke.value === i ? null : i
  selRect.value = null
}
function selectRect(i) {
  selRect.value = selRect.value === i ? null : i
  selStroke.value = null
}
// 自由画：按住拖动记格坐标，松手简化成折点存一笔。
// 先按格插值成单步序列，再只留方向变化的点：相邻两个折点之间 Bresenham 能原样还原，导出才短
function simplifyStroke(raw) {
  const cells = [raw[0]]
  for (let i = 1; i < raw.length; i++) {
    const seg = lineCells(raw[i - 1], raw[i])
    for (let k = 1; k < seg.length; k++) cells.push(seg[k])
  }
  const out = [cells[0]]
  let dir = null
  for (let k = 1; k < cells.length; k++) {
    const d = `${cells[k][0] - cells[k - 1][0]},${cells[k][1] - cells[k - 1][1]}`
    if (d === dir) out[out.length - 1] = cells[k]
    else {
      out.push(cells[k])
      dir = d
    }
  }
  return out
}
function beginStroke(e) {
  e.preventDefault()
  cur.value = { mode: brushMode.value, r: brushR.value, pts: [cellAt(norm(e))] }
  const mv = (ev) => {
    if (!cur.value) return
    const n = cellAt(norm(ev))
    const last = cur.value.pts[cur.value.pts.length - 1]
    if (n[0] === last[0] && n[1] === last[1]) return
    cur.value.pts.push(n)
  }
  const up = () => {
    window.removeEventListener('pointermove', mv)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    const s = cur.value
    cur.value = null
    if (!s) return
    s.pts = simplifyStroke(s.pts)
    ov.value.strokes.push(s)
    selectStroke(ov.value.strokes.length - 1)
    commit()
  }
  window.addEventListener('pointermove', mv)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
}
// 直线：点一下起点、再点一下终点；接着点就从上一段末端继续（用户 9/17：手指画容易歪）。
// 点到已有线的端点 / 折点 3.5 格以内会吸上去，线就接上了
function snapToPts(c, skipIdx) {
  let best = null
  let bd = 3.5
  strokes.value.forEach((s, i) => {
    if (i === skipIdx) return
    for (const p of s.pts) {
      const d = Math.hypot(p[0] - c[0], p[1] - c[1])
      if (d < bd) {
        bd = d
        best = p
      }
    }
  })
  return best ? [best[0], best[1]] : c
}
function lineClick(e) {
  e.preventDefault()
  let c = cellAt(norm(e))
  if (!chainStroke.value) {
    c = snapToPts(c)
    ov.value.strokes.push({ mode: brushMode.value, r: brushR.value, pts: [c] })
    chain.value = ov.value.strokes.length - 1
    selStroke.value = chain.value
    selRect.value = null
  } else {
    const s = ov.value.strokes[chain.value]
    const last = s.pts[s.pts.length - 1]
    c = snapToPts(c, chain.value)
    if (c[0] === last[0] && c[1] === last[1]) return
    s.pts.push(c)
  }
  commit()
}
function endChain() {
  // 只点了一个点就收笔：这一笔只是个孤点，没意义，删掉
  const s = chainStroke.value
  if (s && s.pts.length < 2) {
    ov.value.strokes.splice(chain.value, 1)
    selStroke.value = null
    chain.value = null
    hover.value = null
    commit()
    return
  }
  chain.value = null
  hover.value = null
}
function chainBack() {
  const s = chainStroke.value
  if (!s) return
  if (s.pts.length > 1) s.pts.pop()
  else {
    ov.value.strokes.splice(chain.value, 1)
    selStroke.value = null
    chain.value = null
    hover.value = null
  }
  commit()
}
// 框选：拖一个格矩形，松手按 rectMode 盖章
function beginRect(e) {
  e.preventDefault()
  const c0 = cellAt(norm(e))
  rectDraft.value = { x0: c0[0], y0: c0[1], x1: c0[0], y1: c0[1] }
  const mv = (ev) => {
    if (!rectDraft.value) return
    const c = cellAt(norm(ev))
    rectDraft.value.x1 = c[0]
    rectDraft.value.y1 = c[1]
  }
  const up = () => {
    window.removeEventListener('pointermove', mv)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    const d = rectDraft.value
    rectDraft.value = null
    if (!d) return
    if (!ov.value.rects) ov.value.rects = []
    ov.value.rects.push({ x0: Math.min(d.x0, d.x1), y0: Math.min(d.y0, d.y1), x1: Math.max(d.x0, d.x1), y1: Math.max(d.y0, d.y1), mode: rectMode.value })
    selectRect(ov.value.rects.length - 1)
    commit()
  }
  window.addEventListener('pointermove', mv)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
}
function removeStroke(i) {
  if (i == null || i < 0 || !ov.value.strokes[i]) return
  if (chain.value === i) {
    chain.value = null
    hover.value = null
  } else if (chain.value != null && chain.value > i) chain.value--
  ov.value.strokes.splice(i, 1)
  selStroke.value = null
  commit()
}
function removeRect(i) {
  if (i == null || i < 0 || !ov.value.rects?.[i]) return
  ov.value.rects.splice(i, 1)
  selRect.value = null
  commit()
}
function removeSel() {
  if (selStroke.value != null) removeStroke(selStroke.value)
  else if (selRect.value != null) removeRect(selRect.value)
}
// 撤销上一笔：正在接着画的线先退一个点；否则删最后一笔线，没有线再删最后一个框
function undoLast() {
  if (chainStroke.value) chainBack()
  else if (strokes.value.length) removeStroke(strokes.value.length - 1)
  else if (rects.value.length) removeRect(rects.value.length - 1)
}
function toggleDemote() {
  ov.value.demote = !ov.value.demote
  commit()
}
function onCanvasMove(e) {
  if (mode.value === 'brush' && brushTool.value === 'line' && chainStroke.value) hover.value = cellAt(norm(e))
}

// ---- 起点拖动 ----
function moveStart(p) {
  ov.value.start = { x: round4(p.x), y: round4(p.y) }
  Object.assign(start.value, ov.value.start)
}
function onStartDown(e) {
  if (mode.value !== 'start') return
  const { x, y } = start.value
  startDrag(
    e,
    (dx, dy) => moveStart({ x: x + dx, y: y + dy }),
    (moved) => moved && commit(),
  )
}

// ---- 画布点击：新建热区 / 放出入口 / 画笔 / 移起点 ----
function onCanvasDown(e) {
  if (mode.value === 'brush') {
    if (brushPan.value) return
    if (brushTool.value === 'free') beginStroke(e)
    else if (brushTool.value === 'rect') beginRect(e)
    else lineClick(e)
    return
  }
  const p = norm(e)
  if (mode.value === 'gate') {
    ov.value.gates.push({ x: round4(p.x), y: round4(p.y), r: gateR.value, mode: gateMode.value })
    selGate.value = ov.value.gates.length - 1
    commit()
    return
  }
  if (mode.value === 'start') {
    moveStart(p)
    commit()
    return
  }
  if (drawing.value) {
    const no = window.prompt('新热区的展位号（如 A41）')
    if (!no) return
    putSpot(no.trim().toUpperCase(), [p.x, p.y, 0.03, 0.02])
    sel.value = no.trim().toUpperCase()
    drawing.value = false
  }
}
function removeSpot() {
  if (!sel.value) return
  const no = sel.value
  delete spots.value[no]
  delete ov.value.spots[no]
  if (!ov.value.removed.includes(no)) ov.value.removed.push(no)
  sel.value = null
  commit()
}
function setNum(i, v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return
  const r = [...spots.value[sel.value]]
  r[i] = n
  putSpot(sel.value, r)
}
// 到达门可以配多条边：最少留 1 条（点掉最后一条无效），最多 4 条；顺序固定 A→B→C→D
function toggleDoor(d) {
  const cur = sidesOf(sel.value)
  const next = cur.includes(d) ? cur.filter((c) => c !== d) : [...cur, d]
  if (!next.length) return
  const v = [...DOOR_SIDES].filter((c) => next.includes(c)).join('')
  ov.value.doors[sel.value] = v
  doors.value[sel.value] = v
  commit()
}
function pick(m) {
  if (mode.value === 'brush' && m !== 'brush') endChain()
  mode.value = m
  drawing.value = false
}

// 键盘：热区模式微调选中热区（一格 = 图上 1px，Alt 改宽高）；出入口 / 起点模式按路网一格挪、Delete 删出入口；
// 画笔模式 Esc 收笔、Backspace 退一个点（没在画线时删选中）、Delete 删选中、Ctrl+Z 撤销上一笔
function onKey(e) {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target?.tagName)) return
  const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const d = map[e.key]
  const mul = e.shiftKey ? 10 : 1
  const isDel = e.key === 'Delete' || e.key === 'Backspace'
  if (mode.value === 'brush') {
    if (e.key === 'Escape') {
      e.preventDefault()
      endChain()
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      undoLast()
    } else if (e.key === 'Backspace' && chainStroke.value) {
      e.preventDefault()
      chainBack()
    } else if (isDel && (selStroke.value != null || selRect.value != null)) {
      e.preventDefault()
      removeSel()
    }
    return
  }
  if (mode.value === 'gate') {
    const g = curGate.value
    if (!g) return
    if (isDel) {
      e.preventDefault()
      removeGate(selGate.value)
      return
    }
    if (!d) return
    e.preventDefault()
    setGate({ x: round4(g.x + (d[0] * mul) / walkGrid.w), y: round4(g.y + (d[1] * mul) / walkGrid.h) })
    return
  }
  if (mode.value === 'start') {
    if (!d) return
    e.preventDefault()
    moveStart({ x: start.value.x + (d[0] * mul) / walkGrid.w, y: start.value.y + (d[1] * mul) / walkGrid.h })
    commit()
    return
  }
  if (!sel.value || mode.value !== 'spot' || !d) return
  e.preventDefault()
  const k = mul / NAT.w
  const ky = mul / NAT.h
  const r = [...spots.value[sel.value]]
  if (e.altKey) {
    r[2] += d[0] * k
    r[3] += d[1] * ky
  } else {
    r[0] += d[0] * k
    r[1] += d[1] * ky
  }
  putSpot(sel.value, r)
}

// 门离最近一格真线有多远（>3 格基本就是开在死面上了），每条边各算一个
function gapAt(p) {
  const cx = Math.round(p.x * walkGrid.w)
  const cy = Math.round(p.y * walkGrid.h)
  for (let r = 0; r <= 25; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= walkGrid.w || y >= walkGrid.h) continue
        if (walkGrid.rows[y][x] === '2') return r
      }
    }
  }
  return 99
}
// 四条边各自离最近一格真线几格：0 = 正对过道，>3 = 这边没有路
const PAD = 0.006
const sideGaps = computed(() => {
  const r = sel.value && spots.value[sel.value]
  if (!r) return {}
  const [x, y, w, h] = r
  return {
    A: gapAt({ x: x - PAD, y: y + h / 2 }),
    B: gapAt({ x: x + w / 2, y: y - PAD }),
    C: gapAt({ x: x + w + PAD, y: y + h / 2 }),
    D: gapAt({ x: x + w / 2, y: y + h + PAD }),
  }
})
const gapOf = (d) => sideGaps.value[d] ?? 99

// ---- 试走 ----
// 折线长度换成米：与 utils/plan.js 的 fmtDist 同一比例尺（按 2400 宽的 P2 像素算）
const PX_W = 2400
const PX_H = 1738
function pathLen(pts) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.hypot((pts[i].x - pts[i - 1].x) * PX_W, (pts[i].y - pts[i - 1].y) * PX_H)
  return d
}
function runTest(scroll = true) {
  if (!sel.value) return
  const pts = findRoute(walkGrid, mapStart, doorPoints(sel.value), mapSpots) || []
  testPts.value = pts
  testLen.value = pts.length ? fmtDist(pathLen(pts)) : '走不通'
  const r = spots.value[sel.value]
  if (scroll && r) scrollTo({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 })
}
// 全部展位各画一条淡线：一眼看出哪条穿了广场、越了围栏或专程折返
function runAll() {
  const out = []
  const bad = []
  let total = 0
  for (const no of noList.value) {
    const pts = findRoute(walkGrid, mapStart, doorPoints(no), mapSpots)
    if (pts?.length) {
      out.push(pts)
      total += pathLen(pts)
    } else bad.push(no)
  }
  allPts.value = out
  allInfo.value = `${out.length} 条可达，合计约 ${fmtDist(total)}${bad.length ? `；走不通：${bad.join(' / ')}` : ''}`
}
function clearRoutes() {
  testPts.value = []
  testLen.value = ''
  allPts.value = []
  allInfo.value = ''
}

// ---- 导出 ----
const exported = computed(() => {
  const o = ov.value
  const out = []
  const sp = Object.keys(o.spots).sort()
  if (sp.length) {
    out.push('// mapSpots 改动')
    for (const no of sp) out.push(`  ${no}: [${spots.value[no].join(', ')}],`)
  }
  if (o.removed.length) out.push(`// 删掉的热区：${o.removed.join(' / ')}`)
  const dr = Object.keys(o.doors).sort()
  if (dr.length) {
    out.push('// mapDoors 改动')
    for (const no of dr) out.push(`  ${no}: '${doors.value[no]}',`)
  }
  if (o.start) out.push(`// mapStart\nexport const mapStart = { x: ${start.value.x}, y: ${start.value.y}, name: '${start.value.name}' }`)
  if (o.gates.length) {
    out.push('// mapSpots.js 的 mapGates 换成这个（已含原有的）')
    out.push('export const mapGates = [')
    for (const g of [...mapGates, ...o.gates]) out.push(`  { x: ${g.x}, y: ${g.y}, r: ${g.r}, mode: '${g.mode}' },`)
    out.push(']')
  }
  if (o.demote) out.push('// 只认我画的：原路网真线全部降为桥接格\nexport const mapDemoteBase = true')
  if (o.rects?.length) {
    out.push('// mapSpots.js 的 mapRects 换成这个（已含原有的）')
    out.push('export const mapRects = [')
    for (const q of [...mapRects, ...o.rects]) out.push(`  { x0: ${q.x0}, y0: ${q.y0}, x1: ${q.x1}, y1: ${q.y1}, mode: '${q.mode}' },`)
    out.push(']')
  }
  if (o.strokes.length) {
    out.push('// mapSpots.js 的 mapStrokes 换成这个（已含原有的）')
    out.push('export const mapStrokes = [')
    for (const s of [...mapStrokes, ...o.strokes]) out.push(`  { mode: '${s.mode}', r: ${s.r}, pts: [${s.pts.map(([x, y]) => `[${x}, ${y}]`).join(', ')}] },`)
    out.push(']')
  }
  return out.length ? out.join('\n') : '（本机还没有改动）'
})
function copyOut() {
  navigator.clipboard?.writeText(exported.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1200)
}
function wipe() {
  if (!window.confirm('清掉本机所有覆盖并刷新页面？')) return
  clearDev()
  location.reload()
}
</script>
