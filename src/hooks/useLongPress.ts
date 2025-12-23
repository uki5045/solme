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

  // 시각적 피드백용 상태
  const [pressingItemId, setPressingItemId] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, item: T) => {
    const touch = e.touches[0];
    longPressTouchRef.current = { x: touch.clientX, y: touch.clientY, item };

    // 누르기 시작 시 시각적 피드백
    setPressingItemId(item.id);

    longPressTimerRef.current = setTimeout(() => {
      if (longPressTouchRef.current) {
        setContextMenu({
          show: true,
          x: longPressTouchRef.current.x,
          y: longPressTouchRef.current.y,
          item: longPressTouchRef.current.item,
        });
        // 컨텍스트 메뉴가 열리면 누르기 상태 해제
        setPressingItemId(null);
      }
    }, delay);
  }, [setContextMenu, delay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current && longPressTouchRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - longPressTouchRef.current.x);
      const deltaY = Math.abs(touch.clientY - longPressTouchRef.current.y);
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        longPressTouchRef.current = null;
        setPressingItemId(null);
      }
    }
  }, [moveThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchRef.current = null;
    setPressingItemId(null);
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pressingItemId,
  };
}
