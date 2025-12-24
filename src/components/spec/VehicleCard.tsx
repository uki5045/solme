'use client';

import { memo } from 'react';
import { formatPrice } from './utils';

interface VehicleItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  price: string;
  updatedAt: string;
  status: 'intake' | 'productization' | 'advertising' | 'sold';
  isIncomplete: boolean;
  saleType: string;
}

interface VehicleCardProps {
  item: VehicleItem;
  highlightedVehicle: string | null;
  onLoad: (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => void;
  onContextMenu: (e: React.MouseEvent, item: VehicleItem) => void;
  onTouchStart: (e: React.TouchEvent, item: VehicleItem) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  contextMenuOpen: boolean;
  isPressing?: boolean; // 꾹 누르는 중인지
}

const VehicleCard = memo(function VehicleCard({
  item,
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
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${item.saleType === '위탁' ? 'bg-rose-500 shadow-rose-500/40 dark:shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/40 dark:shadow-emerald-500/50'}`}>
            {item.saleType === '위탁' ? '위' : '매'}
          </span>
          <span className="whitespace-nowrap text-base font-bold tracking-tight text-gray-800 dark:text-gray-100">{item.vehicleNumber}</span>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium shadow-sm ${item.vehicleType === 'camper' ? 'border border-blue-300 bg-blue-50 text-blue-700 shadow-blue-200/50 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:shadow-blue-500/20' : 'border border-violet-300 bg-violet-50 text-violet-700 shadow-violet-200/50 dark:border-violet-600 dark:bg-violet-900/30 dark:text-violet-400 dark:shadow-violet-500/20'}`}>
          {item.vehicleType === 'camper' ? '캠핑카' : '카라반'}
        </span>
      </div>

      {/* 제조사 + 모델명 + 가격 + 미입력 아이콘 */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-gray-600 dark:text-gray-400">
            {item.manufacturer && <span>{item.manufacturer} </span>}
            <span>{item.modelName || '모델명 없음'}</span>
          </div>
          {item.price && (
            <div className="mt-1 text-sm font-semibold text-accent-600 dark:text-accent-300">
              {formatPrice(item.price)}
            </div>
          )}
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
export type { VehicleItem };
