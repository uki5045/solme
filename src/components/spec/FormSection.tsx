'use client';

import { useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/tabs';
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
  onReset: () => void;
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
  onReset,
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
      {/* 애니메이션 메인 탭 */}
      <Tabs
        defaultValue="camper"
        value={mainTab}
        onValueChange={(value) => onMainTabChange(value as MainTab)}
        className="mb-3"
      >
        <TabsList
          className="grid w-full grid-cols-2 !border-0 !bg-white shadow-sm dark:!bg-[#1c1f26]"
          indicatorClassName="bg-gradient-to-b from-accent-500 to-accent-600 shadow-sm shadow-accent-500/25 dark:from-accent-400 dark:to-accent-500 dark:shadow-md dark:shadow-accent-500/30"
        >
          <TabsTrigger
            value="camper"
            className="rounded-lg py-3 text-base font-semibold text-gray-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:text-white"
          >
            캠핑카
          </TabsTrigger>
          <TabsTrigger
            value="caravan"
            className="rounded-lg py-3 text-base font-semibold text-gray-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:text-white"
          >
            카라반
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 차량 검색 (데스크탑에서만 표시) */}
      <div className="mb-3 hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1f26] lg:block">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="차량번호, 모델명, 제조사로 검색"
          className="form-input"
        />
      </div>

      {/* 폼 콘텐츠 */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1c1f26]">
        {tabLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">불러오는 중...</span>
            </div>
          </div>
        ) : (
          <div ref={formContainerRef} className="p-5">
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
        )}

        {/* 하단 버튼 - 항상 하단에 고정 */}
        <div className="mt-auto flex gap-3 border-t border-gray-100 p-5 dark:border-gray-800">
          {step === 1 ? (
            <button
              onClick={onReset}
              className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
            >
              초기화
            </button>
          ) : (
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
