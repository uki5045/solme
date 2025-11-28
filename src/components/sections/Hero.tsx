"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  startAnimation?: boolean;
}

export default function Hero({ startAnimation = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLDivElement>(null);
  const titleLine2Ref = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const hashtagsRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
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
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", checkReducedMotion);

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", checkReducedMotion);
    };
  }, []);

  // Initial entrance animation
  useEffect(() => {
    if (!startAnimation) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set([badgeRef.current, titleLine1Ref.current, titleLine2Ref.current, hashtagsRef.current], {
        autoAlpha: 0,
        y: 40,
      });

      tl.to(badgeRef.current, { autoAlpha: 1, y: 0, duration: 1 })
        .to(titleLine1Ref.current, { autoAlpha: 1, y: 0, duration: 1 }, "-=0.6")
        .to(titleLine2Ref.current, { autoAlpha: 1, y: 0, duration: 1 }, "-=0.6")
        .to(hashtagsRef.current, { autoAlpha: 1, y: 0, duration: 1 }, "-=0.6");
    }, sectionRef);

    return () => ctx.revert();
  }, [startAnimation]);

  // Cinematic scroll animation
  useEffect(() => {
    if (!startAnimation || prefersReducedMotion) return;

    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const scaleEnd = isMobile ? 0.9 : 0.85;

    const ctx = gsap.context(() => {
      // Parallax background
      gsap.to(bgRef.current, {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller: mainElement,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // Content scale down and fade
      gsap.fromTo(
        containerRef.current,
        { scale: 1, opacity: 1, filter: "blur(0px)" },
        {
          scale: scaleEnd,
          opacity: 0,
          filter: "blur(8px)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: mainElement,
            start: "top top",
            end: "80% top",
            scrub: 1.5,
          },
        }
      );

      // Glow effect animation
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          scroller: mainElement,
          start: "top top",
          end: "50% top",
          scrub: 2,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [startAnimation, isMobile, prefersReducedMotion]);

  const hashtags = ["매입", "판매", "위탁", "수리", "업그레이드"];

  return (
    <section
      ref={sectionRef}
      className="snap-section relative flex items-center justify-center overflow-x-clip overflow-y-visible bg-black"
    >
      {/* Ambient Glow Effect */}
      <div
        ref={glowRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[60%] opacity-40 pointer-events-none gpu-accelerated"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(0, 113, 227, 0.3) 0%, transparent 60%)",
        }}
      />

      {/* Background Image + Overlay */}
      <div ref={bgRef} className="absolute inset-x-0 -top-[250px] bottom-0 overflow-hidden parallax-bg gpu-accelerated">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ backgroundImage: "url('/images/hero2.jpg')" }}
        />
        {/* 상단 그라데이션 */}

        {/* 하단 그라데이션 */}
        <div
          className="absolute inset-x-0 -bottom-[50px] h-[80vh]"
          style={{
            background: 'linear-gradient(to top, black 0%, black 15%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.05) 85%, transparent 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto gpu-accelerated"
        style={{ filter: "blur(0px)" }}
      >
        {/* Badge */}
        <div ref={badgeRef} className="invisible mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--trust-400)] animate-pulse" />
            국토부 정식 허가 업체
          </span>
        </div>

        {/* Main Title */}
        <h1 className="mb-10">
          <div
            ref={titleLine1Ref}
            className="invisible text-[clamp(26px,6vw,56px)] font-light text-white/90 leading-tight tracking-tight"
          >
            캠핑의 시작과 끝,
          </div>
          <div
            ref={titleLine2Ref}
            className="invisible text-[clamp(27px,7vw,64px)] font-bold text-white leading-tight tracking-tight mt-2"
          >
            <span className="glow-text">쏠마린 캠핑카</span>가 함께합니다.
          </div>
        </h1>

        {/* Hashtags */}
        <div ref={hashtagsRef} className="invisible flex flex-wrap justify-center gap-4">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="text-base md:text-lg text-white/60 hover:text-white/90 transition-colors cursor-default"
            >
              <span className="text-[var(--accent-400)]">#</span>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-white/40 tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-white/80 animate-bounce-slow" />
        </div>
      </div>
    </section>
  );
}
