'use client';

import { useRef, useCallback, useState } from 'react';

interface LongPressItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  updatedAt: string;
  status: 'intake' | 'productization' | 'advertising' | 'sold';
  isIncomplete: boolean;
  saleType: string;
}

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  item: LongPressItem | null;
}

interface UseLongPressOptions {
  delay?: number;
  moveThreshold?: number;
}

export function useLongPress<T extends LongPressItem>(
  setContextMenu: (state: ContextMenuState) => void,
  options: UseLongPressOptions = {}
) {
  const { delay = 500, moveThreshold = 10 } = options;

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTouchRef = useRef<{ x: number; y: number; item: T } | null>(null);
  const glowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 글로우 효과 상태 (프레스 시작 후 약간의 딜레이 후 표시)
  const [isPressing, setIsPressing] = useState(false);

  const clearAllTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (glowTimerRef.current) {
      clearTimeout(glowTimerRef.current);
      glowTimerRef.current = null;
    }
    setIsPressing(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, item: T) => {
    const touch = e.touches[0];
    longPressTouchRef.current = { x: touch.clientX, y: touch.clientY, item };

    // 글로우 효과: 150ms 후 표시 (너무 빠르면 탭과 구분 어려움)
    glowTimerRef.current = setTimeout(() => {
      setIsPressing(true);
    }, 150);

    // 컨텍스트 메뉴: delay(500ms) 후 표시
    longPressTimerRef.current = setTimeout(() => {
      if (longPressTouchRef.current) {
        setContextMenu({
          show: true,
          x: longPressTouchRef.current.x,
          y: longPressTouchRef.current.y,
          item: longPressTouchRef.current.item,
        });
      }
      // 메뉴가 열리면 글로우 종료
      setIsPressing(false);
    }, delay);
  }, [setContextMenu, delay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current && longPressTouchRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - longPressTouchRef.current.x);
      const deltaY = Math.abs(touch.clientY - longPressTouchRef.current.y);
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        clearAllTimers();
        longPressTouchRef.current = null;
      }
    }
  }, [moveThreshold, clearAllTimers]);

  const handleTouchEnd = useCallback(() => {
    clearAllTimers();
    longPressTouchRef.current = null;
  }, [clearAllTimers]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isPressing,
  };
}
