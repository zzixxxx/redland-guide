# 从各 IP 官方笔记图里抠出单枚 PIN 缩略图 → public/img/pins/<id>.jpg（最长边 320px，质量 85）
# 裁切框坐标基于 public/img 下已压成 810px 宽的图（map 类除外）。新增 PIN 时在 CROPS 里加一行，跑：
#   python scripts/crop-pins.py            # 全部重裁
#   python scripts/crop-pins.py A24-1      # 只裁指定 id
# 抠完把 thumb 路径填进 src/data/pins.js。源图先用 scripts/refetch-clean.mjs 换成无水印版再裁。
# 第三个元素可选 opts：
#   fileId   PIN 在原图里太小时（如 C07 只有 ~125px），按 note.json 里的 fileId 拉 sns-img-qc 原始分辨率图再裁，
#            裁切框仍按 810 宽写，脚本按原图宽度等比换算
#   upscale  抠出来不足 MAX_SIDE 时放大到 MAX_SIDE 并轻微锐化（默认只缩不放，避免老图糊掉）
#   rotate   官方图里斜着摆的 PIN（NPC / 老玩家 / C16 / 三区占位软盘等）先把整张图绕裁切框中心逆时针转这么多度再裁，
#            让软盘转正；转正后同样的框里背景更少、PIN 更满。角度靠肉眼扫一遍定（正数=顺时针歪的图往回掰）
import sys, os, tempfile, urllib.request
from PIL import Image, ImageFilter

UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
def fetch_orig(file_id):
    cache = os.path.join(tempfile.gettempdir(), 'rl26-pins', file_id.replace('/', '_'))
    if not os.path.exists(cache):
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        req = urllib.request.Request(f'https://sns-img-qc.xhscdn.com/{file_id}', headers={'User-Agent': UA, 'Referer': 'https://www.xiaohongshu.com/'})
        with urllib.request.urlopen(req, timeout=60) as r, open(cache, 'wb') as f:
            f.write(r.read())
    return Image.open(cache).convert('RGB')

CROPS = {
    # id: (源图, (left, top, right, bottom))
    'A06': ('public/img/booths/A06/07.jpg', (555, 850, 665, 970), {'upscale': True}),
    'A09-1': ('public/img/booths/A09/01.jpg', (125, 730, 398, 1008)),
    # B09 两枚徽章在原图里只有 ~112px 且**互相叠压**（日场款右下角被夜场款盖住，两枚底边各被「日场款」/「夜场款」红标盖住）。
    # 9/22 第三次重抠：不再沿着「能看到的部分」切（那样软盘被削成长方形、夜场款还会带进日场款的灰条文字），
    # 改成按软盘本身的正方形轮廓取整枚（112×112），底部因此会带一点官方红标与邻枚的黄边 —— 形状完整优先（用户 9/22）
    'B09-1': ('public/img/booths/B09/05.jpg', (98, 393, 210, 505), {'fileId': 'spectrum/1040g34o3253i1j3m30b05obic3kgkjin8ofehvo', 'upscale': True}),
    'B09-2': ('public/img/booths/B09/05.jpg', (159, 461, 270, 571), {'fileId': 'spectrum/1040g34o3253i1j3m30b05obic3kgkjin8ofehvo', 'upscale': True}),
    'A09-2': ('public/img/booths/A09/01.jpg', (425, 730, 698, 1008)),
    'A24-1': ('public/img/booths/A24/02.jpg', (516, 608, 702, 792)),
    'A24-2': ('public/img/booths/A24/02.jpg', (516, 784, 702, 966)),
    'A34-1': ('public/img/booths/A34/01.jpg', (108, 635, 368, 895)),
    'A34-2': ('public/img/booths/A34/01.jpg', (432, 635, 698, 895)),
    # 剑网3 PIN 卡：9/11「发鸡蛋啦」图 02 里那张是**正的**（9/24 攻略图里的斜了约 8°，用户 9/24 指出），从 02 裁、用 fileId 拉原图
    'A38': ('public/img/booths/A38/02.jpg', (493, 732, 702, 941), {'fileId': 'spectrum/1040g0k0324v7dt4hj2005n32if540gvjnd2kklg', 'upscale': True}),
    # 命运扳机「存档碎片」PIN 套装（橙 = A 区），官方图里是单款内卡效果示意
    'A17c': ('public/img/booths/A17c/02.jpg', (152, 808, 349, 999), {'fileId': 'spectrum/1040g0k03254npqkik2105o798t908et3lr8shvg', 'upscale': True}),
    # 逆水寒 REDLAND PIN（黄 = B 区），图里只有 ~145px
    'B15': ('public/img/booths/B15/02.jpg', (450, 477, 595, 617), {'fileId': 'spectrum/1040g0k03254k0cq52u105o6g01o85eeu44mul50', 'upscale': True}),
    # 绝区零《绝区零》限定「存档碎片」（橙 = A 区），官方图里是卡套里的日场 / 夜场两款，单枚约 120px
    'A11-1': ('public/img/booths/A11/03.jpg', (236, 498, 352, 617), {'fileId': 'spectrum/1040g0k03258ndqeq44005o6j15no53lg8ntiqm0', 'upscale': True}),
    'A11-2': ('public/img/booths/A11/03.jpg', (466, 498, 582, 617), {'fileId': 'spectrum/1040g0k03258ndqeq44005o6j15no53lg8ntiqm0', 'upscale': True}),
    # 暴雪游戏 REDLAND 2026「存档碎片」（黄 = B 区），官方图里两枚叠着斜放，右边那枚左半被左边压住
    'B04b-1': ('public/img/booths/B04b/guide-04.jpg', (172, 1044, 442, 1308), {'fileId': 'spectrum/1040g34o3258linbd58b05ocjcikk1gas7cn0e78', 'rotate': -8}),
    'B04b-2': ('public/img/booths/B04b/guide-04.jpg', (436, 1038, 664, 1302), {'fileId': 'spectrum/1040g34o3258linbd58b05ocjcikk1gas7cn0e78', 'rotate': -5}),
    # 第五人格 REDLAND 存档碎片（黄 = B 区），入学指南图里只有 ~127px
    'B07': ('public/img/booths/B07/01.jpg', (477, 395, 604, 515), {'fileId': 'notes_pre_post/1040g3k83257fk4fekecg4bmt3euv0bijn2d33fg', 'upscale': True}),
    # ANIPLEX 孤独摇滚福袋里的「存档碎片」（橙 = A 区），图里只有 ~80px 且略微逆时针歪
    'A25-1': ('public/img/booths/A25/second-00.jpg', (519, 445, 599, 527), {'fileId': 'spectrum/1040g34o3258kiftm46105oijm22418dael158p8', 'upscale': True, 'rotate': -5}),
    'A25-2': ('public/img/booths/A25/second-00.jpg', (608, 547, 702, 624), {'fileId': 'spectrum/1040g34o3258kiftm46105oijm22418dael158p8', 'upscale': True, 'rotate': -5}),
    # 光·遇「存档碎片」（橙 = A 区），限定赠礼长图里只有 ~113px
    # 光与夜之恋《光与夜之恋》展台存档碎片（橙 = A 区；官方图里正面 / 背面并排，只裁左边正面那枚，303×303 够大不用放大）
    'A40': ('public/img/booths/A40/guide-16.jpg', (74, 347, 377, 650)),
    # 原神 体验互动徽章（软盘造型但**蓝色**，与 A 区橙色分色规则不同，见 pins.js 备注；图里只有 185px，拉原图放大）
    'A10': ('public/img/booths/A10/03.jpg', (306, 392, 491, 577), {'fileId': 'spectrum/1040g0k0325b21ei5kc105oo4n4pkg55cdovb0tg', 'upscale': True}),
    'A33': ('public/img/booths/A33/04.jpg', (134, 451, 247, 564), {'fileId': 'notes_pre_post/1040g3k8325b462eq4q7g5ndsvnjg8si4p8cea60', 'upscale': True}),
    # 归环「PIN 卡」= 奖品图右上角那张黄色 Q 版点赞卡片（106×85，卡片实物、非软盘造型）。9/23 用户指出：之前抠的两张黑金「唱盘」卡是透卡，抠错了
    'A17b': ('public/img/booths/A17b/04.jpg', (425, 422, 539, 515), {'fileId': 'spectrum/1040g0k0325b4gl4l4c005pmqd42ncdo3q6ir2gg', 'upscale': True}),
    # B03 Lovania「RED LAND 存档碎片」：官方只在「集章礼」格子里画了软盘造型的粉色图案（方形 + 中间浅色标签），没给成品实拍。
    # 图案在原图里**斜着摆**，按投影扫描定角 18°（逆时针转正后 92×93 的方形），转正后按同一个框裁（用户 9/22 要求这种也进图鉴）
    'B03-pin': ('public/img/booths/B03/guide-04.jpg', (608, 652, 746, 792), {'fileId': 'spectrum/1040g0k0325cm579uk41043d79goggb4aa40mh6g', 'upscale': True}),  # 9/21 攻略里的黄色实图（9/15 只有粉色剪影，那条框已作废）
    # 9/23 这批：无限暖暖（橙，178px 直接够）、明日方舟 / 终末地（黄，奖品图里只有 80–120px）、刺客信条两枚（蓝，并排各 ~80px）
    'A27': ('public/img/booths/A27/07.jpg', (308, 538, 494, 724), {'fileId': 'spectrum/1040g0k0325dsisbjk6hg5oq6aam65v73p15sido', 'upscale': True}),
    'B10': ('public/img/booths/B10/03.jpg', (494, 1478, 584, 1568), {'fileId': 'spectrum/1040g0k0325b1qso4kc005nsdhqcg85448fnd0k0', 'upscale': True}),
    'B11': ('public/img/booths/B11/03.jpg', (542, 1294, 673, 1424), {'fileId': 'spectrum/1040g0k0325dsd06p581g5p9hsuoaja0bogarnqo', 'upscale': True}),
    'C01-1': ('public/img/booths/C01/00.jpg', (583, 954, 671, 1043), {'fileId': 'spectrum/1040g0k0325dnfnbs58005qhq95m36204i0762k8', 'upscale': True}),
    'C01-2': ('public/img/booths/C01/00.jpg', (664, 946, 748, 1043), {'fileId': 'spectrum/1040g0k0325dnfnbs58005qhq95m36204i0762k8', 'upscale': True}),
    # 蛋仔派对 9/22 第二弹周边图鉴：存档碎片日 / 夜两款并排（810 基准各 ~80px，用 fileId 拉 1080 原图放大）
    'B01-1': ('public/img/booths/B01/guide-05.jpg', (146, 466, 231, 549), {'fileId': 'spectrum/1040g0k0325e1qh2o4a2g5n305p34lh64i4ba4eg', 'upscale': True}),
    'B01-2': ('public/img/booths/B01/guide-05.jpg', (240, 465, 325, 549), {'fileId': 'spectrum/1040g0k0325e1qh2o4a2g5n305p34lh64i4ba4eg', 'upscale': True}),
    # 超自然行动组 9/23 无料图：日 / 夜两枚橙软盘各 ~92px，用 fileId 拉原图放大
    'A12-1': ('public/img/booths/A12/02.jpg', (585, 436, 685, 535), {'fileId': 'notes_pre_post/1040g3k8325f2a7dml0105p5ttajl6pd0ovl1ll0', 'upscale': True}),
    'A12-2': ('public/img/booths/A12/02.jpg', (439, 705, 538, 804), {'fileId': 'notes_pre_post/1040g3k8325f2a7dml0105p5ttajl6pd0ovl1ll0', 'upscale': True}),
    # 粒粒的小人国 9/24「交房仪式」图里的「粒?」存档碎片（橙），~100px 用 fileId 拉原图放大
    'A39': ('public/img/booths/A39/guide-05.jpg', (174, 801, 268, 895), {'upscale': True}),  # 该图 fileId 的 sns-img-qc 返回非图片，9/24 起直接用 810 图放大
    # 啦嗒铛：ditto 专题页 02 图里左边那枚（两枚同款），810 宽图上量的，页面图没有 fileId
    'C13': ('public/img/booths/C13/hub-02.jpg', (169, 970, 410, 1194), {'upscale': True}),
    'C07': ('public/img/booths/C07/02.jpg', (187, 1017, 312, 1140), {'fileId': 'notes_pre_post/1040g3k0324vgbc37iu105plpn5u7ed8vkbbvego', 'upscale': True}),
    # 9/25 这批：P4R 两枚蓝软盘并排（810 图上各 ~266px，够大不用 fileId）、奇遇动物城橙软盘（~116px）、世界之外蓝软盘（原图 750 宽，~148px）
    'C05-1': ('public/img/booths/C05/guide-00.jpg', (112, 2298, 378, 2578), {'upscale': True}),
    'C05-2': ('public/img/booths/C05/guide-00.jpg', (432, 2298, 698, 2578), {'upscale': True}),
    'A37': ('public/img/booths/A37/06.jpg', (556, 752, 672, 868), {'fileId': 'spectrum/1040g0k0325gjfuijka305qjk78rks703t2fcag8', 'upscale': True}),
    'C09': ('public/img/booths/C09/08.jpg', (487, 782, 635, 920), {'fileId': 'notes_pre_post/1040g3k8325hifdaq4ee05oi6o5kod20po0l5th0', 'upscale': True}),
    # 阅文集团存档碎片（暗红软盘，五 IP Q 版）：诡秘之主 9/26 图 05（存为 guimi-03）左边那枚正面，810 图上 ~230px，用 fileId 拉原图
    # 9/27 这批：心动小镇（橙，04 右下两枚叠放取前面那枚）/ 遗忘之海（黄，03 互动周边格）/ PlayStation（橙，04 奖品图，略斜不转）
    'A05': ('public/img/booths/A05/04.jpg', (496, 918, 612, 1026), {'fileId': 'spectrum/1040g34o325iuuosf4a2g5o72jfro57l6900loto', 'upscale': True}),
    'B08': ('public/img/booths/B08/03.jpg', (365, 410, 455, 499), {'fileId': 'spectrum/1040g34o325gn1o4ik4b05oon0dd4g8ara8oticg', 'upscale': True}),
    'A13': ('public/img/booths/A13/04.jpg', (169, 517, 300, 638), {'fileId': 'spectrum/1040g34o325ghc5df4a5g5q2ssop2773g7ts3fv0', 'upscale': True}),
    'A30': ('public/img/booths/A30/guide-04.jpg', (516, 700, 660, 838), {'fileId': 'spectrum/1040g0k0325f1eat2k61g5p52ojnl7cnv0tgm78o', 'upscale': True}),
    'A35': ('public/img/booths/A35/guimi-03.jpg', (159, 403, 390, 623), {'fileId': 'spectrum/1040g34o325gknpeekc105p13ojukc96miismp2g', 'upscale': True}),
    'B02-1': ('public/img/booths/B02/04.jpg', (555, 335, 710, 480), {'upscale': True}),
    'B02-2': ('public/img/booths/B02/04.jpg', (555, 485, 710, 630), {'upscale': True}),
    'C16': ('public/img/booths/B02/card-03.jpg', (428, 600, 652, 842), {'fileId': 'spectrum/1040g0k0324vi29ubj2005pel9ok5qgj2bg30r70', 'upscale': True, 'rotate': 15}),
    # 夜间 PIN 在官方图里是斜 45° 摆的菱形，转正后框才收得紧
    'night': ('public/img/rules/pin/01.jpg', (144, 781, 221, 856), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True, 'rotate': 45}),
    'veteran': ('public/img/rules/pin-npc/01.jpg', (220, 375, 560, 685), {'rotate': -8}),
    'npc-1': ('public/img/rules/pin-npc/02.jpg', (150, 380, 440, 680), {'rotate': -15}),
    'npc-2': ('public/img/rules/pin-npc/02.jpg', (390, 375, 660, 695), {'rotate': 20}),
    'npc-3': ('public/img/rules/pin-npc/03.jpg', (115, 400, 415, 695), {'rotate': -16}),
    'npc-4': ('public/img/rules/pin-npc/03.jpg', (365, 380, 655, 695), {'rotate': 21}),
    'npc-5': ('public/img/rules/pin-npc/04.jpg', (195, 390, 475, 695), {'rotate': -16}),
    'npc-6': ('public/img/rules/pin-npc/04.jpg', (435, 380, 705, 695), {'rotate': 21}),
    'puzzle-A': ('public/img/rules/pin/01.jpg', (550, 195, 665, 340), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True}),
    'puzzle-B': ('public/img/rules/pin/01.jpg', (550, 390, 665, 525), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True}),
    'puzzle-C': ('public/img/rules/pin/01.jpg', (550, 560, 665, 700), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True}),
    'puzzle-all': ('public/img/rules/pin/02.jpg', (145, 280, 670, 730)),
    # 三区通用「?」软盘，给未公布展位占位
    'zone-A': ('public/img/rules/pin/01.jpg', (150, 227, 227, 306), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True}),
    'zone-B': ('public/img/rules/pin/01.jpg', (151, 411, 229, 495), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True}),
    'zone-C': ('public/img/rules/pin/01.jpg', (148, 583, 228, 659), {'fileId': 'notes_pre_post/1040g3k83248ou79sgma05q2ssop2773g385jvfg', 'upscale': True}),
}

MAX_SIDE = 320
ids = sys.argv[1:] or list(CROPS)
for k in ids:
    src, box, *rest = CROPS[k]
    opts = rest[0] if rest else {}
    if opts.get('fileId'):
        im = fetch_orig(opts['fileId'])
        r = im.size[0] / Image.open(src).size[0]  # 裁切框按本地图写（一般 810 宽，C09 原图只有 750），按宽度比换算到原图
        box = tuple(round(v * r) for v in box)
    else:
        im = Image.open(src).convert('RGB')
    if opts.get('rotate'):
        # 绕裁切框中心旋转整张图，框仍写在原图坐标系里，转完直接按同一个框裁
        cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
        im = im.rotate(opts['rotate'], resample=Image.BICUBIC, center=(cx, cy), fillcolor=(255, 255, 255))
    im = im.crop(box)
    w, h = im.size
    sc = MAX_SIDE / max(w, h)
    if sc < 1 or (sc > 1 and opts.get('upscale')):
        im = im.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
        if sc > 1:
            im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    im.save(f'public/img/pins/{k}.jpg', 'JPEG', quality=85, optimize=True)
    print(k, im.size)
