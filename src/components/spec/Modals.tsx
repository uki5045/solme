'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExclamationTriangleIcon,
  CheckIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import type { VehicleStatus, MainTab } from './types';
import { STATUS_CHANGE_LABELS } from './constants';

// 팝업 위치 계산 (화면 내 유지)
function usePopupPosition(show: boolean) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!show || !popupRef.current) return;

    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const parent = popup.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let offsetY = 0;
    let offsetX = 0;

    // 화면 하단 넘침 방지
    const bottomOverflow = rect.bottom - viewportHeight;
    if (bottomOverflow > 0) {
      offsetY = -bottomOverflow - 20;
    }

    // 화면 상단 넘침 방지
    if (rect.top + offsetY < 0) {
      offsetY = -rect.top + 20;
    }

    // 화면 좌우 넘침 방지
    if (rect.right > viewportWidth) {
      offsetX = viewportWidth - rect.right - 20;
    }
    if (rect.left + offsetX < 0) {
      offsetX = -rect.left + 20;
    }

    setOffset({ x: offsetX, y: offsetY });
  }, [show]);

  return { popupRef, offset };
}

// 카드형 팝업 컨테이너 (position: absolute, 화면 덮지 않음)
const PopupCard = ({
  children,
  onClose,
  popupRef,
  offset,
}: {
  children: React.ReactNode;
  onClose: () => void;
  popupRef: React.RefObject<HTMLDivElement | null>;
  offset: { x: number; y: number };
}) => (
  <motion.div
    ref={popupRef}
    initial={{ opacity: 0, scale: 0.95, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
    style={{
      transform: `translate(${offset.x}px, ${offset.y}px)`,
    }}
    className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:bg-[#1c1f26] dark:ring-white/10"
    onClick={(e) => e.stopPropagation()}
  >
    <button
      onClick={onClose}
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
    >
      <XMarkIcon className="size-5" />
    </button>
    {children}
  </motion.div>
);

// 팝업 래퍼 (absolute 기반, 페이지 상단에 배치, 전체 화면 덮지 않음)
const PopupWrapper = ({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) => (
  <AnimatePresence>
    {show && (
      <div className="pointer-events-none absolute left-0 right-0 top-20 z-50 flex justify-center px-4">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    )}
  </AnimatePresence>
);

// 삭제 확인 모달
interface DeleteModalProps {
  show: boolean;
  vehicleNumber: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ show, vehicleNumber, onClose, onConfirm }: DeleteModalProps) {
  const { popupRef, offset } = usePopupPosition(show);

  return (
    <PopupWrapper show={show}>
      <PopupCard onClose={onClose} popupRef={popupRef} offset={offset}>
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <TrashIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">데이터 삭제</h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            차량번호 <span className="font-semibold text-red-600 dark:text-red-400">{vehicleNumber}</span>
            <br />데이터를 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-b from-red-500 to-red-600 py-3 text-base font-semibold text-white shadow-sm shadow-red-500/15 transition-all duration-200 hover:from-red-400 hover:to-red-500 hover:shadow hover:shadow-red-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-red-500/30 dark:hover:shadow-lg dark:hover:shadow-red-500/40"
          >
            삭제
          </button>
        </div>
      </PopupCard>
    </PopupWrapper>
  );
}

// 초기화 확인 모달
interface ResetModalProps {
  show: boolean;
  vehicleType: MainTab;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetModal({ show, vehicleType, onClose, onConfirm }: ResetModalProps) {
  const { popupRef, offset } = usePopupPosition(show);

  return (
    <PopupWrapper show={show}>
      <PopupCard onClose={onClose} popupRef={popupRef} offset={offset}>
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ArrowPathIcon className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">입력 초기화</h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-red-500 dark:text-red-400">{vehicleType === 'camper' ? '캠핑카' : '카라반'}</span> 입력 내용을
            <br />모두 지우시겠습니까?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-b from-red-500 to-red-600 py-3 text-base font-semibold text-white shadow-sm shadow-red-500/15 transition-all duration-200 hover:from-red-400 hover:to-red-500 hover:shadow hover:shadow-red-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-red-500/30 dark:hover:shadow-lg dark:hover:shadow-red-500/40"
          >
            초기화
          </button>
        </div>
      </PopupCard>
    </PopupWrapper>
  );
}

// 덮어쓰기 확인 모달
interface OverwriteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function OverwriteModal({ show, onClose, onConfirm }: OverwriteModalProps) {
  const { popupRef, offset } = usePopupPosition(show);

  return (
    <PopupWrapper show={show}>
      <PopupCard onClose={onClose} popupRef={popupRef} offset={offset}>
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
            onClick={onClose}
            className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 py-3 text-base font-semibold text-white shadow-sm shadow-amber-500/15 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow hover:shadow-amber-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-amber-500/30 dark:hover:shadow-lg dark:hover:shadow-amber-500/40"
          >
            덮어쓰기
          </button>
        </div>
      </PopupCard>
    </PopupWrapper>
  );
}

// 저장 확인 모달
interface SaveConfirmModalProps {
  show: boolean;
  vehicleNumber: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function SaveConfirmModal({ show, vehicleNumber, onClose, onConfirm }: SaveConfirmModalProps) {
  const { popupRef, offset } = usePopupPosition(show);

  return (
    <PopupWrapper show={show}>
      <PopupCard onClose={onClose} popupRef={popupRef} offset={offset}>
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <CheckIcon className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">저장 확인</h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            차량번호 <span className="font-semibold text-blue-600 dark:text-blue-400">{vehicleNumber}</span>
            <br />데이터를 저장하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-sm shadow-accent-500/15 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow hover:shadow-accent-500/20 active:scale-[0.98] dark:shadow-md dark:shadow-accent-500/30 dark:hover:shadow-lg dark:hover:shadow-accent-500/40"
          >
            저장
          </button>
        </div>
      </PopupCard>
    </PopupWrapper>
  );
}

// 상태 변경 확인 모달
interface StatusChangeModalProps {
  show: boolean;
  vehicleNumber: string;
  newStatus: VehicleStatus | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatusChangeModal({ show, vehicleNumber, newStatus, onClose, onConfirm }: StatusChangeModalProps) {
  const { popupRef, offset } = usePopupPosition(show && !!newStatus);

  return (
    <PopupWrapper show={show && !!newStatus}>
      <PopupCard onClose={onClose} popupRef={popupRef} offset={offset}>
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <CheckIcon className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">상태 변경</h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            차량번호 <span className="font-semibold text-blue-600 dark:text-blue-400">{vehicleNumber}</span>
            <br />
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {newStatus && STATUS_CHANGE_LABELS[newStatus]}
            </span> 상태로 변경하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="form-btn-secondary flex-1 rounded-xl py-3 text-base font-semibold active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 py-3 text-base font-semibold text-white shadow-md shadow-accent-500/30 transition-all duration-200 hover:from-accent-400 hover:to-accent-500 hover:shadow-lg hover:shadow-accent-500/40 active:scale-[0.98] dark:from-accent-400 dark:to-accent-500 dark:shadow-md dark:shadow-accent-400/35 dark:hover:shadow-lg dark:hover:shadow-accent-400/45"
          >
            변경
          </button>
        </div>
      </PopupCard>
    </PopupWrapper>
  );
}
