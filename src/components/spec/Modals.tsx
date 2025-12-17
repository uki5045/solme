'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import type { VehicleStatus } from './types';
import { STATUS_CHANGE_LABELS } from './constants';

// 공통 모달 백드롭
const ModalBackdrop = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
    onClick={onClose}
  >
    {children}
  </motion.div>
);

// 공통 모달 컨테이너
const ModalContainer = ({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1c1f26]"
    onClick={onClick || ((e) => e.stopPropagation())}
  >
    {children}
  </motion.div>
);

// 삭제 확인 모달
interface DeleteModalProps {
  show: boolean;
  vehicleNumber: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ show, vehicleNumber, onClose, onConfirm }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <ModalBackdrop onClose={onClose}>
          <ModalContainer>
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XMarkIcon className="size-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">삭제 확인</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                차량번호 <span className="font-semibold text-red-600 dark:text-red-400">{vehicleNumber}</span>
                <br />데이터를 <span className="font-semibold text-red-600 dark:text-red-400">삭제</span>하시겠습니까?
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
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}

// 초기화 확인 모달
interface ResetModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetModal({ show, onClose, onConfirm }: ResetModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <ModalBackdrop onClose={onClose}>
          <ModalContainer>
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <ExclamationTriangleIcon className="size-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">초기화</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                입력한 내용을 모두 <span className="font-semibold text-red-600 dark:text-red-400">초기화</span>하시겠습니까?
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
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}

// 덮어쓰기 확인 모달
interface OverwriteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function OverwriteModal({ show, onClose, onConfirm }: OverwriteModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <ModalBackdrop onClose={onClose}>
          <ModalContainer>
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
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
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
  return (
    <AnimatePresence>
      {show && (
        <ModalBackdrop onClose={onClose}>
          <ModalContainer>
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
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
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
  return (
    <AnimatePresence>
      {show && newStatus && (
        <ModalBackdrop onClose={onClose}>
          <ModalContainer>
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <CheckIcon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">상태 변경</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                차량번호 <span className="font-semibold text-blue-600 dark:text-blue-400">{vehicleNumber}</span>
                <br />
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {STATUS_CHANGE_LABELS[newStatus]}
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
          </ModalContainer>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}
