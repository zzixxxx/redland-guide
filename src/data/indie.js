// C04 独立游戏试玩区 · 试玩名单
// 来源：RED LAND 官方「独立游戏聚合页」（ditto 页 93f070416d60405ea59f29bb691a0df3，主会场 IP 半层底部「独立游戏试玩区」入口），
//       官方按首字母缩写排序，页尾注「*所有IP按照首字母缩写顺序排列」。2026-09-09 16:51 版共 84 款（8/29 版 78 款，9/9 新增 6 款）。
// 每项 { name, en?, xhs?: { uid, name }, url? }：
//   name 为官方页标签原文；en 为官方并列的英文名；xhs 为该游戏 / 工作室的小红书账号（来源：该游戏官方号发的 RED LAND 登岛笔记，
//   9/11 已补 41 个；505 Games 一个账号对应其发行的 5 款、UBISOFT育碧 对应 异变金属；其余待用户提供笔记链接）；url 为该游戏的攻略链接（待补，有则名字可点）。
const g = (name, en) => (en ? { name, en } : { name })

export const indieSource = {
  title: 'RED LAND 独立游戏试玩区 · 近百款独立游戏集中上桌，欢迎登岛品鉴',
  url: 'https://xhslink.com/m/4VL27MmQ48U',
  pageId: '93f070416d60405ea59f29bb691a0df3',
  author: 'RED LAND 官方',
  lastEditTime: '2026-09-09 16:51:52',
}

export const indieGames = [
  { letter: 'A', games: [g('AAA海岛热线'), g('奥咕和秘密森林')] },
  { letter: 'B', games: [{ name: '白烬之兔', xhs: { uid: '68ff075600000000310130b5', name: '白烬之兔' } }, { name: '波特兰的绿雾', xhs: { uid: '6a0d63bc000000000103f002', name: '波特兰的绿雾' } }, g('背锅天神')] },
  { letter: 'C', games: [{ name: '策划模拟器', xhs: { uid: '5bff8fad44363b5cf09f2c80', name: '百里浪春' } }, { name: '超能蕾雅的异次元之旅', xhs: { uid: '61b58621000000002102629f', name: '505 Games' } }] },
  { letter: 'D', games: [g('Delphinium'), g('大爱仙尊模拟器'), g('地府有点忙'), g('独居日志：插画家之梦'), { name: '动物骰', xhs: { uid: '6110f2d3000000000101d687', name: 'IndieArk' } }, { name: '地狱不空', xhs: { uid: '6a28e39d0000000002002801', name: '地狱不空TillHellisEmpty' } }, g('地狱公主')] },
  { letter: 'F', games: [{ name: '风与牧场', xhs: { uid: '62725ec7000000002102068c', name: '阿席的游戏开发日志' } }] },
  { letter: 'G', games: [{ name: '观鸟笔记', xhs: { uid: '66975296000000000d0263d7', name: '观鸟笔记' } }, { name: '怪奇漫游指南', xhs: { uid: '5ca82038000000001700c742', name: 'Rock&Dash工作室' } }, g('GENTLY PACKED')] },
  { letter: 'H', games: [{ name: '黑暗世界：因与果', xhs: { uid: '655cfce400000000080016fe', name: '月壤工作室' } }, { name: '好朋友', xhs: { uid: '5c8ce9eb0000000011022754', name: '好朋友（OnAnyJourney）' } }, { name: '浣熊推币机', xhs: { uid: '61a5c4e7000000001000a090', name: '浣熊推币机' } }, g('盒子面包坊'), g('狐狸饺子', 'FOXY DUMPLINGS')] },
  { letter: 'J', games: [{ name: '救世阿姨', xhs: { uid: '67b540ad000000000a03c4ee', name: '陆生海胆LandUni' } }, { name: '鸡械绿洲', xhs: { uid: '61be8fe0000000001000f381', name: '黑灯游戏' } }, { name: '节奏狗狗', xhs: { uid: '61b58621000000002102629f', name: '505 Games' } }, { name: '节奏汪星', xhs: { uid: '6535138e00000000040089e8', name: 'Mecrew games' } }] },
  { letter: 'L', games: [g('凉茶王'), { name: '落日山丘', xhs: { uid: '5f05f66d00000000010003d4', name: '落日山丘SunsetHills' } }, { name: '列乌尼斯的挽歌', xhs: { uid: '6535138e00000000040089e8', name: 'Mecrew games' } }, g('恋爱从离别开始后'), g('绿植小筑')] },
  { letter: 'M', games: [g('魔法门之英雄无敌III 重制版'), g('猫狗同行'), g('猫咪狂梦'), g('妹妹、他人、妄想症'), g('猫小暖：海钓物语')] },
  { letter: 'N', games: [{ name: '柠檬先生', xhs: { uid: '6535138e00000000040089e8', name: 'Mecrew games' } }, { name: '尼瓦利斯之夜', xhs: { uid: '61b58621000000002102629f', name: '505 Games' } }] },
  { letter: 'O', games: [{ name: '鸥买嘎', en: 'GULLTASTROPHE', xhs: { uid: '6772d1d6000000001801638e', name: 'unSAME在做游戏' } }] },
  { letter: 'P', games: [g('婆罗洲的红珍珠'), { name: '噗通！潜水时光', xhs: { uid: '660d9c9d000000000d0271d1', name: '噗通！潜水时光' } }] },
  { letter: 'Q', games: [g('千里山河录'), { name: '囚生症', xhs: { uid: '63c63aa0000000002702a7fc', name: '囚生症制作组' } }, g('栖霞日记'), g('去月球 传奇RPG之最终一小时')] },
  { letter: 'R', games: [g('Rain 98'), g('Roman Sands RE:Build')] },
  { letter: 'S', games: [{ name: '睡个好觉', xhs: { uid: '6535138e00000000040089e8', name: 'Mecrew games' } }, g('三国叶子戏'), { name: '神力科莎EVO', xhs: { uid: '61b58621000000002102629f', name: '505 Games' } }, { name: '神力科莎：拉力', xhs: { uid: '61b58621000000002102629f', name: '505 Games' } }, { name: '睡前派对', xhs: { uid: '68d0fdd8000000001a017fcf', name: '睡前派对 Sleepover' } }, g('神缺席'), g('杀死影子'), g('死亡日：狂杀末路')] },
  { letter: 'T', games: [g('唐宫诗与谋'), { name: '天津1924', xhs: { uid: '61e7af7600000000100082b9', name: '倍儿哏儿工作室' } }, { name: '弹企鹅', xhs: { uid: '695a1d89000000002b016759', name: '弹企鹅PengPong' } }] },
  { letter: 'W', games: [g('我不是胖虎：小岛大当家')] },
  {
    letter: 'X',
    games: [g('星环便利店'), { name: '小黑鹂', xhs: { uid: '6a166b780000000002001001', name: '小黑鹂TheMerlies' } }, g('箱即是空'), g('星幕协约'), g('星砂岛'), { name: '小苔屋', xhs: { uid: '69170d440000000037004ecb', name: '小苔屋' } }, { name: '小小的岛', xhs: { uid: '5ea7f88b0000000001008481', name: '小小的岛开发日志' } }, { name: '蟹蟹狂想曲', xhs: { uid: '6884f62b000000001b0191e4', name: '蟹蟹狂想曲' } }, { name: '小熊牌屋', xhs: { uid: '6535138e00000000040089e8', name: 'Mecrew games' } }, g('仙乡小千金'), { name: '血月', en: 'AINUR', xhs: { uid: '63ebb774000000002702ab81', name: 'Azmat' } }, { name: '玄玉劫', xhs: { uid: '6535138e00000000040089e8', name: 'Mecrew games' } }],
  },
  { letter: 'Y', games: [g('一笔勾销'), { name: '异变金属', xhs: { uid: '668f3613000000000d02588e', name: 'UBISOFT育碧' } }, { name: '摇摆沼泽', xhs: { uid: '5df19bac00000000010085e6', name: 'insect_494' } }, g('炎拳天使'), g('异兔传说'), g('银翼喵侍'), { name: '宇宙怪谈', xhs: { uid: '602b0993000000000101e349', name: '🛸宇宙怪谈播报员' } }] },
  { letter: 'Z', games: [g('醉风酒'), g('铸星工厂'), g('只有姐姐的世界'), g('斩业人'), { name: '骤雨终日', xhs: { uid: '63557da2000000001802a63a', name: '做游戏的野猴子' } }] },
]

export const indieCount = indieGames.reduce((n, x) => n + x.games.length, 0)
