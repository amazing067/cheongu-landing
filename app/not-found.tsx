import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-slate-800 mb-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-slate-600 mb-4">요청하신 페이지가 존재하지 않습니다.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
