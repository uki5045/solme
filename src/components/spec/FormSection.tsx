'use client';

import { useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import CamperForm from './CamperForm';
import CaravanForm from './CaravanForm';
import type { CamperData, CaravanData, MainTab, FormStep } from './types';

interface FormSectionProps {
  // refs
  leftSectionRef: React.RefObject<HTMLDivElement | null>;
  formContainerRef: React.RefObject<HTMLDivElement | null>;

  // 레이아웃
  mobileView: 'form' | 'list';

  // 탭
  mainTab: MainTab;
  onMainTabChange: (tab: MainTab) => void;
  tabLoading: boolean;

  // 검색
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // 폼 상태
  step: FormStep;
  camperData: CamperData;
  setCamperData: React.Dispatch<React.SetStateAction<CamperData>>;
  caravanData: CaravanData;
  setCaravanData: React.Dispatch<React.SetStateAction<CaravanData>>;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  // 버튼 핸들러
  onPrev: () => void;
  onNext: () => void;
}

export default function FormSection({
  leftSectionRef,
  formContainerRef,
  mobileView,
  mainTab,
  onMainTabChange,
  tabLoading,
  searchQuery,
  setSearchQuery,
  step,
  camperData,
  setCamperData,
  caravanData,
  setCaravanData,
  fieldErrors,
  setFieldErrors,
  onPrev,
  onNext,
}: FormSectionProps) {
  // Enter 키로 다음 스텝 이동 (textarea 제외)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // textarea나 select에서는 Enter 동작 유지
        if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        // 검색 input에서는 무시
        if (target.getAttribute('placeholder')?.includes('검색')) return;
        e.preventDefault();
        onNext();
      }
    },
    [onNext]
  );

  useEffect(() => {
    const formContainer = formContainerRef.current;
    if (!formContainer) return;
    formContainer.addEventListener('keydown', handleKeyDown);
    return () => formContainer.removeEventListener('keydown', handleKeyDown);
  }, [formContainerRef, handleKeyDown]);

  return (
    <div ref={leftSectionRef} className={`relative w-full shrink-0 lg:max-w-[440px] ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
      {/* 검색창 */}
      <div className="mb-3 rounded-2xl bg-white p-2 shadow-sm dark:bg-[#1c1f26]">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="차량번호, 모델명, 제조사로 검색"
            className="form-input !pl-11"
          />
        </div>
      </div>

      {/* 폼 콘텐츠 */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1c1f26]">
        <div ref={formContainerRef} className="p-5">
            {/* 캠핑카/카라반 세그먼트 컨트롤 */}
            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">종류</label>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[#262a33]">
              <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                <input
                  type="radio"
                  name="vehicleTypeSelect"
                  value="camper"
                  checked={mainTab === 'camper'}
                  onChange={() => onMainTabChange('camper')}
                  className="sr-only"
                />
                <span className="relative z-10">캠핑카</span>
              </label>
              <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                <input
                  type="radio"
                  name="vehicleTypeSelect"
                  value="caravan"
                  checked={mainTab === 'caravan'}
                  onChange={() => onMainTabChange('caravan')}
                  className="sr-only"
                />
                <span className="relative z-10">카라반</span>
              </label>
              </div>
            </div>

            {/* 매입/위탁 세그먼트 컨트롤 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">구분</label>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[#262a33]">
              <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                <input
                  type="radio"
                  name="saleTypeSelect"
                  value="매입"
                  checked={(mainTab === 'camper' ? camperData.saleType : caravanData.saleType) === '매입'}
                  onChange={() => {
                    setCamperData(prev => ({ ...prev, saleType: '매입' }));
                    setCaravanData(prev => ({ ...prev, saleType: '매입' }));
                  }}
                  className="sr-only"
                />
                <span className="relative z-10">매입</span>
              </label>
              <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                <input
                  type="radio"
                  name="saleTypeSelect"
                  value="위탁"
                  checked={(mainTab === 'camper' ? camperData.saleType : caravanData.saleType) === '위탁'}
                  onChange={() => {
                    setCamperData(prev => ({ ...prev, saleType: '위탁' }));
                    setCaravanData(prev => ({ ...prev, saleType: '위탁' }));
                  }}
                  className="sr-only"
                />
                <span className="relative z-10">위탁</span>
              </label>
              </div>
            </div>
            {mainTab === 'camper' ? (
              <CamperForm
                step={step}
                data={camperData}
                setData={setCamperData}
                errors={step === 1 ? fieldErrors : {}}
                clearError={step === 1 ? (key) => setFieldErrors(prev => { const next = {...prev}; delete next[key]; return next; }) : undefined}
              />
            ) : (
              <CaravanForm
                step={step}
                data={caravanData}
                setData={setCaravanData}
                errors={step === 1 ? fieldErrors : {}}
                clearError={step === 1 ? (key) => setFieldErrors(prev => { const next = {...prev}; delete next[key]; return next; }) : undefined}
              />
            )}
        </div>

        {/* 하단 버튼 - 항상 하단에 고정 */}
        <div className="mt-auto flex gap-3 border-t border-gray-100 p-5 dark:border-gray-800">
          {step > 1 && (
            <button
              onClick={onPrev}
              className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
            >
              이전
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg hover:shadow-accent-500/40 active:scale-[0.98] dark:from-accent-400 dark:to-accent-500 dark:shadow-md dark:shadow-accent-400/35 dark:hover:shadow-lg dark:hover:shadow-accent-400/45"
          >
            {step === 3 ? '저장' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}
