import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session;
  const isSpecPage = request.nextUrl.pathname.startsWith('/spec');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // /spec 페이지는 인증 필요
  if (isSpecPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // 로그인 상태에서 auth 페이지 접근 시 /spec으로 리다이렉트
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/spec', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/spec/:path*', '/auth/:path*'],
};
