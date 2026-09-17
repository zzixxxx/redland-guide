"""把专属花车效果图（public/img/parade/<id>/00.jpg）里的花车抠成透明底 cut.png，放在花车页 IP 名下方。

用法：
  python scripts/cut-floats.py                # 全部 themeFloats 的 id
  python scripts/cut-floats.py mihoyo yuewen  # 只重抠这几台
  python scripts/cut-floats.py --sheet        # 另存一张棋盘底预览到 %TEMP%/floats_cuts.png 方便肉眼核对

做法（2026-09-17）：官方效果图是统一模板——花车居中，四周是像素沙滩 / 海水 / 贝壳装饰、上方引言、下方红字标题。
1. 先裁掉上下的文字区（只留 16%–80% 高度）；
2. 用 rembg 的 isnet-general-use 模型抠前景。u2net 对阅文（书上立着的展板）和米哈游（车站顶棚）这类细碎结构会丢掉一大块，
   isnet 能保住，所以统一用 isnet；不做 post_process_mask（会把细杆抹掉）；
3. 只保留 alpha 掩膜里最大的连通块，以及面积 ≥ 最大块 3% 的其他块——裁切区边缘的贝壳 / 沙滩碎片会被 isnet 一起留下
   （用户 9/17 指出阅文、米哈游左侧各有一小块没抠干净），按面积过滞掉；花车自身的分离部件（旗杆、气球）都远大于 3%；
4. 按 alpha 包围盒裁边、缩到最长边 360px。
"""
import os
import sys

import numpy as np
from PIL import Image
from rembg import remove, new_session
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'img', 'parade')
ALL = ['eggy', 'nishuihan', 'xindong', 'yimo', 'naraka', 'valorant', 'yuewen', 'mihoyo']
CROP = (0.03, 0.16, 0.97, 0.80)  # x0, y0, x1, y1（相对宽高）
MAX = 360
KEEP_RATIO = 0.03


def drop_fragments(rgba):
    """只留主体连通块（及面积 ≥ 主体 3% 的块），其余 alpha 清零"""
    a = np.array(rgba)
    mask = a[:, :, 3] > 8
    lab, n = ndimage.label(mask)
    if n <= 1:
        return rgba
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    keep = {i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * KEEP_RATIO}
    drop = ~np.isin(lab, list(keep))
    a[drop, 3] = 0
    return Image.fromarray(a, 'RGBA')


def cut(fid, sess):
    src = os.path.join(ROOT, fid, '00.jpg')
    im = Image.open(src).convert('RGB')
    w, h = im.size
    crop = im.crop((int(w * CROP[0]), int(h * CROP[1]), int(w * CROP[2]), int(h * CROP[3])))
    out = remove(crop, session=sess, post_process_mask=False)
    out = drop_fragments(out)
    out = out.crop(out.getbbox())
    out.thumbnail((MAX, MAX))
    dst = os.path.join(ROOT, fid, 'cut.png')
    out.save(dst, 'PNG', optimize=True)
    print(fid, out.size, os.path.getsize(dst) // 1024, 'KB')
    return out


def board(t, size=240):
    t = t.copy()
    t.thumbnail((size, size))
    bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(0, size, 20):
        for x in range(0, size, 20):
            bg.paste((200, 200, 200, 255) if (x // 20 + y // 20) % 2 else (120, 120, 120, 255), (x, y, x + 20, y + 20))
    bg.alpha_composite(t, ((size - t.width) // 2, (size - t.height) // 2))
    return bg


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ids = args or ALL
    sess = new_session('isnet-general-use')
    tiles = [cut(i, sess) for i in ids]
    if '--sheet' in sys.argv:
        sheet = Image.new('RGBA', (250 * len(tiles), 240), (30, 30, 30, 255))
        for k, t in enumerate(tiles):
            sheet.paste(board(t), (k * 250, 0))
        dst = os.path.join(os.environ.get('TEMP', '.'), 'floats_cuts.png')
        sheet.save(dst)
        print('sheet ->', dst)
