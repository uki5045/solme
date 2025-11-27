"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  IconMessageCircle,
  IconCar,
  IconFileText,
  IconTool,
  IconConfetti,
} from "@tabler/icons-react";

const steps = [
  {
    step: 1,
    title: "상담",
    description: "전화 또는 방문 상담으로\n원하시는 차량 조건을 말씀해 주세요.",
    Icon: IconMessageCircle,
  },
  {
    step: 2,
    title: "차량 선택",
    description: "재고 차량 중 조건에 맞는\n차량을 직접 확인하고 선택하세요.",
    Icon: IconCar,
  },
  {
    step: 3,
    title: "계약",
    description: "투명한 가격과 조건으로\n정식 계약서를 작성합니다.",
    Icon: IconFileText,
  },
  {
    step: 4,
    title: "출고 전 점검",
    description: "자체 정비소에서\n꼼꼼한 점검과 정비를 진행합니다.",
    Icon: IconTool,
  },
  {
    step: 5,
    title: "출고",
    description: "2개월 무상 AS와 함께\n새로운 캠핑 라이프를 시작하세요!",
    Icon: IconConfetti,
  },
];

function ProcessStep({ item, index, isLast, isFirst }: { item: typeof steps[0]; index: number; isLast: boolean; isFirst: boolean }) {
  const { Icon } = item;
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

    // 첫번째 스텝: 도착 시 아이콘만 활성화, 라인 없음
    if (isFirst) {
      // 섹션이 화면에 도착하면 아이콘 활성화
      const isActive = rect.top <= viewportHeight * 0.5;
      setIconActive(isActive);

      // 아래쪽 라인: 섹션이 위로 스크롤되기 시작하면 라인이 내려감
      // rect.top이 0보다 작아지면 스크롤이 시작된 것
      const bottomStart = 0;
      const bottomEnd = -viewportHeight;
      const bottomProgress = (bottomStart - rect.top) / (bottomStart - bottomEnd);
      setBottomLineProgress(Math.max(0, Math.min(1, bottomProgress)));
    } else {
      // 2번째 스텝 이후: 이전 스텝의 라인이 끝나는 시점부터 이어서 내려옴
      // 이전 스텝의 bottomLine: rect.top이 0 → -viewportHeight 일 때 0% → 100%
      // 현재 스텝이 viewportHeight 아래에 있을 때, 이전 스텝은 0 위치에 있음
      // 현재 스텝이 0에 도착하면, 이전 스텝은 -viewportHeight에 있음 (bottomLine 100%)

      // topLine은 이전 스텝의 bottomLine이 거의 끝날 때 시작
      // 이전 스텝 bottomLine 80% = 이전 섹션 rect.top이 -viewportHeight * 0.8
      // 그때 현재 섹션 rect.top = viewportHeight * 0.2
      const topStart = viewportHeight * 0.15; // 이전 스텝 bottomLine이 거의 끝날 때
      const topEnd = 0; // 섹션이 화면 상단에 도착할 때 라인이 아이콘까지 완료

      const rawProgress = (topStart - rect.top) / (topStart - topEnd);
      const topProgress = Math.max(0, Math.min(1, rawProgress));
      setTopLineProgress(topProgress);

      // 아이콘 활성화: 위쪽 라인이 100% 채워지면 (라인이 아이콘에 도달)
      setIconActive(topProgress >= 1);

      // 아래쪽 라인: 아이콘이 활성화된 후 시작
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

  return (
    <section
      id={`process-step-${index}`}
      className="snap-section h-screen flex items-center relative overflow-hidden bg-[var(--navy-900)]"
    >
      <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 md:ml-[-320px] top-0 bottom-0 flex flex-col items-center">
        {/* 위쪽 선 - 섹션 상단부터 아이콘까지 (위에서 아래로 내려옴) */}
        <div className="relative w-[2px] h-[calc(50vh-28px)]">
          {!isFirst && (
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[var(--trust-400)] to-[var(--trust-500)]"
              style={{ height: `${topLineProgress * 100}%` }}
            />
          )}
        </div>

        {/* 아이콘 */}
        <div
          className={`w-14 h-14 rounded-full bg-[var(--navy-900)] border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${iconActive
              ? "border-[var(--trust-500)] shadow-lg shadow-[var(--trust-500)]/30"
              : "border-white/20"
            }`}
        >
          <Icon
            className={`w-7 h-7 transition-colors duration-300 ${iconActive ? "text-[var(--trust-400)]" : "text-white/30"
              }`}
            stroke={1.5}
          />
        </div>

        {/* 아래쪽 선 - 아이콘부터 섹션 하단까지 */}
        <div className="relative w-[2px] h-[calc(50vh-28px)]">
          {!isLast && (
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[var(--trust-500)] to-[var(--trust-400)]"
              style={{ height: `${bottomLineProgress * 100}%` }}
            />
          )}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        <div className="ml-20 md:ml-20">

          {/* 오른쪽: 콘텐츠 */}
          <div className="flex-1 flex flex-col justify-center">
            {/* 스텝 번호 */}
            <motion.div
              className="text-sm mb-3 font-semibold text-[var(--trust-400)] font-['Montserrat']"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              STEP {item.step}
            </motion.div>
            {/* 타이틀 */}
            <motion.h3
              className="text-[30px] md:text-[36px] font-bold text-white mb-4 leading-snug"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {item.title}
            </motion.h3>
            {/* 설명 */}
            <motion.p
              className="text-[18px] md:text-[20px] text-white/70 whitespace-pre-line leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {item.description}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Process() {
  return (
    <>
      {/* 타이틀 섹션 */}
      <section className="snap-section h-screen flex items-center justify-center relative overflow-hidden bg-[var(--navy-900)]">
        <div className="relative z-10 text-center px-6">
          <motion.h2
            className="text-[33px] md:text-[40px] leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="font-light">쏠마린과 함께하는</span>
            <br />
            <span className="font-bold">캠핑카 구매 여정</span>
          </motion.h2>
        </div>
      </section>

      {/* 스텝 섹션들 */}
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
