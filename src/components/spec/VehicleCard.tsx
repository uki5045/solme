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
      {/* Row 1: [차량번호] [매/위][타입] */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="whitespace-nowrap text-base font-bold tracking-tight text-gray-800 dark:text-gray-100">{item.vehicleNumber}</span>
        <div className="flex items-center gap-1">
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${item.saleType === '위탁' ? 'border border-accent-500 bg-white text-accent-600 dark:border-emerald-400 dark:bg-transparent dark:text-emerald-400' : 'bg-accent-500 text-white dark:bg-emerald-400 dark:text-[#1a1d21]'}`}>
            {item.saleType === '위탁' ? '위탁' : '매입'}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${item.vehicleType === 'camper' ? 'border border-gray-400 bg-white text-gray-600 dark:border-gray-400 dark:bg-transparent dark:text-gray-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
            {item.vehicleType === 'camper' ? '캠핑카' : '카라반'}
          </span>
        </div>
      </div>

      {/* Row 2: [제조사][모델명] [연식] */}
      <div className="mb-2 flex items-center justify-between">
        <div className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-400">
          {item.manufacturer && <span>{item.manufacturer} </span>}
          <span>{item.modelName || '모델명 없음'}</span>
        </div>
        {yearDisplay && (
          <span className="ml-2 shrink-0 text-xs text-gray-500 dark:text-gray-500">{yearDisplay}</span>
        )}
      </div>

      {/* Row 3: [가격] [!] */}
      <div className="flex items-center justify-between">
        {item.price ? (
          <div className="text-base font-bold text-accent-600 dark:text-emerald-400">
            {formatPrice(item.price)}
          </div>
        ) : (
          <div className="h-5" />
        )}
        {item.isIncomplete && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-sm shadow-amber-500/40">!</span>
        )}
      </div>
    </div>
  );
});

export default VehicleCard;
export type { VehicleItem };
