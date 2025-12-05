'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

const PHONE_STORAGE_KEY = "kh_buyer_phone";

export default function BuyerLoginPage() {
  const router = useRouter();
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
      const response = await fetch("/api/auth/buyer/send-otp", {
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
        // In dev mode, show OTP in console for easy testing
        if (data.otp) {
          console.log("🔐 Buyer OTP:", data.otp);
          alert(`OTP sent! (Dev mode: ${data.otp})`);
        } else {
          alert("OTP sent to your mobile number!");
        }
      }
      router.push("/auth/buyer/otp");
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mt-10 mb-8">
        <button onClick={() => router.push('/splash')} className="text-slate-400 mb-4">
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-building text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Buyer Login</h2>
            <p className="text-slate-500 text-xs">Access marketplace & contracts</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm">Enter your mobile number to continue as a buyer.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
          <div className="flex items-center border-b-2 border-slate-200 py-2 focus-within:border-blue-500 transition">
            <span className="text-lg font-bold text-slate-400 mr-2">+91</span>
            <input 
              type="tel" 
              className="w-full outline-none text-lg font-bold text-slate-800" 
              placeholder="98765 43210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={handleNext} 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-6 shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
