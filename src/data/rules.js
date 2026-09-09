// 主线玩法 / 彩蛋玩法（官方「冒险者攻略」半层原文整理）
export const event = {
  name: 'RED LAND 2026',
  slogan: '欢迎回家 · 永远的主角',
  dateText: '10.02 — 10.06',
  days: [
    { day: 1, date: '10月2日', short: '10/2', week: '周五' },
    { day: 2, date: '10月3日', short: '10/3', week: '周六' },
    { day: 3, date: '10月4日', short: '10/4', week: '周日' },
    { day: 4, date: '10月5日', short: '10/5', week: '周一' },
    { day: 5, date: '10月6日', short: '10/6', week: '周二' },
  ],
  venue: '上海 · 复兴岛 船台 PARK',
  address: '杨浦区共青路 130 号（复兴岛地铁站 2 号口步行约 110 米）',
}

export const mainline = {
  title: '主线玩法',
  subtitle: '收集 PIN 形态的存档碎片，解锁完整岛屿地图！',
  steps: [
    '自由探索冒险岛，完成各 IP 展位的任务获得 PIN 形式的「存档碎片」，提升存档进度。',
    '每个区域打卡对应数量的展位，即可完成该区域开图。前往三大区域结算点，兑换对应区域的「冒险岛的信物」。',
    '集齐三个区域的信物，即可合成「RED LAND 2026 冒险岛」冰箱贴！',
  ],
  regions: [
    { name: '翻身时空港', need: 4 },
    { name: '黄金海岸线', need: 2 },
    { name: '重生试炼场', need: 2 },
  ],
  tips: [
    '夜间模式下将有神秘变体 PIN 掉落，请务必逗留到夜幕降临！',
    '展位 PIN 每日掉落数量有限，先到先得。',
  ],
}

export const eggs = {
  title: '彩蛋玩法',
  items: [
    {
      name: '老玩家专属款 PIN「初代目回归」',
      desc: '曾在烈日炎炎下探险的勇士们，你的汗水已经结晶成永恒的纪念，老玩家专属 PIN 等你来领！',
      note: '1.0 登岛老玩家每人限量领取一个',
    },
    {
      name: 'NPC 互动款 PIN',
      desc: '一年一度的限定相遇，岛民们正在期待着主角的到来，积极与岛上 NPC 互动，可能会掉落神秘奖励哦！',
      note: '只由部分 NPC 角色发放，数量有限、先到先得',
    },
  ],
}

export const places = [
  {
    key: 'coast',
    tag: '新地图',
    name: '港口 · 黄金海岸线',
    desc: '这里有充满宝藏的 IP 市集，清凉吃喝补给站。在这里挂机休息、同好集邮、晒谷打卡。听说还能从神秘人那里获取惊喜物资！',
  },
  {
    key: 'night',
    tag: '新模式',
    name: '夜间 · 月下模式',
    desc: '次元的奇遇打破了小岛夜间的宁静！夜间的岛民可不像白天那样好说话，但传说中稀有的物资还是让人忍不住冒险。',
  },
  {
    key: 'camp',
    tag: '日更派对',
    name: '冒险者营地',
    desc: '「同好聚集地」：面基同好、邂逅大神；白天日光舞台，入夜月光舞台限定 LIVE，花车白天也停泊在这里。',
  },
]

// 每日固定时刻
export const dailySchedule = [
  { time: '12:30 – 16:30', name: '花车打卡', where: '冒险者营地', kind: 'parade' },
  { time: '15:00', name: '展台嘉宾刷新', where: '星布谷地等展台（以各展台公告为准）', kind: 'booth' },
  { time: '17:30 – 18:00', name: '花车巡游', where: '冒险者大道', kind: 'parade' },
  { time: '19:00 – 21:00', name: '月光舞台 LIVE', where: '冒险者营地', kind: 'stage' },
  { time: '入夜后', name: '月下模式（神秘变体 PIN）', where: '全岛', kind: 'night' },
]
