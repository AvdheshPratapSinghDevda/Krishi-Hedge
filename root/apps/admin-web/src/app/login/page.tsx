'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, Check, Eye, EyeOff, Mail, ArrowRight, Loader2 } from 'lucide-react';

const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "••••••••" 
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#00875A] focus:ring-4 focus:ring-emerald-500/10 text-slate-700 transition-all"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'admin' | 'fpo'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('admin_user_change'));
      
      // Small delay to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to dashboard
      window.location.href = '/';
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans text-slate-800">
      {/* Brand Header */}
      <div className="text-center mb-8 animate-fade-in-down">
        <div className="bg-[#00875A] text-white font-bold text-2xl w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          KH
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Krishi Hedge Admin</h1>
        <p className="text-slate-500 text-sm">Platform for forward contract management</p>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden p-8">
        
        {/* Dynamic Title */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-700">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Please enter your details to sign in</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="animate-fade-in">
          <form onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('admin')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    userType === 'admin'
                      ? 'border-[#00875A] bg-emerald-50 text-[#00875A] font-bold shadow-sm'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <User size={18} />
                  <span className="text-sm">Admin</span>
                  {userType === 'admin' && <Check size={16} className="ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('fpo')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    userType === 'fpo'
                      ? 'border-[#00875A] bg-emerald-50 text-[#00875A] font-bold shadow-sm'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 size={18} />
                  <span className="text-sm">FPO Profile</span>
                  {userType === 'fpo' && <Check size={16} className="ml-1" />}
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#00875A] focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="name@krishihedge.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <PasswordInput value={password} onChange={setPassword} />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-8 mt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00875A] focus:ring-[#00875A]" />
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-[#00875A] hover:text-emerald-700 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00875A] hover:bg-[#006C48] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/signup"
                className="text-[#00875A] font-bold hover:underline focus:outline-none"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-slate-400 text-xs text-center">
        &copy; 2024 Krishi Hedge. All rights reserved.
      </div>
    </div>
  );
}
