import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { vehicleDataSchema, searchQuerySchema } from '@/lib/validation';

// 인증 확인 헬퍼
async function checkAuth() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  return session;
}

// Rate Limit 체크 헬퍼
function checkRateLimit(email: string) {
  const result = rateLimit(email, { limit: 30, windowMs: 60000 }); // 분당 30회
  if (!result.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
        }
      }
    );
  }
  return null;
}

// GET: 차량번호로 검색
export async function GET(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Rate Limit 체크
  const rateLimitError = checkRateLimit(session.user?.email || 'anonymous');
  if (rateLimitError) return rateLimitError;

  const { searchParams } = new URL(request.url);
  const vehicleNumber = searchParams.get('vehicleNumber');

  // 입력값 검증
  const validation = searchQuerySchema.safeParse({ vehicleNumber });
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0]?.message || '잘못된 입력입니다.' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('vehicle_specs')
      .select('*')
      .eq('vehicle_number', vehicleNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 저장 (upsert)
export async function POST(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Rate Limit 체크
  const rateLimitError = checkRateLimit(session.user?.email || 'anonymous');
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();

    // 입력값 검증
    const validation = vehicleDataSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || '잘못된 입력입니다.' },
        { status: 400 }
      );
    }

    const { vehicleNumber, vehicleType, data } = validation.data;

    const supabase = getSupabaseAdmin();

    // 기존 데이터 확인
    const { data: existing } = await supabase
      .from('vehicle_specs')
      .select('id')
      .eq('vehicle_number', vehicleNumber)
      .single();

    let error;

    if (existing) {
      // 업데이트
      const result = await supabase
        .from('vehicle_specs')
        .update({
          vehicle_type: vehicleType,
          data: data,
          updated_at: new Date().toISOString(),
        })
        .eq('vehicle_number', vehicleNumber);
      error = result.error;
    } else {
      // 새로 삽입
      const result = await supabase
        .from('vehicle_specs')
        .insert({
          vehicle_number: vehicleNumber,
          vehicle_type: vehicleType,
          data: data,
          updated_at: new Date().toISOString(),
        });
      error = result.error;
    }

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[API/specs] Supabase error:', JSON.stringify(error, null, 2));
      }
      return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API/specs] Unexpected error:', err);
    }
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 삭제
export async function DELETE(request: NextRequest) {
  const session = await checkAuth();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Rate Limit 체크
  const rateLimitError = checkRateLimit(session.user?.email || 'anonymous');
  if (rateLimitError) return rateLimitError;

  const { searchParams } = new URL(request.url);
  const vehicleNumber = searchParams.get('vehicleNumber');

  // 입력값 검증
  const validation = searchQuerySchema.safeParse({ vehicleNumber });
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0]?.message || '잘못된 입력입니다.' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // 먼저 존재 여부 확인
    const { data: existing } = await supabase
      .from('vehicle_specs')
      .select('id')
      .eq('vehicle_number', vehicleNumber)
      .single();

    if (!existing) {
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
    }

    const { error } = await supabase
      .from('vehicle_specs')
      .delete()
      .eq('vehicle_number', vehicleNumber);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
