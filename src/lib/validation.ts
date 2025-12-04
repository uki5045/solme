import { z } from 'zod';

// 차량번호 패턴 (한국 차량번호: 12가1234 또는 123가4567)
const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/;

// 차량 데이터 스키마
export const vehicleDataSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, '차량번호는 필수입니다')
    .max(20, '차량번호가 너무 깁니다')
    .refine(
      (val) => vehicleNumberRegex.test(val.replace(/\s/g, '')),
      '올바른 차량번호 형식이 아닙니다 (예: 12가1234, 123가4567)'
    ),
  vehicleType: z.enum(['camper', 'caravan'], {
    message: '차량 타입은 camper 또는 caravan이어야 합니다',
  }),
  data: z
    .record(z.string(), z.unknown())
    .refine(
      (d) => JSON.stringify(d).length < 100000,
      '데이터 크기가 너무 큽니다 (100KB 제한)'
    ),
});

export type VehicleDataInput = z.infer<typeof vehicleDataSchema>;

// 검색 쿼리 스키마
export const searchQuerySchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, '차량번호는 필수입니다')
    .max(20, '차량번호가 너무 깁니다'),
});

// 차량 타입 필터 스키마
export const typeFilterSchema = z.object({
  type: z.enum(['camper', 'caravan']).nullable().optional(),
});
