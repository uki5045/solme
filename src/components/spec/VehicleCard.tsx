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
  year: string;
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
  // 연식 표시 포맷 (연도만 표시)
  const yearDisplay = item.year ? item.year.split('.')[0] + '년식' : '';

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
      } ${item.isIncomplete ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
    >
      {/* Row 1: [구분][차량번호] [타입] */}
      <div className="mb-1.5 flex items-center justify-between">
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

      {/* Row 2: [제조사][모델명] [연식] */}
      <div className="mb-1 flex items-center justify-between">
        <div className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-400">
          {item.manufacturer && <span>{item.manufacturer} </span>}
          <span>{item.modelName || '모델명 없음'}</span>
        </div>
        {yearDisplay && (
          <span className="ml-2 shrink-0 text-xs text-gray-500 dark:text-gray-500">{yearDisplay}</span>
        )}
      </div>

      {/* Row 3: [가격] */}
      {item.price ? (
        <div className="text-sm font-semibold text-accent-600 dark:text-emerald-400">
          {formatPrice(item.price)}
        </div>
      ) : (
        <div className="h-5" />
      )}
    </div>
  );
});

export default VehicleCard;
export type { VehicleItem };
