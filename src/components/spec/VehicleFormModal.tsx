'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CamperForm from './CamperForm';
import CaravanForm from './CaravanForm';
import type { CamperData, CaravanData, MainTab, FormStep } from './types';
import { calculateCashReceipt } from './utils';

interface VehicleFormModalProps {
  show: boolean;
  onClose: () => void;
  // 탭
  mainTab: MainTab;
  onMainTabChange: (tab: MainTab) => void;
  tabLoading: boolean;
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
  onReset: () => void;
  // 수정 모드
  isEditMode?: boolean;
  editingVehicleNumber?: string;
}

// 모달 스크롤 방지 훅
function useModalScrollLock(show: boolean) {
  useEffect(() => {
    if (show) {
      document.documentElement.classList.add('modal-open');
      return () => {
        document.documentElement.classList.remove('modal-open');
      };
    }
  }, [show]);
}

export default function VehicleFormModal({
  show,
  onClose,
  mainTab,
  onMainTabChange,
  tabLoading,
  step,
  camperData,
  setCamperData,
  caravanData,
  setCaravanData,
  fieldErrors,
  setFieldErrors,
  onPrev,
  onNext,
  onReset,
  isEditMode = false,
  editingVehicleNumber,
}: VehicleFormModalProps) {
  useModalScrollLock(show);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  // Enter 키로 다음 스텝 이동 (textarea 제외)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        if (target.getAttribute('placeholder')?.includes('검색')) return;
        e.preventDefault();
        onNext();
      }
    },
    [onNext]
  );

  useEffect(() => {
    const formContainer = formContainerRef.current;
    if (!formContainer || !show) return;
    formContainer.addEventListener('keydown', handleKeyDown);
    return () => formContainer.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1c1f26]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="shrink-0">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isEditMode ? '차량 수정' : '차량 등록'}
                  </h2>
                  {isEditMode && editingVehicleNumber && (
                    <span className="rounded-lg bg-accent-50 px-2.5 py-1 text-sm font-medium text-accent-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {editingVehicleNumber}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex size-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              {/* 프로그레스 바 */}
              <div className="h-[2px] w-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-500 to-accent-400 dark:from-emerald-500 dark:to-emerald-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
              </div>
            </div>

            {/* 폼 콘텐츠 - 고정 높이로 스텝 전환 시 높이 변화 방지 */}
            <div ref={formContainerRef} className="h-[700px] shrink-0 overflow-hidden p-5">
              {/* 캠핑카/카라반, 매입/위탁 세그먼트 컨트롤 - step 1에서만 표시 */}
              {step === 1 && (
                <>
                  {/* 캠핑카/카라반 세그먼트 컨트롤 */}
                  <div className="mb-3">
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">종류</label>
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[#262a33]">
                      <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                        <input
                          type="radio"
                          name="vehicleTypeSelectModal"
                          value="camper"
                          checked={mainTab === 'camper'}
                          onChange={() => onMainTabChange('camper')}
                          disabled={isEditMode}
                          className="sr-only"
                        />
                        <span className="relative z-10">캠핑카</span>
                      </label>
                      <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                        <input
                          type="radio"
                          name="vehicleTypeSelectModal"
                          value="caravan"
                          checked={mainTab === 'caravan'}
                          onChange={() => onMainTabChange('caravan')}
                          disabled={isEditMode}
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
                          name="saleTypeSelectModal"
                          value="매입"
                          checked={(mainTab === 'camper' ? camperData.saleType : caravanData.saleType) === '매입'}
                          onChange={() => {
                            const cashReceipt = calculateCashReceipt('매입');
                            setCamperData(prev => ({ ...prev, saleType: '매입', cashReceipt }));
                            setCaravanData(prev => ({ ...prev, saleType: '매입', cashReceipt }));
                          }}
                          className="sr-only"
                        />
                        <span className="relative z-10">매입</span>
                      </label>
                      <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white dark:has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                        <input
                          type="radio"
                          name="saleTypeSelectModal"
                          value="위탁"
                          checked={(mainTab === 'camper' ? camperData.saleType : caravanData.saleType) === '위탁'}
                          onChange={() => {
                            const cashReceipt = calculateCashReceipt('위탁');
                            setCamperData(prev => ({ ...prev, saleType: '위탁', cashReceipt }));
                            setCaravanData(prev => ({ ...prev, saleType: '위탁', cashReceipt }));
                          }}
                          className="sr-only"
                        />
                        <span className="relative z-10">위탁</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

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

            {/* 하단 버튼 */}
            <div className="flex shrink-0 gap-3 border-t border-gray-100 p-5 dark:border-gray-800">
              {step === 1 && !isEditMode && (
                <button
                  onClick={onReset}
                  className="form-btn-secondary rounded-xl px-4 py-3 text-sm font-semibold active:scale-[0.98]"
                >
                  초기화
                </button>
              )}
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
                className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg hover:shadow-accent-500/40 active:scale-[0.98] dark:from-emerald-400 dark:to-emerald-500 dark:shadow-md dark:shadow-emerald-400/35 dark:hover:from-emerald-300 dark:hover:to-emerald-400 dark:hover:shadow-lg dark:hover:shadow-emerald-400/45"
              >
                {step === 3 ? '저장' : '다음'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
