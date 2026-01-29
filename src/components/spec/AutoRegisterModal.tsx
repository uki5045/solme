'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { VehicleLookupResult } from '@/lib/car365/types';
import type { CamperData, CaravanData, MainTab } from './types';
import { formatNumber } from './utils';

interface AutoRegisterModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<CamperData> | Partial<CaravanData>, vehicleType: MainTab) => void;
}

type Step = 'consent' | 'lookup';
type LookupState = 'idle' | 'loading' | 'success' | 'error';

// Car365 API Key (환경변수에서 가져옴)
const CAR365_API_KEY = process.env.NEXT_PUBLIC_CAR365_API_KEY || '';
const KCB_CERT_URL = 'https://biz.car365.go.kr/bzpt/task/lnkh/kcbCert/kcbOkCert.do';

export default function AutoRegisterModal({
  show,
  onClose,
  onConfirm,
}: AutoRegisterModalProps) {
  // Step 관리
  const [step, setStep] = useState<Step>('consent');

  // 제3자 동의 관련
  const [ownerName, setOwnerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [consentCompleted, setConsentCompleted] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);

  // 조회 관련
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<VehicleLookupResult | null>(null);
  const [vehicleType, setVehicleType] = useState<MainTab>('camper');

  // 팝업 참조
  const popupRef = useRef<Window | null>(null);
  const popupCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vehicleNumberRef = useRef(vehicleNumber);

  // vehicleNumber 변경 시 ref 업데이트
  useEffect(() => {
    vehicleNumberRef.current = vehicleNumber;
  }, [vehicleNumber]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (show) {
      setStep('consent');
      setOwnerName('');
      setVehicleNumber('');
      setConsentCompleted(false);
      setConsentLoading(false);
      setLookupState('idle');
      setErrorMessage('');
      setResult(null);
      setVehicleType('camper');
    }
  }, [show]);

  // 팝업 닫힘 감지 클린업
  useEffect(() => {
    return () => {
      if (popupCheckIntervalRef.current) {
        clearInterval(popupCheckIntervalRef.current);
      }
    };
  }, []);

  // 동의 완료 후 차량 조회 (ref 사용으로 최신 값 참조)
  const handleLookupAfterConsent = async () => {
    setLookupState('loading');
    setErrorMessage('');
    setResult(null);

    try {
      const response = await fetch('/api/vehicle/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber: vehicleNumberRef.current.trim() }),
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

  // 팝업 닫힘 감지 후 처리
  const handleConsentComplete = () => {
    setConsentLoading(false);
    setConsentCompleted(true);
    setStep('lookup');
    // 자동으로 차량 조회 시작
    handleLookupAfterConsent();
  };

  // 제3자 정보제공동의 팝업 열기
  const openConsentPopup = () => {
    if (!ownerName.trim()) {
      setErrorMessage('차량 소유자명을 입력해주세요.');
      return;
    }
    if (!vehicleNumber.trim()) {
      setErrorMessage('차량번호를 입력해주세요.');
      return;
    }

    setErrorMessage('');
    setConsentLoading(true);

    // 팝업 창 열기
    const popup = window.open('', 'kcbCertPopup', 'width=500,height=600,scrollbars=yes,resizable=yes');

    if (!popup) {
      setErrorMessage('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
      setConsentLoading(false);
      return;
    }

    popupRef.current = popup;

    // Form 생성 및 전송
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = KCB_CERT_URL;
    form.target = 'kcbCertPopup';

    // API Key
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'hidden';
    apiKeyInput.name = 'apiKeyArr';
    apiKeyInput.value = CAR365_API_KEY;
    form.appendChild(apiKeyInput);

    // 소유주명
    const ownerInput = document.createElement('input');
    ownerInput.type = 'hidden';
    ownerInput.name = 'carOwner';
    ownerInput.value = ownerName.trim();
    form.appendChild(ownerInput);

    // 차량번호
    const regNoInput = document.createElement('input');
    regNoInput.type = 'hidden';
    regNoInput.name = 'carRegNo';
    regNoInput.value = vehicleNumber.trim();
    form.appendChild(regNoInput);

    // 서비스 타입 (고정방식)
    const svcTypeInput = document.createElement('input');
    svcTypeInput.type = 'hidden';
    svcTypeInput.name = 'svcType';
    svcTypeInput.value = 'Y';
    form.appendChild(svcTypeInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // 팝업 닫힘 감지
    popupCheckIntervalRef.current = setInterval(() => {
      if (popup.closed) {
        if (popupCheckIntervalRef.current) {
          clearInterval(popupCheckIntervalRef.current);
        }
        handleConsentComplete();
      }
    }, 500);
  };

  // 수동 차량 조회 (동의 완료 후 에러 발생 시 재시도용)
  const handleLookup = async () => {
    if (!vehicleNumberRef.current.trim()) {
      setErrorMessage('차량번호를 입력해주세요.');
      return;
    }

    await handleLookupAfterConsent();
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

  // Enter 키로 동의 진행 또는 조회
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'consent' && !consentLoading) {
        openConsentPopup();
      } else if (step === 'lookup' && lookupState !== 'loading') {
        handleLookup();
      }
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
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    자동 등록
                  </h2>
                  {/* 단계 표시 */}
                  <div className="flex items-center gap-1.5">
                    <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      step === 'consent'
                        ? 'bg-accent-500 text-white dark:bg-emerald-500'
                        : 'bg-accent-100 text-accent-600 dark:bg-emerald-900 dark:text-emerald-400'
                    }`}>
                      1
                    </div>
                    <div className="h-0.5 w-3 bg-gray-200 dark:bg-gray-700" />
                    <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      step === 'lookup'
                        ? 'bg-accent-500 text-white dark:bg-emerald-500'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                    }`}>
                      2
                    </div>
                  </div>
                </div>
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
              {/* Step 1: 제3자 정보제공동의 */}
              {step === 'consent' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* 안내 메시지 */}
                  <div className="mb-5 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          제3자 정보제공동의 필요
                        </p>
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          차량 정보 조회를 위해 본인인증이 필요합니다.<br />
                          차량 소유자 본인만 진행할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

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

                  {/* 소유자명 입력 */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      차량 소유자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="홍길동"
                      className="form-input w-full"
                      disabled={consentLoading}
                    />
                  </div>

                  {/* 차량번호 입력 */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      차량번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="12가1234"
                      className="form-input w-full"
                      disabled={consentLoading}
                    />
                  </div>

                  {/* 에러 메시지 */}
                  <AnimatePresence>
                    {errorMessage && (
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
                </motion.div>
              )}

              {/* Step 2: 조회 결과 */}
              {step === 'lookup' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* 동의 완료 표시 */}
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
                    <CheckCircleIcon className="size-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      본인인증 완료 · {ownerName} · {vehicleNumber}
                    </span>
                  </div>

                  {/* 로딩 상태 */}
                  {lookupState === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="size-10 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500 dark:border-emerald-800 dark:border-t-emerald-500" />
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        차량 정보를 조회하고 있습니다...
                      </p>
                    </div>
                  )}

                  {/* 에러 메시지 */}
                  <AnimatePresence>
                    {lookupState === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4"
                      >
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                          <ExclamationTriangleIcon className="size-5 shrink-0 text-red-500" />
                          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                        </div>
                        <button
                          onClick={handleLookup}
                          className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-[#262a33] dark:text-gray-300 dark:hover:bg-[#2e333d]"
                        >
                          다시 조회
                        </button>
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
                </motion.div>
              )}
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

                {step === 'consent' ? (
                  <button
                    onClick={openConsentPopup}
                    disabled={consentLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 py-3 text-base font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                  >
                    {consentLoading ? (
                      <>
                        <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>인증 진행중</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="size-5" />
                        <span>본인인증</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleConfirm}
                    disabled={lookupState !== 'success'}
                    className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-400/35"
                  >
                    적용하기
                  </button>
                )}
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
