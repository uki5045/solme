"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLDivElement>(null);
  const titleLine2Ref = useRef<HTMLDivElement>(null);
  const hashtagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          titleLine1Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          titleLine2Ref.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          hashtagsRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const hashtags = ["매입", "판매", "위탁", "수리", "업그레이드"];

  return (
    <section
      ref={sectionRef}
      className="snap-section relative h-screen flex items-center justify-center overflow-hidden bg-[var(--navy-900)]"
    >
      {/* 배경 이미지 + 오버레이 */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-900)]/70 via-[var(--navy-900)]/50 to-[var(--navy-900)]" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 text-left px-6 max-w-4xl mx-auto -mt-20">
        {/* 뱃지 */}
        <div ref={badgeRef} className="opacity-0 mb-6">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/90">
            매매업 ・ 정비업 허가 업체
          </span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="mb-8">
          <div
            ref={titleLine1Ref}
            className="opacity-0 text-[42px] md:text-[40px] font-light text-white leading-tight"
          >
            캠핑의 시작과 끝,
          </div>
          <div
            ref={titleLine2Ref}
            className="opacity-0 text-[20px] md:text-[40px] font-bold text-white leading-tight mt-4"
          >
            쏠마린 캠핑카가 함께합니다.
          </div>
        </h1>

        {/* 해시태그 */}
        <div ref={hashtagsRef} className="opacity-0 flex flex-wrap justify-start gap-3">
          {hashtags.map((tag) => (
            <span key={tag} className="text-base md:text-lg text-white/80">
              <span className="text-[var(--trust-500)]">#</span>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 스크롤 유도 */}
      <div className="absolute bottom-55 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <ChevronDown className="w-8 h-8 text-white/50" />
      </div>
    </section>
  );
}
