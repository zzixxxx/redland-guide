// PIN 图鉴数据（为后续「PIN 图鉴」功能准备；UI 尚未接入）
// type: region（区域 IP PIN，按展位）/ night（夜间 PIN）/ veteran（老玩家专属）/ npc（NPC 互动）/ reward（区域拼图等最终奖励）
// zone 对应 booths.js zones（A 翻身时空港 橙 / B 黄金海岸线 黄 / C 重生试炼场 蓝）
// no：图鉴占位编号。区域 PIN 按「展位 id[-序号]」编码（官方未给 PIN 编号，用户 9/10 决定），夜间 N-xx / 老玩家 V-xx / NPC-xx / 拼图 R-x
// thumb：从笔记图抠出的单枚 PIN 缩略图（public/img/pins/，裁切框见 scripts/crop-pins.py）；image：所在整张笔记图
// 未公布 PIN 的展位由 PinsPage 按 booths.js 自动生成占位卡，用 zoneThumbs 的通用「?」软盘图
export const pinTypes = [
  { key: 'region', name: '区域 IP PIN', desc: '各 IP 展位互动获得，按区域分色，用于兑换冒险者拼图', color: null },
  { key: 'night', name: '夜间 PIN', desc: '黑色夜间限定，夜间发放', color: '#1f2a1f' },
  { key: 'veteran', name: '老玩家专属 PIN', desc: '1.0 登岛老玩家线下兑换，每人限一个', color: '#c9a24a' },
  { key: 'npc', name: 'NPC 互动 PIN', desc: '与岛上 NPC 聊天互动、合拍打卡随机掉落，库存有限', color: '#ff4b4b' },
  { key: 'camp', name: '冒险者营地 PIN', desc: '在冒险者营地官摄出片区参与互动拍摄（子弹时间）有机会解锁，样式待公布', color: null },
  { key: 'reward', name: '冒险者拼图', desc: '各区域集齐 PIN 后到结算点兑换，三块拼成冒险岛拼图完整体', color: null },
]

// 各区域通用软盘图（官方 PIN 规则图里的「?」款），给未公布展位占位
export const zoneThumbs = { A: 'img/pins/zone-A.jpg', B: 'img/pins/zone-B.jpg', C: 'img/pins/zone-C.jpg' }

export const pins = [
  // ---- 区域 IP PIN（已从各 IP 官方笔记确认的）----
  { id: 'A06-pin', no: 'A06', type: 'region', zone: 'A', name: '星布谷地存档碎片', booth: 'A06', how: '集章满 4 个', thumb: 'img/pins/A06.jpg', image: 'img/booths/A06/07.jpg' },
  { id: 'A11-1', no: 'A11-1', type: 'region', zone: 'A', name: '《绝区零》限定「存档碎片」· 日场发放', booth: 'A11', how: '线上预约后到展位「布连邦」雕像完成现场互动领取（预约预计 9/28 开放）', thumb: 'img/pins/A11-1.jpg', image: 'img/booths/A11/03.jpg' },
  { id: 'A11-2', no: 'A11-2', type: 'region', zone: 'A', name: '《绝区零》限定「存档碎片」· 夜场发放', booth: 'A11', how: '线上预约后到展位「布连邦」雕像完成现场互动领取（预约预计 9/28 开放）', thumb: 'img/pins/A11-2.jpg', image: 'img/booths/A11/03.jpg' },
  { id: 'A09-pin-1', no: 'A09-1', type: 'region', zone: 'A', name: '星穹铁道联名徽章 · 角色款', booth: 'A09', how: '现场互动打卡', thumb: 'img/pins/A09-1.jpg', image: 'img/booths/A09/01.jpg' },
  { id: 'A09-pin-2', no: 'A09-2', type: 'region', zone: 'A', name: '星穹铁道联名徽章 · LOGO 款', booth: 'A09', how: '现场互动打卡', thumb: 'img/pins/A09-2.jpg', image: 'img/booths/A09/01.jpg' },
  { id: 'A40', no: 'A40', type: 'region', zone: 'A', name: '《光与夜之恋》展台存档碎片（蓝鸟窗台款，橙）', booth: 'A40', how: '完成【窗畔花影】互动 或【绮梦花园】打卡，由工作人员在出口处发放（两项都需提前预约）', thumb: 'img/pins/A40.jpg', image: 'img/booths/A40/guide-16.jpg' },
  // 原神的徽章是 RED LAND 软盘造型（灰条 + 小红书角标齐全），但软盘是蓝色——A 区已确认的存档碎片都是橙色（见 A11 / A17c / A25 / A33），
  // 官方原文也只写「徽章一份」而不是「存档碎片」，所以是否计入 A 区拼图结算待确认，已写在 name 里
  { id: 'A10', no: 'A10', type: 'region', zone: 'A', name: '《原神》REDLAND 2026 徽章 · 派蒙点赞款（软盘为蓝色，非 A 区橙，是否计入区域拼图待确认）', booth: 'A10', how: '在 RED LAND 主会场页面预约后，参与展台【体验互动】领取', thumb: 'img/pins/A10.jpg', image: 'img/booths/A10/03.jpg' },
  // C-04 独立游戏大食堂（RED LAND 官方 9/21）：试玩 3 款游戏 + 出口结算处的「心选菜单小票」解锁，官方未放实物图
  { id: 'C04', no: 'C04', type: 'region', zone: 'C', name: '独立游戏大食堂存档碎片（样式待公布）', booth: 'C04', how: '在食堂各档口试玩满 3 款游戏，到出口结算处核验、生成「心选菜单小票」后解锁；数量有限先到先得', thumb: null, image: 'img/booths/C04/hall-00.jpg' },
  { id: 'A27', no: 'A27', type: 'region', zone: 'A', name: '《无限暖暖》RED LAND 存档碎片（暖暖拍立得款，橙）', booth: 'A27', how: '在展区旋转木马区域参与指定互动活动，限量 2000 份、发完即止', thumb: 'img/pins/A27.jpg', image: 'img/booths/A27/07.jpg' },
  { id: 'B10', no: 'B10', type: 'region', zone: 'B', name: '《明日方舟》REDLAND 存档碎片（罗德厨房款，黄）', booth: 'B10', how: '领随机食谱、规定时间内集齐指定食材后抽奖，金牌 / 主管 / 助理三档都有；每人一次', thumb: 'img/pins/B10.jpg', image: 'img/booths/B10/03.jpg' },
  { id: 'B11', no: 'B11', type: 'region', zone: 'B', name: '《明日方舟：终末地》REDLAND 存档碎片（钓鳞款，黄）', booth: 'B11', how: '完成钓鳞挑战后抽奖，金 / 银 / 铜三档都有；每人一次', thumb: 'img/pins/B11.jpg', image: 'img/booths/B11/03.jpg' },
  { id: 'C01-1', no: 'C01-1', type: 'region', zone: 'C', name: '《刺客信条：黑旗 记忆重置》RED LAND 2026 存档碎片 · 款一（蓝）', booth: 'C01', how: '参与展台活动（15 分钟实机试玩 / Coser 合影 / 历代角色投票榜）赢取，具体条件未公布', thumb: 'img/pins/C01-1.jpg', image: 'img/booths/C01/00.jpg' },
  { id: 'C01-2', no: 'C01-2', type: 'region', zone: 'C', name: '《刺客信条：黑旗 记忆重置》RED LAND 2026 存档碎片 · 款二（蓝）', booth: 'C01', how: '同款一，官方图里两款并列', thumb: 'img/pins/C01-2.jpg', image: 'img/booths/C01/00.jpg' },
  // 冒险者营地专属 PIN（RED LAND 官方号 9/22）：不属任何展位 / 区域，归到「夜间 / NPC / 老玩家 / 营地」那一筹
  { id: 'CAMP', no: 'CAMP', type: 'camp', zone: null, name: '冒险者营地专属 PIN（样式待公布）', booth: null, how: '在冒险者营地「官摄出片区」参与互动拍摄（子弹时间），每日 12:30 – 16:00 / 18:00 – 21:00，有机会解锁', thumb: null, image: 'img/rules/camp/02.jpg' },
  { id: 'A12-1', no: 'A12-1', type: 'region', zone: 'A', name: '《超自然行动组》存档碎片 · 日场款（橙）', booth: 'A12', how: '日间场 12:30–17:30 参与展台互动领取，具体互动方式待公布', thumb: 'img/pins/A12-1.jpg', image: 'img/booths/A12/02.jpg' },
  { id: 'A12-2', no: 'A12-2', type: 'region', zone: 'A', name: '《超自然行动组》存档碎片 · 夜场款（橙）', booth: 'A12', how: '夜间场 17:30–21:30 参与展台互动领取，与投影手电筒一同放送', thumb: 'img/pins/A12-2.jpg', image: 'img/booths/A12/02.jpg' },
  { id: 'A39', no: 'A39', type: 'region', zone: 'A', name: '粒粒的小人国「粒?」存档碎片（橙）', booth: 'A39', how: '互动区完成「摇粒乡交房仪式」（12:30–20:30），随摇粒乡入住礼包发放，每日限量先到先得', thumb: 'img/pins/A39.jpg', image: 'img/booths/A39/guide-05.jpg' },
  // 归环 / 阅文的「PIN 卡」：官方都没给 RED LAND 软盘造型的成品图，是否算冒险者拼图用的区域 PIN 待确认（名字里已注明）。
  // 归环 9/23 更正：奖品图里右上角黄色的 Q 版点赞卡才是 PIN 卡，之前抠的两张黑金「唱盘」卡片是透卡
  { id: 'A17b', no: 'A17b', type: 'region', zone: 'A', name: '归环 PIN 卡（黄色 Q 版点赞卡片，非软盘造型，是否属区域 PIN 待确认）', booth: 'A17b', how: '在归环展位完成 1 项指定互动（开业免单大作战 / 开业好礼运送中 / 万物可归环）可得 1 个礼品，PIN 卡是「木剧场 / PIN 卡 / 透卡 / 立牌」四种礼品之一；同一互动重复参与只有首次给', thumb: 'img/pins/A17b.jpg', image: 'img/booths/A17b/04.jpg' },
  { id: 'A35', no: 'A35', type: 'region', zone: 'A', name: '阅文小伙伴集结 PIN 卡（官方未放图，是否属区域 PIN 待确认）', booth: 'A35', how: '道诡异仙「坐忘麻将馆」参与趣味游戏互动即得（与湿巾一同发放）；日场限时记忆绕口令、夜场反向指令游戏', thumb: null, image: 'img/booths/A35/daogui.jpg' },
  { id: 'A25-1', no: 'A25-1', type: 'region', zone: 'A', name: 'ANIPLEX「存档碎片」· 日场款（橙）', booth: 'A25b', how: 'Aniplex 展台内拍照打卡 + 带 #国庆节在ANIPLEX展台当牛马 投稿小红书，随限定福袋发放；第一弹鬼灭之刃福袋与第二弹孤独摇滚福袋是同一对款式', thumb: 'img/pins/A25-1.jpg', image: 'img/booths/A25/second-00.jpg' },
  { id: 'A25-2', no: 'A25-2', type: 'region', zone: 'A', name: 'ANIPLEX「存档碎片」· 夜场款（黑绿）', booth: 'A25b', how: '与日场款为两款不同设计，同随限定福袋发放（第一弹 / 第二弹通用）', thumb: 'img/pins/A25-2.jpg', image: 'img/booths/A25/second-00.jpg' },
  { id: 'A33', no: 'A33', type: 'region', zone: 'A', name: '光·遇「存档碎片」（光之子草原款）', booth: 'A33', how: '参与光遇「每日任务」等多种互动体验，有机会领取；数量有限先到先得', thumb: 'img/pins/A33.jpg', image: 'img/booths/A33/04.jpg' },
  { id: 'A34-pin-1', no: 'A34-1', type: 'region', zone: 'A', name: '我的世界联名徽章 · 苦力怕款', booth: 'A34', how: '现场互动打卡', thumb: 'img/pins/A34-1.jpg', image: 'img/booths/A34/01.jpg' },
  { id: 'A36-1', no: 'A36-1', type: 'region', zone: 'A', name: '如鸢「存档碎片」· 日场款（样式待公布）', booth: 'A36', how: '凭整理券在【如鸢无料兑换台】领伴手礼时同时领取；每日 13:30 – 17:30 发放，数量有限先到先得', thumb: null, image: 'img/booths/A36/07.jpg' },
  { id: 'A36-2', no: 'A36-2', type: 'region', zone: 'A', name: '如鸢「存档碎片」· 夜场款（可夜光，样式待公布）', booth: 'A36', how: '每日 17:30 – 21:30 发放；需同时出示整理券及绣衣楼爵位 35 级以上界面（截图无效）', thumb: null, image: 'img/booths/A36/07.jpg' },
  { id: 'A38-pin', no: 'A38', type: 'region', zone: 'A', name: '剑网3 展台专属 PIN 卡（黄鸡大笑）', booth: 'A38', how: '展台【江湖笔记】留言寄语，每日限量先到先得', thumb: 'img/pins/A38.jpg', image: 'img/booths/A38/02.jpg' },
  { id: 'A34-pin-2', no: 'A34-2', type: 'region', zone: 'A', name: '我的世界联名徽章 · LOGO 款', booth: 'A34', how: '现场互动打卡', thumb: 'img/pins/A34-2.jpg', image: 'img/booths/A34/01.jpg' },
  { id: 'A17c-pin', no: 'A17c', type: 'region', zone: 'A', name: '命运扳机「存档碎片」PIN 套装', booth: 'A17c', how: '预约游戏并关注命运扳机小红书账号；套装含「外包装 + 三 IP 合一内卡」成品一件，另附《命运扳机》单款内卡', thumb: 'img/pins/A17c.jpg', image: 'img/booths/A17c/02.jpg' },
  { id: 'A24-pin-1', no: 'A24-1', type: 'region', zone: 'A', name: 'SCLA 小红书 PIN 徽章（存档碎片）· 假面骑士 / 奥特曼 / 哥斯拉 / 超级战队款', booth: 'A24', how: 'BINGO 完成 2 条及以上连线；每日礼品兑换 14:00 开始，每人每日限领 1 枚', thumb: 'img/pins/A24-1.jpg', image: 'img/booths/A24/02.jpg' },
  { id: 'A24-pin-2', no: 'A24-2', type: 'region', zone: 'A', name: 'SCLA 小红书 PIN 徽章（存档碎片）· 犬夜叉 / 初音未来 / EVA / 面包超人 / 柯南款', booth: 'A24', how: 'BINGO 完成 2 条及以上连线；每日礼品兑换 14:00 开始，每人每日限领 1 枚', thumb: 'img/pins/A24-2.jpg', image: 'img/booths/A24/02.jpg' },
  { id: 'B01-1', no: 'B01-1', type: 'region', zone: 'B', name: '蛋仔派对 存档碎片 · 日场款（黄）', booth: 'B01', how: '完成基础车间挑战（原胚生产 / 表情写入 / 外观装配）后前往盲盒机点位领取，12:30–17:30 发放，每日限量 800', thumb: 'img/pins/B01-1.jpg', image: 'img/booths/B01/guide-05.jpg' },
  { id: 'B01-2', no: 'B01-2', type: 'region', zone: 'B', name: '蛋仔派对 存档碎片 · 夜场款（黑）', booth: 'B01', how: '同日场款，17:30–21:30 发放夜场款，每日限量 400', thumb: 'img/pins/B01-2.jpg', image: 'img/booths/B01/guide-05.jpg' },
  { id: 'B04b-1', no: 'B04b-1', type: 'region', zone: 'B', name: '暴雪游戏 REDLAND 2026「存档碎片」· RED LAND × BLIZZARD × 網易 款', booth: 'B04b', how: '集齐全部展位印章后在暴雪游戏展台领取', thumb: 'img/pins/B04b-1.jpg', image: 'img/booths/B04b/guide-04.jpg' },
  { id: 'B04b-2', no: 'B04b-2', type: 'region', zone: 'B', name: '暴雪游戏 REDLAND 2026「存档碎片」· BLIZZARD 蓝面款', booth: 'B04b', how: '集齐全部展位印章后在暴雪游戏展台领取', thumb: 'img/pins/B04b-2.jpg', image: 'img/booths/B04b/guide-04.jpg' },
  { id: 'B07', no: 'B07', type: 'region', zone: 'B', name: '第五人格 REDLAND 存档碎片', booth: 'B07', how: '入学指南「墨痕答辩」课程获得满分', thumb: 'img/pins/B07.jpg', image: 'img/booths/B07/01.jpg' },
  { id: 'B09-1', no: 'B09-1', type: 'region', zone: 'B', name: '《重返未来：1999》徽章 · 日场款', booth: 'B09', how: '完成展台互动问答领取；12:30–17:30，每日 800 份', thumb: 'img/pins/B09-1.jpg', image: 'img/booths/B09/05.jpg' },
  { id: 'B09-2', no: 'B09-2', type: 'region', zone: 'B', name: '《重返未来：1999》徽章 · 夜场款', booth: 'B09', how: '完成展台互动问答领取；17:30–21:30，每日 400 份', thumb: 'img/pins/B09-2.jpg', image: 'img/booths/B09/05.jpg' },
  { id: 'B02-pin-1', no: 'B02-1', type: 'region', zone: 'B', name: '宝可梦江畔乐游主题 PIN · 皮卡丘款', booth: 'B02', how: '护照集章任务 1·2·3，12:30–17:30 领，每日 2500', thumb: 'img/pins/B02-1.jpg', image: 'img/booths/B02/04.jpg' },
  { id: 'B02-pin-2', no: 'B02-2', type: 'region', zone: 'B', name: '宝可梦江畔乐游主题 PIN · 谜拟丘款', booth: 'B02', how: '护照集章任务 1·2·3·6，17:30–21:30 领，每日 2000', thumb: 'img/pins/B02-2.jpg', image: 'img/booths/B02/04.jpg' },
  { id: 'B03-pin', no: 'B03', type: 'region', zone: 'B', name: 'RED LAND 存档碎片（Lovania，官方只给了粉色软盘造型图案，未出成品实拍）', booth: 'B03', how: '在「不忘乡」展台完成指定集章任务，与「神秘气球」一同发放', thumb: 'img/pins/B03-pin.jpg', image: 'img/booths/B03/03.jpg' },
  { id: 'B15-pin', no: 'B15', type: 'region', zone: 'B', name: 'REDLAND PIN（逆水寒 · 血河小狗款）', booth: 'B15', how: '参与逆水寒展台现场趣味互动', thumb: 'img/pins/B15.jpg', image: 'img/booths/B15/02.jpg' },
  { id: 'C16-pin', no: 'C16', type: 'region', zone: 'C', name: '宝可梦卡牌「存档碎片」· 超梦 & 梦幻款', booth: 'C16', how: '卡牌体验营完成 3 个任务领取；日场款 12:30–17:30 每日 2000 个，夜场款（夜光）17:30–21:30 每日 1200 个，每人每次限领 1 个', thumb: 'img/pins/C16.jpg', image: 'img/booths/B02/card-03.jpg' },
  { id: 'C08-pin', no: 'C08', type: 'region', zone: 'C', name: 'REDLAND 官方 PIN（猛兽派对，样式待公布）', booth: 'C08', how: '完成《猛兽派对》手游试玩得限定贴纸后到吧台兑换；或与随机现身的猛兽主角合影互动有机会获得', thumb: null, image: 'img/booths/C08/00.jpg' },
  { id: 'C17-pin', no: 'C17', type: 'region', zone: 'C', name: 'RED LAND 2026 限定徽章（航海王卡牌对战，样式待公布）', booth: 'C17', how: '集齐 3 枚航海王卡牌对战印章（SNS 打卡 / 策牌破局 / 互动游戏各 1 枚），扫码填问卷并下载万代卡牌 APP 后现场兑换；共限量 1600 枚', thumb: null, image: 'img/booths/C17/00.jpg' },
  { id: 'C07-pin', no: 'C07', type: 'region', zone: 'C', name: '苏丹的游戏徽章', booth: 'C07', how: '走完舍馆 → 集市 → 冒险者酒吧 → 哈比卜的厨房 → 苏丹的王座全流程，向苏丹献上美味大餐；参与互动的玩家均可获得', thumb: 'img/pins/C07.jpg', image: 'img/booths/C07/02.jpg' },
  { id: 'C13-pin', no: 'C13', type: 'region', zone: 'C', name: '存档碎片（RED LAND 2026 × 啦嗒铛）', booth: 'C13', how: 'GSE 展位试玩任何游戏后即得 1 个；日场 12:30–17:30 / 夜场 17:30–21:30，数量有限派完即止', thumb: 'img/pins/C13.jpg', image: 'img/booths/C13/hub-02.jpg' },

  // ---- 夜间 ----
  { id: 'night', no: 'N-01', type: 'night', name: '夜间 PIN（待解锁）', how: '夜间发放，月下模式神秘变体', thumb: 'img/pins/night.jpg', image: 'img/rules/pin/01.jpg' },

  // ---- 老玩家 ----
  { id: 'veteran', no: 'V-01', type: 'veteran', name: '初代目回归', how: '1.0 登岛老玩家线下直接兑换，每人限一个', thumb: 'img/pins/veteran.jpg', image: 'img/rules/pin-npc/01.jpg' },

  // ---- NPC 互动（6 款）----
  // 官方原文「7款NPC PIN&老玩家专属限定PIN就这样水灵灵地出现了~」中的 7 款是 NPC + 老玩家的合计：
  // 笔记图 01 是老玩家 1 枚、02–04 各 2 枚 NPC，共 6 + 1 = 7 枚，没有未公布的第 7 款 NPC（用户 9/14 指出）
  { id: 'npc-1', no: 'NPC-01', type: 'npc', name: 'AAA农产品批发', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-1.jpg', image: 'img/rules/pin-npc/02.jpg' },
  { id: 'npc-2', no: 'NPC-02', type: 'npc', name: '排位连胜', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-2.jpg', image: 'img/rules/pin-npc/02.jpg' },
  { id: 'npc-3', no: 'NPC-03', type: 'npc', name: 'CP金婚', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-3.jpg', image: 'img/rules/pin-npc/03.jpg' },
  { id: 'npc-4', no: 'NPC-04', type: 'npc', name: '不吃压力', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-4.jpg', image: 'img/rules/pin-npc/03.jpg' },
  { id: 'npc-5', no: 'NPC-05', type: 'npc', name: '十抽十金', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-5.jpg', image: 'img/rules/pin-npc/04.jpg' },
  { id: 'npc-6', no: 'NPC-06', type: 'npc', name: '一定要CARRY全场吗 SORRY全场不行吗', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-6.jpg', image: 'img/rules/pin-npc/04.jpg' },

  // ---- 冒险者拼图 ----
  { id: 'puzzle-A', no: 'R-A', type: 'reward', zone: 'A', name: '翻身时空港 冒险者拼图', how: '集齐 4 枚橙色 PIN 到区域结算点兑换', thumb: 'img/pins/puzzle-A.jpg', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-B', no: 'R-B', type: 'reward', zone: 'B', name: '黄金海岸线 冒险者拼图', how: '集齐 2 枚黄色 PIN 到区域结算点兑换', thumb: 'img/pins/puzzle-B.jpg', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-C', no: 'R-C', type: 'reward', zone: 'C', name: '重生试炼场 冒险者拼图', how: '集齐 2 枚蓝色 PIN 到区域结算点兑换', thumb: 'img/pins/puzzle-C.jpg', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-all', no: 'R-ALL', type: 'reward', name: 'RED LAND 2026 冒险岛拼图完整体', how: '三块区域拼图拼合', thumb: 'img/pins/puzzle-all.jpg', image: 'img/rules/pin/02.jpg' },
]
