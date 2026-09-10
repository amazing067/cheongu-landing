import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 문의 페이지. 내용은 Footer 의 문의 모달과 같다 — 모달은 크롤러에 <button>
// 으로만 보여서 SEO 진단이 "연락 수단 1개(전화)뿐"으로 잡았다.
// 같은 내용을 실제 URL 로도 열어 둔다.

const TITLE = "문의하기 — 청구닷컴";
const DESCRIPTION =
  "청구닷컴에 대한 문의, 정보 오류 제보, 건의사항을 남기는 방법을 안내합니다. 카카오톡 채널로 바로 문의할 수 있습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    url: "/contact",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="maxw px-5 py-8">
        <article className="prose-cg">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            문의하기
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            궁금한 점이나 건의사항을 남겨주세요.
          </p>

          <h2>카카오톡 문의</h2>
          <p>
            가장 빠른 방법입니다. 카카오톡 채널로 바로 답변드립니다.
          </p>
          <p>
            <a
              href="https://pf.kakao.com/_mSxkxgn/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-bold no-underline hover:bg-[#FDD835]"
            >
              카카오톡으로 문의하기
            </a>
          </p>

          <h2>네이버 톡톡</h2>
          <p>
            <a
              href="https://talk.naver.com/profile/wj20ujg"
              target="_blank"
              rel="noopener noreferrer"
            >
              어메이징사업부 네이버 톡톡
            </a>
          </p>

          <h2>정보 오류 제보</h2>
          <p>
            보험사 전화번호나 팩스번호가 바뀌었거나, 청구서 양식이 최신이 아닌 것을
            발견하시면 알려주세요. 확인 후 바로 고치겠습니다. 어느 보험사의 어떤
            항목인지 함께 적어주시면 더 빠릅니다.
          </p>

          <h2>운영</h2>
          <p>
            청구닷컴은 프라임에셋 어메이징사업부가 기획·개발해 운영합니다.
            자세한 내용은 <Link href="/about">소개 페이지</Link>를 참고해 주세요.
          </p>
          <p>
            <a
              href="https://xn--h32b21du9cf7grcy2k20f.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              프라임에셋 어메이징사업부 홈페이지
            </a>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
