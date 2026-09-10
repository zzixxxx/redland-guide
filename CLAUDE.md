# CLAUDE.md — redland-guide 开发约定

后续所有开发以本文件为准。改了约定要同步改这里。

## 1. 项目是什么

- 小红书 **RED LAND 2026** 线下活动（2026-10-02 ~ 10-06，上海杨浦复兴岛船台 PARK）的**手机端快速查询攻略**。
- 线上地址：https://zzixxxx.github.io/redland-guide/ （GitHub Pages，push `main` 自动部署）
- 仓库：https://github.com/zzixxxx/redland-guide
- 四个底部 Tab：
  1. **展位攻略**（`/booths`）：每日时刻横条 → 主线玩法折叠卡（含本机打卡进度）→ 场馆平面图占位卡 → A/B/C 区 IP 展位列表（搜索 / 区域筹选 / 有攻略 / 已打卡）。点展位进 **展位详情**（`/booth/:id`）：官方一句话、展会信息、展台活动、舞台活动、展台任务、奖励一览、官方笔记原图、来源链接；无详情时给小红书搜索关键词。
  2. **花车巡礼**（`/parade`）：打卡 / 巡游时间 → DAY1–5 切换的头号花车出场角色 → IP 主题花车 → 主角方阵。
  3. **月光舞台**（`/stage`）：DAY1–5 切换 → 主题横幅 → 节目单（歌手 / 曲目 / 来源 IP）→ 营地说明 → 五日主题总览。
  4. **PIN 图鉴**（`/pins`）：三区拼图进度 → 区域 / 夜间 NPC 老玩家 / 拼图筹选 + 「只看已公布」→ 2 列图鉴卡（抠出的单枚 PIN 缩略图、占位编号、获取方式、跳展位、本机「已收集」）。未公布 PIN 的展位按 `booths.js` 自动生成「?」占位卡。

## 2. 用户硬性口径（不要违反）

- **不收录购票 / 票价 / 答题送票**相关内容。只保留场馆地址与入场规则类信息。
- **主要目标用户是手机端**：一切布局先保证 375–430px 宽度可用，桌面端只要不坏即可（`.page` 已限 max-width 640）。
- **视觉参考 RED LAND 官方活动页的像素海岛风**：天蓝格纹底、奶白像素描边卡、红色编号标签、黄色星标、导航深蓝描边。不要改成通用 Material / iOS 风。
- **数据只来自官方**：小红书 RED LAND 官方活动页、各 IP 官方账号的「RED LAND2026 | XX展台活动详情」笔记、官方新闻稿。不编造、不猜测；未公布的写「待补充 / 待确认」。
  - 唯一例外：首页「场馆平面图」卡在 2026 官方图公布前放 **2025 年**网友整理的参考图（`rules.js venueMapRef`，用户 9/10 决定），UI 与数据必须标明「2025 年」「非官方」，官方图公布后整块替换。
- 后续会增加**场馆平面图**（官方尚未公布），首页已留 `LOADING` 占位卡；公布后接进 `BoothsPage.vue` 并给每个展位挂坐标。
- 多步任务默认直接推进，不逐步确认；只在需要业务口径 / 方案取舍时停下问。

## 3. 技术栈与目录

- Vite 8 + Vue 3（`<script setup>`）+ vue-router 4（hash 模式）。无 Pinia、无 UI 库、无 TS。Node 22。
- `vite.config.js` 的 `base: '/redland-guide/'`，所有 public 资源在代码里用 `import.meta.env.BASE_URL + 'img/...'` 拼路径。

```
src/
  main.js / App.vue           入口；App 里 keep-alive 三个列表页（按组件 name 匹配）
  router/index.js             /booths  /booth/:id  /parade  /stage
  style.css                   全部样式（设计 token 在 :root；像素组件类见 §5）
  composables/useStore.js     useChecked（展位打卡，localStorage rl26.checked）/ useDay（花车与舞台共享的当前 DAY，rl26.day）/ useCollected（PIN 已收集，rl26.pins）
  components/                 TabBar（底栏）PageHeader（顶栏，back 模式）DayChips（DAY1–5）
  views/                      BoothsPage / BoothDetailPage / ParadePage / StagePage / PinsPage
  data/                       所有内容数据，纯 JS 模块，见 §4（含 roaming.js：无固定展位、场内游荡分发物料的 IP）
public/img/booths/<展位id>/   各 IP 笔记原图（810px 宽 JPEG，无水印版）+ note.json（抓取原始数据，含 fileIds / keptIndex）
public/img/pins/              从笔记图抠出的单枚 PIN 缩略图（<pin id>.jpg，最长边 320px）+ zone-A/B/C 通用占位软盘
public/img/roaming/<id>/      游荡 IP 的笔记图 + note.json（id 用拼音，如 gongyongbingxiang）
scripts/fetch-note.mjs        抓小红书笔记正文 + 图片（按 fileId 拉无水印原图），打印 boothDetails 骨架
scripts/refetch-clean.mjs     把已抓的带水印图按 note.json 的 fileIds 重拉成无水印版（历史目录一次性用过，新目录不需要）
scripts/crop-pins.py          按裁切框从笔记图抠单枚 PIN 缩略图到 public/img/pins/
scripts/fetch-ditto.mjs       抓 ditto 专题页（目录页 + --sub 子页）全部图片、热区跳转、关注组件 uid → ditto.json
docs/                         总资料底稿：REDLAND2026_信息汇总.md + assets/（官方页面图、各 IP 笔记归档）+ raw/（DSL JSON、逐图转录、KOL id）；不参与构建，见 §9
.github/workflows/deploy.yml  push main → build → GitHub Pages
```

## 4. 数据约定（`src/data/`）

| 文件 | 内容 | 来源 |
|---|---|---|
| `booths.js` | `booths[]`：`{ id, zone, no, ip, blurb, alias? }`；`zones[]`；`boothMap` | 官方「冒险者攻略 · IP展位一览」 |
| `boothDetails.js` | `{ [boothId]: detail }`，schema 见下 | 各 IP 官方账号「展台活动详情」笔记 |
| `indie.js` | C04 独立游戏试玩名单（按首字母） | 官方独立游戏聚合页 |
| `parade.js` | `paradeInfo` / `paradeDays[{ day, date, entries[{ ip, chars[] }] }]` / `themeFloats` / `playerSquad` | 官方「花车巡礼」半层 |
| `stage.js` | `campInfo` / `stageDays[{ day, date, theme, hint, items[{ performer, songs[], ip?, note? }] }]` | 官方「冒险者营地」半层 |
| `roaming.js` | `roaming[]`：`{ id, name, chars, xhs, days[], dateText, where, items[{ name, how }], note, image, source }` 无固定展位的游荡 IP，首页展位列表下方「自由游荡的 IP」卡 | 该 IP 官方账号笔记（已收录：公用冰箱里有什么 / 鼠记私房菜，10/4） |
| `rules.js` | `event`（含 `days[]`）/ `mainline`（含 `regions[].pin/color`、`nightPin`、`images`、`source`）/ `eggs` / `places` / `dailySchedule` / `venueMapRef`（2025 年参考图 + 交通要点，非官方过渡） | 官方「冒险者攻略」半层 + 主会场 + RED LAND 官方号 8/25「PIN 收集玩法」笔记；`venueMapRef` 来自网友「星辰大海」2025-08-07 笔记 |

- 非展位类官方笔记（玩法说明、区域介绍等）的图片放 `public/img/rules/<主题>/`，同样附 `note.json`；数据进 `rules.js`，不要塞进 `boothDetails.js`。已有：`rules/pin/`（PIN 分区规则）、`rules/pin-npc/`（NPC & 老玩家 PIN 图鉴）、`rules/map-2025/`（2025 年场地参考图，网友整理非官方，地图类图保留 1080 宽只压质量）。
- `src/data/pins.js`：PIN 图鉴数据（type: region / night / veteran / npc / reward），由 `PinsPage` 渲染。字段：`no` 占位编号（区域 PIN = 展位 id[-序号]，如 `A09-1`；夜间 `N-01`、老玩家 `V-01`、NPC `NPC-01`、拼图 `R-A/R-B/R-C/R-ALL`，官方公布正式编号后再换）、`thumb` 抠出的单枚缩略图、`image` 所在整张笔记图、`booth`。每收录一个带 PIN 的展台详情：在 `scripts/crop-pins.py` 的 CROPS 加裁切框（坐标基于 810px 宽图）→ `python scripts/crop-pins.py <id>` → 追加进 `pins[]`。没公布 PIN 的展位不用写，页面自动生成占位卡。`zoneThumbs` 是三区通用「?」软盘图。
- 术语：官方 8 月攻略半层叫「冒险岛的信物 / 冰箱贴」，8/25 PIN 笔记叫「冒险者拼图 / 冒险岛拼图完整体」，指同一件东西；UI 以「冒险者拼图」为主并括注旧称。PIN 按区域分色：翻身时空港橙 `#f26a2e`（A 区，需 4）、黄金海岸线黄 `#f2c23a`（B 区，需 2）、重生试炼场蓝 `#2f8fe6`（C 区，需 2）、夜间 PIN 黑。已收录展台的 PIN 颜色可用来反推区域。

- **`booths[].xhs`**：`{ uid, name }` 该 IP 小红书官方账号（uid = 抓笔记时 `note.json` 里的 `user.userId`）。有则列表行出现 📕 按钮、详情页出现「小红书主页」按钮，方便用户去核对最新动态；没有的展位只给搜索按钮。每抓一条新 IP 笔记都要顺手把 uid 补进 `booths.js`。RED LAND 官方号 uid `685ce6320000000008039c70`（`src/utils/xhs.js`）。
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
  activities: [{ title, desc, partner?, needBooking?, rewards?[] }],
  stage:      [{ title, desc, schedule?: [{ day: '10月2日', guests: [] }] }],
  tasks:      [{ title, desc, tags?[], rewards[] }],
  rewards:    [{ name, how, pin?: true }],               // 去重后的奖励一览；PIN（存档碎片）标 pin
  footnote: '',                                          // 奖励限量说明
  images: ['img/booths/A06/00.jpg', ...],                // 相对 public 的路径
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

已收录：`A06` 星布谷地；`B02`（B-02 / B-17）与 `C16` 宝可梦（一条笔记覆盖三个展位，两个 key 共用同一对象，只改 `boothNo`）；`A09` 崩坏：星穹铁道（笔记主体是线上征集，只收录 RED LAND 参展情报两张图）；`B16` 宝藏码头（RED LAND 官方号发布，集市型，用 `hours / location / stalls`）；`A21` 三丽鸥（餐车型，用 `menu`）；`A22` 火影忍者 / 皮乐中国；`A25a`+`A25b` Aniplex（鬼灭之刃 / 孤独摇滚共用）；`A34` 我的世界；`A35` 阅文（来源是 ditto 专题页而非笔记，五大 IP + 阅文好物共用展位，活动 / 任务按「IP 名 · 项目」分列，`accounts` 列 6 个官方账号 uid，图片文件名 = 子页前缀-原图序号）；`A24` SCLA / 新创华（9 大 IP 共用一个授权商展位，`accounts` 只放「关注有礼」要求同时关注的第二个官方号 SCLA招聘；BINGO 集章进 `tasks`，每日 6 场见面会用 `stage.schedule`，`guests` 每项带时间前缀如「14:00 假面骑士麦斯」，夜间场写「19:30 夜间 · XX」。SCLA 旗下各 IP 官方号会各发一条「XX | REDLAND登岛攻略！」：图 01–04 与主笔记相同，只把新封面存为 `<ip>-00.jpg`、原始数据存 `note-<ip>.json` 并写 `keptOnly`；IP 专属任务以「IP 名 · 项目」加进 `tasks`，账号进 `accounts`，链接进 `moreSources`。已并入 EVA；其余 8 个 IP 待发）；`B01` 蛋仔派对（车间认证四步进 `tasks`，13 位 Coser 到场日按天进 `stage.schedule`，guests 写「角色 · Coser」；笔记里的赠票征集 / 图鉴征集不收）；`B22` 心「DONG」冰品补给点（RED LAND 官方号发布，官方明确暂无周边与活动，只留海报与说明）。其余 IP 详情按 §6 流程补。
- 无固定展位的 IP（如「公用冰箱里有什么」）不进 `booths.js` / `boothDetails.js`，进 `src/data/roaming.js`，图放 `public/img/roaming/<id>/`；首页展位列表下方自动渲染。
- **`stage[].schedule[].guests`** 在详情页逐项渲染为 `.pill`（不再用「&」拼成一句）；匹配 `/神秘|人气|待/` 的用 `warm`，含「夜间」的用 `hot`。多场次的展台把时间写进每个 guest 字符串前缀即可，不要另加 schema。
- **`detail.accounts`**（可选）：多 IP 共用展位时列出各 IP 官方账号 `[{ uid, name }]`，详情页在主账号按钮下方渲染一排「📕 IP 名」按钮（自动去掉与 `booths[].xhs` 重复的那个）。`booths[].xhs` 仍只放一个主账号（阅文取官方页里让用户关注的 @阅文好物）。
- 链接看不出是哪个 IP 时，先用临时 id（如 `_tmp`）跑脚本，看 `author` 后把 `public/img/booths/_tmp` 改名为正式 id，并同步改 `note.json` 里的 `images` 路径。
- 笔记里夹带的线上活动（版本征集、抽奖、送票）一律不收；`images` 只保留与展台相关的图，删掉的图在 `note.json` 里加 `keptOnly` 说明。`source.title` 后加「（仅收录 RED LAND 参展情报部分）」提示。
- 一条笔记覆盖多个展位时：用 `const xxx = {...}` 定义一次，多个 key 引用并用展开覆盖 `boothNo`，不要复制两份数据。
- 笔记里的线上抽奖 / 送票内容属于票务，不收录。

## 5. 视觉 / 交互约定

- 设计 token 全在 `style.css :root`：`--sky #4da6ff` 底、`--paper #fffdf6` 卡、`--cream` 暖卡、`--navy #1f2d5c` 描边与阴影、`--red #ff4b4b` 编号标签 / 选中态、`--yellow #ffd23f` 星标、`--night #2b2a55` 夜间 / 提示卡、`--brown #5a3e2b` 标题文字。
- 字体：标题 `--font-pix`（ZCOOL QingKe HuangYou）、编号 / 时间 `--font-num`（Press Start 2P，只用于短的数字字母，10px 左右）、正文系统字体。字体走 Google Fonts，离线自动回退。
- 像素组件类：`.pcard`（描边 3px + 4px 实心阴影，`.sand` 暖色，`.dark` 夜间）、`.tag`（编号红标，`.blue/.yellow/.green/.gray`，`.text` 为中文标签）、`.sticker`（红色斜贴纸标题）、`.pbtn`（像素按钮，按下位移）、`.chip`（区域 / 日期切换）、`.pill`（信息胶囊，`.warm/.hot`）、`.timeline .tl-item`、`.booth`、`.prog`、`.pr-entry`、`.theme-banner(.moon)`、`.pin-grid / .pin-card(.got/.unknown) / .pin-thumb / .pin-name / .pin-how`（PIN 图鉴，2 列，≥480px 3 列）。新组件先复用这些类，再考虑加新类。
- 顶栏 `PageHeader`：左上 RED LAND 2026 logo 是 RED LAND 小红书官方号的链接（不要再在页面里另放官方号按钮）；传 `venue`（`rules.js` 的 `venueNav`）时副标题变成「导航」按钮，展开高德 / 百度 / Apple 地图搜索链接与复制地址。导航用关键词搜索 URI，不用坐标（避免 GCJ-02 / WGS-84 偏移）。
- 底栏 `TabBar` 固定，页面底部 padding 预留 `--tab-h + safe-area`；详情页不显示底栏。桌面端（≥600px）底栏与内容同宽居中，`.timeline / .chips` 改为换行而不是横滑（鼠标无法横滑）。
- `dailySchedule[].kind` 会直接作为 `.tl-item` 的附加 class，取值只能是 `parade / stage / night / ip`，**不要用 `booth`**（与展位卡 `.booth` 类撞名会打乱布局）。新增 kind 前先 grep style.css 确认没有同名类。
- 列表页用 `keep-alive`，组件必须有 `name`（单独 `<script>` 导出），否则筹选状态会丢。
- 本机状态只用 localStorage（打卡 `rl26.checked`、当前 DAY `rl26.day`、PIN 已收集 `rl26.pins`），不引入登录 / 云同步。
- 中文与英文 / 数字之间留一个空格；官方专有名词不改写（「存档碎片」「冒险者营地」「月下模式」等）。

## 6. 补充一个 IP 的展台详情（标准流程）

1. 拿到该 IP **官方账号**的小红书笔记链接（`xhslink.cn/o/...` 或 `xiaohongshu.com/discovery/item/...`）。注意：这类笔记是各 IP 自己发的，不是 RED LAND 官方号，只能逐条补。
   - 若 `fetch-note.mjs` 报「未解析到 noteData」且最终 URL 是 `ditto.xiaohongshu.net/ditto/vincent/<id>`，说明是 **ditto 专题页**（大厂多 IP 展位常用，如阅文 A35），改跑 `node scripts/fetch-ditto.mjs "<链接>" public/img/booths/<id>/raw --sub`：目录页 + 子页图片落 `raw/`、`raw/sub-<n>/`，`ditto.json` 里有每张图 CDN 地址、热区跳转与关注组件 uid（= 各 IP 官方账号）。看完图后把要保留的图压成 `<子页前缀>-<原图序号>.jpg` 放到 `public/img/booths/<id>/`，删掉 `raw/`，`note.json` 记录 54 张原图的取舍（参考 A35）。source.noteId 填 ditto 页 id，publishedAt 填 `pageConfig.lastEditTime`。
2. 抓正文与图片：
   ```bash
   node scripts/fetch-note.mjs "<链接>" <展位id>     # 例：node scripts/fetch-note.mjs "https://xhslink.cn/o/2KHjtNJUxgl" A06
   ```
   图片落到 `public/img/booths/<id>/`（已是无水印版：脚本用 imageList 里的 `fileId` 拼 `ci.xiaohongshu.com/<fileId>?imageView2/2/w/1080/format/jpg`，分享页默认的 `!h5_1080jpg` 样式会在图中央叠「小红书」水印），`note.json` 保存原始数据（含 `fileIds`），控制台打印 `boothDetails` 骨架。
   - 只保留部分图并重命名为 00/01… 时，务必在 `note.json` 写 `keptIndex: { '00.jpg': 原下标 }`，否则以后按序号重抓会错位（A09 曾因此抠错 PIN）。
3. 逐张看图，把「展台活动 / 舞台活动 / 展台任务 / 奖励」填进 `src/data/boothDetails.js`（key = 展位 id）。看图时**边看边写**，一批不超过 10 张，防止上下文里旧图被裁掉。
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
- 小红书 ditto H5（`fe.xiaohongshu.com/ditto/vincent/<id>`）的页面配置内联在 `window.__SETUP_SERVER_STATE__`，含全部图片 CDN 地址与热区跳转；主会场页 id `1875a92b788843718d0b335dd77b1a41`，9 月仍在更新，需要时重抓做 diff。IP 专题页同理（阅文「读档！就现在」hub `cc6a09bbd38640d995705bed8335cf0c`），子页里的 `OnixDittoFollowNew.userId` 就是该 IP 官方账号 uid；主页接口 `xiaohongshu.com/user/profile/<uid>` 无 cookie 会 302 到验证码页，拿不到昵称。
- 小红书笔记分享页：iPhone UA 直接请求，正文 / 图片在 `window.__INITIAL_STATE__.noteData.data.noteData`（JSON 里的 `undefined` 要先替换成 `null`）。
- 图片 CDN：`growth-img.xhscdn.com/ditto/<id>?imageView2/2/w/1125/format/png`；笔记图 `sns-webpic-qc.xhscdn.com` 带时效签名且中央有「小红书」水印，**无水印原图**用 `imageList[].fileId`（形如 `spectrum/1040g0k…`）拼 `https://ci.xiaohongshu.com/<fileId>?imageView2/2/w/1080/format/jpg`（或 `sns-img-qc.xhscdn.com/<fileId>` 取原始 PNG），带 iPhone UA + Referer 即可，9/10 已把全部历史图换成无水印版。

## 10. 待办 / 已知空缺

- [ ] 场馆平面图（官方未公布）→ 首页占位卡下已接 2025 年参考图 `venueMapRef` 过渡（2025 三区字母 A 翻身时空港 / B 重生试炼场 / C 发呆小森林，与 2026 不同）；官方图公布后替换并给展位挂坐标
- [x] A / B / C 区 ↔ 三大区域映射：`booths.js zones[].region`（A=翻身时空港、B=黄金海岸线 有官方笔记依据；C=重生试炼场 为排除法）。用户决定 UI 不标「推测」；区域芯片文案格式为「翻身时空港（44）」。开图进度条按 `need`（4/2/2）计算。官方平面图公布后若有出入再改。
- [ ] 夜间「月下模式」具体开启时刻、9 月底「活动预约」入口
- [ ] 其余 IP 的展台详情（已收录 A06 星布谷地、A09 星穹铁道、A21 三丽鸥、A22 火影忍者、A24 SCLA / 新创华、A25 Aniplex、A34 我的世界、A35 阅文、B01 蛋仔派对、B02 / C16 宝可梦、B16 宝藏码头、B22 冰品补给点）
- [ ] B01 蛋仔派对：小红书 PIN 样式待公布（pins.js 已占位 thumb: null）；水友赛预约入口、各车间周边实物待官方后续；B22 冰品补给点补给详情「待解冻」
- [x] A24 SCLA：「复兴岛 IP 售卖区」摊位 NO.05 按用户 9/10 决定视为黄金海岸线 B16 宝藏码头名单中的「新创华」摊位（两边官方文案未互相点名，属推断；B16 stalls 已加 note）。SCLA招聘 8/20 官宣笔记曾写展台 A27，以 9/10 攻略的 A24 为准。其余 8 个 SCLA IP 官方号的分 IP 攻略待发
- [ ] A35 阅文：道诡异仙「PIN 卡」是否为冒险者拼图 PIN 待确认（确认后补进 `pins.js`）；狐妖小红娘集章话题、阅文好物无料详情、王也生日会礼赠均「待公布」，专题页 `endTime` 10/12，10 月前重抓 diff；6 个 IP 账号昵称未核实（用栏目名代替）
- [ ] 每日时刻横条里 15:00「展台嘉宾刷新」目前只有星布谷地的信息，随详情增多改为按展台聚合（A24 SCLA 已有每日 14:00–19:30 六场见面会时间表，是首个候选）
- [x] PIN 图鉴（第四个 Tab `/pins`，9/10 上线）：区域 / 类型筹选、抠图缩略图、占位编号、本机「已收集」。待办：官方公布 PIN 正式编号后替换 `no`；NPC 第 7 款、夜间 PIN 实图待公布；「已收集」与展位打卡暂不联动（用户未要求）。
