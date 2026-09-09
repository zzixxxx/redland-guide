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

export default {
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
