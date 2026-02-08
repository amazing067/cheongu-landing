"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-slate-800 mb-2">문제가 발생했습니다</h2>
      <p className="text-slate-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
      >
        다시 시도
      </button>
    </div>
  );
}
