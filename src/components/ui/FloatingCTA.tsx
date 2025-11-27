"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin } from "lucide-react";

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hero 섹션 높이 (100vh) 이후에 표시
      const heroHeight = window.innerHeight;
      setIsVisible(window.scrollY > heroHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 체크

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToLocation = () => {
    const locationSection = document.getElementById("location");
    if (locationSection) {
      locationSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      <div className="glass shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            {/* 전화 문의 */}
            <a
              href="tel:010-7933-9990"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--trust-500)] hover:bg-[var(--trust-600)] text-white font-semibold rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>전화 문의</span>
            </a>

            {/* 오시는 길 */}
            <button
              onClick={scrollToLocation}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span>오시는 길</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
