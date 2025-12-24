'use client';

import { Cog6ToothIcon } from '@heroicons/react/16/solid';

// 결과 카드 (제목 + 테이블)
export function ResultCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg outline outline-1 -outline-offset-1 outline-gray-200 dark:outline-gray-700">
      <div className="flex items-center gap-2 bg-accent-500 px-5 py-3.5 text-base font-bold text-white">
        {Icon && <Icon className="size-5" />}
        {title}
      </div>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// 결과 행 (라벨 + 값)
export function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
      <td className="w-2/5 border-r border-gray-200 bg-gray-50 px-5 py-3.5 text-base font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        {label}
      </td>
      <td className="bg-white px-5 py-3.5 text-base font-semibold text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        {value}
      </td>
    </tr>
  );
}

// 옵션 카드 (고정 제목)
export function OptionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg outline outline-1 -outline-offset-1 outline-gray-200 dark:outline-gray-700">
      <div className="flex items-center gap-2 bg-accent-500 px-5 py-3.5 text-base font-bold text-white">
        <Cog6ToothIcon className="size-5" />
        옵션
      </div>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// 옵션 행 (라벨 + 컨텐츠)
export function OptionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
      <td className="w-24 shrink-0 border-r border-gray-200 bg-gray-50 px-5 py-4 text-center text-base font-medium text-gray-500 align-middle dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        {label}
      </td>
      <td className="bg-white px-5 py-4 text-base font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        {children}
      </td>
    </tr>
  );
}
