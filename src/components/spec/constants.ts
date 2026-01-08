// 차량 옵션표 관련 상수

import type { CamperData, CaravanData } from './types';

// 스텝별 필드 분류
export const stepFields = {
  info: [ // 1스텝 - 정보
    'vehicleNumber', 'baseVehicle', 'manufacturer', 'modelName', 'yearMonth', 'year',
    'registrationDate', 'firstReg', 'mileage', 'price', 'cashReceipt', 'vehicleCategory',
    'vehicleType', 'license', 'structureChange', 'hasStructureMod', 'structureModDate',
    'saleType', 'garageProof'
  ],
  spec: [ // 2스텝 - 제원
    'length', 'width', 'height', 'displacement', 'fuelEconomy', 'seatCapacity',
    'fuel', 'transmission', 'extLength', 'intLength', 'extHeight', 'intHeight',
    'extWidth', 'intWidth', 'curbWeight', 'maxWeight', 'sleepCapacity'
  ],
  option: [ // 3스텝 - 옵션
    'batteryCapacity', 'batteryType', 'solar', 'solarCapacity', 'inverter',
    'inverterCapacity', 'hasAC', 'hasHeating', 'hasRefrigerator', 'hasTV',
    'hasBathroom', 'etcOptions', 'exterior', 'interior', 'convenience'
  ]
};

// 캠핑카 초기 데이터
export const initialCamperData: CamperData = {
  vehicleNumber: '',
  baseVehicle: '',
  manufacturer: '',
  modelName: '',
  price: '',
  vehicleType: '소형 특수',
  year: '',
  firstReg: '',
  hasStructureMod: false,
  structureModDate: '',
  mileage: '',
  saleType: '매입',
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

// 카라반 초기 데이터
export const initialCaravanData: CaravanData = {
  vehicleNumber: '',
  manufacturer: '',
  modelName: '',
  price: '',
  vehicleType: '소형 특수',
  year: '',
  firstReg: '',
  hasStructureMod: false,
  structureModDate: '',
  garageProof: '불필요',
  sleepCapacity: '',
  saleType: '매입',
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

// 상태 탭 라벨
import type { StatusTabType, VehicleStatus } from './types';
export const STATUS_TAB_LABELS: Record<StatusTabType, string> = {
  all: '전체',
  intake: '입고',
  productization: '상품화',
  advertising: '광고',
};

// 상태 변경 라벨
export const STATUS_CHANGE_LABELS: Record<VehicleStatus, string> = {
  intake: '입고',
  productization: '상품화',
  advertising: '광고',
  contracted: '계약',
  sold: '판매완료',
};

// 판매완료 뷰 탭 라벨
import type { SoldTabType } from './types';
export const SOLD_TAB_LABELS: Record<SoldTabType, string> = {
  contracted: '계약',
  sold: '판매완료',
};
export const SOLD_TABS: SoldTabType[] = ['contracted', 'sold'];

// 상태 탭 순서
export const STATUS_TABS: StatusTabType[] = ['all', 'intake', 'productization', 'advertising'];

// 상태 탭 인디케이터 스타일 (그라데이션) - 라이트: accent, 다크: emerald
const STATUS_GRADIENT = {
  light: 'linear-gradient(to bottom, var(--accent-500), var(--accent-600))',
  dark: 'linear-gradient(to bottom, #34d399, #10b981)', // emerald-400 → emerald-500
};

// 상태 탭 인디케이터 스타일 (그림자) - 라이트: accent, 다크: emerald
const STATUS_SHADOW = {
  light: '0 2px 6px rgba(59, 130, 246, 0.2)',
  dark: '0 2px 8px rgba(52, 211, 153, 0.35)', // emerald glow
};

// 상태 탭 인디케이터 스타일 가져오기
export const getStatusTabStyle = (_statusTab: StatusTabType, isDarkMode: boolean) => ({
  background: isDarkMode ? STATUS_GRADIENT.dark : STATUS_GRADIENT.light,
  boxShadow: isDarkMode ? STATUS_SHADOW.dark : STATUS_SHADOW.light,
});
