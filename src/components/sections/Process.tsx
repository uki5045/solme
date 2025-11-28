"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageCircle,
  Car,
  FileText,
  Settings,
  PartyPopper,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: 1,
    title: "상담",
    description: "전화 또는 방문 상담으로\n원하시는 차량 조건을 말씀해 주세요.",
    Icon: MessageCircle,
  },
  {
    step: 2,
    title: "차량 선택",
    description: "재고 차량 중 조건에 맞는\n차량을 직접 확인하고 선택하세요.",
    Icon: Car,
  },
  {
    step: 3,
    title: "계약",
    description: "투명한 가격과 조건으로\n정식 계약서를 작성합니다.",
    Icon: FileText,
  },
  {
    step: 4,
    title: "출고 전 점검",
    description: "자체 정비소에서\n꼼꼼한 점검과 정비를 진행합니다.",
    Icon: Settings,
  },
  {
    step: 5,
    title: "출고",
    description: "2개월 무상 AS와 함께\n새로운 캠핑 라이프를 시작하세요!",
    Icon: PartyPopper,
  },
];

function ProcessTitle() {
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
      className="snap-section flex items-center justify-center relative overflow-hidden bg-black"
    >
      {/* Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 113, 227, 0.4) 0%, transparent 50%)",
        }}
      />

      <div ref={titleRef} className="relative z-10 text-center px-6 cinematic-title gpu-accelerated">
        <span className="text-[var(--accent-400)] text-sm font-medium tracking-wider uppercase mb-4 block">
          Process
        </span>
        <h2 className="text-[clamp(28px,5vw,48px)] leading-tight">
          <span className="font-light text-white/80">캠핑의 시작</span>
          <br />
          <span className="font-bold text-white">쏠마린이 함께합니다!</span>
        </h2>
      </div>
    </section>
  );
}

function ProcessStep({ item, index, isLast, isFirst }: { item: typeof steps[0]; index: number; isLast: boolean; isFirst: boolean }) {
  const { Icon } = item;
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [topLineProgress, setTopLineProgress] = useState(0);
  const [bottomLineProgress, setBottomLineProgress] = useState(0);
  const [iconActive, setIconActive] = useState(false);

  const updateProgress = useCallback(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const viewportHeight = window.innerHeight;
    const sectionElement = document.getElementById(`process-step-${index}`);
    if (!sectionElement) return;

    const rect = sectionElement.getBoundingClientRect();

    if (isFirst) {
      const isActive = rect.top <= viewportHeight * 0.5;
      setIconActive(isActive);

      const bottomStart = 0;
      const bottomEnd = -viewportHeight;
      const bottomProgress = (bottomStart - rect.top) / (bottomStart - bottomEnd);
      setBottomLineProgress(Math.max(0, Math.min(1, bottomProgress)));
    } else {
      const topStart = viewportHeight * 0.15;
      const topEnd = 0;

      const rawProgress = (topStart - rect.top) / (topStart - topEnd);
      const topProgress = Math.max(0, Math.min(1, rawProgress));
      setTopLineProgress(topProgress);

      setIconActive(topProgress >= 1);

      if (topProgress >= 1) {
        const bottomStart = -viewportHeight * 0.5;
        const bottomEnd = -viewportHeight * 1.5;
        const bottomRaw = (bottomStart - rect.top) / (bottomStart - bottomEnd);
        setBottomLineProgress(Math.max(0, Math.min(1, bottomRaw)));
      } else {
        setBottomLineProgress(0);
      }
    }
  }, [index, isFirst]);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    updateProgress();
    mainElement.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      mainElement.removeEventListener("scroll", updateProgress);
    };
  }, [updateProgress]);

  // GSAP animation for content
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          x: -50,
          opacity: 0,
          filter: "blur(8px)",
        },
        {
          x: 0,
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
  }, []);

  return (
    <section
      id={`process-step-${index}`}
      ref={sectionRef}
      className="snap-section flex items-center relative overflow-x-clip overflow-y-visible bg-black"
    >
      {/* Timeline */}
      <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 md:ml-[-320px] top-0 bottom-0 flex flex-col items-center">
        {/* Top line */}
        <div className="relative h-[calc(50dvh-32px)] flex items-center justify-center">
          {!isFirst && topLineProgress > 0 && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[var(--accent-400)] to-[var(--accent-500)]"
              style={{
                height: `${topLineProgress * 100}%`,
                boxShadow: '0 0 12px 4px rgba(41, 151, 255, 0.5), 0 0 24px 8px rgba(41, 151, 255, 0.3)'
              }}
            />
          )}
        </div>

        {/* Icon */}
        <div
          className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${iconActive
            ? "bg-gradient-to-b from-[#3ba0ff] to-[var(--accent-500)] animate-glow-pop"
            : "bg-white/5 border border-white/10 transition-all duration-500"
            }`}
          style={iconActive ? {
            '--tw-shadow': '0 0 20px 8px rgba(41, 151, 255, 0.6), 0 0 40px 16px rgba(41, 151, 255, 0.3), 0 0 60px 24px rgba(41, 151, 255, 0.15)'
          } as React.CSSProperties : {}}
        >
          {/* 반사 효과 - 상단 하이라이트 */}
          {iconActive && (
            <>
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 30%, transparent 50%)'
                }}
              />
              {/* Shimmer 효과 */}
              <div
                className="absolute inset-0 rounded-2xl animate-shimmer-once"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </>
          )}
          <Icon
            className={`w-7 h-7 transition-colors duration-300 relative z-10 ${iconActive ? "text-white drop-shadow-lg" : "text-white/30"
              }`}
            strokeWidth={1.5}
          />
        </div>

        {/* Bottom line */}
        <div className="relative h-[calc(50dvh-32px)] flex items-center justify-center">
          {!isLast && bottomLineProgress > 0 && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[var(--accent-500)] to-[var(--accent-400)]"
              style={{
                height: `${bottomLineProgress * 100}%`,
                boxShadow: '0 0 12px 4px rgba(41, 151, 255, 0.5), 0 0 24px 8px rgba(41, 151, 255, 0.3)'
              }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        <div ref={contentRef} className="ml-24 md:ml-24 gpu-accelerated">
          <span
            className="text-[var(--accent-400)] text-sm font-bold tracking-wider mb-3 block"
            style={{ fontFamily: "var(--font-display, 'Montserrat')" }}
          >
            STEP {String(item.step).padStart(2, '0')}
          </span>
          <h3 className="text-[clamp(28px,5vw,40px)] font-bold text-white mb-4 leading-snug">
            {item.title}
          </h3>
          <p className="text-lg md:text-xl text-white/60 whitespace-pre-line leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Process() {
  return (
    <>
      <ProcessTitle />
      {steps.map((item, index) => (
        <ProcessStep
          key={item.step}
          item={item}
          index={index}
          isFirst={index === 0}
          isLast={index === steps.length - 1}
        />
      ))}
    </>
  );
}
