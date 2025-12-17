'use client';

import type { CaravanData, FormStep } from './types';
import { onlyNumbers, onlyDecimalPlus } from './utils';
import { ErrorIcon, FormRow, FormSelect, InputWithUnit } from './FormComponents';
import YearMonthInput from './YearMonthInput';

interface CaravanFormProps {
  step: FormStep;
  data: CaravanData;
  setData: React.Dispatch<React.SetStateAction<CaravanData>>;
  errors?: Record<string, string>;
  clearError?: (key: string) => void;
}

export default function CaravanForm({
  step,
  data,
  setData,
  errors = {},
  clearError,
}: CaravanFormProps) {
  if (step === 1) {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="차량번호">
            <div className="relative">
              <input type="text" value={data.vehicleNumber} onChange={(e) => { setData({ ...data, vehicleNumber: e.target.value }); clearError?.('vehicleNumber'); }} placeholder="12가1234" className={`form-input ${errors.vehicleNumber ? 'form-input-error pr-10' : ''}`} />
              {errors.vehicleNumber && <ErrorIcon />}
            </div>
          </FormRow>
          <FormRow label="제조사">
            <div className="relative">
              <input type="text" value={data.manufacturer} onChange={(e) => { setData({ ...data, manufacturer: e.target.value }); clearError?.('manufacturer'); }} placeholder="코치맨(CM카라반)" className={`form-input ${errors.manufacturer ? 'form-input-error pr-10' : ''}`} />
              {errors.manufacturer && <ErrorIcon />}
            </div>
          </FormRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="모델명">
            <div className="relative">
              <input type="text" value={data.modelName} onChange={(e) => { setData({ ...data, modelName: e.target.value }); clearError?.('modelName'); }} placeholder="VIP 560" className={`form-input ${errors.modelName ? 'form-input-error pr-10' : ''}`} />
              {errors.modelName && <ErrorIcon />}
            </div>
          </FormRow>
          <FormRow label="차종">
            <FormSelect value={data.vehicleType} onChange={(e) => setData({ ...data, vehicleType: e.target.value })}>
              <option value="소형 특수">소형 특수</option>
              <option value="중형 특수">중형 특수</option>
              <option value="중형 승합">중형 승합</option>
              <option value="대형 승합">대형 승합</option>
              <option value="소형 화물">소형 화물</option>
            </FormSelect>
          </FormRow>
        </div>
        <FormRow label="연식" hint="월 입력 시 '제작연월'로 표시">
          <YearMonthInput value={data.year} onChange={(v) => setData({ ...data, year: v })} />
        </FormRow>
        <FormRow label="최초등록일">
          <YearMonthInput value={data.firstReg} onChange={(v) => setData({ ...data, firstReg: v })} />
        </FormRow>
        <div className="mb-3">
          <label className="flex w-fit cursor-pointer items-center gap-3 py-1">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={data.hasStructureMod}
                onChange={(e) => setData({ ...data, hasStructureMod: e.target.checked, structureModDate: e.target.checked ? data.structureModDate : '' })}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md bg-gradient-to-b from-white to-gray-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] transition-all duration-200 checked:from-accent-500 checked:to-accent-600 hover:from-gray-50 hover:to-gray-100 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] checked:hover:from-accent-400 checked:hover:to-accent-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-0 dark:from-[#2a2f3a] dark:to-[#262a33] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] dark:checked:from-accent-400 dark:checked:to-accent-500 dark:hover:from-[#2e3340] dark:hover:to-[#282d36] dark:hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] dark:checked:hover:from-accent-300 dark:checked:hover:to-accent-400"
              />
              <svg viewBox="0 0 12 12" className="pointer-events-none absolute size-3 scale-0 text-white opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100">
                <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-6" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">구조변경</span>
          </label>
          {data.hasStructureMod && (
            <YearMonthInput
              value={data.structureModDate}
              onChange={(v) => setData({ ...data, structureModDate: v })}
              className="mt-2"
            />
          )}
        </div>
        <FormRow label="취침인원">
          <div className="flex gap-2">
            <input type="text" inputMode="numeric" value={data.sleepCapacity} onChange={(e) => setData({ ...data, sleepCapacity: onlyNumbers(e.target.value) })} placeholder="4" className="form-input flex-1" />
            <FormSelect value={data.saleType} onChange={(e) => setData({ ...data, saleType: e.target.value })} className="w-24 shrink-0">
              <option value="매입">매입</option>
              <option value="위탁">위탁</option>
            </FormSelect>
          </div>
        </FormRow>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="차고지 증명">
            <FormSelect value={data.garageProof} onChange={(e) => setData({ ...data, garageProof: e.target.value })}>
              <option value="불필요">불필요</option>
              <option value="필요(도와드릴게요)">필요(도와드릴게요)</option>
            </FormSelect>
          </FormRow>
          <FormRow label="현금 영수증">
            <FormSelect value={data.cashReceipt} onChange={(e) => setData({ ...data, cashReceipt: e.target.value })}>
              <option value="가능">가능</option>
              <option value="불가능">불가능</option>
            </FormSelect>
          </FormRow>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <FormRow label="외부 길이">
          <InputWithUnit unit="mm" type="text" inputMode="numeric" value={data.extLength} onChange={(e) => setData({ ...data, extLength: onlyNumbers(e.target.value) })} placeholder="7315" />
        </FormRow>
        <FormRow label="내부 길이">
          <InputWithUnit unit="mm" type="text" inputMode="numeric" value={data.intLength} onChange={(e) => setData({ ...data, intLength: onlyNumbers(e.target.value) })} placeholder="5660" />
        </FormRow>
        <FormRow label="외부 높이">
          <InputWithUnit unit="mm" type="text" inputMode="numeric" value={data.extHeight} onChange={(e) => setData({ ...data, extHeight: onlyNumbers(e.target.value) })} placeholder="2650" />
        </FormRow>
        <FormRow label="내부 높이">
          <InputWithUnit unit="mm" type="text" inputMode="numeric" value={data.intHeight} onChange={(e) => setData({ ...data, intHeight: onlyNumbers(e.target.value) })} placeholder="1955" />
        </FormRow>
        <FormRow label="외부 너비">
          <InputWithUnit unit="mm" type="text" inputMode="numeric" value={data.extWidth} onChange={(e) => setData({ ...data, extWidth: onlyNumbers(e.target.value) })} placeholder="2320" />
        </FormRow>
        <FormRow label="내부 너비">
          <InputWithUnit unit="mm" type="text" inputMode="numeric" value={data.intWidth} onChange={(e) => setData({ ...data, intWidth: onlyNumbers(e.target.value) })} placeholder="없으면 비워두세요" />
        </FormRow>
        <div className="grid grid-cols-2 gap-3">
          <FormRow label="공차 중량">
            <InputWithUnit unit="kg" type="text" inputMode="numeric" value={data.curbWeight} onChange={(e) => setData({ ...data, curbWeight: onlyNumbers(e.target.value) })} placeholder="1450" />
          </FormRow>
          <FormRow label="최대 허용 중량">
            <InputWithUnit unit="kg" type="text" inputMode="numeric" value={data.maxWeight} onChange={(e) => setData({ ...data, maxWeight: onlyNumbers(e.target.value) })} placeholder="1800" />
          </FormRow>
        </div>
      </>
    );
  }

  return (
    <>
      <FormRow label="배터리">
        <div className="flex gap-2">
          <InputWithUnit unit="Ah" type="text" value={data.batteryCapacity} onChange={(e) => setData({ ...data, batteryCapacity: e.target.value })} placeholder="200" className="min-w-0 flex-1" />
          <FormSelect value={data.batteryType} onChange={(e) => setData({ ...data, batteryType: e.target.value })} className="w-28 shrink-0">
            <option value="인산철">인산철</option>
            <option value="딥싸이클">딥싸이클</option>
          </FormSelect>
        </div>
      </FormRow>
      <FormRow label="태양광">
        <InputWithUnit unit="W" type="text" value={data.solar} onChange={(e) => setData({ ...data, solar: e.target.value })} placeholder="200" />
      </FormRow>
      <FormRow label="인버터">
        <InputWithUnit unit="Kw" type="text" value={data.inverter} onChange={(e) => setData({ ...data, inverter: onlyDecimalPlus(e.target.value) })} placeholder="3" />
      </FormRow>
      <FormRow label="외관" hint="스페이스 2번으로 구분">
        <textarea value={data.exterior} onChange={(e) => setData({ ...data, exterior: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="내장">
        <textarea value={data.interior} onChange={(e) => setData({ ...data, interior: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
      <FormRow label="편의">
        <textarea value={data.convenience} onChange={(e) => setData({ ...data, convenience: e.target.value })} className="form-input min-h-[70px] resize-y" />
      </FormRow>
    </>
  );
}
