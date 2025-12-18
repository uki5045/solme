'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useNotifications } from '@/hooks/useNotifications';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useVehicleList } from '@/hooks/useVehicleList';
import { useLongPress } from '@/hooks/useLongPress';
import { useSession } from 'next-auth/react';
import { domToPng } from 'modern-screenshot';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/tabs';
import VehicleCard from '@/components/spec/VehicleCard';
import SpecHeader from '@/components/spec/SpecHeader';

// 분리된 파일에서 import
import type { CamperData, CaravanData, MainTab, FormStep, VehicleStatus, StatusTabType, VehicleListItem } from '@/components/spec/types';
import { initialCamperData, initialCaravanData } from '@/components/spec/constants';
import { isValidVehicleNumber } from '@/components/spec/utils';
import CamperForm from '@/components/spec/CamperForm';
import CaravanForm from '@/components/spec/CaravanForm';
import { DeleteModal, ResetModal, OverwriteModal, SaveConfirmModal, StatusChangeModal } from '@/components/spec/Modals';
import SoldVehiclesView from '@/components/spec/SoldVehiclesView';
import VehicleContextMenu from '@/components/spec/VehicleContextMenu';
import ResultPreviewModal from '@/components/spec/ResultPreviewModal';
import Toast from '@/components/spec/Toast';

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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; item: VehicleListItem | null }>({ show: false, x: 0, y: 0, item: null });
  const [statusChangeModal, setStatusChangeModal] = useState<{ show: boolean; vehicleNumber: string; newStatus: VehicleStatus | null }>({ show: false, vehicleNumber: '', newStatus: null });
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

  // 사용자 드롭다운 닫기 (외부 클릭 시)
  useClickOutside(userDropdownRef, () => setShowUserDropdown(false), showUserDropdown);

  // 롱프레스 핸들러 (모바일)
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useLongPress<VehicleListItem>(setContextMenu);


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
  const performDownloadPNG = async (type: MainTab): Promise<void> => {
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

      // 6. 이미지 로드 및 다운로드 완료 대기
      await new Promise<void>((resolve, reject) => {
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
                showToast('다운로드 완료', 'success');
                resolve();
              } else {
                reject(new Error('Blob 생성 실패'));
              }
            }, 'image/png');
          } else {
            reject(new Error('Canvas context 생성 실패'));
          }
        };
        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = dataUrl;
      });
    } catch (e) {
      console.error(e);
      showToast('PNG 생성 실패', 'error');
    }
  };

  // PNG 다운로드 (저장 없이 다운로드만)
  const downloadPNG = async (type: MainTab) => {
    await performDownloadPNG(type);
    setShowResult(false);  // 다운로드 완료 후 모달 닫기
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


      {/* 헤더 */}
      <SpecHeader
        toast={toast}
        session={session}
        mobileView={mobileView}
        setMobileView={setMobileView}
        showSoldView={showSoldView}
        setShowSoldView={setShowSoldView}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        userDropdownRef={userDropdownRef}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationRef={notificationRef}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        unreadCount={unreadCount}
        markAllAsRead={markAllAsRead}
        clearAllNotifications={clearAllNotifications}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        vehicleList={vehicleList}
      />

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

          {/* 컨텍스트 메뉴 */}
          <VehicleContextMenu
            contextMenu={contextMenu}
            onClose={() => setContextMenu({ show: false, x: 0, y: 0, item: null })}
            onStatusChange={requestStatusChange}
            onEdit={loadVehicleToForm}
            onDelete={openDeleteModal}
          />
        </div>
      </div>

      {/* 결과 모달 */}
      <ResultPreviewModal
        show={showResult}
        previewData={previewData}
        mainTab={mainTab}
        camperData={camperData}
        caravanData={caravanData}
        isMobileView={isMobileView}
        camperResultRef={camperResultRef}
        caravanResultRef={caravanResultRef}
        onClose={() => {
          setShowResult(false);
          setPreviewData(null);
        }}
        onDownload={downloadPNG}
      />

      {/* 모달 컴포넌트들 */}
      <DeleteModal
        show={deleteModal.show}
        vehicleNumber={deleteModal.vehicleNumber}
        onClose={() => setDeleteModal({ show: false, vehicleNumber: '' })}
        onConfirm={confirmDelete}
      />
      <ResetModal
        show={resetModal}
        vehicleType={mainTab}
        onClose={() => setResetModal(false)}
        onConfirm={confirmReset}
      />
      <OverwriteModal
        show={overwriteModal.show}
        onClose={() => setOverwriteModal({ show: false, callback: null })}
        onConfirm={() => {
          if (overwriteModal.callback) {
            overwriteModal.callback();
          }
          setOverwriteModal({ show: false, callback: null });
        }}
      />
      <SaveConfirmModal
        show={saveConfirmModal.show}
        vehicleNumber={saveConfirmModal.vehicleNumber}
        onClose={() => setSaveConfirmModal({ show: false, vehicleNumber: '', callback: null })}
        onConfirm={() => {
          if (saveConfirmModal.callback) {
            saveConfirmModal.callback();
          }
          setSaveConfirmModal({ show: false, vehicleNumber: '', callback: null });
        }}
      />
      <StatusChangeModal
        show={statusChangeModal.show}
        vehicleNumber={statusChangeModal.vehicleNumber}
        newStatus={statusChangeModal.newStatus}
        onClose={() => setStatusChangeModal({ show: false, vehicleNumber: '', newStatus: null })}
        onConfirm={async () => {
          const { vehicleNumber, newStatus } = statusChangeModal;
          setStatusChangeModal({ show: false, vehicleNumber: '', newStatus: null });
          if (newStatus) {
            await updateVehicleStatus(vehicleNumber, newStatus);
          }
        }}
      />

      {/* 판매완료 뷰 */}
      <SoldVehiclesView
        show={showSoldView}
        onClose={() => setShowSoldView(false)}
        vehicleList={vehicleList}
        onRequestStatusChange={requestStatusChange}
      />

      {/* Toast 알림 - 모바일 전용 (PC는 헤더에 통합) */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />

    </div>
    </>
  );
}

