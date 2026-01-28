'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon, MagnifyingGlassIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { VehicleLookupResult } from '@/lib/car365/types';
import type { CamperData, CaravanData, MainTab } from './types';
import { formatNumber } from './utils';

interface AutoRegisterModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<CamperData> | Partial<CaravanData>, vehicleType: MainTab) => void;
}

type LookupState = 'idle' | 'loading' | 'success' | 'error';

export default function AutoRegisterModal({
  show,
  onClose,
  onConfirm,
}: AutoRegisterModalProps) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<VehicleLookupResult | null>(null);
  const [vehicleType, setVehicleType] = useState<MainTab>('camper');

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (show) {
      setVehicleNumber('');
      setLookupState('idle');
      setErrorMessage('');
      setResult(null);
      setVehicleType('camper');
    }
  }, [show]);

  // 차량 조회
  const handleLookup = async () => {
    if (!vehicleNumber.trim()) {
      setErrorMessage('차량번호를 입력해주세요.');
      return;
    }

    setLookupState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const response = await fetch('/api/vehicle/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber: vehicleNumber.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLookupState('error');
        setErrorMessage(data.error || '조회에 실패했습니다.');
        return;
      }

      setResult(data.data);
      setLookupState('success');
    } catch {
      setLookupState('error');
      setErrorMessage('네트워크 오류가 발생했습니다.');
    }
  };

  // 확인 및 폼에 적용
  const handleConfirm = () => {
    if (!result) return;

    if (vehicleType === 'camper') {
      const camperData: Partial<CamperData> = {
        vehicleNumber: result.vehicleNumber,
        baseVehicle: result.baseVehicle,
        manufacturer: result.manufacturer,
        year: result.year,
        firstReg: result.firstReg,
        mileage: result.mileage,
        vehicleType: result.vehicleType,
        length: result.length,
        width: result.width,
        height: result.height,
        displacement: result.displacement,
        fuelEconomy: result.fuelEconomy,
        seatCapacity: result.seatCapacity,
        fuel: result.fuel,
        transmission: result.transmission,
      };
      onConfirm(camperData, 'camper');
    } else {
      const caravanData: Partial<CaravanData> = {
        vehicleNumber: result.vehicleNumber,
        manufacturer: result.manufacturer,
        year: result.year,
        firstReg: result.firstReg,
      };
      onConfirm(caravanData, 'caravan');
    }
  };

  // Enter 키로 조회
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && lookupState !== 'loading') {
      handleLookup();
    }
  };

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
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1c1f26]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="shrink-0 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  자동 등록
                </h2>
                <button
                  onClick={onClose}
                  className="flex size-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* 차량 종류 선택 */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">종류</label>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[#262a33]">
                  <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white">
                    <input
                      type="radio"
                      name="autoRegVehicleType"
                      value="camper"
                      checked={vehicleType === 'camper'}
                      onChange={() => setVehicleType('camper')}
                      className="sr-only"
                    />
                    <span className="relative z-10">캠핑카</span>
                  </label>
                  <label className="group relative flex cursor-pointer items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-gray-900 has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-[#363b47] dark:has-[:checked]:text-white">
                    <input
                      type="radio"
                      name="autoRegVehicleType"
                      value="caravan"
                      checked={vehicleType === 'caravan'}
                      onChange={() => setVehicleType('caravan')}
                      className="sr-only"
                    />
                    <span className="relative z-10">카라반</span>
                  </label>
                </div>
              </div>

              {/* 차량번호 입력 */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                  차량번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="12가1234"
                    className="form-input flex-1"
                    disabled={lookupState === 'loading'}
                  />
                  <button
                    onClick={handleLookup}
                    disabled={lookupState === 'loading'}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-500/20 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-400/25"
                  >
                    {lookupState === 'loading' ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>조회중</span>
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="size-4" />
                        <span>조회</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              <AnimatePresence>
                {lookupState === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 dark:bg-red-900/20"
                  >
                    <ExclamationTriangleIcon className="size-5 shrink-0 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 조회 결과 */}
              <AnimatePresence>
                {lookupState === 'success' && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="rounded-xl border-2 border-accent-200 bg-accent-50/50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="size-5 text-accent-500 dark:text-emerald-400" />
                      <span className="font-semibold text-accent-700 dark:text-emerald-300">조회 성공</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <ResultRow label="차량번호" value={result.vehicleNumber} />
                      <ResultRow label="차명" value={result.baseVehicle} />
                      <ResultRow label="제조사" value={result.manufacturer} />
                      <ResultRow label="연식" value={result.year} />
                      <ResultRow label="최초등록" value={result.firstReg} />
                      <ResultRow label="주행거리" value={result.mileage ? `${formatNumber(result.mileage)}km` : '-'} />
                      {vehicleType === 'camper' && (
                        <>
                          <ResultRow label="차종" value={result.vehicleType} />
                          <ResultRow label="연료" value={result.fuel} />
                          <ResultRow label="배기량" value={result.displacement ? `${formatNumber(result.displacement)}cc` : '-'} />
                          <ResultRow label="승차정원" value={result.seatCapacity ? `${result.seatCapacity}명` : '-'} />
                        </>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      * 캠핑카 제조사, 모델명 등은 수동 입력이 필요합니다.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 하단 버튼 */}
            <div className="shrink-0 border-t border-gray-100 p-5 dark:border-gray-800">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-[#262a33] dark:text-gray-300 dark:hover:bg-[#2e333d]"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={lookupState !== 'success'}
                  className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-400/35"
                >
                  적용하기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 결과 행 컴포넌트
function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value || '-'}</span>
    </>
  );
}
