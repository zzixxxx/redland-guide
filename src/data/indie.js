// C04 独立游戏试玩区 · 试玩名单
// 来源：RED LAND 官方「独立游戏聚合页」（ditto 页 93f070416d60405ea59f29bb691a0df3，主会场 IP 半层底部「独立游戏试玩区」入口），
//       官方按首字母缩写排序，页尾注「*所有IP按照首字母缩写顺序排列」。2026-09-09 16:51 版共 84 款（8/29 版 78 款，9/9 新增 6 款）。
// 每项 { name, en?, xhs?: { uid, name }, url? }：
//   name 为官方页标签原文；en 为官方并列的英文名；xhs 为该游戏 / 工作室的小红书账号（来源：该游戏官方号发的 RED LAND 登岛笔记，
//   9/11 已补 5 个，其余待用户提供笔记链接）；url 为该游戏的攻略链接（待补，有则名字可点）。
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
  { letter: 'B', games: [{ name: '白烬之兔', xhs: { uid: '68ff075600000000310130b5', name: '白烬之兔' } }, g('波特兰的绿雾'), g('背锅天神')] },
  { letter: 'C', games: [g('策划模拟器'), g('超能蕾雅的异次元之旅')] },
  { letter: 'D', games: [g('Delphinium'), g('大爱仙尊模拟器'), g('地府有点忙'), g('独居日志：插画家之梦'), g('动物骰'), { name: '地狱不空', xhs: { uid: '6a28e39d0000000002002801', name: '地狱不空TillHellisEmpty' } }, g('地狱公主')] },
  { letter: 'F', games: [g('风与牧场')] },
  { letter: 'G', games: [{ name: '观鸟笔记', xhs: { uid: '66975296000000000d0263d7', name: '观鸟笔记' } }, { name: '怪奇漫游指南', xhs: { uid: '5ca82038000000001700c742', name: 'Rock&Dash工作室' } }, g('GENTLY PACKED')] },
  { letter: 'H', games: [g('黑暗世界：因与果'), g('好朋友'), g('浣熊推币机'), g('盒子面包坊'), g('狐狸饺子', 'FOXY DUMPLINGS')] },
  { letter: 'J', games: [g('救世阿姨'), g('鸡械绿洲'), g('节奏狗狗'), g('节奏汪星')] },
  { letter: 'L', games: [g('凉茶王'), { name: '落日山丘', xhs: { uid: '5f05f66d00000000010003d4', name: '落日山丘SunsetHills' } }, g('列乌尼斯的挽歌'), g('恋爱从离别开始后'), g('绿植小筑')] },
  { letter: 'M', games: [g('魔法门之英雄无敌III 重制版'), g('猫狗同行'), g('猫咪狂梦'), g('妹妹、他人、妄想症'), g('猫小暖：海钓物语')] },
  { letter: 'N', games: [g('柠檬先生'), g('尼瓦利斯之夜')] },
  { letter: 'O', games: [g('鸥买嘎', 'GULLTASTROPHE')] },
  { letter: 'P', games: [g('婆罗洲的红珍珠'), g('噗通！潜水时光')] },
  { letter: 'Q', games: [g('千里山河录'), g('囚生症'), g('栖霞日记'), g('去月球 传奇RPG之最终一小时')] },
  { letter: 'R', games: [g('Rain 98'), g('Roman Sands RE:Build')] },
  { letter: 'S', games: [g('睡个好觉'), g('三国叶子戏'), g('神力科莎EVO'), g('神力科莎：拉力'), g('睡前派对'), g('神缺席'), g('杀死影子'), g('死亡日：狂杀末路')] },
  { letter: 'T', games: [g('唐宫诗与谋'), g('天津1924'), g('弹企鹅')] },
  { letter: 'W', games: [g('我不是胖虎：小岛大当家')] },
  {
    letter: 'X',
    games: [g('星环便利店'), g('小黑鹂'), g('箱即是空'), g('星幕协约'), g('星砂岛'), g('小苔屋'), g('小小的岛'), g('蟹蟹狂想曲'), g('小熊牌屋'), g('仙乡小千金'), g('血月'), g('玄玉劫')],
  },
  { letter: 'Y', games: [g('一笔勾销'), g('异变金属'), g('摇摆沼泽'), g('炎拳天使'), g('异兔传说'), g('银翼喵侍'), g('宇宙怪谈')] },
  { letter: 'Z', games: [g('醉风酒'), g('铸星工厂'), g('只有姐姐的世界'), g('斩业人'), g('骤雨终日')] },
]

export const indieCount = indieGames.reduce((n, x) => n + x.games.length, 0)
