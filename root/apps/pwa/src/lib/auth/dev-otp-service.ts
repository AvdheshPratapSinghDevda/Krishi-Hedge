/**
 * DEV-ONLY Temporary OTP System
 * This bypasses Supabase phone auth for development (no SMS costs)
 * 
 * HOW IT WORKS:
 * 1. User enters phone number
 * 2. System generates a fake OTP (shows in console + alert)
 * 3. User can enter ANY 6-digit code to verify (we accept all)
 * 4. Creates a temporary session in localStorage
 * 
 * PRODUCTION: This file is NOT used. Real Supabase auth is used.
 */

interface TempSession {
  userId: string;
  phone: string;
  role: string;
  createdAt: number;
}

class DevOtpService {
  private STORAGE_KEY = 'dev_temp_session';
  private OTP_STORAGE_KEY = 'dev_last_otp';

  /**
   * Send fake OTP (just store it, show in console)
   */
  sendOtp(phone: string): { success: boolean; otp: string } {
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store it temporarily
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.OTP_STORAGE_KEY, JSON.stringify({
        phone,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      }));
    }

    // Show in console for dev
    console.log('🔐 DEV MODE OTP for', phone, ':', otp);
    
    // Also show alert (hacky but works for dev)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`🔐 DEV OTP for ${phone}: ${otp}\n\n(Or enter any 6-digit code)`);
      }, 100);
    }

    return { success: true, otp };
  }

  /**
   * Verify OTP (accepts ANY 6-digit code in dev mode)
   */
  verifyOtp(phone: string, otp: string): { success: boolean; error?: string } {
    if (otp.length !== 6) {
      return { success: false, error: 'OTP must be 6 digits' };
    }

    // In dev mode, accept ANY 6-digit code
    console.log('✅ DEV MODE: Accepting OTP', otp, 'for', phone);
    return { success: true };
  }

  /**
   * Create temporary session (mock Supabase user)
   */
  createTempSession(phone: string, role: string, userData?: any): TempSession {
    // Generate valid UUID v4 for compatibility with Supabase
    const userId = this.generateUUID();
    
    const session: TempSession = {
      userId,
      phone,
      role,
      createdAt: Date.now()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem('kh_user_id', userId);
      localStorage.setItem('kh_phone', phone);
      localStorage.setItem('kh_role', role);
    }

    console.log('✅ Created temp session:', session);
    return session;
  }

  /**
   * Generate valid UUID v4
   */
  private generateUUID(): string {
    // RFC4122 version 4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get current temp session
   */
  getTempSession(): TempSession | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Clear temp session (logout)
   */
  clearTempSession() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.OTP_STORAGE_KEY);
    localStorage.removeItem('kh_user_id');
    localStorage.removeItem('kh_phone');
    localStorage.removeItem('kh_role');
    console.log('🗑️ Cleared temp session');
  }

  /**
   * Check if we're in dev mode
   */
  isDevMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           process.env.NEXT_PUBLIC_USE_DEV_OTP === 'true';
  }
}

export const devOtpService = new DevOtpService();
