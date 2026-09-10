// 无固定展位、在场内自由游荡 / 由工作人员分发物料的 IP（用户 9/10 说明会有这类 IP）
// 数据来自该 IP 官方账号笔记；图片在 public/img/roaming/<id>/，同样附 note.json
// 字段：id / name（IP 名）/ chars（角色）/ xhs（官方账号）/ days（1–5，对应 10/2–10/6）/ dateText（官方原文日期）
//       where（领取方式 / 位置说明）/ items[{ name, how }]（无料清单）/ note / image / source
export const roaming = [
  {
    id: 'gongyongbingxiang',
    name: '公用冰箱里有什么',
    chars: '章鱼鼠鼠 & 小熊橙子',
    xhs: { uid: '5cce6553000000001103fece', name: '鼠记私房菜' },
    days: [3],
    dateText: '10月4日',
    where: '无固定展位：工作人员全日分发物料，请在场内寻找～',
    items: [
      { name: '章鱼鼠 PP 扇', how: '无条件领取' },
      { name: '双人小毛巾', how: '仅限读者领取' },
      { name: '熊橙行李牌', how: '须关注账号领取' },
      { name: '作者 To 签小签绘', how: '仅限读者领取' },
    ],
    note: '数量有限，先到先得',
    image: 'img/roaming/gongyongbingxiang/00.jpg',
    source: {
      title: '来Redland吃一大口章鱼鼠鼠&小熊橙子！',
      url: 'https://xhslink.cn/o/4zbBW47araf',
      noteId: '6a9e88900000000028028357',
      author: '鼠记私房菜',
      publishedAt: '2026-09-07',
    },
  },
]
