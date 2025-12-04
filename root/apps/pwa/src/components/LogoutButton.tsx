'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'button' | 'icon' | 'text';
}

export default function LogoutButton({ className = '', variant = 'button' }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Clear localStorage
      localStorage.removeItem('kh_user_id');
      localStorage.removeItem('kh_user_type');
      
      // Redirect to login
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ${className}`}
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 ${className}`}
      >
        <LogOut size={18} />
        <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 ${className}`}
    >
      <LogOut size={18} />
      <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
}
