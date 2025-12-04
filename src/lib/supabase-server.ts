import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 서버 전용 Supabase 클라이언트 (Service Role Key 사용)
// 빌드 시점이 아닌 런타임에 생성 (lazy initialization)
let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  // Service Role Key는 RLS를 우회하므로 서버에서만 사용
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

// 타입 정의
export interface VehicleSpec {
  id?: number;
  vehicle_number: string;
  vehicle_type: 'camper' | 'caravan';
  data: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}
