// PIN 图鉴数据（为后续「PIN 图鉴」功能准备；UI 尚未接入）
// type: region（区域 IP PIN，按展位）/ night（夜间 PIN）/ veteran（老玩家专属）/ npc（NPC 互动）/ reward（区域拼图等最终奖励）
// zone 对应 booths.js zones（A 翻身时空港 橙 / B 黄金海岸线 黄 / C 重生试炼场 蓝）
// image 为官方公开图（含该 PIN 的整张笔记图），后续可裁成单枚 PIN 缩略图
export const pinTypes = [
  { key: 'region', name: '区域 IP PIN', desc: '各 IP 展位互动获得，按区域分色，用于兑换冒险者拼图', color: null },
  { key: 'night', name: '夜间 PIN', desc: '黑色夜间限定，夜间发放', color: '#1f2a1f' },
  { key: 'veteran', name: '老玩家专属 PIN', desc: '1.0 登岛老玩家线下兑换，每人限一个', color: '#c9a24a' },
  { key: 'npc', name: 'NPC 互动 PIN', desc: '与岛上 NPC 聊天互动、合拍打卡随机掉落，库存有限', color: '#ff4b4b' },
  { key: 'reward', name: '冒险者拼图', desc: '各区域集齐 PIN 后到结算点兑换，三块拼成冒险岛拼图完整体', color: null },
]

export const pins = [
  // ---- 区域 IP PIN（已从各 IP 官方笔记确认的）----
  { id: 'A06-pin', type: 'region', zone: 'A', name: '星布谷地存档碎片', booth: 'A06', how: '集章满 4 个', image: 'img/booths/A06/06.jpg' },
  { id: 'A09-pin-1', type: 'region', zone: 'A', name: '星穹铁道联名徽章 · 角色款', booth: 'A09', how: '现场互动打卡', image: 'img/booths/A09/01.jpg' },
  { id: 'A09-pin-2', type: 'region', zone: 'A', name: '星穹铁道联名徽章 · LOGO 款', booth: 'A09', how: '现场互动打卡', image: 'img/booths/A09/01.jpg' },
  { id: 'A34-pin-1', type: 'region', zone: 'A', name: '我的世界联名徽章 · 苦力怕款', booth: 'A34', how: '现场互动打卡', image: 'img/booths/A34/01.jpg' },
  { id: 'A34-pin-2', type: 'region', zone: 'A', name: '我的世界联名徽章 · LOGO 款', booth: 'A34', how: '现场互动打卡', image: 'img/booths/A34/01.jpg' },
  { id: 'B02-pin-1', type: 'region', zone: 'B', name: '宝可梦江畔乐游主题 PIN · 皮卡丘款', booth: 'B02', how: '护照集章任务 1·2·3，12:30–17:30 领，每日 2500', image: 'img/booths/B02/04.jpg' },
  { id: 'B02-pin-2', type: 'region', zone: 'B', name: '宝可梦江畔乐游主题 PIN · 谜拟丘款', booth: 'B02', how: '护照集章任务 1·2·3·6，17:30–21:30 领，每日 2000', image: 'img/booths/B02/04.jpg' },

  // ---- 夜间 ----
  { id: 'night', type: 'night', name: '夜间 PIN（待解锁）', how: '夜间发放，月下模式神秘变体', image: 'img/rules/pin/01.jpg' },

  // ---- 老玩家 ----
  { id: 'veteran', type: 'veteran', name: '初代目回归', how: '1.0 登岛老玩家线下直接兑换，每人限一个', image: 'img/rules/pin-npc/01.jpg' },

  // ---- NPC 互动（官方公布 6 款，第 7 款待公布）----
  { id: 'npc-1', type: 'npc', name: 'AAA农产品批发', how: '与 NPC 互动随机掉落', image: 'img/rules/pin-npc/02.jpg' },
  { id: 'npc-2', type: 'npc', name: '排位连胜', how: '与 NPC 互动随机掉落', image: 'img/rules/pin-npc/02.jpg' },
  { id: 'npc-3', type: 'npc', name: 'CP金婚', how: '与 NPC 互动随机掉落', image: 'img/rules/pin-npc/03.jpg' },
  { id: 'npc-4', type: 'npc', name: '不吃压力', how: '与 NPC 互动随机掉落', image: 'img/rules/pin-npc/03.jpg' },
  { id: 'npc-5', type: 'npc', name: '十抽十金', how: '与 NPC 互动随机掉落', image: 'img/rules/pin-npc/04.jpg' },
  { id: 'npc-6', type: 'npc', name: '一定要CARRY全场吗 SORRY全场不行吗', how: '与 NPC 互动随机掉落', image: 'img/rules/pin-npc/04.jpg' },
  { id: 'npc-7', type: 'npc', name: '第 7 款待公布', how: '官方称共 7 款 NPC PIN', image: null },

  // ---- 冒险者拼图 ----
  { id: 'puzzle-A', type: 'reward', zone: 'A', name: '翻身时空港 冒险者拼图', how: '集齐 4 枚橙色 PIN 到区域结算点兑换', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-B', type: 'reward', zone: 'B', name: '黄金海岸线 冒险者拼图', how: '集齐 2 枚黄色 PIN 到区域结算点兑换', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-C', type: 'reward', zone: 'C', name: '重生试炼场 冒险者拼图', how: '集齐 2 枚蓝色 PIN 到区域结算点兑换', image: 'img/rules/pin/01.jpg' },
  { id: 'puzzle-all', type: 'reward', name: 'RED LAND 2026 冒险岛拼图完整体', how: '三块区域拼图拼合', image: 'img/rules/pin/02.jpg' },
]
