import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// 상태 변경 스키마
const statusUpdateSchema = z.object({
  vehicleNumber: z.string().min(1, '차량번호는 필수입니다'),
  status: z.enum(['intake', 'productization', 'advertising'], {
    message: '상태는 intake, productization, advertising 중 하나여야 합니다',
  }),
});

// PATCH: 상태 변경
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Rate Limit 체크
  const result = rateLimit(session.user.email, { limit: 30, windowMs: 60000 });
  if (!result.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // 입력값 검증
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || '잘못된 입력입니다.' },
        { status: 400 }
      );
    }

    const { vehicleNumber, status } = validation.data;

    const supabase = getSupabaseAdmin();

    // 존재 여부 확인
    const { data: existing } = await supabase
      .from('vehicle_specs')
      .select('id')
      .eq('vehicle_number', vehicleNumber)
      .single();

    if (!existing) {
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 상태 업데이트
    const { error } = await supabase
      .from('vehicle_specs')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('vehicle_number', vehicleNumber);

    if (error) {
      console.error('[API/specs/status] Supabase update error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `상태 변경 실패: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('[API/specs/status] Unexpected error:', err);
    return NextResponse.json({ error: '상태 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
