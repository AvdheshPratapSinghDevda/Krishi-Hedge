'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BuyerDemandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [demand, setDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    async function load() {
      try {
        // Fetch the specific buyer demand
        const res = await fetch(`/api/buyer-demands`);
        if (res.ok) {
          const demands = await res.json();
          const found = demands.find((d: any) => d.id === id);
          setDemand(found || null);
        }
      } catch (error) {
        console.error('Error loading demand:', error);
        setDemand(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  async function handleAccept() {
    if (!confirm(`Are you sure you want to accept this demand contract for ${demand.quantity} ${demand.unit} of ${demand.crop} at ₹${demand.strikePrice}/${demand.unit}?`)) {
      return;
    }

    setAccepting(true);
    try {
      const farmerId = window.localStorage.getItem("kh_user_id");
      
      const res = await fetch(`/api/buyer-demands/${demand.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId })
      });

      if (res.ok) {
        alert('✅ Demand contract accepted successfully! The buyer has been notified. You will receive the contract details shortly.');
        router.push('/farmer/contracts');
      } else {
        const error = await res.json();
        alert(`Failed to accept demand: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error accepting demand:', error);
      alert('Failed to accept demand contract');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading demand details...</p>
        </div>
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fa-solid fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <p className="text-gray-800 font-bold mb-2">Demand Not Found</p>
          <p className="text-sm text-gray-500 mb-4">This demand may have been removed or already accepted.</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-6 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-white hover:text-green-200">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Buyer Demand Details</h1>
            <p className="text-sm text-green-100">Review and accept this contract</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Main Contract Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-shopping-cart text-green-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{demand.crop}</h2>
              <p className="text-sm text-gray-500">Buyer Demand Contract</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 uppercase mb-1">Quantity Needed</p>
              <p className="text-2xl font-bold text-gray-900">{demand.quantity}</p>
              <p className="text-sm text-gray-600">{demand.unit}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 uppercase mb-1">Offered Price</p>
              <p className="text-2xl font-bold text-green-600">₹{demand.strikePrice}</p>
              <p className="text-sm text-gray-600">per {demand.unit}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <p className="text-xs text-gray-500 uppercase mb-1">Delivery Timeline</p>
            <p className="text-lg font-bold text-gray-900">{demand.deliveryWindow}</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border-2 border-green-200">
            <p className="text-xs text-gray-600 uppercase mb-1">Total Contract Value</p>
            <p className="text-3xl font-bold text-green-700">
              ₹{(demand.quantity * demand.strikePrice).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-shield-check text-green-600"></i>
            Contract Benefits
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Guaranteed buyer with pre-agreed price</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>No market volatility risk - price locked</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Blockchain-verified contract with legal validity</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Secure payment on delivery through platform</span>
            </li>
          </ul>
        </div>

        {/* Contract Terms */}
        <div className="bg-yellow-50 border-2 border-yellow-200 p-5 rounded-xl">
          <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-file-contract"></i>
            Important Terms
          </h3>
          <ul className="text-sm text-yellow-900 space-y-1">
            <li>• You must deliver {demand.quantity} {demand.unit} of {demand.crop}</li>
            <li>• Quality must meet industry standards (FAQ grade minimum)</li>
            <li>• Delivery within {demand.deliveryWindow} from acceptance</li>
            <li>• Payment released after quality inspection</li>
          </ul>
        </div>

        {/* Accept Button */}
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {accepting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Accepting Contract...
            </>
          ) : (
            <>
              <i className="fa-solid fa-handshake"></i>
              Accept This Demand Contract
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          By accepting, you agree to fulfill this contract as per the terms mentioned above
        </p>
      </div>
    </div>
  );
}
