import type { Metadata, Viewport } from "next";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

// Viewport - 시스템 테마에 따라 themeColor 자동 변경
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  colorScheme: "light dark", // 시스템 테마 따라감
};

export const metadata: Metadata = {
  title: "쏠마린캠핑카 | 중고 캠핑카・카라반 전문 매매",
  description:
    "매매업・정비업 정식 허가 업체. 중고 캠핑카, 카라반 매입, 판매, 위탁, 수리, 업그레이드까지. 2개월 무상 AS, 초저금리 할부 제공.",
  keywords:
    "중고캠핑카, 캠핑카매매, 카라반, 캠핑카수리, 캠핑카업그레이드, 옥천캠핑카, 쏠마린",
  metadataBase: new URL("https://solmarine.kr"),
  // iOS Safari - 투명 상태바 (페이지 배경색 투과)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "쏠마린캠핑카",
  },
  openGraph: {
    title: "쏠마린캠핑카 | 중고 캠핑카・카라반 전문",
    description: "캠핑의 시작과 끝, 쏠마린 캠핑카가 함께합니다.",
    url: "https://solmarine.kr",
    siteName: "쏠마린캠핑카",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/images/og-image2.jpg",
        width: 1200,
        height: 630,
        alt: "쏠마린캠핑카 - 중고 캠핑카 전문 매매",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "쏠마린캠핑카 | 중고 캠핑카・카라반 전문",
    description: "캠핑의 시작과 끝, 쏠마린 캠핑카가 함께합니다.",
    images: ["/images/og-image2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-gray-100 dark:bg-[#111111]">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#111111] antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
