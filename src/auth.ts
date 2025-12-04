import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// 환경변수에서 허용된 이메일 목록 로드 (쉼표로 구분)
const ALLOWED_EMAILS: string[] = process.env.ALLOWED_EMAILS
  ? process.env.ALLOWED_EMAILS.split(',').map((email) => email.trim())
  : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  callbacks: {
    async signIn({ user }) {
      // ALLOWED_EMAILS가 비어있으면 모든 Google 계정 허용
      if (ALLOWED_EMAILS.length === 0) return true;
      // 특정 이메일만 허용
      return ALLOWED_EMAILS.includes(user.email || '');
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
