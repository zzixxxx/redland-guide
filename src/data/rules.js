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

// 场馆导航：用关键词搜索 URI（无需坐标，避免坐标系偏移），手机上会拉起对应 App
const kw = encodeURIComponent('复兴岛船台PARK')
export const venueNav = {
  name: '复兴岛船台 PARK',
  address: '上海市杨浦区共青路 130 号（地铁 12 号线复兴岛站 2 号口步行约 110 米）',
  copyText: '上海市杨浦区共青路130号 复兴岛船台PARK',
  links: [
    { label: '高德地图', url: `https://uri.amap.com/search?keyword=${kw}&city=${encodeURIComponent('上海')}&view=map&callnative=1&src=redland-guide` },
    { label: '百度地图', url: `https://map.baidu.com/search/${kw}?querytype=s&c=289&wd=${kw}` },
    { label: 'Apple 地图', url: `https://maps.apple.com/?q=${kw}` },
  ],
}

export const mainline = {
  title: '主线玩法',
  subtitle: '收集 PIN 形态的存档碎片，集齐「冒险者拼图」，解锁完整岛屿地图！',
  steps: [
    '自由探索小岛，前往各 IP 展位互动点参与互动，即可收获各 IP 限定 PIN（「存档碎片」）。每日数量有限，先到先得。',
    '完成对应区域所需数量的 PIN 后，前往该区域结算点，兑换对应区域的「冒险者拼图」（8 月攻略半层称「冒险岛的信物」）。',
    '收集完三个区域的「冒险者拼图」，最终拼成一个完整的 RED LAND 2026 冒险岛拼图完整体，把这份美好的记忆带回家。',
  ],
  // PIN 按区域分色（官方 8 月 25 日 PIN 收集玩法图）
  regions: [
    { name: '翻身时空港', need: 4, zone: 'A', pin: '橙色 PIN', color: '#f26a2e' },
    { name: '黄金海岸线', need: 2, zone: 'B', pin: '黄色 PIN', color: '#f2c23a' },
    { name: '重生试炼场', need: 2, zone: 'C', pin: '蓝色 PIN', color: '#2f8fe6' },
  ],
  nightPin: { name: '夜间 PIN', desc: '黑色夜间限定 PIN，夜间发放；月下模式下将有神秘变体 PIN 掉落，请务必逗留到夜幕降临！', color: '#1f2a1f' },
  tips: [
    '各 IP 展位 PIN 每日数量有限，先到先得。',
    '已收录的展台详情里，星布谷地 / 星穹铁道 / 我的世界（A 区）PIN 为橙色，宝可梦（B 区）PIN 为黄色，与区域分色一致。',
  ],
  images: [
    { src: 'img/rules/pin/01.jpg', alt: '三大区域 PIN 与冒险者拼图兑换规则' },
    { src: 'img/rules/pin/02.jpg', alt: 'RED LAND 2026 冒险者拼图完整体（岛屿三区域示意）' },
  ],
  source: {
    title: '人是铁！PIN是钢！全部拿下响当当！',
    url: 'https://xhslink.cn/o/2nRsiczOkgz',
    author: 'RED LAND',
    publishedAt: '2026-08-25',
  },
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
  { time: '15:00', name: '展台嘉宾刷新', where: '星布谷地等展台（以各展台公告为准）', kind: 'ip' },
  { time: '17:30 – 18:00', name: '花车巡游', where: '冒险者大道', kind: 'parade' },
  { time: '19:00 – 21:00', name: '月光舞台 LIVE', where: '冒险者营地', kind: 'stage' },
  { time: '入夜后', name: '月下模式（神秘变体 PIN）', where: '全岛', kind: 'night' },
]
