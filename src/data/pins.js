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
  { key: 'reward', name: '冒险者拼图', desc: '各区域集齐 PIN 后到结算点兑换，三块拼成冒险岛拼图完整体', color: null },
]

// 各区域通用软盘图（官方 PIN 规则图里的「?」款），给未公布展位占位
export const zoneThumbs = { A: 'img/pins/zone-A.jpg', B: 'img/pins/zone-B.jpg', C: 'img/pins/zone-C.jpg' }

export const pins = [
  // ---- 区域 IP PIN（已从各 IP 官方笔记确认的）----
  { id: 'A06-pin', no: 'A06', type: 'region', zone: 'A', name: '星布谷地存档碎片', booth: 'A06', how: '集章满 4 个', thumb: 'img/pins/A06.jpg', image: 'img/booths/A06/07.jpg' },
  { id: 'A09-pin-1', no: 'A09-1', type: 'region', zone: 'A', name: '星穹铁道联名徽章 · 角色款', booth: 'A09', how: '现场互动打卡', thumb: 'img/pins/A09-1.jpg', image: 'img/booths/A09/01.jpg' },
  { id: 'A09-pin-2', no: 'A09-2', type: 'region', zone: 'A', name: '星穹铁道联名徽章 · LOGO 款', booth: 'A09', how: '现场互动打卡', thumb: 'img/pins/A09-2.jpg', image: 'img/booths/A09/01.jpg' },
  { id: 'A34-pin-1', no: 'A34-1', type: 'region', zone: 'A', name: '我的世界联名徽章 · 苦力怕款', booth: 'A34', how: '现场互动打卡', thumb: 'img/pins/A34-1.jpg', image: 'img/booths/A34/01.jpg' },
  { id: 'A38-pin', no: 'A38', type: 'region', zone: 'A', name: '剑网3 展台专属 PIN 卡（黄鸡大笑）', booth: 'A38', how: '展台【江湖笔记】留言寄语，每日限量先到先得', thumb: 'img/pins/A38.jpg', image: 'img/booths/A38/02.jpg' },
  { id: 'A34-pin-2', no: 'A34-2', type: 'region', zone: 'A', name: '我的世界联名徽章 · LOGO 款', booth: 'A34', how: '现场互动打卡', thumb: 'img/pins/A34-2.jpg', image: 'img/booths/A34/01.jpg' },
  { id: 'A24-pin-1', no: 'A24-1', type: 'region', zone: 'A', name: 'SCLA 小红书 PIN 徽章 · 假面骑士 / 奥特曼 / 哥斯拉 / 超级战队款', booth: 'A24', how: 'BINGO 完成 2 条及以上连线，每人每日限领 1 枚', thumb: 'img/pins/A24-1.jpg', image: 'img/booths/A24/02.jpg' },
  { id: 'A24-pin-2', no: 'A24-2', type: 'region', zone: 'A', name: 'SCLA 小红书 PIN 徽章 · 犬夜叉 / 初音未来 / EVA / 面包超人 / 柯南款', booth: 'A24', how: 'BINGO 完成 2 条及以上连线，每人每日限领 1 枚', thumb: 'img/pins/A24-2.jpg', image: 'img/booths/A24/02.jpg' },
  { id: 'B01-pin', no: 'B01', type: 'region', zone: 'B', name: '蛋仔派对 小红书 PIN（样式待公布）', booth: 'B01', how: '完成工厂打卡：拍摄蛋仔工厂场景并带话题发布小红书，与活动限定外观 CDK 一同领取', thumb: null, image: 'img/booths/B01/16.jpg' },
  { id: 'B02-pin-1', no: 'B02-1', type: 'region', zone: 'B', name: '宝可梦江畔乐游主题 PIN · 皮卡丘款', booth: 'B02', how: '护照集章任务 1·2·3，12:30–17:30 领，每日 2500', thumb: 'img/pins/B02-1.jpg', image: 'img/booths/B02/04.jpg' },
  { id: 'B02-pin-2', no: 'B02-2', type: 'region', zone: 'B', name: '宝可梦江畔乐游主题 PIN · 谜拟丘款', booth: 'B02', how: '护照集章任务 1·2·3·6，17:30–21:30 领，每日 2000', thumb: 'img/pins/B02-2.jpg', image: 'img/booths/B02/04.jpg' },
  { id: 'C07-pin', no: 'C07', type: 'region', zone: 'C', name: '苏丹的游戏徽章', booth: 'C07', how: '走完舍馆 → 集市 → 冒险者酒吧 → 哈比卜的厨房 → 苏丹的王座全流程，向苏丹献上美味大餐；参与互动的玩家均可获得', thumb: 'img/pins/C07.jpg', image: 'img/booths/C07/02.jpg' },

  // ---- 夜间 ----
  { id: 'night', no: 'N-01', type: 'night', name: '夜间 PIN（待解锁）', how: '夜间发放，月下模式神秘变体', thumb: 'img/pins/night.jpg', image: 'img/rules/pin/01.jpg' },

  // ---- 老玩家 ----
  { id: 'veteran', no: 'V-01', type: 'veteran', name: '初代目回归', how: '1.0 登岛老玩家线下直接兑换，每人限一个', thumb: 'img/pins/veteran.jpg', image: 'img/rules/pin-npc/01.jpg' },

  // ---- NPC 互动（官方公布 6 款，第 7 款待公布）----
  { id: 'npc-1', no: 'NPC-01', type: 'npc', name: 'AAA农产品批发', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-1.jpg', image: 'img/rules/pin-npc/02.jpg' },
  { id: 'npc-2', no: 'NPC-02', type: 'npc', name: '排位连胜', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-2.jpg', image: 'img/rules/pin-npc/02.jpg' },
  { id: 'npc-3', no: 'NPC-03', type: 'npc', name: 'CP金婚', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-3.jpg', image: 'img/rules/pin-npc/03.jpg' },
  { id: 'npc-4', no: 'NPC-04', type: 'npc', name: '不吃压力', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-4.jpg', image: 'img/rules/pin-npc/03.jpg' },
  { id: 'npc-5', no: 'NPC-05', type: 'npc', name: '十抽十金', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-5.jpg', image: 'img/rules/pin-npc/04.jpg' },
  { id: 'npc-6', no: 'NPC-06', type: 'npc', name: '一定要CARRY全场吗 SORRY全场不行吗', how: '与 NPC 互动随机掉落', thumb: 'img/pins/npc-6.jpg', image: 'img/rules/pin-npc/04.jpg' },
  { id: 'npc-7', no: 'NPC-07', type: 'npc', name: '第 7 款待公布', how: '官方称共 7 款 NPC PIN', thumb: null, image: null },

  // ---- 冒险者拼图 ----
  { id: 'puzzle-A', no: 'R-A', type: 'reward', zone: 'A', name: '翻身时空港 冒险者拼图', how: '集齐 4 枚橙色 PIN 到区域结算点兑换', thumb: 'img/pins/puzzle-A.jpg', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-B', no: 'R-B', type: 'reward', zone: 'B', name: '黄金海岸线 冒险者拼图', how: '集齐 2 枚黄色 PIN 到区域结算点兑换', thumb: 'img/pins/puzzle-B.jpg', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-C', no: 'R-C', type: 'reward', zone: 'C', name: '重生试炼场 冒险者拼图', how: '集齐 2 枚蓝色 PIN 到区域结算点兑换', thumb: 'img/pins/puzzle-C.jpg', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-all', no: 'R-ALL', type: 'reward', name: 'RED LAND 2026 冒险岛拼图完整体', how: '三块区域拼图拼合', thumb: 'img/pins/puzzle-all.jpg', image: 'img/rules/pin/02.jpg' },
]
