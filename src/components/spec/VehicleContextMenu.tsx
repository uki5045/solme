'use client';

import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
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

export default function VehicleContextMenu({
  contextMenu,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}: VehicleContextMenuProps) {
  if (!contextMenu.show || !contextMenu.item) return null;

  const { item } = contextMenu;

  return (
    <div
      className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
      style={{ left: contextMenu.x, top: contextMenu.y }}
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

      {/* 구분선 */}
      <div className="my-1.5 border-t border-gray-100 dark:border-[#454c5c]" />

      {/* 수정 */}
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

      {/* 판매완료 */}
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

      {/* 삭제 */}
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
  );
}
