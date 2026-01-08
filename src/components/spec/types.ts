// 차량 옵션표 관련 타입 정의

export type MainTab = 'camper' | 'caravan';
export type FormStep = 1 | 2 | 3;

export type VehicleStatus = 'intake' | 'productization' | 'advertising' | 'contracted' | 'sold';
export type ActiveStatus = Exclude<VehicleStatus, 'contracted' | 'sold'>;
export type StatusTabType = ActiveStatus | 'all';
export type SoldTabType = 'contracted' | 'sold';

export interface VehicleListItem {
  id: number;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  modelName: string;
  manufacturer: string;
  price: string;
  year: string;
  updatedAt: string;
  status: VehicleStatus;
  isIncomplete: boolean;
  saleType: string;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export interface CamperData {
  vehicleNumber: string;
  baseVehicle: string;
  manufacturer: string;
  modelName: string;
  price: string;
  vehicleType: string;
  year: string;
  firstReg: string;
  hasStructureMod: boolean;
  structureModDate: string;
  mileage: string;
  saleType: string;
  garageProof: string;
  license: string;
  length: string;
  width: string;
  height: string;
  displacement: string;
  fuel: string;
  transmission: string;
  fuelEconomy: string;
  seatCapacity: string;
  cashReceipt: string;
  batteryType: string;
  batteryCapacity: string;
  solar: string;
  inverter: string;
  exterior: string;
  interior: string;
  convenience: string;
}

export interface CaravanData {
  vehicleNumber: string;
  manufacturer: string;
  modelName: string;
  price: string;
  vehicleType: string;
  year: string;
  firstReg: string;
  hasStructureMod: boolean;
  structureModDate: string;
  garageProof: string;
  sleepCapacity: string;
  saleType: string;
  cashReceipt: string;
  extLength: string;
  intLength: string;
  extWidth: string;
  intWidth: string;
  extHeight: string;
  intHeight: string;
  curbWeight: string;
  maxWeight: string;
  batteryType: string;
  batteryCapacity: string;
  solar: string;
  inverter: string;
  exterior: string;
  interior: string;
  convenience: string;
}

