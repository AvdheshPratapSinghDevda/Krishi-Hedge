'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PHONE_STORAGE_KEY = "kh_buyer_phone";
const PROFILE_STORAGE_KEY = "kh_buyer_profile";

export default function BuyerOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PHONE_STORAGE_KEY) || "";
    setPhone(stored);
  }, []);

  async function handleVerify() {
    if (typeof window === "undefined") return;

    if (code.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/buyer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Invalid OTP");
        return;
      }

      // Store buyer session
      const profile = {
        phone: data.buyer.phone,
        name: data.buyer.name,
        organization_name: data.buyer.organization_name,
        buyer_type: data.buyer.buyer_type,
        onboarded: data.buyer.onboarded
      };
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      // Treat buyer ID as a logged-in "user" for AuthProvider checks
      window.localStorage.setItem("kh_user_id", data.buyer.id);
      window.localStorage.setItem("kh_buyer_id", data.buyer.id);
      window.localStorage.setItem("kh_role", "buyer");

      // Route based on onboarding status
      if (data.buyer.onboarded) {
        router.push("/buyer/home");
      } else {
        router.push("/onboarding/buyer/business");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mt-10 mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <i className="fa-solid fa-shield-halved text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Verify OTP</h2>
        <p className="text-slate-500 text-sm">Sent to +91 {phone || "98765 43210"}</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <input 
            key={idx}
            type="text" 
            maxLength={1}
            value={code[idx] || ''}
            className="w-12 h-14 border-2 border-slate-200 rounded-lg text-center text-2xl font-bold focus:border-blue-500 outline-none" 
            onChange={(e) => {
              const newCode = code.split('');
              newCode[idx] = e.target.value;
              setCode(newCode.join(''));
              // Auto-focus next input
              if (e.target.value && idx < 5) {
                const nextInput = (e.target as HTMLInputElement).parentElement?.children[idx + 1] as HTMLInputElement;
                nextInput?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !code[idx] && idx > 0) {
                const prevInput = (e.target as HTMLInputElement).parentElement?.children[idx - 1] as HTMLInputElement;
                prevInput?.focus();
              }
            }}
          />
        ))}
      </div>

      <button 
        onClick={handleVerify} 
        disabled={loading || code.length !== 6}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify & Login"}
      </button>
      <p className="text-center text-xs text-slate-400 mt-4">Resend OTP in 20s</p>
    </div>
  );
}
