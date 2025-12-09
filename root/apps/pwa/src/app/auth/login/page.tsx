'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '@/lib/auth/auth-service';

type Role = 'farmer' | 'buyer' | 'fpo' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as Role) || 'farmer';

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const getRoleLabel = (r: Role): string => {
    const labels = {
      farmer: 'Farmer',
      buyer: 'Buyer', 
      fpo: 'FPO Admin',
      admin: 'Administrator'
    };
    return labels[r];
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const { error, otpSent: sent } = await authService.signInWithPhone(`+91${phone}`);
      
      if (error) {
        setError(error);
      } else if (sent) {
        setOtpSent(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kh_phone', phone);
          localStorage.setItem('kh_role', role);
        }
      }
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const { error, user } = await authService.verifyOtp(`+91${phone}`, otp);
      
      if (error) {
        setError(error);
      } else if (user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kh_user_id', user.id);
        }
        
        const profile = await authService.getProfile(user.id);
        
        // For SIH farmer flow, always send farmers straight to home and skip onboarding screens.
        if (role === 'farmer') {
          router.push('/');
        } else if (profile?.onboarded) {
          const paths = {
            farmer: '/',
            buyer: '/buyer/dashboard',
            fpo: '/fpo/dashboard',
            admin: '/admin',
          } as const;
          router.push(paths[profile.user_type] || '/');
        } else {
          const onboardingPaths = {
            farmer: '/onboarding/farmer',
            buyer: '/onboarding/buyer',
            fpo: '/fpo/dashboard',
            admin: '/admin',
          } as const;
          router.push(onboardingPaths[role] || '/');
        }
      }
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Krishi Hedge
          </h1>
          <p className="text-sm text-gray-500">
            Login as {getRoleLabel(role)}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-800 text-sm flex items-start gap-2 rounded">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Phone OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">+91</span>
                <input
                  type="tel"
                  className="flex-1 px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none text-gray-900 transition"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 text-sm font-medium transition"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP sent to +91{phone}
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 outline-none text-center text-2xl font-semibold tracking-wider transition"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); }}
                className="text-xs text-gray-500 hover:text-gray-900 mt-2"
              >
                Change number
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 text-sm font-medium transition"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify & Login'
              )}
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full text-sm text-gray-500 hover:text-gray-900 py-2"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Signup Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push(`/auth/signup?role=${role}`)}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Don't have an account? <span className="font-medium">Sign up</span>
          </button>
        </div>

        {/* Back to role selection */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/splash')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← Choose different role
          </button>
        </div>
      </div>
    </div>
  );
}
