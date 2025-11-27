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

    // main 요소를 스크롤 컨테이너로 설정
    const mainElement = document.querySelector("main");

    if (mainElement) {
      ScrollTrigger.defaults({
        scroller: mainElement,
      });

      // ScrollTrigger 새로고침
      ScrollTrigger.refresh();
    }

    // ScrollTrigger 설정
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    // 새로고침 시 스크롤 위치 초기화
    if (typeof window !== "undefined" && history.scrollRestoration) {
      history.scrollRestoration = "manual";
    }

    // 클린업
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
