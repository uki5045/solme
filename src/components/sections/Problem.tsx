"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AlertTriangle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const problemCards = [
  {
    number: "01",
    titleLight: "지금 보시는 그 업체,",
    titleBold: "매매업 허가 업체인가요?",
    description:
      "무등록 업체에서 캠핑카 구매 시\n법적 보호를 받을 수 없습니다.",
  },
  {
    number: "02",
    titleLight: "할부 금리와 조건,",
    titleBold: "꼼꼼히 확인해보셨나요?",
    description:
      "정식 제휴된 업체만 '초 저금리 할부'\n혜택을 제공할 수 있습니다.",
  },
  {
    number: "03",
    titleLight: "캠핑카 구매 후 AS,",
    titleBold: "확실하게 보장되나요?",
    description:
      "캠핑카 구매 후 AS를 항상 미루는 업체,\n그 피해자가 나일 수 있습니다.",
  },
];

function ProblemTitle() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };

    checkMobile();
    checkReducedMotion();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const scaleStart = isMobile ? 2.5 : 4;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        {
          scale: scaleStart,
          opacity: 0,
          filter: "blur(12px)",
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
            scrub: 1.5,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="snap-section flex items-center justify-center relative bg-black overflow-hidden"
    >
      {/* 상단 그라데이션 - Hero와 연결 */}
      <div
        className="absolute inset-x-0 top-0 h-[30vh] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />

      {/* Danger Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(255, 59, 48, 0.3) 0%, transparent 50%)",
        }}
      />

      <div ref={titleRef} className="relative z-10 text-center px-6 cinematic-title gpu-accelerated">
        <div className="inline-flex items-center gap-3 mb-6 text-[var(--danger-400)]">
          <AlertTriangle className="w-6 h-6" />
          <span className="text-sm font-medium tracking-wider uppercase">Check Point</span>
        </div>
        <h2 className="text-[clamp(28px,5vw,48px)] leading-tight">
          <span className="font-light text-white/80">중고 캠핑카</span>
          <br />
          <span className="font-bold danger-glow-text">
            정말 믿고 사도 될까요?
          </span>
        </h2>
      </div>
    </section>
  );
}

function ProblemCard({ card, index }: { card: typeof problemCards[0]; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
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
      // Number scale animation
      gsap.fromTo(
        numberRef.current,
        {
          scale: 3,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 0.1,
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

      // Content reveal
      gsap.fromTo(
        contentRef.current,
        {
          y: 60,
          opacity: 0,
          filter: "blur(8px)",
        },
        {
          y: 0,
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
  }, [index, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="snap-section flex items-center relative bg-black overflow-hidden"
    >
      {/* Large Background Number */}
      <div
        ref={numberRef}
        className="absolute right-[10%] top-1/2 -translate-y-1/2 text-[clamp(200px,40vw,400px)] font-bold text-white/5 select-none pointer-events-none gpu-accelerated"
        style={{ fontFamily: "var(--font-display, 'Montserrat')" }}
      >
        {card.number}
      </div>

      {/* Subtle danger line */}
      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--danger-500)] to-transparent opacity-50" />

      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12 gpu-accelerated"
      >
        <div className="glass-card p-8 md:p-12">
          <span className="text-[var(--danger-400)] text-sm font-medium tracking-wider mb-4 block">
            POINT {card.number}
          </span>
          <h3 className="text-[clamp(22px,4vw,36px)] text-white mb-6 leading-snug">
            <span className="font-light">{card.titleLight}</span>
            <br />
            <span className="font-bold">{card.titleBold}</span>
          </h3>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed whitespace-pre-line">
            {card.description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Problem() {
  return (
    <div className="relative">
      <ProblemTitle />
      {problemCards.map((card, index) => (
        <ProblemCard key={index} card={card} index={index} />
      ))}
    </div>
  );
}
