'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useClickOutside } from './useClickOutside';
import type { Notification } from '@/lib/supabase';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationsLoading: boolean;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(pollingInterval = 30000): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // 알림 가져오기
  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setNotificationsLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=20');
      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (err) {
      console.error('알림 로드 실패:', err);
    } finally {
      if (showLoading) setNotificationsLoading(false);
    }
  }, []);

  // 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('읽음 처리 실패:', err);
    }
  }, []);

  // 알림 삭제
  const clearAllNotifications = useCallback(async () => {
    try {
      await fetch('/api/notifications?deleteAll=true', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('알림 삭제 실패:', err);
    }
  }, []);

  // 초기 로드 & 폴링
  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), pollingInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollingInterval]);

  // 드롭다운 외부 클릭 감지
  useClickOutside(notificationRef, () => setShowNotifications(false), showNotifications);

  return {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    notificationsLoading,
    notificationRef,
    markAllAsRead,
    clearAllNotifications,
    refetch: () => fetchNotifications(false),
  };
}
