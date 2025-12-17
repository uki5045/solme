'use client';

import { useEffect, RefObject } from 'react';

/**
 * 외부 클릭 감지 훅
 * @param ref - 감지할 요소의 ref (null이면 모든 클릭에서 콜백 실행)
 * @param callback - 외부 클릭 시 실행할 함수
 * @param isActive - 활성화 여부
 * @param eventType - 이벤트 타입 ('mousedown' | 'click')
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null> | null,
  callback: () => void,
  isActive: boolean,
  eventType: 'mousedown' | 'click' = 'mousedown'
) {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (e: MouseEvent) => {
      // ref가 없으면 모든 클릭에서 콜백 실행
      if (!ref) {
        callback();
        return;
      }
      // ref가 있으면 외부 클릭만 콜백 실행
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener(eventType, handleClickOutside);
    return () => document.removeEventListener(eventType, handleClickOutside);
  }, [ref, callback, isActive, eventType]);
}
