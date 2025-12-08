'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import { 
  User, Mail, Phone, MapPin, Building2, 
  Edit3, Save, X, CheckCircle2, AlertCircle,
  ChevronRight, Landmark, Package, LogOut, Settings, Store
} from 'lucide-react';

// Storage keys
const PROFILE_STORAGE_KEY = "kh_profile";
const PHONE_STORAGE_KEY = "kh_phone";
const BANK_STORAGE_KEY = "kh_bank";

// Profile data interface - Ready for Supabase
interface ProfileData {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  userType: 'farmer' | 'business';
  
  // Location
  village?: string;
  district: string;
  state?: string;
  pincode?: string;
  
  // Farmer specific
  landSize?: number;
  primaryCrop?: string;
  farmingExperience?: number;
  
  // Business specific
  businessName?: string;
  gstNumber?: string;
  businessType?: string;
  
  // Status
  emailVerified?: boolean;
  phoneVerified?: boolean;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    userType: "farmer",
  });

  const [editForm, setEditForm] = useState<ProfileData>(profile);
  const [bank, setBank] = useState<any>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const supabase = createClient();
      
      // Get current user with retry logic
      let user = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        user = currentUser;
        
        if (!user && attempts < maxAttempts - 1) {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        } else if (!user) {
          break;
        }
      }
      
      if (!user) {
        // Only redirect if really no user after retries
        console.log('No user found after retries');
        router.push('/auth/login');
        return;
      }

      // Load profile from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        
        // If profile doesn't exist yet, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, using default');
          const defaultProfile: ProfileData = {
            id: user.id,
            fullName: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: '',
            district: '',
            userType: 'farmer',
          };
          setProfile(defaultProfile);
          setEditForm(defaultProfile);
          setLoading(false);
          return;
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setProfile(data);
          setEditForm(data);
        }
      } else {
        // Map database fields to component fields
        const mappedProfile: ProfileData = {
          id: profileData.id,
          fullName: profileData.full_name || profileData.business_name || '',
          businessName: profileData.business_name,
          email: profileData.email,
          phone: profileData.phone,
          userType: profileData.user_type,
          village: profileData.village,
          district: profileData.district,
          state: profileData.state,
          pincode: profileData.pincode,
          landSize: profileData.land_size,
          primaryCrop: profileData.primary_crop,
          farmingExperience: profileData.farming_experience,
          gstNumber: profileData.gst_number,
          businessType: profileData.business_type,
          emailVerified: profileData.email_verified,
          phoneVerified: profileData.phone_verified,
          kycStatus: profileData.kyc_status,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        };
        
        setProfile(mappedProfile);
        setEditForm(mappedProfile);
        
        // Also update localStorage for backward compatibility
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(mappedProfile));
      }

      const storedBank = localStorage.getItem(BANK_STORAGE_KEY);
      if (storedBank) setBank(JSON.parse(storedBank));
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Replace with Supabase call
      // await supabase.from('profiles').upsert(editForm)
      
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(editForm));
      setProfile(editForm);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-600">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Edit3 size={18} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                {(profile.fullName || profile.businessName || 'U').charAt(0).toUpperCase()}
              </div>
              {profile.kycStatus === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.fullName || profile.businessName || 'User'}</h2>
              <p className="text-gray-600 mt-1">
                {profile.userType === 'farmer' ? 'Farmer' : 'Business'}
              </p>
              <span className={`inline-block text-xs px-3 py-1 rounded-full mt-3 ${
                profile.kycStatus === 'verified' ? 'bg-green-100 text-green-700' : 
                profile.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {profile.kycStatus === 'verified' ? 'Verified' : 
                 profile.kycStatus === 'rejected' ? '✗ Rejected' : 
                 '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User size={20} className="text-green-600" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="font-medium">{profile.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="flex-1 font-medium">{profile.email}</p>
                )}
                {profile.emailVerified ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-yellow-600" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="flex-1 font-medium">+91 {profile.phone}</p>
                )}
                {profile.phoneVerified ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-yellow-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-green-600" />
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['village', 'district', 'state', 'pincode'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field === 'village' ? 'Village/Town' : field}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={(editForm as any)[field] || ''}
                    onChange={(e) => setEditForm({...editForm, [field]: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="font-medium">{(profile as any)[field] || 'Not set'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Farmer/Business Specific */}
        {profile.userType === 'farmer' ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package size={20} className="text-green-600" />
              Farming Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (acres)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.landSize || ''}
                    onChange={(e) => setEditForm({...editForm, landSize: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="font-medium">{profile.landSize || 0} acres</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crop</label>
                {isEditing ? (
                  <select
                    value={editForm.primaryCrop || ''}
                    onChange={(e) => setEditForm({...editForm, primaryCrop: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select</option>
                    <option>Soybean</option>
                    <option>Mustard</option>
                    <option>Groundnut</option>
                    <option>Sunflower</option>
                  </select>
                ) : (
                  <p className="font-medium">{profile.primaryCrop || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.farmingExperience || ''}
                    onChange={(e) => setEditForm({...editForm, farmingExperience: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="font-medium">{profile.farmingExperience || 0} years</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-green-600" />
              Business Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.businessName || ''}
                    onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="font-medium">{profile.businessName || 'Not set'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.gstNumber || ''}
                      onChange={(e) => setEditForm({...editForm, gstNumber: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="font-medium">{profile.gstNumber || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  {isEditing ? (
                    <select
                      value={editForm.businessType || ''}
                      onChange={(e) => setEditForm({...editForm, businessType: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select</option>
                      <option>Oil Mill</option>
                      <option>Trader</option>
                      <option>Processor</option>
                      <option>Exporter</option>
                    </select>
                  ) : (
                    <p className="font-medium">{profile.businessType || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Details */}
        {bank && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Landmark size={20} className="text-green-600" />
              Bank Details
            </h3>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Account: <span className="font-bold text-gray-900">{bank.account}</span></p>
              <p className="text-sm text-gray-600 mt-1">IFSC: <span className="font-medium">{bank.ifsc}</span></p>
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={() => router.push('/marketplace')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-emerald-50 border-b"
          >
            <div className="flex items-center gap-3">
              <Store size={20} className="text-emerald-600" />
              <div className="text-left">
                <p className="font-medium">FPO Marketplace</p>
                <p className="text-xs text-gray-500">Buy commodities & join FPOs</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button 
            onClick={() => router.push('/settings')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 border-b"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-gray-600" />
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <div className="px-6 py-4 hover:bg-red-50">
            <LogoutButton variant="text" className="w-full justify-between" />
          </div>
        </div>
      </div>
    </div>
  );
}
