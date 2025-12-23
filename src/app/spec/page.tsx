'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useNotifications } from '@/hooks/useNotifications';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useVehicleList } from '@/hooks/useVehicleList';
import { useLongPress } from '@/hooks/useLongPress';
import { useUIState } from '@/hooks/useUIState';
import { useImageExport } from '@/hooks/useImageExport';
import { useSession } from 'next-auth/react';
import SpecHeader from '@/components/spec/SpecHeader';
import VehicleListSection from '@/components/spec/VehicleListSection';
import FormSection from '@/components/spec/FormSection';

// 분리된 파일에서 import
import type { CamperData, CaravanData, MainTab, FormStep, VehicleStatus, VehicleListItem } from '@/components/spec/types';
import { initialCamperData, initialCaravanData } from '@/components/spec/constants';
import { isValidVehicleNumber } from '@/components/spec/utils';
import { DeleteModal, ResetModal, OverwriteModal, SaveConfirmModal, StatusChangeModal } from '@/components/spec/Modals';
import SoldVehiclesView from '@/components/spec/SoldVehiclesView';
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

  // UI 상태 훅 (상태탭, 검색, 모바일뷰, 컨텍스트메뉴, 드롭다운, 판매완료뷰)
  const {
    statusTab, setStatusTab, statusIndex,
    searchQuery, setSearchQuery,
    isMobileView, mobileView, setMobileView,
    contextMenu, setContextMenu, closeContextMenu,
    showUserDropdown, setShowUserDropdown, userDropdownRef,
    showSoldView, setShowSoldView,
  } = useUIState();

  // 토스트 표시 함수
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  }, []);

  // 이미지 내보내기 훅
  const { camperResultRef, caravanResultRef, downloadPNG: downloadPNGBase } = useImageExport({
    showToast,
    onComplete: () => setShowResult(false),
  });

  // downloadPNG 래퍼 (modelName 자동 주입)
  const downloadPNG = useCallback((type: MainTab) => {
    const modelName = type === 'camper' ? camperData.modelName : caravanData.modelName;
    return downloadPNGBase(type, modelName);
  }, [downloadPNGBase, camperData.modelName, caravanData.modelName]);

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
  // 알림 클릭 시 해당 차량 카드 하이라이트 (현재 미사용, 추후 활성화)
  const highlightedVehicle: string | null = null;
  const [statusChangeModal, setStatusChangeModal] = useState<{ show: boolean; vehicleNumber: string; newStatus: VehicleStatus | null }>({ show: false, vehicleNumber: '', newStatus: null });
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const statusTabListRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // 차량 리스트 필터링 (메모이제이션)
  const filteredVehicleList = useMemo(() => {
    return vehicleList
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
  }, [vehicleList, statusTab, searchQuery]);

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

  // 상태 변경 요청 (모달 표시)
  const requestStatusChange = (vehicleNumber: string, newStatus: VehicleStatus) => {
    setStatusChangeModal({ show: true, vehicleNumber, newStatus });
  };

  // 컨텍스트 메뉴 닫기 (외부 클릭 시)
  useClickOutside(null, closeContextMenu, contextMenu.show, 'click');

  // 사용자 드롭다운 닫기 (외부 클릭 시)
  useClickOutside(userDropdownRef, () => setShowUserDropdown(false), showUserDropdown);

  // 롱프레스 핸들러 (모바일)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, pressingItemId } = useLongPress<VehicleListItem>(setContextMenu);


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
  }, [setContextMenu]);

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
        <FormSection
          leftSectionRef={leftSectionRef}
          formContainerRef={formContainerRef}
          mobileView={mobileView}
          mainTab={mainTab}
          onMainTabChange={handleMainTabChange}
          tabLoading={tabLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          step={step}
          camperData={camperData}
          setCamperData={setCamperData}
          caravanData={caravanData}
          setCaravanData={setCaravanData}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
          onReset={openResetModal}
          onPrev={goPrev}
          onNext={goNext}
        />

        {/* 우측: 차량 카드 리스트 (상태별 탭) */}
        <VehicleListSection
          mobileView={mobileView}
          leftSectionHeight={leftSectionHeight}
          previewLoading={previewLoading}
          listLoading={listLoading}
          statusTabListRef={statusTabListRef}
          statusTab={statusTab}
          statusIndex={statusIndex}
          setStatusTab={setStatusTab}
          isDarkMode={isDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          vehicleList={vehicleList}
          filteredVehicleList={filteredVehicleList}
          highlightedVehicle={highlightedVehicle}
          onLoadFromCard={loadVehicleFromCard}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          pressingItemId={pressingItemId}
          contextMenu={contextMenu}
          onContextMenuClose={() => setContextMenu({ show: false, x: 0, y: 0, item: null })}
          onStatusChange={requestStatusChange}
          onEdit={loadVehicleToForm}
          onDelete={openDeleteModal}
        />
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

