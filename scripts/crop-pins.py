# 从各 IP 官方笔记图里抠出单枚 PIN 缩略图 → public/img/pins/<id>.jpg（最长边 320px，质量 85）
# 裁切框坐标基于 public/img 下已压成 810px 宽的图（map 类除外）。新增 PIN 时在 CROPS 里加一行，跑：
#   python scripts/crop-pins.py            # 全部重裁
#   python scripts/crop-pins.py A24-1      # 只裁指定 id
# 抠完把 thumb 路径填进 src/data/pins.js。源图先用 scripts/refetch-clean.mjs 换成无水印版再裁。
# 第三个元素可选 opts：
#   fileId   PIN 在原图里太小时（如 C07 只有 ~125px），按 note.json 里的 fileId 拉 sns-img-qc 原始分辨率图再裁，
#            裁切框仍按 810 宽写，脚本按原图宽度等比换算
#   upscale  抠出来不足 MAX_SIDE 时放大到 MAX_SIDE 并轻微锐化（默认只缩不放，避免老图糊掉）
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
    'A06': ('public/img/booths/A06/07.jpg', (555, 850, 665, 970)),
    'A09-1': ('public/img/booths/A09/01.jpg', (125, 730, 398, 1008)),
    'A09-2': ('public/img/booths/A09/01.jpg', (425, 730, 698, 1008)),
    'A24-1': ('public/img/booths/A24/02.jpg', (516, 608, 702, 792)),
    'A24-2': ('public/img/booths/A24/02.jpg', (516, 784, 702, 966)),
    'A34-1': ('public/img/booths/A34/01.jpg', (108, 635, 368, 895)),
    'A34-2': ('public/img/booths/A34/01.jpg', (432, 635, 698, 895)),
    'A38': ('public/img/booths/A38/02.jpg', (482, 729, 718, 948)),
    'C07': ('public/img/booths/C07/02.jpg', (187, 1017, 312, 1140), {'fileId': 'notes_pre_post/1040g3k0324vgbc37iu105plpn5u7ed8vkbbvego', 'upscale': True}),
    'B02-1': ('public/img/booths/B02/04.jpg', (555, 335, 710, 480)),
    'B02-2': ('public/img/booths/B02/04.jpg', (555, 485, 710, 630)),
    'night': ('public/img/rules/pin/01.jpg', (148, 755, 232, 861)),
    'veteran': ('public/img/rules/pin-npc/01.jpg', (220, 375, 560, 685)),
    'npc-1': ('public/img/rules/pin-npc/02.jpg', (150, 380, 440, 680)),
    'npc-2': ('public/img/rules/pin-npc/02.jpg', (390, 375, 660, 695)),
    'npc-3': ('public/img/rules/pin-npc/03.jpg', (115, 400, 415, 695)),
    'npc-4': ('public/img/rules/pin-npc/03.jpg', (365, 380, 655, 695)),
    'npc-5': ('public/img/rules/pin-npc/04.jpg', (195, 390, 475, 695)),
    'npc-6': ('public/img/rules/pin-npc/04.jpg', (435, 380, 705, 695)),
    'puzzle-A': ('public/img/rules/pin/01.jpg', (550, 195, 665, 340)),
    'puzzle-B': ('public/img/rules/pin/01.jpg', (550, 390, 665, 525)),
    'puzzle-C': ('public/img/rules/pin/01.jpg', (550, 560, 665, 700)),
    'puzzle-all': ('public/img/rules/pin/02.jpg', (145, 280, 670, 730)),
    # 三区通用「?」软盘，给未公布展位占位
    'zone-A': ('public/img/rules/pin/01.jpg', (150, 227, 227, 306)),
    'zone-B': ('public/img/rules/pin/01.jpg', (151, 411, 229, 495)),
    'zone-C': ('public/img/rules/pin/01.jpg', (148, 583, 228, 659)),
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
    im = im.crop(box)
    w, h = im.size
    sc = MAX_SIDE / max(w, h)
    if sc < 1 or (sc > 1 and opts.get('upscale')):
        im = im.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
        if sc > 1:
            im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    im.save(f'public/img/pins/{k}.jpg', 'JPEG', quality=85, optimize=True)
    print(k, im.size)
