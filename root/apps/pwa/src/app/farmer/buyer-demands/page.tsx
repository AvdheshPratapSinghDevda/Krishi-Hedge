'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BuyerDemand {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  strikePrice: number;
  deliveryWindow: string;
  status: string;
  buyerId: string;
  createdAt: string;
}

export default function FarmerBuyerDemandsPage() {
  const router = useRouter();
  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadDemands();
  }, []);

  async function loadDemands() {
    try {
      // Fetch buyer demand contracts (contracts created by buyers looking for sellers/farmers)
      const res = await fetch('/api/buyer-demands');
      if (res.ok) {
        const data = await res.json();
        setDemands(data);
      }
    } catch (error) {
      console.error('Failed to load buyer demands:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDemands = demands.filter(d => {
    if (filter === 'all') return true;
    return d.crop.toLowerCase() === filter.toLowerCase();
  });

  const uniqueCrops = Array.from(new Set(demands.map(d => d.crop)));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-6 shadow-lg mb-4 text-white">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-white hover:text-green-200">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Buyer Demand Contracts</h1>
            <p className="text-sm text-green-100">Accept contracts you can fulfill</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-green-100">Available Demands</p>
              <p className="text-2xl font-bold">{demands.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-100">Total Volume</p>
              <p className="text-2xl font-bold">
                {demands.reduce((sum, d) => sum + d.quantity, 0)} Qtl
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
                  ? 'bg-green-600 text-white'
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
                    ? 'bg-green-600 text-white'
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
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Loading buyer demands...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDemands.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-solid fa-inbox text-2xl"></i>
            </div>
            <p className="text-slate-800 font-bold mb-1">No buyer demands available</p>
            <p className="text-sm text-slate-500">
              {filter !== 'all' 
                ? `No ${filter} demands found. Try a different filter.`
                : 'Check back later for new buyer requests.'}
            </p>
          </div>
        )}

        {/* Demand Cards */}
        {!loading && filteredDemands.length > 0 && (
          <div className="space-y-3">
            {filteredDemands.map((demand) => (
              <Link
                key={demand.id}
                href={`/farmer/buyer-demands/${demand.id}`}
                className="block bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-green-500 hover:shadow-md transition group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-green-600 transition">
                      {demand.crop}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Demand ID: {demand.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Offering Price</p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{demand.strikePrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">per {demand.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Quantity Needed</p>
                    <p className="font-bold text-slate-800">
                      {demand.quantity} {demand.unit}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Delivery</p>
                    <p className="font-bold text-slate-800">{demand.deliveryWindow}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <i className="fa-solid fa-clock"></i>
                    <span>Posted {new Date(demand.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-green-600 group-hover:text-green-700">
                    View & Accept
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <i className="fa-solid fa-info text-sm"></i>
            </div>
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">How It Works</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Browse buyer demand contracts</li>
                <li>✓ Accept demands you can fulfill with your harvest</li>
                <li>✓ Both parties get blockchain-verified contract PDF</li>
                <li>✓ Secure payment guaranteed on delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
