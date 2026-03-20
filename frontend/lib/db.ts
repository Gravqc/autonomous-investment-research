import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(`Missing NEXT_PUBLIC_SUPABASE_URL. Current value: "${supabaseUrl}"`);
}

if (!supabaseServiceKey) {
  throw new Error(`Missing SUPABASE_SERVICE_ROLE_KEY. Current value: "${supabaseServiceKey}"`);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
