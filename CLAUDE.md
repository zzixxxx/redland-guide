# CLAUDE.md — redland-guide 开发约定

后续所有开发以本文件为准。改了约定要同步改这里。

## 1. 项目是什么

- 小红书 **RED LAND 2026** 线下活动（2026-10-02 ~ 10-06，上海杨浦复兴岛船台 PARK）的**手机端快速查询攻略**。
- 线上地址：https://zzixxxx.github.io/redland-guide/ （GitHub Pages，push `main` 自动部署）
- 仓库：https://github.com/zzixxxx/redland-guide
- 四个底部 Tab：
  1. **展位攻略**（`/booths`）：每日时刻横条 → 主线玩法折叠卡（含本机打卡进度）→ 官方场馆平面图卡 → A/B/C 区 IP 展位列表（搜索 / 区域筹选 / 有攻略 / 已打卡）。点展位进 **展位详情**（`/booth/:id`）：官方一句话、展会信息、展台活动、舞台活动、展台任务、奖励一览、官方笔记原图、来源链接；无详情时给小红书搜索关键词。
  2. **花车巡礼**（`/parade`）：打卡 / 巡游时间 → 官方花车巡礼路线图卡（可折叠，默认展开）→ 「头号花车 / 专属花车」两张贴纸当 tab + DAY1–5 芯片（两边共用）→ 头号花车当日出场角色 或 8 台 IP 专属花车（效果图 + 按当前 DAY 的出席嘉宾名单 + 笔记图）→ 主角方阵 → 页尾「📎 来源」卡（可折叠，默认展开，全页来源集中在这里，卡片里不再各写一行；**样式与详情页来源卡一致**：来源行 + 标题 + 红色「去官方活动页看原文」大按钮 + 其余笔记一列 `.pbtn.block`「作者 · 标题」，用户 9/17）。
  3. **月光舞台**（`/stage`）：DAY1–5 切换 → 主题横幅 → 节目单（歌手 / 曲目 / 来源 IP）→ 营地说明 → 五日主题总览。
  4. **PIN 图鉴**（`/pins`）：三区拼图进度 → 区域 / 夜间 NPC 老玩家 / 拼图筹选 + 「只看已公布」→ 2 列图鉴卡（抠出的单枚 PIN 缩略图、占位编号、获取方式、跳展位、本机「已收集」）。未公布 PIN 的展位按 `booths.js` 自动生成「?」占位卡。

## 2. 用户硬性口径（不要违反）

- **不收录购票 / 票价 / 答题送票**相关内容。只保留场馆地址与入场规则类信息。
- **主要目标用户是手机端**：一切布局先保证 375–430px 宽度可用，桌面端只要不坏即可（`.page` 已限 max-width 640）。
- **视觉参考 RED LAND 官方活动页的像素海岛风**：天蓝格纹底、奶白像素描边卡、红色编号标签、黄色星标、导航深蓝描边。不要改成通用 Material / iOS 风。
- **数据只来自官方**：小红书 RED LAND 官方活动页、各 IP 官方账号的「RED LAND2026 | XX展台活动详情」笔记、官方新闻稿。不编造、不猜测；未公布的写「待补充 / 待确认」。
  - 唯一例外：首页「场馆平面图」卡下半部分保留 **2025 年**网友整理的参考图（`rules.js venueMapRef`，用户 9/10 决定放、9/11 官方图出来后决定继续保留），UI 与数据必须标明「2025 年」「非官方」。
- **场馆平面图官方图已接入**（`rules.js venueMap`，RED LAND 官方号 9/11 笔记）：放在首页「场馆平面图」卡上半部分（原 LOADING 占位处），5 张图在 `public/img/rules/map-2026/`。**全图必须原像素**（用户 9/11）：缩略图 `00.jpg` 3200 宽，灯箱打开加载 `00-full.jpg` 14412×5854（q88 约 5.5MB），走 `Lightbox` 的 `item.full`。给每个展位挂坐标（点展位在图上定位）仍未做——官方图没有网格，要逐个量展位框中心点。
- 多步任务默认直接推进，不逐步确认；只在需要业务口径 / 方案取舍时停下问。

## 3. 技术栈与目录

- Vite 8 + Vue 3（`<script setup>`）+ vue-router 4（hash 模式）。无 Pinia、无 UI 库、无 TS。Node 22。
- `vite.config.js` 的 `base: '/redland-guide/'`，所有 public 资源在代码里用 `import.meta.env.BASE_URL + 'img/...'` 拼路径。

```
src/
  main.js / App.vue           入口；App 里 keep-alive 三个列表页（按组件 name 匹配）
  router/index.js             /booths  /booth/:id  /parade  /stage  /pins  /dev（开发者模式，不挂底栏）
  style.css                   全部样式（设计 token 在 :root；像素组件类见 §5）
  composables/useStore.js     useChecked（展位打卡，rl26.checked）/ useDay（花车与舞台共享的当前 DAY，rl26.day）/ useCollected（PIN 已收集，rl26.pins）/ usePlan（待打卡清单，rl26.plan 按**展位 id** 存、一个展位号下的多个 IP 各加各的；rl26.planOrder 是展位号顺序，null = 自动排最短）
  components/                 TabBar（底栏）PageHeader（顶栏，back 模式）DayChips（DAY1–5）Lightbox（多图灯箱：每张图都可双指缩放 / 拖动 / 双击复位，左右滑动翻页、← → Esc；带 spots 的官方平面图额外有展位热区、导航路线与功能点位遮罩，见 §5）StepList（活动 / 任务的分步列表，支持 follow 关注标签）PostCopyBtn（带话题任务的「复制文案」，手机端复制后唤起小红书发笔记页）
  utils/xhs.js                小红书链接与 App 唤起：`openProfile` 主页（xhsdiscover://user/<uid>）、`openSearch` 搜索、`openPage` 站内 H5（xhsdiscover://webview/?url=）、`openCompose` 发笔记页（xhsdiscover://post）。手机端先唤起 App，未安装 / 取消再退回网页；Android Chrome 走 intent://，PC 不拦截
  utils/plan.js               待打卡清单排路线：三种初始顺序（最近邻 / 蛇形序 / 展位号）各跑 2-opt + Or-opt 取最短（见 §5）；fmtDist 按官方「200M」箭头定的比例尺换算米数
  utils/ipMatch.js            节目单 / 花车名单里的 IP 文案 ↔ 展位：去标点精确匹配优先，精确对上别的展位就不做包含匹配（王者荣耀 ≠ 王者荣耀世界），「A / B」合写按斜杠拆
  utils/anchor.js             flashAnchor(el)：滚到屏幕中间并加 .anchor-hit 闪一下（详情页跳舞台 / 花车页的锚点）
  utils/route.js              平面图导航寻路：`findRoute` 单条路线（堆版 A*，约 1.5ms）、`findDistances` 一次单源 Dijkstra 拿到到一批目标的距离（建距离矩阵用，81×81 约 240ms）。见 §5
  views/                      BoothsPage / BoothDetailPage / ParadePage / StagePage / PinsPage / DevMapPage（开发者模式，#/dev，见 §5.1）
  data/                       所有内容数据，纯 JS 模块，见 §4（含 roaming.js：无固定展位、场内游荡分发物料的 IP）
public/img/booths/<展位id>/   各 IP 笔记原图（810px 宽 JPEG，无水印版）+ note.json（抓取原始数据，含 fileIds / keptIndex）
public/img/pins/              从笔记图抠出的单枚 PIN 缩略图（<pin id>.jpg，最长边 320px）+ zone-A/B/C 通用占位软盘
public/img/roaming/<id>/      游荡 IP 的笔记图 + note.json（id 用拼音，如 gongyongbingxiang）
public/img/parade/<id>/       花车巡礼：route/ 官方路线图（3118 宽原图）+ 7 台 IP 专属花车笔记图（eggy / nishuihan / xindong / yimo / naraka / valorant / yuewen / mihoyo，810 宽）+ note.json
public/img/stage/<id>/        月光舞台补充演出情报的笔记图（riot：拳头游戏音乐 DJ 专场 3 张，810 宽）+ note.json；stageDays 条目用 `images` 引用
scripts/fetch-note.mjs        抓小红书笔记正文 + 图片（按 fileId 拉无水印原图），打印 boothDetails 骨架
scripts/refetch-clean.mjs     把已抓的带水印图按 note.json 的 fileIds 重拉成无水印版（历史目录一次性用过，新目录不需要）
scripts/crop-pins.py          按裁切框从笔记图抠单枚 PIN 缩略图到 public/img/pins/
scripts/map-spots.py          从官方平面图识别展位方框，生成 src/data/mapSpots.js 的归一化热区坐标
scripts/fetch-ditto.mjs       抓 ditto 专题页（目录页 + --sub 子页）全部图片、热区跳转、关注组件 uid → ditto.json
scripts/xhs-profile.mjs       按 uid 读小红书主页公开信息（昵称 / 小红书号 / 认证类型 2=官方 / 粉丝），`--all` 核对 booths.js 里已填账号；有风控，连续约 3 个后要等
docs/                         总资料底稿：REDLAND2026_信息汇总.md + assets/（官方页面图、各 IP 笔记归档）+ raw/（DSL JSON、逐图转录、KOL id）；不参与构建，见 §9
.github/workflows/deploy.yml  push main → build → GitHub Pages
```

## 4. 数据约定（`src/data/`）

| 文件 | 内容 | 来源 |
|---|---|---|
| `booths.js` | `booths[]`：`{ id, zone, no, ip, blurb, alias? }`；`zones[]`；`boothMap` | 官方「冒险者攻略 · IP展位一览」 |
| `boothDetails.js` | `{ [boothId]: detail }`，schema 见下 | 各 IP 官方账号「展台活动详情」笔记 |
| `indie.js` | C04 独立游戏试玩名单：`indieGames[{ letter, games[{ name, en?, xhs?: { uid, name }, url? }] }]` + `indieSource`；有 `xhs` 详情页渲染 📕 跳主页，有 `url` 名字可点开攻略（目前都待补） | 官方「独立游戏聚合页」ditto 93f070416d60405ea59f29bb691a0df3（9/9 版 84 款，页上无关注组件 / 热区） |
| `parade.js` | `paradeInfo` / `paradeRoute`（官方路线图：`image` / `desc` / `route` 按图理解的走法 / `legend` / `encounters` / `source`）/ `paradeDays[{ day, date, entries[{ ip, chars[] }] }]` / `themeFloats[{ id, ip, ips?, desc, look, intro, images[], guests[{ day: 1–5 \| 'all', label?, chars[] \| groups[{ ip, chars[] }] }], guestNote?, source, extraSource? }]`（`ip` 用短名：逆水寒 / 永劫无间 / 无畏契约 / 米哈游；融合花车用 `ips` 列子 IP，灰字显示在抠图下方并参与详情页跳转匹配；`desc` / `look` 保留官方文案但页面不显示（用户 9/17：「🚗 黄色机器人花车」这类不需要）；融合花车的名单用 `groups` 按作品分组、页面每个作品一行带蓝色作品标识；逆水寒的 `chars` 是它自己 9/15 笔记里的按日巡游嘉宾、`label` 是官方花车笔记的分段标题 + 当日主题，出处用 `extraSource` 进页尾来源卡，**不要再用 guestNote 把五天信息堆在一起**（用户 9/17：只要所选那天的）；每台另有 `public/img/parade/<id>/cut.png` 透明底抠图，用 `scripts/cut-floats.py`（rembg）从 00.jpg 抠出） / `playerSquad` | 官方「花车巡礼」半层 + RED LAND 官方号 9/11 路线图笔记 + 9/5 七条「前方高能！XX 专属花车准备发车！」笔记 + RED LAND 官方号 9/16「前方高能！米哈游四大IP花车准备出发！」（第 8 台 `mihoyo`，星布谷地 9/16 自己预告的「奥陌陌专属花车」已并入这一台、不再单列（用户 9/17），星布谷地那条笔记仍在 A06 详情与 stage.js 里：原神 派蒙 / 星穹铁道 帕姆 / 绝区零 伊埃斯 / 星布谷地 奥陌陌，官方未标日期按 `day: 'all'`；`ip` 写成「米哈游 · 原神 / 崩坏：星穹铁道 / 绝区零 / 星布谷地」，`utils/ipMatch.js` 按斜杠拆开后四个展位都能对上） |
| `stage.js` | `campInfo` / `stageDays[{ day, date, theme, hint, items[{ performer, songs[], ip?, note?, images? }] }]`（`images` 是 `public/img/stage/<id>/` 的图，舞台页渲染成 `.fl-thumbs` 缩略图点开灯箱）/ `stageSources { main, more[] }`（舞台页页尾「📎 来源」卡，可折叠默认展开，样式同详情页来源卡） | 官方「冒险者营地」半层 + RED LAND 官方号 9/15 拳头游戏音乐笔记（DAY2 10/3 19:00–21:00 DJ 专场：特邀 DJ Willim缪维霖，「VALORANT SOUND 音脉共振」电音秀 TICKING AWAY / 2 WORLDS 等 + 英雄联盟经典曲目 DJ 串烧） |
| `roaming.js` | `roaming[]`：`{ id, name, chars, xhs, days[], dateText, where, items[{ name, how }], note, image, source }` 无固定展位的游荡 IP，首页展位列表下方「自由游荡的 IP」卡 | 该 IP 官方账号笔记（已收录：公用冰箱里有什么 / 鼠记私房菜，10/4） |
| `mapSpots.js` | `mapSeq` 逛展动线序号（蛇形序，路线种子与列表排序用，**不替代官方编号**）；`mapDoors` + `doorPoints()` 每个展位的到达门（A 左 / B 上 / C 右 / D 下，朝向过道那条边，**导航终点用它、不要用中心点**）。**一个展位可以配多个门，最少 1、最多 4**（用户 9/15），值是边的字母串如 `'A'` / `'AC'` / `'ABCD'`；`findRoute` 支持多目标，自动停在最近的那个门。校验办法见 §5，门点离最近一格真线 >3 格就是开在死面上，9/15 据此修了 A14 / C10 / C11 / C12；`mapSpots`：81 个展位号 → **P2 切片**上的归一化热区 `[x, y, w, h]`（p2.jpg 与 p2-full.jpg 共用）；`mapStart` 登岛起点；`walkGrid` 300×217 路网；`mapFacilities` 功能点位（遮罩点亮用）；`mapSpotList` 再附该展位号下的全部 IP | `scripts/map-spots.py`：`<区> --emit` 出热区、`--walk` 出路网，序号→展位号人工核对。**热区坐标最后是直接在 `p2-full.jpg`（6000×4344）上重测的**——先经 01/02/03.jpg → 概览图 → 整图 → P2 转换会累积几像素误差，看着就是框整体偏右下（用户 9/14） |
| `rules.js` | `event`（含 `days[]`）/ `mainline`（含 `regions[].pin/color`、`nightPin`、`images`、`source`）/ `eggs` / `places` / `dailySchedule` / `venueMap`（官方平面图：`images` / `routes` 路线图例 / `routeTip` / `tips` 交通与点位 / `facilities` 回血点位 / `source`）/ `venueFacilities`（功能点位指南：`groups[{ title, items[] }]` / `note` / `images` 五段放大标注图 / `source`）/ `venueMapRef`（2025 年参考图 + 交通要点，非官方，保留）/ `equipPack`（主角专属装备包：`items[{ name, desc, note }]` 五件 + `notes` + 7 张图 + `source`；渲染在首页「主线玩法」卡**里面**——PIN 规则图源之后、🎈 彩蛋之前的「🎒 主角专属装备包」小节（用户 9/17 从独立折叠卡并入，因为它是主线第一步）；RED LAND 官方号 9/15，入场安检后到装备区人人可领，不涉票务） | 官方「冒险者攻略」半层 + 主会场 + RED LAND 官方号 8/25「PIN 收集玩法」、9/11「登岛地图已解锁」「功能点位指南」笔记；`venueMapRef` 来自网友「星辰大海」2025-08-07 笔记 |

- 非展位类官方笔记（玩法说明、区域介绍等）的图片放 `public/img/rules/<主题>/`，同样附 `note.json`；数据进 `rules.js`，不要塞进 `boothDetails.js`。已有：`rules/pin/`（PIN 分区规则）、`rules/pin-npc/`（NPC & 老玩家 PIN 图鉴）、`rules/map-2025/`（2025 年场地参考图，网友整理非官方，保留 1080 宽）、`rules/facilities/`（官方功能点位指南，同一张官方地图的 5 段放大标注图，保留原始 1080 宽）、`rules/equip/`（主角专属装备包 7 张，RED LAND 官方号 9/15，810 宽）、`rules/map-2026/`（官方场馆平面图；`p1/p2/p2-full/p3` 是灯箱用的按比例三切片——P1 标题卡 / P2 中间地图（带热区，`p2-full` 6000 宽）/ P3 图例栏，切点取自整图竖直深色窗口边框 x=0.2205 / 0.7815，全高不裁；00 总览仍是首页卡里的缩略图。这些均由同一张 14412×5854 原图裁切，裁切框记在 `note.json.crops`；00 全图 / 01 A 区含东侧与南侧入口 / 02 B 区 / 03 C 区 / 04 图例栏）。**地图类图不套 810 宽的规矩**：按可读性给宽度（总览 3200 / A 区 2200 / B、C 区 1800 / 图例 1100），只压质量。
- `src/data/pins.js`：PIN 图鉴数据（type: region / night / veteran / npc / reward），由 `PinsPage` 渲染。字段：`no` 占位编号（区域 PIN = 展位 id[-序号]，如 `A09-1`；夜间 `N-01`、老玩家 `V-01`、NPC `NPC-01`、拼图 `R-A/R-B/R-C/R-ALL`，官方公布正式编号后再换）、`thumb` 抠出的单枚缩略图、`image` 所在整张笔记图、`booth`。每收录一个带 PIN 的展台详情：在 `scripts/crop-pins.py` 的 CROPS 加裁切框（坐标基于 810px 宽图）→ `python scripts/crop-pins.py <id>` → 追加进 `pins[]`。PIN 在图里不到 150px 时（C07 这种）给 opts `{ fileId, upscale: true }`：脚本按 `note.json.fileIds` 拉 sns-img-qc 原始分辨率图再裁并放大锐化到 320，否则缩略图会糊。**官方图里斜着摆的 PIN 给 opts `rotate: <度数>`**（正数 = 逆时针）：脚本先把整张图绕裁切框中心转这么多度再按同一个框裁，软盘转正后同样的框里背景更少、PIN 更满，图鉴网格也整齐。已定角度：npc-1 −15 / npc-2 +20 / npc-3 −16 / npc-4 +21 / npc-5 −16 / npc-6 +21（每张 NPC 图里前后两枚软盘往相反方向斜）、veteran −8、C16 +15、night +45（夜间 PIN 是斜 45° 的菱形）。**定角度别靠肉眼扫缩略图**（9/14 试过，判反了好几个）：用 shell 颜色掩膜（NPC 红 / C16 蓝）+ 「旋转后行列投影的一阶差分平方和最大」扫 −30°～+30°，再放大到 200px 以上核对一眼。`zone-A/B/C` 与 `puzzle-*` 是摆在笔记本页面上的透视实拍图，不是平面旋转，**不要加 rotate**，只用 fileId 拉原图放大。没公布 PIN 的展位不用写，页面自动生成占位卡。`zoneThumbs` 是三区通用「?」软盘图。
- 术语：官方 8 月攻略半层叫「冒险岛的信物 / 冰箱贴」，8/25 PIN 笔记叫「冒险者拼图 / 冒险岛拼图完整体」，指同一件东西；UI 以「冒险者拼图」为主并括注旧称。PIN 按区域分色：翻身时空港橙 `#f26a2e`（A 区，需 4）、黄金海岸线黄 `#f2c23a`（B 区，需 2）、重生试炼场蓝 `#2f8fe6`（C 区，需 2）、夜间 PIN 黑。已收录展台的 PIN 颜色可用来反推区域。

- **`booths[].xhs`**：`{ uid, name }` 该 IP 小红书官方账号（uid = 抓笔记时 `note.json` 里的 `user.userId`）。**作者必须是该 IP 自己的官方号**：RED LAND 官方号发的「xx 确认登岛」是主办方账号，不能填成该 IP 的 `xhs`（唯一例外 B16 宝藏码头是主办方自营集市）。只有「确认登岛」预告、线上征集这类没有展台玩法的笔记：只补 `xhs`，不建 `boothDetails`，封面压 810 宽归档到 `docs/assets/ip_notes/PREVIEWS_确认登岛预告/<展位号_IP>.jpg` + 同名 json（`keptOnly` 写明缘由），`public/img` 不留文件。有则列表行出现 📕 按钮、详情页出现「小红书主页」按钮，方便用户去核对最新动态；没有的展位只给搜索按钮。每抓一条新 IP 笔记都要顺手把 uid 补进 `booths.js`。RED LAND 官方号 uid `685ce6320000000008039c70`（`src/utils/xhs.js`）。
- **展位 id 规则**：`区字母 + 两位编号`，如 `A06`；同一编号多个 IP 用 `a/b/c` 后缀（`A01a` 王者荣耀、`A01b` 盛世天下）。`no` 是官方展位号原文（如 `B02 / B17`）。id 一旦发布不要改（用户本机打卡记录按 id 存）。
- `day` 统一用 1–5 对应 10/2–10/6；日期文案从 `event.days` 取，不要各处手写。
- 官方原文尽量**逐字保留**（含标点与「」），只做全角 / 半角与空格规范；补充说明用括号或 `note` 字段，不混进原文。
- 神秘 / 待解锁类角色在 UI 用 `pill warm`，匹配正则 `/神秘|人气|待/`。

### boothDetails 的 detail schema

```js
{
  source: { title, url, noteId, author, publishedAt },   // 笔记来源，必填
  boothNo: 'A-06',                                       // 笔记里写的展位号原文
  intro: '',                                             // 欢迎语
  notes: [],                                             // 笔记里 * 开头的注意事项
  activities: [{ title, desc?, items?, ordered?, note?, partner?, needBooking?, rewards?[] }],
  stage:      [{ title, desc, schedule?: [{ day: '10月2日', guests: [] }] }],
  tasks:      [{ title, desc?, items?, ordered?, note?, tags?[], post?, rewards[] }],
  //   items：官方原文里 Step1 / 01 / 任务 1 这类分步内容，每步一项 { no?, title?, desc, tags?, post?, rewards?, note? } 或纯字符串，
  //          由 StepList 逐行渲染（no 保留官方序号，没有则自动编号）。用户 9/11 决定全部用有序编号，ordered: false 保留能力但不要再用。不要再把多步拼成一段 desc
  //          序号不要写「01 / 02」这种前导 0（用户 9/11 要求），官方原文是 01 的直接省略 no 让它自动 1 / 2 / 3；Step1 / STEP 1 / 任务 1 / 周边 1 这类保留
  //          item.fold：{ title, open?, items[] } 在该步下渲染可收起的子列表（默认收起），用于「一步下面挂一组子任务」，如 SCLA BINGO STEP 2 下 7 个 IP 的任务印章
  //          activities / tasks 条目可带 ip：多 IP 共用展位（阅文）按相邻 ip 分组，组名一行可点开（默认收起），标题里不要再重复 IP 名
  //   tags：要带的小红书话题；post：可直接发布的完整文案（不要写「（此处填写…）」占位，有字数要求就按官方信息写够字数并给 minChars，张数 / 内容要求写进 note）；没有 post 时自动生成一句 + 话题。有 tags 或 post 就在该任务 / 步骤**最底部**出现「复制发帖文案」按钮
  rewards:    [{ name, how, pin?: true, pinId?: 'A06-pin' | pinIds?: [] }],  // 去重后的奖励一览；PIN 标 pin，并用 pinId 指向 pins.js 的 id，详情页点「PIN 🔍」预览缩略图（无 thumb 的显示区域「?」软盘并注明待公布）
  footnote: '',                                          // 奖励限量说明
  images: ['img/booths/A06/00.jpg', { src, caption }],   // 相对 public 的路径；可用对象带说明（阅文 A35 每张拼接长图标注子页名）
  // 以下为可选字段（集市型 / 有独立营业时间的展位）
  hours: '每日 12:30 – 21:30',                            // 展位自己的营业时间，有则在展会信息里显示红色胶囊
  location: '黄金海岸线「宝藏码头」',                      // 展位所在区域名（官方原文），默认显示「上海 · 复兴岛」
  stalls: [{ name, featured?: true, note?: '仅 10 月 2–4 日' }],  // 摊位 / 参展商名单，featured 为官方置顶
  stallsNote: '',                                        // 名单排序说明
  menu: [{ name, price, note? }],                        // 餐车 / 售卖型展位的菜单（商品价格不算票务，可收录）
  menuNote: '',
  moreSources: [{ title, url, noteId, author, publishedAt }],  // 同展位其他官方笔记（如 SCLA 旗下各 IP 官方号的分 IP 攻略），来源卡里渲染为一排链接
}
```

已收录：`A06` 星布谷地（9/16 补「惊喜活动」两条进 `stage`：10/5 19:00–21:00 月光舞台特邀嘉宾王男 & 王广联合演绎全新单曲、10/2–6 每日 17:00–17:30 奥陌陌专属花车，图存 `surprise-00～01`；同步补 stage.js DAY4 的 note 与 parade.js 第 8 台专属花车；赠票不收）；`B02`（B-02 / B-17）与 `C16` 宝可梦（一条笔记覆盖三个展位，两个 key 共用同一对象，只改 `boothNo`；任务按官方图三层：Step1 领护照 → Step2 六个集章任务（`items`）→ Step3 领周边，皮卡丘 / 谜拟丘 PIN 与冰箱贴要求的任务组合不同，写在 Step3 的 `items` 里；9/11 补 C-16 卡牌体验营（超梦 & 梦幻相遇之地 / 训练家的卡牌展示区 / 存档碎片 PIN 三任务）进 `activities.items` 与 `tasks`，PIN 进 `pins.js` `C16-pin`（蓝色 = C 区），图存 `card-00～03`；9/12 补主会场三项手工 DIY（集装可爱 / 彩影箱灯 / 转转风车）进 `activities.items`，图存 `diy-00～03`；9/13 补「宝可梦见面会 / 特别见面会 / 巡游 / 特别舞台表演」四组进 `stage`，图存 `meet-00～04`；9/15 并入官方专题页 ditto `8b6481cf…`「江畔乐游 宝可梦嘉年华！」的**夜场惊喜**（每日 17:30–21:30，谜拟丘 / 耿鬼 / 夜间皮卡丘出没 + 蹭蹭脸颊、绘梦工坊 & 纸间奇遇等夜场限定）与**主题快闪**（购物送气球、拍照发帖送贴纸，展位号未公布），图存 `gift-00` / `night-00` / `popup-00`，取舍记在 `note-ditto.json`；9/16 补「更多丰富活动」蹭蹭脸颊 / 绘梦工坊 / 纸间奇遇三项完整规则（日场 / 夜场款式与数量），图存 `more-00～03`；9/15 同号「活力投篮」笔记补进主会场活动——60 秒投满 30 分为挑战成功，参与得巨牙鲨纸帽、成功再得巨牙鲨贴纸，图存 `hoop-00～01`）；`A09` 崩坏：星穹铁道（笔记主体是线上征集，只收录 RED LAND 参展情报两张图）；`B16` 宝藏码头（RED LAND 官方号发布，集市型，用 `hours / location / stalls`；摊位的补充情报写进对应 stall 的 `note`，已有 NO.13 永劫无间、NO.10 SEGA STORE SHANGHAI）；`A21` 三丽鸥（餐车型，用 `menu`）；`A22` 火影忍者 / 皮乐中国（同展位还有《魔法天使小甜甜》与蓬蓬狗，两条 9/4 确认登岛只存封面 `xiaotiantian-00` / `pengpenggou-00`，蓬蓬狗账号进 `accounts`；9/16 小甜甜自己的官方号「魔法天使小甜甜（皮乐中国）」再发确认登岛（A-22，无玩法）：账号进 `accounts`、链接进 `moreSources`，封面归档 docs `PREVIEWS_确认登岛预告/A22_魔法天使小甜甜.jpg`，`public/img` 不留；**A-22 的火影忍者分两条授权线，按笔记角标 logo 区分**：火影忍者 NARUTO = 皮乐中国展台玩法（集章 + 见面会），火影忍者疾风传 NARUTO SHIPPUDEN = EAKi亿奇旗舰摊位售卖区，活动 / 舞台标题都带线名，B16 名单里也是两个摊位；B18 火影忍者手游是腾讯的独立展位，三者不要混。9/11 补皮乐动漫「神秘角色见面会」进 `stage`（每日 14:00–14:30 / 16:30–17:00，每场 20 人，彩蛋角色「迟到的老师」）与 EAKi亿奇售卖区旗舰摊位进 `activities`，两条单图分别存 `jianmianhui-00` / `eaki-00`，EAKi亿奇账号进 `accounts`）；`A25a`+`A25b` Aniplex（鬼灭之刃 / 孤独摇滚共用）；`A34` 我的世界；`A35` 阅文（来源是 ditto 专题页而非笔记，五大 IP + 阅文好物共用展位，活动 / 任务每条带 `ip` 字段，详情页按 IP 分组、点组名展开（用户 9/11 要求），标题里不再重复 IP 名，`accounts` 列 6 个官方账号 uid；9/11 起每个子页保留的切片竖向拼成一张长图 `<子页前缀>.jpg`（hub / quanzhi / guimi / yiren / daogui / huyao / haowu），`images` 用 `{ src, caption }` 标子页名，`note.json.stitched` 记录拼接来源，灯箱里按宽铺满上下滚动）；`A24` SCLA / 新创华（9 大 IP 共用一个授权商展位，`accounts` 只放「关注有礼」要求同时关注的第二个官方号 SCLA招聘；BINGO 集章进 `tasks`，每日 6 场见面会用 `stage.schedule`，`guests` 每项带时间前缀如「14:00 假面骑士麦斯」，夜间场写「19:30 夜间 · XX」。SCLA 旗下各 IP 官方号会各发一条「XX | REDLAND登岛攻略！」：图 01–04 与主笔记相同，只把新封面存为 `<ip>-00.jpg`、原始数据存 `note-<ip>.json` 并写 `keptOnly`；IP 专属任务以「IP 名 · 项目」加进 `tasks`，账号进 `accounts`，链接进 `moreSources`。9 个 IP 的分攻略已全部并入（图全部与已收图相同时只存 `note-<ip>.json` 不存图），**各 IP 任务印章统一收在 BINGO 任务 STEP 2 的 `fold` 折叠列表里**（用户 9/11 要求），不再单列任务；见面会 `stage.desc` 只写场次概述 + 手环规则，各 IP 场次只在 `schedule` 表里（用户 9/11 要求，别再把各号场次抄进 desc）。超级战队 / 犬夜叉的关注要求是微信公众号，不是小红书；犬夜叉攻略由新创华SCLA 发布）；`B04a` 永劫无间（好菜坞片场五场戏 → 杀青大礼包 6 件；糕手胡桃花车；宝藏码头 NO.13 场贩 27 款写在 `activities` desc，价格未公布；与 `B04b` 暴雪游戏同编号不共用详情）；`B01` 蛋仔派对（车间认证四步进 `tasks`，13 位 Coser 到场日按天进 `stage.schedule`，guests 写「角色 · Coser」；笔记里的赠票征集 / 图鉴征集不收）；`A33` 光·遇（9/6 亮点首曝 8 项进 `activities.items`，无任务）；`A38` 剑网3（9/11 登岛详情：伴手礼三件进 `activities.items`，展台专属 PIN 卡 = 区域 PIN 进 pins.js `A38`，月光舞台 / 头车方阵与 stage.js / parade.js 已一致；图 01 有 2026 三区分布示意图，可作平面图参考）；`A19` 黑神话（官方快闪店，售卖 + 展品，无任务）；`A39` 粒粒的小人国（五位特邀心想家每日一位进 `stage.schedule`；抽门票不收）；`B04b` 暴雪游戏（魔兽世界 / 守望先锋 / 炉石传说三号同日确认登岛，主账号魔兽世界，另两个进 `accounts`，炉石封面与魔兽相同只存 `note-hs.json`；与 `B04a` 永劫无间同编号不共用）；`C14` 声探疑云（声音探案体验馆三条特点进 `activities.items`，声探徽章）；`A15` 古剑（9/15：「长生酒肆」主题展台，实机试玩（demo 约 1 小时）/ 实景打卡 / 牛头计时挑战（约 10 分钟）/ 独家周边领取处四项，奖品有手提袋 / 趣味贴纸 / 三命毛绒挂饰 / 折扇 / 头目纸卡，发放规则以现场为准，无 PIN）；`C08` 猛兽派对（官方 ditto 分会场页 `ad27d2c5…` 9/11：「猛兽小屋」四大亮点——先开一局（手游试玩得贴纸→吧台换 PIN + 周边无料）/ 猛兽出片（穿衣镜拍立得）/ 猛兽出没（与随机现身的猛兽合影有机会得 PIN）/ 彩蛋掉落（指定时段限定无料）。官方原文写「REDLAND 官方 PIN」不是「猛兽派对 PIN」，样式待公布，进 pins.js `C08-pin`、`thumb: null`；线上投稿带话题的周边是「可能掉落」不是保底，已注明）；`B09` 重返未来：1999（9/15：卡美洛古堡布景；关注 / 纪念打卡 / 问答互动三档无料，问答互动的《重返未来：1999》徽章分日场款 12:30–17:30、夜场款 17:30–21:30 两款，**黄色软盘 = B 区色**，进 pins.js `B09-1` / `B09-2`；10/2 17:00–17:30 狩勋女巫红弩箭花车巡游（与 RED LAND 官方「花车巡礼 17:30–18:00」口径不同，两边均按原文保留，parade.js DAY1 的神秘角色据此改为红弩箭）；6 位特邀 coser 官方只标了名字和日期、没标角色）；`C17` 航海王卡牌对战（9/11：SNS 打卡 / 策牌破局 / 互动游戏各盖 1 枚印章，集齐 3 枚换「奈美」帆布袋 + RED LAND 2026 限定徽章（Now Designing，进 pins.js `C17-pin`，`thumb: null`）与到店兑换的补充包；领奖前要扫码填问卷并下载万代卡牌 APP；小红书抽奖未收录）；`C05` 女神异闻录4 Revival（ATLUS 9/15：系列总制作人和田和久 + P4R 美术总监香林 Akane，10/3、10/4 各一场见面会 + 签名会进 `stage.schedule`（用 `times` 排「见面会 / 签名会」两个时段），整理券领取与签名规则进 `activities.items`；评论抽门票未收录）；`B18` 火影忍者手游（腾讯手游情报号 9/10 预告，只有时间地点与 5 款限定周边，玩法待公布，无 PIN；与 A22 皮乐火影是两个不同展位）；`B22` 心「DONG」冰品补给点（RED LAND 官方号发布，官方明确暂无周边与活动，只留海报与说明）；`C07` 苏丹的游戏（9/11 登岛情报：五站动线舍馆 → 集市 → 冒险者酒吧 → 哈比卜的厨房 → 苏丹的王座进 `activities.items`，终点【苏丹的游戏徽章】= C 区 PIN 进 pins.js `C07-pin`；展台实行预约制用 `needBooking`；送票征集不收）；`B03` Lovania（9/15「不忘乡」主题展台：漫游不忘乡 4 项 + 记忆之旅 3 项进 `activities.items`，记忆赠礼 4 档进 `tasks`，不忘乡奇遇日/夜表演与全岛花车巡游 10/5–6 进 `stage`；「RED LAND 存档碎片」= B 区 PIN 进 pins.js `B03-pin`，官方图只是粉色软盘剪影占位，`thumb: null`；标题带「赠票」但正文无赠票细则，不收）；`A17c` 命运扳机（9/15：先觉者特训基地三项进 `activities.items`，周边抽奖与「预约游戏 + 关注」两档进 `tasks`，8 位现场 COSER 按天整理成「角色 · Coser」进 `stage.schedule`（狩司只有 10/04 与 10/06，海报是斜杠不是箭头）；「存档碎片」PIN 套装橙色实图已公布，进 pins.js `A17c-pin`；花车游行原文写 17:00–17:30，与官方 17:30–18:00 口径不同，按原文保留）；`B15` 逆水寒（9/15「星梦乐园」：互动打卡三档 / 日间寻礼 12:30–19:00 / 夜场互动 19:00–21:10 进 `tasks`，侠友同游 10.2–10.4 与展台一览进 `activities`，星梦舞会（10.2 江苏省歌剧舞剧院）与花车巡礼按日嘉宾进 `stage`；REDLAND PIN 黄色血河小狗款实图已公布，进 pins.js `B15-pin`；`hours` 写日/夜场；花车巡礼按日嘉宾同时补进 parade.js 逆水寒专属花车的 `guestNote`；原图 11 张删「线上征集」与「登岛指引」两张，取舍见 note.json）；`A28` 代号：香（9/17「无料领取」：整理券制每日 1500 张，三步——关注账号现场出示领券 → 凭券入队拍展台照片 / 物料带话题 #代号香 #代号香REDLAND2026 发图文或视频领票根 + 小卡十连 → 到展台抽奖一次（S–E 六档：香水全套 / 吧唧全套 / 随机香水 / 随机香囊 / 纸袋 / 随机吧唧）；`items` 的 `no` 保留官方「步骤一 / 二 / 三」；未领到券可领伸手礼；「调香活动」「角色互动」预约规则待公布，进 `activities` 并 `needBooking`；门票抽奖不收）。其余 IP 详情按 §6 流程补。
- 无固定展位的 IP（如「公用冰箱里有什么」）不进 `booths.js` / `boothDetails.js`，进 `src/data/roaming.js`，图放 `public/img/roaming/<id>/`；首页展位列表下方自动渲染。
- 花车类官方笔记（路线图、「XX 专属花车准备发车」）进 `parade.js`，图放 `public/img/parade/<id>/`（id 用拼音 / 英文简称）。专属花车的「出席嘉宾角色名单」按官方图逐字进 `themeFloats[].guests`，按日的写 `day: 1–5`，写「DAY1–DAY5」的写 `day: 'all'`；官方图上的分段标题（如逆水寒「特别开场：神秘惊喜亮相」）放 `label`。花车页按当前 DAY 显示；**专属花车的出席嘉宾与头号花车同款 `.pill` 胶囊**（用户 9/17 先要过顿号拼接、当天又改回胶囊，以胶囊为准），融合花车按作品分行、行首蓝色作品标识。
- **`stage[].schedule[].times`**（可选，字符串数组）：场次多的展台（宝可梦）排上它——各时段仍是原来的 `.pill` 胶囊，只是并在同一行（不像默认的 `guests` 时间前缀那样按整点拆行）；**时间胶囊样式不要动**（用户 9/14 明确），改的只是它下面的 `guests`——改用黑色小字顿号分隔（`.sched-guests`）而不是一串胶囊。标题后要跟上明确的展位点（如「（B-17 主会场 · 舞台处）」）。**没排 `times` 的展台保持原样**（用户 9/11 要求保留胶囊，别全局改）。
- **`stage[].schedule[].guests`** 在详情页逐项渲染为 `.pill`（不再用「&」拼成一句）；匹配 `/神秘|人气|待/` 的用 `warm`，含「夜间」的用 `hot`。多场次的展台把时间写进每个 guest 字符串前缀（`HH:MM `）即可，不要另加 schema：详情页检测到时间前缀会**按整点时段换行**（17:00 与 17:30 同一行），升序排列；胶囊文字与样式保持原样（日期标签在左、胶囊在右，时间仍在胶囊里），不要再加时间列。
- **分步内容进 `items`**：官方原文里出现 Step1 / STEP 1 / 01 / 任务 1 / 车间名｜项目 这类枚举时，活动或任务要拆成 `items`（每步一项，`no` 填官方序号），不能拼成一段。已改：B02 宝可梦、A21 三丽鸥排队 / 打包区、A25 Aniplex 入队 5 步、A24 SCLA BINGO STEP 1–4、A35 阅文各 IP 01–03、B01 蛋仔 Step1 / Step2 各车间。
- **要求关注账号的任务**：在该活动 / 任务 / 分步项上加 `follow: [{ uid, name, via? }]`，详情页渲染成可点的 `📕 关注 XX` 标签，点了直接去小红书主页（用户 9/14）。没有 uid 的（超级战队、犬夜叉要求关注的是微信公众号）只写 `{ name, via: '微信公众号' }`，标签不可点、后面括注渠道。已加：宝可梦 3 处、Aniplex 入队、道诡异仙、SCLA 关注有礼（2 个号）与 SCLA 9 个 IP 的任务印章。
- **带话题的任务**（`tags` 或 `post`）在任务 / 步骤最底部出现「📋 复制发帖文案 / 预览文案」（`PostCopyBtn`）：默认文案 = `今天在 RED LAND 2026 打卡了「IP 名」展台，现场氛围太好了！ + 话题`，复制即可发；有字数要求的任务在 `post` 里按官方信息写够字数的正文并给 `minChars`（预览处显示「正文约 N 字 · 要求不少于 M 字」，道诡异仙长评 ≥100 字），张数 / 内容要求写进 `note`（SCLA 须含 3 个 IP 展位图、道诡异仙 ≥3 张照片）。话题名以官方原文为准，不自行加话题。
- **奖励里的 PIN 预览**：`rewards[].pin: true` 且能在 `pins.js` 找到对应项（`pinId` / `pinIds`，没有则取 `booth === 展位 id` 的全部 PIN）时，PIN 标签变成可点按钮（外观与原来的红色「PIN」标签完全一致，不加图标），灯箱显示缩略图 + `no · name`；`thumb: null` 的显示区域「?」软盘并注明待公布。新增 PIN 时同时给 reward 补 `pinId`。奖励 `name` 里不要再写「（PIN）」，标签已表示。
- **展会信息胶囊**：日期、`hours`（有则红色）、`📍 展位号 {boothNo}` 三枚；`location` 去掉展位号后若还有区域信息（翻身时空港 / 黄金海岸线「宝藏码头」/ 上海复兴岛港口区）再单独一枚，只剩「上海 · 复兴岛」时不显示（页头已有）。不要再出现「📍 上海 · 复兴岛 A24」+「展位号 A24」这种重复。
- **`detail.accounts`**（可选）：多 IP 共用展位时列出各 IP 官方账号 `[{ uid, name }]`，详情页在主账号按钮下方渲染一排「📕 IP 名」按钮（自动去掉与 `booths[].xhs` 重复的那个）。`booths[].xhs` 仍只放一个主账号（阅文取官方页里让用户关注的 @阅文好物）。
- 链接看不出是哪个 IP 时，先用临时 id（如 `_tmp`）跑脚本，看 `author` 后把 `public/img/booths/_tmp` 改名为正式 id，并同步改 `note.json` 里的 `images` 路径。
- 笔记里夹带的线上活动（版本征集、抽奖、送票）一律不收；`images` 只保留与展台相关的图，删掉的图在 `note.json` 里加 `keptOnly` 说明。`source.title` 后加「（仅收录 RED LAND 参展情报部分）」提示。
- 一条笔记覆盖多个展位时：用 `const xxx = {...}` 定义一次，多个 key 引用并用展开覆盖 `boothNo`，不要复制两份数据。
- 笔记里的线上抽奖 / 送票内容属于票务，不收录。

## 5. 视觉 / 交互约定

- 设计 token 全在 `style.css :root`：`--sky #4da6ff` 底、`--paper #fffdf6` 卡、`--cream` 暖卡、`--navy #1f2d5c` 描边与阴影、`--red #ff4b4b` 编号标签 / 选中态、`--yellow #ffd23f` 星标、`--night #2b2a55` 夜间 / 提示卡、`--brown #5a3e2b` 标题文字。
- 字体：标题 `--font-pix`（ZCOOL QingKe HuangYou）、编号 / 时间 `--font-num`（Press Start 2P，只用于短的数字字母，10px 左右）、正文系统字体。字体走 Google Fonts，离线自动回退。
- 像素组件类：`.pcard`（描边 3px + 4px 实心阴影，`.sand` 暖色，`.dark` 夜间）、`.tag`（编号红标，`.blue/.yellow/.green/.gray`，`.text` 为中文标签）、`.sticker`（红色斜贴纸标题）、`.pbtn`（像素按钮，按下位移）、`.chip`（区域 / 日期切换）、`.pill`（信息胶囊，`.warm/.hot`）、`.timeline .tl-item`、`.booth`、`.prog`、`.pr-entry`、`.theme-banner(.moon)`、`.pin-grid / .pin-card(.got/.unknown) / .pin-thumb / .pin-name / .pin-how`（PIN 图鉴，2 列，≥480px 3 列）、`.steps / .step-no(.cjk) / .step-body / .step-title`（分步列表，`.steps.plain` 无序黄标）、`.sched-day / .sched-row / .sched-time`（舞台时间表按时段分行）、`.lb-stage(.tall/.wide) / .lb-cap`（灯箱）、`.post-preview / .linkbtn`（发帖文案预览）、`.tag.btn`（可点击标签）。新组件先复用这些类，再考虑加新类。
- **灯箱统一用 `components/Lightbox.vue`**（`:items` 为路径或 `{ src, caption }` 数组，`v-model:index`），不要再在页面里手写 `.lightbox` 模板：手机左右滑动翻页（横向位移 >45px 且大于纵向 1.3 倍才算翻页，点一下关闭），PC ← → Esc；**打开时的缩放按图片自身尺寸自适应，灯箱外框不变**：图片高宽比超过舞台 1.2 倍时加 `.tall` 按宽铺满、竖向滚动（拼接长图）；宽高比同时超过舞台 1.2 倍**且本身 ≥ 1.6**时加 `.wide` 按高铺满、横向滚动并自动滚到中间（场馆平面图 / 花车路线图），此时横滑留给滚动、不翻页——`.wide` 的 1.6 绝对下限不能去掉：手机舞台本身很竖，没有它时普通 3:4 海报（0.75 > 舞台的 0.5）也会被判成宽图、铺满高度切掉两侧还禁掉左右翻页（9/14 修）。其余按 contain 整图放入，并给 `img` 内联 `max-width/height: min(100%, 原始尺寸 × 3)`，小图（PIN 缩略图只有 110–320px）最多放大 3 倍，既看得清又不糊。item 可带 `full`（原像素大图）：先显示 `src` 缩略图，`full` 后台预载完成后替换，宽图只在首次加载时居中。首页主线图 / 彩蛋图 / 官方平面图 / 2025 地图 / 游荡 IP 图、详情页原图 / PIN 预览、PIN 图鉴（当前筛选下全部已公布 PIN）、花车页路线图与专属花车图都已接入。
- **平面图「地图模式」**（用户 9/14）：灯箱 item 带 `spots`（= `mapSpots.js` 的 `mapSpotList`）时走这套，只有官方平面图 P2 用，别的灯箱走原来的裸 `img` 分支不受影响。
  - **灯箱里每张图都能双指缩放 / 拖动**（用户 9/14）：全部走 `.lb-hot-wrap` + `transform`，`zoom=1` 的含义按图片类型定——长图按舞台宽铺满、横幅与平面图切片按高铺满、其余整图 contain（小图仍最多放大 3 倍），最小可缩到整图可见。原来的 `.lb-stage.tall/.wide` 原生滚动已删，改成拖动平移。
  - **三张切片统一按舞台高度铺满**（`fitH: true`，用户 9/14）：三张是同一张原图切的、原高相同，按高度铺满后左右翻页才像同一张图的三段；`zoom = 1` 就是「按高度铺满」，最小可缩到 `minZoom`（= 整张切片刚好看得全）。铺满后的像素尺寸**要在 JS 里算好写到 `.lb-hot-wrap` 的 width/height 上**（`wrapStyle` 的判断用 `isMap` 不是 `hasSpots`，否则 P1/P3 会按原始像素撑开），只写 `max-height:100%` 解析不了（容器高 auto）；`resize` / `orientationchange` 要重新量，横竖屏都得适配。横向放不下时单指拖动平移，**拖到左右边界还继续同方向滑就翻页**。缩放平移由组件自己用 `transform` 做（`.lb-stage.map` 上 `touch-action:none`），双指缩放 / 单指拖动 / 滚轮 / 右上角 `.lb-zoom` 浮层都走同一套 `zoomBy`，**双击空白复位 100%**。缩放控件放右上角浮层、底栏 `.nav` 改成流内元素——原来 `.nav` 是 absolute，图片下方的注释会和它压在一起（用户 9/14）。**iOS Safari 的双指缩放必须在 `gesturestart/gesturechange/gestureend` 上 `preventDefault`**，否则会把整页放大、盖掉图里的缩放。
  - 单击热区选中 + 弹 `.lb-bub` 气泡；**气泡里直接点 IP 名字跳攻略，不要再写「攻略 ›」**（用户 9/14）；只有一个 IP 的展位还可以双击直接跳，多 IP 的双击只做选中。选中框 `.lb-hot.on` 只用 1.5px 细边——3px 会盖住图里的展位号（用户 9/14）。有选中时点空白先取消选中、不关灯箱。跳转用 `@open="id"` 交回页面（`BoothsPage.openBooth`），不在组件里写路由。
  - **待打卡清单**（用户 9/15）：`usePlan` 按**展位 id** 存在 `rl26.plan`——`A25a` 鬼灭之刃和 `A25b` 孤独摇滚要能各加各的，**不要按展位号存**（用户 9/15：「加清单的时候不要同个展位的一起加进清单了，要按 IP 加」）。地图上同号是同一个点，所以 `planNos` 先按展位号去重再交给 `planRoute`；清单里一行一个 IP，同号的第 2 个起用 `↳` + 「同一展位」占位、距离只标在第一行、↑↓ 对子行禁用。旧数据（存的是展位号）由 `migratePlan()` 展开成该号下的全部 id。首页展位行的「＋ 清单」与详情页「＋ 加清单」都能加。清单卡只列顺序、**不显示距离**（用户 9/17：现场人的位置实时在变，从固定起点算出来的米数没意义；`planRoute` 的 `total / steps` 仍在算、只是不展示，说明行只写「已按最少回头路排好，↑↓ 可自己调」/「按你调好的顺序」），「在地图上看路线」把整条多点路线传给 `Lightbox` 的 `plan` prop，图上画连线 + 编号站点（`.lb-stop`）。
    **排序目标是「最少回头路」，不是展位号顺序**（用户 9/15）：`planRoute()` 先用 `findDistances` 建距离矩阵，再拿三个初始顺序（最近邻 / `mapSeq` 蛇形序 / 展位号）各跑一遍 **2-opt（反转一段，解交叉）+ Or-opt（把 1–3 个连续站点整段挪走、可反向插入）**，取最短的那条。只有 2-opt 时常见「一个点被落下、最后专程折返」，Or-opt 专治这个。8 个点约 30ms、81 个约 380ms。
    **用户可以自己调顺序**：清单每行的 ↑ ↓ 改顺序后写进 `rl26.planOrder`，`planRoute(stops, fixedOrder)` 就完全照它走（卡片顶部文案改成「按你调好的顺序」，并出现「重排最短」按钮）；增删点时 `planOrder` 跟着同步，成员对不上就自动退回优化顺序。
    清单行本身可点 IP 名进该展位攻略、可就地点 ★ 打卡（一个展位号下的多个 IP 一起翻，因为图上是同一个点），已打卡的 IP 名转绿加删除线。**卡片标题不要带 emoji**（用户 9/15）。**清单最多显示 5 行**：`<ol class="plan-list">` 套在 `.plan-scroll`（max-height 190px ≈ 5 行、内部滚动、`overscroll-behavior: contain`）里，超过 5 行时容器底加虚线并在下方提示「共 N 行，在清单里上下滚动查看」（用户 9/17：清单一长整个页面就特别长）。行尾 ★ ↑ ↓ ✕ 四个 24px 小方钮的图标按用户 9/17 要求加粗：`.plan-acts .star.sm` 用 14px + 900 字重 + `-webkit-text-stroke: .7px currentColor`，首页展位行的 `.booth .star` 不动。
  - **气泡布局**：第一行是展位号 + 右对齐的「导航」按钮，下面才是 IP 名（每行 ≥34px）。导航文案就两个字、和展位号同行，不另占一行（用户 9/15）；但它必须跟 IP 名分属两块——展位号本身不可点，导航周围没有别的热区，否则手指容易把「跳 IP」点成「导航」（用户 9/15 反馈过）。按钮里不要放 emoji。按下导航后**自动收起气泡**（不然挡着看不到路线），点空白依次是：收气泡 → 清路线 → 关灯箱。
  - 气泡靠边时自动改成贴边对齐（`bubStyle` 的 `side`），否则最左 / 最右的展位气泡会被图边切掉。**点空白：有气泡先只关气泡**（别挡着看路线），没气泡才关灯箱；关闭要延后 260ms 执行，否则双击的第一下就把灯箱关了、`dblclick` 根本不触发（用户 9/14 反馈双击复位没用）。点「✕ 收起路线」会连气泡一起关。
  - 「功能点位」条在左上角**第二行**（`.lb-fac`，`top: 46px`，第一行让给右上角的缩放控件，别再挤在一起）：选一类后 `.lb-mask`（SVG mask 开洞）把整图压暗、只点亮这类点并加 `.lb-facdot` 亮圈。数据在 `mapFacilities`（8 类；安检票检区 / 装备区按用户 9/14 要求去掉，不需要点亮），按图标底色识别后人工归类；充电宝还有 1 处没认出来，chip 上显示「已标 N/官方 M」。**条首是「✳ 全部」**，一次点亮全部 34 个点（用户 9/15）。
  - 气泡里的「🧭 导航」在图上画一条起点 → 展位的路线：`utils/route.js` 在 `walkGrid` 上跑 A*。**`walkGrid` 是官方图上画出来的线本身**（冒险主线红 / 花车路线橙 / 冒险支线蓝 / 区域内红色细虚线粉），不是空地——用户 9/14：每块区域都有严格的出入口，不能随意穿插展位。**流程：360×260 按格最大池化 → 沿线方向开运算（1×5 / 5×1）剔掉展位边框与文字这类零散同色像素 → 沿线方向闭运算（1×13 / 13×1）接上虚线断点 → 3×3 膨胀 → 只留起点所在连通域**。开运算不能省：展位边框和文字也是深橙，直接闭运算会把整个展位块连成可走，路线就从马路斜插进 B 区（用户 9/14 发现 B04 / B05 不对）；也不能用各向同性大膨胀，马路和 B 区底边只隔几格会粘成一片。网格是三态：`'2'` 图上真有线 / `'1'` 闭运算补出来的桥（`route.js` 给 `BRIDGE_COST` 倍代价，免得跨空地的桥被当捷径）/ `'0'` 不可走；细虚线的短划会被开运算删掉，所以粉色虚线单独保留为真线。海水也是蓝的，靠 `r<60` 与支线蓝区分。**B 区南侧只留三个出入口**（B07↔冒险者营地、B07↔B06、B02↔B01，用户 9/14 指定；官方图在别处还画了几段粉色细虚线穿过马路与 B 区之间的空地，不封掉路线会从那儿抄近道），在建网格时按一道墙封掉、只在三个 x 位置开口。终点会截到**路线上离展位最近的那一格**（用户 9/14：结束点早一点）。
  - **`BRIDGE_COST` 定 6，不要再调回 25**（用户 9/15 两次反馈后改）：官方图上大量真过道是粉色细虚线、或被展位文字压断，闭运算补出来的都是桥接格。25 倍时穿一个 5 格深的出入口要付 125 代价 ≈ 300m 真线，A* 宁可绕远走「真线」——去 B10 走 1.1km（实际 370m，B02↔B01 那个口就在旁边却绕到 B06↔B07 去）、去 A14 直接绕出会场到南侧马路。改 6 之后短桥（出入口、虚线缺口 2–6 格）付得起，长桥（横穿广场几十格）仍然划不来；81 条路线全量渲染核对过，没有穿广场 / 越围栏的。
  - **到达门的校验办法**：算门点到最近一格 `'2'`（图上真有线）的距离，>3 格就是门开在没有路的死面上，导航只能从别的方向绕。9/15 据此改了 A14 `D→A`（原来开在南侧场外马路，用户要求走 A12 → A13/A15 → A14）、C10 `A→C`、C11 `A→C`、C12 `A→D`；A01 / A02 / A18 / B17 / B21 虽然也离线远，但换边后路线反而更长，维持原样。
  - **一个展位可以配多个到达门（1–4 个）**（用户 9/15）：`mapDoors` 的值是边的字母串（`'AC'` = 左右两个门）。转角 / 两面临过道的展位配多个更贴合实际，`findRoute` 用**多目标 A\***（启发值取到最近目标的距离，先弹出哪个就停哪个），不是先按直线距离猜一个。`planRoute` 的距离矩阵按「门对门取最小」算，每段折线走完后 `prev` 要**回推到实际到达的那个门**——折线末端是 trace 截断出来的「离门最近的一格」，直接拿它当下一段起点会凭空多走一截（81 点会从 6.4km 涨到 6.6km）。目前数据里全是单门；开发者模式的到达门芯片上标了每条边离真线几格（`0` = 正对过道、适合开门，`>3` = 这边没路），按需自己勾。
  - **性能与不做什么**（9/14 实测，图 = 14175 个可走格 / 5 万条无向边）：开表原来用线性扫最小值是 O(V²)，换二叉堆后单次查询 4.2ms → 1.5ms。要算多点距离**一定要用 `findDistances`**（一次单源 Dijkstra 覆盖所有目标，9ms/源），81×81 矩阵 240ms；按 n² 次 `findRoute` 要 3240 次约 13.4 秒。
    **不要上双向 Dijkstra / ALT / Contraction Hierarchies**：这三种是给百万级路网准备的。本图度分布 `{3:226, 5:3716, 7:398, 8:9835}` —— 没有一个度为 2 的格，69% 的格度数为 8，是「粗带状」的均匀网格，既没有可收缩的链，也没有 CH 依赖的「高速—乡道」层级，收缩只会造出海量 shortcut；实测双向 Dijkstra 2.75ms，和堆版 A* 打平（图太小，两个小圆不比一个圆省）。真要再快，正确方向是先把路网**骨架化**成细线再缩点，而不是在这张粗网格上套 CH。起点 `mapStart` = 冒险者大道上「注意花车出没哦!」前面的红色手柄机。
- 首页「场馆平面图」卡分上下两段（用户 9/11 定）：**上段 2026 官方图**——标题右侧红色「登岛地图 ▾」中文标签按钮（`.tag.text.btn`，原 LOADING 处），默认收起；点开依次是「🚇 2026 交通要点」折叠列表（含回血点位一行）→「🧭 功能点位指南」折叠列表（`venueFacilities`，四组点位 + 官方提示 + 5 张放大标注图 + 来源行）→ 全图 00 占满一行（`.gallery img.span-all`，横图按原比例，灯箱里横向滚动）→ 路线图例 3 枚 `.pill` + 色块 → 官方提示语；来源行常显。三区分图 01–03 与图例栏 04 在 `venueMap.images` 里标 `hidden: true`，页面与灯箱都不显示（用户 9/11：暂时只要完整的 P1），文件保留。**下段 2025 网友参考图保持原样**——只有一个黄色标签「🗺 2025 年场地参考图 ▾」（`.tag.yellow.text.btn`），点开依次显示免责说明 → 「2025 交通要点」→ 6 张缩略图；默认收起，来源行常显。不要再拆成多个按钮。
- 所有 📕 小红书主页按钮（首页列表行、详情页主账号 / `accounts`、游荡 IP、顶栏 logo）保留 `<a :href="profileUrl(uid)" target="_blank">`，再挂 `@click="openProfile($event, uid)"`：手机端拦截后先唤起小红书 App（系统弹「是否打开」），App 内直接看主页可绕过网页版滑块验证；PC 端不拦截。详情页「🔍 搜「IP RED LAND」」同理挂 `openSearch`：手机端先把关键词写入剪贴板再唤起 `xhsdiscover://search/result?keyword=`，直接落到 App 搜索结果页，失败退回网页搜索；PC 走网页版搜索。「去小红书看原笔记」短链保持网页跳转（笔记页本身有打开 App 入口，无验证墙）。
- **详情页顶部「官方一句话」卡**（用户 9/17）：标签是红「A06」+ 蓝「A 区 · 翻身时空港」（区域名取 `zones[].region`）——页头副标题已经是「A 区 · 展位 A06」，标签只写「A 区」就重复了。按钮行第一颗「🧭 导航」（title 写全称）：打开官方平面图 P2 灯箱（与首页同一套 `mapSlices`）并传 `navTo`，灯箱打开带 `spots` 的图时对该展位号自动跑一遍 `nav()` 画起点 → 展位路线；气泡里点别的 IP 由 `@open` 关灯箱并 `router.push('/booth/<id>')`。`mapNo` = id 去掉 a/b/c 后缀（A25a → A25），再退回官方展位号原文各段（B02 / B17）取图上有热区的那个；拿不到的展位（待解锁 / 无热区）不显示「导航」与「加清单」。`Lightbox` 的 `navTo` prop 只在 item 带 `spots` 时生效，其他灯箱不受影响。
- **详情页「这个 IP 还出现在」快捷跳转**（用户 9/17）：顶部卡按钮行下方，按 `utils/ipMatch.js` 对名字——月光舞台按日一颗「🎤 月光舞台 DAYx」→ `/stage?day=&booth=`，头号花车按日一颗「🎏 头号花车 DAYx」→ `/parade?tab=head&day=&booth=`，专属花车一颗「🚗 专属花车」→ `/parade?tab=theme&booth=`。目标页在 `onActivated` + `watch(route.query)` 里读 query（两页都在 keep-alive 里，`onMounted` 只跑一次），切 DAY / tab 后 `flashAnchor()` 滚到条目并闪黄红双框；条目 id：舞台 `st-<i>`、头号花车 `pr-<i>`、专属花车 `fl-<f.id>`。顶部绿标签文案是「已收录」、导航按钮文案是「🧭 导航」（用户 9/17 两次要求缩短，别再写长）。
- **花车页**：黄色 `.theme-banner` 横条已删（用户 9/17：没啥用）；「头号花车 / 专属花车」是两颗 `.sticker.tab` 按钮，未选中加 `.off`（纸色）；`tab` 只存组件内。**专属花车 tab 与头号花车同款 `.pr-entry` 行式布局**（左栏：IP 短名 → `.fl-cut` 透明底抠图（点开效果图）→ 融合花车子 IP 灰字 `.fl-sub`，不再有 🚗 造型行；右栏 `.chars.fl-body` 竖排：固定标题「出席嘉宾」→ 按所选 DAY 列 `.pill` 胶囊（`.fl-pills`，与头号花车同款；`groups` 时每个作品一行、行首 `.tag.blue.text.fl-tag` 作品标识；没有当日名单写「当日名单待公布」）→ 官方分段标题 `label` 灰字 → 备注 → `.fl-thumbs` 56px 缩略图一排，点开灯箱），**不显示 `desc` 一句话文案、标题里不带 DAY 日期**（用户 9/17），不要再用大图 `.gallery`。舞台页的 `.theme-banner.moon` 保留。底栏 `TabBar` 四个图标：🗺️ 展位攻略 / 🎠 花车巡礼 / 🎤 月光舞台 / 💾 PIN 图鉴（用户 9/17 把 📀 换成 💾）。
- 详情页「🎪 展台活动」「🎤 舞台活动」「✅ 展台任务」三张卡的标题行是 `.fold-head`（整行可点），右上角折叠箭头**与首页「主线玩法」卡完全一致**：`<span class="fold-arrow" :class="{ open }">&gt;</span>`（用户 9/14 要求统一，不要另造样式）。**默认展开**，换展位（`props.id` 变化）时复位为展开。 花车页「花车巡礼路线图」卡的标题行同样是 `.fold-head`，默认展开（用户 9/17），`openRoute` 只存组件内、不落盘。
- 首页平面图卡里的折叠小标题按钮（2026 交通要点 / 功能点位指南 / 2025 交通要点）都要带 `.foldline`（`display:block`），否则两个按钮收起时会挤在同一行（用户 9/14）。
- 平面图的三张切片在卡片里**排一行**（`.gallery.slices`，列宽按三张在原图里的实际占比 0.2205 / 0.561 / 0.2185，这样三张缩略图高度才一致），保持原图从左到右的顺序、地图在中间；点哪张开哪张，不要默认跳某一张（用户 9/14）。
- 首页展位行右侧的按钮列**最多两颗高**（★ 打卡 / 📕 小红书主页），「＋ 清单」不要塞进这一列、也不要套 `.star` 的星星样式——它是 IP 名那一行后面的蓝色小标签 `.tag.text.btn.plan-add`（用户 9/15：三颗竖着排太丑、把行撑得太高）。
- **没有明确要求就不要改已有样式**（用户 9/11 反馈：把见面会胶囊改成时间列 + 去前缀被要求改回）。功能性改动（分行、可点击、折叠）要在保留原有视觉的前提下做；新增元素复用现有类，不给旧元素加图标 / 换布局。
- 顶栏 `PageHeader`：左上 RED LAND 2026 logo 是 RED LAND 小红书官方号的链接（不要再在页面里另放官方号按钮）；传 `venue`（`rules.js` 的 `venueNav`）时副标题变成「导航」按钮，展开高德 / 百度 / Apple 地图搜索链接与复制地址。导航用关键词搜索 URI，不用坐标（避免 GCJ-02 / WGS-84 偏移）。
- 底栏 `TabBar` 固定，页面底部 padding 预留 `--tab-h + safe-area`；详情页不显示底栏。桌面端（≥600px）底栏与内容同宽居中，`.timeline / .chips` 改为换行而不是横滑（鼠标无法横滑）。
- `dailySchedule[].kind` 会直接作为 `.tl-item` 的附加 class，取值只能是 `parade / stage / night / ip`，**不要用 `booth`**（与展位卡 `.booth` 类撞名会打乱布局）。新增 kind 前先 grep style.css 确认没有同名类。
- 列表页用 `keep-alive`，组件必须有 `name`（单独 `<script>` 导出），否则筹选状态会丢。
- 本机状态只用 localStorage（打卡 `rl26.checked`、当前 DAY `rl26.day`、PIN 已收集 `rl26.pins`），不引入登录 / 云同步。
- 中文与英文 / 数字之间留一个空格；官方专有名词不改写（「存档碎片」「冒险者营地」「月下模式」等）。

## 5.1 开发者模式（`#/dev`）

平面图那套数据（热区 / 到达门 / 出入口 / 起点）是脚本识别 + 人工核对出来的，总会有偏差。
`src/views/DevMapPage.vue` 提供一个**只存本机**的校正工具，用户 9/15 要求：

- 入口：地址栏 `#/dev`，或展位列表底部那行小字右侧的「开发者模式」链接（`.devlink`，半透明白字）。**不要挂进底栏 `TabBar`**。
- 五种模式：
  - **热区**——点框选中，拖动整块 / 拖四角改大小，方向键微调（Shift ×10、Alt 改宽高），也可以直接填 x / y / w / h；「新建热区」点图落一个新框并输入展位号；「删除」移除。
  - **到达门**——选中展位后勾 A 左 / B 上 / C 右 / D 下，**可多选，最少留 1 个、最多 4 个**。每个芯片上标着这条边**离最近一格「图上真有线」几格**：`0` = 正对过道、适合开门，`>3` 标红 = 这边没有路（A14 当初就是这么错的）。
  - **出入口**——点图上空白处盖一个方块：`open` 强制开成可走真线（补出入口、补被文字压断的过道），`block` 封死（图上画了线但实际走不通）。点已有方块选中它：可直接拖、方向键按路网一格微调（Shift ×10）、Delete 删除，面板里改 x / y / 半径 / 类型。**方块大小 = 实际盖住的 (2r+1) 格，位置按 `stampGates()` 的 `Math.round` 取整对齐到格中心**，看到的就是盖上去的。代码里固化的 `mapGates` 用虚线框显示、不可点（改要改代码）。
  - **起点**——直接拖图上的红色十字标，或点图、方向键挪 `mapStart`。
  - **路网画笔**（用户 9/17）——按住拖动沿着手指连续「铺真线」（格子变 `'2'`）或「封路」（变 `'0'`），松手算一笔；笔宽 0–3 格（(2r+1)² 方块沿线盖）。存 `ov.strokes[{ mode, r, pts: [[gx, gy], …] }]`，`pts` 是**路网格坐标整数折点**：画的时候记每个经过的格，松手 `simplifyStroke()` 先按 `lineCells()`（Bresenham，`mapSpots.js` 导出）插成单步序列、再只留方向变化的点——相邻折点之间 Bresenham 能原样还原，导出才短。盖章在 `stampGates(gates, strokes)` 里按顺序盖，后面的压前面的；导出为 `mapStrokes`（代码里固化的画虚线、不可改）。笔迹在 `.dev-strokes` SVG 里青（铺）/ 红（封）显示并标序号，面板里一排笔迹芯片可选中 → 「删除选中」/ Delete，「撤销上一笔」/ Ctrl+Z。手机上一根手指画时不能拖图，面板有「手指拖图」开关（开着时点击层不接画笔、`touch-action` 放开）。`.dev-rect / .dev-gate / .dev-start / .dev-catch.brush` 都设了 `touch-action: none`，否则触屏一拖浏览器就抢去滚动、pointer 被 cancel。
- **「已改 N 处」是按钮**（用户 9/17）：点开 `.dev-pop` 气泡逐条列本机改动（热区改 / 新建 / 删除、到达门、出入口、画笔、起点），点名称切到对应模式并选中 + 滚到那儿，点 ✕ **只撤销这一处**、其余保留。撤销热区 / 到达门 / 起点要靶回原值，所以 `mapSpots.js` 在 `applyDev(loadDev())` 之前拍了 `mapOrig`（spots / doors / start 的深拷贝）——覆盖是原地改的，不拍快照找不回来。气泡底部「全部清空」= 原来的 `wipe()`。
- **五个图层常显、可各自开关**（用户 9/16：不止热区，起点 / 出入口都要显示出来才好复核路线）：dev-bar 第三行「显示：热区 / 到达门 / 出入口 / 起点 / 路网」（`.dev-layer`，色块与图上颜色一致）。**路网**是把 `walkGrid` 画到一张 360×260 的 `canvas`（`.dev-grid`，CSS 拉伸 + `image-rendering: pixelated`）：青 = `'2'` 图上真有线、紫 = `'1'` 闭运算补的桥接格；出入口改完 `drawGrid()` 重画，开着它就能看到方块盖上去的效果。
  - 事件分层：只有当前模式那一层接事件，其余图层带 `.off`（`pointer-events: none`）；`.dev-catch` 点击层放在 `img` 正上方、所有图层之下（原来它盖在最上面，出入口模式里根本点不到已有方块）。热区模式「新建热区」时热区也 `.off`，点哪都落到点击层。
- 「从起点试走到 XX」当场跑一遍 `findRoute` 画出绿线（末端圆点 = 实际停下的那一格）并给出距离；「试走全部 N 个展位」把 81 条都画成淡绿细线，给出可达条数、合计距离与走不通的展位号。**画着的路线在改动后自动重算**（`commit()` → `rerun()`），拖动过程中不算、松手才算（81 条约 120ms，跟着指针跑会卡）。
- 存储：`localStorage` 的 `rl26.dev`，由 `mapSpots.js` 底部的 `applyDev()` **原地合并**到 `mapSpots` / `mapDoors` / `mapStart` / `walkGrid` 上（合并时会作废 `walkGrid._cells/_base/_cost` 缓存并重建 `mapSpotList`），所以改完全站的导航立刻生效、刷新也还在。
  - 因为是原地改 `const` 对象，**不要把这些导出换成新对象**，否则别处 `import` 到的还是旧引用。
  - 页面里读这些数据要「通过 `ref()` 包一层再改」（`spots` / `doors` / `start`），直接改原对象 Vue 收不到通知。
- 「导出代码」给出可直接贴回 `src/data/mapSpots.js` 的片段（`mapSpots` 行、`mapDoors` 行、`mapStart`、完整的 `mapGates`）；贴回去以后回来点「清空本机覆盖」。
- `mapGates` 是固化下来的出入口修正（`[{ x, y, r, mode }]`，默认空数组）、`mapStrokes` 是固化下来的画笔笔迹（`[{ mode, r, pts }]`，默认空数组），和本机覆盖一起在 `stampGates()` 里盖到路网上；`emptyDev()` 的字段是 `spots / doors / gates / strokes / start / removed`。地图下方常显一行图例（`.dev-legend`：青 = 真线、紫 = 桥接格 ×6、画笔铺 / 封、试走路线），用户 9/17 曾把桥接格的紫红看成红色，所以桥接格改成偏蓝的紫 `rgb(170,60,255)`、画笔封路才用红。

## 6. 补充一个 IP 的展台详情（标准流程）

1. 拿到该 IP **官方账号**的小红书笔记链接（`xhslink.cn/o/...` 或 `xiaohongshu.com/discovery/item/...`）。注意：这类笔记是各 IP 自己发的，不是 RED LAND 官方号，只能逐条补。
   - 若 `fetch-note.mjs` 报「未解析到 noteData」且最终 URL 是 `ditto.xiaohongshu.net/ditto/vincent/<id>`，说明是 **ditto 专题页**（大厂多 IP 展位常用，如阅文 A35），改跑 `node scripts/fetch-ditto.mjs "<链接>" public/img/booths/<id>/raw --sub`：目录页 + 子页图片落 `raw/`、`raw/sub-<n>/`，`ditto.json` 里有每张图 CDN 地址、热区跳转与关注组件 uid（= 各 IP 官方账号）。看完图后把要保留的图压成 `<子页前缀>-<原图序号>.jpg` 放到 `public/img/booths/<id>/`，删掉 `raw/`，`note.json` 记录 54 张原图的取舍（参考 A35）。source.noteId 填 ditto 页 id，publishedAt 填 `pageConfig.lastEditTime`。
2. 抓正文与图片：
   ```bash
   node scripts/fetch-note.mjs "<链接>" <展位id>     # 例：node scripts/fetch-note.mjs "https://xhslink.cn/o/2KHjtNJUxgl" A06
   ```
   图片落到 `public/img/booths/<id>/`（已是无水印版：脚本用 imageList 里的 `fileId` 拼 `ci.xiaohongshu.com/<fileId>?imageView2/2/w/1080/format/jpg`，分享页默认的 `!h5_1080jpg` 样式会在图中央叠「小红书」水印），`note.json` 保存原始数据（含 `fileIds`），控制台打印 `boothDetails` 骨架。
   - 只保留部分图并重命名为 00/01… 时，务必在 `note.json` 写 `keptIndex: { '00.jpg': 原下标 }`，否则以后按序号重抓会错位（A09 曾因此抠错 PIN）。
3. 逐张看图，把「展台活动 / 舞台活动 / 展台任务 / 奖励」填进 `src/data/boothDetails.js`（key = 展位 id）。看图时**边看边写**，一批不超过 10 张，防止上下文里旧图被裁掉。图里的 Step / 01 / 任务 N 分步写成 `items`；要带话题的任务填 `tags`（有额外要求再写 `post`）；见面会 / 嘉宾有时刻的写进 guest 前缀；PIN 奖励补 `pinId`（见 §4）。
4. 图片压到 810px 宽 JPEG（质量 82，Pillow：`Image.open(...).convert('RGB').resize(...)`），避免仓库和首屏过大。
5. 若笔记里有 PIN：把裁切框加进 `scripts/crop-pins.py`，跑一下生成缩略图，再把 PIN 追加进 `src/data/pins.js`（见 §4）。
6. `npm run build` 通过后按 §8 提交；列表页会自动出现「攻略」角标，`有攻略` 筹选自动计数。
7. **同步底稿**：把该展台要点追加到项目内 `docs/REDLAND2026_信息汇总.md` 第 13 章（13.2 展台详情、13.3 账号表、附录 A 链接），压缩后的图片复制到 `docs/assets/ip_notes/<展位号_IP>/`。用户会以这份 md 作为总资料查阅，不能只改项目数据。（`C:\Users\JSB\Downloads\ClaudeCodeDocs\RedLand2026` 是 9/9 之前的历史快照，不再维护。）

## 7. 验收方法

- `npm run build` 必须无报错。
- 视觉检查用本机 headless Chrome。注意 headless 最小窗宽约 500px，直接 `--window-size=390` 得到的是 500px 布局；要测真实 390px，把页面放进 390px 的 iframe 壳，壳文件临时放 `public/_h_*.html` 经 dev server 访问，截完删掉：
  ```bash
  npx vite --host --port 5180 --strictPort            # 起 dev server
  printf '<!doctype html><body style="margin:0;background:#222"><iframe src="/redland-guide/#/booths" style="border:0;width:390px;height:1800px"></iframe></body>' > public/_h_booths.html
  "C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=600,1800 --virtual-time-budget=10000 --screenshot=shot.png "http://localhost:5180/redland-guide/_h_booths.html"
  rm public/_h_*.html
  ```
- 四个路由都截：`/booths`、`/booth/A06`（有详情）、`/booth/A10`（无详情）、`/parade`、`/stage`。重点看：底栏三个 Tab 齐全、星标按钮不被裁、DAY 芯片可横滑、长文本换行不溢出。

## 8. Git 与部署

- 分支 `main`；push 后 `.github/workflows/deploy.yml` 自动 `npm ci && npm run build` 并发布到 Pages（Pages 源已设为 GitHub Actions）。
- 提交信息中文，前缀 `feat / fix / data / style / chore / docs`，例：`data: 补充 A10 原神展台详情`。结尾带 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`。
- 提交用本机全局 git 身份（`xzz <2885017597@qq.com>`），不要用 `-c user.*` 覆盖。（v0.1 的前三次提交邮箱写成了 swift 邮箱，不必改历史。）
- push `main` 前 review 本次 commit 列表，判断 README 是否需要同步（新增 Tab / 数据文件 / 流程变化都要更新 README 与本文件）。
- 本机没有 `gh`；需要调 GitHub API 时用 `git credential fill` 取令牌（用户 zzixxxx），不要把令牌打印到输出。

## 9. 资料底稿与抓取技巧

- 官方活动页全部素材与逐图转录在项目内 `docs/`（`REDLAND2026_信息汇总.md` + `assets/` + `raw/`，约 42MB，不参与构建）。改数据先查这份底稿，不要凭记忆。`docs/assets/ip_notes/` 与 `public/img/booths/` 是同一批笔记图（前者按「展位号_IP」归档给人看，后者给页面用）。
- 小红书 ditto H5（`fe.xiaohongshu.com/ditto/vincent/<id>`）的页面配置内联在 `window.__SETUP_SERVER_STATE__`，含全部图片 CDN 地址与热区跳转；主会场页 id `1875a92b788843718d0b335dd77b1a41`，9 月仍在更新，需要时重抓做 diff。**diff 方法**：保存原始 state 到 `docs/raw/main_venue_dsl_<日期>.json`，比较两版 `growth-img.xhscdn.com/ditto/<id>` 列表，只有换了 id 的图才需要重新看（9/9 版只换了攻略半层 5 张：主线玩法、A 区 ×2、B 区、C 区；展位文字全在图里，state 里搜不到）。看图时把 1125 宽长图切成 1100px 段再看。9/9 版已同步进 `booths.js`（B16 IP贩售·宝藏码头、C02 去掉摩登天空、新增 C06 湖之仆从、C04 试玩区、C13 GSE、C15 拉瑞安工作室、B18 文案），旧名放 `alias` 供搜索。IP 专题页同理（阅文「读档！就现在」hub `cc6a09bbd38640d995705bed8335cf0c`），子页里的 `OnixDittoFollowNew.userId` 就是该 IP 官方账号 uid；主页接口 `xiaohongshu.com/user/profile/<uid>` 无 cookie 会 302 到验证码页，拿不到昵称。
- 小红书笔记分享页：iPhone UA 直接请求，正文 / 图片在 `window.__INITIAL_STATE__.noteData.data.noteData`（JSON 里的 `undefined` 要先替换成 `null`）。`atUserList` 一般为空（官方号的「@XX」多是纯文本），拿不到被 @ 账号的 uid。
- **IP 账号只能「按 uid 查、不能按名字搜」**（9/11 验证过的死路，别再试）：主会场页「登岛 IP 阵容」走 `edith.xiaohongshu.com/api/sns/v1/activity_platform/redland/main_venue`（返回 game_list：game_name / game_cover / link / tier / is_new），无 App 登录态时 406 且 data 为空；站内用户搜索页、话题页（`page/topics/v2/<id>`）、主页笔记列表都要登录（headless Chrome 渲染后只有登录弹窗 / 「IP 存在风险」）；Bing / 百度 / DDG 对 `xiaohongshu.com/user/profile` 基本不收录或被合规过滤；聚光 MAPI（ad-market 文档）只有广告投放 / 报表接口，没有按名字搜账号的能力。可行的发现渠道仍是：该 IP 官方号的笔记链接（`fetch-note.mjs` → `user.userId`）、用户在 App 里分享的主页链接、ditto 专题页的关注组件。已知 uid 的核实用 `scripts/xhs-profile.mjs`（桌面 Chrome UA 可读主页 SSR，`redOfficialVerifyType` 2 = 官方认证）。
- 图片 CDN：`growth-img.xhscdn.com/ditto/<id>?imageView2/2/w/1125/format/png`；笔记图 `sns-webpic-qc.xhscdn.com` 带时效签名且中央有「小红书」水印，**无水印原图**用 `imageList[].fileId`（形如 `spectrum/1040g0k…`）拼 `https://ci.xiaohongshu.com/<fileId>?imageView2/2/w/1080/format/jpg`（或 `sns-img-qc.xhscdn.com/<fileId>` 取原始 PNG），带 iPhone UA + Referer 即可，9/10 已把全部历史图换成无水印版。

## 10. 待办 / 已知空缺

- [x] 场馆平面图：RED LAND 官方号 9/11「登岛地图已解锁」官方功能地图已接入（`rules.js venueMap` + `public/img/rules/map-2026/`；2025 网友参考图 `venueMapRef` 按用户要求保留在卡片下段）
- [x] 平面图展位热区：**A 40 + B 21 + C 20 = 81 个全部完成**。C 区的展位挤在同一个大蓝框里、描边规则拆不开，改按亮度切（框内分隔缝是底色 R≈205，展位块 R≈160），见 `scripts/map-spots.py` 的 `split_c`
- [ ] 功能点位遮罩：已接入 10 类 32 个点，但**充电宝只认出 5/9、寄存处 1/2**（图标太小或和别的图标挨太近），要手量补齐；chip 上已显示「已标 N/官方 M」
- [ ] 导航起点用现场定位：现在固定从安检票检区（`mapStart`）出发。要按用户实时位置规划，得先给官方图做经纬度配准——图上没有任何坐标参照，需 10 月到现场用手机在几个已知点（入口 / 装备区 / 冒险者营地）取 GPS，反解出「经纬度 ↔ P2 归一化坐标」的仿射变换，再在 `Lightbox.startPoint()` 里接 `navigator.geolocation`（不在场就退回起点）
- [x] A / B / C 区 ↔ 三大区域映射：**9/11 官方平面图右栏 LAYOUT OF ZONE A/B/C 已逐一确认**（A 翻身时空港 / B 黄金海岸线 / C 重生试炼场），此前 C 区的排除法推断正确。区域芯片文案格式为「翻身时空港（48）」，开图进度条按 `need`（4/2/2）计算。
- [x] 功能点位指南：RED LAND 官方号 9/11 笔记已接入（`rules.js venueFacilities` + `public/img/rules/facilities/`，首页平面图卡「登岛地图」下新增「🧭 功能点位指南」折叠）。地铁口以官方 4 号口为准（2025 网友图写的 2 号口作废）
- [ ] 夜间「月下模式」具体开启时刻、9 月底「活动预约」入口；A22 火影神秘角色见面会的「Redland 活动广场」预约通道开启时间待官方公布
- [ ] 平面图新增的待解锁展位 A04 / A26 / B20 官方公布 IP 后补；A16「光夜展陈」与 A40 光与夜之恋的关系待官方确认
- [ ] C07 苏丹的游戏：展台预约规则待官方公告；哈比卜的厨房白天 / 夜晚两款大餐卡牌样式待公布
- [ ] IP 官方账号：93 个展位行已关联 75 个（9/11 用户六批共 112 条链接；93 = 原 81 + 平面图新增 12 行），剩 18 行待补：原有 6 个 A31 MOTORSLICE / SILLY POLLY BEAST、A37 动物城模拟生活新游（Partopia）、B19 CLUTCH、C04 独立游戏试玩区、C10 FINAL FANTASY RESONANCE、C13 GSE（C04 无单一账号；C10 用户给的「最终幻想14」号不是同一游戏，未填），加平面图新增的 A04 / A26 / B20（待解锁，无 IP）、A07 京东101HOME、A16 光夜展陈、B21a–d 四个赞助品牌、C11 MARD、C19 高达汇战、C20 符文战场；自动查询已验证不可行（§9）。独立游戏 84 款已有账号 41 个（9/14 补 Rain 98；505 Games / Mecrew games / UBISOFT 一个账号对应多款）
- [ ] C04 独立游戏：84 款名单已与官方 9/9 版一致；每款的小红书账号 uid / 攻略链接待补（`indie.js` 的 `xhs` / `url` 字段，官方页拿不到，需逐个找）
- [ ] 官方主会场页 10 月前再 diff 一次（**9/15 已复核：与 9/9 版完全一致，未更新**；独立游戏聚合页、阅文 hub 同样无变化，见 docs 13.15）
- [ ] 宝可梦官方专题页「2 活动一览」子页目前只有 KV、内容未上线（9/14 23:53 刚编辑过），「夜场惊喜」页尾写「夜场惊喜准备中……」；主题快闪的展位号未公布 —— 10 月前重抓
- [x] 已收录来源全量复核（9/15）：54 份笔记里只有 B01 蛋仔派对（PIN 改挂 Step1 基础认证）与官方地图（去掉了「200M」标注，场馆本身没变）有改动，均已同步；见 docs 13.15
- [ ] 其余 IP 的展台详情（已收录 A06 星布谷地、A09 星穹铁道、A15 古剑、A21 三丽鸥、A22 火影忍者、A24 SCLA / 新创华、A25 Aniplex、A34 我的世界、A35 阅文、B01 蛋仔派对、B02 / C16 宝可梦、B04a 永劫无间、B04b 暴雪游戏、B16 宝藏码头、B18 火影忍者手游、B22 冰品补给点、A19 黑神话、A33 光·遇、A38 剑网3、A39 粒粒的小人国、B09 重返未来：1999、C05 女神异闻录4 Revival、C07 苏丹的游戏、C08 猛兽派对、C14 声探疑云、C17 航海王卡牌对战、A17c 命运扳机、B03 Lovania、B15 逆水寒、A28 代号：香）
- [ ] B01 蛋仔派对：小红书 PIN 样式待公布（pins.js 已占位 thumb: null）；水友赛预约入口、各车间周边实物待官方后续；B22 冰品补给点补给详情「待解冻」
- [ ] A06 星布谷地：月光舞台全新单曲曲名未公布（stage.js 仍写「敬请期待」）；奥陌陌专属花车的造型与同行「其他伙伴」未点名
- [ ] 花车巡游时间两套口径：官方「花车巡礼」半层写 17:30 – 18:00，命运扳机 / 星布谷地 / 重返未来：1999 三家 IP 自己的笔记都写 17:00 – 17:30，已在 `paradeInfo.disclaimer` 里说明，10 月前看官方是否统一
- [ ] B03 Lovania：游戏试玩预约开放时间待公布；「RED LAND 存档碎片」官方图只给了粉色软盘剪影，样式待公布（pins.js `B03-pin` thumb: null）；「记忆共绘」的赠礼图为「?」占位；夜间展台表演与全岛花车巡游（10/5–6）的具体场次待官方情报
- [ ] B15 逆水寒：「侠友同游」11 位师兄师姐官方只给立绘未标角色名；10/3–10/6 夜间舞台演出内容「敬请期待」
- [ ] A28 代号：香：「调香活动」与「角色互动」的预约规则待公布；无料领取的伸手礼与小卡样式未公布
- [ ] 米哈游专属花车（第 8 台 `mihoyo`，星布谷地那台已并入）：官方嘉宾名单未标日期，按全程记；巡游出场时间待节目单。抠图 `cut.png` 是 `scripts/cut-floats.py`（rembg isnet + 只留主体连通块）自动抠的，官方出实拍后可重抠。拳头游戏音乐 DJ 专场曲目只公布了 TICKING AWAY / 2 WORLDS「等」，完整歌单待现场
- [x] A24 SCLA：「复兴岛 IP 售卖区」摊位 NO.05 按用户 9/10 决定视为黄金海岸线 B16 宝藏码头名单中的「新创华」摊位（两边官方文案未互相点名，属推断；B16 stalls 已加 note）。SCLA招聘 8/20 官宣笔记曾写展台 A27，以 9/10 攻略的 A24 为准。9 个 IP 的分攻略 9/11 已全部收齐
- [ ] A35 阅文：道诡异仙「PIN 卡」是否为冒险者拼图 PIN 待确认（确认后补进 `pins.js`）；狐妖小红娘集章话题、阅文好物无料详情、王也生日会礼赠均「待公布」，专题页 `endTime` 10/12，10 月前重抓 diff；6 个 IP 账号昵称未核实（用栏目名代替）
- [ ] 每日时刻横条里 15:00「展台嘉宾刷新」目前只有星布谷地的信息，随详情增多改为按展台聚合（A24 SCLA 已有每日 14:00–19:30 六场见面会时间表，是首个候选）
- [x] PIN 图鉴（第四个 Tab `/pins`，9/10 上线）：区域 / 类型筹选、抠图缩略图、占位编号、本机「已收集」。待办：官方公布 PIN 正式编号后替换 `no`；夜间 PIN 实图待公布；**NPC PIN 就是已公布的 6 款**——官方原文「7款NPC PIN&老玩家专属限定PIN」的 7 款是含老玩家款的合计（笔记图 01 老玩家 1 枚 + 02–04 各 2 枚 NPC），此前误当成 NPC 有 7 款、留了个待公布占位，9/14 已删；「已收集」与展位打卡暂不联动（用户未要求）。
