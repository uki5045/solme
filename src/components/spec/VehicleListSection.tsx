'use client';

import { motion, AnimatePresence } from 'motion/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/20/solid';
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

  // 차량 등록 (PC 전용)
  onAddClick?: () => void;
}

export default function VehicleListSection({
  mobileView,
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
  onAddClick,
}: VehicleListSectionProps) {
  return (
    <div
      className={`relative w-full flex-col lg:flex ${mobileView === 'form' ? 'hidden' : 'flex'}`}
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

      {/* PC 헤더: 탭 + 검색 + 등록 버튼 */}
      <div className="mb-3 hidden shrink-0 items-center gap-3 rounded-2xl bg-white p-2 shadow-sm dark:bg-[#1c1f26] lg:flex">
        {/* 상태 탭 (왼쪽) */}
        <div ref={statusTabListRef} className="relative grid flex-1 grid-cols-4 rounded-xl bg-gray-100/80 p-1 dark:bg-[#262a33]">
          {/* 인디케이터 */}
          <div
            className="absolute top-1 bottom-1 rounded-lg transition-all duration-200"
            style={{
              width: 'calc(25% - 2px)',
              left: 4,
              transform: `translateX(calc(${statusIndex} * 100%))`,
              ...getStatusTabStyle(statusTab, isDarkMode),
            }}
          />
          {STATUS_TABS.map((status) => {
            const count = status === 'all'
              ? vehicleList.filter(v => v.status !== 'sold' && v.status !== 'contracted').length
              : vehicleList.filter(v => v.status === status).length;
            const isActive = statusTab === status;
            return (
              <button
                key={status}
                data-status={status}
                onClick={() => { setSearchQuery(''); setStatusTab(status); }}
                className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="whitespace-nowrap">{STATUS_TAB_LABELS[status]}</span>
                <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-xs font-medium ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-200/60 text-gray-500 dark:bg-gray-700/50 dark:text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 검색창 (중앙) */}
        <div className="relative w-64 shrink-0">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-400/20 dark:border-gray-700 dark:bg-[#262a33] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-emerald-500 dark:focus:bg-[#1c1f26] dark:focus:ring-emerald-500/20"
          />
        </div>

        {/* 등록 버튼 (오른쪽) */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-500/20 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-md hover:shadow-accent-500/30 active:scale-[0.98] dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-400/25 dark:hover:from-emerald-300 dark:hover:to-emerald-400 dark:hover:shadow-emerald-400/35"
          >
            <PlusIcon className="h-5 w-5" />
            <span>등록</span>
          </button>
        )}
      </div>

      {/* 모바일 헤더: 상태 탭만 */}
      <div className="relative mb-3 grid shrink-0 grid-cols-4 rounded-2xl bg-white p-2 shadow-sm dark:bg-[#1c1f26] lg:hidden">
        {/* 인디케이터 */}
        <div
          className="absolute top-2 bottom-2 rounded-xl"
          style={{
            width: 'calc(25% - 4px)',
            left: 8,
            transform: `translateX(${statusIndex * 100}%)`,
            ...getStatusTabStyle(statusTab, isDarkMode),
          }}
        />
        {STATUS_TABS.map((status) => {
          const count = status === 'all'
            ? vehicleList.filter(v => v.status !== 'sold' && v.status !== 'contracted').length
            : vehicleList.filter(v => v.status === status).length;
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
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
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
