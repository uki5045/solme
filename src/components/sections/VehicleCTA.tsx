"use client";

import { ArrowRight } from "lucide-react";

export default function VehicleCTA() {
  return (
    <section className="snap-section h-screen flex items-center justify-center relative overflow-hidden bg-[var(--navy-900)]">

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold text-white mb-4">
          지금 판매 중인 차량이 궁금하신가요?
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/70 mb-8">
          쏠마린 캠핑카의 엄선된 매물을 확인해 보세요.
        </p>

        <a
          href="https://m.cafe.naver.com/ca-fe/web/cafes/30842004/menus/94"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--trust-500)] hover:bg-[var(--trust-600)] text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[var(--trust-500)]/30"
        >
          판매 차량 보러가기
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
