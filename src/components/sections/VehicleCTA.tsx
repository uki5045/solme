"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function VehicleCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };
    checkReducedMotion();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          scale: 1.5,
          opacity: 0,
          filter: "blur(8px)",
        },
        {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: mainElement,
            start: "top center",
            end: "center center",
            scrub: 1.2,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="snap-section flex items-center justify-center relative overflow-hidden bg-black"
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 113, 227, 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-500)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div
        ref={contentRef}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center gpu-accelerated"
      >
        <span className="text-[var(--accent-400)] text-sm font-medium tracking-wider uppercase mb-6 block">
          Read More
        </span>

        <h2 className="text-[clamp(28px,5vw,48px)] font-bold text-white mb-6 leading-tight">
          쏠마린 카페에서
          <br />
          <span className="glow-text">매물을 확인해보세요</span>
        </h2>

        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto">
          투명한 가격과 상세한 정보를 제공합니다.
        </p>

        <a
          href="https://m.cafe.naver.com/ca-fe/web/cafes/30842004/menus/94"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 btn-premium animate-wiggle hover:animate-none"
        >
          판매 차량 보러가기
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </a>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/40">
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            네이버 카페
          </span>
          <span>상세 옵션 내역</span>
          <span>실사진 제공</span>
        </div>
      </div>
    </section>
  );
}
