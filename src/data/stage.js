// 冒险者营地 · 月光舞台（官方「冒险者营地上线」半层原文整理）
export const campInfo = {
  title: '冒险者营地上线！',
  desc: '白天，神秘大神与主角们在这里相见；入夜后，各大 IP 限定演出、音乐狂欢轮番上演。在冒险者营地，热爱永不落幕！',
  sun: {
    name: '日光舞台',
    // 时段来自 RED LAND 官方号 2026-09-11 场馆平面图，图上营地标注为「日光冒险 <13:30-16:00>」
    time: '13:30 – 16:00',
    desc: '主角们可以换上最喜欢的冒险皮肤来到这里，和同好一起定格美好记忆时刻～「冒险者营地」可能会因为存档的影响每天焕新哦！',
  },
  moon: {
    name: '月光舞台',
    time: '19:00 – 21:00（90 – 120 分钟）',
    short: '19:00-21:00',
    desc: '夜色降临，属于 RED LAND 的狂欢才刚刚开始。不同主题舞台，每天都是绝不重样的限定 LIVE！',
  },
  disclaimer:
    '本次活动相关内容可能受不可控因素影响作相应调整，最终以官方公告为准；演出节目和节目顺序以实际演出为准；现场演出可能由于天气或其他不可预见原因暂停或取消。',
}

// items: { performer, songs[], ip? , note? }
export const stageDays = [
  {
    day: 1,
    date: '10月2日',
    theme: '国漫古风日',
    hint: '一日江湖悠哉，请以国风角色赴约',
    items: [
      { performer: 'KBShinya', songs: ['对酒', '千秋令', '青衫薄'] },
      { performer: 'KBShinya', songs: ['飞雪落红尘', '红尘共长生'], ip: '未定事件簿同人曲' },
      { performer: '云之泣', songs: ['青玉案', '锦鲤抄'] },
      { performer: '云之泣', songs: ['如寄', '伴我'], ip: '剑网3' },
      { performer: '李蚊香', songs: ['春日不迟', '青山予我', '不谓侠'] },
      { performer: '陈亦洺', songs: ['不及', '千秋迭梦', '晚夜微雨问海棠'] },
      { performer: '陈亦洺', songs: ['满庭芳'], ip: '狐妖小红娘' },
      { performer: '小时姑娘', songs: ['溯洄', '同簪', '爱殇'] },
      { performer: '小时姑娘', songs: ['母神傀'], ip: '以闪亮之名' },
      { performer: '排骨教主', songs: ['入画', '伶人'] },
      { performer: '排骨教主', songs: ['有人赴约', '此夜记侠名'], ip: '剑网3' },
    ],
  },
  {
    day: 2,
    date: '10月3日',
    theme: '热血竞技日',
    hint: '竞技副本即将开始，请以战斗角色入场',
    items: [
      { performer: '犬舍乐队', songs: ['本色出演', '战歌'] },
      { performer: '犬舍乐队', songs: ['星之火～awake～'], ip: '大王饶命' },
      { performer: '犬舍乐队', songs: ['未归人'], ip: '狐妖小红娘' },
      { performer: '犬舍乐队', songs: ['决斗场见'], ip: '《火影忍者》手游' },
      { performer: '夏句Natsuki', songs: ['一舞翩翩', '与我对望的光', '逆光之上'], ip: '王者荣耀' },
      { performer: '钱润玉', songs: ['待春归'], ip: '鸣潮' },
      { performer: '钱润玉', songs: ['妄梦', '向黑夜发问'], ip: '第五人格' },
      { performer: 'i-Link 心跳连结女团', songs: ['冒险岛版·庄园女团出道'], ip: '第五人格' },
      { performer: '第五人格', songs: ['庄园 QQ 人登岛'], ip: '第五人格' },
      {
        // RED LAND 官方号 9/15「欢迎登岛，拳头游戏音乐参演数据同步完成」：10 月 3 日 19:00–21:00
        performer: '拳头游戏音乐 · 特邀 DJ Willim缪维霖',
        songs: ['TICKING AWAY', '2 WORLDS', '「VALORANT SOUND 音脉共振」电音秀精选曲目', '《英雄联盟》经典曲目 DJ 串烧秀'],
        ip: '无畏契约 / 英雄联盟',
        note: '10 月 3 日 19:00 – 21:00。《无畏契约》视听狂欢：「VALORANT SOUND 音脉共振」电音秀精选曲目，解锁《TICKING AWAY》《2 WORLDS》等更多惊喜现场；伴随踏入英雄联盟音乐赛季，另有《英雄联盟》经典曲目 DJ 串烧秀。',
        images: ['img/stage/riot/00.jpg', 'img/stage/riot/01.jpg', 'img/stage/riot/02.jpg'],
      },
    ],
  },
  {
    day: 3,
    date: '10月4日',
    theme: '经典共鸣日',
    hint: '熟悉的 BGM 响起，请带经典角色再次登场',
    items: [
      { performer: 'DOUDOU', songs: ['A Rusty Dream'], ip: '赛博朋克：边缘行者2', note: 'RED LAND 2026 首席次元歌者' },
      { performer: '和音社交响乐团', songs: ["Ezio's Family", 'Assassin\'s Creed Rogue Main Theme'], ip: '刺客信条' },
      { performer: '和音社交响乐团', songs: ['永劫无间音乐组曲（交响乐演绎）'], ip: '永劫无间' },
      { performer: '大门E', songs: ['导火索', '入尘', '同生'] },
      { performer: '和音社交响乐团', songs: ['新世纪福音战士(EVA) 组曲', 'JOJO 的奇妙冒险 组曲'] },
    ],
  },
  {
    day: 4,
    date: '10月5日',
    theme: '青春治愈日',
    hint: '捕获心动瞬间，请以青春角色赴约',
    items: [
      { performer: '扭蛋姬乐队', songs: ['夏之羽翼 Summer wings', '黑夜燃尽之时'] },
      { performer: '扭蛋姬乐队', songs: ['溃围'], ip: '斗罗大陆' },
      { performer: '幽舞越山', songs: ['出发！奇想大冒险', '折纸向飞（Find My Way）', 'Collide'], ip: '无限暖暖' },
      {
        performer: '星布谷地',
        songs: ['敬请期待'],
        ip: '星布谷地',
        note: '星布谷地 9/16「惊喜活动预告」：特邀嘉宾王男 & 王广将与友邻们一起联合演绎星布谷地全新单曲（曲名未公布）；月光舞台 19:00 – 21:00，具体出场时间以当日节目单为准。',
      },
      { performer: '蛋仔派对', songs: ['蛋仔成团曲'], ip: '蛋仔派对', note: '所有人举起手，一起嘎达嘎达！' },
      { performer: '伊莫', songs: ['接着奏乐接着舞 伊莫扭动小屁股'], ip: '伊莫' },
      { performer: 'OPG 舞团', songs: ['扶摇直上', '异人 Disco'], ip: '一人之下', note: '节目名《可恶！身为异人世界的青年翘楚们却被拐来 REDLAND 月光舞台表演，现世吧，扶摇 Disco！》' },
      { performer: '呦猫UNEKO', songs: ['予光'] },
      { performer: '呦猫UNEKO', songs: ['愿我', '铭记'], ip: '狐妖小红娘' },
      { performer: '祈Inory', songs: ['Glimmer', '唤梦', '命运之镰', 'Keep On Fighting'] },
      { performer: 'Loger_陈乐一', songs: ['月下逢', '只为情故', '重逢'], ip: '诛仙' },
    ],
  },
  {
    day: 5,
    date: '10月6日',
    theme: '我们相遇在此刻',
    hint: '请以你最爱的角色赴约，把美好的记忆再次存档',
    items: [
      { performer: 'ChiliChill 乐团', songs: ['pinKing'], ip: '绝区零' },
      { performer: 'ChiliChill 乐团', songs: ['Pink Flavor', '飞鸟说', '别让我担心', '我不曾忘记'] },
      { performer: '茶理理', songs: ['星间旅行'], ip: '崩坏：星穹铁道' },
      { performer: '茶理理', songs: ['荆棘鸟', 'ROVE'] },
      { performer: 'DMYoung', songs: ['极限委托 2026'], ip: '绝区零', note: '绝区零官方号 9/19：10月6日 19:00 – 21:00 锁定「冒险者营地 - 月光舞台」' },
      {
        performer: '伍六七剧组',
        songs: ['我想和你一起去海边', '陪在你左右', '连备胎都不是', '相遇就是好天气', '暗影刺客', '无论你多怪异我还是会喜欢你'],
        ip: '伍六七',
        note: '节目《伍六七：登岛吧！见想念的人！》歌手：皮怡然、向桓册、杨振宇；乐队：张紫程、孟振宇、陈威宇、吴量、任斯睿',
      },
      { performer: '小缘', songs: ['那颗星梦见的春日', '定玄'], ip: '鸣潮' },
      { performer: '上海迪士尼度假区', songs: ['惊喜节目即将揭晓'], ip: '疯狂动物城明星居民' },
    ],
  },
]

// 舞台页页尾「来源」卡（可折叠，默认展开）：主来源 = 官方活动页「冒险者营地上线」半层；其余 = 补充演出情报的官方笔记
export const stageSources = {
  main: {
    title: '官方活动页「冒险者营地上线」半层',
    url: 'https://fe.xiaohongshu.com/ditto/vincent/1875a92b788843718d0b335dd77b1a41?naviHidden=yes&fullscreen=true',
    author: 'RED LAND 官方活动页',
    publishedAt: '2026-09-09 版',
  },
  more: [
    { title: '欢迎登岛，拳头游戏音乐参演数据同步完成（DAY2 · 10/3 无畏契约 / 英雄联盟 DJ 专场）', url: 'https://xhslink.cn/o/ASkJyTHPx1v', noteId: '6aa933340000000011036bad', author: 'RED LAND 官方号', publishedAt: '2026-09-15' },
    { title: 'RED LAND2026 | 星布谷地惊喜活动预告（DAY4 · 10/5 王男 & 王广联合演绎全新单曲）', url: 'https://xhslink.cn/o/6fb3vuIQh9Q', noteId: '6aa9233f000000001103b6c0', author: '星布谷地', publishedAt: '2026-09-16' },
    { title: 'RED LAND 2026 | 绝区零展台活动前瞻（DAY5 · 10/6 19:00 – 21:00 DMYoung 月光舞台）', url: 'https://xhslink.cn/o/4EjuUWy7p6j', noteId: '6aad1a23000000000b00c5a8', author: '绝区零', publishedAt: '2026-09-19' },
  ],
}

// 冒险者营地「头车小舞台」每日日程（RED LAND 官方号 2026-09-22「冒险者营地主题团建小赛到底有谁在啊？！」）
// 主理人按日轮换、团建小赛每天换主题；整活表演 / ending 的时段图 01 写 15:00–15:30 / 15:30–16:00、图 09 写 15:10–15:30 / 15:30–15:40，两套并存
export const campProgram = {
  title: '头车小舞台 · 每日日程',
  subtitle: '主理人见面会 → 主题团建小赛 → 整活表演 → 集体大合影，每天 13:30 起',
  // RED LAND 官方 9/25 预约日历：冒险者营地「冒险者见面会」是 2 个官方预约活动之一，9/27 开约（最早一批）
  booking: '「冒险者见面会」（来花车营地和每天的冒险者进行 1v1 见面互动）需在 RED LAND 主会场预约，官方 9/25 预约日历列在 9 月 27 日开约',
  hosts: [
    { day: 1, date: '10月2日', name: '泷吟 & 阿季', role: '江湖搭子 / 睡教双侠' },
    { day: 2, date: '10月3日', name: '柴阿狗', role: '热血啦啦队' },
    { day: 3, date: '10月4日', name: '黄靖翔', role: '老二次元班长' },
    { day: 4, date: '10月5日', name: '张恩恩', role: '青春整活课代表' },
    { day: 5, date: '10月6日', name: '谢安然', role: '闪耀偶像前辈 / 制作人' },
  ],
  schedule: [
    { time: '12:30', name: '开园', desc: '' },
    { time: '13:30 – 14:30', name: '主理人见面会', desc: '每日登场不一样的主理人，面对面互动、解锁线下近距离会面羁绊，现场还有超多随机小惊喜掉落。' },
    { time: '14:30 – 15:10', name: '主题团建小赛', desc: '主理人在头车小舞台现场发布任务，每天刷新全新趣味主题；主角们可积极参与互动，每轮选出优胜主角获得互动小赛礼品。' },
    { time: '15:00 – 15:30', name: '高能整活表演', desc: '各种脑洞大开的表演轮番登场（分日图写 15:10 – 15:30）。' },
    { time: '15:30 – 16:00', name: '仪式感 ending · 集体大合影', desc: '跟随主理人完成当日专属集体 pose 定格（分日图写 15:30 – 15:40）。' },
  ],
  contests: [
    { day: 1, theme: '睡教小赛 · 江湖入「觉」大会', sub: '江湖门派千千万，今天统一拜入「睡教」', task: '发布今日门派招新：请寻找最佳睡点，完成入教考核', content: '主理人化身「睡教掌门」现场收徒；一同参与比拼现场维持人设入睡 3min' },
    { day: 2, theme: '载具小赛 · 次元载具试驾会 / 万物皆可当坐骑', sub: '战斗角色的三次元代步工具，二次元有自己的花车巡游', task: '发布「三次元载具性能测试」：角色驾驱限定扭扭车完成一轮低配载具竞速', content: 'Coser 依次出征，驾驶不同阵营色的扭扭车，完成短程赛道' },
    { day: 3, theme: '童年返场 · 二次元课间游戏', sub: '时代在召唤，谁的童年 DNA 动了', task: '发布「二次元童年团建」，集体做一套广播体操', content: 'Coser 跟着领操员，集体做一套广播体操' },
    { day: 4, theme: '偷吃小赛 · 上课偷吃谷', sub: '', task: '广播「上课铃已响」，主理人化身「临时班主任」，发布课堂隐藏任务：请带着你的「巨型谷子」，在老师巡堂期间完成一次偷偷吃谷', content: '嘴里偷偷吃零食，把身上自己带的吧唧、立牌、娃娃、痛包都变成掩护道具，不要被老师发现哦' },
    { day: 5, theme: '手腕比拼握手会 · 二次元有的是力气', sub: '二次元握手会含金量有点高', task: '主理人以「闪耀偶像前辈」开启今日限定握手会。但这场握手会有点不一样 —— 手都握上了，不如顺便掰一个', content: '现场选择自己的阵营，来一场掰手腕的挑战擂台赛' },
  ],
  endings: [
    { day: 1, desc: '主理人召集全体 Coser 围坐打坐、抱剑入定、闭目收功，像江湖门派集体收势一样，完成一张有仪式感的「百人打坐图」' },
    { day: 2, desc: '全员 JOJO 立叠叠乐，摄影师倒计时，全员坚持 JOJO 立动作对镜头摆出 pose 抓拍定格合影' },
    { day: 3, desc: '经典动作返场全员剪刀手合拍，统一举起经典剪刀手，喊一声「一、二、三 —— 茄子！」，完成当天最后一张群像' },
    { day: 4, desc: '主理人召集大家把吧唧、立牌、棉花娃、票根、小卡等谷子一起摆出来，自由拼桌陈列，最后和自己的「推」一起拍一张「青春推活纪念照」' },
    { day: 5, desc: '主理人邀请大家集体饭撒比心营业，可以两人组队，也可以用脚比心，也可自助成团拍摄【比心九宫格】' },
  ],
  photo: [
    { name: '花车拍照打卡（营地摆放）', time: '12:30 – 16:00', desc: '花车停泊在营地，随时打卡。' },
    { name: '主题日美拍机', time: '12:30 – 16:00', desc: '根据每日主题进行【美拍体验】互动，拍摄即可获得人像主题报纸 1 张。' },
    { name: '官摄出片区 · 互动拍摄（子弹时间）', time: '12:30 – 16:00 ｜ 18:00 – 21:00', desc: '拍摄背景同步随当日主题副本轮换，多机位子弹时间稳稳记录高光瞬间；参与拍摄还有机会解锁冒险者营地专属 PIN。' },
  ],
  newspapers: [
    { day: 1, name: '江湖门派通缉令' },
    { day: 2, name: '热血车神成就达成' },
    { day: 3, name: '童年返场 · REDLAND 特刊' },
    { day: 4, name: 'REDLAND 中学校园墙' },
    { day: 5, name: '独家!! REDLAND 现场神秘偶像出道' },
  ],
  tip: '主角们可以参考当日主题搭配造型，和营地画风适配度拉满，轻轻松松就出片～ 具体时间以现场公告为准。',
  images: [
    { src: 'img/rules/camp/00.jpg', alt: '冒险者营地主题团建小赛 · 主视觉' },
    { src: 'img/rules/camp/01.jpg', alt: '营地总日程 · 花车打卡与头车小舞台' },
    { src: 'img/rules/camp/02.jpg', alt: '营地总日程 · 主题日美拍机与官摄出片区' },
    { src: 'img/rules/camp/03.jpg', alt: '冒险者见面会 · 五日主理人' },
    { src: 'img/rules/camp/04.jpg', alt: '10月2日团建小赛 · 睡教小赛' },
    { src: 'img/rules/camp/05.jpg', alt: '10月3日团建小赛 · 载具小赛' },
    { src: 'img/rules/camp/06.jpg', alt: '10月4日团建小赛 · 二次元课间游戏' },
    { src: 'img/rules/camp/07.jpg', alt: '10月5日团建小赛 · 上课偷吃谷' },
    { src: 'img/rules/camp/08.jpg', alt: '10月6日团建小赛 · 掰手腕握手会' },
    { src: 'img/rules/camp/09.jpg', alt: '整活表演与 Ending 互动 · 五日集体大合影主题' },
    { src: 'img/rules/camp/10.jpg', alt: '每日主题报纸 · 五日款式' },
  ],
  source: {
    title: '冒险者营地主题团建小赛到底有谁在啊？！',
    url: 'https://xhslink.cn/o/8H3XaIFhWTv',
    noteId: '6ab25ced000000003303a7dc',
    author: 'RED LAND',
    publishedAt: '2026-09-22',
  },
}
