import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header>
      <div className="maxw px-5 py-4 flex items-center gap-3">
        <Link href="/" className="text-xl font-extrabold no-underline">
          청구닷컴
        </Link>
        <span
          className="flex items-center gap-2 pl-2.5 border-l border-slate-200"
          title="제작 · 프라임에셋 어메이징사업부"
        >
          <BrandMark variant="mark" height={28} />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-[13px] font-extrabold tracking-tight text-[#e0342a]">
              AMAZING
            </span>
            <span className="mt-0.5 text-[10px] font-semibold text-slate-400">
              프라임에셋 어메이징사업부
            </span>
          </span>
        </span>
        <nav className="ml-auto flex items-center gap-2">
          <a href="#loss" className="btn btn-ghost">
            손해보험사
          </a>
          <a href="#life" className="btn btn-ghost">
            생명보험사
          </a>
          <a href="#mutual" className="btn btn-ghost">
            공제회사
          </a>
          <a href="#calc-panels" className="btn btn-ghost">
            보험나이 계산기
          </a>
          <a href="#medcalc" className="btn btn-ghost">
            실손 계산기
          </a>
        </nav>
      </div>
    </header>
  );
}
