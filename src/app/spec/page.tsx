'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useNotifications } from '@/hooks/useNotifications';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useVehicleList } from '@/hooks/useVehicleList';
import { signOut, useSession } from 'next-auth/react';
import { domToPng } from 'modern-screenshot';
import { motion, AnimatePresence } from 'motion/react';
import {
  InformationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
} from '@heroicons/react/16/solid';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/tabs';
import VehicleCard from '@/components/spec/VehicleCard';

// 분리된 파일에서 import
import type { CamperData, CaravanData, MainTab, FormStep, VehicleStatus, StatusTabType, VehicleListItem } from '@/components/spec/types';
import { initialCamperData, initialCaravanData, STATUS_LABELS } from '@/components/spec/constants';
import { getChangedSteps, formatNumber, formatRelativeTime, parseYear, parseFirstReg, isValidVehicleNumber } from '@/components/spec/utils';
import { ResultCard, ResultRow, OptionCard, OptionRow } from '@/components/spec/ResultComponents';
import CamperForm from '@/components/spec/CamperForm';
import CaravanForm from '@/components/spec/CaravanForm';

export default function SpecPage() {
  const { data: session } = useSession();
  const [mainTab, setMainTab] = useState<MainTab>('camper');
  const [tabLoading, setTabLoading] = useState(false);
  const [step, setStep] = useState<FormStep>(1);
  const [showResult, setShowResult] = useState(false);
  const [camperData, setCamperData] = useState<CamperData>(initialCamperData);
  const [caravanData, setCaravanData] = useState<CaravanData>(initialCaravanData);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; vehicleNumber: string }>({ show: false, vehicleNumber: '' });
  const [resetModal, setResetModal] = useState(false);
  const [overwriteModal, setOverwriteModal] = useState<{ show: boolean; callback: (() => void) | null }>({ show: false, callback: null });
  const [saveConfirmModal, setSaveConfirmModal] = useState<{ show: boolean; vehicleNumber: string; callback: (() => void) | null }>({ show: false, vehicleNumber: '', callback: null });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({ show: false, message: '', type: 'success' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{ type: MainTab; data: CamperData | CaravanData } | null>(null);
  const [leftSectionHeight, setLeftSectionHeight] = useState<number>(0);
  const [statusTab, setStatusTab] = useState<StatusTabType>('all');
  const [statusIndex, setStatusIndex] = useState(0);
  const [mobileView, setMobileView] = useState<'form' | 'list'>('form');

  // 토스트 표시 함수
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  }, []);

  // 커스텀 훅
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    notificationsLoading,
    notificationRef,
    markAllAsRead,
    clearAllNotifications,
    refetch: refetchNotifications,
  } = useNotifications();
  const {
    vehicleList,
    listLoading,
    updateVehicleStatus,
    checkDuplicate,
    saveToDatabase,
    deleteVehicle,
  } = useVehicleList({ showToast, refetchNotifications });
  // TODO: 알림 클릭 시 해당 차량 카드 하이라이트 기능 구현 예정
  const [highlightedVehicle, _setHighlightedVehicle] = useState<string | null>(null);
  void _setHighlightedVehicle; // ESLint 경고 방지 (추후 알림 기능에서 사용)
  const [searchQuery, setSearchQuery] = useState('');
  const [showSoldView, setShowSoldView] = useState(false);
  const [soldSearchQuery, setSoldSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [soldContextMenu, setSoldContextMenu] = useState<{ show: boolean; x: number; y: number; item: VehicleListItem | null }>({ show: false, x: 0, y: 0, item: null });
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; item: VehicleListItem | null }>({ show: false, x: 0, y: 0, item: null });
  const [statusChangeModal, setStatusChangeModal] = useState<{ show: boolean; vehicleNumber: string; newStatus: VehicleStatus | null }>({ show: false, vehicleNumber: '', newStatus: null });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTouchRef = useRef<{ x: number; y: number; item: VehicleListItem } | null>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const statusTabListRef = useRef<HTMLDivElement>(null);
  const camperResultRef = useRef<HTMLDivElement>(null);
  const caravanResultRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(false);

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
    const statuses: StatusTabType[] = ['all', 'intake', 'productization', 'advertising'];
    setStatusIndex(statuses.indexOf(statusTab));
  }, [statusTab]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResult) {
          setShowResult(false);
          setPreviewData(null);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showResult]);

  // 검색어 입력 시 전체 탭으로 이동
  useEffect(() => {
    if (searchQuery.trim() && statusTab !== 'all') {
      setStatusTab('all');
    }
  }, [searchQuery, statusTab]);

  // 상태 변경 요청 (모달 표시)
  const requestStatusChange = (vehicleNumber: string, newStatus: VehicleStatus) => {
    setStatusChangeModal({ show: true, vehicleNumber, newStatus });
  };

  // 컨텍스트 메뉴 닫기 (외부 클릭 시)
  useClickOutside(null, () => setContextMenu({ show: false, x: 0, y: 0, item: null }), contextMenu.show, 'click');

  // 판매완료 컨텍스트 메뉴 닫기 (외부 클릭 시)
  useClickOutside(null, () => setSoldContextMenu({ show: false, x: 0, y: 0, item: null }), soldContextMenu.show, 'click');

  // 사용자 드롭다운 닫기 (외부 클릭 시)
  useClickOutside(userDropdownRef, () => setShowUserDropdown(false), showUserDropdown);

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


  // 카드 클릭 시 미리보기 모달만 표시 (폼에 데이터 넣지 않음)
  const loadVehicleFromCard = useCallback(async (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => {
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
  }, [showToast]);

  // 컨텍스트 메뉴 열기 핸들러 (VehicleCard용)
  const handleContextMenu = useCallback((e: React.MouseEvent, item: VehicleListItem) => {
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
  }, []);

  // 컨텍스트 메뉴에서 수정 클릭 시 바로 폼에 데이터 로드 (모달 없이)
  const loadVehicleToForm = async (vehicleNumber: string, vehicleType: 'camper' | 'caravan') => {
    try {
      const response = await fetch(`/api/specs?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || '데이터를 불러올 수 없습니다.', 'error');
        return;
      }

      const { data } = result;
      const savedData = data.data as Record<string, string>;

      // 폼에 직접 데이터 적용
      if (vehicleType === 'camper') {
        setCamperData({ ...initialCamperData, ...savedData } as CamperData);
        setMainTab('camper');
      } else {
        setCaravanData({ ...initialCaravanData, ...savedData } as CaravanData);
        setMainTab('caravan');
      }

      setStep(1);
      setFieldErrors({});
      setMobileView('form'); // 모바일에서 등록 화면으로 전환
      showToast('데이터를 불러왔습니다.', 'success');
    } catch (e) {
      console.error('데이터 로드 오류:', e);
      showToast('데이터 로드 중 오류가 발생했습니다.', 'error');
    }
  };

  const formatOptions = (text: string): React.ReactNode => {
    if (!text || !text.trim()) return '-';
    const items = text.split(/\s{2,}|\r?\n/).filter((item) => item.trim());
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

  // 결과 테이블 너비 계산 (정사각형에 가깝게)
  const getResultWidth = (): number => {
    // 고정 너비 800px (내부 grid-cols-2 레이아웃에 맞춤)
    return 800;
  };

  // 모바일 뷰 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openResetModal = () => {
    setResetModal(true);
  };

  const confirmReset = () => {
    if (mainTab === 'camper') {
      setCamperData(initialCamperData);
    } else {
      setCaravanData(initialCaravanData);
    }
    setStep(1);
    setResetModal(false);
    showToast('초기화되었습니다.', 'success');
  };

  // 중복 확인 후 저장 (모달 표시)
  const saveWithDuplicateCheck = useCallback(async (type: MainTab, onSuccess: () => void) => {
    const data = type === 'camper' ? camperData : caravanData;
    const vehicleNumber = data.vehicleNumber.trim();
    if (!vehicleNumber) return;

    const isDuplicate = await checkDuplicate(vehicleNumber);

    if (isDuplicate) {
      setOverwriteModal({
        show: true,
        callback: async () => {
          const success = await saveToDatabase(type, data);
          if (success) onSuccess();
        },
      });
    } else {
      setSaveConfirmModal({
        show: true,
        vehicleNumber,
        callback: async () => {
          const success = await saveToDatabase(type, data);
          if (success) onSuccess();
        },
      });
    }
  }, [camperData, caravanData, checkDuplicate, saveToDatabase]);

  const openDeleteModal = (vehicleNumber: string) => {
    if (!vehicleNumber.trim()) return;
    setDeleteModal({ show: true, vehicleNumber });
  };

  const confirmDelete = async () => {
    const success = await deleteVehicle(deleteModal.vehicleNumber);
    if (success) {
      setDeleteModal({ show: false, vehicleNumber: '' });
    }
  };

  const goNext = async () => {
    // Step 1 필수 입력 검증
    if (step === 1) {
      const errors: Record<string, string> = {};
      const currentData = mainTab === 'camper' ? camperData : caravanData;

      // 공통 필수: 차량번호
      if (!currentData.vehicleNumber.trim()) {
        errors.vehicleNumber = '필수 입력';
      } else if (!isValidVehicleNumber(currentData.vehicleNumber)) {
        errors.vehicleNumber = '형식 오류';
        showToast('올바른 차량 번호를 입력해주세요.', 'error');
      }

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
      // 모바일에서 다음 스텝으로 이동 시 폼 상단으로 스크롤
      setTimeout(() => {
        leftSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      // Step 3에서 저장 버튼 클릭 시 바로 저장 처리
      const data = mainTab === 'camper' ? camperData : caravanData;
      const currentTab = mainTab;
      if (data.vehicleNumber.trim()) {
        await saveWithDuplicateCheck(currentTab, () => resetAfterSave(currentTab));
      } else {
        resetAfterSave(currentTab);
      }
    }
  };

  // 완료 후 초기화 로직
  const resetAfterSave = useCallback((type: MainTab) => {
    showToast('저장되었습니다.', 'success');
    if (type === 'camper') {
      setCamperData(initialCamperData);
    } else {
      setCaravanData(initialCaravanData);
    }
    setStep(1);
    setFieldErrors({});
    setShowResult(false);
  }, [showToast]);

  const goPrev = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as FormStep);
      // 모바일에서 이전 스텝으로 이동 시 폼 상단으로 스크롤
      setTimeout(() => {
        leftSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleMainTabChange = (tab: MainTab) => {
    if (tab === mainTab) return;
    setTabLoading(true);
    setFieldErrors({});
    // 짧은 지연 후 탭 전환
    setTimeout(() => {
      setMainTab(tab);
      setStep(1);
      setTabLoading(false);
    }, 150);
  };

  // 실제 PNG 다운로드 로직
  const performDownloadPNG = async (type: MainTab) => {
    const container = type === 'camper' ? camperResultRef.current : caravanResultRef.current;
    if (!container) {
      showToast('컨테이너를 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      const originalWidth = container.style.width;

      // 1. 높이 측정
      const height = container.scrollHeight;

      // 2. 정사각형에 가깝게 너비 계산 (높이의 95%, 최소 800px)
      const targetWidth = Math.max(Math.round(height * 0.95), 800);
      container.style.width = `${targetWidth}px`;

      // 3. 리플로우 대기
      await new Promise(resolve => setTimeout(resolve, 150));

      // 4. 전체 크기 명시적 지정하여 캡처
      const dataUrl = await domToPng(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        fetch: { bypassingCache: true },
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      // 5. 원복
      container.style.width = originalWidth;

      const img = new window.Image();
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

  return (
    <>
      {/* iOS PWA Safe Area 배경 - 시스템 테마 자동 적응 */}
      <div
        className="fixed inset-0 -z-10 bg-gray-100 dark:bg-[#121418]"
        aria-hidden="true"
      />

      <div className="min-h-dvh bg-gray-100 font-sans text-gray-700 dark:bg-[#121418] dark:text-gray-100">
      {/* iOS Safari 상단 고정 영역 - 헤더와 같은 색상 */}
      <div className="fixed inset-x-0 top-0 z-50 h-[env(safe-area-inset-top)] bg-white dark:bg-[#1c1f26]" />

      {/* 헤더 - 스크롤과 함께 움직임 */}
      <header className="relative z-40 pt-[env(safe-area-inset-top)]">
        {/* 토스트 모드 헤더 - 데스크톱만 (모바일은 하단 toast 사용) */}
        <AnimatePresence mode="wait">
          {toast.show && (
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                mass: 0.8
              }}
              className="absolute inset-0 z-10 hidden h-14 items-center justify-center gap-3 border-b border-gray-200/80 bg-white/95 shadow-lg shadow-gray-200/50 backdrop-blur-xl lg:flex dark:border-[#2a2f3a] dark:bg-[#1c1f26]/95 dark:shadow-black/30"
            >
              {/* 아이콘 컨테이너 - 바운스 효과 */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15,
                  type: 'spring',
                  stiffness: 400,
                  damping: 15
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  toast.type === 'success'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                    : toast.type === 'error'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/40'
                    : 'bg-amber-500 text-white shadow-md shadow-amber-500/40'
                }`}
              >
                {toast.type === 'success' && (
                  <motion.svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                    stroke="currentColor"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.35, duration: 0.25 }}
                    />
                  </motion.svg>
                )}
                {toast.type === 'error' && (
                  <XMarkIcon className="size-4" />
                )}
                {toast.type === 'warning' && (
                  <ExclamationTriangleIcon className="size-4" />
                )}
              </motion.div>
              {/* 텍스트 - 타이핑 효과 */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25, ease: 'easeOut' }}
                className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-100"
              >
                {toast.message}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 기본 헤더 */}
        <div className={`border-b border-gray-200/80 bg-white/70 backdrop-blur-xl transition-opacity duration-200 dark:border-[#2a2f3a] dark:bg-[#1c1f26]/90 ${toast.show ? 'lg:opacity-0' : 'opacity-100'}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* 좌측: 모바일 - 뷰 전환 탭 / 데스크톱 - 사용자 정보 */}
          <div className="flex items-center">
            {/* 모바일: 뷰 전환 탭 (등록/목록/완료) */}
            <div className="flex items-center gap-0.5 rounded-xl bg-gray-100 p-1 lg:hidden dark:bg-gray-800">
              <button
                onClick={() => { setMobileView('form'); setShowSoldView(false); }}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
                  mobileView === 'form' && !showSoldView
                    ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                등록
              </button>
              <button
                onClick={() => { setMobileView('list'); setShowSoldView(false); }}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
                  mobileView === 'list' && !showSoldView
                    ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                목록
              </button>
              <button
                onClick={() => setShowSoldView(true)}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
                  showSoldView
                    ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                완료
              </button>
            </div>

            {/* 데스크톱: 사용자 정보 */}
            <div ref={userDropdownRef} className="relative hidden lg:block">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {/* 프로필 아바타 */}
                <div className="relative">
                  {session?.user?.image ? (
                    <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-0.5 shadow-sm dark:from-gray-600 dark:to-gray-700">
                      <Image
                        src={session.user.image}
                        alt="프로필"
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-bold text-white shadow-sm">
                      {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#1c1f26]" />
                </div>
                {/* 이름/이메일 */}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {session?.user?.name || session?.user?.email?.split('@')[0]}
                  </span>
                  {session?.user?.name && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {session?.user?.email}
                    </span>
                  )}
                </div>
              </button>

              {/* 사용자 드롭다운 메뉴 */}
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
                  >
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-[#454c5c]">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      <ArrowRightStartOnRectangleIcon className="size-4" />
                      로그아웃
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 중앙: 버전 표시 */}
          <span className="text-[10px] font-medium tracking-wider text-gray-400 dark:text-gray-600">
            v2.7
          </span>

          {/* 우측: 액션 버튼들 */}
          <div className="flex items-center gap-1 lg:gap-1.5">
            {/* 알림 버튼 + 드롭다운 - 데스크톱만 */}
            <div ref={notificationRef} className="relative hidden lg:block">
              <button
                onClick={() => {
                  const willOpen = !showNotifications;
                  setShowNotifications(willOpen);
                  // 알림창 열 때 자동 읽음 처리
                  if (willOpen && unreadCount > 0) {
                    markAllAsRead();
                  }
                }}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                title="알림"
              >
                <BellIcon className="size-5" />
                {/* 알림 뱃지 */}
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/50 ring-2 ring-white dark:ring-[#121418] dark:shadow-red-500/40">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg lg:absolute lg:inset-x-auto lg:right-0 lg:top-full lg:mt-2 lg:w-[320px] dark:border-[#2a2f3a] dark:bg-[#1c1f26]"
                  >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-[#2a2f3a]">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">알림</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[13px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    {/* 알림 목록 */}
                    <div className="max-h-[360px] overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-accent-500 dark:border-gray-700 dark:border-t-accent-400" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <BellIcon className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
                          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">알림이 없습니다</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0 dark:border-[#2a2f3a]/60 ${
                              !notification.is_read ? 'bg-accent-50/40 dark:bg-accent-500/[0.08]' : ''
                            }`}
                          >
                            {/* 아바타 */}
                            {notification.user_image ? (
                              <Image
                                src={notification.user_image}
                                alt={notification.user_name || '사용자'}
                                width={36}
                                height={36}
                                className="shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  {notification.user_name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}

                            {/* 내용 */}
                            <div className="min-w-0 flex-1">
                              {/* 차량번호 + 타입 뱃지 + 읽지않음 */}
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
                                  {notification.vehicle_number}
                                </span>
                                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium shadow-sm ${
                                  notification.type === 'vehicle_created'
                                    ? 'bg-emerald-100 text-emerald-700 shadow-emerald-200/50 dark:bg-emerald-500/15 dark:text-emerald-400 dark:shadow-emerald-500/20'
                                    : notification.type === 'status_changed'
                                    ? 'bg-amber-100 text-amber-700 shadow-amber-200/50 dark:bg-amber-500/15 dark:text-amber-400 dark:shadow-amber-500/20'
                                    : 'bg-blue-100 text-blue-700 shadow-blue-200/50 dark:bg-blue-500/15 dark:text-blue-400 dark:shadow-blue-500/20'
                                }`}>
                                  {notification.type === 'vehicle_created' ? '신규' : notification.type === 'status_changed' ? '상태' : '수정'}
                                </span>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 rounded-full bg-accent-500 shadow-sm shadow-accent-500/50" />
                                )}
                              </div>

                              {/* 변경 스텝 */}
                              {notification.details?.changed_fields && notification.details.changed_fields.length > 0 && (
                                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                                  {getChangedSteps(notification.details.changed_fields).join(', ')}
                                </p>
                              )}

                              {/* 사용자명 + 시간 */}
                              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                {notification.user_name && <span>{notification.user_name} · </span>}
                                {notification.created_at && formatRelativeTime(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 테마 토글 */}
            {/* 알림 버튼 - 모바일 */}
            <button
              onClick={() => {
                const willOpen = !showNotifications;
                setShowNotifications(willOpen);
                if (willOpen && unreadCount > 0) {
                  markAllAsRead();
                }
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              title="알림"
            >
              <BellIcon className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/50 ring-2 ring-white dark:ring-[#1c1f26] dark:shadow-red-500/40">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* 다크모드 토글 */}
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              title={isDarkMode ? '라이트 모드' : '다크 모드'}
            >
              {isDarkMode ? (
                <SunIcon className="size-5" />
              ) : (
                <MoonIcon className="size-5" />
              )}
            </button>

            {/* 구분선 - 데스크톱만 */}
            <div className="mx-1 hidden h-5 w-px bg-gray-200 lg:block dark:bg-gray-700" />

            {/* 판매완료 - 데스크톱만 */}
            <button
              onClick={() => setShowSoldView(true)}
              className="hidden h-9 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800 lg:flex dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              <span>판매완료</span>
              {vehicleList.filter(v => v.status === 'sold').length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-500 px-1.5 text-xs font-bold text-white dark:bg-gray-600">
                  {vehicleList.filter(v => v.status === 'sold').length}
                </span>
              )}
            </button>

            {/* 모바일: 아바타 */}
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full lg:hidden"
            >
              {session?.user?.image ? (
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-0.5 shadow-sm dark:from-gray-600 dark:to-gray-700">
                  <Image
                    src={session.user.image}
                    alt="프로필"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-bold text-white shadow-sm">
                  {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500 dark:border-[#1c1f26]" />
            </button>

            {/* 모바일: 사용자 드롭다운 */}
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-4 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl lg:hidden dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
                >
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-[#454c5c]">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    <ArrowRightStartOnRectangleIcon className="size-4" />
                    로그아웃
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 모바일: 알림 드롭다운 */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-4 top-full z-50 mt-2 w-[calc(100vw-32px)] max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl lg:hidden dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-[#2a2f3a]">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">알림</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[13px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-accent-500 dark:border-gray-700 dark:border-t-accent-400" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <BellIcon className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">알림이 없습니다</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0 dark:border-[#2a2f3a]/60 ${
                            !notification.is_read ? 'bg-accent-50/40 dark:bg-accent-500/[0.08]' : ''
                          }`}
                        >
                          {notification.user_image ? (
                            <Image
                              src={notification.user_image}
                              alt={notification.user_name || '사용자'}
                              width={36}
                              height={36}
                              className="shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {notification.user_name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
                                {notification.vehicle_number}
                              </span>
                              <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium shadow-sm ${
                                notification.type === 'vehicle_created'
                                  ? 'bg-emerald-100 text-emerald-700 shadow-emerald-200/50 dark:bg-emerald-500/15 dark:text-emerald-400 dark:shadow-emerald-500/20'
                                  : notification.type === 'status_changed'
                                  ? 'bg-amber-100 text-amber-700 shadow-amber-200/50 dark:bg-amber-500/15 dark:text-amber-400 dark:shadow-amber-500/20'
                                  : 'bg-blue-100 text-blue-700 shadow-blue-200/50 dark:bg-blue-500/15 dark:text-blue-400 dark:shadow-blue-500/20'
                              }`}>
                                {notification.type === 'vehicle_created' ? '신규' : notification.type === 'status_changed' ? '상태' : '수정'}
                              </span>
                              {!notification.is_read && (
                                <span className="h-2 w-2 rounded-full bg-accent-500 shadow-sm shadow-accent-500/50" />
                              )}
                            </div>
                            {notification.details?.changed_fields && notification.details.changed_fields.length > 0 && (
                              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
                                {getChangedSteps(notification.details.changed_fields).join(', ')}
                              </p>
                            )}
                            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                              {notification.user_name && <span>{notification.user_name} · </span>}
                              {notification.created_at && formatRelativeTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-5 pt-4 lg:flex-row lg:items-start lg:gap-6 lg:pt-5">

        {/* 좌측: 폼 영역 */}
        <div ref={leftSectionRef} className={`relative w-full shrink-0 lg:max-w-[440px] ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>

        {/* 애니메이션 메인 탭 */}
        <Tabs
          defaultValue="camper"
          value={mainTab}
          onValueChange={(value) => handleMainTabChange(value as MainTab)}
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
                <CamperForm step={step} data={camperData} setData={setCamperData} errors={step === 1 ? fieldErrors : {}} clearError={step === 1 ? (key) => setFieldErrors(prev => { const next = {...prev}; delete next[key]; return next; }) : undefined} />
              ) : (
                <CaravanForm step={step} data={caravanData} setData={setCaravanData} errors={step === 1 ? fieldErrors : {}} clearError={step === 1 ? (key) => setFieldErrors(prev => { const next = {...prev}; delete next[key]; return next; }) : undefined} />
              )}
            </div>
          )}

          {/* 하단 버튼 - 항상 하단에 고정 */}
          <div className="mt-auto flex gap-3 border-t border-gray-100 p-5 dark:border-gray-800">
            {step === 1 ? (
              <button
                onClick={openResetModal}
                className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
              >
                초기화
              </button>
            ) : (
              <button
                onClick={goPrev}
                className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
              >
                이전
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg hover:shadow-accent-500/40 active:scale-[0.98] dark:from-accent-400 dark:to-accent-500 dark:shadow-md dark:shadow-accent-400/35 dark:hover:shadow-lg dark:hover:shadow-accent-400/45"
            >
              {step === 3 ? '저장' : '다음'}
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
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-[#121418]/80">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">불러오는 중...</span>
              </div>
            </div>
          )}
          {/* 상태 탭 헤더 */}
          <div ref={statusTabListRef} className="relative mb-3 grid shrink-0 grid-cols-4 rounded-2xl bg-white p-1.5 shadow-sm dark:bg-[#1c1f26]">
            {/* 인디케이터 - 애니메이션 없음 */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl"
              style={{
                width: 'calc(25% - 3px)',
                left: 6,
                transform: `translateX(${statusIndex * 100}%)`,
                background: isDarkMode
                  ? statusTab === 'all' ? 'linear-gradient(to bottom, #6b7280, #4b5563)'
                  : statusTab === 'intake' ? 'linear-gradient(to bottom, #3b82f6, #2563eb)'
                  : statusTab === 'productization' ? 'linear-gradient(to bottom, #f59e0b, #d97706)'
                  : 'linear-gradient(to bottom, #22c55e, #16a34a)'
                  : statusTab === 'all' ? 'linear-gradient(to bottom, #6b7280, #4b5563)'
                  : statusTab === 'intake' ? 'linear-gradient(to bottom, #3b82f6, #2563eb)'
                  : statusTab === 'productization' ? 'linear-gradient(to bottom, #f59e0b, #d97706)'
                  : 'linear-gradient(to bottom, #22c55e, #16a34a)',
                boxShadow: isDarkMode
                  ? statusTab === 'all' ? '0 2px 8px rgba(107, 114, 128, 0.3)'
                  : statusTab === 'intake' ? '0 2px 8px rgba(59, 130, 246, 0.35)'
                  : statusTab === 'productization' ? '0 2px 8px rgba(245, 158, 11, 0.35)'
                  : '0 2px 8px rgba(34, 197, 94, 0.35)'
                  : statusTab === 'all' ? '0 2px 6px rgba(107, 114, 128, 0.15)'
                  : statusTab === 'intake' ? '0 2px 6px rgba(59, 130, 246, 0.2)'
                  : statusTab === 'productization' ? '0 2px 6px rgba(245, 158, 11, 0.2)'
                  : '0 2px 6px rgba(34, 197, 94, 0.2)',
              }}
            />
            {(['all', 'intake', 'productization', 'advertising'] as StatusTabType[]).map((status) => {
              const count = status === 'all' ? vehicleList.length : vehicleList.filter(v => v.status === status).length;
              const labels: Record<StatusTabType, string> = { all: '전체', intake: '입고', productization: '상품화', advertising: '광고' };
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
                  <span className="whitespace-nowrap">{labels[status]}</span>
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
              ) : (() => {
                const filteredList = vehicleList
                  // sold 상태는 판매완료 뷰에서만 표시
                  .filter((item) => item.status !== 'sold')
                  // 전체 탭이면 상태 필터 무시
                  .filter((item) => statusTab === 'all' ? true : item.status === statusTab)
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
                  const labels: Record<StatusTabType, string> = { all: '전체', intake: '입고', productization: '상품화', advertising: '광고' };
                  return (
                    <div className="py-8 text-center text-sm text-gray-400">
                      {searchQuery.trim()
                        ? `"${searchQuery}" 검색 결과가 없습니다`
                        : statusTab === 'all' ? '등록된 차량이 없습니다' : `${labels[statusTab]} 상태의 차량이 없습니다`
                      }
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {filteredList.map((item) => (
                      <VehicleCard
                        key={item.id}
                        item={item}
                        statusTab={statusTab}
                        statusLabels={STATUS_LABELS}
                        highlightedVehicle={highlightedVehicle}
                        onLoad={loadVehicleFromCard}
                        onContextMenu={handleContextMenu}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        contextMenuOpen={contextMenu.show}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 컨텍스트 메뉴 (우클릭) */}
          {contextMenu.show && contextMenu.item && (
            <div
              className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상태 변경 */}
              {(['intake', 'productization', 'advertising'] as VehicleStatus[]).map((status) => {
                const labels: Record<VehicleStatus, string> = { intake: '입고', productization: '상품화', advertising: '광고', sold: '판매완료' };
                const isCurrentStatus = contextMenu.item?.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      if (contextMenu.item && !isCurrentStatus) {
                        requestStatusChange(contextMenu.item.vehicleNumber, status);
                      }
                      setContextMenu({ show: false, x: 0, y: 0, item: null });
                    }}
                    disabled={isCurrentStatus}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                      isCurrentStatus
                        ? 'cursor-default text-gray-500 dark:text-gray-500'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#363b47]'
                    }`}
                  >
                    {isCurrentStatus && (
                      <CheckIcon className="size-4 text-accent-500" />
                    )}
                    <span className={isCurrentStatus ? '' : 'ml-6'}>{labels[status]}</span>
                  </button>
                );
              })}

              {/* 구분선 */}
              <div className="my-1.5 border-t border-gray-100 dark:border-[#454c5c]" />

              {/* 수정 */}
              <button
                onClick={() => {
                  if (contextMenu.item) {
                    loadVehicleToForm(contextMenu.item.vehicleNumber, contextMenu.item.vehicleType);
                  }
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#363b47]"
              >
                <PencilSquareIcon className="size-4" />
                수정
              </button>

              {/* 판매완료 */}
              <button
                onClick={() => {
                  if (contextMenu.item) {
                    requestStatusChange(contextMenu.item.vehicleNumber, 'sold');
                  }
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#363b47]"
              >
                <TagIcon className="size-4" />
                판매완료
              </button>

              {/* 삭제 */}
              <button
                onClick={() => {
                  if (contextMenu.item) {
                    openDeleteModal(contextMenu.item.vehicleNumber);
                  }
                  setContextMenu({ show: false, x: 0, y: 0, item: null });
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <TrashIcon className="size-4" />
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
          const displayType = previewData?.type || mainTab;
          const displayCamperData = (previewData?.type === 'camper' ? previewData.data : camperData) as CamperData;
          const displayCaravanData = (previewData?.type === 'caravan' ? previewData.data : caravanData) as CaravanData;
          const displayYearData = displayType === 'camper' ? parseYear(displayCamperData.year) : parseYear(displayCaravanData.year);

          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 pb-20 lg:p-5 lg:pb-5"
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
              className="flex max-h-[calc(100dvh-6rem)] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1c1f26] lg:max-h-[95vh]"
            >
              <div className="sticky top-0 z-10 flex gap-2.5 border-b border-gray-200 bg-white px-5 py-4 dark:border-[#363b47] dark:bg-[#1c1f26]">
                <button
                  onClick={() => downloadPNG(displayType)}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-blue-700"
                >
                  다운로드
                </button>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setPreviewData(null);
                  }}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  닫기
                </button>
              </div>
              <div className="overflow-auto bg-gray-100 p-5 dark:bg-[#121418]">
                {/* 다운로드용 기존 표 (숨김) */}
                <div className={isMobileView ? 'absolute -left-[9999px]' : ''}>
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

                {/* 모바일용 리스트 뷰 */}
                {isMobileView && (
                  <div className="space-y-4">
                    {displayType === 'camper' ? (
                      <>
                        {/* 차량 정보 */}
                        <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
                          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">차량 정보</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">베이스 차량</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.baseVehicle || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">제조사</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.manufacturer || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">모델명</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.modelName || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">차종</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.vehicleType || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{displayYearData.label}</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.hasStructureMod && displayCamperData.structureModDate ? `${displayYearData.value}(${parseFirstReg(displayCamperData.structureModDate)})` : displayYearData.value}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">최초등록일</span><span className="font-medium text-gray-800 dark:text-gray-100">{parseFirstReg(displayCamperData.firstReg)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">주행거리</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.mileage ? `${formatNumber(displayCamperData.mileage)} km` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">차고지 증명</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.garageProof || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">필요 면허</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.license || '-'}</span></div>
                          </div>
                        </div>
                        {/* 제원 */}
                        <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
                          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">제원</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">길이</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.length ? `${formatNumber(displayCamperData.length)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">너비</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.width ? `${formatNumber(displayCamperData.width)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">높이</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.height ? `${formatNumber(displayCamperData.height)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">배기량</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.displacement ? `${formatNumber(displayCamperData.displacement)} cc` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">연료</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.fuel || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">변속기</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.transmission || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">연비</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.fuelEconomy ? `등록증상 ${displayCamperData.fuelEconomy} km/L` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">승차정원</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.seatCapacity ? `${displayCamperData.seatCapacity} 인` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">현금 영수증</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCamperData.cashReceipt || '-'}</span></div>
                          </div>
                        </div>
                        {/* 옵션 */}
                        <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
                          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">옵션</h3>
                          <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">전기</span><div className="mt-1">{formatElectric([{ label: displayCamperData.batteryType || '배터리', value: displayCamperData.batteryCapacity, unit: 'Ah' }, { label: '태양광', value: displayCamperData.solar, unit: 'W' }, { label: '인버터', value: displayCamperData.inverter, unit: 'Kw' }])}</div></div>
                            <div><span className="text-gray-500">외관</span><div className="mt-1">{formatOptions(displayCamperData.exterior)}</div></div>
                            <div><span className="text-gray-500">내장</span><div className="mt-1">{formatOptions(displayCamperData.interior)}</div></div>
                            <div><span className="text-gray-500">편의</span><div className="mt-1">{formatOptions(displayCamperData.convenience)}</div></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 카라반 차량 정보 */}
                        <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
                          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">차량 정보</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">제조사</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.manufacturer || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">모델명</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.modelName || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">차종</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.vehicleType || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">{displayYearData.label}</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.hasStructureMod && displayCaravanData.structureModDate ? `${displayYearData.value}(${parseFirstReg(displayCaravanData.structureModDate)})` : displayYearData.value}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">최초등록일</span><span className="font-medium text-gray-800 dark:text-gray-100">{parseFirstReg(displayCaravanData.firstReg)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">차고지 증명</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.garageProof || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">취침인원</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.sleepCapacity ? `${displayCaravanData.sleepCapacity} 인` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">현금 영수증</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.cashReceipt || '-'}</span></div>
                          </div>
                        </div>
                        {/* 카라반 제원 */}
                        <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
                          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">제원</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">외부 길이</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.extLength ? `${formatNumber(displayCaravanData.extLength)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">내부 길이</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.intLength ? `${formatNumber(displayCaravanData.intLength)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">외부 너비</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.extWidth ? `${formatNumber(displayCaravanData.extWidth)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">내부 너비</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.intWidth ? `${formatNumber(displayCaravanData.intWidth)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">외부 높이</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.extHeight ? `${formatNumber(displayCaravanData.extHeight)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">내부 높이</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.intHeight ? `${formatNumber(displayCaravanData.intHeight)} mm` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">공차 중량</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.curbWeight ? `${formatNumber(displayCaravanData.curbWeight)} kg` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">최대 허용 중량</span><span className="font-medium text-gray-800 dark:text-gray-100">{displayCaravanData.maxWeight ? `${formatNumber(displayCaravanData.maxWeight)} kg` : '-'}</span></div>
                          </div>
                        </div>
                        {/* 카라반 옵션 */}
                        <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
                          <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">옵션</h3>
                          <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">전기</span><div className="mt-1">{formatElectric([{ label: displayCaravanData.batteryType || '배터리', value: displayCaravanData.batteryCapacity, unit: 'Ah' }, { label: '태양광', value: displayCaravanData.solar, unit: 'W' }, { label: '인버터', value: displayCaravanData.inverter, unit: 'Kw' }])}</div></div>
                            <div><span className="text-gray-500">외관</span><div className="mt-1">{formatOptions(displayCaravanData.exterior)}</div></div>
                            <div><span className="text-gray-500">내장</span><div className="mt-1">{formatOptions(displayCaravanData.interior)}</div></div>
                            <div><span className="text-gray-500">편의</span><div className="mt-1">{formatOptions(displayCaravanData.convenience)}</div></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
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
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1c1f26]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <TrashIcon className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">데이터 삭제</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  차량번호 <span className="font-semibold text-red-600 dark:text-red-400">{deleteModal.vehicleNumber}</span>
                  <br />데이터를 삭제하시겠습니까?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, vehicleNumber: '' })}
                  className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-gradient-to-b from-red-500 to-red-600 py-3 text-base font-semibold text-white shadow-sm shadow-red-500/15 transition-all duration-200 hover:from-red-400 hover:to-red-500 hover:shadow hover:shadow-red-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-red-500/30 dark:hover:shadow-lg dark:hover:shadow-red-500/40"
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
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1c1f26]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <ArrowPathIcon className="size-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">입력 초기화</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-red-500 dark:text-red-400">{mainTab === 'camper' ? '캠핑카' : '카라반'}</span> 입력 내용을
                  <br />모두 지우시겠습니까?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetModal(false)}
                  className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 rounded-xl bg-gradient-to-b from-red-500 to-red-600 py-3 text-base font-semibold text-white shadow-sm shadow-red-500/15 transition-all duration-200 hover:from-red-400 hover:to-red-500 hover:shadow hover:shadow-red-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-red-500/30 dark:hover:shadow-lg dark:hover:shadow-red-500/40"
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
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1c1f26]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <ExclamationTriangleIcon className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">중복 차량번호</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  이미 저장된 차량번호입니다.
                  <br />기존 데이터를 <span className="font-semibold text-amber-600 dark:text-amber-400">덮어쓰시겠습니까?</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setOverwriteModal({ show: false, callback: null })}
                  className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
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
                  className="flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 py-3 text-base font-semibold text-white shadow-sm shadow-amber-500/15 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow hover:shadow-amber-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-amber-500/30 dark:hover:shadow-lg dark:hover:shadow-amber-500/40"
                >
                  덮어쓰기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 신규 저장 확인 모달 */}
      <AnimatePresence>
        {saveConfirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
            onClick={() => setSaveConfirmModal({ show: false, vehicleNumber: '', callback: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1c1f26]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <CheckIcon className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">저장 확인</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  차량번호 <span className="font-semibold text-blue-600 dark:text-blue-400">{saveConfirmModal.vehicleNumber}</span>
                  <br />데이터를 저장하시겠습니까?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveConfirmModal({ show: false, vehicleNumber: '', callback: null })}
                  className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (saveConfirmModal.callback) {
                      saveConfirmModal.callback();
                    }
                    setSaveConfirmModal({ show: false, vehicleNumber: '', callback: null });
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-sm shadow-accent-500/15 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow hover:shadow-accent-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-accent-500/30 dark:hover:shadow-lg dark:hover:shadow-accent-500/40"
                >
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상태 변경 확인 모달 */}
      <AnimatePresence>
        {statusChangeModal.show && statusChangeModal.newStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
            onClick={() => setStatusChangeModal({ show: false, vehicleNumber: '', newStatus: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1c1f26]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <CheckIcon className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">상태 변경</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  차량번호 <span className="font-semibold text-blue-600 dark:text-blue-400">{statusChangeModal.vehicleNumber}</span>
                  <br />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {{ intake: '입고', productization: '상품화', advertising: '광고', sold: '판매완료' }[statusChangeModal.newStatus!]}
                  </span> 상태로 변경하시겠습니까?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatusChangeModal({ show: false, vehicleNumber: '', newStatus: null })}
                  className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    const { vehicleNumber, newStatus } = statusChangeModal;
                    setStatusChangeModal({ show: false, vehicleNumber: '', newStatus: null });
                    if (newStatus) {
                      await updateVehicleStatus(vehicleNumber, newStatus);
                    }
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg hover:shadow-accent-500/40 active:scale-[0.98] dark:from-accent-400 dark:to-accent-500 dark:shadow-md dark:shadow-accent-400/35 dark:hover:shadow-lg dark:hover:shadow-accent-400/45"
                >
                  변경
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 판매완료 뷰 모달 */}
      {showSoldView && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 dark:bg-[#0f1115]">

            {/* 헤더 */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl dark:border-[#2a2f3a] dark:bg-[#1c1f26]/90">
              <div className="flex h-14 items-center justify-between px-4">
                <button
                  onClick={() => setShowSoldView(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">판매완료</h2>
                <div className="w-9" />
              </div>
            </div>

            {/* 검색바 */}
            <div className="p-4 pb-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={soldSearchQuery}
                  onChange={(e) => setSoldSearchQuery(e.target.value)}
                  placeholder="차량번호, 모델명으로 검색"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-[#363b47] dark:bg-[#1c1f26] dark:text-white dark:placeholder-gray-500 dark:focus:border-accent-400"
                />
              </div>
            </div>

            {/* 카드 목록 */}
            <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              {(() => {
                const soldList = vehicleList
                  .filter(v => v.status === 'sold')
                  .filter(v => {
                    if (!soldSearchQuery.trim()) return true;
                    const q = soldSearchQuery.toLowerCase();
                    return v.vehicleNumber.toLowerCase().includes(q) ||
                           v.modelName?.toLowerCase().includes(q) ||
                           v.manufacturer?.toLowerCase().includes(q);
                  });

                if (soldList.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                        <CheckCircleIcon className="size-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {soldSearchQuery.trim() ? `"${soldSearchQuery}" 검색 결과가 없습니다` : '판매완료된 차량이 없습니다'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 pt-2">
                    {soldList.map((item) => (
                      <div
                        key={item.id}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setSoldContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
                        }}
                        className="spec-card--sold"
                      >
                        {/* 판매완료 배지 */}
                        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/25">
                          SOLD
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ${item.saleType === '위탁' ? 'bg-rose-500 shadow-rose-500/40' : 'bg-emerald-500 shadow-emerald-500/40'}`}>
                              {item.saleType === '위탁' ? '위' : '매'}
                            </span>
                            <div>
                              <span className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100">{item.vehicleNumber}</span>
                              <span className={`ml-2 rounded-md px-1.5 py-0.5 text-xs font-medium ${item.vehicleType === 'camper' ? 'border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-400'}`}>
                                {item.vehicleType === 'camper' ? '캠핑카' : '카라반'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.modelName || '모델명 없음'}</p>
                          {item.manufacturer && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{item.manufacturer}</p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-100/80 pt-3 dark:border-white/5">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(item.updatedAt).toLocaleDateString('ko-KR')} 판매완료
                          </span>
                          <button
                            onClick={() => {
                              setShowSoldView(false);
                              setTimeout(() => {
                                requestStatusChange(item.vehicleNumber, 'intake');
                              }, 100);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-accent-500/20 transition-all hover:from-accent-400 hover:to-accent-500 hover:shadow-md hover:shadow-accent-500/25 active:scale-[0.98] dark:shadow-accent-500/30"
                          >
                            <ArrowPathIcon className="size-3.5" />
                            재등록
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 판매완료 컨텍스트 메뉴 */}
            {soldContextMenu.show && soldContextMenu.item && (
              <div
                className="fixed z-[60] min-w-[160px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#454c5c] dark:bg-[#262a33] dark:shadow-black/40"
                style={{ left: soldContextMenu.x, top: soldContextMenu.y }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    const vehicleNumber = soldContextMenu.item?.vehicleNumber;
                    setSoldContextMenu({ show: false, x: 0, y: 0, item: null });
                    setShowSoldView(false);
                    if (vehicleNumber) {
                      setTimeout(() => {
                        requestStatusChange(vehicleNumber, 'intake');
                      }, 100);
                    }
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-accent-600 transition-colors hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-950/50"
                >
                  <ArrowPathIcon className="size-4" />
                  재등록 (입고)
                </button>
              </div>
            )}
        </div>
      )}

      {/* Toast 알림 - 모바일 전용 (PC는 헤더에 통합) */}
      <AnimatePresence mode="wait">
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 25,
              mass: 0.8
            }}
            className="pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+1rem)] z-50 -translate-x-1/2 lg:hidden"
          >
            <div className={`
              flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg
              ${toast.type === 'success'
                ? 'bg-gray-900 text-white shadow-gray-900/30 dark:bg-gray-100 dark:text-gray-900 dark:shadow-white/20'
                : toast.type === 'error'
                ? 'bg-red-600 text-white shadow-red-600/40'
                : 'bg-amber-500 text-white shadow-amber-500/40'
              }
            `}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  toast.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {toast.type === 'success' && (
                  <CheckIcon className="size-3" />
                )}
                {toast.type === 'error' && (
                  <XMarkIcon className="size-3" />
                )}
                {toast.type === 'warning' && (
                  <ExclamationTriangleIcon className="size-3" />
                )}
              </motion.div>
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
}

