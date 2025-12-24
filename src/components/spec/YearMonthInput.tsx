'use client';

import { memo, useState, useEffect, useRef } from 'react';

// 숫자만 허용
const onlyNumbers = (value: string) => value.replace(/[^0-9]/g, '');

interface YearMonthInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 연월 통합 입력 컴포넌트
 * - 4자리 입력 시 자동으로 "-" 추가 (예: 2019 → 2019-)
 * - 저장 형식: "2019.9" (기존 호환)
 * - 입력 형식: "2019-9" (사용자 친화적)
 */
const YearMonthInput = memo(function YearMonthInput({
  value,
  onChange,
  placeholder = '2019-9',
  className = '',
}: YearMonthInputProps) {
  // 내부 표시용 값 (2019-9 형태)
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 value(2019.9)를 내부 displayValue(2019-9)로 변환
  useEffect(() => {
    if (value) {
      const converted = value.replace('.', '-');
      setDisplayValue(converted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // 하이픈 제거하고 숫자만 추출
    const numbersOnly = onlyNumbers(rawValue.replace(/-/g, ''));

    // 최대 6자리 (YYYYMM)
    const trimmed = numbersOnly.slice(0, 6);

    let formatted = '';

    if (trimmed.length <= 4) {
      // 연도만 입력
      formatted = trimmed;

      // 4자리 입력 완료 시 자동으로 하이픈 추가
      if (trimmed.length === 4 && rawValue.length > displayValue.length) {
        formatted = trimmed + '-';
      }
    } else {
      // 연도 + 월
      const year = trimmed.slice(0, 4);
      const month = trimmed.slice(4);

      // 월 유효성 검사 (1-12)
      let validMonth = month;
      if (month.length === 1 && parseInt(month) > 1 && parseInt(month) <= 9) {
        // 2-9 입력 시 바로 완료
        validMonth = month;
      } else if (month.length === 2) {
        const monthNum = parseInt(month);
        if (monthNum < 1) validMonth = '1';
        else if (monthNum > 12) validMonth = '12';
        else validMonth = month;
      }

      formatted = `${year}-${validMonth}`;
    }

    setDisplayValue(formatted);

    // 외부로 전달할 때는 2019.9 형태로 변환
    const [yearPart, monthPart] = formatted.split('-');
    if (yearPart && monthPart) {
      onChange(`${yearPart}.${monthPart}`);
    } else if (yearPart) {
      onChange(yearPart);
    } else {
      onChange('');
    }

    // 커서를 항상 맨 끝으로 이동 (다음 렌더 후)
    setTimeout(() => {
      if (inputRef.current) {
        const endPos = formatted.length;
        inputRef.current.setSelectionRange(endPos, endPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스로 하이픈 삭제 시 연도도 함께 삭제되도록
    if (e.key === 'Backspace') {
      const cursorPos = (e.target as HTMLInputElement).selectionStart || 0;
      if (cursorPos === 5 && displayValue.length === 5 && displayValue[4] === '-') {
        e.preventDefault();
        const newValue = displayValue.slice(0, 4);
        setDisplayValue(newValue);
        onChange(newValue);
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`form-input ${className}`}
    />
  );
});

export default YearMonthInput;

/**
 * 연월 값을 표시 형식으로 변환 (옵션표 출력용)
 * @param value "2019.9" 형태의 값
 * @returns "2019년 9월" 또는 "2019년" (월 없을 시)
 */
export function formatYearMonth(value: string): string {
  if (!value) return '';

  const [year, month] = value.split('.');
  if (year && month) {
    return `${year}년 ${month}월`;
  } else if (year) {
    return `${year}년`;
  }
  return value;
}
