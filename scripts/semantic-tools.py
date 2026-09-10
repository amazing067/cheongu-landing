# -*- coding: utf-8 -*-
"""
tools/*.html 의 시맨틱·접근성·소셜 태그를 보완한다.

SEO 진단(2026-09-10)에서 이 페이지들이 걸린 항목:
  · geo-semantic-html      main/article/header/footer 가 없어 "AI 가 파싱하기 어렵다"
  · geo-content-structure  main 영역이 없어 추출 신호 2/4
  · a11y-landmark-regions  main 랜드마크 없음
  · a11y-form-labels       검색 입력창에 라벨 없음 (placeholder 는 라벨이 아니다)
  · social-twitter-card    twitter:card 없음
  · geo-llms-txt           llms.txt 참조 없음

본문 내용은 건드리지 않는다. 감싸는 태그와 head 의 메타만 손댄다.
여러 번 돌려도 결과가 같다 (이미 있으면 건너뛴다).

  python scripts/semantic-tools.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TARGETS = [
    "tools/tertiary-hospitals.html",
    "tools/care-hospitals.html",
    "tools/op-surgery-codes.html",
    "tools/history.html",
]

HEAD_ADD = """  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <link rel="llms" href="/llms.txt" type="text/plain">
"""


def add_head_tags(html):
    """head 에 트위터 카드 / og 이미지 크기 / llms 링크를 넣는다."""
    added = []
    lines = []
    for line in HEAD_ADD.splitlines(True):
        key = re.search(r'(?:name|property|rel)="([^"]+)"', line)
        if key and key.group(1) in html:
            continue
        lines.append(line)
        added.append(key.group(1) if key else "?")
    if not lines:
        return html, []
    i = html.index("</head>")
    return html[:i] + "".join(lines) + html[i:], added


def wrap_main(html):
    """body 안을 <main> 으로 감싼다.

    이미 main 이 있으면 두지 않는다. nav 는 랜드마크로 body 직속에 남겨야 해서
    main 밖에 두고, 그 뒤부터 </body> 앞까지를 감싼다.
    """
    if re.search(r"<main[\s>]", html):
        return html, False

    mb = re.search(r"<body[^>]*>", html)
    if not mb:
        return html, False
    start = mb.end()
    end = html.rindex("</body>")

    inner = html[start:end]
    # 마지막 nav(있으면) 뒤부터 감싼다 — nav 는 main 밖의 랜드마크여야 한다.
    navs = list(re.finditer(r"</nav>", inner))
    off = navs[-1].end() if navs else 0

    wrapped = (inner[:off]
               + '\n  <main id="main">'
               + inner[off:]
               + "\n  </main>\n")
    return html[:start] + wrapped + html[end:], True


def label_inputs(html):
    """검색 입력창에 aria-label 을 붙인다 (placeholder 는 라벨이 아니다)."""
    n = 0

    def fix(m):
        nonlocal n
        tag = m.group(0)
        if "aria-label" in tag:
            return tag
        ph = re.search(r'placeholder="([^"]*)"', tag)
        if not ph:
            return tag
        # placeholder 의 이모지·기호를 뺀 문구를 라벨로 쓴다
        label = re.sub(r"[^\w가-힣 ,·]", "", ph.group(1)).strip() or "검색"
        n += 1
        return tag[:-1] + ' aria-label="%s">' % label

    html = re.sub(r"<input\b[^>]*>", fix, html)
    return html, n


def main():
    for rel in TARGETS:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print("건너뜀 (없음):", rel)
            continue
        html = open(path, encoding="utf-8").read()

        html, added = add_head_tags(html)
        html, wrapped = wrap_main(html)
        html, labelled = label_inputs(html)

        open(path, "w", encoding="utf-8", newline="\n").write(html)
        print("%-32s head +%d · main %s · 입력창라벨 %d"
              % (rel, len(added), "추가" if wrapped else "이미있음", labelled))


if __name__ == "__main__":
    main()
