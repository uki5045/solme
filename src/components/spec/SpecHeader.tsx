'use client';

import { RefObject } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/16/solid';
import type { VehicleListItem } from './types';
import type { Notification } from '@/lib/supabase';
import { getChangedSteps, formatRelativeTime } from './utils';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface SpecHeaderProps {
  toast: ToastState;
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null;
  mobileView: 'form' | 'list';
  setMobileView: (view: 'form' | 'list') => void;
  showSoldView: boolean;
  setShowSoldView: (show: boolean) => void;
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  userDropdownRef: RefObject<HTMLDivElement | null>;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationRef: RefObject<HTMLDivElement | null>;
  notifications: Notification[];
  notificationsLoading: boolean;
  unreadCount: number;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  vehicleList: VehicleListItem[];
}

export default function SpecHeader({
  toast,
  session,
  mobileView,
  setMobileView,
  showSoldView,
  setShowSoldView,
  showUserDropdown,
  setShowUserDropdown,
  userDropdownRef,
  showNotifications,
  setShowNotifications,
  notificationRef,
  notifications,
  notificationsLoading,
  unreadCount,
  markAllAsRead,
  clearAllNotifications,
  isDarkMode,
  toggleDarkMode,
  vehicleList,
}: SpecHeaderProps) {
  const soldCount = vehicleList.filter(v => v.status === 'sold').length;

  return (
    <header className="relative z-40 pt-[env(safe-area-inset-top)]">
      {/* 토스트 모드 헤더 - 데스크톱만 */}
      <AnimatePresence mode="wait">
        {toast.show && (
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
            className="absolute inset-0 z-10 hidden h-14 items-center justify-center gap-3 border-b border-gray-200/80 bg-white/95 shadow-lg shadow-gray-200/50 backdrop-blur-xl lg:flex dark:border-[#2a2f3a] dark:bg-[#1c1f26]/95 dark:shadow-black/30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
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
              {toast.type === 'error' && <XMarkIcon className="size-4" />}
              {toast.type === 'warning' && <ExclamationTriangleIcon className="size-4" />}
            </motion.div>
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
      <div className={`border-b border-gray-200/80 bg-white transition-opacity duration-200 dark:border-[#2a2f3a] dark:bg-[#1c1f26] ${toast.show ? 'lg:opacity-0' : 'opacity-100'}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* 좌측: 모바일 - 뷰 전환 탭 / 데스크톱 - 사용자 정보 */}
          <div className="flex items-center">
            {/* 모바일: 뷰 전환 탭 */}
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
                <div className="relative">
                  {session?.user?.image ? (
                    <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-0.5 shadow-sm dark:from-gray-600 dark:to-gray-700">
                      <Image src={session.user.image} alt="프로필" width={36} height={36} className="rounded-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-bold text-white shadow-sm">
                      {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#1c1f26]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {session?.user?.name || session?.user?.email?.split('@')[0]}
                  </span>
                  {session?.user?.name && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">{session?.user?.email}</span>
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
                      onClick={() => { setShowUserDropdown(false); signOut({ callbackUrl: '/' }); }}
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
          <span className="text-[10px] font-medium tracking-wider text-gray-400 dark:text-gray-600">v3.0.4</span>

          {/* 우측: 액션 버튼들 */}
          <div className="flex items-center gap-1 lg:gap-1.5">
            {/* 알림 버튼 + 드롭다운 - 데스크톱 */}
            <div ref={notificationRef} className="relative hidden lg:block">
              <button
                onClick={() => {
                  const willOpen = !showNotifications;
                  setShowNotifications(willOpen);
                  if (willOpen && unreadCount > 0) markAllAsRead();
                }}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                title="알림"
              >
                <BellIcon className="size-5" />
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
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-[#2a2f3a]">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">알림</span>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[13px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                          삭제
                        </button>
                      )}
                    </div>
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
                          <NotificationItem key={notification.id} notification={notification} />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 알림 버튼 - 모바일 */}
            <button
              onClick={() => {
                const willOpen = !showNotifications;
                setShowNotifications(willOpen);
                if (willOpen && unreadCount > 0) markAllAsRead();
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
              {isDarkMode ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
            </button>

            {/* 구분선 - 데스크톱만 */}
            <div className="mx-1 hidden h-5 w-px bg-gray-200 lg:block dark:bg-gray-700" />

            {/* 판매완료 - 데스크톱만 */}
            <button
              onClick={() => setShowSoldView(true)}
              className="hidden h-9 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800 lg:flex dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              <span>판매완료</span>
              {soldCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-500 px-1.5 text-xs font-bold text-white dark:bg-gray-600">
                  {soldCount}
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
                  <Image src={session.user.image} alt="프로필" width={32} height={32} className="rounded-full object-cover" />
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
                    onClick={() => { setShowUserDropdown(false); signOut({ callbackUrl: '/' }); }}
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
                      <button onClick={clearAllNotifications} className="text-[13px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
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
                        <NotificationItem key={notification.id} notification={notification} />
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
  );
}

// 알림 아이템 컴포넌트
function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div
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
  );
}
