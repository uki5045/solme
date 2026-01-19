import { NextRequest, NextResponse } from 'next/server';

const PROXY_URL = 'http://168.107.3.116:3000';

export async function GET(request: NextRequest) {
  const carNumber = request.nextUrl.searchParams.get('carNumber');

  if (!carNumber) {
    return NextResponse.json({ error: '차량번호를 입력해주세요' }, { status: 400 });
  }

  const proxySecret = process.env.PROXY_SECRET;
  if (!proxySecret) {
    console.error('PROXY_SECRET not configured');
    return NextResponse.json({ error: '서버 설정 오류입니다' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${PROXY_URL}/api/car-info?carNumber=${encodeURIComponent(carNumber)}`,
      {
        headers: {
          'x-proxy-key': proxySecret,
        },
      }
    );

    // 프록시 인증 실패
    if (response.status === 403) {
      return NextResponse.json({ error: '인증된 사용자가 아닙니다' }, { status: 403 });
    }

    // 프록시 서버 에러
    if (response.status === 500) {
      return NextResponse.json({ error: '차량 정보 조회에 실패했습니다' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy request failed:', error);
    return NextResponse.json({ error: '서버 연결에 실패했습니다' }, { status: 500 });
  }
}
