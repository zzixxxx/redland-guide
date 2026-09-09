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

export default {
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
