'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { VehicleListItem, VehicleStatus } from './types';

interface SoldVehiclesViewProps {
  show: boolean;
  onClose: () => void;
  vehicleList: VehicleListItem[];
  onRequestStatusChange: (vehicleNumber: string, status: VehicleStatus) => void;
}

export default function SoldVehiclesView({
  show,
  onClose,
  vehicleList,
  onRequestStatusChange,
}: SoldVehiclesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    item: VehicleListItem | null;
  }>({ show: false, x: 0, y: 0, item: null });

  // 컨텍스트 메뉴 닫기 (외부 클릭 시)
  useClickOutside(null, () => setContextMenu({ show: false, x: 0, y: 0, item: null }), contextMenu.show, 'click');

  if (!show) return null;

  const soldList = vehicleList
    .filter(v => v.status === 'sold')
    .filter(v => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.modelName?.toLowerCase().includes(q) ||
        v.manufacturer?.toLowerCase().includes(q)
      );
    });

  const handleReregister = (vehicleNumber: string) => {
    onClose();
    setTimeout(() => {
      onRequestStatusChange(vehicleNumber, 'intake');
    }, 100);
  };

  return (
    <AnimatePresence>
      {/* absolute 기반 슬라이드-인 패널 (전체 화면 덮지 않음) */}
      <div className="pointer-events-none absolute right-0 top-0 z-50 flex h-full max-h-screen w-full max-w-md justify-end p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          className="pointer-events-auto flex h-fit max-h-[calc(100%-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-[#1c1f26] dark:ring-white/10"
        >
          {/* 헤더 */}
          <div className="shrink-0 border-b border-gray-200 bg-white dark:border-[#2a2f3a] dark:bg-[#1c1f26]">
            <div className="flex h-14 items-center justify-between px-4">
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">판매완료</h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>
          </div>

          {/* 검색바 */}
          <div className="shrink-0 p-4 pb-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="차량번호, 모델명으로 검색"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-[#363b47] dark:bg-[#1c1f26] dark:text-white dark:placeholder-gray-500 dark:focus:border-accent-400"
              />
            </div>
          </div>

          {/* 카드 목록 */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
          {soldList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                <CheckCircleIcon className="size-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery.trim()
                  ? `"${searchQuery}" 검색 결과가 없습니다`
                  : '판매완료된 차량이 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {soldList.map((item) => (
                <div
                  key={item.id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
                  }}
                  className="spec-card--sold"
                >
                  {/* 판매완료 배지 */}
                  <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/25">
                    SOLD
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ${
                          item.saleType === '위탁'
                            ? 'bg-rose-500 shadow-rose-500/40'
                            : 'bg-emerald-500 shadow-emerald-500/40'
                        }`}
                      >
                        {item.saleType === '위탁' ? '위' : '매'}
                      </span>
                      <div>
                        <span className="whitespace-nowrap text-base font-bold tracking-tight text-gray-800 dark:text-gray-100">
                          {item.vehicleNumber}
                        </span>
                        <span
                          className={`ml-2 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                            item.vehicleType === 'camper'
                              ? 'border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                          }`}
                        >
                          {item.vehicleType === 'camper' ? '캠핑카' : '카라반'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.modelName || '모델명 없음'}
                    </p>
                    {item.manufacturer && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {item.manufacturer}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/80 pt-3 dark:border-white/5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString('ko-KR')} 판매완료
                    </span>
                    <button
                      onClick={() => handleReregister(item.vehicleNumber)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-accent-500/20 transition-all hover:from-accent-400 hover:to-accent-500 hover:shadow-md hover:shadow-accent-500/25 active:scale-[0.98] dark:shadow-accent-500/30"
                    >
                      <ArrowPathIcon className="size-3.5" />
                      재등록
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* 컨텍스트 메뉴 (패널 내부 absolute) */}
          {contextMenu.show && contextMenu.item && (
            <div
              className="absolute z-[60] min-w-[160px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
              style={{ left: Math.min(contextMenu.x, 200), top: contextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  const vehicleNumber = contextMenu.item?.vehicleNumber;
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                  if (vehicleNumber) {
                    handleReregister(vehicleNumber);
                  }
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-accent-600 transition-colors hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-950/50"
              >
                <ArrowPathIcon className="size-4" />
                재등록 (입고)
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
