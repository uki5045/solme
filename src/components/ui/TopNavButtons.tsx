"use client";

import { Phone, MapPin } from "lucide-react";

export default function TopNavButtons() {
  const scrollToContact = () => {
    const mainElement = document.querySelector("main");
    const contactSection = document.getElementById("contact-info");
    if (mainElement && contactSection) {
      const offsetTop = contactSection.offsetTop;
      mainElement.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex gap-2 md:gap-3">
      {/* 전화하기 */}
      <a
        href="tel:010-7933-9990"
        className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-[var(--trust-500)] hover:bg-[var(--trust-600)] text-white text-sm md:text-base font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
      >
        <Phone className="w-4 h-4 md:w-5 md:h-5" />
        <span>전화하기</span>
      </a>

      {/* 오시는 길 */}
      <button
        onClick={scrollToContact}
        className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-sm md:text-base font-semibold rounded-full transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl whitespace-nowrap"
      >
        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
        <span>오시는 길</span>
      </button>
    </div>
  );
}
