# -*- coding: utf-8 -*-
"""
tools/*.html 의 목록을 HTML 로 미리 그려 넣는다.

이 페이지들은 데이터가 <script> 안의 JS 배열에 있고 목록을 JS 가 그린다.
검색엔진과 AI 크롤러는 JS 를 실행하지 않으므로 실측 결과 본문이 50단어뿐이었다
(2026-09-10, GPTBot UA 로 확인). 읽을 내용이 없으니 일반 검색어에서 잡히지 않는다.

같은 내용을 HTML 에도 넣어 둔다. JS 는 로드되면 같은 자리를 다시 그리므로
사용자가 보는 화면은 완전히 같다 (점진적 향상). 마커 사이만 갈아끼우므로
데이터가 바뀌면 다시 돌리면 된다.

  python scripts/prerender-tools.py
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEG = "<!-- PRERENDER:BEGIN 크롤러용 정적 목록 — scripts/prerender-tools.py 가 생성. 직접 고치지 말 것 -->"
END = "<!-- PRERENDER:END -->"


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def js_array(html, name):
    """`const <name> = [ ... ];` 를 찾아 JSON 으로 읽는다."""
    m = re.search(r"const\s+%s\s*=\s*\[" % re.escape(name), html)
    if not m:
        raise SystemExit("배열을 못 찾음: %s" % name)
    i = html.index("[", m.start())
    depth, j = 0, i
    while j < len(html):
        if html[j] == "[":
            depth += 1
        elif html[j] == "]":
            depth -= 1
            if depth == 0:
                break
        j += 1
    body = html[i:j + 1]
    # 주석 제거 — 줄 맨 앞의 // 만. 그냥 // 를 지우면 "https://..." 의 슬래시까지
    # 잘라먹어 문자열이 깨진다.
    body = re.sub(r"(?m)^\s*//[^\n]*$", "", body)
    body = re.sub(r"(\{|,)\s*([A-Za-z_$][\w$]*)\s*:", r'\1"\2":', body)  # 키 인용
    body = re.sub(r",\s*([\]}])", r"\1", body)           # 트레일링 콤마
    return json.loads(body)


def visible_text(html):
    """크롤러가 읽는 본문만 남긴다 (script/style/태그 제거)."""
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def replace_block(html, container_id, inner):
    """id=<container_id> 인 요소의 안쪽을 마커 블록으로 교체한다."""
    m = re.search(r'(<div[^>]*id="%s"[^>]*>)(.*?)(</div>)' % re.escape(container_id),
                  html, re.S)
    if not m:
        raise SystemExit("컨테이너를 못 찾음: %s" % container_id)
    block = "\n%s\n%s\n%s\n      " % (BEG, inner, END)
    return html[:m.end(1)] + block + html[m.start(3):]


def tertiary(html):
    hs = js_array(html, "hospitals")
    out = []
    for h in hs:
        beds = ('\n            <div>🏥 병상수: %d개</div>' % h["beds"]) if h.get("beds") else ""
        home = ('\n            <a href="%s" target="_blank" rel="noopener" class="action-btn btn-web">🌐 홈페이지</a>'
                % esc(h["homepage"])) if h.get("homepage") else ""
        out.append(
            '        <div class="hospital-item">\n'
            '          <div class="hospital-name">%s</div>\n'
            '          <div class="hospital-info">\n'
            '            <div><span class="hospital-region">%s</span> <span>%s</span></div>\n'
            '            <div>📍 %s</div>\n'
            '            <div>📞 %s</div>%s\n'
            '          </div>\n'
            '          <div class="hospital-actions">\n'
            '            <a href="tel:%s" class="action-btn btn-call">📞 전화</a>%s\n'
            '          </div>\n'
            '        </div>'
            % (esc(h["name"]), esc(h["region"]), esc(h["city"]), esc(h["address"]),
               esc(h["tel"]), beds, re.sub(r"[^0-9]", "", h["tel"]), home))
    return replace_block(html, "hospitalList", "\n".join(out)), len(hs)


def care(html):
    """간호간병통합서비스 병원 788곳.

    이 페이지의 카드는 Tailwind 클래스가 잔뜩 붙어 있어 그대로 788번 찍으면
    +300KB 가 된다. 크롤러에 필요한 건 버튼이 아니라 이름·지역·주소·전화 텍스트뿐이라
    압축형으로 넣는다. JS 가 로드되면 어차피 같은 자리를 카드로 다시 그린다.
    """
    hs = js_array(html, "hospitalData")
    out = []
    for h in hs:
        bits = [b for b in (h.get("region"), h.get("type"), h.get("address")) if b]
        extra = []
        if h.get("ward_count"):
            extra.append("병동 %s개" % h["ward_count"])
        if h.get("bed_count"):
            extra.append("병상 %s개" % h["bed_count"])
        if h.get("phone"):
            extra.append("전화 %s" % h["phone"])
        out.append(
            '<div class="hospital-card"><h3>%s</h3><p>%s</p><p>%s</p></div>'
            % (esc(h.get("name", "")), esc(" · ".join(bits)), esc(" · ".join(extra))))
    return replace_block(html, "hospitalGrid", "\n".join(out)), len(hs)


JOBS = {
    "tools/tertiary-hospitals.html": tertiary,
    "tools/care-hospitals.html": care,
}


def main():
    for rel, fn in JOBS.items():
        p = os.path.join(ROOT, rel)
        html = open(p, encoding="utf-8").read()
        # 이전 실행 흔적 제거 후 새로 넣는다 (여러 번 돌려도 같은 결과)
        html = re.sub(re.escape(BEG) + r".*?" + re.escape(END), "", html, flags=re.S)
        before = len(visible_text(html))
        html, n = fn(html)
        after = len(visible_text(html))
        open(p, "w", encoding="utf-8", newline="\n").write(html)
        print("%s  항목 %d개  크롤러 본문 %d → %d자" % (rel, n, before, after))


if __name__ == "__main__":
    main()
