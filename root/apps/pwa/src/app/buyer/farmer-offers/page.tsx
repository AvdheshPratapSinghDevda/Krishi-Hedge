'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FarmerOffer {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  strikePrice: number;
  deliveryWindow: string;
  status: string;
  farmerId: string;
  createdAt: string;
}

export default function BuyerBrowseFarmerOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<FarmerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    try {
      // Fetch farmer offer contracts (contracts created by farmers offering to sell)
      const res = await fetch('/api/contracts?type=FARMER_OFFER&status=CREATED');
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (error) {
      console.error('Failed to load farmer offers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredOffers = offers.filter(o => {
    if (filter === 'all') return true;
    return o.crop.toLowerCase() === filter.toLowerCase();
  });

  const uniqueCrops = Array.from(new Set(offers.map(o => o.crop)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6 shadow-lg mb-4 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-white hover:text-blue-200">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Farmer Marketplace</h1>
            <p className="text-sm text-blue-100">Browse farmer sell offers</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-100">Available Offers</p>
              <p className="text-2xl font-bold">{offers.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-100">Total Volume</p>
              <p className="text-2xl font-bold">
                {offers.reduce((sum, o) => sum + o.quantity, 0)} Qtl
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Filter Chips */}
        {uniqueCrops.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              All Crops
            </button>
            {uniqueCrops.map(crop => (
              <button
                key={crop}
                onClick={() => setFilter(crop)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                  filter === crop
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Offers List */}
        {!loading && filteredOffers.length > 0 && (
          <div className="space-y-3">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => router.push(`/buyer/farmer-offers/${offer.id}`)}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{offer.crop}</h3>
                    <p className="text-sm text-gray-500">
                      {offer.quantity} {offer.unit} available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Price per {offer.unit}</p>
                    <p className="text-2xl font-bold text-green-600">₹{offer.strikePrice}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-bold text-blue-900">
                      ₹{(offer.quantity * offer.strikePrice).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar text-gray-400"></i>
                    <span>{offer.deliveryWindow}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <span>View Details</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOffers.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-seedling text-slate-400 text-3xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">No Farmer Offers Found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'No farmers have posted sell offers yet. Check back later!' 
                : `No offers available for ${filter}.`}
            </p>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              View All Crops
            </button>
          </div>
        )}

        {/* Info Section */}
        {!loading && offers.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-info-circle text-blue-600"></i>
              How It Works
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
                <span>Browse farmer sell offers with fixed prices</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
                <span>Accept an offer to lock in the price</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
                <span>Both parties get blockchain-verified contract PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
                <span>Delivery within the agreed timeline</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
