'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const PUBLIC_ROUTES = [
  '/', // allow root to decide between language screen, splash, and home
  '/language',
  '/splash',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  // OTP flows (unified login + legacy buyer routes still accessible if needed)
  '/auth/otp',
  '/auth/buyer/otp',
  '/auth/buyer/login',
  '/auth/buyer-login',
  // FPO admin login & dashboard are handled via localStorage fpo_id
  '/auth/fpo',
  '/fpo',
];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Store user ID if session exists
      if (session?.user) {
        localStorage.setItem('kh_user_id', session.user.id);
      }
      
      setLoading(false);

      // Only redirect to login if no session AND on a protected route
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
      const hasLocalUser = typeof window !== 'undefined' && !!localStorage.getItem('kh_user_id');
      
      // Don't redirect if we have a Supabase session OR an OTP/localStorage session
      if (!session && !hasLocalUser && !isPublicRoute) {
        router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname || '/')}`);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Store user ID on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        localStorage.setItem('kh_user_id', session.user.id);
      }
      
      // Clear data on sign out
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('kh_user_id');
        localStorage.removeItem('kh_user_type');
        localStorage.removeItem('kh_profile');
        localStorage.removeItem('kh_phone');
        localStorage.removeItem('kh_role');
      }
      
      // Only redirect if no session/local user and not on public routes
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
      const hasLocalUser = typeof window !== 'undefined' && !!localStorage.getItem('kh_user_id');
      if (!session && !hasLocalUser && !isPublicRoute) {
        router.push('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
