'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (Sentry 등 외부 서비스 연동 가능)
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="bg-black">
        <div className="flex min-h-screen flex-col items-center justify-center text-white">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">심각한 오류가 발생했습니다</h2>
            <p className="mb-6 text-gray-400">
              페이지를 새로고침하거나 나중에 다시 시도해주세요.
            </p>
            <button
              onClick={reset}
              className="rounded-full bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
