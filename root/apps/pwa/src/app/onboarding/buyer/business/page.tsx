'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

const PROFILE_STORAGE_KEY = "kh_buyer_profile";

export default function BuyerBusinessOnboardingPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [buyerType, setBuyerType] = useState("Institutional");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (!organizationName.trim()) {
      alert("Please enter your organization name");
      return;
    }

    if (!district.trim()) {
      alert("Please enter your district");
      return;
    }

    setLoading(true);
    try {
      const buyerId = window.localStorage.getItem("kh_buyer_id");
      
      if (buyerId) {
        // Update buyer profile in database
        await fetch('/api/buyer/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerId,
            organization_name: organizationName,
            buyer_type: buyerType,
            district: district,
            name: organizationName,
          }),
        });
      }

      // Store in localStorage
      const profile = {
        organization_name: organizationName,
        buyer_type: buyerType,
        district: district,
        name: organizationName,
      };
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

      // Move to interest selection
      router.push("/onboarding/buyer/interest");
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-6">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Buyer Setup - Step 1 of 2</p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2">Business Information</h1>
          <p className="mt-1 text-sm text-slate-600">Tell us about your organization to get started.</p>
        </header>

        <section className="space-y-5 flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Organization Name *
            </label>
            <input 
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium text-slate-800 transition" 
              placeholder="e.g. ITC Limited, BigBasket" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Buyer Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Institutional', 'Retail Chain', 'Mandi Agent', 'Exporter'].map((type) => (
                <button
                  key={type}
                  onClick={() => setBuyerType(type)}
                  className={`p-4 rounded-xl border-2 text-sm font-bold transition ${
                    buyerType === type 
                      ? 'border-blue-600 bg-blue-50 text-blue-800' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              District / Location *
            </label>
            <input 
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium text-slate-800 transition" 
              placeholder="e.g. Mumbai, Bangalore" 
            />
          </div>
        </section>

        <button
          onClick={handleNext}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </main>
  );
}

