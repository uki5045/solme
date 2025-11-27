# 쏠마린 캠핑카 랜딩페이지 PRD

## 1. 프로젝트 개요

### 1.1 프로젝트명
쏠마린 캠핑카 랜딩페이지

### 1.2 목적
중고 캠핑카/카라반 매매 전문업체 "쏠마린캠핑카"의 신뢰도와 전문성을 어필하는 랜딩페이지 제작

### 1.3 타겟 사용자
- 중고 캠핑카/카라반 구매를 고려하는 30-60대 남성
- 모바일 사용자가 대다수 (모바일 최적화 필수)

### 1.4 기술 스택
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: GSAP + ScrollTrigger
- **Maps**: 네이버 지도 API, 카카오 지도 API

---

## 2. 디자인 시스템

### 2.1 컬러 팔레트

```css
:root {
  /* Primary - Navy */
  --navy-900: #0a1628;
  --navy-800: #1a2744;
  --navy-700: #243a5e;
  --navy-600: #2e4a78;
  --navy-500: #3d5a80;
  
  /* Accent - Warm Gold (신뢰/프리미엄) */
  --gold-500: #d4a853;
  --gold-400: #e5be6a;
  
  /* Danger - Problem 섹션용 */
  --danger-600: #dc2626;
  --danger-500: #ef4444;
  --danger-400: #f87171;
  
  /* Success - Solution 섹션용 */
  --trust-600: #0d9488;
  --trust-500: #14b8a6;
  --trust-400: #2dd4bf;
  
  /* Neutral */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
}
```

### 2.2 타이포그래피

```css
/* 한글 본문 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* 영문/숫자 강조 */
font-family: 'Montserrat', sans-serif;
```

**폰트 사이즈 (모바일 기준)**
- Hero 타이틀: 32px / 40px (desktop)
- 섹션 타이틀: 24px / 32px (desktop)
- 서브 타이틀: 18px / 24px (desktop)
- 본문: 16px
- 캡션: 14px

### 2.3 그라데이션

```css
/* Problem 섹션 - 위험/경고 */
.problem-gradient {
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.15) 0%,
    rgba(239, 68, 68, 0.08) 50%,
    rgba(248, 113, 113, 0.05) 100%
  );
}

/* Solution 섹션 - 신뢰/안정 */
.solution-gradient {
  background: linear-gradient(
    135deg,
    rgba(13, 148, 136, 0.15) 0%,
    rgba(20, 184, 166, 0.08) 50%,
    rgba(45, 212, 191, 0.05) 100%
  );
}

/* 움직이는 그라데이션 효과 */
@keyframes gradientMove {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## 3. 페이지 구조 및 섹션 상세

### 3.1 전체 섹션 순서
1. Hero
2. Problem
3. Solution
4. Process (구매 프로세스)
5. Vehicle CTA (판매 차량 보러가기)
6. Location
7. Footer
8. Floating CTA (고정)

---

### 3.2 Hero 섹션

**레이아웃**
- 전체 뷰포트 높이 (100vh, 모바일에서는 100svh)
- 배경: 이미지 + 어두운 오버레이 + 은은한 그라데이션
- 이미지 placeholder: `/images/hero-bg.jpg` (나중에 교체)

**콘텐츠**
```
[라운드 뱃지]
매매업 ・ 정비업 허가 업체

[메인 타이틀 - 크게]
캠핑의 시작과 끝,
쏠마린 캠핑카가 함께합니다.

[해시태그 - "#" 부분만 푸른색 (--trust-500)]
#매입  #판매  #위탁  #수리  #업그레이드
```

**애니메이션**
- 뱃지: fade in + slide up (delay: 0)
- 타이틀 라인1: fade in + slide up (delay: 0.2s)
- 타이틀 라인2: fade in + slide up (delay: 0.4s)
- 해시태그: fade in + slide up (delay: 0.6s)
- 스크롤 유도 아이콘: bounce animation (하단)

---

### 3.3 Problem 섹션

**배경**
- Navy 베이스 + 붉은 계열 그라데이션 (움직이는 효과)
- `background-size: 200% 200%`로 gradientMove 애니메이션 적용

**구조: 단일 ScrollTrigger 타임라인**

**[Part 1] 타이틀 영역 (스크롤 진입 시)**
```
[작고 블러 상태 → 스크롤에 따라 커지면서 블러 제거]

중고 캠핑카 (font-weight: 300, 크게)
정말 믿고 사도 될까요? (font-weight: 700, 붉은 계열 색상) 🤔
```

**애니메이션 상세**
- 초기 상태: `scale(0.8)`, `filter: blur(10px)`, `opacity: 0`
- 최종 상태: `scale(1)`, `filter: blur(0)`, `opacity: 1`
- ScrollTrigger: `start: "top 80%"`, `end: "top 30%"`, `scrub: 1`

---

**[Part 2] 문제 제기 카드들**

**카드 1 - 좌측에서 등장**
```
[타이틀 - 크게, 좌측 정렬]
매매업 허가 업체인가요?

[설명]
매매업 허가를 받지 않은 업체에서 구매 시
자동차관리법상 법적 보호를 전혀 받을 수 없습니다.
```

**카드 2 - 우측에서 등장**
```
[타이틀 - 크게, 우측 정렬]
할부 금리와 조건, 꼼꼼히 따져보셨나요?

[설명]
국내 대형 캐피탈사와 정식 제휴된 업체여야만
거품 없는 투명한 '저금리 할부' 혜택을 받으실 수 있습니다.
```

**카드 3 - 좌측에서 등장**
```
[타이틀 - 크게, 좌측 정렬]
구매 후 AS, 확실하게 보장되나요?

[설명]
보증 기간과 범위가 계약서에 명시되어 있지 않다면
고장 시 아무런 책임을 물을 수 없습니다.
```

**카드 애니메이션**
- 좌측 카드: `x: -100vw` → `x: 0` (scrub)
- 우측 카드: `x: 100vw` → `x: 0` (scrub)
- 모바일에서도 동일하게 화면 밖에서 진입
- ScrollTrigger: 각 카드별 개별 trigger, `scrub: 1`

---

### 3.4 Solution 섹션

**배경**
- Navy 베이스 + 청록 계열 그라데이션 (움직이는 효과)
- 신뢰감과 안정감을 주는 톤

**구조: 단일 ScrollTrigger 타임라인**

**[Part 1] 타이틀 영역**
```
[작고 블러 상태 → 스크롤에 따라 커지면서 블러 제거]

중고 캠핑카 구매 (font-weight: 300, 크게)
결국 쏠마린이 정답입니다. (font-weight: 700)
└─ "쏠마린" 부분: --trust-400 색상 + 글로우 효과(text-shadow)
```

**글로우 효과 CSS**
```css
.glow-text {
  color: var(--trust-400);
  text-shadow: 
    0 0 10px rgba(45, 212, 191, 0.5),
    0 0 20px rgba(45, 212, 191, 0.3),
    0 0 30px rgba(45, 212, 191, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { text-shadow: 0 0 10px rgba(45, 212, 191, 0.5), 0 0 20px rgba(45, 212, 191, 0.3); }
  50% { text-shadow: 0 0 20px rgba(45, 212, 191, 0.7), 0 0 40px rgba(45, 212, 191, 0.5); }
}
```

---

**[Part 2] 솔루션 카드들**

**카드 1 - 좌측에서 등장**
```
[타이틀 - 크게, 좌측 정렬]
100% 법적 보호, '정식 허가 업체'

[설명]
매매업과 정비업 모두 정식 등록된 업체로
안전하게 거래하실 수 있습니다.
```

**카드 2 - 우측에서 등장**
```
[타이틀 - 크게, 우측 정렬]
대형 캐피탈 제휴 '초저금리 할부'

[설명]
국내 메이저 금융사와의 공식 제휴를 통해
고객님께 맞는 최저 금리를 투명하게 적용해 드립니다.
```

**카드 3 - 좌측에서 등장**
```
[타이틀 - 크게, 좌측 정렬]
외주 없는 '전문 정비 시스템'

[설명]
구매 후 2개월 무상 AS 제공, 출고 전 점검부터
AS, 업그레이드까지 직접 꼼꼼하게 작업합니다.
```

**카드 애니메이션**
- Problem 섹션과 동일한 좌/우 진입 패턴
- 카드 배경에 미세한 글로우 효과 추가

---

### 3.5 Process 섹션 (구매 프로세스)

**배경**
- Navy 솔리드 또는 미세한 그라데이션

**타이틀**
```
쏠마린과 함께하는
캠핑카 구매 여정
```

**프로세스 스텝 (가로 스크롤 or 세로 타임라인)**

```
STEP 1: 상담
└─ 아이콘: 💬 또는 phone icon
└─ 설명: 전화 또는 방문 상담으로 원하시는 차량 조건을 말씀해 주세요.

STEP 2: 차량 선택
└─ 아이콘: 🚐 또는 car icon
└─ 설명: 재고 차량 중 조건에 맞는 차량을 직접 확인하고 선택하세요.

STEP 3: 계약
└─ 아이콘: 📝 또는 document icon
└─ 설명: 투명한 가격과 조건으로 정식 계약서를 작성합니다.

STEP 4: 출고 전 점검
└─ 아이콘: 🔧 또는 wrench icon
└─ 설명: 자체 정비소에서 꼼꼼한 점검과 정비를 진행합니다.

STEP 5: 출고
└─ 아이콘: 🎉 또는 key icon
└─ 설명: 2개월 무상 AS와 함께 새로운 캠핑 라이프를 시작하세요!
```

**애니메이션**
- 스크롤에 따라 각 스텝이 순차적으로 활성화
- 활성화된 스텝: 아이콘 확대 + 색상 강조
- 스텝 간 연결선 애니메이션 (drawSVG 효과)

**모바일 레이아웃**
- 세로 타임라인 형태
- 좌측에 연결선, 우측에 콘텐츠

---

### 3.6 Vehicle CTA 섹션

**배경**
- 캠핑카 이미지 배경 + 오버레이 또는 그라데이션 배경

**콘텐츠**
```
[타이틀]
지금 판매 중인 차량이 궁금하신가요?

[서브]
쏠마린 캠핑카의 엄선된 매물을 확인해 보세요.

[CTA 버튼 - 크고 눈에 띄게]
판매 차량 보러가기 →
└─ 링크: https://cafe.naver.com/f-e/cafes/30842004/menus/94?page=1&viewType=I&size=20
└─ target: _blank
```

**애니메이션**
- fade in on scroll
- 버튼 hover: scale up + glow effect

---

### 3.7 Location 섹션

**배경**
- Navy 또는 dark gray

**콘텐츠**
```
[섹션 타이틀]
오시는 길

[정보 카드]
📍 위치
충청북도 옥천군 옥천읍 남곡길 8

🕐 영업시간
월~토 오전 9시 ~ 오후 6시
일요일 휴무

📞 문의
010-7933-9990
```

**지도**
- 탭 UI로 네이버 지도 / 카카오 지도 전환
- 기본값: 네이버 지도
- 지도 높이: 모바일 300px, 데스크탑 400px
- 마커: 쏠마린캠핑카 위치 표시

**지도 API 설정**
```javascript
// 네이버 지도
const NAVER_MAP_CENTER = { lat: 36.3068, lng: 127.5714 }; // 옥천군 좌표 (정확한 좌표로 교체 필요)

// 카카오 지도
const KAKAO_MAP_CENTER = { lat: 36.3068, lng: 127.5714 };
```

---

### 3.8 Footer

**배경**
- --navy-900 (가장 어두운 톤)

**콘텐츠**
```
[로고 영역]
쏠마린캠핑카

[SNS 링크 - 아이콘]
네이버 카페 | 인스타그램 | (유튜브 - 추후 추가)

[회사 정보]
상호명: 주식회사 쏠마린캠핑카
대표: 정은희
주소: 충청북도 옥천군 옥천읍 남곡길 8
사업자등록번호: 208-87-02831

[Copyright]
© 2024 쏠마린캠핑카. All rights reserved.
```

**SNS 링크**
- 네이버 카페: https://cafe.naver.com/solmarinecamping
- 인스타그램: https://www.instagram.com/solmarinecamping/
- 유튜브: (추후 추가 - placeholder 또는 숨김 처리)

---

### 3.9 Floating CTA (고정 버튼)

**위치**
- 화면 하단 고정
- 모바일: 전체 너비 (좌우 패딩)
- 데스크탑: 중앙 정렬, 적절한 너비

**버튼 구성**
```
[전화 문의] | [오시는 길]
```

**동작**
- 전화 문의: `href="tel:010-7933-9990"`
- 오시는 길: Location 섹션으로 스무스 스크롤 (`#location`)

**스타일**
- 배경: 반투명 blur 효과 (glassmorphism)
- 버튼: --trust-500 배경, 흰색 텍스트
- 그림자: 위쪽으로 부드러운 shadow

**표시 조건**
- Hero 섹션을 지나면 나타남 (fade in)
- Footer 영역에서는 숨김 처리 (선택사항)

---

## 4. 애니메이션 상세 가이드

### 4.1 GSAP + ScrollTrigger 설정

```javascript
// 기본 설정
gsap.registerPlugin(ScrollTrigger);

// 모바일 대응
ScrollTrigger.config({
  ignoreMobileResize: true
});

// 새로고침 시 스크롤 위치 초기화
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
```

### 4.2 Problem/Solution 타이틀 애니메이션

```javascript
// 타이틀 블러 + 스케일 애니메이션
gsap.fromTo('.section-title', 
  {
    scale: 0.8,
    filter: 'blur(10px)',
    opacity: 0
  },
  {
    scale: 1,
    filter: 'blur(0px)',
    opacity: 1,
    scrollTrigger: {
      trigger: '.section-title',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1
    }
  }
);
```

### 4.3 좌/우 슬라이드 인 카드

```javascript
// 좌측에서 등장
gsap.fromTo('.card-left',
  { x: '-100vw', opacity: 0 },
  {
    x: 0,
    opacity: 1,
    scrollTrigger: {
      trigger: '.card-left',
      start: 'top 90%',
      end: 'top 50%',
      scrub: 1
    }
  }
);

// 우측에서 등장
gsap.fromTo('.card-right',
  { x: '100vw', opacity: 0 },
  {
    x: 0,
    opacity: 1,
    scrollTrigger: {
      trigger: '.card-right',
      start: 'top 90%',
      end: 'top 50%',
      scrub: 1
    }
  }
);
```

### 4.4 모바일 최적화 주의사항

```javascript
// 모바일에서 가로 스크롤 방지
// 카드가 화면 밖에서 시작하므로 overflow-x: hidden 필수
document.body.style.overflowX = 'hidden';

// 또는 CSS
html, body {
  overflow-x: hidden;
}

// 각 섹션에도 적용
.problem-section,
.solution-section {
  overflow-x: hidden;
}
```

---

## 5. 반응형 브레이크포인트

```css
/* Mobile First */
/* 기본: 모바일 (< 640px) */

/* Tablet */
@media (min-width: 640px) { /* sm */ }

/* Small Desktop */
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl */ }
```

---

## 6. 파일 구조

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Problem.tsx
│   │   ├── Solution.tsx
│   │   ├── Process.tsx
│   │   ├── VehicleCTA.tsx
│   │   ├── Location.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── FloatingCTA.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── MapTabs.tsx
│   └── animations/
│       └── GSAPProvider.tsx
├── hooks/
│   └── useScrollTrigger.ts
├── lib/
│   └── utils.ts
└── styles/
    └── animations.css
```

---

## 7. SEO 및 메타데이터

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: '쏠마린캠핑카 | 중고 캠핑카・카라반 전문 매매',
  description: '매매업・정비업 정식 허가 업체. 중고 캠핑카, 카라반 매입, 판매, 위탁, 수리, 업그레이드까지. 2개월 무상 AS, 초저금리 할부 제공.',
  keywords: '중고캠핑카, 캠핑카매매, 카라반, 캠핑카수리, 캠핑카업그레이드, 옥천캠핑카, 쏠마린',
  openGraph: {
    title: '쏠마린캠핑카 | 중고 캠핑카・카라반 전문',
    description: '캠핑의 시작과 끝, 쏠마린 캠핑카가 함께합니다.',
    images: ['/images/og-image.jpg'],
  },
};
```

---

## 8. 환경 변수

```env
# .env.local
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_map_app_key
```

---

## 9. 체크리스트

### 개발 전
- [ ] 네이버 지도 API 키 발급
- [ ] 카카오 지도 API 키 발급
- [ ] Hero 배경 이미지 준비 (임시 placeholder 가능)
- [ ] 정확한 업체 좌표 확인

### 개발 중
- [ ] 모바일 Safari 100vh 이슈 대응 (100svh 또는 JS 계산)
- [ ] GSAP ScrollTrigger 모바일 테스트
- [ ] 가로 스크롤 발생 여부 확인
- [ ] 다크모드 비활성화 (Navy 테마 고정)

### 개발 후
- [ ] Lighthouse 성능 점수 확인
- [ ] 모바일 실기기 테스트 (iOS Safari, Android Chrome)
- [ ] 전화 링크 동작 확인
- [ ] 지도 마커 위치 확인
- [ ] SNS 링크 동작 확인

---

## 10. 참고 링크

- 네이버 카페: https://cafe.naver.com/solmarinecamping
- 인스타그램: https://www.instagram.com/solmarinecamping/
- 판매 차량 목록: https://cafe.naver.com/f-e/cafes/30842004/menus/94?page=1&viewType=I&size=20

---

## 11. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-XX-XX | 최초 작성 |
