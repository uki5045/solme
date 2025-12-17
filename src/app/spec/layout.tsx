import type { Viewport } from 'next';

// spec 페이지 전용 viewport - 라이트/다크 모두 대응
export const viewport: Viewport = {
  // 라이트모드: 흰색 헤더, 다크모드: 어두운 헤더
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1f26' },
  ],
};

export default function SpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
