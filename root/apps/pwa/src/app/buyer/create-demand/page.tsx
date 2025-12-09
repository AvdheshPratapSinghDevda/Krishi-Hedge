'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBuyerDemandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crop: 'Soybean',
    quantity: 50,
    unit: 'Qtl',
    strikePrice: 4800,
    deliveryWindow: '30 Days'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const buyerId = window.localStorage.getItem("kh_buyer_id") || window.localStorage.getItem("kh_user_id");
      
      const res = await fetch('/api/buyer-demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          buyerId
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert('Demand contract created successfully! Farmers can now see and accept your request.');
        router.push(`/buyer/home`);
      } else {
        const error = await res.json();
        alert(`Failed to create demand: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating demand:', error);
      alert('Failed to create demand contract');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Demand Contract</h3>
        <ul className="text-left text-sm text-gray-500 space-y-2 mt-4">
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-check text-green-600"></i>
            Validating contract details
          </li>
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-blue-600"></i>
            Publishing to farmer marketplace
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <i className="fa-solid fa-clock"></i>
            Waiting for farmer acceptance
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-white hover:text-blue-200">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Create Demand Contract</h1>
            <p className="text-sm text-blue-100">Post what you want to buy</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crop Selection */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Crop</label>
            <select 
              value={formData.crop}
              onChange={(e) => setFormData({...formData, crop: e.target.value})}
              className="w-full bg-white p-3 rounded-lg border border-gray-200 font-bold text-gray-800 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="Soybean">Soybean</option>
              <option value="Wheat">Wheat</option>
              <option value="Chana">Chana</option>
              <option value="Maize">Maize</option>
              <option value="Mustard">Mustard</option>
              <option value="Groundnut">Groundnut</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              Quantity Needed (Quintals)
            </label>
            <input 
              type="number" 
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              min="1"
              className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-300 py-2 focus:border-blue-500 outline-none text-gray-800" 
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Total value: ₹{(formData.quantity * formData.strikePrice).toLocaleString()}
            </p>
          </div>

          {/* Price Offering */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              Price You're Offering (₹ per Quintal)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-gray-600">₹</span>
              <input 
                type="number" 
                value={formData.strikePrice}
                onChange={(e) => setFormData({...formData, strikePrice: Number(e.target.value)})}
                min="1"
                className="flex-1 text-3xl font-bold bg-transparent border-b-2 border-gray-300 py-2 focus:border-blue-500 outline-none text-gray-800" 
                required
              />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              <i className="fa-solid fa-info-circle mr-1"></i>
              Offer a competitive price to attract farmers
            </p>
          </div>

          {/* Delivery Window */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Delivery Timeline</label>
            <select 
              value={formData.deliveryWindow}
              onChange={(e) => setFormData({...formData, deliveryWindow: e.target.value})}
              className="w-full bg-white p-3 rounded-lg border border-gray-200 font-bold text-gray-800 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="45 Days">45 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-xl">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-file-contract"></i>
              Contract Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Commodity:</span>
                <span className="font-bold text-gray-900">{formData.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-bold text-gray-900">{formData.quantity} Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Offer:</span>
                <span className="font-bold text-green-600">₹{formData.strikePrice}/Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-bold text-gray-900">{formData.deliveryWindow}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="text-gray-600">Total Contract Value:</span>
                <span className="font-bold text-blue-900 text-lg">
                  ₹{(formData.quantity * formData.strikePrice).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-rocket mr-2"></i>
            Publish Demand Contract
          </button>

          <p className="text-xs text-center text-gray-500">
            Farmers will be able to see and accept your demand contract
          </p>
        </form>
      </div>
    </div>
  );
}
