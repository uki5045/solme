'use client';

import { motion, AnimatePresence } from 'motion/react';

interface LongPressGlowProps {
  isActive: boolean;
}

/**
 * 롱프레스 시 화면 전체 테두리에 Apple Intelligence 스타일 무지개 글로우
 * pointer-events: none으로 터치 이벤트 방해하지 않음
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
          aria-hidden="true"
        >
          {/* 무지개 그라데이션 테두리 */}
          <div
            className="absolute inset-0 animate-rainbow-glow"
            style={{
              background: `
                linear-gradient(90deg,
                  rgba(255,0,128,0.6) 0%,
                  rgba(255,128,0,0.6) 14%,
                  rgba(255,255,0,0.6) 28%,
                  rgba(0,255,128,0.6) 42%,
                  rgba(0,128,255,0.6) 57%,
                  rgba(128,0,255,0.6) 71%,
                  rgba(255,0,128,0.6) 85%,
                  rgba(255,128,0,0.6) 100%
                )
              `,
              backgroundSize: '200% 100%',
              WebkitMask: `
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0)
              `,
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '3px',
              borderRadius: '0',
            }}
          />
          {/* 내부 블러 글로우 */}
          <div
            className="absolute inset-[3px] animate-rainbow-glow"
            style={{
              boxShadow: `
                inset 0 0 30px rgba(255,0,128,0.3),
                inset 0 0 60px rgba(0,128,255,0.2),
                inset 0 0 90px rgba(128,0,255,0.1)
              `,
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
