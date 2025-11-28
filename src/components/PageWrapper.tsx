"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Process from "@/components/sections/Process";
import VehicleCTA from "@/components/sections/VehicleCTA";
import ContactInfo from "@/components/sections/ContactInfo";
import MapSection from "@/components/sections/MapSection";
import Footer from "@/components/sections/Footer";
import TopNavButtons from "@/components/ui/TopNavButtons";

export default function PageWrapper() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingComplete(true);
  }, []);

  // Hero 섹션에서 위로 스크롤 방지
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const preventOverscroll = (e: WheelEvent) => {
      if (main.scrollTop <= 0 && e.deltaY < 0) {
        e.preventDefault();
      }
    };

    const preventTouchOverscroll = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startY = touch.clientY;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const currentY = moveEvent.touches[0].clientY;
        if (main.scrollTop <= 0 && currentY > startY) {
          moveEvent.preventDefault();
        }
      };

      main.addEventListener("touchmove", handleTouchMove, { passive: false });
      main.addEventListener("touchend", () => {
        main.removeEventListener("touchmove", handleTouchMove);
      }, { once: true });
    };

    main.addEventListener("wheel", preventOverscroll, { passive: false });
    main.addEventListener("touchstart", preventTouchOverscroll, { passive: true });

    return () => {
      main.removeEventListener("wheel", preventOverscroll);
      main.removeEventListener("touchstart", preventTouchOverscroll);
    };
  }, []);

  return (
    <>
      <LoadingScreen onLoadingComplete={handleLoadingComplete} />

      {/* 상단 네비게이션 버튼 */}
      <TopNavButtons />

      {/* 상단 페이드 그라디언트 */}
      <div
        className="fixed top-0 left-0 right-0 h-[200px] pointer-events-none z-40"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />

      <main ref={mainRef} className="h-screen overflow-y-auto snap-container">
        <Hero startAnimation={isLoadingComplete} />
        <Problem />
        <Solution />
        <Process />
        <VehicleCTA />
        <ContactInfo />
        <MapSection />
        <Footer />
      </main>
    </>
  );
}
