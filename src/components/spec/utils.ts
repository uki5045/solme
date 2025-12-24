// 차량 옵션표 관련 유틸리티 함수

import { stepFields } from './constants';

// 숫자만 허용
export const onlyNumbers = (value: string): string => value.replace(/[^\d]/g, '');

// 소수점 허용 (음수 불가)
export const onlyDecimal = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return cleaned;
};

// 숫자, 소수점, + 기호 허용
export const onlyDecimalPlus = (value: string): string => {
  return value.replace(/[^0-9.+]/g, '');
};

// 줄바꿈을 두 칸 띄어쓰기로 변환 (옵션 필드용)
export const normalizeOptionText = (text: string): string => {
  if (!text) return text;
  return text
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('  ');
};

// 변경된 필드를 스텝명으로 변환
export const getChangedSteps = (fields: string[]): string[] => {
  const steps = new Set<string>();
  fields.forEach(field => {
    if (stepFields.info.includes(field)) steps.add('정보');
    else if (stepFields.spec.includes(field)) steps.add('제원');
    else if (stepFields.option.includes(field)) steps.add('옵션');
  });
  return Array.from(steps);
};

// 숫자 포맷 (천단위 콤마)
export const formatNumber = (value: string): string => {
  if (!value) return '';
  const num = value.toString().replace(/[^\d.]/g, '');
  const parts = num.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

// 상대 시간 포맷 (방금 전, N분 전, N시간 전 등)
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

// 연식 파싱
export const parseYear = (value: string): { label: string; value: string } => {
  if (!value) return { label: '연식', value: '-' };
  const trimmed = value.trim();
  if (trimmed.includes('.')) {
    const [year, month] = trimmed.split('.');
    return { label: '제작연월', value: `${year} 년 ${parseInt(month)} 월` };
  }
  return { label: '연식', value: `${trimmed} 년식` };
};

// 최초등록일 파싱
export const parseFirstReg = (value: string): string => {
  if (!value) return '-';
  const trimmed = value.trim();
  if (trimmed.includes('.')) {
    const [year, month] = trimmed.split('.');
    return `${year} 년 ${parseInt(month)} 월`;
  }
  return `${trimmed} 년`;
};

// 차량번호 형식 검증 (00가0000 또는 000가0000)
export const isValidVehicleNumber = (num: string): boolean => {
  const pattern = /^\d{2,3}[가-힣]\d{4}$/;
  return pattern.test(num.trim());
};

// 가격 포맷 (만원 단위 입력 → 4,100만원, 1억2천만원 형식)
export const formatPrice = (value: string): string => {
  if (!value) return '';
  const num = parseInt(value.replace(/[^\d]/g, ''), 10);
  if (isNaN(num) || num === 0) return '';

  const eok = Math.floor(num / 10000);
  const rest = num % 10000;

  let result = '';

  if (eok > 0) {
    result += `${eok}억`;
  }

  if (rest > 0) {
    // 억이 있으면 띄어쓰기 추가
    if (eok > 0) result += ' ';

    if (eok > 0 && rest % 1000 === 0) {
      // 억이 있고 정확히 천 단위면 한글로 (1억 2천만원)
      result += `${rest / 1000}천만원`;
    } else {
      // 그 외는 쉼표 포맷 (4,000만원, 1억 2,500만원)
      result += `${rest.toLocaleString()}만원`;
    }
  }

  // 억만 있고 나머지가 0일 때
  if (eok > 0 && rest === 0) {
    return result;
  }

  return result;
};
