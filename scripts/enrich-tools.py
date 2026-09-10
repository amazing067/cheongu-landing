# -*- coding: utf-8 -*-
"""
tools/*.html 에 설명 본문 + FAQ + 구조화데이터(JSON-LD) 를 넣는다.

왜 필요한가 (2026-09-10 실측):
  · 이 페이지들은 표/검색기만 있고 글이 없어 SEO 진단에서 "본문 14단어"로 잡혔다.
  · AI 추출 신호 1/4, 시맨틱 요소 1개, 구조화데이터 0개.
  · Bing 에서 "종수술분류표", "상급종합병원 목록" 같은 일반 검색어에 하나도 안 잡힌다
    (브랜드명 "청구닷컴" 으로는 1위).
검색엔진과 AI 가 "이 페이지가 무엇에 답하는지" 읽을 근거를 만들어 주는 작업이다.

FAQPage 구조화데이터는 AI 가 질문-답변 쌍을 그대로 인용하기 좋은 형태라 특히 중요하다.

본문은 보험 상품·보험료·보장내용을 말하지 않는다. 제도와 용어의 사실 설명만 쓴다.

마커 사이만 갈아끼우므로 여러 번 돌려도 결과가 같다.
  python scripts/enrich-tools.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.xn--2e0br60d.com"
BEG = "<!-- ENRICH:BEGIN scripts/enrich-tools.py 가 생성. 직접 고치지 말 것 -->"
END = "<!-- ENRICH:END -->"

PAGES = {
    "tools/tertiary-hospitals.html": {
        "url": BASE + "/tools/tertiary-hospitals.html",
        "name": "전국 상급종합병원 목록",
        "heading": "상급종합병원이란",
        "intro": [
            "상급종합병원은 의료법에 따라 보건복지부가 지정하는 종합병원으로, "
            "중증질환에 대해 난이도가 높은 의료행위를 하는 의료기관이다. "
            "지정은 3년 단위로 이루어지며, 이 페이지의 목록은 보건복지부 지정 기준을 따른다.",
            "우리나라 의료전달체계는 단계로 나뉜다. "
            "의원급이 1차, 병원과 종합병원이 2차, 상급종합병원이 3차에 해당한다. "
            "상급종합병원에서 외래 진료를 받으려면 원칙적으로 "
            "다른 의료기관에서 발급한 요양급여의뢰서(진료의뢰서)가 필요하다.",
            "진단서나 입퇴원확인서에 적힌 의료기관이 어느 단계에 해당하는지 "
            "확인해야 하는 경우가 있다. 이 목록은 그 확인을 위한 참고 자료다.",
        ],
        "faq": [
            ("상급종합병원과 종합병원은 어떻게 다른가요?",
             "종합병원은 일정 규모 이상의 진료과목과 병상을 갖춘 의료기관이고, "
             "상급종합병원은 그 종합병원 중에서 중증질환 진료 실적 등 요건을 충족해 "
             "보건복지부가 별도로 지정한 곳이다. 모든 상급종합병원은 종합병원이지만 "
             "그 반대는 아니다."),
            ("상급종합병원은 전국에 몇 곳인가요?",
             "이 페이지 기준 47곳이다. 지정이 3년 단위로 갱신되므로 시기에 따라 달라질 수 있다."),
            ("3차 병원이 상급종합병원과 같은 말인가요?",
             "일상적으로는 같은 뜻으로 쓰인다. 3차 병원은 의료전달체계의 단계를 가리키는 "
             "표현이고, 상급종합병원이 제도상의 공식 명칭이다."),
            ("상급종합병원에 바로 갈 수 있나요?",
             "외래 진료는 원칙적으로 요양급여의뢰서가 있어야 한다. "
             "다만 응급환자 등 예외가 인정되는 경우가 있다."),
        ],
    },
    "tools/care-hospitals.html": {
        "url": BASE + "/tools/care-hospitals.html",
        "name": "간호간병통합서비스 운영 병원 목록",
        "heading": "간호간병통합서비스란",
        "intro": [
            "간호간병통합서비스는 보호자나 사설 간병인이 상주하지 않고 "
            "병원의 간호인력이 입원환자를 24시간 돌보는 입원서비스다. "
            "국민건강보험공단이 제도를 운영하며, "
            "참여 병원이 신청과 지정 절차를 거쳐 병동을 운영한다.",
            "모든 병원이 운영하는 것은 아니고, 같은 병원이라도 "
            "전체 병동이 아니라 일부 병동만 운영하는 경우가 많다. "
            "그래서 입원 전에 해당 병원에 병동 운영 여부와 빈 병상을 직접 확인해야 한다.",
            "이 페이지는 간호간병통합서비스 병동을 운영하는 병원을 "
            "지역과 종별로 찾아볼 수 있게 정리한 목록이다.",
        ],
        "faq": [
            ("간호간병통합서비스 병원은 어떻게 찾나요?",
             "이 페이지에서 지역과 병원 종별로 검색할 수 있다. "
             "다만 병동 운영 상황은 수시로 바뀌므로 입원 전 해당 병원에 직접 확인해야 한다."),
            ("간병인을 따로 부르지 않아도 되나요?",
             "간호간병통합서비스 병동은 간호인력이 간병을 포함해 돌보는 것을 전제로 한다. "
             "따라서 원칙적으로 보호자 상주나 사설 간병인이 필요하지 않다."),
            ("모든 병동에서 이용할 수 있나요?",
             "아니다. 병원이 지정받은 일부 병동에서만 운영하는 경우가 많고, "
             "환자의 상태에 따라 입원이 어려울 수도 있다."),
            ("입원비는 일반 병실과 다른가요?",
             "간호간병통합서비스 병동은 건강보험이 적용되는 입원료 체계를 따른다. "
             "구체적인 부담액은 병원과 병실 종류에 따라 다르므로 해당 병원에 확인해야 한다."),
        ],
    },
    "tools/op-surgery-codes.html": {
        "url": BASE + "/tools/op-surgery-codes.html",
        "name": "종수술 등급 · KCD · ICD-O 통합 검색",
        "heading": "종수술분류표와 질병분류코드",
        "intro": [
            "종수술분류표는 수술의 난이도와 범위에 따라 수술을 1종부터 5종까지 "
            "등급으로 나눈 분류 체계다. 숫자가 클수록 난이도가 높은 수술로 분류된다.",
            "KCD(한국표준질병사인분류)는 질병과 사망 원인을 분류하는 국가 표준 코드다. "
            "진단서에 적히는 질병분류기호가 이 KCD 코드다. "
            "ICD-O는 종양의 형태와 성질을 별도로 나타내는 분류로, "
            "암 관련 서류에서 M으로 시작하는 형태코드로 표기된다.",
            "이 페이지에서는 수술명으로 종수술 등급을, 질병명이나 코드로 "
            "KCD와 ICD-O 코드를 한 화면에서 찾아볼 수 있다.",
        ],
        "faq": [
            ("종수술분류표는 무엇인가요?",
             "수술의 난이도와 범위에 따라 수술을 1종에서 5종까지 등급으로 나눈 분류표다. "
             "숫자가 클수록 난이도가 높은 수술로 분류된다."),
            ("KCD 코드는 어디에서 확인하나요?",
             "진단서나 진료확인서에 적힌 질병분류기호가 KCD 코드다. "
             "이 페이지에서 질병명이나 코드로 검색해 확인할 수 있다."),
            ("ICD-O 코드는 KCD와 무엇이 다른가요?",
             "KCD는 질병 자체를 분류하고, ICD-O는 종양의 형태와 성질을 나타낸다. "
             "암 관련 서류에서는 두 코드가 함께 쓰이는 경우가 많다."),
            ("수술명으로 종 등급을 찾을 수 있나요?",
             "가능하다. 이 페이지 검색창에 수술명을 입력하면 해당 수술의 종 등급을 보여준다."),
        ],
    },
}

CSS = """<style>
  .cg-explain{max-width:1000px;margin:28px auto 0;padding:0 16px 28px;
    color:#1f2937;line-height:1.75;font-family:inherit}
  .cg-explain h2{font-size:20px;font-weight:800;margin:0 0 12px;color:#111827}
  .cg-explain h3{font-size:15px;font-weight:700;margin:18px 0 6px;color:#111827}
  .cg-explain p{margin:0 0 12px;font-size:15px}
  .cg-explain .cg-faq{margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb}
  .cg-explain .cg-note{margin-top:20px;font-size:13px;color:#6b7280}
  @media (max-width:640px){.cg-explain{padding:0 14px 24px}.cg-explain p{font-size:14px}}
</style>"""


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def build_section(cfg):
    ps = "\n".join("      <p>" + esc(p) + "</p>" for p in cfg["intro"])
    faq = "\n".join(
        "      <h3>" + esc(q) + "</h3>\n      <p>" + esc(a) + "</p>"
        for q, a in cfg["faq"])
    return (
        '<section class="cg-explain" aria-labelledby="cg-explain-h">\n'
        '      <h2 id="cg-explain-h">' + esc(cfg["heading"]) + "</h2>\n" + ps + "\n"
        '      <div class="cg-faq">\n'
        "        <h2>자주 묻는 질문</h2>\n" + faq + "\n"
        "      </div>\n"
        '      <p class="cg-note">이 페이지는 제도와 용어를 설명하기 위한 참고 자료다. '
        "개별 사안은 해당 기관이나 의료기관에 확인해야 한다.</p>\n"
        "    </section>")


def build_jsonld(cfg):
    graph = [
        {
            "@type": "FAQPage",
            "@id": cfg["url"] + "#faq",
            "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in cfg["faq"]
            ],
        },
        {
            "@type": "BreadcrumbList",
            "@id": cfg["url"] + "#breadcrumb",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "청구닷컴",
                 "item": BASE + "/"},
                {"@type": "ListItem", "position": 2, "name": cfg["name"],
                 "item": cfg["url"]},
            ],
        },
        {
            "@type": "WebPage",
            "@id": cfg["url"] + "#webpage",
            "url": cfg["url"],
            "name": cfg["name"],
            "inLanguage": "ko",
            "isPartOf": {"@id": BASE + "/#website"},
            "publisher": {"@id": BASE + "/#org"},
        },
    ]
    body = json.dumps({"@context": "https://schema.org", "@graph": graph},
                      ensure_ascii=False, indent=2)
    return '<script type="application/ld+json">\n' + body + "\n</script>"


def visible_text(html):
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def main():
    for rel, cfg in PAGES.items():
        path = os.path.join(ROOT, rel)
        html = open(path, encoding="utf-8").read()
        html = re.sub(re.escape(BEG) + r".*?" + re.escape(END), "", html, flags=re.S)
        before = len(visible_text(html))

        block = (BEG + "\n" + CSS + "\n" + build_jsonld(cfg) + "\n"
                 + build_section(cfg) + "\n  " + END + "\n")
        # </body> 직전에 넣는다 — 어느 페이지에나 있고 기존 레이아웃을 건드리지 않는다.
        i = html.rindex("</body>")
        html = html[:i] + "  " + block + html[i:]

        open(path, "w", encoding="utf-8", newline="\n").write(html)
        after = len(visible_text(html))
        print("%-32s FAQ %d개 · 본문 %d → %d자" % (rel, len(cfg["faq"]), before, after))


if __name__ == "__main__":
    main()
