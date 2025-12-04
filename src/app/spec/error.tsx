'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SpecError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // 에러 트래킹 서비스로 전송
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">옵션표 로드 실패</h2>
        <p className="mb-6 text-gray-400">
          옵션표 페이지를 불러오는 중 오류가 발생했습니다.
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="rounded-full bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-700"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-600 px-6 py-3 font-medium transition hover:bg-gray-800"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
