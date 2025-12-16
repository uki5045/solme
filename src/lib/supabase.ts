import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface VehicleSpec {
  id?: number;
  vehicle_number: string;
  vehicle_type: 'camper' | 'caravan';
  data: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

// 알림 타입 정의
export type NotificationType = 'vehicle_created' | 'vehicle_updated' | 'status_changed';

export interface Notification {
  id?: number;
  type: NotificationType;
  vehicle_number: string;
  vehicle_type: 'camper' | 'caravan';
  message: string;
  details?: {
    changed_fields?: string[];
    old_status?: string;
    new_status?: string;
  };
  is_read: boolean;
  created_at?: string;
  user_name?: string;
  user_image?: string;
}
