"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, Shield, Banknote, Wrench } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const solutionCards = [
  {
    icon: Shield,
    title: "국토부 정식 허가 업체",
    description:
      "매매업과 정비업 모두 정식 등록된 업체로\n안전하게 거래하실 수 있습니다.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Banknote,
    title: "대형 캐피탈 제휴",
    description:
      "국내 메이저 금융사와의 공식 제휴로 고객님께 맞는 최저 금리를 투명하게 적용해 드립니다.",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    icon: Wrench,
    title: "전문 정비 시스템",
    description:
      "캠핑카 구매 후 2개월 무상 AS 제공하며,\n출고 전 점검부터 AS, 업그레이드까지 직접 꼼꼼하게 작업합니다.",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
];

function SolutionTitle() {
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
      {/* Success Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 113, 227, 0.3) 0%, transparent 50%)",
        }}
      />

      <div ref={titleRef} className="relative z-10 text-center px-6 cinematic-title gpu-accelerated">
        <div className="inline-flex items-center gap-3 mb-6 text-[var(--accent-400)]">
          <CheckCircle2 className="w-6 h-6" />
          <span className="text-sm font-medium tracking-wider uppercase">Solution</span>
        </div>
        <h2 className="text-[clamp(28px,5vw,48px)] leading-tight">
          <span className="font-light text-white/80">중고 캠핑카 구매</span>
          <br />
          <span className="font-bold">
            결국 <span className="glow-text">쏠마린</span>이 정답입니다.
          </span>
        </h2>
      </div>
    </section>
  );
}

function SolutionCard({ card, index }: { card: typeof solutionCards[0]; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const Icon = card.icon;

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
      // Icon animation
      gsap.fromTo(
        iconRef.current,
        {
          scale: 0,
          rotation: -180,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: mainElement,
            start: "top center",
            end: "40% center",
            scrub: 1,
          },
        }
      );

      // Content reveal
      gsap.fromTo(
        contentRef.current,
        {
          y: 80,
          opacity: 0,
          filter: "blur(10px)",
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
      {/* Gradient accent line */}
      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--accent-500)] to-transparent opacity-50" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Icon */}
          <div
            ref={iconRef}
            className={`shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${card.gradient} flex items-center justify-center glass-card gpu-accelerated`}
          >
            <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={1.5} />
          </div>

          {/* Content */}
          <div ref={contentRef} className="text-center md:text-left gpu-accelerated">
            <h3 className="text-[clamp(28px,4vw,40px)] font-bold text-white mb-4 leading-snug">
              {card.title}
            </h3>
            <p className="text-lg md:text-xl text-white/60 whitespace-pre-line leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Solution() {
  return (
    <div className="relative">
      <SolutionTitle />
      {solutionCards.map((card, index) => (
        <SolutionCard key={index} card={card} index={index} />
      ))}
    </div>
  );
}
