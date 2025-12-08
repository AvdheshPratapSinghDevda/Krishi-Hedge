'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Contract {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  strike_price: number;
  deliverywindow: string;
  status: string;
  created_at: string;
}

export default function BuyerContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'settled'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const buyerId = window.localStorage.getItem("kh_buyer_id");
      if (buyerId) {
        fetch(`/api/contracts?role=buyer&buyerId=${buyerId}`)
          .then(res => res.json())
          .then(data => {
            setContracts(data);
            setLoading(false);
          })
          .catch(err => {
            console.error(err);
            setLoading(false);
          });
      } else {
        setLoading(false);
        router.push('/auth/login?role=buyer');
      }
    }
  }, []);

  const filteredContracts = contracts.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'active') return c.status !== 'SETTLED' && c.status !== 'CANCELLED';
    if (filter === 'settled') return c.status === 'SETTLED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      'CREATED': 'bg-yellow-100 text-yellow-700',
      'MATCHED_WITH_BUYER_DEMO': 'bg-blue-100 text-blue-700',
      'SETTLED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      'EXPIRED': 'bg-gray-100 text-gray-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 mb-4 sticky top-0 z-10">
        <button onClick={() => router.push('/buyer/home')} className="text-slate-600">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="text-xl font-bold flex-1">My Contracts</h1>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
          {contracts.length}
        </span>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('settled')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'settled' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Settled
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filteredContracts.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-file-contract text-slate-400 text-2xl"></i>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">No contracts found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {filter === 'all' 
                ? 'Visit the marketplace to browse available contracts.' 
                : `No ${filter} contracts.`}
            </p>
            <button
              onClick={() => router.push('/market')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract.id}
              onClick={() => router.push(`/buyer/contracts/${contract.id}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{contract.crop}</h3>
                  <p className="text-sm text-slate-500">
                    {contract.quantity} {contract.unit} @ ₹{contract.strike_price}/{contract.unit}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(contract.status)}`}>
                  {contract.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <i className="fa-solid fa-calendar text-slate-400"></i>
                  <span>{contract.deliverywindow || 'No delivery window'}</span>
                </div>
                <div className="text-slate-400">
                  {new Date(contract.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
