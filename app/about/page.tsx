import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { carriers } from "@/lib/carriers";

// 소개 페이지.
//
// SEO 진단에서 15개 페이지 전부 eeat-about-page / eeat-contact-page /
// eeat-privacy-policy 가 걸렸다. 보험은 YMYL(돈·건강) 분야라 구글이 신뢰도를
// 가장 깐깐하게 보는 영역이고, AI 도 인용할 출처를 고를 때 이걸 본다.
//
// 문의·개인정보처리방침은 원래 Footer 에 모달로 있었지만 크롤러에는 <button>
// 으로만 보여서 "없음"으로 잡혔다. 실제 URL 을 가진 페이지로 뺀다.

const TITLE = "청구닷컴 소개 — 누가 만들고 무엇을 담고 있나 | 청구닷컴";
const DESCRIPTION =
  `청구닷컴은 보험사 ${carriers.length}곳의 보험금 청구 필요서류, 청구서 PDF, 팩스번호, 고객센터를 한곳에 모은 링크 허브입니다. 프라임에셋 어메이징사업부가 기획·개발해 운영합니다.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    url: "/about",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="maxw px-5 py-8">
        <article className="prose-cg">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            청구닷컴 소개
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            프라임에셋 어메이징사업부가 만들어 운영하는 보험금 청구 정보 사이트
          </p>

          <h2>무엇을 하는 곳인가</h2>
          <p>
            보험금을 청구하려면 보험사마다 필요한 서류가 다르고, 청구서 양식도
            다르고, 접수 팩스번호와 고객센터 번호도 제각각입니다. 그 정보가
            보험사 홈페이지 여기저기에 흩어져 있어서 한 번 찾으려면 시간이 꽤
            걸립니다.
          </p>
          <p>
            청구닷컴은 그 정보를 보험사 {carriers.length}곳 분량으로 모아 한
            화면에 정리해 둔 곳입니다. 필요서류, 청구서 PDF, 보험금청구 팩스번호,
            고객센터 전화번호, 전산 접속 주소를 보험사별로 바로 확인할 수
            있습니다.
          </p>

          <h2>무엇을 하지 않는가</h2>
          <p>
            이 사이트는 특정 보험상품을 판매하거나 광고하지 않습니다. 보험료나
            보장금액을 안내하지 않고, 가입을 권유하지도 않습니다. 청구 절차와
            연락처를 정리해 두는 것이 전부입니다.
          </p>

          <h2>누가 만들었나</h2>
          <p>
            프라임에셋 어메이징사업부가 기획하고 개발했습니다. 현장에서 보험금
            청구를 돕다 보니 같은 정보를 반복해서 찾아야 했고, 그 과정을 줄이려고
            만든 것이 시작이었습니다.
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

          <h2>정보의 출처와 한계</h2>
          <ul>
            <li>
              보험사 연락처와 청구서 양식은 각 보험사가 공개한 자료를 정리한
              것입니다.
            </li>
            <li>
              병원 목록은 보건복지부·국민건강보험공단 등 공공기관이 공개한
              자료를 기준으로 합니다.
            </li>
            <li>
              전화번호와 양식은 보험사 사정에 따라 바뀔 수 있습니다. 중요한
              일이라면 해당 보험사에 한 번 더 확인해 주세요.
            </li>
          </ul>

          <h2>이 사이트의 정보는 참고 자료입니다</h2>
          <p>
            이 사이트가 제공하는 의료·보험 관련 설명은 제도와 용어를 이해하기
            위한 일반적인 참고 자료이며, 의학적 조언이나 보험 계약에 대한 안내를
            대신하지 않습니다. 개별 사안은 의료기관, 보험사, 또는 관련 기관에
            직접 확인하셔야 합니다.
          </p>

          <h2>연락처</h2>
          <p>
            문의는 <Link href="/contact">문의 페이지</Link>를 이용해 주세요.
            개인정보 처리에 관한 내용은{" "}
            <Link href="/privacy">개인정보처리방침</Link>에 정리해 두었습니다.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
