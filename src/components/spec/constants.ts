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

// 상태 라벨
import type { StatusLabel } from '@/components/spec/VehicleCard';
import type { VehicleStatus } from './types';

export const STATUS_LABELS: Record<VehicleStatus, StatusLabel> = {
  intake: { label: '입고', color: 'border border-gray-300 bg-gray-50 text-gray-600 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:shadow-gray-900/30' },
  productization: { label: '상품화', color: 'border border-amber-300 bg-amber-50 text-amber-700 shadow-sm shadow-amber-200/50 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-400 dark:shadow-amber-500/20' },
  advertising: { label: '광고', color: 'border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-200/50 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 dark:shadow-emerald-500/20' },
  sold: { label: '판매완료', color: 'border border-gray-400 bg-gray-100 text-gray-500 shadow-sm dark:border-gray-500 dark:bg-gray-700 dark:text-gray-400' },
};

// 상태 탭 라벨
import type { StatusTabType } from './types';
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
  sold: '판매완료',
};
