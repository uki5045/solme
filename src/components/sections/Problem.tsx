"use client";

const problemCards = [
  {
    titleLight: "지금 보시는 그 업체,",
    titleBold: "매매업 허가를 받은 곳인가요?",
    description:
      "무등록 업체에서 캠핑카를 구매하면 법적 보호를 받을 수 없습니다.",
  },
  {
    titleLight: "할부 금리와 조건,",
    titleBold: "꼼꼼히 확인해보셨나요?",
    description:
      "정식 제휴된 업체만 '저금리 할부' 혜택을 제공할 수 있습니다.",
  },
  {
    titleLight: "캠핑카 구매 후 AS,",
    titleBold: "확실하게 보장되나요?",
    description:
      "보증 기간과 범위가 계약서에 명시되어 있지 않다면 아무런 책임을 물을 수 없습니다.",
  },
];

export default function Problem() {
  return (
    <>
      {/* 타이틀 섹션 */}
      <section className="snap-section h-screen flex items-center justify-center relative overflow-hidden bg-[var(--navy-900)]">
        <div className="text-left px-6">
          <h2 className="text-[33px] md:text-[40px] leading-tight">
            <span className="font-light">중고 캠핑카</span>
            <br />
            <span className="font-bold text-[var(--danger-400)]">
              정말 믿고 사도 될까요?
            </span>{" "}
            <span className="text-3xl md:text-5xl">🤔</span>
          </h2>
        </div>
      </section>

      {/* 카드 섹션들 */}
      {problemCards.map((card, index) => (
        <section
          key={index}
          className="snap-section h-screen flex items-center relative overflow-hidden bg-[var(--navy-900)]"
        >
          <div className="w-full max-w-4xl mx-auto px-6 text-left">
            <h3 className="text-[30px] md:text-[36px] text-white mb-6 leading-snug">
              <span className="font-light">{card.titleLight}</span>
              <br />
              <span className="font-bold">{card.titleBold}</span>
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
