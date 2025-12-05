'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, Check, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';

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
        minLength={8}
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

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'admin' | 'fpo'>('admin');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password,
          name: `${firstName} ${lastName}`
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Redirect to login
      router.push('/login');
    } catch (err) {
      setError('An error occurred during signup');
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
          <h2 className="text-xl font-bold text-slate-700">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Register a new profile to get started</p>
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

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">
                  First Name
                </label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#00875A] focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="John"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">
                  Last Name
                </label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#00875A] focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="Doe"
                  required
                />
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
                Create Password
              </label>
              <PasswordInput value={password} onChange={setPassword} />
              <p className="text-xs text-slate-400 mt-2">Must be at least 8 characters</p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-[#00875A] hover:bg-[#006C48] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login"
                className="text-[#00875A] font-bold hover:underline focus:outline-none"
              >
                Sign In
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
