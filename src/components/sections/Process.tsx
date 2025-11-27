"use client";

import { MessageCircle, Car, FileText, Wrench, PartyPopper } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "상담",
    description: "전화 또는 방문 상담으로\n원하시는 차량 조건을 말씀해 주세요.",
    Icon: MessageCircle,
  },
  {
    step: 2,
    title: "차량 선택",
    description: "재고 차량 중 조건에 맞는\n차량을 직접 확인하고 선택하세요.",
    Icon: Car,
  },
  {
    step: 3,
    title: "계약",
    description: "투명한 가격과 조건으로\n정식 계약서를 작성합니다.",
    Icon: FileText,
  },
  {
    step: 4,
    title: "출고 전 점검",
    description: "자체 정비소에서\n꼼꼼한 점검과 정비를 진행합니다.",
    Icon: Wrench,
  },
  {
    step: 5,
    title: "출고",
    description: "2개월 무상 AS와 함께\n새로운 캠핑 라이프를 시작하세요!",
    Icon: PartyPopper,
  },
];

export default function Process() {
  return (
    <section className="snap-start min-h-screen flex items-center bg-[var(--navy-800)] py-16">
      <div className="max-w-4xl mx-auto px-6 w-full">
        {/* 타이틀 */}
        <div className="text-center mb-16">
          <h2 className="text-[24px] md:text-[32px] leading-tight">
            <span className="font-light">쏠마린과 함께하는</span>
            <br />
            <span className="font-bold">캠핑카 구매 여정</span>
          </h2>
        </div>

        {/* 스텝 타임라인 */}
        <div className="relative">
          {/* 연결선 - 모바일 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--trust-500)] to-[var(--trust-600)] md:hidden" />

          {/* 스텝들 */}
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-5 md:gap-4">
            {steps.map((item, index) => {
              const { Icon } = item;
              return (
                <div key={item.step} className="relative pl-16 md:pl-0">
                  {/* 아이콘 */}
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-[var(--trust-500)] flex items-center justify-center md:relative md:mx-auto md:mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* 콘텐츠 */}
                  <div className="md:text-center">
                    <div className="text-[var(--trust-400)] text-sm font-semibold mb-1 font-['Montserrat']">
                      STEP {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* 연결선 - 데스크탑 */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-[var(--trust-500)]/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
