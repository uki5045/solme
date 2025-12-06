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

type VehicleStatus = 'intake' | 'productization' | 'advertising';

interface VehicleListItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  updatedAt: string;
  status: VehicleStatus;
  isIncomplete: boolean;
}

export default function SpecPage() {
  const { data: session } = useSession();
  const [mainTab, setMainTab] = useState<MainTab>('camper');
  const [step, setStep] = useState<FormStep>(1);
  const [showResult, setShowResult] = useState(false);
  const [camperData, setCamperData] = useState<CamperData>(initialCamperData);
  const [caravanData, setCaravanData] = useState<CaravanData>(initialCaravanData);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; vehicleNumber: string }>({ show: false, vehicleNumber: '' });
  const [resetModal, setResetModal] = useState(false);
  const [overwriteModal, setOverwriteModal] = useState<{ show: boolean; callback: (() => void) | null }>({ show: false, callback: null });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({ show: false, message: '', type: 'success' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [vehicleList, setVehicleList] = useState<VehicleListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  // 미리보기 전용 상태 (카드 클릭 시 사용)
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{ type: MainTab; data: CamperData | CaravanData } | null>(null);
  const [leftSectionHeight, setLeftSectionHeight] = useState<number>(0);
  const [statusTab, setStatusTab] = useState<VehicleStatus>('intake');
  const [statusIndex, setStatusIndex] = useState(0);
  const [mobileView, setMobileView] = useState<'form' | 'list'>('form');
  const [highlightedVehicle, setHighlightedVehicle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; item: VehicleListItem | null }>({ show: false, x: 0, y: 0, item: null });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTouchRef = useRef<{ x: number; y: number; item: VehicleListItem } | null>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const statusTabListRef = useRef<HTMLDivElement>(null);
  const camperResultRef = useRef<HTMLDivElement>(null);
  const caravanResultRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // Safari 배경색 수정 (검은색 → 밝은 회색)
  useEffect(() => {
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    const originalBodyBg = document.body.style.backgroundColor;

    document.documentElement.style.backgroundColor = '#f3f4f6';
    document.body.style.backgroundColor = '#f3f4f6';

    return () => {
      document.documentElement.style.backgroundColor = originalHtmlBg;
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

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

  // 좌측 섹션 높이 추적 (우측 섹션 높이 동기화용)
  useEffect(() => {
    if (!leftSectionRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setLeftSectionHeight(entry.contentRect.height);
      }
    });
    observer.observe(leftSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 상태 탭 인덱스 계산
  useEffect(() => {
    const statuses: VehicleStatus[] = ['intake', 'productization', 'advertising'];
    setStatusIndex(statuses.indexOf(statusTab));
  }, [statusTab]);

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

  // 상태 변경 함수
  const updateVehicleStatus = async (vehicleNumber: string, newStatus: VehicleStatus) => {
    try {
      const response = await fetch('/api/specs/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        showToast(result.error || '상태 변경에 실패했습니다.', 'error');
        return false;
      }

      // 목록 새로고침
      fetchVehicleList();
      const statusLabels: Record<VehicleStatus, string> = { intake: '입고', productization: '상품화', advertising: '광고' };
      showToast(`${statusLabels[newStatus]}(으)로 변경되었습니다.`, 'success');
      return true;
    } catch {
      showToast('상태 변경 중 오류가 발생했습니다.', 'error');
      return false;
    }
  };

  // 컨텍스트 메뉴 닫기 (외부 클릭 시)
  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ show: false, x: 0, y: 0, item: null });
    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show]);

  // 롱프레스 핸들러 (모바일)
  const handleTouchStart = useCallback((e: React.TouchEvent, item: VehicleListItem) => {
    const touch = e.touches[0];
    longPressTouchRef.current = { x: touch.clientX, y: touch.clientY, item };
    longPressTimerRef.current = setTimeout(() => {
      if (longPressTouchRef.current) {
        setContextMenu({
          show: true,
          x: longPressTouchRef.current.x,
          y: longPressTouchRef.current.y,
          item: longPressTouchRef.current.item,
        });
      }
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current && longPressTouchRef.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - longPressTouchRef.current.x);
      const deltaY = Math.abs(touch.clientY - longPressTouchRef.current.y);
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        longPressTouchRef.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchRef.current = null;
  }, []);

  // 차량번호 입력 시 기존 차량 검색 및 자동 탭 이동 (완전 일치만)
  const searchVehicleByNumber = useCallback((vehicleNumber: string) => {
    if (!vehicleNumber.trim()) {
      setHighlightedVehicle(null);
      return;
    }

    const query = vehicleNumber.trim().toLowerCase();
    const matchedVehicle = vehicleList.find(
      (v) => v.vehicleNumber.toLowerCase() === query
    );

    if (matchedVehicle) {
      // 해당 상태 탭으로 자동 이동
      if (matchedVehicle.status !== statusTab) {
        setStatusTab(matchedVehicle.status);
      }
      // 해당 차량 하이라이트
      setHighlightedVehicle(matchedVehicle.vehicleNumber);
      // 모바일에서는 차량 목록으로 전환
      if (window.innerWidth < 1024) {
        setMobileView('list');
      }
    } else {
      setHighlightedVehicle(null);
    }
  }, [vehicleList, statusTab]);

  // 카드 클릭 시 미리보기 모달만 표시 (폼에 데이터 넣지 않음)
  const loadVehicleFromCard = async (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => {
    setPreviewLoading(true);
    try {
      const response = await fetch(`/api/specs?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || '데이터를 불러올 수 없습니다.', 'error');
        return;
      }

      const { data } = result;
      const savedData = data.data as Record<string, string>;

      // 미리보기 데이터만 설정 (폼에는 넣지 않음)
      if (vehicleType === 'camper') {
        setPreviewData({ type: 'camper', data: { ...initialCamperData, ...savedData } });
      } else {
        setPreviewData({ type: 'caravan', data: { ...initialCaravanData, ...savedData } });
      }
      // 옵션표 모달 표시
      setShowResult(true);
    } catch (e) {
      console.error('데이터 로드 오류:', e);
      showToast('데이터 로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 미리보기에서 수정 버튼 클릭 시 폼에 데이터 적용
  const applyPreviewToForm = () => {
    if (!previewData) return;

    if (previewData.type === 'camper') {
      setCamperData(previewData.data as CamperData);
      setMainTab('camper');
    } else {
      setCaravanData(previewData.data as CaravanData);
      setMainTab('caravan');
    }

    setStep(1);
    setFieldErrors({});
    setShowResult(false);
    setPreviewData(null);
    showToast('데이터를 불러왔습니다. 수정 후 완료를 눌러주세요.', 'success');
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
        {validItems.map((item, index) => {
          // 숫자와 소수점만 포함된 경우에만 포맷 적용
          const isNumberOnly = /^[\d.]+$/.test(item.value.trim());
          const displayValue = isNumberOnly ? formatNumber(item.value) : item.value;
          return (
            <span
              key={index}
              className="inline-block whitespace-nowrap rounded bg-gray-100 px-2 py-0.5 text-sm"
            >
              <span className="text-gray-700">{item.label} {displayValue} {item.unit}</span>
            </span>
          );
        })}
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
  const resetAfterSave = useCallback((type: MainTab) => {
    showToast('저장되었습니다.', 'success');
    if (type === 'camper') {
      setCamperData(initialCamperData);
      localStorage.removeItem('spec-camper');
    } else {
      setCaravanData(initialCaravanData);
      localStorage.removeItem('spec-caravan');
    }
    setStep(1);
    setFieldErrors({});
    setShowResult(false);
  }, []);

  // 완료 버튼 - 중복 확인 후 저장
  const handleComplete = async () => {
    const data = mainTab === 'camper' ? camperData : caravanData;
    const currentTab = mainTab; // 클로저 문제 방지
    // 먼저 결과 모달 닫기
    setShowResult(false);
    if (data.vehicleNumber.trim()) {
      await saveWithDuplicateCheck(currentTab, () => resetAfterSave(currentTab));
    } else {
      resetAfterSave(currentTab);
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

  // PNG 다운로드 (저장 없이 다운로드만)
  const downloadPNG = async (type: MainTab) => {
    setShowResult(false);
    await performDownloadPNG(type);
  };

  const yearData = mainTab === 'camper' ? parseYear(camperData.year) : parseYear(caravanData.year);

  return (
    <>
      {/* iOS PWA Safe Area 배경 - 시스템 테마 자동 적응 */}
      <div
        className="fixed inset-0 -z-10 bg-gray-100 dark:bg-[#111111]"
        aria-hidden="true"
      />

      <div className="min-h-dvh bg-gray-100 font-sans text-gray-900 dark:bg-[#111111] dark:text-gray-100">
      {/* 헤더 - PC만 */}
      <div className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-md dark:border-gray-700 dark:bg-[#1a1a1a]/80 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-sm font-medium text-gray-600 dark:text-gray-400 sm:block">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="shrink-0 whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-32 pt-[calc(env(safe-area-inset-top)+1rem)] lg:flex-row lg:items-start lg:gap-6 lg:pb-5 lg:pt-5">

        {/* 좌측: 폼 영역 */}
        <div ref={leftSectionRef} className={`relative w-full max-w-[520px] shrink-0 ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>

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

        {/* 차량 검색 (데스크탑에서만 표시) */}
        <div className="mb-3 hidden rounded-2xl bg-white p-4 shadow-sm lg:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="차량번호, 모델명, 제조사로 검색"
            className="form-input"
          />
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

        {/* 우측: 차량 카드 리스트 (상태별 탭) */}
        <div
          className={`relative flex-1 flex-col ${mobileView === 'form' ? 'hidden lg:flex' : 'flex'}`}
          style={{ height: leftSectionHeight > 0 ? `${leftSectionHeight}px` : 'auto' }}
        >
          {/* 미리보기 로딩 오버레이 */}
          {previewLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500"></div>
                <span className="text-sm text-gray-500">불러오는 중...</span>
              </div>
            </div>
          )}
          {/* 상태 탭 헤더 (캠핑카/카라반 탭과 동일 스타일 + 애니메이션) */}
          <div ref={statusTabListRef} className="relative mb-3 grid shrink-0 grid-cols-3 rounded-xl bg-white p-1 shadow-sm">
            {/* 슬라이딩 인디케이터 */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg"
              style={{
                width: 'calc(33.333% - 2.67px)',
                left: 4,
                backgroundColor: statusTab === 'intake' ? '#6b7280' : statusTab === 'productization' ? '#f59e0b' : '#22c55e',
              }}
              animate={{
                x: `${statusIndex * 100}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 20,
                mass: 1,
              }}
            />
            {(['intake', 'productization', 'advertising'] as VehicleStatus[]).map((status) => {
              const count = vehicleList.filter(v => v.status === status).length;
              const labels: Record<VehicleStatus, string> = { intake: '입고', productization: '상품화', advertising: '광고' };
              const isActive = statusTab === status;
              return (
                <button
                  key={status}
                  data-status={status}
                  onClick={() => setStatusTab(status)}
                  className={`relative z-10 flex flex-row items-center justify-center gap-1.5 rounded-lg py-3 text-base font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                  <span className="whitespace-nowrap">{labels[status]}</span>
                </button>
              );
            })}
          </div>

          {/* 차량 검색 (모바일에서만 표시) */}
          <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm lg:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="차량번호, 모델명, 제조사로 검색"
              className="form-input"
            />
          </div>

          {/* 카드 리스트 영역 */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto p-4">
              {listLoading ? (
                <div className="py-8 text-center text-sm text-gray-400">로딩 중...</div>
              ) : (() => {
                const filteredList = vehicleList
                  .filter((item) => item.status === statusTab)
                  .filter((item) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    // 차량번호, 모델명, 제조사로 검색
                    return (
                      item.vehicleNumber.toLowerCase().includes(query) ||
                      (item.modelName && item.modelName.toLowerCase().includes(query)) ||
                      (item.manufacturer && item.manufacturer.toLowerCase().includes(query))
                    );
                  });

                if (filteredList.length === 0) {
                  const labels: Record<VehicleStatus, string> = { intake: '입고', productization: '상품화', advertising: '광고' };
                  return (
                    <div className="py-8 text-center text-sm text-gray-400">
                      {searchQuery.trim()
                        ? `"${searchQuery}" 검색 결과가 없습니다`
                        : `${labels[statusTab]} 상태의 차량이 없습니다`
                      }
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {filteredList.map((item) => (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.vehicleNumber} ${item.vehicleType === 'camper' ? '캠핑카' : '카라반'} 불러오기`}
                        onClick={() => {
                          // 롱프레스로 메뉴가 열린 경우 클릭 무시
                          if (!contextMenu.show) {
                            loadVehicleFromCard(item.vehicleNumber, item.vehicleType);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
                        }}
                        onTouchStart={(e) => handleTouchStart(e, item)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            loadVehicleFromCard(item.vehicleNumber, item.vehicleType);
                          }
                        }}
                        className={`group relative cursor-pointer select-none rounded-lg border p-3 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-500 ${
                          highlightedVehicle === item.vehicleNumber
                            ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400'
                            : 'border-gray-200 bg-white hover:border-accent-300'
                        }`}
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

          {/* 컨텍스트 메뉴 (우클릭) */}
          {contextMenu.show && contextMenu.item && (
            <div
              className="fixed z-50 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상태 변경 */}
              {(['intake', 'productization', 'advertising'] as VehicleStatus[]).map((status) => {
                const labels: Record<VehicleStatus, string> = { intake: '입고', productization: '상품화', advertising: '광고' };
                const isCurrentStatus = contextMenu.item?.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      if (contextMenu.item && !isCurrentStatus) {
                        updateVehicleStatus(contextMenu.item.vehicleNumber, status);
                      }
                      setContextMenu({ show: false, x: 0, y: 0, item: null });
                    }}
                    disabled={isCurrentStatus}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                      isCurrentStatus
                        ? 'bg-gray-50 text-gray-400'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isCurrentStatus && (
                      <svg className="h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={isCurrentStatus ? '' : 'ml-6'}>{labels[status]}</span>
                  </button>
                );
              })}

              {/* 구분선 */}
              <div className="my-1 border-t border-gray-100" />

              {/* 수정 */}
              <button
                onClick={() => {
                  if (contextMenu.item) {
                    loadVehicleFromCard(contextMenu.item.vehicleNumber, contextMenu.item.vehicleType);
                  }
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>

              {/* 삭제 */}
              <button
                onClick={() => {
                  if (contextMenu.item) {
                    openDeleteModal(contextMenu.item.vehicleNumber);
                  }
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 결과 모달 */}
      <AnimatePresence>
        {showResult && (() => {
          // 미리보기 데이터가 있으면 사용, 없으면 현재 폼 데이터 사용
          const isPreviewMode = !!previewData;
          const displayType = previewData?.type || mainTab;
          const displayCamperData = (previewData?.type === 'camper' ? previewData.data : camperData) as CamperData;
          const displayCaravanData = (previewData?.type === 'caravan' ? previewData.data : caravanData) as CaravanData;
          const displayYearData = displayType === 'camper' ? parseYear(displayCamperData.year) : parseYear(displayCaravanData.year);

          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowResult(false);
                setPreviewData(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex max-h-[95vh] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white"
            >
              <div className="sticky top-0 z-10 flex gap-2.5 border-b border-gray-200 bg-white px-5 py-4">
                <button
                  onClick={() => {
                    if (isPreviewMode) {
                      applyPreviewToForm();
                    } else {
                      setShowResult(false);
                    }
                  }}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50"
                >
                  ← 수정
                </button>
                <button
                  onClick={() => downloadPNG(displayType)}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-blue-700"
                >
                  PNG 다운로드
                </button>
                {!isPreviewMode && (
                  <button
                    onClick={handleComplete}
                    className="rounded-xl bg-accent-500 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-accent-600"
                  >
                    완료
                  </button>
                )}
                {isPreviewMode && (
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setPreviewData(null);
                    }}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    닫기
                  </button>
                )}
              </div>
              <div className="overflow-auto p-5">
                {displayType === 'camper' ? (
                  <div ref={camperResultRef} style={{ width: getResultWidth() }} className="bg-white p-6 font-sans">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <ResultCard title="차량 정보" icon={InformationCircleIcon}>
                        <ResultRow label="베이스 차량" value={displayCamperData.baseVehicle || '-'} />
                        <ResultRow label="제조사" value={displayCamperData.manufacturer || '-'} />
                        <ResultRow label="모델명" value={displayCamperData.modelName || '-'} />
                        <ResultRow label="차종" value={displayCamperData.vehicleType || '-'} />
                        <ResultRow
                          label={displayYearData.label}
                          value={displayCamperData.hasStructureMod && displayCamperData.structureModDate
                            ? `${displayYearData.value}(${parseFirstReg(displayCamperData.structureModDate)})`
                            : displayYearData.value}
                        />
                        <ResultRow label="최초등록일" value={parseFirstReg(displayCamperData.firstReg)} />
                        <ResultRow
                          label="주행거리"
                          value={displayCamperData.mileage ? `${formatNumber(displayCamperData.mileage)} km` : '-'}
                        />
                        <ResultRow label="차고지 증명" value={displayCamperData.garageProof || '-'} />
                        <ResultRow label="필요 면허" value={displayCamperData.license || '-'} />
                      </ResultCard>
                      <ResultCard title="제원" icon={ChatBubbleBottomCenterTextIcon}>
                        <ResultRow label="길이" value={displayCamperData.length ? `${formatNumber(displayCamperData.length)} mm` : '-'} />
                        <ResultRow label="너비" value={displayCamperData.width ? `${formatNumber(displayCamperData.width)} mm` : '-'} />
                        <ResultRow label="높이" value={displayCamperData.height ? `${formatNumber(displayCamperData.height)} mm` : '-'} />
                        <ResultRow label="배기량" value={displayCamperData.displacement ? `${formatNumber(displayCamperData.displacement)} cc` : '-'} />
                        <ResultRow label="연료" value={displayCamperData.fuel || '-'} />
                        <ResultRow label="변속기" value={displayCamperData.transmission || '-'} />
                        <ResultRow label="연비" value={displayCamperData.fuelEconomy ? `등록증상 ${displayCamperData.fuelEconomy} km/L` : '-'} />
                        <ResultRow label="승차정원" value={displayCamperData.seatCapacity ? `${displayCamperData.seatCapacity} 인` : '-'} />
                        <ResultRow label="현금 영수증" value={displayCamperData.cashReceipt || '-'} />
                      </ResultCard>
                    </div>
                    <OptionCard>
                      <OptionRow label="전 기">
                        {formatElectric([
                          { label: displayCamperData.batteryType || '배터리', value: displayCamperData.batteryCapacity, unit: 'Ah' },
                          { label: '태양광', value: displayCamperData.solar, unit: 'W' },
                          { label: '인버터', value: displayCamperData.inverter, unit: 'Kw' },
                        ])}
                      </OptionRow>
                      <OptionRow label="외 관">{formatOptions(displayCamperData.exterior)}</OptionRow>
                      <OptionRow label="내 장">{formatOptions(displayCamperData.interior)}</OptionRow>
                      <OptionRow label="편 의">{formatOptions(displayCamperData.convenience)}</OptionRow>
                    </OptionCard>
                  </div>
                ) : (
                  <div ref={caravanResultRef} style={{ width: getResultWidth() }} className="bg-white p-6 font-sans">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <ResultCard title="차량 정보" icon={InformationCircleIcon}>
                        <ResultRow label="제조사" value={displayCaravanData.manufacturer || '-'} />
                        <ResultRow label="모델명" value={displayCaravanData.modelName || '-'} />
                        <ResultRow label="차종" value={displayCaravanData.vehicleType || '-'} />
                        <ResultRow
                          label={displayYearData.label}
                          value={displayCaravanData.hasStructureMod && displayCaravanData.structureModDate
                            ? `${displayYearData.value}(${parseFirstReg(displayCaravanData.structureModDate)})`
                            : displayYearData.value}
                        />
                        <ResultRow label="최초등록일" value={parseFirstReg(displayCaravanData.firstReg)} />
                        <ResultRow label="차고지 증명" value={displayCaravanData.garageProof || '-'} />
                        <ResultRow label="취침인원" value={displayCaravanData.sleepCapacity ? `${displayCaravanData.sleepCapacity} 인` : '-'} />
                        <ResultRow label="현금 영수증" value={displayCaravanData.cashReceipt || '-'} />
                      </ResultCard>
                      <ResultCard title="제원" icon={ChatBubbleBottomCenterTextIcon}>
                        <ResultRow label="외부 길이" value={displayCaravanData.extLength ? `${formatNumber(displayCaravanData.extLength)} mm` : '-'} />
                        <ResultRow label="내부 길이" value={displayCaravanData.intLength ? `${formatNumber(displayCaravanData.intLength)} mm` : '-'} />
                        <ResultRow label="외부 너비" value={displayCaravanData.extWidth ? `${formatNumber(displayCaravanData.extWidth)} mm` : '-'} />
                        <ResultRow label="내부 너비" value={displayCaravanData.intWidth ? `${formatNumber(displayCaravanData.intWidth)} mm` : '-'} />
                        <ResultRow label="외부 높이" value={displayCaravanData.extHeight ? `${formatNumber(displayCaravanData.extHeight)} mm` : '-'} />
                        <ResultRow label="내부 높이" value={displayCaravanData.intHeight ? `${formatNumber(displayCaravanData.intHeight)} mm` : '-'} />
                        <ResultRow label="공차 중량" value={displayCaravanData.curbWeight ? `${formatNumber(displayCaravanData.curbWeight)} kg` : '-'} />
                        <ResultRow label="최대 허용 중량" value={displayCaravanData.maxWeight ? `${formatNumber(displayCaravanData.maxWeight)} kg` : '-'} />
                      </ResultCard>
                    </div>
                    <OptionCard>
                      <OptionRow label="전 기">
                        {formatElectric([
                          { label: displayCaravanData.batteryType || '배터리', value: displayCaravanData.batteryCapacity, unit: 'Ah' },
                          { label: '태양광', value: displayCaravanData.solar, unit: 'W' },
                          { label: '인버터', value: displayCaravanData.inverter, unit: 'Kw' },
                        ])}
                      </OptionRow>
                      <OptionRow label="외 관">{formatOptions(displayCaravanData.exterior)}</OptionRow>
                      <OptionRow label="내 장">{formatOptions(displayCaravanData.interior)}</OptionRow>
                      <OptionRow label="편 의">{formatOptions(displayCaravanData.convenience)}</OptionRow>
                    </OptionCard>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* 하단 탭바 - 모바일 PWA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-700 dark:bg-[#1a1a1a] lg:hidden">
        <div className="grid h-14 grid-cols-3">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="text-xs font-semibold">로그아웃</span>
          </button>
          <button
            onClick={() => setMobileView('form')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors active:bg-gray-100 dark:active:bg-gray-800 ${
              mobileView === 'form' ? 'text-accent-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-xs font-semibold">등록</span>
          </button>
          <button
            onClick={() => setMobileView('list')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors active:bg-gray-100 dark:active:bg-gray-800 ${
              mobileView === 'list' ? 'text-accent-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-xs font-semibold">목록</span>
          </button>
        </div>
      </div>
    </div>
    </>
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
          <FormRow label="차량번호">
            <div className="relative">
              <input type="text" value={data.vehicleNumber} onChange={(e) => { setData({ ...data, vehicleNumber: e.target.value }); clearError?.('vehicleNumber'); }} placeholder="12가1234" className={`form-input ${errors.vehicleNumber ? 'form-input-error pr-10' : ''}`} />
              {errors.vehicleNumber && <ErrorIcon />}
            </div>
          </FormRow>
          <FormRow label="베이스 차량">
            <div className="relative">
              <input type="text" value={data.baseVehicle} onChange={(e) => { setData({ ...data, baseVehicle: e.target.value }); clearError?.('baseVehicle'); }} placeholder="현대 포터2" className={`form-input ${errors.baseVehicle ? 'form-input-error pr-10' : ''}`} />
              {errors.baseVehicle && <ErrorIcon />}
            </div>
          </FormRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="제조사">
            <div className="relative">
              <input type="text" value={data.manufacturer} onChange={(e) => { setData({ ...data, manufacturer: e.target.value }); clearError?.('manufacturer'); }} placeholder="제일모빌" className={`form-input ${errors.manufacturer ? 'form-input-error pr-10' : ''}`} />
              {errors.manufacturer && <ErrorIcon />}
            </div>
          </FormRow>
          <FormRow label="모델명">
            <div className="relative">
              <input type="text" value={data.modelName} onChange={(e) => { setData({ ...data, modelName: e.target.value }); clearError?.('modelName'); }} placeholder="드림스페이스" className={`form-input ${errors.modelName ? 'form-input-error pr-10' : ''}`} />
              {errors.modelName && <ErrorIcon />}
            </div>
          </FormRow>
        </div>
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
            <input type="text" inputMode="numeric" value={data.mileage} onChange={(e) => { setData({ ...data, mileage: onlyNumbers(e.target.value) }); clearError?.('mileage'); }} placeholder="35000" className={`form-input ${errors.mileage ? 'form-input-error pr-10' : ''}`} />
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
          <input type="text" inputMode="numeric" value={data.length} onChange={(e) => setData({ ...data, length: onlyNumbers(e.target.value) })} placeholder="7315" className="form-input" />
        </FormRow>
        <FormRow label="너비 (mm)">
          <input type="text" inputMode="numeric" value={data.width} onChange={(e) => setData({ ...data, width: onlyNumbers(e.target.value) })} placeholder="2060" className="form-input" />
        </FormRow>
        <FormRow label="높이 (mm)">
          <input type="text" inputMode="numeric" value={data.height} onChange={(e) => setData({ ...data, height: onlyNumbers(e.target.value) })} placeholder="2850" className="form-input" />
        </FormRow>
        <FormRow label="배기량 (cc)">
          <input type="text" inputMode="numeric" value={data.displacement} onChange={(e) => setData({ ...data, displacement: onlyNumbers(e.target.value) })} placeholder="2497" className="form-input" />
        </FormRow>
        <FormRow label="연비 (km/L)">
          <input type="text" inputMode="decimal" value={data.fuelEconomy} onChange={(e) => setData({ ...data, fuelEconomy: onlyDecimal(e.target.value) })} placeholder="8.5" className="form-input" />
        </FormRow>
        <FormRow label="승차정원">
          <input type="text" inputMode="numeric" value={data.seatCapacity} onChange={(e) => setData({ ...data, seatCapacity: onlyNumbers(e.target.value) })} placeholder="9" className="form-input" />
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
      <FormRow label="배터리 (Ah)">
        <div className="flex gap-2">
          <FormSelect value={data.batteryType} onChange={(e) => setData({ ...data, batteryType: e.target.value })} className="w-24 shrink-0">
            <option value="인산철">인산철</option>
            <option value="딥싸이클">딥싸이클</option>
          </FormSelect>
          <input type="text" value={data.batteryCapacity} onChange={(e) => setData({ ...data, batteryCapacity: e.target.value })} placeholder="200" className="form-input min-w-0 flex-1" />
        </div>
      </FormRow>
      <FormRow label="태양광 (W)">
        <input type="text" inputMode="numeric" value={data.solar} onChange={(e) => setData({ ...data, solar: onlyNumbers(e.target.value) })} placeholder="200" className="form-input" />
      </FormRow>
      <FormRow label="인버터 (Kw)">
        <input type="text" value={data.inverter} onChange={(e) => setData({ ...data, inverter: onlyDecimalPlus(e.target.value) })} placeholder="3" className="form-input" />
      </FormRow>
      <SectionTitle hint="스페이스 2번으로 구분">옵션</SectionTitle>
      <FormRow label="외관">
        <textarea value={data.exterior} onChange={(e) => setData({ ...data, exterior: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="내장">
        <textarea value={data.interior} onChange={(e) => setData({ ...data, interior: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="편의">
        <textarea value={data.convenience} onChange={(e) => setData({ ...data, convenience: e.target.value })} className="form-input min-h-[70px] resize-y" />
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
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="차량번호">
            <div className="relative">
              <input type="text" value={data.vehicleNumber} onChange={(e) => { setData({ ...data, vehicleNumber: e.target.value }); clearError?.('vehicleNumber'); }} placeholder="12가1234" className={`form-input ${errors.vehicleNumber ? 'form-input-error pr-10' : ''}`} />
              {errors.vehicleNumber && <ErrorIcon />}
            </div>
          </FormRow>
          <FormRow label="제조사">
            <div className="relative">
              <input type="text" value={data.manufacturer} onChange={(e) => { setData({ ...data, manufacturer: e.target.value }); clearError?.('manufacturer'); }} placeholder="코치맨(CM카라반)" className={`form-input ${errors.manufacturer ? 'form-input-error pr-10' : ''}`} />
              {errors.manufacturer && <ErrorIcon />}
            </div>
          </FormRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="모델명">
            <div className="relative">
              <input type="text" value={data.modelName} onChange={(e) => { setData({ ...data, modelName: e.target.value }); clearError?.('modelName'); }} placeholder="VIP 560" className={`form-input ${errors.modelName ? 'form-input-error pr-10' : ''}`} />
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
        </div>
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
          <input type="text" inputMode="numeric" value={data.sleepCapacity} onChange={(e) => setData({ ...data, sleepCapacity: onlyNumbers(e.target.value) })} placeholder="4" className="form-input" />
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
          <input type="text" inputMode="numeric" value={data.extLength} onChange={(e) => setData({ ...data, extLength: onlyNumbers(e.target.value) })} placeholder="7315" className="form-input" />
        </FormRow>
        <FormRow label="내부 길이 (mm)">
          <input type="text" inputMode="numeric" value={data.intLength} onChange={(e) => setData({ ...data, intLength: onlyNumbers(e.target.value) })} placeholder="5660" className="form-input" />
        </FormRow>
        <FormRow label="외부 높이 (mm)">
          <input type="text" inputMode="numeric" value={data.extHeight} onChange={(e) => setData({ ...data, extHeight: onlyNumbers(e.target.value) })} placeholder="2650" className="form-input" />
        </FormRow>
        <FormRow label="내부 높이 (mm)">
          <input type="text" inputMode="numeric" value={data.intHeight} onChange={(e) => setData({ ...data, intHeight: onlyNumbers(e.target.value) })} placeholder="1955" className="form-input" />
        </FormRow>
        <FormRow label="외부 너비 (mm)">
          <input type="text" inputMode="numeric" value={data.extWidth} onChange={(e) => setData({ ...data, extWidth: onlyNumbers(e.target.value) })} placeholder="2320" className="form-input" />
        </FormRow>
        <FormRow label="내부 너비 (mm)">
          <input type="text" inputMode="numeric" value={data.intWidth} onChange={(e) => setData({ ...data, intWidth: onlyNumbers(e.target.value) })} placeholder="없으면 비워두세요" className="form-input" />
        </FormRow>
        <FormRow label="공차 중량 (kg)">
          <input type="text" inputMode="numeric" value={data.curbWeight} onChange={(e) => setData({ ...data, curbWeight: onlyNumbers(e.target.value) })} placeholder="1450" className="form-input" />
        </FormRow>
        <FormRow label="최대 허용 중량 (kg)">
          <input type="text" inputMode="numeric" value={data.maxWeight} onChange={(e) => setData({ ...data, maxWeight: onlyNumbers(e.target.value) })} placeholder="1800" className="form-input" />
        </FormRow>
      </>
    );
  }

  return (
    <>
      <SectionTitle>전기</SectionTitle>
      <FormRow label="배터리 (Ah)">
        <div className="flex gap-2">
          <FormSelect value={data.batteryType} onChange={(e) => setData({ ...data, batteryType: e.target.value })} className="w-24 shrink-0">
            <option value="인산철">인산철</option>
            <option value="딥싸이클">딥싸이클</option>
          </FormSelect>
          <input type="text" value={data.batteryCapacity} onChange={(e) => setData({ ...data, batteryCapacity: e.target.value })} placeholder="200" className="form-input min-w-0 flex-1" />
        </div>
      </FormRow>
      <FormRow label="태양광 (W)">
        <input type="text" value={data.solar} onChange={(e) => setData({ ...data, solar: e.target.value })} placeholder="200" className="form-input" />
      </FormRow>
      <FormRow label="인버터 (Kw)">
        <input type="text" value={data.inverter} onChange={(e) => setData({ ...data, inverter: onlyDecimalPlus(e.target.value) })} placeholder="3" className="form-input" />
      </FormRow>
      <SectionTitle hint="스페이스 2번으로 구분">옵션</SectionTitle>
      <FormRow label="외관">
        <textarea value={data.exterior} onChange={(e) => setData({ ...data, exterior: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="내장">
        <textarea value={data.interior} onChange={(e) => setData({ ...data, interior: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="편의">
        <textarea value={data.convenience} onChange={(e) => setData({ ...data, convenience: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
    </>
  );
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <h3 className="mb-3 mt-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent-500 first:mt-0">
      {children}
      {hint && <span className="text-xs font-normal normal-case text-gray-400">{hint}</span>}
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
