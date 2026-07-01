import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header className="site-hd">
      <div className="maxw flex items-center gap-2.5 h-[60px]">
        <Link
          href="/"
          className="flex items-center gap-2 text-[19px] font-extrabold no-underline text-[#191F28]"
          title="청구닷컴"
        >
          청구닷컴
        </Link>
        <span
          className="flex items-center gap-2 pl-2.5 border-l border-[#E5E8EB]"
          title="제작 · 프라임에셋 어메이징사업부"
        >
          <BrandMark variant="mark" height={26} />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-[13px] font-extrabold tracking-tight text-[#e0342a]">
              AMAZING
            </span>
            <span className="mt-0.5 text-[11px] font-bold text-slate-700">
              프라임에셋 어메이징사업부
            </span>
          </span>
        </span>
        <nav className="hd-nav ml-auto flex items-center gap-1">
          <a href="#loss" className="ghost hidden sm:inline">
            보험사
          </a>
          <a href="#calc-panels" className="ghost hidden sm:inline">
            계산기
          </a>
          <Link href="/join" className="hd-cta">
            설계사 지원
          </Link>
        </nav>
      </div>
    </header>
  );
}
