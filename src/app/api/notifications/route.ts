import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

// GET: 알림 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Rate Limit 체크
  const result = rateLimit(session.user.email, { limit: 60, windowMs: 60000 });
  if (!result.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API/notifications] Supabase error:', error);
      return NextResponse.json({ error: '알림 조회 실패' }, { status: 500 });
    }

    // 읽지 않은 알림 수
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return NextResponse.json({
      data: data || [],
      unreadCount: unreadCount || 0
    });
  } catch (err) {
    console.error('[API/notifications] Unexpected error:', err);
    return NextResponse.json({ error: '알림 조회 중 오류' }, { status: 500 });
  }
}

// PATCH: 알림 읽음 처리
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, markAllRead } = body;

    const supabase = getSupabaseAdmin();

    if (markAllRead) {
      // 모든 알림 읽음 처리
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (id) {
      // 특정 알림 읽음 처리
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  } catch (err) {
    console.error('[API/notifications] PATCH error:', err);
    return NextResponse.json({ error: '알림 업데이트 실패' }, { status: 500 });
  }
}

// DELETE: 알림 삭제
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const deleteAll = searchParams.get('deleteAll') === 'true';

  try {
    const supabase = getSupabaseAdmin();

    if (deleteAll) {
      // 모든 알림 삭제
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', 0); // 모든 행 삭제

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (id) {
      // 특정 알림 삭제
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  } catch (err) {
    console.error('[API/notifications] DELETE error:', err);
    return NextResponse.json({ error: '알림 삭제 실패' }, { status: 500 });
  }
}
