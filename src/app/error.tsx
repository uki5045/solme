'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 프로덕션에서는 에러 트래킹 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket 등 연동
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">문제가 발생했습니다</h2>
        <p className="mb-6 text-gray-400">
          죄송합니다. 페이지를 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
