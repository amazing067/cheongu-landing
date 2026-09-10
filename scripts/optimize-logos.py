# -*- coding: utf-8 -*-
"""
보험사 로고 / 브랜드 마크를 화면 표시 크기에 맞게 줄인다.

Vercel Fast Data Transfer 가 43GB/100GB 까지 찬 원인이 여기였다 (2026-09-10).
원본이 5000x683 인데 화면에는 최대 384px 로 그려진다 — 34배를 그냥 버리고 있었다.

상한은 "가장 크게 쓰는 곳 x3(레티나 여유)" 로 잡는다.
  · 로고: MailingAddressModal 이 max-w 384px / max-h 176px  -> 1152 x 528
  · 브랜드 마크: Footer 가 height 40px, Header 가 26px      -> 160 / 104

원본은 _원본_로고/ 에 남긴다 (prepare-public.js 가 복사하지 않는 폴더라 배포에는 안 실린다).
이미 상한 이하인 파일은 건드리지 않으므로 몇 번 돌려도 안전하다.
"""
import io, os, shutil, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP = os.path.join(ROOT, "_원본_로고")

TARGETS = [
    ("assets/logos", None, 1152, 528),
    ("icons", "amazinglogo-trim.png", 10000, 160),
    ("icons", "amazing-mark.png", 10000, 104),
]


def shrink(path, maxw, maxh):
    im = Image.open(path)
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    w, h = im.size
    r = min(maxw / w, maxh / h, 1.0)
    if r >= 1.0:
        return None                      # 이미 충분히 작다
    out = im.resize((max(1, round(w * r)), max(1, round(h * r))), Image.LANCZOS)
    buf = io.BytesIO()
    out.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def main():
    before = after = 0
    changed = 0
    for rel, only, maxw, maxh in TARGETS:
        src_dir = os.path.join(ROOT, rel)
        if not os.path.isdir(src_dir):
            continue
        names = [only] if only else sorted(os.listdir(src_dir))
        for name in names:
            if not name.lower().endswith(".png"):
                continue
            path = os.path.join(src_dir, name)
            if not os.path.isfile(path):
                continue
            old = os.path.getsize(path)
            data = shrink(path, maxw, maxh)
            if data is None or len(data) >= old:
                continue
            bdir = os.path.join(BACKUP, rel)
            os.makedirs(bdir, exist_ok=True)
            bpath = os.path.join(bdir, name)
            if not os.path.exists(bpath):        # 첫 실행 때만 원본 보관
                shutil.copy2(path, bpath)
            with open(path, "wb") as f:
                f.write(data)
            before += old
            after += len(data)
            changed += 1
            print(f"  {rel}/{name}  {old/1024:.0f}KB -> {len(data)/1024:.0f}KB")

    if changed:
        print(f"\n{changed}장  {before/1048576:.2f}MB -> {after/1048576:.2f}MB "
              f"({after/before*100:.1f}%, {(before-after)/1048576:.2f}MB 절약)")
    else:
        print("줄일 파일 없음 (이미 최적화됨)")


if __name__ == "__main__":
    main()
