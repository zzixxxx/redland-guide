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
    # B09 两枚徽章在图里只有 ~110px：日场款右下角被夜场款压住、底边被「日场款」红标压住，只取到红标上沿；
    # 夜场款左半边被日场款压住，左边会带一点日场款的边，底边贴着「夜场款」红标上沿（9/20 重抠，原框把两枚都切残了）
    'B09-1': ('public/img/booths/B09/05.jpg', (98, 389, 208, 492), {'fileId': 'spectrum/1040g34o3253i1j3m30b05obic3kgkjin8ofehvo', 'upscale': True}),
    'B09-2': ('public/img/booths/B09/05.jpg', (186, 457, 283, 561), {'fileId': 'spectrum/1040g34o3253i1j3m30b05obic3kgkjin8ofehvo', 'upscale': True}),
    'A09-2': ('public/img/booths/A09/01.jpg', (425, 730, 698, 1008)),
    'A24-1': ('public/img/booths/A24/02.jpg', (516, 608, 702, 792)),
    'A24-2': ('public/img/booths/A24/02.jpg', (516, 784, 702, 966)),
    'A34-1': ('public/img/booths/A34/01.jpg', (108, 635, 368, 895)),
    'A34-2': ('public/img/booths/A34/01.jpg', (432, 635, 698, 895)),
    'A38': ('public/img/booths/A38/02.jpg', (482, 729, 718, 948)),
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
    'C07': ('public/img/booths/C07/02.jpg', (187, 1017, 312, 1140), {'fileId': 'notes_pre_post/1040g3k0324vgbc37iu105plpn5u7ed8vkbbvego', 'upscale': True}),
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
        r = im.size[0] / 810  # 裁切框按 810 宽写，换算到原图
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
