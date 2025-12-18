'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/16/solid';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function Toast({ show, message, type }: ToastProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 25,
            mass: 0.8
          }}
          className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+1rem)] z-50 -translate-x-1/2 lg:hidden"
        >
          <div className={`
            flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg
            ${type === 'success'
              ? 'bg-gray-900 text-white shadow-gray-900/30 dark:bg-gray-100 dark:text-gray-900 dark:shadow-white/20'
              : type === 'error'
              ? 'bg-red-600 text-white shadow-red-600/40'
              : 'bg-amber-500 text-white shadow-amber-500/40'
            }
          `}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                type === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              {type === 'success' && (
                <CheckIcon className="size-3" />
              )}
              {type === 'error' && (
                <XMarkIcon className="size-3" />
              )}
              {type === 'warning' && (
                <ExclamationTriangleIcon className="size-3" />
              )}
            </motion.div>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
