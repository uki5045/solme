'use client';

import { RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  InformationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid';
import type { CamperData, CaravanData, MainTab } from './types';
import { formatNumber, parseYear, parseFirstReg } from './utils';
import { ResultCard, ResultRow, OptionCard, OptionRow } from './ResultComponents';

interface ResultPreviewModalProps {
  show: boolean;
  previewData: { type: MainTab; data: CamperData | CaravanData } | null;
  mainTab: MainTab;
  camperData: CamperData;
  caravanData: CaravanData;
  isMobileView: boolean;
  camperResultRef: RefObject<HTMLDivElement | null>;
  caravanResultRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onDownload: (type: MainTab) => void;
}

// 옵션 포맷 (칩 스타일)
const formatOptions = (text: string): React.ReactNode => {
  if (!text || !text.trim()) return '-';
  const items = text.split(/\s{2,}|\r?\n/).filter((item) => item.trim());
  if (items.length === 0) return '-';
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span
          key={index}
          className="inline-block whitespace-nowrap rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

// 전기 옵션 포맷 (칩 스타일)
const formatElectric = (items: { label: string; value: string; unit: string }[]): React.ReactNode => {
  const validItems = items.filter((item) => item.value);
  if (validItems.length === 0) return '-';
  return (
    <div className="flex flex-wrap gap-1.5">
      {validItems.map((item, index) => {
        const isNumberOnly = /^[\d.]+$/.test(item.value.trim());
        const displayValue = isNumberOnly ? formatNumber(item.value) : item.value;
        return (
          <span
            key={index}
            className="inline-block whitespace-nowrap rounded bg-gray-100 px-2 py-0.5 text-sm"
          >
            <span className="text-gray-700">{item.label} {displayValue} {item.unit}</span>
          </span>
        );
      })}
    </div>
  );
};

// 결과 테이블 너비 계산
const getResultWidth = (): number => 800;

export default function ResultPreviewModal({
  show,
  previewData,
  mainTab,
  camperData,
  caravanData,
  isMobileView,
  camperResultRef,
  caravanResultRef,
  onClose,
  onDownload,
}: ResultPreviewModalProps) {
  if (!show) return null;

  const displayType = previewData?.type || mainTab;
  const displayCamperData = (previewData?.type === 'camper' ? previewData.data : camperData) as CamperData;
  const displayCaravanData = (previewData?.type === 'caravan' ? previewData.data : caravanData) as CaravanData;
  const displayYearData = displayType === 'camper' ? parseYear(displayCamperData.year) : parseYear(displayCaravanData.year);

  return (
    <AnimatePresence>
      {/* 카드형 팝업 (absolute, 전체화면 덮지 않음) */}
      <div className="pointer-events-none absolute left-0 right-0 top-16 z-50 flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="pointer-events-auto flex max-h-[75vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 dark:bg-[#1c1f26] dark:ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 버튼 */}
          <div className="flex shrink-0 items-center justify-between gap-2.5 border-b border-gray-200 bg-white px-5 py-4 dark:border-[#363b47] dark:bg-[#1c1f26]">
            <div className="flex gap-2.5">
              <button
                onClick={() => onDownload(displayType)}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-base font-semibold text-white transition-all hover:bg-blue-700"
              >
                다운로드
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                닫기
              </button>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="overflow-auto bg-gray-100 p-5 dark:bg-[#121418]">
            {/* 다운로드용 기존 표 (모바일에서는 숨김) */}
            <div className={isMobileView ? 'absolute -left-[9999px]' : ''}>
              {displayType === 'camper' ? (
                <div ref={camperResultRef} style={{ width: getResultWidth() }} className="bg-white p-6 font-sans">
                  <div className="mb-5 grid grid-cols-2 gap-5">
                    <ResultCard title="차량 정보" icon={InformationCircleIcon}>
                      <ResultRow label="베이스 차량" value={displayCamperData.baseVehicle || '-'} />
                      <ResultRow label="제조사" value={displayCamperData.manufacturer || '-'} />
                      <ResultRow label="모델명" value={displayCamperData.modelName || '-'} />
                      <ResultRow label="차종" value={displayCamperData.vehicleType || '-'} />
                      <ResultRow
                        label={displayYearData.label}
                        value={displayCamperData.hasStructureMod && displayCamperData.structureModDate
                          ? `${displayYearData.value}(${parseFirstReg(displayCamperData.structureModDate)})`
                          : displayYearData.value}
                      />
                      <ResultRow label="최초등록일" value={parseFirstReg(displayCamperData.firstReg)} />
                      <ResultRow label="주행거리" value={displayCamperData.mileage ? `${formatNumber(displayCamperData.mileage)} km` : '-'} />
                      <ResultRow label="차고지 증명" value={displayCamperData.garageProof || '-'} />
                      <ResultRow label="필요 면허" value={displayCamperData.license || '-'} />
                    </ResultCard>
                    <ResultCard title="제원" icon={ChatBubbleBottomCenterTextIcon}>
                      <ResultRow label="길이" value={displayCamperData.length ? `${formatNumber(displayCamperData.length)} mm` : '-'} />
                      <ResultRow label="너비" value={displayCamperData.width ? `${formatNumber(displayCamperData.width)} mm` : '-'} />
                      <ResultRow label="높이" value={displayCamperData.height ? `${formatNumber(displayCamperData.height)} mm` : '-'} />
                      <ResultRow label="배기량" value={displayCamperData.displacement ? `${formatNumber(displayCamperData.displacement)} cc` : '-'} />
                      <ResultRow label="연료" value={displayCamperData.fuel || '-'} />
                      <ResultRow label="변속기" value={displayCamperData.transmission || '-'} />
                      <ResultRow label="연비" value={displayCamperData.fuelEconomy ? `등록증상 ${displayCamperData.fuelEconomy} km/L` : '-'} />
                      <ResultRow label="승차정원" value={displayCamperData.seatCapacity ? `${displayCamperData.seatCapacity} 인` : '-'} />
                      <ResultRow label="현금 영수증" value={displayCamperData.cashReceipt || '-'} />
                    </ResultCard>
                  </div>
                  <OptionCard>
                    <OptionRow label="전 기">
                      {formatElectric([
                        { label: displayCamperData.batteryType || '배터리', value: displayCamperData.batteryCapacity, unit: 'Ah' },
                        { label: '태양광', value: displayCamperData.solar, unit: 'W' },
                        { label: '인버터', value: displayCamperData.inverter, unit: 'Kw' },
                      ])}
                    </OptionRow>
                    <OptionRow label="외 관">{formatOptions(displayCamperData.exterior)}</OptionRow>
                    <OptionRow label="내 장">{formatOptions(displayCamperData.interior)}</OptionRow>
                    <OptionRow label="편 의">{formatOptions(displayCamperData.convenience)}</OptionRow>
                  </OptionCard>
                </div>
              ) : (
                <div ref={caravanResultRef} style={{ width: getResultWidth() }} className="bg-white p-6 font-sans">
                  <div className="mb-5 grid grid-cols-2 gap-5">
                    <ResultCard title="차량 정보" icon={InformationCircleIcon}>
                      <ResultRow label="제조사" value={displayCaravanData.manufacturer || '-'} />
                      <ResultRow label="모델명" value={displayCaravanData.modelName || '-'} />
                      <ResultRow label="차종" value={displayCaravanData.vehicleType || '-'} />
                      <ResultRow
                        label={displayYearData.label}
                        value={displayCaravanData.hasStructureMod && displayCaravanData.structureModDate
                          ? `${displayYearData.value}(${parseFirstReg(displayCaravanData.structureModDate)})`
                          : displayYearData.value}
                      />
                      <ResultRow label="최초등록일" value={parseFirstReg(displayCaravanData.firstReg)} />
                      <ResultRow label="차고지 증명" value={displayCaravanData.garageProof || '-'} />
                      <ResultRow label="취침인원" value={displayCaravanData.sleepCapacity ? `${displayCaravanData.sleepCapacity} 인` : '-'} />
                      <ResultRow label="현금 영수증" value={displayCaravanData.cashReceipt || '-'} />
                    </ResultCard>
                    <ResultCard title="제원" icon={ChatBubbleBottomCenterTextIcon}>
                      <ResultRow label="외부 길이" value={displayCaravanData.extLength ? `${formatNumber(displayCaravanData.extLength)} mm` : '-'} />
                      <ResultRow label="내부 길이" value={displayCaravanData.intLength ? `${formatNumber(displayCaravanData.intLength)} mm` : '-'} />
                      <ResultRow label="외부 너비" value={displayCaravanData.extWidth ? `${formatNumber(displayCaravanData.extWidth)} mm` : '-'} />
                      <ResultRow label="내부 너비" value={displayCaravanData.intWidth ? `${formatNumber(displayCaravanData.intWidth)} mm` : '-'} />
                      <ResultRow label="외부 높이" value={displayCaravanData.extHeight ? `${formatNumber(displayCaravanData.extHeight)} mm` : '-'} />
                      <ResultRow label="내부 높이" value={displayCaravanData.intHeight ? `${formatNumber(displayCaravanData.intHeight)} mm` : '-'} />
                      <ResultRow label="공차 중량" value={displayCaravanData.curbWeight ? `${formatNumber(displayCaravanData.curbWeight)} kg` : '-'} />
                      <ResultRow label="최대 허용 중량" value={displayCaravanData.maxWeight ? `${formatNumber(displayCaravanData.maxWeight)} kg` : '-'} />
                    </ResultCard>
                  </div>
                  <OptionCard>
                    <OptionRow label="전 기">
                      {formatElectric([
                        { label: displayCaravanData.batteryType || '배터리', value: displayCaravanData.batteryCapacity, unit: 'Ah' },
                        { label: '태양광', value: displayCaravanData.solar, unit: 'W' },
                        { label: '인버터', value: displayCaravanData.inverter, unit: 'Kw' },
                      ])}
                    </OptionRow>
                    <OptionRow label="외 관">{formatOptions(displayCaravanData.exterior)}</OptionRow>
                    <OptionRow label="내 장">{formatOptions(displayCaravanData.interior)}</OptionRow>
                    <OptionRow label="편 의">{formatOptions(displayCaravanData.convenience)}</OptionRow>
                  </OptionCard>
                </div>
              )}
            </div>

            {/* 모바일용 리스트 뷰 */}
            {isMobileView && (
              <div className="space-y-4">
                {displayType === 'camper' ? (
                  <>
                    <MobileInfoCard title="차량 정보">
                      <MobileRow label="베이스 차량" value={displayCamperData.baseVehicle || '-'} />
                      <MobileRow label="제조사" value={displayCamperData.manufacturer || '-'} />
                      <MobileRow label="모델명" value={displayCamperData.modelName || '-'} />
                      <MobileRow label="차종" value={displayCamperData.vehicleType || '-'} />
                      <MobileRow label={displayYearData.label} value={displayCamperData.hasStructureMod && displayCamperData.structureModDate ? `${displayYearData.value}(${parseFirstReg(displayCamperData.structureModDate)})` : displayYearData.value} />
                      <MobileRow label="최초등록일" value={parseFirstReg(displayCamperData.firstReg)} />
                      <MobileRow label="주행거리" value={displayCamperData.mileage ? `${formatNumber(displayCamperData.mileage)} km` : '-'} />
                      <MobileRow label="차고지 증명" value={displayCamperData.garageProof || '-'} />
                      <MobileRow label="필요 면허" value={displayCamperData.license || '-'} />
                    </MobileInfoCard>
                    <MobileInfoCard title="제원">
                      <MobileRow label="길이" value={displayCamperData.length ? `${formatNumber(displayCamperData.length)} mm` : '-'} />
                      <MobileRow label="너비" value={displayCamperData.width ? `${formatNumber(displayCamperData.width)} mm` : '-'} />
                      <MobileRow label="높이" value={displayCamperData.height ? `${formatNumber(displayCamperData.height)} mm` : '-'} />
                      <MobileRow label="배기량" value={displayCamperData.displacement ? `${formatNumber(displayCamperData.displacement)} cc` : '-'} />
                      <MobileRow label="연료" value={displayCamperData.fuel || '-'} />
                      <MobileRow label="변속기" value={displayCamperData.transmission || '-'} />
                      <MobileRow label="연비" value={displayCamperData.fuelEconomy ? `등록증상 ${displayCamperData.fuelEconomy} km/L` : '-'} />
                      <MobileRow label="승차정원" value={displayCamperData.seatCapacity ? `${displayCamperData.seatCapacity} 인` : '-'} />
                      <MobileRow label="현금 영수증" value={displayCamperData.cashReceipt || '-'} />
                    </MobileInfoCard>
                    <MobileOptionCard
                      electric={formatElectric([
                        { label: displayCamperData.batteryType || '배터리', value: displayCamperData.batteryCapacity, unit: 'Ah' },
                        { label: '태양광', value: displayCamperData.solar, unit: 'W' },
                        { label: '인버터', value: displayCamperData.inverter, unit: 'Kw' },
                      ])}
                      exterior={formatOptions(displayCamperData.exterior)}
                      interior={formatOptions(displayCamperData.interior)}
                      convenience={formatOptions(displayCamperData.convenience)}
                    />
                  </>
                ) : (
                  <>
                    <MobileInfoCard title="차량 정보">
                      <MobileRow label="제조사" value={displayCaravanData.manufacturer || '-'} />
                      <MobileRow label="모델명" value={displayCaravanData.modelName || '-'} />
                      <MobileRow label="차종" value={displayCaravanData.vehicleType || '-'} />
                      <MobileRow label={displayYearData.label} value={displayCaravanData.hasStructureMod && displayCaravanData.structureModDate ? `${displayYearData.value}(${parseFirstReg(displayCaravanData.structureModDate)})` : displayYearData.value} />
                      <MobileRow label="최초등록일" value={parseFirstReg(displayCaravanData.firstReg)} />
                      <MobileRow label="차고지 증명" value={displayCaravanData.garageProof || '-'} />
                      <MobileRow label="취침인원" value={displayCaravanData.sleepCapacity ? `${displayCaravanData.sleepCapacity} 인` : '-'} />
                      <MobileRow label="현금 영수증" value={displayCaravanData.cashReceipt || '-'} />
                    </MobileInfoCard>
                    <MobileInfoCard title="제원">
                      <MobileRow label="외부 길이" value={displayCaravanData.extLength ? `${formatNumber(displayCaravanData.extLength)} mm` : '-'} />
                      <MobileRow label="내부 길이" value={displayCaravanData.intLength ? `${formatNumber(displayCaravanData.intLength)} mm` : '-'} />
                      <MobileRow label="외부 너비" value={displayCaravanData.extWidth ? `${formatNumber(displayCaravanData.extWidth)} mm` : '-'} />
                      <MobileRow label="내부 너비" value={displayCaravanData.intWidth ? `${formatNumber(displayCaravanData.intWidth)} mm` : '-'} />
                      <MobileRow label="외부 높이" value={displayCaravanData.extHeight ? `${formatNumber(displayCaravanData.extHeight)} mm` : '-'} />
                      <MobileRow label="내부 높이" value={displayCaravanData.intHeight ? `${formatNumber(displayCaravanData.intHeight)} mm` : '-'} />
                      <MobileRow label="공차 중량" value={displayCaravanData.curbWeight ? `${formatNumber(displayCaravanData.curbWeight)} kg` : '-'} />
                      <MobileRow label="최대 허용 중량" value={displayCaravanData.maxWeight ? `${formatNumber(displayCaravanData.maxWeight)} kg` : '-'} />
                    </MobileInfoCard>
                    <MobileOptionCard
                      electric={formatElectric([
                        { label: displayCaravanData.batteryType || '배터리', value: displayCaravanData.batteryCapacity, unit: 'Ah' },
                        { label: '태양광', value: displayCaravanData.solar, unit: 'W' },
                        { label: '인버터', value: displayCaravanData.inverter, unit: 'Kw' },
                      ])}
                      exterior={formatOptions(displayCaravanData.exterior)}
                      interior={formatOptions(displayCaravanData.interior)}
                      convenience={formatOptions(displayCaravanData.convenience)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// 모바일 정보 카드
function MobileInfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
      <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

// 모바일 행
function MobileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  );
}

// 모바일 옵션 카드
function MobileOptionCard({
  electric,
  exterior,
  interior,
  convenience,
}: {
  electric: React.ReactNode;
  exterior: React.ReactNode;
  interior: React.ReactNode;
  convenience: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 dark:bg-[#1c1f26]">
      <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">옵션</h3>
      <div className="space-y-3 text-sm">
        <div><span className="text-gray-500">전기</span><div className="mt-1">{electric}</div></div>
        <div><span className="text-gray-500">외관</span><div className="mt-1">{exterior}</div></div>
        <div><span className="text-gray-500">내장</span><div className="mt-1">{interior}</div></div>
        <div><span className="text-gray-500">편의</span><div className="mt-1">{convenience}</div></div>
      </div>
    </div>
  );
}
