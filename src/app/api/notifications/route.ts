import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

// GET: 알림 목록 조회 (사용자별 상태 적용)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const userEmail = session.user.email;

  // Rate Limit 체크
  const result = rateLimit(userEmail, { limit: 60, windowMs: 60000 });
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

    // 알림 + 사용자별 상태 조인 조회
    // LEFT JOIN으로 status가 없는 알림도 포함
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        notification_user_status!left (
          is_read,
          is_hidden
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // 숨긴 알림 고려하여 더 많이 가져옴

    if (error) {
      console.error('[API/notifications] Supabase error:', error);
      return NextResponse.json({ error: '알림 조회 실패' }, { status: 500 });
    }

    // 사용자별 상태 필터링 및 매핑
    const filteredNotifications = (notifications || [])
      .map((n) => {
        // 해당 사용자의 상태 찾기
        const userStatus = Array.isArray(n.notification_user_status)
          ? n.notification_user_status.find(
              (s: { user_email?: string }) => s.user_email === userEmail
            )
          : n.notification_user_status?.user_email === userEmail
            ? n.notification_user_status
            : null;

        return {
          ...n,
          // 사용자별 상태가 있으면 사용, 없으면 기본값
          is_read: userStatus?.is_read ?? false,
          is_hidden: userStatus?.is_hidden ?? false,
          notification_user_status: undefined, // 응답에서 제거
        };
      })
      .filter((n) => !n.is_hidden) // 숨긴 알림 제외
      .filter((n) => !unreadOnly || !n.is_read) // unreadOnly 필터
      .slice(0, limit); // 최종 limit 적용

    // 읽지 않은 알림 수 계산
    const unreadCount = filteredNotifications.filter((n) => !n.is_read).length;

    // 더 정확한 unread count를 위해 전체 조회
    const { data: allNotifications } = await supabase
      .from('notifications')
      .select(`
        id,
        notification_user_status!left (
          is_read,
          is_hidden,
          user_email
        )
      `);

    const totalUnreadCount = (allNotifications || []).filter((n) => {
      const userStatus = Array.isArray(n.notification_user_status)
        ? n.notification_user_status.find(
            (s: { user_email?: string }) => s.user_email === userEmail
          )
        : null;

      const isHidden = userStatus?.is_hidden ?? false;
      const isRead = userStatus?.is_read ?? false;

      return !isHidden && !isRead;
    }).length;

    return NextResponse.json({
      data: filteredNotifications,
      unreadCount: totalUnreadCount
    });
  } catch (err) {
    console.error('[API/notifications] Unexpected error:', err);
    return NextResponse.json({ error: '알림 조회 중 오류' }, { status: 500 });
  }
}

// PATCH: 알림 읽음 처리 (사용자별)
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const userEmail = session.user.email;

  try {
    const body = await request.json();
    const { id, markAllRead } = body;

    const supabase = getSupabaseAdmin();

    if (markAllRead) {
      // 모든 알림에 대해 사용자별 읽음 상태 upsert
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('id');

      if (allNotifications && allNotifications.length > 0) {
        const statusRecords = allNotifications.map((n) => ({
          notification_id: n.id,
          user_email: userEmail,
          is_read: true,
          is_hidden: false,
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('notification_user_status')
          .upsert(statusRecords, {
            onConflict: 'notification_id,user_email',
          });

        if (error) throw error;
      }

      return NextResponse.json({ success: true });
    }

    if (id) {
      // 특정 알림 읽음 처리
      const { error } = await supabase
        .from('notification_user_status')
        .upsert(
          {
            notification_id: id,
            user_email: userEmail,
            is_read: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'notification_id,user_email' }
        );

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  } catch (err) {
    console.error('[API/notifications] PATCH error:', err);
    return NextResponse.json({ error: '알림 업데이트 실패' }, { status: 500 });
  }
}

// DELETE: 알림 숨김 처리 (사용자별 - 실제 삭제 안 함)
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const userEmail = session.user.email;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const deleteAll = searchParams.get('deleteAll') === 'true';

  try {
    const supabase = getSupabaseAdmin();

    if (deleteAll) {
      // 모든 알림에 대해 사용자별 숨김 상태 설정
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('id');

      if (allNotifications && allNotifications.length > 0) {
        const statusRecords = allNotifications.map((n) => ({
          notification_id: n.id,
          user_email: userEmail,
          is_read: true,
          is_hidden: true,
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('notification_user_status')
          .upsert(statusRecords, {
            onConflict: 'notification_id,user_email',
          });

        if (error) throw error;
      }

      return NextResponse.json({ success: true });
    }

    if (id) {
      // 특정 알림 숨김 처리
      const { error } = await supabase
        .from('notification_user_status')
        .upsert(
          {
            notification_id: parseInt(id),
            user_email: userEmail,
            is_read: true,
            is_hidden: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'notification_id,user_email' }
        );

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 });
  } catch (err) {
    console.error('[API/notifications] DELETE error:', err);
    return NextResponse.json({ error: '알림 삭제 실패' }, { status: 500 });
  }
}
