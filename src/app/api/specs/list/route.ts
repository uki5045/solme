import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

// GET: 전체 차량 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Rate Limit 체크
  const result = rateLimit(session.user.email, { limit: 60, windowMs: 60000 });
  if (!result.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // 타입 검증
  if (type && type !== 'camper' && type !== 'caravan') {
    return NextResponse.json({ error: '잘못된 차량 타입입니다.' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('vehicle_specs')
      .select('id, vehicle_number, vehicle_type, data, updated_at')
      .order('updated_at', { ascending: false });

    if (type === 'camper' || type === 'caravan') {
      query = query.eq('vehicle_type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 카드에 표시할 정보만 추출
    const list = (data || []).map((item) => ({
      id: item.id,
      vehicleNumber: item.vehicle_number,
      vehicleType: item.vehicle_type,
      modelName: item.data?.modelName || '',
      manufacturer: item.data?.manufacturer || '',
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({ data: list });
  } catch {
    return NextResponse.json({ error: '목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
