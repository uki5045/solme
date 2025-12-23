'use client';

import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import type { VehicleListItem, VehicleStatus } from './types';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  item: VehicleListItem | null;
}

interface VehicleContextMenuProps {
  contextMenu: ContextMenuState;
  onClose: () => void;
  onStatusChange: (vehicleNumber: string, status: VehicleStatus) => void;
  onEdit: (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => void;
  onDelete: (vehicleNumber: string) => void;
}

const STATUS_LABELS: Record<VehicleStatus, string> = {
  intake: '입고',
  productization: '상품화',
  advertising: '광고',
  sold: '판매완료',
};

// PC용 드롭다운 위치 계산
function useDropdownPosition(x: number, y: number, show: boolean) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useLayoutEffect(() => {
    if (!show || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const padding = 8;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > window.innerWidth - padding) {
      adjustedX = window.innerWidth - rect.width - padding;
    }
    if (adjustedX < padding) {
      adjustedX = padding;
    }
    if (y + rect.height > window.innerHeight - padding) {
      adjustedY = window.innerHeight - rect.height - padding;
    }
    if (adjustedY < padding) {
      adjustedY = padding;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y, show]);

  return { menuRef, position };
}

export default function VehicleContextMenu({
  contextMenu,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}: VehicleContextMenuProps) {
  const { item } = contextMenu;
  const { menuRef, position } = useDropdownPosition(
    contextMenu.x,
    contextMenu.y,
    contextMenu.show
  );

  // 모바일에서만 스크롤 방지
  useEffect(() => {
    if (contextMenu.show) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
    }
  }, [contextMenu.show]);

  if (!contextMenu.show || !item) return null;

  return (
    <>
      {/* ========== PC: 드롭다운 (lg 이상) ========== */}
      <div
        ref={menuRef}
        className="fixed z-50 hidden min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl lg:block dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상태 변경 */}
        {(['intake', 'productization', 'advertising'] as VehicleStatus[]).map((status) => {
          const isCurrentStatus = item.status === status;
          return (
            <button
              key={status}
              onClick={() => {
                if (!isCurrentStatus) {
                  onStatusChange(item.vehicleNumber, status);
                }
                onClose();
              }}
              disabled={isCurrentStatus}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                isCurrentStatus
                  ? 'cursor-default text-gray-500 dark:text-gray-500'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#363b47]'
              }`}
            >
              {isCurrentStatus && <CheckIcon className="size-4 text-accent-500" />}
              <span className={isCurrentStatus ? '' : 'ml-6'}>{STATUS_LABELS[status]}</span>
            </button>
          );
        })}

        <div className="my-1.5 border-t border-gray-100 dark:border-[#454c5c]" />

        <button
          onClick={() => {
            onEdit(item.vehicleNumber, item.vehicleType);
            onClose();
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#363b47]"
        >
          <PencilSquareIcon className="size-4" />
          수정
        </button>

        <button
          onClick={() => {
            onStatusChange(item.vehicleNumber, 'sold');
            onClose();
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#363b47]"
        >
          <TagIcon className="size-4" />
          판매완료
        </button>

        <button
          onClick={() => {
            onDelete(item.vehicleNumber);
            onClose();
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          <TrashIcon className="size-4" />
          삭제
        </button>
      </div>

      {/* ========== 모바일: 바텀시트 (lg 미만) ========== */}
      <AnimatePresence>
        {contextMenu.show && (
          <>
            {/* 백드롭 - 모바일 전용 (iOS Safari 상태바/주소창 영역까지 확장) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed -inset-20 z-50 bg-black/50 lg:hidden"
              onClick={onClose}
            />

            {/* 바텀시트 - 모바일 전용 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] lg:hidden dark:bg-[#1c1f26]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 드래그 핸들 */}
              <div className="flex justify-center py-3">
                <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>

              {/* 헤더: 차량 정보 */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${item.saleType === '위탁' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                    {item.saleType === '위탁' ? '위' : '매'}
                  </span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{item.vehicleNumber}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.modelName || '모델명 없음'} · {item.vehicleType === 'camper' ? '캠핑카' : '카라반'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              {/* 버튼들 */}
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  {/* 상태 변경 버튼들 */}
                  <div className="flex gap-2">
                    {(['intake', 'productization', 'advertising'] as VehicleStatus[]).map((status) => {
                      const isCurrentStatus = item.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            if (!isCurrentStatus) {
                              onStatusChange(item.vehicleNumber, status);
                            }
                            onClose();
                          }}
                          disabled={isCurrentStatus}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-all ${
                            isCurrentStatus
                              ? 'bg-accent-100 text-accent-600 ring-2 ring-accent-500 dark:bg-accent-500/20 dark:text-accent-400'
                              : 'bg-gray-100 text-gray-700 active:scale-[0.98] dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {isCurrentStatus && <CheckIcon className="size-5" />}
                          {STATUS_LABELS[status]}
                        </button>
                      );
                    })}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onEdit(item.vehicleNumber, item.vehicleType);
                        onClose();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 font-medium text-gray-700 transition-all active:scale-[0.98] dark:bg-gray-800 dark:text-gray-200"
                    >
                      <PencilSquareIcon className="size-5" />
                      수정
                    </button>

                    <button
                      onClick={() => {
                        onStatusChange(item.vehicleNumber, 'sold');
                        onClose();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 font-medium text-gray-700 transition-all active:scale-[0.98] dark:bg-gray-800 dark:text-gray-200"
                    >
                      <TagIcon className="size-5" />
                      판매완료
                    </button>

                    <button
                      onClick={() => {
                        onDelete(item.vehicleNumber);
                        onClose();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-3.5 font-medium text-red-600 transition-all active:scale-[0.98] dark:bg-red-950/30 dark:text-red-400"
                    >
                      <TrashIcon className="size-5" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
