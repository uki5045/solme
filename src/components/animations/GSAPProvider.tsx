"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GSAPProviderProps {
  children: ReactNode;
}

export default function GSAPProvider({ children }: GSAPProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // iOS Safari 주소창 resize 무시 설정
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    // main 요소를 스크롤 컨테이너로 설정
    const mainElement = document.querySelector("main");

    if (mainElement) {
      ScrollTrigger.defaults({
        scroller: mainElement,
      });

      // ScrollTrigger 새로고침
      ScrollTrigger.refresh();
    }

    // 새로고침 시 스크롤 위치 초기화
    if (typeof window !== "undefined" && history.scrollRestoration) {
      history.scrollRestoration = "manual";
    }

    // 리사이즈 시 ScrollTrigger 새로고침 (debounced)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    // 클린업
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
