'use client';

import { useEffect } from 'react';
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

const STATUS_COLORS: Record<VehicleStatus, string> = {
  intake: 'bg-blue-500',
  productization: 'bg-amber-500',
  advertising: 'bg-emerald-500',
  sold: 'bg-gray-500',
};

export default function VehicleContextMenu({
  contextMenu,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}: VehicleContextMenuProps) {
  const { item } = contextMenu;

  // 바텀시트 열릴 때 스크롤 방지
  useEffect(() => {
    if (contextMenu.show) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [contextMenu.show]);

  return (
    <AnimatePresence>
      {contextMenu.show && item && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* 바텀시트 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] dark:bg-[#1c1f26]"
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

            {/* 상태 변경 버튼들 */}
            <div className="p-4">
              <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">상태 변경</div>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all ${
                        isCurrentStatus
                          ? 'bg-accent-50 ring-2 ring-accent-500 dark:bg-accent-500/10'
                          : 'bg-gray-50 active:scale-95 dark:bg-gray-800/50'
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${STATUS_COLORS[status]}`}>
                        {isCurrentStatus && <CheckIcon className="size-4 text-white" />}
                      </span>
                      <span className={`text-xs font-medium ${isCurrentStatus ? 'text-accent-600 dark:text-accent-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="border-t border-gray-100 p-4 dark:border-gray-800">
              <div className="flex gap-2">
                {/* 수정 */}
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

                {/* 판매완료 */}
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

                {/* 삭제 */}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
