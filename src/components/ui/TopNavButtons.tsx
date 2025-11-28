"use client";

import { Phone, MapPin } from "lucide-react";

export default function TopNavButtons() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex gap-2 md:gap-3">
      {/* 전화하기 */}
      <a
        href="tel:010-7933-9990"
        className="flex items-center justify-center gap-2 min-w-[130px] md:min-w-[150px] px-5 md:px-8 py-3 md:py-3.5 bg-[var(--trust-500)] hover:bg-[var(--trust-600)] text-white text-sm md:text-base font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
      >
        <Phone className="w-4 h-4 md:w-5 md:h-5" />
        <span>전화하기</span>
      </a>

      {/* 오시는 길 */}
      <a
        href="https://map.naver.com/p/directions/-/14216622.2289245,4337908.8498498,쏠마린캠핑카,1000695224/-/transit?c=15.00,0,0,0,dh"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 min-w-[130px] md:min-w-[150px] px-5 md:px-8 py-3 md:py-3.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-sm md:text-base font-semibold rounded-full transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl whitespace-nowrap"
      >
        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
        <span>오시는 길</span>
      </a>
    </div>
  );
}
