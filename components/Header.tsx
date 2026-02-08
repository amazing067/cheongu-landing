import Link from "next/link";

export function Header() {
  return (
    <header>
      <div className="maxw px-5 py-4 flex items-center gap-3">
        <Link href="/" className="text-xl font-extrabold no-underline">
          청구닷컴
        </Link>
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
