import type { Viewport } from 'next';
import { cookies } from 'next/headers';

// 동적 viewport - 쿠키에서 테마 읽어서 theme-color 설정
export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;

  // 쿠키에 저장된 테마에 따라 theme-color 설정
  if (theme === 'dark') {
    return {
      themeColor: '#1c1f26', // 다크모드 헤더 색상
    };
  } else if (theme === 'light') {
    return {
      themeColor: '#ffffff', // 라이트모드 헤더 색상
    };
  }

  // 쿠키 없으면 시스템 테마 따름 (기본 동작)
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#1c1f26' },
    ],
  };
}

export default function SpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
