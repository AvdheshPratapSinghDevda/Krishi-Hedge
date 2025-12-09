import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { devOtpService } from './dev-otp-service';

export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'admin';

const IS_DEV_MODE = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_DEV_OTP === 'true';

export interface AuthProfile {
  id: string;
  user_type: UserRole;
  email?: string;
  phone?: string;
  full_name: string;
  email_verified: boolean;
  phone_verified: boolean;
  kyc_verified: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface SignupData {
  user_type: UserRole;
  full_name: string;
  email?: string;
  phone?: string;
  password?: string;
  // Role-specific fields
  [key: string]: any;
}

class AuthService {
  private supabase = createClient();

  /**
   * Sign up with phone (OTP) - for farmers and buyers
   */
  async signUpWithPhone(phone: string, userData: SignupData): Promise<{ error?: string; user?: User }> {
    try {
      // DEV MODE: Use temporary OTP system (no SMS)
      if (IS_DEV_MODE) {
        console.log('📱 DEV MODE: Bypassing Supabase phone signup');
        
        // Just return success - we'll create profile later
        return { user: { id: `dev_temp_${Date.now()}`, phone } as User };
      }

      // PRODUCTION: Use real Supabase phone auth
      const { data, error } = await this.supabase.auth.signInWithOtp({
        phone,
        options: {
          data: {
            ...userData,
          },
        },
      });

      if (error) throw error;

      return { user: data.user || undefined };
    } catch (error: any) {
      console.error('[Auth] Phone signup error:', error);
      return { error: error.message || 'Failed to sign up with phone' };
    }
  }

  /**
   * Sign up with email/password - for FPOs and admins
   */
  async signUpWithEmail(email: string, password: string, userData: SignupData): Promise<{ error?: string; user?: User }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
          },
        },
      });

      if (error) throw error;

      return { user: data.user || undefined };
    } catch (error: any) {
      console.error('[Auth] Email signup error:', error);
      return { error: error.message || 'Failed to sign up with email' };
    }
  }

  /**
   * Sign in with phone (OTP)
   */
  async signInWithPhone(phone: string): Promise<{ error?: string; otpSent?: boolean }> {
    try {
      // DEV MODE: Use temporary OTP (shows in console/alert)
      if (IS_DEV_MODE) {
        console.log('📱 DEV MODE: Sending fake OTP');
        const result = devOtpService.sendOtp(phone);
        return { otpSent: result.success };
      }

      // PRODUCTION: Use real Supabase phone auth
      const { error } = await this.supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;

      return { otpSent: true };
    } catch (error: any) {
      console.error('[Auth] Phone signin error:', error);
      return { error: error.message || 'Failed to send OTP' };
    }
  }

  /**
   * Verify phone OTP
   */
  async verifyOtp(phone: string, otp: string): Promise<{ error?: string; user?: User }> {
    try {
      // DEV MODE: Accept any 6-digit code, create temp session
      if (IS_DEV_MODE) {
        console.log('🔐 DEV MODE: Verifying fake OTP');
        const result = devOtpService.verifyOtp(phone, otp);
        
        if (!result.success) {
          return { error: result.error };
        }

        // Get stored role from localStorage
        const role = (typeof window !== 'undefined' ? localStorage.getItem('kh_role') : null) || 'farmer';
        
        // Create temp session
        const session = devOtpService.createTempSession(phone, role);
        
        // Return mock user
        return { 
          user: { 
            id: session.userId, 
            phone,
            email: '',
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: { user_type: role }
          } as User 
        };
      }

      // PRODUCTION: Use real Supabase OTP verification
      const { data, error } = await this.supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Update last login
      if (data.user) {
        await this.updateLastLogin(data.user.id);
      }

      return { user: data.user || undefined };
    } catch (error: any) {
      console.error('[Auth] OTP verification error:', error);
      return { error: error.message || 'Invalid OTP' };
    }
  }

  /**
   * Sign in with email/password
   */
  async signInWithEmail(email: string, password: string): Promise<{ error?: string; user?: User }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last login
      if (data.user) {
        await this.updateLastLogin(data.user.id);
      }

      return { user: data.user || undefined };
    } catch (error: any) {
      console.error('[Auth] Email signin error:', error);
      return { error: error.message || 'Invalid credentials' };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error?: string }> {
    try {
      // DEV MODE: Clear temp session
      if (IS_DEV_MODE) {
        devOtpService.clearTempSession();
        return {};
      }

      // PRODUCTION: Use real Supabase signout
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kh_user_id');
        localStorage.removeItem('kh_user_type');
        localStorage.removeItem('kh_profile');
        localStorage.removeItem('kh_phone');
        localStorage.removeItem('kh_role');
      }

      return {};
    } catch (error: any) {
      console.error('[Auth] Signout error:', error);
      return { error: error.message || 'Failed to sign out' };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: User | null; profile: AuthProfile | null }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        return { user: null, profile: null };
      }

      const profile = await this.getProfile(user.id);

      return { user, profile };
    } catch (error) {
      console.error('[Auth] Get current user error:', error);
      return { user: null, profile: null };
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<AuthProfile | null> {
    try {
      // DEV MODE: Return mock profile
      if (IS_DEV_MODE && userId.startsWith('dev_')) {
        const session = devOtpService.getTempSession();
        if (session) {
          return {
            id: session.userId,
            user_type: session.role as UserRole,
            phone: session.phone,
            full_name: 'Dev User',
            email_verified: false,
            phone_verified: true,
            kyc_verified: false,
            onboarded: false, // Set to false to force onboarding flow
            created_at: new Date(session.createdAt).toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return null;
      }

      // PRODUCTION: Get real profile from Supabase
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data as AuthProfile;
    } catch (error) {
      console.error('[Auth] Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<AuthProfile>): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      return {};
    } catch (error: any) {
      console.error('[Auth] Update profile error:', error);
      return { error: error.message || 'Failed to update profile' };
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('[Auth] Update last login error:', error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return {};
    } catch (error: any) {
      console.error('[Auth] Reset password error:', error);
      return { error: error.message || 'Failed to send reset email' };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {};
    } catch (error: any) {
      console.error('[Auth] Update password error:', error);
      return { error: error.message || 'Failed to update password' };
    }
  }
}

export const authService = new AuthService();
