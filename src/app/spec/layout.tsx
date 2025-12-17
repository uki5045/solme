import type { Metadata, Viewport } from "next";
import "./spec.css";

// spec 페이지 전용 viewport - 다크 테마 색상 고정
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121418", // 다크 배경색 고정 (iOS Safari 상단/하단 바)
};

export const metadata: Metadata = {
  title: "옵션표 생성기 | 쏠마린캠핑카",
  description: "캠핑카/카라반 옵션표 생성 도구",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "옵션표 생성기",
  },
};

export default function SpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
