"use client";

const solutionCards = [
  {
    title: "국토부 정식 허가 업체",
    description:
      "매매업과 정비업 모두 정식 등록된 업체로\n안전하게 거래하실 수 있습니다.",
  },
  {
    title: "대형 캐피탈 제휴",
    description:
      "국내 메이저 금융사와의 공식 제휴로 고객님께 맞는 최저 금리를 투명하게 적용해 드립니다.",
  },
  {
    title: "전문 정비 시스템",
    description:
      "캠핑카 구매 후 2개월 무상 AS 제공하며,\n출고 전 점검부터 AS, 업그레이드까지 직접 꼼꼼하게 작업합니다.",
  },
];

export default function Solution() {
  return (
    <>
      {/* 타이틀 섹션 */}
      <section className="snap-section h-screen flex items-center justify-center relative overflow-hidden bg-[var(--navy-900)]">
        <div className="text-left px-6">
          <h2 className="text-[33px] md:text-[40px] leading-tight">
            <span className="font-light">중고 캠핑카 구매</span>
            <br />
            <span className="font-bold">
              결국 <span className="glow-text">쏠마린</span>이 정답입니다.
            </span>
          </h2>
        </div>
      </section>

      {/* 카드 섹션들 */}
      {solutionCards.map((card, index) => (
        <section
          key={index}
          className="snap-section h-screen flex items-center relative overflow-hidden bg-[var(--navy-900)]"
        >
          <div className="w-full max-w-4xl mx-auto px-6 text-left">
            <h3 className="text-[36px] md:text-[36px] font-bold text-white mb-6 whitespace-pre-line leading-snug">
              {card.title}
            </h3>
            <p className="text-[20px] md:text-[20px] text-white/70 whitespace-pre-line leading-relaxed">
              {card.description}
            </p>
          </div>
        </section>
      ))}
    </>
  );
}
