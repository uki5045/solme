'use client';

import { memo } from 'react';

// 숫자만 허용
const onlyNumbers = (value: string) => value.replace(/[^0-9]/g, '');

interface YearMonthInputProps {
  value: string;
  onChange: (value: string) => void;
  yearPlaceholder?: string;
  monthPlaceholder?: string;
  yearWidth?: string;
  monthWidth?: string;
  className?: string;
}

const YearMonthInput = memo(function YearMonthInput({
  value,
  onChange,
  yearPlaceholder = '년',
  monthPlaceholder = '월',
  yearWidth = 'w-24',
  monthWidth = 'w-16',
  className = '',
}: YearMonthInputProps) {
  const [yearVal, monthVal] = (value || '').split('.');

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = onlyNumbers(e.target.value);
    const newValue = monthVal ? `${newYear}.${monthVal}` : newYear;
    onChange(newValue);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = onlyNumbers(e.target.value);
    const newValue = newMonth ? `${yearVal || ''}.${newMonth}` : (yearVal || '');
    onChange(newValue);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        inputMode="numeric"
        value={yearVal || ''}
        onChange={handleYearChange}
        placeholder={yearPlaceholder}
        className={`form-input ${yearWidth}`}
      />
      <input
        type="text"
        inputMode="numeric"
        value={monthVal || ''}
        onChange={handleMonthChange}
        placeholder={monthPlaceholder}
        className={`form-input ${monthWidth}`}
      />
    </div>
  );
});

export default YearMonthInput;
