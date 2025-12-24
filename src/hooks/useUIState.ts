'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { StatusTabType, VehicleListItem } from '@/components/spec/types';
import { STATUS_TABS } from '@/components/spec/constants';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  item: VehicleListItem | null;
}

interface UseUIStateReturn {
  // 상태 탭
  statusTab: StatusTabType;
  setStatusTab: (tab: StatusTabType) => void;
  statusIndex: number;

  // 검색
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // 반응형
  isMobileView: boolean;
  mobileView: 'form' | 'list';
  setMobileView: (view: 'form' | 'list') => void;

  // 컨텍스트 메뉴
  contextMenu: ContextMenuState;
  setContextMenu: (menu: ContextMenuState) => void;
  closeContextMenu: () => void;

  // 드롭다운
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  userDropdownRef: React.RefObject<HTMLDivElement | null>;

  // 판매완료 뷰
  showSoldView: boolean;
  setShowSoldView: (show: boolean) => void;
}

export function useUIState(): UseUIStateReturn {
  // 상태 탭
  const [statusTab, setStatusTabInternal] = useState<StatusTabType>('all');
  const [statusIndex, setStatusIndex] = useState(0);

  // 검색
  const [searchQuery, setSearchQueryInternal] = useState('');

  // 반응형
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'list'>('list');

  // 컨텍스트 메뉴
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    item: null,
  });

  // 드롭다운
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // 판매완료 뷰
  const [showSoldView, setShowSoldView] = useState(false);

  // 상태 탭 인덱스 계산
  useEffect(() => {
    setStatusIndex(STATUS_TABS.indexOf(statusTab));
  }, [statusTab]);

  // 검색어 입력 시 전체 탭으로 이동
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryInternal(query);
    if (query.trim() && statusTab !== 'all') {
      setStatusTabInternal('all');
    }
  }, [statusTab]);

  // 상태 탭 변경 (검색어 유지)
  const setStatusTab = useCallback((tab: StatusTabType) => {
    setStatusTabInternal(tab);
  }, []);

  // 모바일 뷰 감지 (debounce 적용)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    checkMobile(); // 초기 실행
    window.addEventListener('resize', debouncedCheck);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  // 컨텍스트 메뉴 닫기
  const closeContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0, item: null });
  }, []);

  return {
    // 상태 탭
    statusTab,
    setStatusTab,
    statusIndex,

    // 검색
    searchQuery,
    setSearchQuery,

    // 반응형
    isMobileView,
    mobileView,
    setMobileView,

    // 컨텍스트 메뉴
    contextMenu,
    setContextMenu,
    closeContextMenu,

    // 드롭다운
    showUserDropdown,
    setShowUserDropdown,
    userDropdownRef,

    // 판매완료 뷰
    showSoldView,
    setShowSoldView,
  };
}
