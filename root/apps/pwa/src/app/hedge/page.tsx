'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, Package, IndianRupee, Shield, ArrowRight, Star, CheckCircle } from 'lucide-react';

interface HedgeContract {
  id: string;
  farmerId: string;
  farmerName: string;
  fpoId?: string;
  fpoName?: string;
  commodity: string;
  quantity: number;
  strikePrice: number;
  currentMarketPrice: number;
  contractDate: string;
  expiryDate: string;
  status: 'open' | 'matched' | 'executed' | 'expired';
  hedgeType: 'price_floor' | 'price_ceiling' | 'fixed_price';
  premium: number;
  potentialBuyers: number;
}

export default function RealHedgingMarketplace() {
  const router = useRouter();
  const [userType, setUserType] = useState<'farmer' | 'buyer' | 'fpo' | null>(null);
  const [contracts, setContracts] = useState<HedgeContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'my_contracts'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('kh_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        setUserType(parsed.userType || 'farmer');
      }
    }
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      // Real API call to fetch hedge contracts
      const response = await fetch('/api/hedge/contracts');
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      } else {
        // API failed – do not inject demo hedge contracts.
        setContracts([]);
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHedgeTypeLabel = (type: string) => {
    switch (type) {
      case 'price_floor': return 'Price Floor Protection';
      case 'price_ceiling': return 'Price Ceiling Lock';
      case 'fixed_price': return 'Fixed Price Contract';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-300';
      case 'matched': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'executed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'open') return c.status === 'open';
    // Add user-specific filtering
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              ← Back
            </button>
            {userType === 'farmer' && (
              <button
                onClick={() => router.push('/hedge/create')}
                className="px-4 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition shadow"
              >
                + Create Hedge
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">Hedge Marketplace</h1>
          <p className="text-green-100 mb-4">
            {userType === 'farmer' && 'Protect your crop prices with futures contracts'}
            {userType === 'buyer' && 'Browse and match with farmer hedge contracts'}
            {userType === 'fpo' && 'Manage farmer hedges and connect buyers'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-xs">Active Hedges</span>
              </div>
              <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'open').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs">Total Value</span>
              </div>
              <p className="text-2xl font-bold">
                ₹{(contracts.reduce((sum, c) => sum + (c.strikePrice * c.quantity), 0) / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Participants</span>
              </div>
              <p className="text-2xl font-bold">{contracts.reduce((sum, c) => sum + c.potentialBuyers, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'all' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Contracts
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'open' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Open for Matching
          </button>
          {userType !== 'buyer' && (
            <button
              onClick={() => setFilter('my_contracts')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === 'my_contracts' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              My Contracts
            </button>
          )}
        </div>

        {/* Contracts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map(contract => (
            <div 
              key={contract.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden group cursor-pointer"
              onClick={() => router.push(`/hedge/contract/${contract.id}`)}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{contract.commodity}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(contract.status)}`}>
                    {contract.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{getHedgeTypeLabel(contract.hedgeType)}</p>
              </div>

              {/* Farmer/FPO Info */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{contract.farmerName}</p>
                    {contract.fpoName && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        {contract.fpoName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="font-bold text-gray-900">{contract.quantity} quintals</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Strike Price</p>
                    <p className="font-bold text-green-600">₹{contract.strikePrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Market Price</p>
                    <p className="font-semibold text-gray-700">₹{contract.currentMarketPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Premium</p>
                    <p className="font-semibold text-orange-600">₹{contract.premium}/quintal</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Expires: {new Date(contract.expiryDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {contract.potentialBuyers} interested
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full mt-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md group-hover:shadow-lg flex items-center justify-center gap-2">
                  {userType === 'buyer' && 'Match Contract'}
                  {userType === 'farmer' && 'View Details'}
                  {userType === 'fpo' && 'Manage Contract'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No contracts found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'open' 
                ? 'No open hedge contracts available at the moment' 
                : 'Start by creating your first hedge contract'}
            </p>
            {userType === 'farmer' && (
              <button
                onClick={() => router.push('/hedge/create')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg"
              >
                Create Hedge Contract
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">What is a Hedge Contract?</h4>
              <p className="text-sm text-gray-700 mb-3">
                A hedge contract protects farmers from price volatility. Lock in a minimum price today, and if market prices fall, you're protected. If prices rise, you benefit from the upside!
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Price Floor:</strong> Guaranteed minimum price</li>
                <li><strong>Premium:</strong> Small upfront cost for protection</li>
                <li><strong>FPO Backed:</strong> Verified through producer organizations</li>
                <li><strong>Buyer Network:</strong> Connect with verified commodity buyers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
