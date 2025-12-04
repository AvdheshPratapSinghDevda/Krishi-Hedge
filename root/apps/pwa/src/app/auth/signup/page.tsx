'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Sprout, 
  Phone, Briefcase, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface FarmerData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  landSize: string;
  primaryCrop: string;
  farmingExperience: string;
  agreeTerms: boolean;
}

interface BusinessData {
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gstNumber: string;
  businessType: string;
  companySize: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  designation: string;
  tradingVolume: string;
  agreeTerms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'farmer' | 'business'>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [farmerData, setFarmerData] = useState<FarmerData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    village: '',
    pincode: '',
    landSize: '',
    primaryCrop: '',
    farmingExperience: '',
    agreeTerms: false
  });

  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gstNumber: '',
    businessType: '',
    companySize: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: '',
    designation: '',
    tradingVolume: '',
    agreeTerms: false
  });

  const handleFarmerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFarmerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setBusinessData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    const data = userType === 'farmer' ? farmerData : businessData;
    if (!data.email || !data.phone || !data.password || !data.confirmPassword) {
      setError('Please fill all required fields');
      return false;
    }
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (data.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep1() && currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const data = userType === 'farmer' ? farmerData : businessData;

      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            user_type: userType,
            phone: data.phone,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Check if profile already exists (in case of previous failed attempt)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      // Only create profile if it doesn't exist
      if (!existingProfile) {
        // 3. Create profile in profiles table
        if (userType === 'farmer') {
          const profileInsert = {
            id: authData.user.id,
            user_type: 'farmer',
            full_name: farmerData.fullName,
            email: farmerData.email,
            phone: farmerData.phone,
            state: farmerData.state,
            district: farmerData.district,
            village: farmerData.village,
            pincode: farmerData.pincode,
            land_size: parseFloat(farmerData.landSize) || 0,
            primary_crop: farmerData.primaryCrop,
            farming_experience: parseInt(farmerData.farmingExperience) || 0,
          };
          
          const { data: insertedProfile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileInsert)
            .select()
            .single();

          if (profileError) throw profileError;
        } else {
          const profileInsert = {
            id: authData.user.id,
            user_type: 'business',
            business_name: businessData.businessName,
            email: businessData.email,
            phone: businessData.phone,
            gst_number: businessData.gstNumber,
            business_type: businessData.businessType,
            company_size: businessData.companySize,
            address: businessData.address,
            city: businessData.city,
            state: businessData.state,
            pincode: businessData.pincode,
            contact_person: businessData.contactPerson,
            designation: businessData.designation,
            trading_volume: parseFloat(businessData.tradingVolume) || 0,
          };

          const { data: insertedProfile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileInsert)
            .select()
            .single();

          if (profileError) throw profileError;
        }
      }

      // 4. Clear any old session data
      localStorage.removeItem('kh_phone');
      localStorage.removeItem('kh_profile');
      localStorage.removeItem('kh_role');
      
      // 5. Store new user data
      localStorage.setItem('kh_user_id', authData.user.id);
      localStorage.setItem('kh_user_type', userType);
      
      // Store profile data for immediate use
      const profileData = userType === 'farmer' 
        ? { fullName: farmerData.fullName, email: farmerData.email, phone: farmerData.phone, userType: 'farmer' }
        : { businessName: businessData.businessName, email: businessData.email, phone: businessData.phone, userType: 'business' };
      localStorage.setItem('kh_profile', JSON.stringify(profileData));

      // 6. Redirect to dashboard
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 
    'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Uttar Pradesh'
  ];

  const cropTypes = ['Soybean', 'Mustard', 'Groundnut', 'Sunflower', 'Other'];
  const businessTypes = ['Oil Mill', 'Trader', 'Processor', 'Exporter', 'Retailer'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-4 md:py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <Sprout className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">Krishi Hedge</h1>
              <p className="text-green-600 text-xs md:text-sm font-medium">Oilseed Hedging Platform</p>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600 text-sm md:text-base">Join thousands of farmers and businesses</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* User Type Toggle */}
        <div className="max-w-md mx-auto mb-6 md:mb-8">
          <label className="text-xs md:text-sm font-medium text-gray-700 mb-3 block text-center uppercase tracking-wide">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
            <button
              type="button"
              onClick={() => {
                setUserType('farmer');
                setCurrentStep(1);
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                userType === 'farmer'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium text-sm md:text-base">Farmer</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setUserType('business');
                setCurrentStep(1);
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                userType === 'business'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium text-sm md:text-base">Business</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mb-8 px-4">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-600 -z-10 rounded-full transition-all duration-300"
              style={{ width: currentStep === 2 ? '100%' : '0%' }}
            ></div>

            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 border-4 ${
                currentStep >= 1 
                  ? 'bg-green-600 text-white border-green-50 shadow-green-200 shadow-lg scale-110' 
                  : 'bg-white text-gray-400 border-gray-100'
              }`}>
                1
              </div>
              <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${currentStep >= 1 ? 'text-green-700' : 'text-gray-400'}`}>
                Basic Info
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 border-4 ${
                currentStep >= 2 
                  ? 'bg-green-600 text-white border-green-50 shadow-green-200 shadow-lg scale-110' 
                  : 'bg-white text-gray-400 border-gray-100'
              }`}>
                2
              </div>
              <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${currentStep >= 2 ? 'text-green-700' : 'text-gray-400'}`}>
                Details
              </span>
            </div>
          </div>
        </div>

        {/* Forms Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-5 md:p-8">
          {userType === 'farmer' ? (
            <div>
              {/* FARMER STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    Personal Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={farmerData.fullName}
                        onChange={handleFarmerChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={farmerData.email}
                          onChange={handleFarmerChange}
                          placeholder="farmer@example.com"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={farmerData.phone}
                          onChange={handleFarmerChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        State *
                      </label>
                      <select
                        name="state"
                        value={farmerData.state}
                        onChange={handleFarmerChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                        required
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={farmerData.password}
                          onChange={handleFarmerChange}
                          placeholder="Create password"
                          className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={farmerData.confirmPassword}
                          onChange={handleFarmerChange}
                          placeholder="Confirm password"
                          className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* FARMER STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                    <Sprout className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    Farming Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        District *
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={farmerData.district}
                        onChange={handleFarmerChange}
                        placeholder="Enter district"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Village/Town *
                      </label>
                      <input
                        type="text"
                        name="village"
                        value={farmerData.village}
                        onChange={handleFarmerChange}
                        placeholder="Enter village/town"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={farmerData.pincode}
                        onChange={handleFarmerChange}
                        placeholder="Enter pincode"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Land Size (in acres) *
                      </label>
                      <input
                        type="number"
                        name="landSize"
                        value={farmerData.landSize}
                        onChange={handleFarmerChange}
                        placeholder="e.g., 5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Primary Crop *
                      </label>
                      <select
                        name="primaryCrop"
                        value={farmerData.primaryCrop}
                        onChange={handleFarmerChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                        required
                      >
                        <option value="">Select Crop</option>
                        {cropTypes.map(crop => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Farming Experience (years) *
                      </label>
                      <input
                        type="number"
                        name="farmingExperience"
                        value={farmerData.farmingExperience}
                        onChange={handleFarmerChange}
                        placeholder="e.g., 10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={farmerData.agreeTerms}
                          onChange={handleFarmerChange}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          I agree to the <span className="text-green-600 font-medium hover:underline cursor-pointer">Terms of Service</span> and <span className="text-green-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>.
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleBack}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading || !farmerData.agreeTerms}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none active:scale-95"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* BUSINESS STEP 1 - Similar structure, continuing in next part... */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    Business Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={businessData.businessName}
                        onChange={handleBusinessChange}
                        placeholder="Enter business name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Business Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={businessData.email}
                          onChange={handleBusinessChange}
                          placeholder="business@example.com"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={businessData.phone}
                          onChange={handleBusinessChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        GST Number *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="gstNumber"
                          value={businessData.gstNumber}
                          onChange={handleBusinessChange}
                          placeholder="22AAAAA0000A1Z5"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={businessData.password}
                          onChange={handleBusinessChange}
                          placeholder="Create password"
                          className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={businessData.confirmPassword}
                          onChange={handleBusinessChange}
                          placeholder="Confirm password"
                          className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* BUSINESS STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                    <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    Additional Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Business Type *
                      </label>
                      <select
                        name="businessType"
                        value={businessData.businessType}
                        onChange={handleBusinessChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                        required
                      >
                        <option value="">Select Type</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Size *
                      </label>
                      <select
                        name="companySize"
                        value={businessData.companySize}
                        onChange={handleBusinessChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                        required
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201+">201+ employees</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Business Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={businessData.address}
                        onChange={handleBusinessChange}
                        placeholder="Enter complete address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={businessData.city}
                        onChange={handleBusinessChange}
                        placeholder="Enter city"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        State *
                      </label>
                      <select
                        name="state"
                        value={businessData.state}
                        onChange={handleBusinessChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                        required
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={businessData.pincode}
                        onChange={handleBusinessChange}
                        placeholder="Enter pincode"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Contact Person Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="contactPerson"
                          value={businessData.contactPerson}
                          onChange={handleBusinessChange}
                          placeholder="Enter contact person"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Designation *
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={businessData.designation}
                        onChange={handleBusinessChange}
                        placeholder="e.g., Manager, Director"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Expected Monthly Trading Volume (Quintals) *
                      </label>
                      <input
                        type="number"
                        name="tradingVolume"
                        value={businessData.tradingVolume}
                        onChange={handleBusinessChange}
                        placeholder="e.g., 10000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="agreeTerms"
                          checked={businessData.agreeTerms}
                          onChange={handleBusinessChange}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          I agree to the <span className="text-green-600 font-medium hover:underline cursor-pointer">Terms of Service</span> and <span className="text-green-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>. I confirm that all information provided is accurate.
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleBack}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading || !businessData.agreeTerms}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none active:scale-95"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Already have account */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => router.push('/auth/login')}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
