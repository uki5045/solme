// 간단한 In-Memory Rate Limiter (Vercel Serverless용)
// 프로덕션에서는 Redis 기반 rate limiting 권장

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// 주기적 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // 1분마다 정리

export interface RateLimitConfig {
  limit: number; // 최대 요청 수
  windowMs: number; // 시간 창 (밀리초)
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 30, windowMs: 60000 }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // 새 윈도우 시작
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { success: true, remaining: config.limit - 1, resetTime: now + config.windowMs };
  }

  if (entry.count >= config.limit) {
    // 제한 초과
    return { success: false, remaining: 0, resetTime: entry.resetTime };
  }

  // 카운트 증가
  entry.count++;
  return { success: true, remaining: config.limit - entry.count, resetTime: entry.resetTime };
}
