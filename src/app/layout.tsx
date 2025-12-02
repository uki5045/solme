import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "쏠마린캠핑카 | 중고 캠핑카・카라반 전문 매매",
  description:
    "매매업・정비업 정식 허가 업체. 중고 캠핑카, 카라반 매입, 판매, 위탁, 수리, 업그레이드까지. 2개월 무상 AS, 초저금리 할부 제공.",
  keywords:
    "중고캠핑카, 캠핑카매매, 카라반, 캠핑카수리, 캠핑카업그레이드, 옥천캠핑카, 쏠마린",
  metadataBase: new URL("https://solmarine.kr"),
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
    <html lang="ko">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0a1628" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
