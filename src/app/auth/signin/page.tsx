'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

// 인앱 브라우저 감지
function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  // 카카오톡, 인스타그램, 페이스북, 네이버, 라인, 트위터 등
  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\/|Twitter/i.test(ua);
}

// 현재 URL 복사
function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

export default function SignInPage() {
  const [isInApp, setIsInApp] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsInApp(isInAppBrowser());
  }, []);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 인앱 브라우저인 경우 외부 브라우저 안내
  if (isInApp) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="w-full max-w-xs rounded-2xl bg-gray-50 p-6 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-gray-900">외부 브라우저로 열어주세요</h1>
            <p className="text-sm leading-relaxed text-gray-500">
              인앱 브라우저에서는 Google 로그인이 지원되지 않습니다.
              <br />
              Safari, Chrome 등 외부 브라우저에서 열어주세요.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopyUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 font-medium text-white transition-all hover:bg-accent-600"
            >
              {copied ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  복사됨!
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  URL 복사하기
                </>
              )}
            </button>

            <div className="rounded-lg bg-gray-100 p-3">
              <p className="text-center text-xs leading-relaxed text-gray-500">
                <strong className="text-gray-700">방법:</strong> 우측 상단 메뉴(⋮) →
                <br />
                &quot;다른 브라우저로 열기&quot; 또는 &quot;Safari로 열기&quot;
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-gray-400">
            쏠마린캠핑카 내부 도구입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-xs rounded-2xl bg-gray-50 p-6 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-500">옵션표 생성기에 접근하려면 로그인이 필요합니다</p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/spec' })}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          쏠마린캠핑카 내부 도구입니다
        </p>
      </div>
    </div>
  );
}
