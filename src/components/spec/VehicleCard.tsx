'use client';

import { memo } from 'react';

interface VehicleItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  updatedAt: string;
  status: 'intake' | 'productization' | 'advertising' | 'sold';
  isIncomplete: boolean;
  saleType: string;
}

interface StatusLabel {
  label: string;
  color: string;
}

interface VehicleCardProps {
  item: VehicleItem;
  statusTab: string;
  statusLabels: Record<string, StatusLabel>;
  highlightedVehicle: string | null;
  onLoad: (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => void;
  onContextMenu: (e: React.MouseEvent, item: VehicleItem) => void;
  onTouchStart: (e: React.TouchEvent, item: VehicleItem) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  contextMenuOpen: boolean;
}

const VehicleCard = memo(function VehicleCard({
  item,
  statusTab,
  statusLabels,
  highlightedVehicle,
  onLoad,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  contextMenuOpen,
}: VehicleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.vehicleNumber} ${item.vehicleType === 'camper' ? '캠핑카' : '카라반'} 불러오기`}
      onClick={() => {
        if (!contextMenuOpen) {
          onLoad(item.vehicleNumber, item.vehicleType);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, item);
      }}
      onTouchStart={(e) => onTouchStart(e, item)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLoad(item.vehicleNumber, item.vehicleType);
        }
      }}
      className={`spec-card ${
        highlightedVehicle === item.vehicleNumber ? 'spec-card--highlighted' : ''
      }`}
    >
      {/* 차량번호 + 배지 (같은 줄) */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${item.vehicleType === 'camper' ? 'bg-blue-500 shadow-blue-500/40 dark:shadow-blue-500/50' : 'bg-violet-500 shadow-violet-500/40 dark:shadow-violet-500/50'}`}>
            {item.vehicleType === 'camper' ? '캠' : '카'}
          </span>
          <span className="whitespace-nowrap text-base font-bold tracking-tight text-gray-800 dark:text-gray-100">{item.vehicleNumber}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {statusTab === 'all' && statusLabels[item.status] && (
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusLabels[item.status].color}`}>
              {statusLabels[item.status].label}
            </span>
          )}
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium shadow-sm ${item.saleType === '위탁' ? 'border border-rose-300 bg-rose-50 text-rose-700 shadow-rose-200/50 dark:border-rose-600 dark:bg-rose-900/30 dark:text-rose-400 dark:shadow-rose-500/20' : 'border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-emerald-200/50 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 dark:shadow-emerald-500/20'}`}>
            {item.saleType === '위탁' ? '위탁' : '매입'}
          </span>
        </div>
      </div>

      {/* 모델명 + 제조사 + 미입력 아이콘 */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-gray-600 dark:text-gray-400">{item.modelName || '모델명 없음'}</div>
          <div className="truncate text-xs text-gray-400 dark:text-gray-500">{item.manufacturer || '\u00A0'}</div>
        </div>
        {item.isIncomplete && (
          <span
            className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-white shadow-sm shadow-amber-400/50 dark:shadow-amber-400/60"
            title="옵션 미입력"
          >
            !
          </span>
        )}
      </div>
    </div>
  );
});

export default VehicleCard;
export type { VehicleItem, StatusLabel };
