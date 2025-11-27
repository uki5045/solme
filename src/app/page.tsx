import GSAPProvider from "@/components/animations/GSAPProvider";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Process from "@/components/sections/Process";
import VehicleCTA from "@/components/sections/VehicleCTA";
import Location from "@/components/sections/Location";
import Footer from "@/components/sections/Footer";
import FloatingCTA from "@/components/ui/FloatingCTA";

export default function Home() {
  return (
    <GSAPProvider>
      {/* 모바일 상태표시줄 영역 그라디언트 오버레이 */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gradient-to-b from-[var(--navy-900)] to-transparent z-50 pointer-events-none md:hidden" />

      <main className="h-screen overflow-y-auto snap-container">
        <Hero />
        <Problem />
        <Solution />
        <Process />
        <VehicleCTA />
        <Location />
        <Footer />
        <FloatingCTA />
      </main>
    </GSAPProvider>
  );
}
