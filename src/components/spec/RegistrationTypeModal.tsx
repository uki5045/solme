'use client';

import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon, PencilSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface RegistrationTypeModalProps {
  show: boolean;
  onClose: () => void;
  onManual: () => void;
  onAuto: () => void;
}

export default function RegistrationTypeModal({
  show,
  onClose,
  onManual,
  onAuto,
}: RegistrationTypeModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1c1f26]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                등록 방식 선택
              </h2>
              <button
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* 버튼 옵션 */}
            <div className="flex flex-col gap-3 p-5">
              {/* 자동 등록 */}
              <button
                onClick={() => {
                  onClose();
                  onAuto();
                }}
                className="group flex items-center gap-4 rounded-xl border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white p-4 text-left transition-all hover:border-accent-400 hover:shadow-lg hover:shadow-accent-500/10 active:scale-[0.98] dark:border-emerald-700 dark:from-emerald-900/30 dark:to-[#1c1f26] dark:hover:border-emerald-500"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/30 dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-400/30">
                  <MagnifyingGlassIcon className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white">자동 등록</span>
                    <span className="rounded-md bg-accent-100 px-1.5 py-0.5 text-xs font-semibold text-accent-600 dark:bg-emerald-900/50 dark:text-emerald-400">추천</span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    차량번호로 정보 자동 조회
                  </p>
                </div>
              </button>

              {/* 수동 등록 */}
              <button
                onClick={() => {
                  onClose();
                  onManual();
                }}
                className="group flex items-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-[#1c1f26] dark:hover:border-gray-600 dark:hover:bg-[#252930]"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <PencilSquareIcon className="size-6" />
                </div>
                <div className="flex-1">
                  <span className="text-base font-bold text-gray-900 dark:text-white">수동 등록</span>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    직접 정보 입력
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
