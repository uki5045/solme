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
