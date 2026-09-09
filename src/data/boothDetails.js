// 展台详情：来自各 IP 官方小红书笔记（脚本 scripts/fetch-note.mjs 可抓取新笔记的文字与图片）
// key = booths.js 中的 booth.id
// 字段约定：
//   source      笔记来源（title / url / noteId / author / publishedAt）
//   intro       笔记开头的欢迎语
//   notes       笔记里的注意事项（*开头）
//   activities  展台活动 [{ title, desc, partner?, needBooking?, rewards?[] }]
//   stage       舞台活动 [{ title, desc, schedule?: [{ day, guests[] }] }]
//   tasks       展台任务 [{ title, desc, rewards[], tags?[] }]
//   rewards     奖励一览（去重后的所有可领物品）
//   footnote    奖励说明
//   images      原始笔记图片（public/img/booths/<id>/ 下的相对路径）

// 宝可梦：一条笔记覆盖 B-02 / B-17 / C-16 三个展位，B02 与 C16 共用同一份详情
const pokemon = {
  source: {
    title: '惊喜福利！江畔乐游宝可梦嘉年华信息速递',
    url: 'https://xhslink.cn/o/4uQTzjzPY27',
    noteId: '6a9e436e000000002603acdf',
    author: 'Pokemon宝可梦',
    publishedAt: '2026-09-08',
  },
  boothNo: 'B-02 / B-17 / C-16',
  intro:
    '本次活动区域涵盖 B-02「‘皮’‘伊’欢聚站」、B-17「江畔乐游 宝可梦嘉年华」主会场及 C-16「宝可梦卡牌体验营」三大展位。主会场设有超 5000㎡ 大型嘉年华区域，邀你畅玩！',
  notes: ['更多活动信息即将发布，敬请期待', '图片系设计效果图，仅供参考，具体请以实物为准'],
  activities: [
    {
      title: '「皮」「伊」欢聚站（B-02）',
      desc: '拍照打卡点，站内设集章处，可领护照、盖伊布印章、领冰箱贴。',
    },
    {
      title: '江畔乐游 宝可梦嘉年华 主会场（B-17）',
      desc: '超 5000㎡ 嘉年华区域。互动项目：正电拍拍 & 负电拍拍气模合影、拍拍挑战、转转风车、活力投篮、彩影箱灯、集装可爱。设问询处、各集章处与周边兑换处。',
    },
    {
      title: '宝可梦卡牌体验营（C-16）',
      desc: '宝可梦卡牌教学、对战、打卡；营内设集章处（超梦 & 梦幻印章），可领护照与冰箱贴。',
    },
    {
      title: '江畔乐游护照 · 集章打卡领好礼',
      desc: 'Step1 领取「宝可梦江畔乐游护照」→ Step2 根据护照提示前往目的地完成任务盖章 → Step3 凭护照领取主题周边。一册在手，玩转宝可梦嘉年华！',
    },
  ],
  stage: [],
  tasks: [
    {
      title: 'Step1：领取宝可梦江畔乐游护照',
      desc: '以下地点均可领取：B-02「皮」「伊」欢聚站内的集章处；B-17 嘉年华主会场问询处及场内各集章处；C-16 宝可梦卡牌体验营内的集章处。',
      rewards: ['宝可梦江畔乐游护照 ×1'],
    },
    {
      title: '任务 1：正电拍拍 & 负电拍拍印章',
      desc: '前往嘉年华主会场（B-17），找到正电拍拍、负电拍拍气模，拍照并带话题发布至小红书。',
      tags: ['#宝可梦江畔乐游'],
      rewards: ['正电拍拍 & 负电拍拍印章'],
    },
    {
      title: '任务 2：小磁怪印章',
      desc: '前往嘉年华主会场（B-17），参与「拍拍挑战」或「转转风车」。',
      rewards: ['小磁怪印章'],
    },
    {
      title: '任务 3：巨牙鲨印章',
      desc: '前往嘉年华主会场（B-17），参与「活力投篮」「彩影箱灯」或「集装可爱」。',
      rewards: ['巨牙鲨印章'],
    },
    {
      title: '任务 4：伊布印章',
      desc: '前往「皮」「伊」欢聚站（B-02），拍照并带话题发布至小红书。',
      tags: ['#宝可梦江畔乐游'],
      rewards: ['伊布印章'],
    },
    {
      title: '任务 5：超梦 & 梦幻印章',
      desc: '前往宝可梦卡牌体验营（C-16）集章处。',
      rewards: ['超梦 & 梦幻印章'],
    },
    {
      title: '任务 6：谜拟丘印章（夜间限定）',
      desc: '每日 17:30 后，体验「拍拍挑战」「活力投篮」「彩影箱灯」「转转风车」或「集装可爱」，还可加盖谜拟丘印章。',
      rewards: ['谜拟丘印章'],
    },
  ],
  rewards: [
    {
      name: '宝可梦江畔乐游主题 PIN · 皮卡丘款（白天款）',
      how: '完成任务 1·2·3，凭护照在 B-17 主会场兑换处领取；12:30~17:30，每日 2500 个，每人限领 1 个',
      pin: true,
    },
    {
      name: '宝可梦江畔乐游主题 PIN · 谜拟丘款（夜晚款）',
      how: '完成任务 1·2·3·6，凭护照在 B-17 主会场兑换处领取；17:30~21:30，每日 2000 个，每人限领 1 个',
      pin: true,
    },
    {
      name: '宝可梦江畔乐游主题冰箱贴（发光效果）',
      how: '完成任务 1·2·3·4·5，凭护照领取；每日 4500 个，每人限领 1 个；领取地点 B-02 集章处 / B-17 兑换处 / C-16 集章处',
    },
    { name: '宝可梦江畔乐游护照', how: 'Step1 在 B-02 / B-17 / C-16 任一集章处免费领取' },
  ],
  footnote: '所有周边先到先得，赠完即止；图片系设计效果图，具体以实物为准。',
  images: ['img/booths/B02/00.jpg', 'img/booths/B02/01.jpg', 'img/booths/B02/02.jpg', 'img/booths/B02/03.jpg', 'img/booths/B02/04.jpg'],
}

// 崩坏：星穹铁道：笔记主体是 4.5 版本线上征集活动，只收录其中「REDLAND 参展情报」部分
const starRail = {
  source: {
    title: '独家爆料！砂金总监的特别行程（仅收录 RED LAND 参展情报部分）',
    url: 'https://xhslink.cn/o/3Uavk4nqdSl',
    noteId: '6a98e2b30000000011030ca9',
    author: '崩坏：星穹铁道',
    publishedAt: '2026-09-03',
  },
  boothNo: 'A9',
  intro: 'RED LAND 行程播报：星际和平公司高管砂金先生和真珠女士，将于 10 月 2 日—10 月 6 日莅临上海复兴岛 RED LAND，视察星际和平公司相关展位。',
  notes: ['具体参展消息详见活动页面', '展会相关后续活动内容，以 RED LAND 官方消息为准'],
  activities: [
    {
      title: '砂金 & 真珠 确认登岛',
      desc: '参展内容海报以砂金、真珠为主视觉，「星际和平公司高管砂金先生和真珠女士将莅临复兴岛视察星际和平公司相关展位」。现场形式以官方后续公告为准。',
    },
  ],
  stage: [],
  tasks: [
    {
      title: '互动打卡活动',
      desc: '参与现场互动打卡，即可领取徽章，详细活动规则请以现场公告为准。',
      rewards: ['RED LAND 2026 × 崩坏：星穹铁道 联名徽章（2 款：角色款 / 联名 LOGO 款）'],
    },
  ],
  rewards: [
    { name: '联名徽章 · 角色款', how: '现场互动打卡领取；每日发放数量有限，领取规则以 RED LAND 官方为准', pin: true },
    { name: '联名徽章 · 联名 LOGO 款', how: '现场互动打卡领取；每日发放数量有限，领取规则以 RED LAND 官方为准', pin: true },
  ],
  footnote: '每日发放数量有限，领取规则以 RED LAND 官方为准。笔记中的 4.5 版本线上征集活动与展台无关，未收录。',
  images: ['img/booths/A09/00.jpg', 'img/booths/A09/01.jpg'],
}

// 宝藏码头：RED LAND 官方号发布的集市型展位（黄金海岸线），含 IP 摊位名单与隐藏集章玩法
const treasureDock = {
  source: {
    title: '⚓主角，跟薯一起去宝藏码头整点好物！',
    url: 'https://xhslink.cn/o/1EgmPlmTPDr',
    noteId: '6a9d2e7b00000000120259b9',
    author: 'RED LAND',
    publishedAt: '2026-09-06',
  },
  boothNo: 'B16',
  hours: '每日 12:30 – 21:30',
  location: '黄金海岸线「宝藏码头」',
  intro:
    '来自各次元的冒险者已经带着宝藏靠岸归港。这里就是传说中号称购“谷”圣地的「宝藏码头」——闪闪发光的限定好物、珍奇好价的宝藏谷、一眼心动的稀奇玩意，都将在这里等主角们亲自来淘！',
  notes: ['虚拟偶像 Eon 的宝藏仅在 10 月 2–4 日出现', '小象大鹅的宝藏仅在 10 月 5–6 日出现'],
  activities: [
    {
      title: '购“谷”圣地 · IP 周边摊位',
      desc: '16 个 IP 摊位售卖限定好物与周边（名单见下方「摊位名单」），部分摊位限定日期出现。',
    },
    {
      title: '隐藏玩法 · 神秘印章拼图',
      desc: '到达宝藏码头入口服务处领取一份「打卡无料」，既能导览摊位也可收藏。逛摊间隙留意码头各个角落：公区堆头旁和各处角落藏着颜色、形状各不相同的神秘印章，集满并在打卡无料上盖章后，所有印章会拼合成一幅完整的隐藏画面。',
    },
  ],
  stage: [],
  tasks: [
    {
      title: '领取打卡无料',
      desc: '宝藏码头入口服务处领取，可用于导览摊位与集章。',
      rewards: ['宝藏码头打卡无料 ×1'],
    },
    {
      title: '寻找神秘印章',
      desc: '在公区堆头旁和各处角落找到全部神秘印章，盖在打卡无料上。',
      rewards: ['集满后拼合成完整隐藏画面（内容待现场揭晓）'],
    },
  ],
  rewards: [
    { name: '宝藏码头打卡无料', how: '入口服务处免费领取' },
    { name: '隐藏画面（印章拼图）', how: '集满码头各处神秘印章并盖章' },
  ],
  stalls: [
    { name: '火影忍者疾风传', featured: true },
    { name: '闪魂 ShiningSoul', featured: true },
    { name: '超自然行动组' },
    { name: '第五人格' },
    { name: '火影忍者' },
    { name: 'Lovania' },
    { name: '漫威 授权商品售卖' },
    { name: '猛兽派对' },
    { name: '蓬蓬狗' },
    { name: 'SEGA STORE SHANGHAI' },
    { name: '双界引擎' },
    { name: '王者好物' },
    { name: '新创华' },
    { name: '虚拟偶像 Eon', note: '仅 10 月 2–4 日' },
    { name: '小象大鹅', note: '仅 10 月 5–6 日' },
    { name: '永劫无间 IP' },
  ],
  stallsNote: '所有 IP 按照首字母缩写顺序排列',
  footnote: '以上为官方 9 月 6 日公布信息，隐藏画面内容需现场揭晓。',
  images: ['img/booths/B16/00.jpg', 'img/booths/B16/01.jpg'],
}

// 火影忍者（皮乐中国）：一日村民兑换卡 → 三点位敲章 → 斜挎包 / 抽奖
const naruto = {
  source: {
    title: '来火影忍者REDLAND|你会解锁...超夯礼品！',
    url: 'https://xhslink.cn/o/5wK9HdT2MfY',
    noteId: '6a9e64c4000000002a005210',
    author: '皮乐动漫',
    publishedAt: '2026-09-07',
  },
  boothNo: 'A-22',
  hours: '每日 13:00 – 22:00',
  location: '翻身时空港 A-22',
  intro: '【火影忍者 RED LAND】展位最新情报！登岛限定奖品严肃准备中……等你来解锁神秘重磅好礼！这个国庆，快来和皮乐中国一起登岛！',
  notes: ['所有奖品先到先得，发完即止'],
  activities: [
    {
      title: '互动赢好礼 · 成为木叶村一日村民',
      desc: '成为木叶村一日村民，获得兑换卡（佐助 / 鸣人 / 小樱三格 + 奖品兑换券，可留下作为纪念卡）。敲章卡每日限定 600 张。',
    },
  ],
  stage: [],
  tasks: [
    {
      title: '打卡三个点位，集齐三章',
      desc: '持兑换卡打卡完成展台三个点位可获得敲章；三章集齐即可获得 RED LAND 限定重磅好礼，或参加礼品抽奖（拼欧气 TIME！）。',
      rewards: [
        '定制专业户外斜挎包（每日限定 180 个）',
        '或 礼品抽奖：一等奖 火影忍者手办 / 二等奖 立牌或吧唧组合 / 三等奖 色纸或文件夹 / 四等奖 单个吧唧 / 五等奖 拍立得或透卡（周边每日限定 420 份）',
      ],
    },
  ],
  rewards: [
    { name: '定制火影忍者户外斜挎包（RED LAND 限定）', how: '集齐三章兑换；每日限定 180 个，先到先得' },
    { name: '礼品抽奖（拼欧气 TIME）', how: '集齐三章可选抽奖：手办 / 立牌或吧唧组合 / 色纸或文件夹 / 单个吧唧 / 拍立得或透卡；周边每日限定 420 份' },
    { name: '敲章兑换卡（纪念卡）', how: '成为一日村民领取；每日限定 600 张' },
  ],
  footnote: '先到先得，发完即止。笔记评论区抽门票福利属票务内容，未收录。',
  images: ['img/booths/A22/00.jpg'],
}

// 三丽鸥：餐车型「深夜食光能量补给站」，排号限时营业，售卖 6 款食材造型玩偶
const sanrio = {
  source: {
    title: '深夜时刻到！欢迎来补给站品尝美食🍤🦑',
    url: 'https://xhslink.cn/o/97UvzcseKwj',
    noteId: '6a9a436100000000110366be',
    author: 'Sanrio三丽鸥',
    publishedAt: '2026-09-04',
  },
  boothNo: 'A-21',
  hours: '补给站 每日 17:30 – 20:30',
  location: '翻身时空港 A-21',
  intro: '三丽鸥 星际登陆 · 深夜食光能量补给站限时营业！登陆 RED LAND 的小可爱们，速来查收补给指南～',
  notes: [
    '10 月 4 日–6 日每日 17:30–18:30，当日「萌气补给官」惊喜出现限时服务（展位内售卖区购买的不可参与）',
    '每日食材有限，每人每款限购一件；每日餐车接待人数有限，号码牌发完即止',
  ],
  activities: [
    {
      title: '排队区 · 按号码牌顺序',
      desc: 'Step1 每日前往补给站门口指定处排队，领取补给号码牌（进入补给站用餐的唯一凭证，遗失不补）；Step2 每日 17:30 起限时开放营业，两位可爱主厨为你服务；Step3 等待叫号期间可提前选菜并结账；Step4 号码牌发完即止，请关注现场工作人员通知。',
    },
    {
      title: '打包区 · 一对一体验互动',
      desc: 'Step1 提交菜单给主厨，由主厨挑选今日新鲜食材加工；Step2 根据自己的口味撒粉加酱；Step3 主厨亲自打包并系上蝴蝶结和食材小卡。「萌气补给官」时段若选购多款食材，仅一款由补给官加工打包，其余由另一位主厨服务。',
    },
  ],
  stage: [],
  tasks: [
    {
      title: '领取补给号码牌',
      desc: '每日 17:30 前到补给站门口指定处排队领号，凭号入站用餐。',
      rewards: ['补给号码牌（用餐唯一凭证）'],
    },
  ],
  menu: [
    { name: '布丁狗 烤年糕串', price: '¥159', note: '咬一口是糯叽叽的！' },
    { name: '美乐蒂 烤鱿鱼', price: '¥159', note: '浓郁酱汁 Yummy' },
    { name: 'Hello Kitty 夏日气泡可乐', price: '¥159', note: '来杯冰阔落吧！' },
    { name: '帕恰狗 手卷寿司', price: '¥159', note: '嗷呜一大口~' },
    { name: '大耳狗 章鱼小香肠', price: '¥159', note: '焦脆外皮好诱人' },
    { name: '酷洛米 天妇罗', price: '¥159', note: '记得搭配小柠檬' },
  ],
  menuNote: '每人每款限购一件；「食材」为三丽鸥角色造型玩偶',
  rewards: [
    { name: '餐盒 + 6 款食材小卡（随购附赠）', how: '打包区由主厨打包并系上蝴蝶结与食材小卡；数量有限，送完即止' },
  ],
  footnote: '数量有限，送完即止；营业信息以现场为准。',
  images: ['img/booths/A21/00.jpg', 'img/booths/A21/01.jpg'],
}

// Aniplex（鬼灭之刃 / 孤独摇滚 共用 A25 展位）：次元管理局入队 → 工牌 + 任务手册 → 完成任务领限定特典
const aniplex = {
  source: {
    title: '次元管理局入队指南已送达！',
    url: 'https://xhslink.cn/o/59SWOYsvyZX',
    noteId: '6a87fdd20000000021008427',
    author: 'Aniplex',
    publishedAt: '2026-08-21',
  },
  boothNo: 'A-25（鬼灭之刃 / 孤独摇滚 共用）',
  intro: 'ANIPLEX 次元管理局入队指南：各位次元旅行者，前来登记入队！关注 ANIPLEX 社媒账号领取你的专属工牌，开启次元探索之旅。',
  notes: ['限定特典具体内容与指定任务以现场任务手册为准'],
  activities: [
    {
      title: '次元旅行者工牌',
      desc: '进入次元管理局的身份凭证，PVC 卡片 + 挂绳，可挂在胸前方便拍照。',
    },
    {
      title: '任务手册',
      desc: '包括活动说明、任务线索、动线地图、盖章区。',
    },
  ],
  stage: [],
  tasks: [
    {
      title: '入队流程（5 步）',
      desc: '01 关注 Aniplex 官方社媒账号 → 02 向工作人员出示已关注页面 → 03 领取【次元旅行者工牌】及【任务手册】→ 04 佩戴工牌开启次元探索之旅 → 05 完成指定任务领取 RED LAND 限定特典。',
      rewards: ['次元旅行者 PVC 工牌（带挂绳）', '任务手册', 'RED LAND 限定特典（完成指定任务）'],
    },
  ],
  rewards: [
    { name: '次元旅行者 PVC 工牌（带挂绳）', how: '现场出示已关注 Aniplex 官方社媒账号页面领取' },
    { name: '任务手册（动线地图 / 任务线索 / 盖章区）', how: '与工牌一同领取' },
    { name: 'RED LAND 限定特典', how: '佩戴工牌完成手册指定任务后领取，内容待现场揭晓' },
  ],
  footnote: '以上为 Aniplex 8 月 21 日公布的入队指南，鬼灭之刃 / 孤独摇滚展位具体内容以现场为准。',
  images: ['img/booths/A25/00.jpg'],
}

// 我的世界：中国版九周年派对登岛，互动打卡领徽章；笔记中的发笔记送门票不收录
const minecraft = {
  source: {
    title: '《我的世界》周年派对 | 解锁REDLAND门票（仅收录参展信息部分）',
    url: 'https://xhslink.cn/o/dpKxwGccEO',
    noteId: '6a9a42440000000012026fd6',
    author: '我的世界Minecraft',
    publishedAt: '2026-09-04',
  },
  boothNo: 'A-34',
  intro: '《我的世界》中国版九周年派对即将登陆 RED LAND，在此向各位冒险家发出邀请！',
  notes: ['更多情报请关注官方后续发布，详细活动规则以现场公告为准'],
  activities: [
    {
      title: '九周年派对 · 互动打卡活动',
      desc: '参与现场互动，可领取《我的世界》徽章等丰富限定周边。官方「IP 展位一览」另提到：5 米苦力怕国内首秀，肌肉史蒂夫空降生日派对。',
    },
  ],
  stage: [],
  tasks: [
    {
      title: '现场互动打卡',
      desc: '参与展台现场互动即可领取徽章，规则以现场公告为准。',
      rewards: ['RED LAND 2026 × 我的世界 联名徽章（2 款：苦力怕款 / 联名 LOGO 款）'],
    },
  ],
  rewards: [
    { name: '联名徽章 · 苦力怕款', how: '现场互动打卡领取；周边每日发放数量有限，先到先得', pin: true },
    { name: '联名徽章 · 联名 LOGO 款', how: '现场互动打卡领取；周边每日发放数量有限，先到先得', pin: true },
  ],
  footnote: '周边每日发放数量有限，先到先得。笔记中「发笔记送门票」属票务内容，未收录。',
  images: ['img/booths/A34/00.jpg', 'img/booths/A34/01.jpg'],
}

export default {
  A34: minecraft,
  A25a: aniplex,
  A25b: { ...aniplex, boothNo: 'A-25（孤独摇滚，与鬼灭之刃共用 Aniplex 展位）' },
  A21: sanrio,
  A22: naruto,
  B16: treasureDock,
  A09: starRail,
  B02: pokemon,
  C16: { ...pokemon, boothNo: 'C-16（同属宝可梦江畔乐游，详情与 B-02 / B-17 共用）' },
  A06: {
    source: {
      title: 'RED LAND2026 | 星布谷地展台活动详情',
      url: 'https://xhslink.cn/o/2KHjtNJUxgl',
      noteId: '6a9eb0540000000028001b61',
      author: '星布谷地',
      publishedAt: '2026-09-07',
    },
    boothNo: 'A-06',
    intro: '欢迎光临星布谷地！我们在 RED LAND 期待与你相遇~',
    notes: ['部分活动需提前预约，详情见后续公告', '每日奖品数量有限，先到先得'],
    activities: [
      {
        title: '游戏试玩',
        desc: '体验在小小星球上的治愈生活',
        partner: 'ROG 玩家国度（Republic of Gamers）',
      },
      {
        title: '与奥陌陌和友邻见面吧',
        desc: '奥陌陌与友邻们将全天候在星布谷地展台等待你的光临（5 位角色人偶）',
      },
      {
        title: '野咖啡 · REDLAND 分店 限时营业',
        desc: '与娜洛分享你的今日奇遇吧~',
        needBooking: true,
        rewards: ['野咖啡纸杯', '娜洛贴纸或迷你亚克力（随机一款）'],
      },
    ],
    stage: [
      {
        title: '星空舞台大挑战',
        desc: '节奏挑战、阿莱的舞蹈大赛……参与舞台趣味挑战活动，赢取星布谷地「优秀种星人」大红花！',
      },
      {
        title: '惊喜嘉宾',
        desc: '舞台嘉宾每日 15:00 刷新，与 TA 们一起点亮星空舞台！',
        schedule: [
          { day: '10月2日', guests: ['@张恩恩NNN'] },
          { day: '10月3日', guests: ['@宝剑嫂'] },
          { day: '10月4日', guests: ['@锅盖wer'] },
          { day: '10月5日', guests: ['@倪大宝啊!', '@云Kumo'] },
          { day: '10月6日', guests: ['@宋小雅', '@大脸雨哥'] },
        ],
      },
    ],
    tasks: [
      {
        title: '任务一：游戏预约',
        desc: '完成游戏预约，即可领取「星布谷地搬家袋」一个（肩背手提两用）',
        rewards: ['星布谷地搬家袋 ×1'],
      },
      {
        title: '任务二：集章活动',
        desc: '抵达星布谷地展台，领取「集章卡」，完成展台集章任务',
        rewards: ['集章满 3 个：「奥陌陌吧唧」×1', '集章满 4 个：「星布谷地存档碎片」×1（RED LAND 2026 PIN）'],
      },
      {
        title: '任务三：打卡分享',
        desc: '拍摄活动照片，带 TAG 并发布在小红书上，即可领取「星布谷地透卡」一张（角色随机，共 4 款）',
        tags: ['#欢迎光临星布谷地', '#星布谷地REDLAND'],
        rewards: ['星布谷地透卡 ×1（角色随机）'],
      },
    ],
    rewards: [
      { name: '星布谷地存档碎片（PIN）', how: '集章满 4 个', pin: true },
      { name: '奥陌陌吧唧', how: '集章满 3 个' },
      { name: '星布谷地搬家袋', how: '完成游戏预约' },
      { name: '星布谷地透卡（4 款随机）', how: '带 TAG 发布打卡笔记' },
      { name: '野咖啡纸杯', how: '野咖啡分店活动（需预约）' },
      { name: '娜洛贴纸 / 迷你亚克力（随机一款）', how: '野咖啡分店活动（需预约）' },
      { name: '「优秀种星人」大红花', how: '星空舞台大挑战' },
    ],
    footnote: '所有奖励每日数量有限，先到先得。',
    images: [
      'img/booths/A06/00.jpg',
      'img/booths/A06/01.jpg',
      'img/booths/A06/02.jpg',
      'img/booths/A06/03.jpg',
      'img/booths/A06/04.jpg',
      'img/booths/A06/05.jpg',
      'img/booths/A06/06.jpg',
      'img/booths/A06/07.jpg',
      'img/booths/A06/08.jpg',
    ],
  },
}
