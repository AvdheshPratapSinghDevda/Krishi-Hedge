import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key || url.includes('demo') || key.includes('demo')) {
    console.warn('[Supabase Client] Not configured. Please set up Supabase credentials.');
    // Return a dummy client that won't work but won't crash the app
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
    );
  }
  
  return createBrowserClient(url, key);
}
