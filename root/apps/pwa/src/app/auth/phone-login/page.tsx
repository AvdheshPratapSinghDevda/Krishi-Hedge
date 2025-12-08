'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";

const PHONE_STORAGE_KEY = "kh_phone";

export default function FarmerPhoneLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [phone, setPhone] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(PHONE_STORAGE_KEY) || "";
  });
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to send OTP");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(PHONE_STORAGE_KEY, phone);
        
        // Store session data for verification
        if (data.sessionData) {
          window.localStorage.setItem("kh_otp_session", data.sessionData);
        }
        
        // In dev mode, show OTP in console for easy testing
        if (data.otp) {
          console.log("🔐 OTP for", phone, ":", data.otp);
          alert(`OTP sent! (Dev mode: ${data.otp})`);
        } else {
          alert("OTP sent to your mobile number!");
        }
      }
      router.push("/auth/otp");
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="mt-10 mb-8">
        <button onClick={() => router.push('/splash')} className="text-green-600 mb-4 text-sm">
          <i className="fa-solid fa-arrow-left"></i> {t('common.back')}
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-wheat-awn text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-900">Farmer Login</h2>
            <p className="text-green-700 text-xs">Enter your mobile number to continue</p>
          </div>
        </div>
        <p className="text-slate-700 text-sm">We will send a one-time password (OTP) on your mobile. No email required.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Number</label>
          <div className="flex items-center border-b-2 border-slate-200 py-2 focus-within:border-green-600 transition">
            <span className="text-lg font-bold text-slate-500 mr-2">+91</span>
            <input 
              type="tel" 
              className="w-full outline-none text-lg font-bold text-slate-900" 
              placeholder="98765 43210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={handleNext} 
          disabled={loading}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-lg mt-6 shadow-md hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <p>Prefer email & password?</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="mt-1 text-green-700 font-semibold underline"
        >
          Use email login instead
        </button>
      </div>
    </div>
  );
}
