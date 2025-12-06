import type { MetadataRoute } from 'next'

// 2. PWA Manifest - 단일 색상 강제
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '쏠마린 옵션표',
    short_name: '옵션표',
    description: '캠핑카/카라반 옵션표 생성 도구',
    start_url: '/spec',
    display: 'standalone',
    background_color: '#f3f4f6', // 앱 시작 시 배경색
    theme_color: '#f3f4f6',      // 상태바 색상
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
