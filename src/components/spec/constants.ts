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
