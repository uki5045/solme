'use client';

import { useRef, useCallback } from 'react';

interface LongPressItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  price: string;
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

  const handleTouchStart = useCallback((e: React.TouchEvent, item: T) => {
    const touch = e.touches[0];
    longPressTouchRef.current = { x: touch.clientX, y: touch.clientY, item };
    longPressTimerRef.current = setTimeout(() => {
      if (longPressTouchRef.current) {
        setContextMenu({
          show: true,
          x: longPressTouchRef.current.x,
          y: longPressTouchRef.current.y,
          item: longPressTouchRef.current.item,
        });
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
      }
    }
  }, [moveThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchRef.current = null;
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
