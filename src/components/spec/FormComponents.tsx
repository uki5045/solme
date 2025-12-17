'use client';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

// 에러 아이콘
export function ErrorIcon() {
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-sm shadow-red-400/30">
      <span className="text-xs font-bold text-white">!</span>
    </div>
  );
}

// 폼 행 레이아웃
export function FormRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-2 flex items-baseline gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        <span>{label}</span>
        {hint && (
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// 셀렉트 박스
export function FormSelect({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="form-select"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-accent-500">
        <ChevronDownIcon className="size-4 text-gray-500 transition-colors group-focus-within:text-accent-500 dark:text-gray-400" />
      </div>
    </div>
  );
}

// 단위가 있는 인풋
export function InputWithUnit({
  unit,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  unit: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        className="form-input w-full pr-14"
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 dark:text-gray-500">
        {unit}
      </span>
    </div>
  );
}
