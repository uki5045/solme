import { getSupabaseAdmin } from './supabase-server';
import type { NotificationType } from './supabase';

// 필드 한글 라벨 매핑
const fieldLabels: Record<string, string> = {
  // 공통
  vehicleNumber: '차량번호',
  baseVehicle: '베이스 차량',
  manufacturer: '제조사',
  modelName: '모델명',
  yearMonth: '연식',
  registrationDate: '최초등록일',
  mileage: '주행거리',
  price: '가격',
  cashReceipt: '현금영수증',

  // 캠핑카
  vehicleCategory: '차종',
  license: '필요 면허',
  structureChange: '구조변경',
  length: '길이',
  width: '너비',
  height: '높이',
  displacement: '배기량',
  fuelEconomy: '연비',
  seatCapacity: '승차정원',
  fuel: '연료',
  transmission: '변속기',
  garageProof: '차고지 증명',

  // 카라반
  extLength: '외부 길이',
  intLength: '내부 길이',
  extHeight: '외부 높이',
  intHeight: '내부 높이',
  extWidth: '외부 너비',
  intWidth: '내부 너비',
  curbWeight: '공차 중량',
  maxWeight: '최대 허용 중량',

  // 옵션 공통
  batteryCapacity: '배터리',
  batteryType: '배터리종류',
  solar: '태양광',
  solarCapacity: '태양광',
  inverter: '인버터',
  inverterCapacity: '인버터',
  saleType: '구분',
  hasAC: '에어컨',
  hasHeating: '난방',
  hasRefrigerator: '냉장고',
  hasTV: 'TV',
  hasBathroom: '화장실',
  etcOptions: '기타 옵션',
};

// 상태 한글 라벨
const statusLabels: Record<string, string> = {
  intake: '입고',
  productization: '상품화',
  advertising: '광고',
};

// 알림 생성 함수
export async function createNotification({
  type,
  vehicleNumber,
  vehicleType,
  message,
  details,
  userName,
  userImage,
}: {
  type: NotificationType;
  vehicleNumber: string;
  vehicleType: 'camper' | 'caravan';
  message: string;
  details?: {
    changed_fields?: string[];
    old_status?: string;
    new_status?: string;
  };
  userName?: string;
  userImage?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('notifications').insert({
      type,
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      message,
      details: details || null,
      is_read: false,
      user_name: userName || null,
      user_image: userImage || null,
    });

    if (error) {
      console.error('[Notifications] Insert error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Notifications] Unexpected error:', err);
    return false;
  }
}

// 변경된 필드 감지 함수
export function detectChangedFields(
  oldData: Record<string, string>,
  newData: Record<string, string>
): string[] {
  const changedFields: string[] = [];

  // 새 데이터의 모든 키 순회
  for (const key of Object.keys(newData)) {
    const oldValue = oldData[key] || '';
    const newValue = newData[key] || '';

    // 값이 다르면 변경된 것
    if (oldValue !== newValue) {
      // 한글 라벨이 있으면 사용, 없으면 원래 키
      changedFields.push(fieldLabels[key] || key);
    }
  }

  return changedFields;
}

// 사용자 정보 타입
interface UserInfo {
  name?: string;
  image?: string;
}

// 차량 생성 알림
export async function notifyVehicleCreated(
  vehicleNumber: string,
  vehicleType: 'camper' | 'caravan',
  modelName?: string,
  user?: UserInfo
) {
  const typeLabel = vehicleType === 'camper' ? '캠핑카' : '카라반';
  const message = modelName
    ? `새 ${typeLabel} 등록: ${vehicleNumber} (${modelName})`
    : `새 ${typeLabel} 등록: ${vehicleNumber}`;

  return createNotification({
    type: 'vehicle_created',
    vehicleNumber,
    vehicleType,
    message,
    userName: user?.name,
    userImage: user?.image,
  });
}

// 차량 수정 알림
export async function notifyVehicleUpdated(
  vehicleNumber: string,
  vehicleType: 'camper' | 'caravan',
  changedFields: string[],
  user?: UserInfo
) {
  if (changedFields.length === 0) return true; // 변경사항 없으면 알림 안 함

  const fieldsText = changedFields.slice(0, 5).join(', ');
  const moreCount = changedFields.length > 5 ? ` 외 ${changedFields.length - 5}개` : '';
  const message = `${vehicleNumber} 수정됨: ${fieldsText}${moreCount}`;

  return createNotification({
    type: 'vehicle_updated',
    vehicleNumber,
    vehicleType,
    message,
    details: { changed_fields: changedFields },
    userName: user?.name,
    userImage: user?.image,
  });
}

// 상태 변경 알림
export async function notifyStatusChanged(
  vehicleNumber: string,
  vehicleType: 'camper' | 'caravan',
  oldStatus: string,
  newStatus: string,
  user?: UserInfo
) {
  const oldLabel = statusLabels[oldStatus] || oldStatus;
  const newLabel = statusLabels[newStatus] || newStatus;
  const message = `${vehicleNumber} 상태 변경: ${oldLabel} → ${newLabel}`;

  return createNotification({
    type: 'status_changed',
    vehicleNumber,
    vehicleType,
    message,
    details: { old_status: oldStatus, new_status: newStatus },
    userName: user?.name,
    userImage: user?.image,
  });
}
