'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: '서버 설정에 문제가 있습니다. 관리자에게 문의하세요.',
    AccessDenied: '접근이 거부되었습니다. 허용된 계정으로 로그인해주세요.',
    Verification: '로그인 링크가 만료되었거나 이미 사용되었습니다.',
    Default: '로그인 중 오류가 발생했습니다.',
  };

  const message = errorMessages[error || ''] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">로그인 오류</h1>
        <p className="mb-6 text-gray-500">{message}</p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-xl bg-[#1e3a5f] px-6 py-3 font-medium text-white transition-all hover:bg-[#152a45]"
        >
          다시 시도
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">로딩 중...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
