'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateFarmerOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    crop: 'Soybean',
    quantity: 50,
    unit: 'Qtl',
    targetPrice: 4800,
    deliveryWindow: '30 Days'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const farmerId = window.localStorage.getItem("kh_user_id");
      
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: farmerId,
          contractType: 'FARMER_OFFER'
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert('Sell offer created successfully! Buyers can now see and accept your offer.');
        router.push('/farmer/contracts');
      } else {
        const error = await res.json();
        alert(`Failed to create offer: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create sell offer');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Sell Offer</h3>
        <ul className="text-left text-sm text-gray-500 space-y-2 mt-4">
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-check text-green-600"></i>
            Validating offer details
          </li>
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-blue-600"></i>
            Publishing to buyer marketplace
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <i className="fa-solid fa-clock"></i>
            Waiting for buyer acceptance
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-white hover:text-green-200">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Create Sell Offer</h1>
            <p className="text-sm text-green-100">Offer your crops to buyers</p>
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
              className="w-full bg-white p-3 rounded-lg border border-gray-200 font-bold text-gray-800 focus:border-green-500 focus:outline-none"
              required
            >
              <option value="Soybean">Soybean</option>
              <option value="Maize">Maize</option>
              <option value="Mustard">Mustard</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Sunflower">Sunflower</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              Quantity Available (Quintals)
            </label>
            <input 
              type="number" 
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              min="1"
              className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-300 py-2 focus:border-green-500 outline-none text-gray-800" 
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Total value: ₹{(formData.quantity * formData.targetPrice).toLocaleString()}
            </p>
          </div>

          {/* Price */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              Selling Price (₹ per Quintal)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-gray-600">₹</span>
              <input 
                type="number" 
                value={formData.targetPrice}
                onChange={(e) => setFormData({...formData, targetPrice: Number(e.target.value)})}
                min="1"
                className="flex-1 text-3xl font-bold bg-transparent border-b-2 border-gray-300 py-2 focus:border-green-500 outline-none text-gray-800" 
                required
              />
            </div>
            <p className="text-xs text-green-600 mt-2">
              <i className="fa-solid fa-info-circle mr-1"></i>
              Set competitive price to attract buyers
            </p>
          </div>

          {/* Delivery Window */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Delivery Timeline</label>
            <select 
              value={formData.deliveryWindow}
              onChange={(e) => setFormData({...formData, deliveryWindow: e.target.value})}
              className="w-full bg-white p-3 rounded-lg border border-gray-200 font-bold text-gray-800 focus:border-green-500 focus:outline-none"
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-5 rounded-xl">
            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-file-contract"></i>
              Offer Summary
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
                <span className="text-gray-600">Your Price:</span>
                <span className="font-bold text-green-600">₹{formData.targetPrice}/Qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-bold text-gray-900">{formData.deliveryWindow}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-200">
                <span className="text-gray-600">Total Offer Value:</span>
                <span className="font-bold text-green-900 text-lg">
                  ₹{(formData.quantity * formData.targetPrice).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb"></i>
              How It Works
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your offer will be visible to all buyers</li>
              <li>✓ Buyers can accept your offer at this price</li>
              <li>✓ Both parties get blockchain-verified contract PDF</li>
              <li>✓ Delivery within agreed timeline</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-plus-circle mr-2"></i>
            Create Sell Offer
          </button>
        </form>
      </div>
    </div>
  );
}
