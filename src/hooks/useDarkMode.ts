'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseDarkModeReturn {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface UseDarkModeOptions {
  /** 다크모드 배경색 (기본: #121418) */
  darkBgColor?: string;
  /** 라이트모드 배경색 (기본: #f3f4f6) */
  lightBgColor?: string;
  /** 페이지 떠날 때 복원할 배경색 (기본: #111111) */
  defaultBgColor?: string;
}

// 초기 다크모드 상태 계산 (SSR 안전)
function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode(options: UseDarkModeOptions = {}): UseDarkModeReturn {
  const {
    darkBgColor = '#121418',
    lightBgColor = '#f3f4f6',
    defaultBgColor = '#111111',
  } = options;

  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  // 초기 DOM 동기화 + 시스템 설정 변경 감지
  useEffect(() => {
    // DOM 클래스 초기 동기화
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 시스템 설정 변경 리스너
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [isDarkMode]);

  // Safari 배경색 및 theme-color 동적 수정
  useEffect(() => {
    const bgColor = isDarkMode ? darkBgColor : lightBgColor;

    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;

    // iOS Safari 상단/하단 바 색상
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', bgColor);

    return () => {
      document.documentElement.style.backgroundColor = defaultBgColor;
      document.body.style.backgroundColor = defaultBgColor;
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', defaultBgColor);
      }
    };
  }, [isDarkMode, darkBgColor, lightBgColor, defaultBgColor]);

  // 토글 함수
  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.add('no-transitions');

    setIsDarkMode(prev => {
      const newDarkMode = !prev;
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transitions');
      });

      return newDarkMode;
    });
  }, []);

  return { isDarkMode, toggleDarkMode };
}
