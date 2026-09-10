import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

// 소개·문의·개인정보처리방침은 원래 이 컴포넌트 안에 모달로 들어 있었다.
// 모달은 크롤러에 <button> 으로만 보여서 SEO 진단이 15개 페이지 전부에서
// "about/contact/privacy 없음"으로 잡았다. 보험은 YMYL(돈·건강) 분야라
// 구글이 신뢰도를 가장 깐깐하게 보고, AI 도 인용할 출처를 고를 때 이걸 본다.
//
// 그래서 실제 URL 을 가진 페이지(app/about, app/contact, app/privacy)로 옮기고
// 여기서는 링크만 건다. 개인정보처리방침 본문이 두 군데 있으면 나중에 한쪽만
// 고쳐져 어긋나므로 모달 쪽은 남기지 않았다.
export function Footer() {
  const FOUNDED = 2020; // 청구닷컴 제작 연도

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="maxw px-5 py-6 text-sm text-slate-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>© {FOUNDED} 청구닷컴</div>
          <nav className="flex items-center gap-3" aria-label="사이트 정보">
            <Link href="/about" className="btn btn-ghost">
              소개
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              문의
            </Link>
            <Link href="/privacy" className="btn btn-ghost">
              개인정보처리방침
            </Link>
          </nav>
        </div>
        <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col items-center gap-2.5">
          <BrandMark variant="full" height={40} />
          <p className="text-center text-[11px] text-slate-500 font-medium leading-relaxed">
            <a
              href="https://xn--h32b21du9cf7grcy2k20f.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 font-bold hover:text-slate-900 underline-offset-2 hover:underline"
            >
              프라임에셋 어메이징사업부
            </a>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-slate-500 font-semibold">김성민</span>
            <br />
            <span className="text-slate-400">
              이 서비스는 어메이징사업부가 기획·개발했습니다.
            </span>
            <br />
            <a
              href="https://xn--oi2b19pfvd21bx33a.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline"
            >
              함께할 보험설계사를 찾습니다 — 리쿠르팅 안내 →
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
