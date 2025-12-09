'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BuyerAcceptFarmerOfferPage() {
  const router = useRouter();
  const params = useParams();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    fetch(`/api/contracts/${id}`)
      .then(res => res.json())
      .then(data => {
        setOffer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading offer:', err);
        setLoading(false);
      });
  }, [params.id]);

  async function handleAccept() {
    if (!offer) return;

    const buyerId = window.localStorage.getItem("kh_buyer_id") || window.localStorage.getItem("kh_user_id");
    if (!buyerId) {
      alert('Please login as a buyer to accept this offer');
      router.push('/auth/login?role=buyer');
      return;
    }

    const confirmed = confirm(
      `Accept this offer?\n\n` +
      `Crop: ${offer.crop}\n` +
      `Quantity: ${offer.quantity} ${offer.unit}\n` +
      `Price: ₹${offer.strikePrice}/${offer.unit}\n` +
      `Total: ₹${(offer.quantity * offer.strikePrice).toLocaleString()}\n\n` +
      `Once accepted, you'll receive a blockchain-verified contract PDF.`
    );

    if (!confirmed) return;

    setAccepting(true);

    try {
      const res = await fetch(`/api/contracts/${offer.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      });

      if (res.ok) {
        alert('✅ Offer accepted successfully! Both you and the farmer will receive contract PDFs.');
        router.push('/buyer/contracts');
      } else {
        const error = await res.json();
        alert(`Failed to accept offer: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading offer details...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Offer Not Found</h3>
        <p className="text-gray-600 mb-6">This offer may have been removed or accepted by another buyer.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Accepting Offer</h3>
        <ul className="text-left text-sm text-gray-500 space-y-2 mt-4">
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-check text-green-600"></i>
            Validating contract details
          </li>
          <li className="flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-blue-600"></i>
            Creating blockchain-verified PDF
          </li>
          <li className="flex items-center gap-2 text-gray-400">
            <i className="fa-solid fa-clock"></i>
            Notifying farmer
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
            <h1 className="text-2xl font-bold">Farmer Offer Details</h1>
            <p className="text-sm text-blue-100">Review and accept this offer</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Crop Info Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{offer.crop}</h2>
              <p className="text-sm text-gray-500">Farmer Sell Offer</p>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
              AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Quantity</p>
              <p className="text-xl font-bold text-gray-800">{offer.quantity} {offer.unit}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Price per {offer.unit}</p>
              <p className="text-xl font-bold text-green-600">₹{offer.strikePrice}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Contract Value:</span>
              <span className="text-2xl font-bold text-blue-900">
                ₹{(offer.quantity * offer.strikePrice).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Delivery Timeline:</span>
              <span className="font-medium text-gray-800">{offer.deliveryWindow}</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
          <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-shield-halved"></i>
            Contract Benefits
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Fixed price protection - locked in at ₹{offer.strikePrice}/{offer.unit}</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Blockchain-verified contract PDF sent to both parties</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Guaranteed delivery within {offer.deliveryWindow}</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
              <span>Direct farmer sourcing - no middlemen</span>
            </li>
          </ul>
        </div>

        {/* Contract Terms */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-gray-800 mb-3">Contract Terms</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="flex justify-between">
              <span>Contract Type:</span>
              <span className="font-medium">Farmer Sell Offer</span>
            </p>
            <p className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600">Open for Acceptance</span>
            </p>
            <p className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium">{new Date(offer.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Accept Button */}
        <button
          onClick={handleAccept}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-800 transition flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-handshake text-xl"></i>
          <span>Accept This Offer</span>
        </button>

        <p className="text-xs text-gray-500 text-center">
          By accepting, you agree to purchase {offer.quantity} {offer.unit} of {offer.crop} at ₹{offer.strikePrice}/{offer.unit}
        </p>
      </div>
    </div>
  );
}
