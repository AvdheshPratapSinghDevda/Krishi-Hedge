'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import { authService } from '@/lib/auth/auth-service';

type Role = 'farmer' | 'buyer' | 'fpo' | 'admin';

interface SignupFormData {
  fullName: string;
  phone: string;
  state?: string;
  district?: string;
  village?: string;
  pincode?: string;
  landSize?: string;
  primaryCrop?: string;
  organizationName?: string;
  buyerType?: string;
  gstNumber?: string;
  city?: string;
  fpoName?: string;
  fpoRegistrationNumber?: string;
  memberCount?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as Role) || 'farmer';

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    phone: '',
  });

  const getRoleLabel = (r: Role): string => {
    const labels = {
      farmer: 'Farmer',
      buyer: 'Buyer',
      fpo: 'FPO Admin',
      admin: 'Administrator'
    };
    return labels[r];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.phone || formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (role === 'farmer') {
      if (!formData.state || !formData.district || !formData.village) {
        setError('Please fill all location fields');
        return false;
      }
      if (!formData.pincode || formData.pincode.length !== 6) {
        setError('Please enter a valid 6-digit pincode');
        return false;
      }
    } else if (role === 'buyer') {
      if (!formData.organizationName || !formData.buyerType) {
        setError('Please fill all required fields');
        return false;
      }
    } else if (role === 'fpo') {
      if (!formData.fpoName || !formData.fpoRegistrationNumber) {
        setError('Please fill all required fields');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.signUpWithPhone(`+91${formData.phone}`, {
        user_type: role,
        full_name: formData.fullName,
        ...formData,
      });

      if (result.error) {
        setError(result.error);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kh_phone', formData.phone);
          localStorage.setItem('kh_role', role);
        }
        router.push(`/auth/login?role=${role}`);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleInputChange}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Number
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">+91</span>
          <input
            type="tel"
            name="phone"
            className="flex-1 px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
            placeholder="9876543210"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData(prev => ({ ...prev, phone: value }));
            }}
            maxLength={10}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-sm font-medium transition"
      >
        Continue
      </button>
    </div>
  );

  const renderStep2Farmer = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <select
            name="state"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none bg-white transition"
            value={formData.state || ''}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <input
            type="text"
            name="district"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
            placeholder="District"
            value={formData.district || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
        <input
          type="text"
          name="village"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="Village name"
          value={formData.village || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
          <input
            type="text"
            name="pincode"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
            placeholder="123456"
            value={formData.pincode || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setFormData(prev => ({ ...prev, pincode: value }));
            }}
            maxLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Land (acres)</label>
          <input
            type="text"
            name="landSize"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
            placeholder="10"
            value={formData.landSize || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crop</label>
        <select
          name="primaryCrop"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none bg-white transition"
          value={formData.primaryCrop || ''}
          onChange={handleInputChange}
        >
          <option value="">Select</option>
          <option value="Soybean">Soybean</option>
          <option value="Groundnut">Groundnut</option>
          <option value="Sunflower">Sunflower</option>
          <option value="Mustard">Mustard</option>
        </select>
      </div>
    </div>
  );

  const renderStep2Buyer = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
        <input
          type="text"
          name="organizationName"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="Company name"
          value={formData.organizationName || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Type</label>
        <select
          name="buyerType"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none bg-white transition"
          value={formData.buyerType || ''}
          onChange={handleInputChange}
        >
          <option value="">Select</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="retailer">Retailer</option>
          <option value="processor">Processor</option>
          <option value="exporter">Exporter</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
        <input
          type="text"
          name="gstNumber"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="22AAAAA0000A1Z5"
          value={formData.gstNumber || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            name="city"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
            placeholder="City"
            value={formData.city || ''}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <select
            name="state"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none bg-white transition"
            value={formData.state || ''}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2Fpo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">FPO Name</label>
        <input
          type="text"
          name="fpoName"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="FPO name"
          value={formData.fpoName || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
        <input
          type="text"
          name="fpoRegistrationNumber"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="Registration number"
          value={formData.fpoRegistrationNumber || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <input
            type="text"
            name="district"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
            placeholder="District"
            value={formData.district || ''}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <select
            name="state"
            className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none bg-white transition"
            value={formData.state || ''}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
        <input
          type="number"
          name="memberCount"
          className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-gray-900 outline-none transition"
          placeholder="100"
          value={formData.memberCount || ''}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-sm text-gray-500">
            Sign up as {getRoleLabel(role)}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          <div className={`h-1 flex-1 ${step >= 1 ? 'bg-gray-900' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-800 text-sm flex items-start gap-2 rounded">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          
          {step === 2 && (
            <div className="space-y-6">
              {role === 'farmer' && renderStep2Farmer()}
              {role === 'buyer' && renderStep2Buyer()}
              {role === 'fpo' && renderStep2Fpo()}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 text-sm font-medium transition"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Login Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push(`/auth/login?role=${role}`)}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Already have an account? <span className="font-medium">Login</span>
          </button>
        </div>

        {/* Back */}
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
