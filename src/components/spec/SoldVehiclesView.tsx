'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
} from '@heroicons/react/16/solid';
import { useClickOutside } from '@/hooks/useClickOutside';
import { SOLD_TAB_LABELS, SOLD_TABS } from './constants';
import type { VehicleListItem, VehicleStatus, SoldTabType } from './types';

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
  const [activeTab, setActiveTab] = useState<SoldTabType>('contracted');
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    item: VehicleListItem | null;
  }>({ show: false, x: 0, y: 0, item: null });

  // 컨텍스트 메뉴 닫기 (외부 클릭 시)
  useClickOutside(null, () => setContextMenu({ show: false, x: 0, y: 0, item: null }), contextMenu.show, 'click');

  // 스크롤 방지 (html + body)
  useEffect(() => {
    if (show) {
      document.documentElement.classList.add('modal-open');
      return () => {
        document.documentElement.classList.remove('modal-open');
      };
    }
  }, [show]);

  if (!show) return null;

  // 탭에 따라 필터링
  const filteredList = vehicleList
    .filter(v => v.status === activeTab)
    .filter(v => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.modelName?.toLowerCase().includes(q) ||
        v.manufacturer?.toLowerCase().includes(q)
      );
    });

  // 재등록 (입고로 변경)
  const handleReregister = (vehicleNumber: string) => {
    onClose();
    setTimeout(() => {
      onRequestStatusChange(vehicleNumber, 'intake');
    }, 100);
  };

  // 판매완료로 변경
  const handleMarkAsSold = (vehicleNumber: string) => {
    onRequestStatusChange(vehicleNumber, 'sold');
  };

  // 탭별 카운트
  const contractedCount = vehicleList.filter(v => v.status === 'contracted').length;
  const soldCount = vehicleList.filter(v => v.status === 'sold').length;
  const getTabCount = (tab: SoldTabType) => tab === 'contracted' ? contractedCount : soldCount;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 dark:bg-[#0f1115]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl dark:border-[#2a2f3a] dark:bg-[#1c1f26]/90">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">출고 관리</h2>
          <div className="w-9" />
        </div>

        {/* 탭 세그먼트 컨트롤 */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[#262a33]">
            {SOLD_TABS.map((tab) => (
              <label
                key={tab}
                className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-400 has-[:checked]:bg-white has-[:checked]:text-gray-700 has-[:checked]:shadow-sm dark:text-gray-500 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-gray-200 dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              >
                <input
                  type="radio"
                  name="soldTab"
                  value={tab}
                  checked={activeTab === tab}
                  onChange={() => setActiveTab(tab)}
                  className="sr-only"
                />
                <span className="relative z-10 flex items-center gap-1.5">
                  {SOLD_TAB_LABELS[tab]}
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-gray-200/60 px-1.5 text-xs font-medium text-gray-400 group-has-[:checked]:bg-gray-300/80 group-has-[:checked]:text-gray-600 dark:bg-gray-700/50 dark:text-gray-500 dark:group-has-[:checked]:bg-gray-600/80 dark:group-has-[:checked]:text-gray-300">
                    {getTabCount(tab)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 검색바 */}
      <div className="p-4 pb-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="차량번호, 모델명으로 검색"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-[#363b47] dark:bg-[#1c1f26] dark:text-white dark:placeholder-gray-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
          />
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
              {activeTab === 'contracted' ? (
                <DocumentCheckIcon className="size-8 text-gray-400 dark:text-gray-500" />
              ) : (
                <CheckCircleIcon className="size-8 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery.trim()
                ? `"${searchQuery}" 검색 결과가 없습니다`
                : activeTab === 'contracted'
                  ? '계약된 차량이 없습니다'
                  : '판매완료된 차량이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
                }}
                className="spec-card--sold"
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
                  {item.year && (
                    <span className="ml-2 shrink-0 text-xs text-gray-500 dark:text-gray-500">{item.year.split('.')[0]}년식</span>
                  )}
                </div>

                {/* Row 3: [날짜] [액션 버튼] */}
                <div className="flex items-center justify-between border-t border-gray-100/80 pt-3 dark:border-white/5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.updatedAt).toLocaleDateString('ko-KR')} {activeTab === 'contracted' ? '계약' : '판매완료'}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeTab === 'contracted' ? (
                      // 계약 탭: 재등록 + 판매완료 버튼
                      <>
                        <button
                          onClick={() => handleReregister(item.vehicleNumber)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <ArrowPathIcon className="size-3.5" />
                          재등록
                        </button>
                        <button
                          onClick={() => handleMarkAsSold(item.vehicleNumber)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <CheckCircleIcon className="size-3.5" />
                          판매완료
                        </button>
                      </>
                    ) : (
                      // 판매완료 탭: 재등록 버튼
                      <button
                        onClick={() => handleReregister(item.vehicleNumber)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <ArrowPathIcon className="size-3.5" />
                        재등록
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu.show && contextMenu.item && (
        <div
          className="fixed z-[60] min-w-[160px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {activeTab === 'contracted' ? (
            <>
              <button
                onClick={() => {
                  const vehicleNumber = contextMenu.item?.vehicleNumber;
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                  if (vehicleNumber) {
                    handleMarkAsSold(vehicleNumber);
                  }
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50"
              >
                <CheckCircleIcon className="size-4" />
                판매완료
              </button>
              <button
                onClick={() => {
                  const vehicleNumber = contextMenu.item?.vehicleNumber;
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                  if (vehicleNumber) {
                    handleReregister(vehicleNumber);
                  }
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-accent-600 transition-colors hover:bg-accent-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
              >
                <ArrowPathIcon className="size-4" />
                재등록 (입고)
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                const vehicleNumber = contextMenu.item?.vehicleNumber;
                setContextMenu({ show: false, x: 0, y: 0, item: null });
                if (vehicleNumber) {
                  handleReregister(vehicleNumber);
                }
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-accent-600 transition-colors hover:bg-accent-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
            >
              <ArrowPathIcon className="size-4" />
              재등록 (입고)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
