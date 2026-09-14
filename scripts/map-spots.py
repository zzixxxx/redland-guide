# 从官方场馆平面图里识别各展位方框，输出 src/data/mapSpots.js 用的归一化热区坐标。
#   python scripts/map-spots.py A            # 只跑 A 区，打印候选框 + 生成核对图
#   python scripts/map-spots.py A --emit     # 按下面 LABELS 的对应关系打印 mapSpots 片段
#   python scripts/map-spots.py --walk       # 重新生成 walkGrid.rows（导航寻路用的可走网格）
#
# 原理：官方图的展位方框都有一圈深色描边，方框内部因此是「非描边」掩膜里的一个独立连通域。
#       对 ~border 取连通域再按尺寸筛，就能一次拿到整区所有展位框。
#       阈值 (r-b>80, g<185, r<250) + 5×5 闭运算是 A 区调出来的：更严的阈值会漏掉左侧那几列
#       （描边有缺口，内部和外面连通了），闭运算负责把缺口补上。B / C 区配色不同，需要各自调。
#
# 识别出来的框只有位置没有编号，要人工看一眼 out/cand_<区>.png（框上画了序号）把序号→展位号
# 填进 LABELS。深色底的横幅式展位（A-19 黑神话）内部会被当成描边，识别不到，写在 MANUAL 里。
import sys, json, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

OUT = 'scripts/_map_spots_out'
FULL_W, FULL_H = 14412, 5854          # 官方原图尺寸
REF_W = 1500.0                         # note.json 里裁切框所用的概览图宽度
REF_H = FULL_H * REF_W / FULL_W

# 各区：源图 / 源图在概览图上的裁切框 / 描边阈值
ZONES = {
    'A': dict(src='public/img/rules/map-2026/01.jpg', crop=(645, 262, 1185, 590),
              rule=lambda r, g, b: (r - b > 80) & (g < 185) & (r < 250), close=5),
    'B': dict(src='public/img/rules/map-2026/02.jpg', crop=(630, 42, 1015, 272),
              rule=lambda r, g, b: (r - b > 80) & (g < 185) & (r < 250), close=5),
    'C': dict(src='public/img/rules/map-2026/03.jpg', crop=(390, 258, 705, 530),
              rule=lambda r, g, b: (r - b > 80) & (g < 185) & (r < 250), close=5),
}

# 序号 → 展位号（看 out/cand_<区>.png 填）。没列出的序号是外框 / 服务设施，忽略
LABELS = {
    'A': {0: 'A40', 1: 'A35', 2: 'A33', 3: 'A31', 4: 'A28', 5: 'A27',
          6: 'A39', 7: 'A38', 8: 'A37', 9: 'A36', 10: 'A34', 11: 'A32', 12: 'A30', 13: 'A29', 14: 'A26',
          16: 'A25', 17: 'A24', 18: 'A23', 19: 'A22', 20: 'A21', 21: 'A20',
          22: 'A02', 23: 'A18', 24: 'A17',
          25: 'A04', 26: 'A06', 27: 'A09', 28: 'A10', 29: 'A11', 30: 'A16',
          31: 'A01', 32: 'A03', 33: 'A05', 34: 'A07', 35: 'A08', 36: 'A12',
          39: 'A13', 40: 'A15', 42: 'A14'},
}

# 识别不到的（深色横幅底、内部被当成描边），按源图坐标手填
MANUAL = {
    'A': {'A19': (205, 955, 610, 1015)},
}


def detect(zone):
    z = ZONES[zone]
    im = Image.open(z['src']).convert('RGB')
    a = np.asarray(im).astype(int)
    border = z['rule'](a[..., 0], a[..., 1], a[..., 2])
    border = ndimage.binary_closing(border, np.ones((z['close'], z['close'])))
    lab, _ = ndimage.label(~border)
    cands = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        if sl is None:
            continue
        y0, y1 = sl[0].start, sl[0].stop
        x0, x1 = sl[1].start, sl[1].stop
        w, h = x1 - x0, y1 - y0
        if w < 45 or h < 28 or w > 1300 or h > 1000:
            continue
        if (lab[sl] == i + 1).sum() < 2500:
            continue
        cands.append([x0, y0, x1, y1])
    cands.sort(key=lambda c: (c[0] // 90, c[1]))   # 按列再按行，方便对着图读序号
    return im, cands


# 灯箱里用的是 P2 切片（整图 x 0.2205–0.7815、全高），热区坐标要归一化到 P2 而不是整图
P2_X0, P2_X1 = 0.2205, 0.7815


def to_norm(zone, box):
    """源图像素 → P2 切片的归一化 [x, y, w, h]"""
    z = ZONES[zone]
    cl, ct, cr, cb = z['crop']
    im_w, im_h = Image.open(z['src']).size
    sx, sy = (cr - cl) / im_w, (cb - ct) / im_h
    x0, y0, x1, y1 = box
    fx0, fx1 = (cl + x0 * sx) / REF_W, (cl + x1 * sx) / REF_W          # 先到整图
    ny0, ny1 = (ct + y0 * sy) / REF_H, (ct + y1 * sy) / REF_H          # P2 是全高，y 不变
    span = P2_X1 - P2_X0
    return [round((fx0 - P2_X0) / span, 4), round(ny0, 4), round((fx1 - fx0) / span, 4), round(ny1 - ny0, 4)]


def emit_walk():
    """可走区域网格：按格取平均色判掉海水 / 草地 / 外框，闭运算补掉招牌造成的小洞，
    只保留最大连通域（起点与全部展位都在里面）。展位框不挖 —— 挖了会切断窄过道导致寻路无解，
    改在 src/utils/route.js 里给展位格加通行代价。输出直接贴进 mapSpots.js 的 walkGrid.rows。"""
    from scipy import ndimage as ndi
    GW, GH = 180, 130
    im = Image.open('public/img/rules/map-2026/p2.jpg').convert('RGB')
    a = np.asarray(im.resize((GW, GH), Image.BOX)).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    walk = ~(((g > r + 12) & (g > b + 12)) | ((b - r > 45) & (b > 140) & (r < 160)) | ((r + g + b) < 210))
    walk = ndi.binary_closing(walk, np.ones((3, 3)))
    lab, n = ndi.label(walk)
    sizes = ndi.sum(walk, lab, range(1, n + 1))
    walk = lab == (int(np.argmax(sizes)) + 1)
    for row in walk:
        print("    '%s'," % ''.join('1' if v else '0' for v in row))
    print('# walkable %.1f%%' % (walk.mean() * 100))


if '--walk' in sys.argv:
    emit_walk()
    sys.exit(0)

zone = (sys.argv[1] if len(sys.argv) > 1 else 'A').upper()
im, cands = detect(zone)
os.makedirs(OUT, exist_ok=True)
vis = im.copy()
d = ImageDraw.Draw(vis)
for j, (x0, y0, x1, y1) in enumerate(cands):
    d.rectangle([x0, y0, x1, y1], outline=(255, 0, 255), width=4)
    d.rectangle([x0, y0, x0 + 34, y0 + 22], fill=(255, 0, 255))
    d.text((x0 + 6, y0 + 5), str(j), fill=(255, 255, 255))
vis.save(f'{OUT}/cand_{zone}.png')
print(f'{zone} 区候选 {len(cands)} 个 → {OUT}/cand_{zone}.png')

if '--emit' in sys.argv:
    spots = {}
    for j, no in LABELS.get(zone, {}).items():
        spots[no] = to_norm(zone, cands[j])
    for no, box in MANUAL.get(zone, {}).items():
        spots[no] = to_norm(zone, box)
    for no in sorted(spots):
        print(f"  {no}: {json.dumps(spots[no])},")
    # 回验图：把归一化坐标画回整图缩略图
    full = Image.open('public/img/rules/map-2026/00.jpg').convert('RGB')
    W, H = full.size
    dd = ImageDraw.Draw(full)
    for no, (x, y, w, h) in spots.items():
        dd.rectangle([x * W, y * H, (x + w) * W, (y + h) * H], outline=(255, 0, 255), width=3)
        dd.text((x * W + 3, y * H + 2), no, fill=(0, 0, 255))
    full.save(f'{OUT}/verify_{zone}.png')
    print(f'共 {len(spots)} 个热区，回验图 {OUT}/verify_{zone}.png')
else:
    for j, (x0, y0, x1, y1) in enumerate(cands):
        print(j, [x0, y0, x1, y1], 'w', x1 - x0, 'h', y1 - y0)
