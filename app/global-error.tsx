"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-900">
        <h2 className="text-xl font-bold mb-2">문제가 발생했습니다</h2>
        <p className="text-slate-600 mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
