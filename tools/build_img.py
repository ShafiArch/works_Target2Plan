"""Web copies for the Target2Plan page: python3 tools/build_img.py   (Pillow, numpy)

source/figures/   paper figures exported from the Paper Figure Studio (PNG, 4x)
source/gallery/   the GIFs of the Target2Plan README gallery (from ShafiArch/Target2Plan,
                  media/gallery) and a high resolution still of the plan mosaic

Everything is written to img/. Pictures made on white become transparent: white turns
clear, greys and lines turn into ink, colours stay. Each picture comes twice, name.webp
with dark ink (Trace, Clay) and name-n.webp with light ink (Night); -l is the large copy
opened on click. The GIFs become animated WebP with the same timing.
"""
import glob, os
import numpy as np
from PIL import Image, ImageSequence

OUT = "img"; os.makedirs(OUT, exist_ok=True)
INK, INK_N = np.array([17, 17, 17.]), np.array([241, 239, 234.])


def paper(im, ink):
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    rgb, a0 = a[..., :3], a[..., 3:] / 255
    sat = rgb.max(2, keepdims=True) - rgb.min(2, keepdims=True)
    w = np.clip((sat - 5) / 8, 0, 1)
    an = np.clip((255 - rgb.mean(2, keepdims=True)) / (255 - 17), 0, 1)
    alpha = w + (1 - w) * an
    col = (w * rgb + (1 - w) * an * ink) / np.maximum(alpha, 1e-6)
    out = np.concatenate([np.clip(col, 0, 255), np.clip(alpha * a0 * 255, 0, 255)], 2)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def fit(im, w):
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def still(src, name, s=1000, l=2400):
    im = Image.open(src).convert("RGBA")
    for tag, ink in (("", INK), ("-n", INK_N)):
        p = paper(im, ink)
        fit(p, s).save(f"{OUT}/{name}{tag}.webp", "WEBP", quality=84, method=6)
        if l: fit(p, l).save(f"{OUT}/{name}{tag}-l.webp", "WEBP", quality=84, method=6)


def animation(src, name, w=None, step=1, q=80):
    g = Image.open(src)
    frames, durs = [], []
    for i, f in enumerate(ImageSequence.Iterator(g)):
        d = f.info.get("duration", 50)
        if i % step == 0 or d > 500:      # keep held frames (first, last) as they are
            frames.append(f.convert("RGBA")); durs.append(d)
        else:
            durs[-1] += d
    for tag, ink in (("", INK), ("-n", INK_N)):
        fr = [fit(paper(f, ink), w) if w else paper(f, ink) for f in frames]
        fr[0].save(f"{OUT}/{name}{tag}.webp", "WEBP", save_all=True, append_images=fr[1:], duration=durs, loop=0, quality=q, method=4, alpha_quality=100, use_sharp_yuv=True)
    print(name, len(frames), "frames", os.path.getsize(f"{OUT}/{name}.webp") // 1024, "KB")


import sys
ONLY = sys.argv[1:]          # optional: names of the outputs to rebuild
for f in sorted(glob.glob("source/figures/*.png")) if not ONLY else []:
    still(f, "fig-" + os.path.basename(f)[:-4].replace("_", "-"))
for n in ("1-bedroom", "2-bedroom", "3-bedroom", "4-bedroom") if not ONLY else []:
    animation(f"source/gallery/{n}_plan.gif", f"{n}-plan", w=480)
    animation(f"source/gallery/{n}_graph.gif", f"{n}-graph", w=480)
if not ONLY or "plans-strip" in ONLY: animation("source/gallery/plans.gif", "plans-strip", step=2, q=80)
# the mosaic is shown as a still: as an animated WebP with transparency it is over 4 MB
if not ONLY: still("source/gallery/plans-grid-hires.png", "plans-grid-still", s=1600, l=4000)
print("done", len(os.listdir(OUT)))
