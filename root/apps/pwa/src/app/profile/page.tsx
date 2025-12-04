'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  User, Mail, Phone, MapPin, Building2, Briefcase, 
  Shield, Camera, Edit2, Save, X, CheckCircle2, AlertCircle,
  Home, Lock, Key, Smartphone, Calendar, TrendingUp,
  FileText, Award, Sprout, BarChart3
} from 'lucide-react';

const PROFILE_STORAGE_KEY = "kh_profile";
const ROLE_STORAGE_KEY = "kh_role";
const PHONE_STORAGE_KEY = "kh_phone";
const HOME_TUTORIAL_KEY = "kh_home_tutorial_seen";
const BANK_STORAGE_KEY = "kh_bank";

export default function ProfilePage() {
  const router = useRouter();
  const [isBuyer, setIsBuyer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    // Personal Information
    fullName: "Loading...",
    email: "user@example.com",
    emailVerified: true,
    phone: "...",
    phoneVerified: true,
    aadhaarStatus: "verified",
    
    // Location Details
    village: "Not set",
    district: "...",
    state: "Not set",
    pincode: "000000",
    
    // Common Details
    userType: "farmer", // farmer or business
    registrationDate: new Date().toISOString().split('T')[0],
    memberSince: "Dec 2024",
    totalTrades: 0,
    
    // Farmer-Specific
    landSize: "5",
    primaryCrop: "Soybean",
    farmingExperience: "10",
    
    // Business-Specific
    businessName: "",
    gstNumber: "",
    businessType: "",
    companySize: "",
    contactPerson: "",
    designation: ""
  });

  const [editForm, setEditForm] = useState(userData);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bank, setBank] = useState<any>(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ account: "", ifsc: "" });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if buyer
      const buyerProfile = window.localStorage.getItem("kh_buyer_profile");
      if (buyerProfile) {
        setIsBuyer(true);
        const p = JSON.parse(buyerProfile);
        setUserData({
          ...userData,
          fullName: p.name || "Institutional Buyer",
          phone: "Corporate Account",
          district: p.type || "Institutional",
          userType: "business",
          businessName: p.name || "Corporate Entity"
        });
        return;
      }

      const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const phone = window.localStorage.getItem(PHONE_STORAGE_KEY);
      const storedBank = window.localStorage.getItem(BANK_STORAGE_KEY);
      const storedImage = window.localStorage.getItem("kh_profile_image");
      
      if (storedBank) setBank(JSON.parse(storedBank));
      if (storedImage) setProfileImage(storedImage);

      if (stored) {
        const p = JSON.parse(stored);
        const updatedData = {
          ...userData,
          fullName: p.name || "Farmer",
          phone: p.phone || phone || "Not set",
          district: p.district || "Not set",
          village: p.village || "Not set",
          state: p.state || "Not set",
          pincode: p.pincode || "000000",
          landSize: p.landSize || "5",
          primaryCrop: p.primaryCrop || "Soybean",
          farmingExperience: p.farmingExperience || "10",
          email: p.email || "farmer@krishihub.com",
          userType: p.userType || "farmer"
        };
        setUserData(updatedData);
        setEditForm(updatedData);
      } else {
        const guestData = {
          ...userData,
          fullName: "Guest Farmer",
          phone: phone || "Not set",
          district: "India"
        };
        setUserData(guestData);
        setEditForm(guestData);
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      router.replace('/splash');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileImage(base64);
        localStorage.setItem("kh_profile_image", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setUserData(editForm);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(editForm));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm(userData);
    setIsEditing(false);
  };

  const saveBank = () => {
    if (!bankForm.account || !bankForm.ifsc) return alert("Please fill all fields");
    const newBank = { ...bankForm, verified: true };
    setBank(newBank);
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(newBank));
    setIsEditingBank(false);
  };

  if (isBuyer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 size={28} /> Corporate Profile
          </h1>
          <p className="text-green-100 text-sm mt-1">Manage organization settings</p>
        </div>

        <div className="px-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {userData.fullName.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{userData.fullName}</h2>
                <p className="text-green-600 text-sm font-semibold flex items-center gap-1 mt-1">
                  <Shield size={14} /> {userData.district}
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-2">
                  <Briefcase size={16} /> Account Type
                </span>
                <span className="font-bold text-slate-800 bg-green-50 px-3 py-1 rounded-full text-sm">Corporate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} /> KYC Status
                </span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={18} /> Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-2">
                  <Calendar size={16} /> Member Since
                </span>
                <span className="font-semibold text-slate-700">{userData.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg border border-green-100">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-green-600" /> Settings
            </h3>
            <button onClick={handleLogout} className="w-full text-left py-3 text-red-600 font-bold flex items-center gap-2 hover:bg-red-50 rounded-lg px-3 transition-colors">
              <X size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main farmer/business profile render
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User size={28} /> My Profile
            </h1>
            <p className="text-green-100 text-sm mt-1">Manage your account information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-md"
            >
              <Edit2 size={18} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-md"
              >
                <Save size={18} /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors shadow-md"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 sticky top-24">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-green-500" />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-green-400">
                      {userData.fullName.charAt(0)}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors shadow-lg">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                  <div className="absolute top-0 right-0 bg-green-600 text-white rounded-full p-1 shadow-lg">
                    {userData.emailVerified && <CheckCircle2 size={20} />}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 text-center">{userData.fullName}</h2>
                <span className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
                  userData.userType === 'farmer' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {userData.userType === 'farmer' ? '🌾 Farmer' : '🏢 Business'}
                </span>

                {/* Verification Status */}
                <div className="w-full mt-6 space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    userData.emailVerified ? 'bg-green-50' : 'bg-amber-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className={userData.emailVerified ? 'text-green-600' : 'text-amber-600'} />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    {userData.emailVerified ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                      <button className="text-xs text-amber-600 font-semibold">Verify</button>
                    )}
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    userData.phoneVerified ? 'bg-green-50' : 'bg-amber-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className={userData.phoneVerified ? 'text-green-600' : 'text-amber-600'} />
                      <span className="text-sm font-medium">Phone</span>
                    </div>
                    {userData.phoneVerified ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                      <button className="text-xs text-amber-600 font-semibold">Verify</button>
                    )}
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    userData.aadhaarStatus === 'verified' ? 'bg-green-50' : 'bg-amber-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className={userData.aadhaarStatus === 'verified' ? 'text-green-600' : 'text-amber-600'} />
                      <span className="text-sm font-medium">Aadhaar</span>
                    </div>
                    {userData.aadhaarStatus === 'verified' ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                      <button className="text-xs text-amber-600 font-semibold">Verify</button>
                    )}
                  </div>
                </div>

                {/* Account Stats */}
                <div className="w-full mt-6 pt-6 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <Calendar size={16} /> Member Since
                    </span>
                    <span className="font-semibold text-slate-700 text-sm">{userData.memberSince}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <TrendingUp size={16} /> Total Trades
                    </span>
                    <span className="font-semibold text-green-600 text-sm">{userData.totalTrades}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - 3 Column Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <User className="text-green-600" size={22} /> Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{userData.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                      <Mail size={12} /> Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        {userData.email}
                        {userData.emailVerified && <CheckCircle2 size={16} className="text-green-600" />}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                      <Phone size={12} /> Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        +91 {userData.phone}
                        {userData.phoneVerified && <CheckCircle2 size={16} className="text-green-600" />}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                      <Shield size={12} /> Aadhaar Status
                    </label>
                    <p className={`font-semibold flex items-center gap-2 ${
                      userData.aadhaarStatus === 'verified' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {userData.aadhaarStatus === 'verified' ? (
                        <><CheckCircle2 size={16} /> Verified</>
                      ) : (
                        <><AlertCircle size={16} /> Pending</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Details Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <MapPin className="text-green-600" size={22} /> Location Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1 block">Village/Town</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.village}
                        onChange={(e) => setEditForm({...editForm, village: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{userData.village}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1 block">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.district}
                        onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{userData.district}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1 block">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.state}
                        onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{userData.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1 block">Pincode</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.pincode}
                        onChange={(e) => setEditForm({...editForm, pincode: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{userData.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Farmer/Business Specific Details Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                  {userData.userType === 'farmer' ? (
                    <><Sprout className="text-green-600" size={22} /> Farming Details</>
                  ) : (
                    <><Building2 className="text-blue-600" size={22} /> Business Details</>
                  )}
                </h3>
                
                {userData.userType === 'farmer' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Land Size (acres)</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.landSize}
                          onChange={(e) => setEditForm({...editForm, landSize: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.landSize} acres</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Primary Crop</label>
                      {isEditing ? (
                        <select
                          value={editForm.primaryCrop}
                          onChange={(e) => setEditForm({...editForm, primaryCrop: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="Soybean">Soybean</option>
                          <option value="Mustard">Mustard</option>
                          <option value="Groundnut">Groundnut</option>
                          <option value="Sunflower">Sunflower</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.primaryCrop}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Farming Experience</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.farmingExperience}
                          onChange={(e) => setEditForm({...editForm, farmingExperience: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.farmingExperience} years</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Registration Date</label>
                      <p className="font-semibold text-slate-800">{userData.registrationDate}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Business Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.businessName}
                          onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.businessName || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">GST Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.gstNumber}
                          onChange={(e) => setEditForm({...editForm, gstNumber: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.gstNumber || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Business Type</label>
                      {isEditing ? (
                        <select
                          value={editForm.businessType}
                          onChange={(e) => setEditForm({...editForm, businessType: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select Type</option>
                          <option value="Oil Mill">Oil Mill</option>
                          <option value="Trader">Trader</option>
                          <option value="Processor">Processor</option>
                          <option value="Exporter">Exporter</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.businessType || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 font-medium mb-1 block">Company Size</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.companySize}
                          onChange={(e) => setEditForm({...editForm, companySize: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="font-semibold text-slate-800">{userData.companySize || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                <FileText className="text-green-600" size={22} /> Bank Details
              </h3>
              {bank ? (
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-bold text-slate-800 text-lg">{bank.account}</p>
                    <p className="text-sm text-slate-600 mt-1">IFSC: {bank.ifsc}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={14} /> Verified
                      </span>
                      <button 
                        onClick={() => { setBank(null); localStorage.removeItem(BANK_STORAGE_KEY); }} 
                        className="text-red-500 text-sm font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEditingBank ? (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Account Number" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={bankForm.account}
                    onChange={e => setBankForm({...bankForm, account: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="IFSC Code" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={bankForm.ifsc}
                    onChange={e => setBankForm({...bankForm, ifsc: e.target.value})}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={saveBank} 
                      className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} /> Save Bank Details
                    </button>
                    <button 
                      onClick={() => setIsEditingBank(false)} 
                      className="text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 mb-4">No bank account linked</p>
                  <button 
                    onClick={() => setIsEditingBank(true)} 
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                  >
                    + Add Bank Account
                  </button>
                </div>
              )}
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                <Lock className="text-green-600" size={22} /> Security Settings
              </h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Key className="text-green-600" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">Change Password</p>
                      <p className="text-xs text-slate-500">Update your account password</p>
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Smartphone className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      twoFactorEnabled ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      twoFactorEnabled ? 'transform translate-x-7' : ''
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              <button 
                onClick={handleLogout} 
                className="w-full py-4 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} /> Logout from Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
