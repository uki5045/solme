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
      <main className="h-screen overflow-y-auto snap-y snap-mandatory">
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
