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
- **Auth**: NextAuth.js v5 (Google OAuth)
- **Icons**: Lucide React, Tabler Icons
- **Fonts**: Pretendard (한글), Montserrat (영문/숫자)

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (SessionProvider 포함)
│   ├── page.tsx            # 메인 랜딩페이지
│   ├── globals.css         # CSS 변수, 커스텀 애니메이션
│   ├── spec/               # 옵션표 생성기 (인증 필요)
│   │   └── page.tsx        # 캠핑카/카라반 옵션표 생성
│   ├── auth/               # 인증 페이지
│   │   ├── signin/         # Google 로그인
│   │   └── error/          # 인증 오류
│   └── api/auth/[...nextauth]/  # NextAuth API 라우트
├── components/
│   ├── animations/         # GSAP Provider
│   ├── sections/           # 페이지 섹션 (Hero, Problem, Solution 등)
│   ├── ui/                 # 재사용 UI 컴포넌트
│   └── providers/          # Context Providers (SessionProvider)
├── auth.ts                 # NextAuth 설정 (Google Provider, 허용 이메일)
├── middleware.ts           # 라우트 보호 (/spec 인증 필요)
├── hooks/                  # 커스텀 훅
└── lib/
    └── utils.ts            # cn() 유틸리티
```

## Key Patterns

### Authentication
- `/spec` 경로: Google 로그인 필수
- `src/auth.ts`의 `ALLOWED_EMAILS` 배열로 접근 제한 가능
- 미들웨어가 미인증 사용자를 `/auth/signin`으로 리다이렉트

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
AUTH_SECRET=                      # NextAuth secret (npx auth secret)
GOOGLE_CLIENT_ID=                 # Google OAuth Client ID
GOOGLE_CLIENT_SECRET=             # Google OAuth Client Secret
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=
```

### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리다이렉션 URI 추가:
   - 로컬: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://solmarine.kr/api/auth/callback/google`

## Design System

**Colors** (CSS 변수):
- Primary Blue: `--accent-500` (#0071e3), `--accent-400` (#2997ff)
- Success/Trust: `--trust-500` (#32d74b), `--trust-400` (#4ade80)
- Danger: `--danger-500` (#ff453a), `--danger-400` (#ff6961)
- Dark Base: `--black-900` (#000000), `--black-800` (#0a0a0a)
- Text: `--text-primary` (#f5f5f7), `--text-muted` (#86868b)

**Utility Classes**:
- `.glass-card`: 반투명 blur 카드 (glassmorphism)
- `.glow-text`: 블루-그린 그라데이션 텍스트 + drop-shadow
- `.danger-glow-text`: 빨간색 글로우 텍스트
- `.gradient-border`: 그라데이션 테두리 효과
- `.btn-premium`: Apple 스타일 CTA 버튼

## Mobile Considerations

- iOS Safari: `ignoreMobileResize: true` (주소창 리사이즈)
- Safe Area: `env(safe-area-inset-*)` → `--sat`, `--sar`, `--sab`, `--sal` 변수
- Touch: `overscroll-behavior: none` 적용
- 최소 터치 영역: 44px
- Scroll Snap: `.snap-container`, `.snap-section` 클래스

## Protected Routes

| 경로 | 인증 | 설명 |
|------|------|------|
| `/` | 불필요 | 메인 랜딩페이지 |
| `/spec` | Google 로그인 | 캠핑카/카라반 옵션표 생성기 |
| `/call` | 불필요 | 전화 연결 리다이렉트 |
| `/auth/*` | 불필요 | 로그인/에러 페이지 |

## Database (Supabase)

**테이블**: `vehicle_specs`
- `vehicle_number`: 차량번호 (unique key)
- `vehicle_type`: 'camper' | 'caravan'
- `data`: JSON (폼 데이터)
- `created_at`, `updated_at`: timestamp

## Security Notes

- `.env.local` 파일은 `.gitignore`에 포함 → git 추적 안 함
- `/spec` 접근 제한: `src/auth.ts`의 `ALLOWED_EMAILS` 배열로 관리
- 네이버맵 API 키: 환경변수 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`로 관리 권장

## Animation Patterns

모든 섹션 컴포넌트는 동일한 패턴 사용:
```tsx
// 1. 모션 감소 설정 확인
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

// 2. main 요소를 scroller로 사용 (Lenis smooth scroll 대응)
const mainElement = document.querySelector("main");

// 3. GSAP context로 cleanup 보장
const ctx = gsap.context(() => {
  gsap.fromTo(ref.current, { ... }, {
    scrollTrigger: {
      trigger: sectionRef.current,
      scroller: mainElement,  // 중요!
      scrub: 1-1.5,
    }
  });
}, sectionRef);
return () => ctx.revert();
```

## Code Quality Guidelines

- localStorage 접근 시 try-catch 사용
- 환경변수는 런타임 체크 추가 (`if (!env) throw`)
- 컴포넌트 key에 index 대신 고유 ID 사용
- resize 이벤트에 debounce 적용
