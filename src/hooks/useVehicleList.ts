'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VehicleListItem, VehicleStatus, MainTab, CamperData, CaravanData } from '@/components/spec/types';
import { normalizeOptionText } from '@/components/spec/utils';

interface UseVehicleListReturn {
  vehicleList: VehicleListItem[];
  listLoading: boolean;
  fetchVehicleList: () => Promise<void>;
  updateVehicleStatus: (vehicleNumber: string, newStatus: VehicleStatus) => Promise<boolean>;
  checkDuplicate: (vehicleNumber: string) => Promise<boolean>;
  saveToDatabase: (type: MainTab, data: CamperData | CaravanData) => Promise<boolean>;
  deleteVehicle: (vehicleNumber: string) => Promise<boolean>;
}

interface UseVehicleListOptions {
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  refetchNotifications?: () => void;
}

export function useVehicleList({ showToast, refetchNotifications }: UseVehicleListOptions): UseVehicleListReturn {
  const [vehicleList, setVehicleList] = useState<VehicleListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // 차량 목록 조회
  const fetchVehicleList = useCallback(async () => {
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
  }, []);

  // 초기 로드 시 목록 조회
  useEffect(() => {
    fetchVehicleList();
  }, [fetchVehicleList]);

  // 상태 변경 함수
  const updateVehicleStatus = useCallback(async (vehicleNumber: string, newStatus: VehicleStatus): Promise<boolean> => {
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

      fetchVehicleList();
      refetchNotifications?.();
      showToast('상태를 변경했습니다.', 'success');
      return true;
    } catch {
      showToast('상태 변경 중 오류가 발생했습니다.', 'error');
      return false;
    }
  }, [fetchVehicleList, refetchNotifications, showToast]);

  // 중복 확인 함수
  const checkDuplicate = useCallback(async (vehicleNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/specs?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // 실제 저장 함수
  const saveToDatabase = useCallback(async (type: MainTab, rawData: CamperData | CaravanData): Promise<boolean> => {
    const vehicleNumber = rawData.vehicleNumber.trim();
    if (!vehicleNumber) return false;

    const data = {
      ...rawData,
      exterior: normalizeOptionText(rawData.exterior),
      interior: normalizeOptionText(rawData.interior),
      convenience: normalizeOptionText(rawData.convenience),
    };

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

      fetchVehicleList();
      refetchNotifications?.();
      return true;
    } catch {
      showToast('저장 중 오류가 발생했습니다.', 'error');
      return false;
    }
  }, [fetchVehicleList, refetchNotifications, showToast]);

  // 삭제 함수
  const deleteVehicle = useCallback(async (vehicleNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/specs?vehicleNumber=${encodeURIComponent(vehicleNumber)}`,
        { method: 'DELETE' }
      );
      const result = await response.json();

      if (!response.ok) {
        showToast('삭제 실패: ' + result.error, 'error');
        return false;
      }

      showToast('삭제되었습니다.', 'success');
      fetchVehicleList();
      return true;
    } catch (e) {
      console.error('삭제 오류:', e);
      showToast('삭제 중 오류가 발생했습니다.', 'error');
      return false;
    }
  }, [fetchVehicleList, showToast]);

  return {
    vehicleList,
    listLoading,
    fetchVehicleList,
    updateVehicleStatus,
    checkDuplicate,
    saveToDatabase,
    deleteVehicle,
  };
}
