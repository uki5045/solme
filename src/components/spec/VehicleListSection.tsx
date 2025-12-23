'use client';

import { motion, AnimatePresence } from 'motion/react';
import VehicleCard from './VehicleCard';
import VehicleContextMenu from './VehicleContextMenu';
import type { StatusTabType, VehicleStatus, VehicleListItem } from './types';
import { STATUS_TAB_LABELS, STATUS_TABS, getStatusTabStyle } from './constants';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  item: VehicleListItem | null;
}

interface VehicleListSectionProps {
  // 레이아웃
  mobileView: 'form' | 'list';
  leftSectionHeight: number;

  // 로딩 상태
  previewLoading: boolean;
  listLoading: boolean;

  // 상태 탭
  statusTabListRef: React.RefObject<HTMLDivElement | null>;
  statusTab: StatusTabType;
  statusIndex: number;
  setStatusTab: (tab: StatusTabType) => void;
  isDarkMode: boolean;

  // 검색
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // 차량 리스트
  vehicleList: VehicleListItem[];
  filteredVehicleList: VehicleListItem[];
  highlightedVehicle: string | null;

  // 카드 핸들러
  onLoadFromCard: (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => void;
  onContextMenu: (e: React.MouseEvent, item: VehicleListItem) => void;
  onTouchStart: (e: React.TouchEvent, item: VehicleListItem) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;

  // 컨텍스트 메뉴
  contextMenu: ContextMenuState;
  onContextMenuClose: () => void;
  onStatusChange: (vehicleNumber: string, newStatus: VehicleStatus) => void;
  onEdit: (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => void;
  onDelete: (vehicleNumber: string) => void;
}

export default function VehicleListSection({
  mobileView,
  leftSectionHeight,
  previewLoading,
  listLoading,
  statusTabListRef,
  statusTab,
  statusIndex,
  setStatusTab,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  vehicleList,
  filteredVehicleList,
  highlightedVehicle,
  onLoadFromCard,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  contextMenu,
  onContextMenuClose,
  onStatusChange,
  onEdit,
  onDelete,
}: VehicleListSectionProps) {
  return (
    <div
      className={`relative flex-1 flex-col ${mobileView === 'form' ? 'hidden lg:flex' : 'flex'}`}
      style={{ height: leftSectionHeight > 0 ? `${leftSectionHeight}px` : 'auto' }}
    >
      {/* 미리보기 로딩 오버레이 */}
      {previewLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-[#121418]/80">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 상태 탭 헤더 */}
      <div ref={statusTabListRef} className="relative mb-3 grid shrink-0 grid-cols-4 rounded-2xl bg-white p-1.5 shadow-sm dark:bg-[#1c1f26]">
        {/* 인디케이터 */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-xl"
          style={{
            width: 'calc(25% - 3px)',
            left: 6,
            transform: `translateX(${statusIndex * 100}%)`,
            ...getStatusTabStyle(statusTab, isDarkMode),
          }}
        />
        {STATUS_TABS.map((status) => {
          const count = status === 'all' ? vehicleList.length : vehicleList.filter(v => v.status === status).length;
          const isActive = statusTab === status;
          return (
            <button
              key={status}
              data-status={status}
              onClick={() => { setSearchQuery(''); setStatusTab(status); }}
              className={`relative z-10 flex flex-row items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="whitespace-nowrap">{STATUS_TAB_LABELS[status]}</span>
              <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-xs font-medium ${
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-gray-200/60 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 차량 검색 (모바일에서만 표시) */}
      <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1f26] lg:hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="차량번호, 모델명, 제조사로 검색"
          className="form-input"
        />
      </div>

      {/* 카드 리스트 영역 */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1c1f26]">
        {/* 로딩 오버레이 - 깜빡임 방지 */}
        <AnimatePresence>
          {listLoading && vehicleList.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-[#1c1f26]/60"
            >
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg dark:bg-[#262a33]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-200 border-t-accent-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">업데이트 중...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 overflow-y-auto p-4">
          {listLoading && vehicleList.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">로딩 중...</div>
          ) : filteredVehicleList.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              {searchQuery.trim()
                ? `"${searchQuery}" 검색 결과가 없습니다`
                : statusTab === 'all' ? '등록된 차량이 없습니다' : `${STATUS_TAB_LABELS[statusTab]} 상태의 차량이 없습니다`
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {filteredVehicleList.map((item) => (
                <VehicleCard
                  key={item.id}
                  item={item}
                  highlightedVehicle={highlightedVehicle}
                  onLoad={onLoadFromCard}
                  onContextMenu={onContextMenu}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  contextMenuOpen={contextMenu.show}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      <VehicleContextMenu
        contextMenu={contextMenu}
        onClose={onContextMenuClose}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
