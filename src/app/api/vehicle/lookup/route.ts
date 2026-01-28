import { NextRequest, NextResponse } from 'next/server';
import type { Car365Response, VehicleLookupResult } from '@/lib/car365/types';

const PROXY_URL = process.env.PROXY_URL || 'http://168.107.3.116:3000';
const PROXY_SECRET = process.env.PROXY_SECRET || '';

function mapFuel(useFuelNm: string | null): string {
  if (!useFuelNm) return '경유';
  if (useFuelNm.includes('경유') || useFuelNm.includes('디젤')) return '경유';
  if (useFuelNm.includes('휘발유') || useFuelNm.includes('가솔린')) return '휘발유';
  if (useFuelNm.includes('LPG') || useFuelNm.includes('가스')) return 'LPG';
  return '경유';
}

function mapTransmission(tranKndNm: string | null): string {
  if (!tranKndNm) return '자동';
  if (tranKndNm.includes('수동') || tranKndNm.includes('MT')) return '수동';
  return '자동';
}

function mapVehicleType(
  carmdlAsortNm: string | null,
  carmdlClsfNm: string | null,
): string {
  const asort = carmdlAsortNm || '';
  const clsf = carmdlClsfNm || '';

  if (asort.includes('특수')) {
    if (clsf.includes('소형')) return '소형 특수';
    if (clsf.includes('중형')) return '중형 특수';
    return '소형 특수';
  }
  if (asort.includes('승합')) {
    if (clsf.includes('대형')) return '대형 승합';
    if (clsf.includes('중형')) return '중형 승합';
    return '중형 승합';
  }
  if (asort.includes('승용')) {
    if (clsf.includes('대형')) return '대형 승용';
    return '대형 승용';
  }
  if (asort.includes('화물')) return '소형 화물';
  return '소형 특수';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr || dateStr.length < 6) return '';
  return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}`;
}

function transformToFormData(vehicleNumber: string, response: Car365Response): VehicleLookupResult {
  const { carBscInfo, spcfInfo1, spcfInfo2 } = response;

  return {
    vehicleNumber,
    baseVehicle: carBscInfo?.atmbNm || '',
    manufacturer: carBscInfo?.fbctnBzentyNm?.replace(/\(주\)|\(주\)/g, '').trim() || '',
    year: carBscInfo?.yridnw || '',
    firstReg: formatDate(carBscInfo?.frstRegYmd),
    mileage: carBscInfo?.drvngDstnc || '',
    length: spcfInfo1?.cbdLt || '',
    width: spcfInfo1?.cbdBt || '',
    height: spcfInfo1?.cbdHg || '',
    displacement: spcfInfo2?.mtrsTotlDsplvl || '',
    fuelEconomy: spcfInfo2?.fuelCnsmprt || '',
    seatCapacity: spcfInfo1?.rdcpctCnt || '',
    fuel: mapFuel(carBscInfo?.useFuelNm),
    transmission: mapTransmission(spcfInfo2?.tranKndNm),
    vehicleType: mapVehicleType(carBscInfo?.carmdlAsortNm, carBscInfo?.carmdlClsfNm),
    raw: response,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { vehicleNumber } = await request.json();

    if (!vehicleNumber) {
      return NextResponse.json({ error: '차량번호를 입력해주세요.' }, { status: 400 });
    }

    // 프록시에서 암호화/복호화 모두 처리
    const proxyResponse = await fetch(`${PROXY_URL}/api/car365/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-key': PROXY_SECRET,
      },
      body: JSON.stringify({ vehicleNumber }),
    });

    if (!proxyResponse.ok) {
      const errorData = await proxyResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || `조회 실패: ${proxyResponse.status}` },
        { status: proxyResponse.status }
      );
    }

    const responseData = await proxyResponse.json();
    const result = responseData.data?.[0] as Car365Response;

    if (!result) {
      return NextResponse.json({ error: '응답 데이터가 없습니다.' }, { status: 404 });
    }

    if (result.rsltCd === 'F') {
      return NextResponse.json({ error: result.rsltMsg || '조회 실패' }, { status: 400 });
    }

    if (!result.carBscInfo?.atmbNm && !result.carBscInfo?.fbctnBzentyNm) {
      return NextResponse.json({ error: '차량 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data: transformToFormData(vehicleNumber, result) });
  } catch (error) {
    console.error('차량 조회 오류:', error);
    return NextResponse.json(
      { error: `차량 조회 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}
