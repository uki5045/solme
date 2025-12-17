import type { Viewport } from 'next';

// spec 페이지 전용 viewport
// 모바일: 라이트모드 고정 → 흰색 theme-color
// 데스크톱: 시스템 테마 따름
export const viewport: Viewport = {
  themeColor: '#ffffff', // 모바일 라이트모드 고정
};

export default function SpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
