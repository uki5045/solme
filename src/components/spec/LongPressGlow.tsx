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
          className="pointer-events-none fixed inset-0 z-[100]"
          style={{
            boxShadow: `
              inset 0 0 20px rgba(0, 113, 227, 0.6),
              inset 0 0 40px rgba(0, 113, 227, 0.3),
              inset 0 0 60px rgba(0, 113, 227, 0.1)
            `,
          }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
