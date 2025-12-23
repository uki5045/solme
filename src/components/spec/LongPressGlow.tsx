'use client';

import { motion, AnimatePresence } from 'motion/react';

interface LongPressGlowProps {
  isActive: boolean;
}

/**
 * 롱프레스 시 화면 테두리에 단색 글로우 효과
 * - Safe Area Inset 적용으로 상태표시줄/주소창 영역 침범 방지
 * - pointer-events: none으로 터치 이벤트 방해하지 않음
 */
export default function LongPressGlow({ isActive }: LongPressGlowProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed z-[100]"
          style={{
            top: 'env(safe-area-inset-top, 0px)',
            right: 'env(safe-area-inset-right, 0px)',
            bottom: 'env(safe-area-inset-bottom, 0px)',
            left: 'env(safe-area-inset-left, 0px)',
            boxShadow: `
              inset 0 0 40px rgba(0, 113, 227, 0.5),
              inset 0 0 80px rgba(0, 113, 227, 0.3),
              inset 0 0 120px rgba(0, 113, 227, 0.15)
            `,
          }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
