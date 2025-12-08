'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PROFILE_STORAGE_KEY = "kh_buyer_profile";
const PHONE_STORAGE_KEY = "kh_buyer_phone";

interface BuyerProfile {
  id?: string;
  name: string;
  phone: string;
  organization_name?: string;
  buyer_type?: string;
  district?: string;
  state?: string;
  interested_crops?: string[];
  volume_band?: string;
  gst_number?: string;
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BuyerProfile>({
    name: "Buyer",
    phone: "Not set",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const buyerId = window.localStorage.getItem("kh_buyer_id");
      const phone = window.localStorage.getItem(PHONE_STORAGE_KEY);
      
      if (!buyerId && !phone) {
        // No buyer session, redirect to unified OTP login for buyer
        router.push('/auth/login?role=buyer');
        return;
      }

      // Try to fetch buyer profile from database if we have buyerId
      if (buyerId) {
        try {
          const response = await fetch(`/api/buyer/profile?buyerId=${buyerId}`);
          if (response.ok) {
            const data = await response.json();
            setProfile({
              id: data.id,
              name: data.name || data.organization_name || "Buyer",
              phone: data.phone || phone || "Not set",
              organization_name: data.organization_name,
              buyer_type: data.buyer_type,
              district: data.district,
              state: data.state,
              interested_crops: data.interested_crops,
              volume_band: data.volume_band,
              gst_number: data.gst_number,
            });
            
            // Update localStorage
            window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching buyer profile from API:", error);
        }
      }
      
      // Fallback to localStorage
      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProfile({
          name: data.name || data.organization_name || "Buyer",
          phone: data.phone || phone || "Not set",
          organization_name: data.organization_name,
          buyer_type: data.buyer_type,
          district: data.district,
          interested_crops: data.interested_crops,
          volume_band: data.volume_band,
        });
      } else {
        // No profile data at all, use defaults
        setProfile({
          name: "Buyer",
          phone: phone || "Not set",
        });
      }
    } catch (error) {
      console.error("Error loading buyer profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      router.replace('/splash');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/buyer/home')} className="text-slate-600">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-xl font-bold">Buyer Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {getInitials(profile.organization_name || profile.name)}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">
                {profile.organization_name || profile.name}
              </h2>
              <p className="text-slate-600 mt-1 flex items-center gap-2">
                <i className="fa-solid fa-building text-blue-600"></i>
                {profile.buyer_type || 'Buyer'}
              </p>
              <span className="inline-block text-xs px-3 py-1 rounded-full mt-3 bg-blue-100 text-blue-700">
                Active Buyer
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-address-card text-blue-600"></i>
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="flex items-center gap-2 text-slate-800">
                <i className="fa-solid fa-phone text-blue-600"></i>
                <span>+91 {profile.phone}</span>
              </div>
            </div>
            
            {profile.district && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <div className="flex items-center gap-2 text-slate-800">
                  <i className="fa-solid fa-map-marker-alt text-blue-600"></i>
                  <span>{profile.district}{profile.state && `, ${profile.state}`}</span>
                </div>
              </div>
            )}

            {profile.gst_number && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                <div className="flex items-center gap-2 text-slate-800">
                  <i className="fa-solid fa-file-invoice text-blue-600"></i>
                  <span>{profile.gst_number}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-briefcase text-blue-600"></i>
            Business Information
          </h3>
          <div className="space-y-4">
            {profile.interested_crops && profile.interested_crops.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Interested Crops</label>
                <div className="flex flex-wrap gap-2">
                  {profile.interested_crops.map((crop: string) => (
                    <span key={crop} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.volume_band && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Volume Band</label>
                <div className="flex items-center gap-2 text-slate-800">
                  <i className="fa-solid fa-chart-bar text-blue-600"></i>
                  <span>{profile.volume_band}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm divide-y">
          <button
            onClick={() => router.push('/buyer/contracts')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-file-contract text-blue-600"></i>
              <span className="font-medium">My Contracts</span>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-400"></i>
          </button>

          <button
            onClick={() => router.push('/market')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-store text-blue-600"></i>
              <span className="font-medium">Marketplace</span>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-400"></i>
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition text-red-600"
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-sign-out-alt"></i>
              <span className="font-medium">Logout</span>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-400"></i>
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-xs text-slate-500">Krishi Hedge Buyer Portal</p>
          <p className="text-xs text-slate-400 mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
