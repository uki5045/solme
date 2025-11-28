"use client";

import { useState, useCallback } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Process from "@/components/sections/Process";
import VehicleCTA from "@/components/sections/VehicleCTA";
import Location from "@/components/sections/Location";
import Footer from "@/components/sections/Footer";
import TopNavButtons from "@/components/ui/TopNavButtons";

export default function PageWrapper() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingComplete(true);
  }, []);

  return (
    <>
      <LoadingScreen onLoadingComplete={handleLoadingComplete} />

      {/* 상단 네비게이션 버튼 */}
      <TopNavButtons />

      {/* 상단 페이드 그라디언트 - 스크롤에 따라가는 오버레이 */}
      <div
        className="fixed top-0 left-0 right-0 h-24 pointer-events-none z-40"
        style={{
          background:
            "linear-gradient(to bottom, var(--navy-900) 0%, transparent 100%)",
        }}
      />

      <main className="h-screen overflow-y-auto snap-container">
        <Hero startAnimation={isLoadingComplete} />
        <Problem />
        <Solution />
        <Process />
        <VehicleCTA />
        <Location />
        <Footer />
      </main>
    </>
  );
}
