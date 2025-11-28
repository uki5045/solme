# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

쏠마린캠핑카 중고 캠핑카/카라반 전문 매매 랜딩페이지. Next.js 16 + React 19 + TypeScript 기반.

**Target**: 30-60대 남성, 모바일 우선 최적화

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## Tech Stack

- **Framework**: Next.js 16.0.5 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, CVA, clsx, tailwind-merge
- **Animation**: GSAP + ScrollTrigger, Motion (Framer), Lenis (smooth scroll)
- **Icons**: Lucide React, Tabler Icons
- **Fonts**: Pretendard (한글), Montserrat (영문/숫자)

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃, 메타데이터, 폰트
│   ├── page.tsx            # 메인 페이지
│   └── globals.css         # CSS 변수, 커스텀 애니메이션
├── components/
│   ├── animations/         # GSAP Provider
│   ├── sections/           # 페이지 섹션 (Hero, Problem, Solution 등)
│   ├── ui/                 # 재사용 UI 컴포넌트
│   ├── PageWrapper.tsx     # 스크롤 관리 컨테이너
│   └── LoadingScreen.tsx   # 로딩 애니메이션
├── hooks/                  # 커스텀 훅
└── lib/
    └── utils.ts            # cn() 유틸리티
```

## Key Patterns

### Animation
- GSAP ScrollTrigger: `scrub: 1-1.5` 스크롤 연동
- `useEffect`에서 GSAP context 생성 → cleanup 필수
- `prefers-reduced-motion` 지원

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations
  }, containerRef);
  return () => ctx.revert();
}, []);
```

### Styling
- `cn()` 유틸리티로 조건부 클래스 병합
- CSS 변수: `globals.css`의 `:root` 정의
- 모바일: `100svh`/`100dvh` 사용 (iOS 대응)

### Client Components
- 인터랙티브 컴포넌트: `"use client"` 지시문 필수
- 모든 섹션 컴포넌트는 클라이언트 컴포넌트

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=
```

## Design System

**Colors** (CSS 변수):
- Primary: `--apple-blue` (#0071e3)
- Success: `--trust-teal` (#32d74b)
- Danger: `--danger-red` (#ff453a)
- Dark: `--apple-black` (#000000)

**Glass Effect**: `.glass-card` 클래스
**Gradient Text**: `.glow-text` 클래스

## Mobile Considerations

- iOS Safari: `ignoreMobileResize: true` (주소창 리사이즈)
- Safe Area: `env(safe-area-inset-*)` 적용
- Touch: over-scroll 방지 처리됨
- 최소 터치 영역: 44px
