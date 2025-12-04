import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes('demo') || serviceKey.includes('demo')) {
    console.warn('[supabaseServer] Supabase credentials not configured. Please set up Supabase to enable full functionality.');
    throw new Error("Supabase not configured. Please add your Supabase URL and keys to .env.local file. See SETUP_GUIDE.md for instructions.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

