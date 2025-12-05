'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { domToPng } from 'modern-screenshot';
import { motion, AnimatePresence } from 'motion/react';
import {
  InformationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from '@/components/animate-ui/tabs';

type MainTab = 'camper' | 'caravan';
type FormStep = 1 | 2 | 3;

interface CamperData {
  vehicleNumber: string;
  baseVehicle: string;
  manufacturer: string;
  modelName: string;
  vehicleType: string;
  year: string;
  firstReg: string;
  hasStructureMod: boolean;
  structureModDate: string;
  mileage: string;
  garageProof: string;
  license: string;
  length: string;
  width: string;
  height: string;
  displacement: string;
  fuel: string;
  transmission: string;
  fuelEconomy: string;
  seatCapacity: string;
  cashReceipt: string;
  batteryType: string;
  batteryCapacity: string;
  solar: string;
  inverter: string;
  exterior: string;
  interior: string;
  convenience: string;
}

interface CaravanData {
  vehicleNumber: string;
  manufacturer: string;
  modelName: string;
  vehicleType: string;
  year: string;
  firstReg: string;
  hasStructureMod: boolean;
  structureModDate: string;
  garageProof: string;
  sleepCapacity: string;
  cashReceipt: string;
  extLength: string;
  intLength: string;
  extWidth: string;
  intWidth: string;
  extHeight: string;
  intHeight: string;
  curbWeight: string;
  maxWeight: string;
  batteryType: string;
  batteryCapacity: string;
  solar: string;
  inverter: string;
  exterior: string;
  interior: string;
  convenience: string;
}

const initialCamperData: CamperData = {
  vehicleNumber: '',
  baseVehicle: '',
  manufacturer: '',
  modelName: '',
  vehicleType: '소형 특수',
  year: '',
  firstReg: '',
  hasStructureMod: false,
  structureModDate: '',
  mileage: '',
  garageProof: '불필요',
  license: '2종 보통면허',
  length: '',
  width: '',
  height: '',
  displacement: '',
  fuel: '경유',
  transmission: '자동',
  fuelEconomy: '',
  seatCapacity: '',
  cashReceipt: '가능',
  batteryType: '인산철',
  batteryCapacity: '',
  solar: '',
  inverter: '',
  exterior: '',
  interior: '',
  convenience: '',
};

const initialCaravanData: CaravanData = {
  vehicleNumber: '',
  manufacturer: '',
  modelName: '',
  vehicleType: '소형 특수',
  year: '',
  firstReg: '',
  hasStructureMod: false,
  structureModDate: '',
  garageProof: '불필요',
  sleepCapacity: '',
  cashReceipt: '가능',
  extLength: '',
  intLength: '',
  extWidth: '',
  intWidth: '',
  extHeight: '',
  intHeight: '',
  curbWeight: '',
  maxWeight: '',
  batteryType: '인산철',
  batteryCapacity: '',
  solar: '',
  inverter: '',
  exterior: '',
  interior: '',
  convenience: '',
};

// 숫자만 허용 (정수)
const onlyNumbers = (value: string): string => value.replace(/[^\d]/g, '');

// 숫자와 소수점만 허용 (연비용)
const onlyDecimal = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return cleaned;
};

// 숫자, 소수점, + 허용 (인버터용)
const onlyDecimalPlus = (value: string): string => {
  return value.replace(/[^\d.+]/g, '');
};

interface VehicleListItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  updatedAt: string;
  isIncomplete: boolean;
}

export default function SpecPage() {
  const { data: session } = useSession();
  const [mainTab, setMainTab] = useState<MainTab>('camper');
  const [step, setStep] = useState<FormStep>(1);
  const [showResult, setShowResult] = useState(false);
  const [camperData, setCamperData] = useState<CamperData>(initialCamperData);
  const [caravanData, setCaravanData] = useState<CaravanData>(initialCaravanData);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; vehicleNumber: string }>({ show: false, vehicleNumber: '' });
  const [resetModal, setResetModal] = useState(false);
  const [overwriteModal, setOverwriteModal] = useState<{ show: boolean; callback: (() => void) | null }>({ show: false, callback: null });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({ show: false, message: '', type: 'success' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [vehicleList, setVehicleList] = useState<VehicleListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const camperResultRef = useRef<HTMLDivElement>(null);
  const caravanResultRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  useEffect(() => {
    try {
      const savedCamper = localStorage.getItem('spec-camper');
      const savedCaravan = localStorage.getItem('spec-caravan');
      if (savedCamper) {
        const parsed = JSON.parse(savedCamper);
        if (typeof parsed === 'object' && parsed !== null) {
          setCamperData({ ...initialCamperData, ...parsed });
        }
      }
      if (savedCaravan) {
        const parsed = JSON.parse(savedCaravan);
        if (typeof parsed === 'object' && parsed !== null) {
          setCaravanData({ ...initialCaravanData, ...parsed });
        }
      }
    } catch (e) {
      console.error('로컬스토리지 데이터 파싱 오류:', e);
      localStorage.removeItem('spec-camper');
      localStorage.removeItem('spec-caravan');
    }
  }, []);

  // localStorage 저장 debounce (500ms)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('spec-camper', JSON.stringify(camperData));
      } catch (e) {
        if ((e as Error).name === 'QuotaExceededError') {
          console.warn('localStorage 용량 초과');
        }
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [camperData]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('spec-caravan', JSON.stringify(caravanData));
      } catch (e) {
        if ((e as Error).name === 'QuotaExceededError') {
          console.warn('localStorage 용량 초과');
        }
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [caravanData]);

  // 차량 목록 조회
  const fetchVehicleList = async () => {
    setListLoading(true);
    try {
      const response = await fetch('/api/specs/list');
      const result = await response.json();
      if (response.ok) {
        setVehicleList(result.data || []);
      }
    } catch (e) {
      console.error('목록 조회 오류:', e);
    } finally {
      setListLoading(false);
    }
  };

  // 초기 로드 시 목록 조회
  useEffect(() => {
    fetchVehicleList();
  }, []);

  // 카드 클릭 시 데이터 로드
  const loadVehicleFromCard = async (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => {
    setFormLoading(true);
    try {
      const response = await fetch(`/api/specs?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || '데이터를 불러올 수 없습니다.', 'error');
        return;
      }

      const { data } = result;
      const savedData = data.data as Record<string, string>;

      if (vehicleType === 'camper') {
        setCamperData({ ...initialCamperData, ...savedData });
        setMainTab('camper');
      } else {
        setCaravanData({ ...initialCaravanData, ...savedData });
        setMainTab('caravan');
      }

      setStep(1);
      setFieldErrors({});
      showToast(`${vehicleType === 'camper' ? '캠핑카' : '카라반'} 데이터를 불러왔습니다.`, 'success');
    } catch (e) {
      console.error('데이터 로드 오류:', e);
      showToast('데이터 로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const formatNumber = (value: string): string => {
    if (!value) return '';
    const num = value.toString().replace(/[^\d.]/g, '');
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const parseYear = (value: string): { label: string; value: string } => {
    if (!value) return { label: '연식', value: '-' };
    const trimmed = value.trim();
    if (trimmed.includes('.')) {
      const [year, month] = trimmed.split('.');
      return { label: '제작연월', value: `${year} 년 ${parseInt(month)} 월` };
    }
    return { label: '연식', value: `${trimmed} 년식` };
  };

  const parseFirstReg = (value: string): string => {
    if (!value) return '-';
    const trimmed = value.trim();
    if (trimmed.includes('.')) {
      const [year, month] = trimmed.split('.');
      return `${year} 년 ${parseInt(month)} 월`;
    }
    return `${trimmed} 년`;
  };

  const formatOptions = (text: string): React.ReactNode => {
    if (!text || !text.trim()) return '-';
    const items = text.split(/\s{2,}/).filter((item) => item.trim());
    if (items.length === 0) return '-';
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-block whitespace-nowrap rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  // 전기 옵션 포맷 (칩 스타일)
  const formatElectric = (items: { label: string; value: string; unit: string }[]): React.ReactNode => {
    const validItems = items.filter((item) => item.value);
    if (validItems.length === 0) return '-';
    return (
      <div className="flex flex-wrap gap-1.5">
        {validItems.map((item, index) => (
          <span
            key={index}
            className="inline-block whitespace-nowrap rounded bg-gray-100 px-2 py-0.5 text-sm"
          >
            <span className="text-gray-700">{item.label} {formatNumber(item.value)} {item.unit}</span>
          </span>
        ))}
      </div>
    );
  };

  // 옵션 텍스트 총 길이 계산 (동적 너비용)
  const getOptionsLength = (): number => {
    const data = mainTab === 'camper' ? camperData : caravanData;
    const total = (data.exterior?.length || 0) + (data.interior?.length || 0) + (data.convenience?.length || 0);
    return total;
  };

  // 결과 테이블 너비 계산
  const getResultWidth = (): number => {
    const optionsLength = getOptionsLength();
    if (optionsLength > 300) return 1000;
    if (optionsLength > 200) return 900;
    return 800;
  };

  const openResetModal = () => {
    setResetModal(true);
  };

  const confirmReset = () => {
    if (mainTab === 'camper') {
      setCamperData(initialCamperData);
      localStorage.removeItem('spec-camper');
    } else {
      setCaravanData(initialCaravanData);
      localStorage.removeItem('spec-caravan');
    }
    setStep(1);
    setResetModal(false);
    showToast('초기화되었습니다.', 'success');
  };

  // 중복 확인 함수
  const checkDuplicate = useCallback(async (vehicleNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/specs?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      return response.ok; // 200이면 존재함
    } catch {
      return false;
    }
  }, []);

  // 실제 저장 함수 (중복 확인 없이)
  const saveToDatabase = useCallback(async (type: MainTab): Promise<boolean> => {
    const data = type === 'camper' ? camperData : caravanData;
    const vehicleNumber = data.vehicleNumber.trim();
    if (!vehicleNumber) return false;

    try {
      const response = await fetch('/api/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber,
          vehicleType: type,
          data,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        showToast(result.error || '저장에 실패했습니다.', 'error');
        return false;
      }

      // 저장 성공 시 목록 새로고침
      fetchVehicleList();
      return true;
    } catch {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      return false;
    }
  }, [camperData, caravanData]);

  // 중복 확인 후 저장 (모달 표시)
  const saveWithDuplicateCheck = useCallback(async (type: MainTab, onSuccess: () => void) => {
    const data = type === 'camper' ? camperData : caravanData;
    const vehicleNumber = data.vehicleNumber.trim();
    if (!vehicleNumber) return;

    const isDuplicate = await checkDuplicate(vehicleNumber);

    if (isDuplicate) {
      // 중복이면 모달 표시
      setOverwriteModal({
        show: true,
        callback: async () => {
          await saveToDatabase(type);
          onSuccess();
        },
      });
    } else {
      // 중복 아니면 바로 저장
      await saveToDatabase(type);
      onSuccess();
    }
  }, [camperData, caravanData, checkDuplicate, saveToDatabase]);

  const searchByVehicleNumber = async () => {
    const query = searchQuery.trim();
    if (!query) {
      showToast('차량번호를 입력해주세요.', 'warning');
      return;
    }

    try {
      const response = await fetch(`/api/specs?vehicleNumber=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || '해당 차량번호로 저장된 데이터가 없습니다.', 'error');
        return;
      }

      const { data } = result;
      const savedData = data.data as Record<string, string>;

      if (data.vehicle_type === 'camper') {
        setCamperData({ ...initialCamperData, ...savedData });
        setMainTab('camper');
      } else {
        setCaravanData({ ...initialCaravanData, ...savedData });
        setMainTab('caravan');
      }

      setSearchQuery('');
      setStep(1);
      showToast(`${data.vehicle_type === 'camper' ? '캠핑카' : '카라반'} 데이터를 불러왔습니다.`, 'success');
    } catch (e) {
      console.error('검색 오류:', e);
      showToast('검색 중 오류가 발생했습니다.', 'error');
    }
  };

  const openDeleteModal = (vehicleNumber: string) => {
    if (!vehicleNumber.trim()) return;
    setDeleteModal({ show: true, vehicleNumber });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `/api/specs?vehicleNumber=${encodeURIComponent(deleteModal.vehicleNumber)}`,
        { method: 'DELETE' }
      );
      const result = await response.json();

      if (!response.ok) {
        showToast('삭제 실패: ' + result.error, 'error');
        return;
      }

      setSearchQuery('');
      setDeleteModal({ show: false, vehicleNumber: '' });
      showToast('삭제되었습니다.', 'success');
      // 삭제 성공 시 목록 새로고침
      fetchVehicleList();
    } catch (e) {
      console.error('삭제 오류:', e);
      showToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const goNext = () => {
    // Step 1 필수 입력 검증
    if (step === 1) {
      const errors: Record<string, string> = {};
      const currentData = mainTab === 'camper' ? camperData : caravanData;

      // 공통 필수: 차량번호
      if (!currentData.vehicleNumber.trim()) errors.vehicleNumber = '필수 입력';

      if (mainTab === 'camper') {
        if (!camperData.baseVehicle.trim()) errors.baseVehicle = '필수 입력';
        if (!camperData.manufacturer.trim()) errors.manufacturer = '필수 입력';
        if (!camperData.modelName.trim()) errors.modelName = '필수 입력';
        if (!camperData.mileage.trim()) errors.mileage = '필수 입력';
      } else {
        if (!caravanData.manufacturer.trim()) errors.manufacturer = '필수 입력';
        if (!caravanData.modelName.trim()) errors.modelName = '필수 입력';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});
    }

    if (step < 3) {
      setStep((s) => (s + 1) as FormStep);
    } else {
      setShowResult(true);
    }
  };

  // 완료 후 초기화 로직
  const resetAfterSave = useCallback(() => {
    showToast('저장되었습니다.', 'success');
    if (mainTab === 'camper') {
      setCamperData(initialCamperData);
      localStorage.removeItem('spec-camper');
    } else {
      setCaravanData(initialCaravanData);
      localStorage.removeItem('spec-caravan');
    }
    setStep(1);
    setFieldErrors({});
    setShowResult(false);
  }, [mainTab]);

  // 완료 버튼 - 중복 확인 후 저장
  const handleComplete = async () => {
    const data = mainTab === 'camper' ? camperData : caravanData;
    // 먼저 결과 모달 닫기
    setShowResult(false);
    if (data.vehicleNumber.trim()) {
      await saveWithDuplicateCheck(mainTab, resetAfterSave);
    } else {
      resetAfterSave();
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as FormStep);
    }
  };

  const handleMainTabChange = (tab: MainTab) => {
    setMainTab(tab);
    setStep(1);
    setFieldErrors({});
  };

  // 실제 PNG 다운로드 로직
  const performDownloadPNG = async (type: MainTab) => {
    const container = type === 'camper' ? camperResultRef.current : caravanResultRef.current;
    if (!container) {
      showToast('컨테이너를 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      const dataUrl = await domToPng(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        fetch: { bypassingCache: true },
      });

      const img = new Image();
      img.onload = () => {
        const padding = 40;
        const size = Math.max(img.width, img.height) + padding * 2;

        const squareCanvas = document.createElement('canvas');
        squareCanvas.width = size;
        squareCanvas.height = size;
        const ctx = squareCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);

          const x = (size - img.width) / 2;
          const y = (size - img.height) / 2;
          ctx.drawImage(img, x, y);

          squareCanvas.toBlob((finalBlob) => {
            if (finalBlob) {
              const url = URL.createObjectURL(finalBlob);
              const modelName = type === 'camper' ? camperData.modelName : caravanData.modelName;
              const link = document.createElement('a');
              link.href = url;
              link.download = `${modelName || '옵션표'}_옵션표.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      };
      img.src = dataUrl;
      showToast('저장 및 다운로드 완료', 'success');
    } catch (e) {
      console.error(e);
      showToast('PNG 생성 실패', 'error');
    }
  };

  // PNG 다운로드 (중복 확인 후)
  const downloadPNG = async (type: MainTab) => {
    const data = type === 'camper' ? camperData : caravanData;
    if (data.vehicleNumber.trim()) {
      await saveWithDuplicateCheck(type, () => performDownloadPNG(type));
    } else {
      await performDownloadPNG(type);
    }
  };

  const yearData = mainTab === 'camper' ? parseYear(camperData.year) : parseYear(caravanData.year);

  return (
    <div className="min-h-dvh bg-gray-100 font-sans">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-sm font-medium text-gray-600 sm:block">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="shrink-0 whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:bg-gray-200"
            >
              로그아웃
            </button>
          </div>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <label htmlFor="vehicle-search" className="sr-only">차량번호 검색</label>
            <input
              id="vehicle-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchByVehicleNumber()}
              placeholder="차량번호, 모델명, 제조사"
              aria-label="차량번호, 모델명, 제조사 검색"
              className="w-full max-w-48 rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500"
            />
            <button
              onClick={searchByVehicleNumber}
              className="rounded-lg bg-accent-500 p-1.5 text-white transition-all hover:bg-accent-600"
              title="검색"
              aria-label="차량번호 검색 실행"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-5">
        {/* 좌측: 폼 영역 */}
        <div className="relative w-full max-w-[520px] shrink-0">
          {/* 폼 로딩 오버레이 */}
          <AnimatePresence>
            {formLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className="h-8 w-8 animate-spin text-accent-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">데이터 불러오는 중...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* 삭제 확인 모달 */}
        <AnimatePresence>
          {deleteModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
              onClick={() => setDeleteModal({ show: false, vehicleNumber: '' })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">데이터 삭제</h3>
                  <p className="mt-2 text-base text-gray-500">
                    차량번호 <span className="font-semibold text-red-600">{deleteModal.vehicleNumber}</span>
                    <br />데이터를 삭제하시겠습니까?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, vehicleNumber: '' })}
                    className="flex-1 rounded-xl bg-gray-100 py-3 text-base font-semibold text-gray-600 transition-all hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 rounded-xl bg-red-500 py-3 text-base font-semibold text-white transition-all hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 초기화 확인 모달 */}
        <AnimatePresence>
          {resetModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
              onClick={() => setResetModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">입력 초기화</h3>
                  <p className="mt-2 text-base text-gray-500">
                    <span className="font-semibold text-red-500">{mainTab === 'camper' ? '캠핑카' : '카라반'}</span> 입력 내용을
                    <br />모두 지우시겠습니까?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setResetModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmReset}
                    className="flex-1 rounded-xl bg-red-500 py-3 text-base font-semibold text-white transition-all hover:bg-red-600"
                  >
                    초기화
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 덮어쓰기 확인 모달 */}
        <AnimatePresence>
          {overwriteModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
              onClick={() => setOverwriteModal({ show: false, callback: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">중복 차량번호</h3>
                  <p className="mt-2 text-base text-gray-500">
                    이미 저장된 차량번호입니다.
                    <br />기존 데이터를 <span className="font-semibold text-amber-600">덮어쓰시겠습니까?</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOverwriteModal({ show: false, callback: null })}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (overwriteModal.callback) {
                        overwriteModal.callback();
                      }
                      setOverwriteModal({ show: false, callback: null });
                    }}
                    className="flex-1 rounded-xl bg-amber-500 py-3 text-base font-semibold text-white transition-all hover:bg-amber-600"
                  >
                    덮어쓰기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast 알림 */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto fixed bottom-6 left-1/2 z-40 w-full max-w-xs -translate-x-1/2"
            >
              <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      {toast.type === 'success' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      )}
                      {toast.type === 'error' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {toast.type === 'warning' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400">
                          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-base font-medium text-gray-900">{toast.message}</p>
                    </div>
                    <div className="ml-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setToast({ show: false, message: '', type: 'success' })}
                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 애니메이션 메인 탭 */}
        <Tabs
          defaultValue="camper"
          value={mainTab}
          onValueChange={(value) => handleMainTabChange(value as MainTab)}
          className="mb-3"
        >
          <TabsList
            className="grid w-full grid-cols-2 bg-white shadow-sm"
            indicatorClassName="bg-accent-500"
          >
            <TabsTrigger
              value="camper"
              className="rounded-lg py-3 text-base font-semibold text-gray-400 data-[state=active]:text-white"
            >
              캠핑카
            </TabsTrigger>
            <TabsTrigger
              value="caravan"
              className="rounded-lg py-3 text-base font-semibold text-gray-400 data-[state=active]:text-white"
            >
              카라반
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 차량번호 입력 (항상 표시) */}
        <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-gray-500">
            차량번호 <span className="text-gray-400">(저장/검색용 · 결과표에 표시 안됨)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={mainTab === 'camper' ? camperData.vehicleNumber : caravanData.vehicleNumber}
              onChange={(e) => {
                if (mainTab === 'camper') {
                  setCamperData({ ...camperData, vehicleNumber: e.target.value });
                } else {
                  setCaravanData({ ...caravanData, vehicleNumber: e.target.value });
                }
                setFieldErrors(prev => { const next = {...prev}; delete next.vehicleNumber; return next; });
              }}
              placeholder="예: 12가1234"
              className={`form-input ${fieldErrors.vehicleNumber ? 'form-input-error pr-10' : ''}`}
            />
            {fieldErrors.vehicleNumber && (
              <div className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-red-400">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            )}
          </div>
        </div>

        {/* 폼 콘텐츠 (슬라이드 + 블러 애니메이션) */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <Tabs value={`${mainTab}-${step}`} className="w-full">
            <TabsContents className="min-h-[400px]">
              {/* 캠핑카 폼 단계 */}
              <TabsContent value="camper-1" className="p-5">
                <CamperForm step={1} data={camperData} setData={setCamperData} errors={fieldErrors} clearError={(key) => setFieldErrors(prev => { const next = {...prev}; delete next[key]; return next; })} />
              </TabsContent>
              <TabsContent value="camper-2" className="p-5">
                <CamperForm step={2} data={camperData} setData={setCamperData} />
              </TabsContent>
              <TabsContent value="camper-3" className="p-5">
                <CamperForm step={3} data={camperData} setData={setCamperData} />
              </TabsContent>
              {/* 카라반 폼 단계 */}
              <TabsContent value="caravan-1" className="p-5">
                <CaravanForm step={1} data={caravanData} setData={setCaravanData} errors={fieldErrors} clearError={(key) => setFieldErrors(prev => { const next = {...prev}; delete next[key]; return next; })} />
              </TabsContent>
              <TabsContent value="caravan-2" className="p-5">
                <CaravanForm step={2} data={caravanData} setData={setCaravanData} />
              </TabsContent>
              <TabsContent value="caravan-3" className="p-5">
                <CaravanForm step={3} data={caravanData} setData={setCaravanData} />
              </TabsContent>
            </TabsContents>
          </Tabs>

          {/* 하단 버튼 */}
          <div className="flex gap-2 border-t border-gray-100 p-5">
            {step === 1 ? (
              <button
                onClick={openResetModal}
                className="flex-1 rounded-xl border border-accent-500 bg-white py-3 text-base font-semibold text-accent-500 transition-all hover:bg-accent-50"
              >
                초기화
              </button>
            ) : (
              <button
                onClick={goPrev}
                className="flex-1 rounded-xl border border-accent-500 bg-white py-3 text-base font-semibold text-accent-500 transition-all hover:bg-accent-50"
              >
                이전
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 rounded-xl bg-accent-500 py-3 text-base font-semibold text-white transition-all hover:bg-accent-600"
            >
              {step === 3 ? '미리보기' : '다음'}
            </button>
          </div>
        </div>
        </div>
        {/* 좌측 폼 영역 끝 */}

        {/* 우측: 차량 카드 리스트 */}
        <div className="hidden flex-1 lg:block">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-xl bg-white p-4 shadow-sm">
            {listLoading ? (
              <div className="py-8 text-center text-sm text-gray-400">로딩 중...</div>
            ) : vehicleList.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">저장된 차량이 없습니다</div>
            ) : (() => {
              const filteredList = vehicleList.filter((item) => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.trim().toLowerCase();
                return (
                  item.vehicleNumber.toLowerCase().includes(query) ||
                  (item.modelName && item.modelName.toLowerCase().includes(query)) ||
                  (item.manufacturer && item.manufacturer.toLowerCase().includes(query))
                );
              });

              if (filteredList.length === 0) {
                return (
                  <div className="py-8 text-center text-sm text-gray-400">
                    &apos;{searchQuery}&apos; 검색 결과가 없습니다
                  </div>
                );
              }

              return (
              <div className="grid grid-cols-3 gap-3">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.vehicleNumber} ${item.vehicleType === 'camper' ? '캠핑카' : '카라반'} 불러오기`}
                    onClick={() => loadVehicleFromCard(item.vehicleNumber, item.vehicleType)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        loadVehicleFromCard(item.vehicleNumber, item.vehicleType);
                      }
                    }}
                    className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-accent-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{item.vehicleNumber}</span>
                      {item.isIncomplete && (
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white"
                          title="옵션 미입력"
                        >
                          !
                        </span>
                      )}
                      <span className={`ml-auto rounded px-1.5 py-0.5 text-xs font-medium ${item.vehicleType === 'camper' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {item.vehicleType === 'camper' ? '캠핑카' : '카라반'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(item.vehicleNumber);
                        }}
                        className="rounded p-0.5 text-gray-300 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-500 group-hover:opacity-100 focus:opacity-100"
                        title="삭제"
                        aria-label={`${item.vehicleNumber} 삭제`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">{item.modelName || '모델명 없음'}</div>
                    {item.manufacturer && (
                      <div className="text-xs text-gray-400">{item.manufacturer}</div>
                    )}
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 결과 모달 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
            onClick={(e) => e.target === e.currentTarget && setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex max-h-[95vh] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white"
            >
              <div className="sticky top-0 z-10 flex gap-2.5 border-b border-gray-200 bg-white px-5 py-4">
                <button
                  onClick={() => setShowResult(false)}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50"
                >
                  ← 수정
                </button>
                <button
                  onClick={() => downloadPNG(mainTab)}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-blue-700"
                >
                  PNG 다운로드
                </button>
                <button
                  onClick={handleComplete}
                  className="rounded-xl bg-accent-500 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-accent-600"
                >
                  완료
                </button>
              </div>
              <div className="overflow-auto p-5">
                {mainTab === 'camper' ? (
                  <div ref={camperResultRef} style={{ width: getResultWidth() }} className="bg-white p-6 font-sans">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <ResultCard title="차량 정보" icon={InformationCircleIcon}>
                        <ResultRow label="베이스 차량" value={camperData.baseVehicle || '-'} />
                        <ResultRow label="제조사" value={camperData.manufacturer || '-'} />
                        <ResultRow label="모델명" value={camperData.modelName || '-'} />
                        <ResultRow label="차종" value={camperData.vehicleType || '-'} />
                        <ResultRow
                          label={yearData.label}
                          value={camperData.hasStructureMod && camperData.structureModDate
                            ? `${yearData.value}(${parseFirstReg(camperData.structureModDate)})`
                            : yearData.value}
                        />
                        <ResultRow label="최초등록일" value={parseFirstReg(camperData.firstReg)} />
                        <ResultRow
                          label="주행거리"
                          value={camperData.mileage ? `${formatNumber(camperData.mileage)} km` : '-'}
                        />
                        <ResultRow label="차고지 증명" value={camperData.garageProof || '-'} />
                        <ResultRow label="필요 면허" value={camperData.license || '-'} />
                      </ResultCard>
                      <ResultCard title="제원" icon={ChatBubbleBottomCenterTextIcon}>
                        <ResultRow label="길이" value={camperData.length ? `${formatNumber(camperData.length)} mm` : '-'} />
                        <ResultRow label="너비" value={camperData.width ? `${formatNumber(camperData.width)} mm` : '-'} />
                        <ResultRow label="높이" value={camperData.height ? `${formatNumber(camperData.height)} mm` : '-'} />
                        <ResultRow label="배기량" value={camperData.displacement ? `${formatNumber(camperData.displacement)} cc` : '-'} />
                        <ResultRow label="연료" value={camperData.fuel || '-'} />
                        <ResultRow label="변속기" value={camperData.transmission || '-'} />
                        <ResultRow label="연비" value={camperData.fuelEconomy ? `등록증상 ${camperData.fuelEconomy} km/L` : '-'} />
                        <ResultRow label="승차정원" value={camperData.seatCapacity ? `${camperData.seatCapacity} 인` : '-'} />
                        <ResultRow label="현금 영수증" value={camperData.cashReceipt || '-'} />
                      </ResultCard>
                    </div>
                    <OptionCard>
                      <OptionRow label="전 기">
                        {formatElectric([
                          { label: camperData.batteryType || '배터리', value: camperData.batteryCapacity, unit: 'Ah' },
                          { label: '태양광', value: camperData.solar, unit: 'W' },
                          { label: '인버터', value: camperData.inverter, unit: 'Kw' },
                        ])}
                      </OptionRow>
                      <OptionRow label="외 관">{formatOptions(camperData.exterior)}</OptionRow>
                      <OptionRow label="내 장">{formatOptions(camperData.interior)}</OptionRow>
                      <OptionRow label="편 의">{formatOptions(camperData.convenience)}</OptionRow>
                    </OptionCard>
                  </div>
                ) : (
                  <div ref={caravanResultRef} style={{ width: getResultWidth() }} className="bg-white p-6 font-sans">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <ResultCard title="차량 정보" icon={InformationCircleIcon}>
                        <ResultRow label="제조사" value={caravanData.manufacturer || '-'} />
                        <ResultRow label="모델명" value={caravanData.modelName || '-'} />
                        <ResultRow label="차종" value={caravanData.vehicleType || '-'} />
                        <ResultRow
                          label={yearData.label}
                          value={caravanData.hasStructureMod && caravanData.structureModDate
                            ? `${yearData.value}(${parseFirstReg(caravanData.structureModDate)})`
                            : yearData.value}
                        />
                        <ResultRow label="최초등록일" value={parseFirstReg(caravanData.firstReg)} />
                        <ResultRow label="차고지 증명" value={caravanData.garageProof || '-'} />
                        <ResultRow label="취침인원" value={caravanData.sleepCapacity ? `${caravanData.sleepCapacity} 인` : '-'} />
                        <ResultRow label="현금 영수증" value={caravanData.cashReceipt || '-'} />
                      </ResultCard>
                      <ResultCard title="제원" icon={ChatBubbleBottomCenterTextIcon}>
                        <ResultRow label="외부 길이" value={caravanData.extLength ? `${formatNumber(caravanData.extLength)} mm` : '-'} />
                        <ResultRow label="내부 길이" value={caravanData.intLength ? `${formatNumber(caravanData.intLength)} mm` : '-'} />
                        <ResultRow label="외부 너비" value={caravanData.extWidth ? `${formatNumber(caravanData.extWidth)} mm` : '-'} />
                        <ResultRow label="내부 너비" value={caravanData.intWidth ? `${formatNumber(caravanData.intWidth)} mm` : '-'} />
                        <ResultRow label="외부 높이" value={caravanData.extHeight ? `${formatNumber(caravanData.extHeight)} mm` : '-'} />
                        <ResultRow label="내부 높이" value={caravanData.intHeight ? `${formatNumber(caravanData.intHeight)} mm` : '-'} />
                        <ResultRow label="공차 중량" value={caravanData.curbWeight ? `${formatNumber(caravanData.curbWeight)} kg` : '-'} />
                        <ResultRow label="최대 허용 중량" value={caravanData.maxWeight ? `${formatNumber(caravanData.maxWeight)} kg` : '-'} />
                      </ResultCard>
                    </div>
                    <OptionCard>
                      <OptionRow label="전 기">
                        {formatElectric([
                          { label: caravanData.batteryType || '배터리', value: caravanData.batteryCapacity, unit: 'Ah' },
                          { label: '태양광', value: caravanData.solar, unit: 'W' },
                          { label: '인버터', value: caravanData.inverter, unit: 'Kw' },
                        ])}
                      </OptionRow>
                      <OptionRow label="외 관">{formatOptions(caravanData.exterior)}</OptionRow>
                      <OptionRow label="내 장">{formatOptions(caravanData.interior)}</OptionRow>
                      <OptionRow label="편 의">{formatOptions(caravanData.convenience)}</OptionRow>
                    </OptionCard>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 캠핑카 폼 (단계별)
function CamperForm({
  step,
  data,
  setData,
  errors = {},
  clearError,
}: {
  step: FormStep;
  data: CamperData;
  setData: React.Dispatch<React.SetStateAction<CamperData>>;
  errors?: Record<string, string>;
  clearError?: (key: string) => void;
}) {
  if (step === 1) {
    return (
      <>
        <SectionTitle>차량 정보</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="베이스 차량">
            <div className="relative">
              <input type="text" value={data.baseVehicle} onChange={(e) => { setData({ ...data, baseVehicle: e.target.value }); clearError?.('baseVehicle'); }} placeholder="예: 현대 포터2" className={`form-input ${errors.baseVehicle ? 'form-input-error pr-10' : ''}`} />
              {errors.baseVehicle && <ErrorIcon />}
            </div>
          </FormRow>
          <FormRow label="제조사">
            <div className="relative">
              <input type="text" value={data.manufacturer} onChange={(e) => { setData({ ...data, manufacturer: e.target.value }); clearError?.('manufacturer'); }} placeholder="예: 제일모빌" className={`form-input ${errors.manufacturer ? 'form-input-error pr-10' : ''}`} />
              {errors.manufacturer && <ErrorIcon />}
            </div>
          </FormRow>
        </div>
        <FormRow label="모델명">
          <div className="relative">
            <input type="text" value={data.modelName} onChange={(e) => { setData({ ...data, modelName: e.target.value }); clearError?.('modelName'); }} placeholder="예: 드림스페이스" className={`form-input ${errors.modelName ? 'form-input-error pr-10' : ''}`} />
            {errors.modelName && <ErrorIcon />}
          </div>
        </FormRow>
        <FormRow label="연식" hint="월 입력 시 '제작연월'로 표시">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={data.year.split('.')[0] || ''}
              onChange={(e) => {
                const yearVal = onlyNumbers(e.target.value);
                const monthVal = data.year.split('.')[1] || '';
                setData({ ...data, year: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="년"
              className="form-input w-24"
            />
            <input
              type="text"
              inputMode="numeric"
              value={data.year.split('.')[1] || ''}
              onChange={(e) => {
                const yearVal = data.year.split('.')[0] || '';
                const monthVal = onlyNumbers(e.target.value);
                setData({ ...data, year: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="월"
              className="form-input w-16"
            />
          </div>
        </FormRow>
        <FormRow label="최초등록일">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={data.firstReg.split('.')[0] || ''}
              onChange={(e) => {
                const yearVal = onlyNumbers(e.target.value);
                const monthVal = data.firstReg.split('.')[1] || '';
                setData({ ...data, firstReg: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="년"
              className="form-input w-24"
            />
            <input
              type="text"
              inputMode="numeric"
              value={data.firstReg.split('.')[1] || ''}
              onChange={(e) => {
                const yearVal = data.firstReg.split('.')[0] || '';
                const monthVal = onlyNumbers(e.target.value);
                setData({ ...data, firstReg: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="월"
              className="form-input w-16"
            />
          </div>
        </FormRow>
        <div className="mb-2.5">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={data.hasStructureMod}
              onChange={(e) => setData({ ...data, hasStructureMod: e.target.checked, structureModDate: e.target.checked ? data.structureModDate : '' })}
              className="h-4 w-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm font-medium text-gray-500">구조변경</span>
          </label>
          {data.hasStructureMod && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={data.structureModDate.split('.')[0] || ''}
                onChange={(e) => {
                  const yearVal = onlyNumbers(e.target.value);
                  const monthVal = data.structureModDate.split('.')[1] || '';
                  setData({ ...data, structureModDate: monthVal ? `${yearVal}.${monthVal}` : yearVal });
                }}
                placeholder="년"
                className="form-input w-24"
              />
              <input
                type="text"
                inputMode="numeric"
                value={data.structureModDate.split('.')[1] || ''}
                onChange={(e) => {
                  const yearVal = data.structureModDate.split('.')[0] || '';
                  const monthVal = onlyNumbers(e.target.value);
                  setData({ ...data, structureModDate: monthVal ? `${yearVal}.${monthVal}` : yearVal });
                }}
                placeholder="월"
                className="form-input w-16"
              />
            </div>
          )}
        </div>
        <FormRow label="주행거리">
          <div className="relative">
            <input type="text" inputMode="numeric" value={data.mileage} onChange={(e) => { setData({ ...data, mileage: onlyNumbers(e.target.value) }); clearError?.('mileage'); }} placeholder="예: 35000" className={`form-input ${errors.mileage ? 'form-input-error pr-10' : ''}`} />
            {errors.mileage && <ErrorIcon />}
          </div>
        </FormRow>
        {/* 드롭다운 2x2 그리드 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <FormRow label="차종">
            <FormSelect value={data.vehicleType} onChange={(e) => setData({ ...data, vehicleType: e.target.value })}>
              <option value="소형 특수">소형 특수</option>
              <option value="중형 특수">중형 특수</option>
              <option value="중형 승합">중형 승합</option>
              <option value="대형 승합">대형 승합</option>
              <option value="소형 화물">소형 화물</option>
            </FormSelect>
          </FormRow>
          <FormRow label="차고지 증명">
            <FormSelect value={data.garageProof} onChange={(e) => setData({ ...data, garageProof: e.target.value })}>
              <option value="불필요">불필요</option>
              <option value="필요(도와드릴게요)">필요(도와드릴게요)</option>
            </FormSelect>
          </FormRow>
          <FormRow label="필요 면허">
            <FormSelect value={data.license} onChange={(e) => setData({ ...data, license: e.target.value })}>
              <option value="1종 보통면허">1종 보통면허</option>
              <option value="1종 대형면허">1종 대형면허</option>
              <option value="2종 보통면허">2종 보통면허</option>
            </FormSelect>
          </FormRow>
          <FormRow label="현금영수증">
            <FormSelect value={data.cashReceipt} onChange={(e) => setData({ ...data, cashReceipt: e.target.value })}>
              <option value="가능">가능</option>
              <option value="불가능">불가능</option>
            </FormSelect>
          </FormRow>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <SectionTitle>제원</SectionTitle>
        <FormRow label="길이 (mm)">
          <input type="text" inputMode="numeric" value={data.length} onChange={(e) => setData({ ...data, length: onlyNumbers(e.target.value) })} placeholder="예: 7315" className="form-input" />
        </FormRow>
        <FormRow label="너비 (mm)">
          <input type="text" inputMode="numeric" value={data.width} onChange={(e) => setData({ ...data, width: onlyNumbers(e.target.value) })} placeholder="예: 2060" className="form-input" />
        </FormRow>
        <FormRow label="높이 (mm)">
          <input type="text" inputMode="numeric" value={data.height} onChange={(e) => setData({ ...data, height: onlyNumbers(e.target.value) })} placeholder="예: 2850" className="form-input" />
        </FormRow>
        <FormRow label="배기량 (cc)">
          <input type="text" inputMode="numeric" value={data.displacement} onChange={(e) => setData({ ...data, displacement: onlyNumbers(e.target.value) })} placeholder="예: 2497" className="form-input" />
        </FormRow>
        <FormRow label="연비 (km/L)">
          <input type="text" inputMode="decimal" value={data.fuelEconomy} onChange={(e) => setData({ ...data, fuelEconomy: onlyDecimal(e.target.value) })} placeholder="예: 8.5" className="form-input" />
        </FormRow>
        <FormRow label="승차정원">
          <input type="text" inputMode="numeric" value={data.seatCapacity} onChange={(e) => setData({ ...data, seatCapacity: onlyNumbers(e.target.value) })} placeholder="예: 9" className="form-input" />
        </FormRow>
        {/* 드롭다운 1x2 그리드 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <FormRow label="연료">
            <FormSelect value={data.fuel} onChange={(e) => setData({ ...data, fuel: e.target.value })}>
              <option value="경유">경유</option>
              <option value="휘발유">휘발유</option>
              <option value="LPG">LPG</option>
            </FormSelect>
          </FormRow>
          <FormRow label="변속기">
            <FormSelect value={data.transmission} onChange={(e) => setData({ ...data, transmission: e.target.value })}>
              <option value="자동">자동</option>
              <option value="수동">수동</option>
            </FormSelect>
          </FormRow>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionTitle>전기</SectionTitle>
      <FormRow label="배터리">
        <div className="flex gap-2">
          <FormSelect value={data.batteryType} onChange={(e) => setData({ ...data, batteryType: e.target.value })} className="w-24 shrink-0">
            <option value="인산철">인산철</option>
            <option value="딥싸이클">딥싸이클</option>
          </FormSelect>
          <input type="text" inputMode="numeric" value={data.batteryCapacity} onChange={(e) => setData({ ...data, batteryCapacity: onlyNumbers(e.target.value) })} placeholder="(용량) Ah" className="form-input min-w-0 flex-1" />
        </div>
      </FormRow>
      <FormRow label="태양광 (W)">
        <input type="text" inputMode="numeric" value={data.solar} onChange={(e) => setData({ ...data, solar: onlyNumbers(e.target.value) })} placeholder="(용량) W" className="form-input" />
      </FormRow>
      <FormRow label="인버터 (Kw)">
        <input type="text" value={data.inverter} onChange={(e) => setData({ ...data, inverter: onlyDecimalPlus(e.target.value) })} placeholder="(용량) Kw" className="form-input" />
      </FormRow>
      <SectionTitle>옵션</SectionTitle>
      <FormRow label="외관" hint="스페이스 2번 → 자동으로 • 변환">
        <textarea value={data.exterior} onChange={(e) => setData({ ...data, exterior: e.target.value })} placeholder="스페이스 2번으로 구분" className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="내장">
        <textarea value={data.interior} onChange={(e) => setData({ ...data, interior: e.target.value })} placeholder="스페이스 2번으로 구분" className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="편의">
        <textarea value={data.convenience} onChange={(e) => setData({ ...data, convenience: e.target.value })} placeholder="스페이스 2번으로 구분" className="form-input min-h-[70px] resize-y" />
      </FormRow>
    </>
  );
}

// 카라반 폼 (단계별)
function CaravanForm({
  step,
  data,
  setData,
  errors = {},
  clearError,
}: {
  step: FormStep;
  data: CaravanData;
  setData: React.Dispatch<React.SetStateAction<CaravanData>>;
  errors?: Record<string, string>;
  clearError?: (key: string) => void;
}) {
  if (step === 1) {
    return (
      <>
        <SectionTitle>차량 정보</SectionTitle>
        <FormRow label="제조사">
          <div className="relative">
            <input type="text" value={data.manufacturer} onChange={(e) => { setData({ ...data, manufacturer: e.target.value }); clearError?.('manufacturer'); }} placeholder="예: 코치맨(CM카라반)" className={`form-input ${errors.manufacturer ? 'form-input-error pr-10' : ''}`} />
            {errors.manufacturer && <ErrorIcon />}
          </div>
        </FormRow>
        <FormRow label="모델명">
          <div className="relative">
            <input type="text" value={data.modelName} onChange={(e) => { setData({ ...data, modelName: e.target.value }); clearError?.('modelName'); }} placeholder="예: VIP 560" className={`form-input ${errors.modelName ? 'form-input-error pr-10' : ''}`} />
            {errors.modelName && <ErrorIcon />}
          </div>
        </FormRow>
        <FormRow label="차종">
          <FormSelect value={data.vehicleType} onChange={(e) => setData({ ...data, vehicleType: e.target.value })}>
            <option value="소형 특수">소형 특수</option>
            <option value="중형 특수">중형 특수</option>
            <option value="중형 승합">중형 승합</option>
            <option value="대형 승합">대형 승합</option>
            <option value="소형 화물">소형 화물</option>
          </FormSelect>
        </FormRow>
        <FormRow label="연식" hint="월 입력 시 '제작연월'로 표시">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={data.year.split('.')[0] || ''}
              onChange={(e) => {
                const yearVal = onlyNumbers(e.target.value);
                const monthVal = data.year.split('.')[1] || '';
                setData({ ...data, year: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="년"
              className="form-input w-24"
            />
            <input
              type="text"
              inputMode="numeric"
              value={data.year.split('.')[1] || ''}
              onChange={(e) => {
                const yearVal = data.year.split('.')[0] || '';
                const monthVal = onlyNumbers(e.target.value);
                setData({ ...data, year: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="월"
              className="form-input w-16"
            />
          </div>
        </FormRow>
        <FormRow label="최초등록일">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={data.firstReg.split('.')[0] || ''}
              onChange={(e) => {
                const yearVal = onlyNumbers(e.target.value);
                const monthVal = data.firstReg.split('.')[1] || '';
                setData({ ...data, firstReg: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="년"
              className="form-input w-24"
            />
            <input
              type="text"
              inputMode="numeric"
              value={data.firstReg.split('.')[1] || ''}
              onChange={(e) => {
                const yearVal = data.firstReg.split('.')[0] || '';
                const monthVal = onlyNumbers(e.target.value);
                setData({ ...data, firstReg: monthVal ? `${yearVal}.${monthVal}` : yearVal });
              }}
              placeholder="월"
              className="form-input w-16"
            />
          </div>
        </FormRow>
        <div className="mb-2.5">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={data.hasStructureMod}
              onChange={(e) => setData({ ...data, hasStructureMod: e.target.checked, structureModDate: e.target.checked ? data.structureModDate : '' })}
              className="h-4 w-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm font-medium text-gray-500">구조변경</span>
          </label>
          {data.hasStructureMod && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={data.structureModDate.split('.')[0] || ''}
                onChange={(e) => {
                  const yearVal = onlyNumbers(e.target.value);
                  const monthVal = data.structureModDate.split('.')[1] || '';
                  setData({ ...data, structureModDate: monthVal ? `${yearVal}.${monthVal}` : yearVal });
                }}
                placeholder="년"
                className="form-input w-24"
              />
              <input
                type="text"
                inputMode="numeric"
                value={data.structureModDate.split('.')[1] || ''}
                onChange={(e) => {
                  const yearVal = data.structureModDate.split('.')[0] || '';
                  const monthVal = onlyNumbers(e.target.value);
                  setData({ ...data, structureModDate: monthVal ? `${yearVal}.${monthVal}` : yearVal });
                }}
                placeholder="월"
                className="form-input w-16"
              />
            </div>
          )}
        </div>
        <FormRow label="취침인원">
          <input type="text" inputMode="numeric" value={data.sleepCapacity} onChange={(e) => setData({ ...data, sleepCapacity: onlyNumbers(e.target.value) })} placeholder="예: 4" className="form-input" />
        </FormRow>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="차고지 증명">
            <FormSelect value={data.garageProof} onChange={(e) => setData({ ...data, garageProof: e.target.value })}>
              <option value="불필요">불필요</option>
              <option value="필요(도와드릴게요)">필요(도와드릴게요)</option>
            </FormSelect>
          </FormRow>
          <FormRow label="현금 영수증">
            <FormSelect value={data.cashReceipt} onChange={(e) => setData({ ...data, cashReceipt: e.target.value })}>
              <option value="가능">가능</option>
              <option value="불가능">불가능</option>
            </FormSelect>
          </FormRow>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <SectionTitle>제원</SectionTitle>
        <FormRow label="외부 길이 (mm)">
          <input type="text" inputMode="numeric" value={data.extLength} onChange={(e) => setData({ ...data, extLength: onlyNumbers(e.target.value) })} placeholder="예: 7315" className="form-input" />
        </FormRow>
        <FormRow label="내부 길이 (mm)">
          <input type="text" inputMode="numeric" value={data.intLength} onChange={(e) => setData({ ...data, intLength: onlyNumbers(e.target.value) })} placeholder="예: 5660" className="form-input" />
        </FormRow>
        <FormRow label="외부 높이 (mm)">
          <input type="text" inputMode="numeric" value={data.extHeight} onChange={(e) => setData({ ...data, extHeight: onlyNumbers(e.target.value) })} placeholder="예: 2650" className="form-input" />
        </FormRow>
        <FormRow label="내부 높이 (mm)">
          <input type="text" inputMode="numeric" value={data.intHeight} onChange={(e) => setData({ ...data, intHeight: onlyNumbers(e.target.value) })} placeholder="예: 1955" className="form-input" />
        </FormRow>
        <FormRow label="외부 너비 (mm)">
          <input type="text" inputMode="numeric" value={data.extWidth} onChange={(e) => setData({ ...data, extWidth: onlyNumbers(e.target.value) })} placeholder="예: 2320" className="form-input" />
        </FormRow>
        <FormRow label="내부 너비 (mm)">
          <input type="text" inputMode="numeric" value={data.intWidth} onChange={(e) => setData({ ...data, intWidth: onlyNumbers(e.target.value) })} placeholder="없으면 비워두세요" className="form-input" />
        </FormRow>
        <FormRow label="공차 중량 (kg)">
          <input type="text" inputMode="numeric" value={data.curbWeight} onChange={(e) => setData({ ...data, curbWeight: onlyNumbers(e.target.value) })} placeholder="예: 1450" className="form-input" />
        </FormRow>
        <FormRow label="최대 허용 중량 (kg)">
          <input type="text" inputMode="numeric" value={data.maxWeight} onChange={(e) => setData({ ...data, maxWeight: onlyNumbers(e.target.value) })} placeholder="예: 1800" className="form-input" />
        </FormRow>
      </>
    );
  }

  return (
    <>
      <SectionTitle>전기</SectionTitle>
      <FormRow label="배터리">
        <div className="flex gap-2">
          <FormSelect value={data.batteryType} onChange={(e) => setData({ ...data, batteryType: e.target.value })} className="w-24 shrink-0">
            <option value="인산철">인산철</option>
            <option value="딥싸이클">딥싸이클</option>
          </FormSelect>
          <input type="text" value={data.batteryCapacity} onChange={(e) => setData({ ...data, batteryCapacity: e.target.value })} placeholder="(용량) Ah" className="form-input min-w-0 flex-1" />
        </div>
      </FormRow>
      <FormRow label="태양광 (W)">
        <input type="text" value={data.solar} onChange={(e) => setData({ ...data, solar: e.target.value })} placeholder="(용량) W" className="form-input" />
      </FormRow>
      <FormRow label="인버터 (Kw)">
        <input type="text" value={data.inverter} onChange={(e) => setData({ ...data, inverter: onlyDecimalPlus(e.target.value) })} placeholder="(용량) Kw" className="form-input" />
      </FormRow>
      <SectionTitle>옵션</SectionTitle>
      <FormRow label="외관" hint="스페이스 2번 → 자동으로 • 변환">
        <textarea value={data.exterior} onChange={(e) => setData({ ...data, exterior: e.target.value })} placeholder="스페이스 2번으로 구분" className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="내장">
        <textarea value={data.interior} onChange={(e) => setData({ ...data, interior: e.target.value })} placeholder="스페이스 2번으로 구분" className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="편의">
        <textarea value={data.convenience} onChange={(e) => setData({ ...data, convenience: e.target.value })} placeholder="스페이스 2번으로 구분" className="form-input min-h-[70px] resize-y" />
      </FormRow>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-5 text-sm font-bold uppercase tracking-wide text-accent-500 first:mt-0">
      {children}
    </h3>
  );
}

function ErrorIcon() {
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-red-400">
      <span className="text-xs font-bold text-white">!</span>
    </div>
  );
}

function FormRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <label className="mb-1.5 block text-sm font-medium text-gray-500">{label}</label>
      {children}
      {hint && <div className="mt-1 text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
}

function FormSelect({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg bg-white py-2.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-200 focus:outline-2 focus:-outline-offset-2 focus:outline-accent-500"
      >
        {children}
      </select>
      <svg viewBox="0 0 16 16" fill="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </div>
  );
}

function ResultCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg outline outline-1 -outline-offset-1 outline-gray-200">
      <div className="flex items-center gap-2 bg-accent-500 px-5 py-3.5 text-base font-bold text-white">
        {Icon && <Icon className="size-5" />}
        {title}
      </div>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td className="w-2/5 border-r border-gray-200 bg-gray-50 px-5 py-3.5 text-base font-medium text-gray-500">
        {label}
      </td>
      <td className="bg-white px-5 py-3.5 text-base font-semibold text-gray-900">
        {value}
      </td>
    </tr>
  );
}

function OptionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg outline outline-1 -outline-offset-1 outline-gray-200">
      <div className="flex items-center gap-2 bg-accent-500 px-5 py-3.5 text-base font-bold text-white">
        <Cog6ToothIcon className="size-5" />
        옵션
      </div>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function OptionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td className="w-24 shrink-0 border-r border-gray-200 bg-gray-50 px-5 py-4 text-center text-base font-medium text-gray-500 align-middle">
        {label}
      </td>
      <td className="bg-white px-5 py-4 text-base font-medium text-gray-900">
        {children}
      </td>
    </tr>
  );
}
