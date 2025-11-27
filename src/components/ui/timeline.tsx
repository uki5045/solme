"use client";

import { motion } from "motion/react";
import React, { useEffect, useRef, useState, useCallback } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [opacity, setOpacity] = useState(0);

  const updateProgress = useCallback(() => {
    const mainElement = document.querySelector("main");
    const container = containerRef.current;
    if (!mainElement || !container) return;

    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // 시작점: 컨테이너 상단이 화면 중앙에 올 때 시작
    // 끝점: 컨테이너 하단이 화면 중앙에 올 때 완료
    const viewportCenter = viewportHeight * 0.5;

    // 컨테이너 상단이 화면 중앙보다 위에 있으면 진행 시작
    const distanceFromStart = viewportCenter - containerRect.top;
    const totalDistance = containerRect.height;

    // 진행도 계산 (0 ~ 1)
    const progress = distanceFromStart / totalDistance;
    const clampedProgress = Math.max(0, Math.min(1, progress));

    setLineHeight(clampedProgress * containerRect.height);
    setOpacity(clampedProgress > 0.02 ? 1 : clampedProgress * 50);
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    // 초기 상태 설정
    updateProgress();

    // 스크롤 이벤트 리스너
    mainElement.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      mainElement.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  return (
    <div className="w-full font-sans" ref={containerRef}>
      <div className="relative max-w-4xl mx-auto">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex gap-6 md:gap-10 pb-10 last:pb-0"
          >
            {/* 왼쪽: 아이콘 */}
            <div className="flex-shrink-0 relative">
              <div className="w-12 h-12 rounded-full bg-[var(--navy-800)] border-2 border-[var(--trust-500)] flex items-center justify-center shadow-lg shadow-[var(--trust-500)]/20 relative z-10">
                {item.icon || (
                  <div className="h-4 w-4 rounded-full bg-[var(--trust-500)]" />
                )}
              </div>
            </div>

            {/* 오른쪽: 콘텐츠 */}
            <div className="flex-1 pt-1">
              {/* 스텝 번호 */}
              <div className="text-sm mb-2 font-semibold text-[var(--trust-400)] font-['Montserrat']">
                STEP {index + 1}
              </div>
              {/* 타이틀 */}
              <h3 className="text-xl md:text-2xl mb-3 font-bold text-white">
                {item.title}
              </h3>
              {/* 내용 */}
              <div className="text-white/60 text-base leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        ))}

        {/* 타임라인 선 - 배경 (회색) */}
        <div
          className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-white/10"
          style={{ zIndex: 0 }}
        />

        {/* 타임라인 선 - 진행 (컬러 그라데이션) */}
        <motion.div
          className="absolute left-[23px] top-0 w-[2px] rounded-full"
          style={{
            height: lineHeight,
            opacity: opacity,
            background: "linear-gradient(to bottom, var(--trust-400), var(--trust-500), var(--trust-600))",
            zIndex: 1,
          }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </div>
  );
};
