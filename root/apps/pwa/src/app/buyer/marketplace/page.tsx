'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, TrendingDown, Package, MapPin, Calendar, Shield, Star, AlertCircle } from 'lucide-react';

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
  status: string;
  hedgeType: string;
  premium: number;
  location?: string;
}

const COMMODITIES = ['All', 'Wheat', 'Rice', 'Groundnut', 'Soybean', 'Cotton', 'Maize'];

export default function BuyerMarketplace() {
  const router = useRouter();
  const [contracts, setContracts] = useState<HedgeContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFPOOnly, setShowFPOOnly] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await fetch('/api/hedge/contracts?status=open');
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      } else {
        // Sample data
        setContracts([
          {
            id: '1',
            farmerId: 'f1',
            farmerName: 'Rajesh Kumar',
            fpoId: 'fpo-1',
            fpoName: 'Gujarat Groundnut FPO',
            commodity: 'Groundnut',
            quantity: 50,
            strikePrice: 5200,
            currentMarketPrice: 4800,
            contractDate: '2025-01-15',
            expiryDate: '2025-04-15',
            status: 'open',
            hedgeType: 'price_floor',
            premium: 150,
            location: 'Gujarat'
          },
          {
            id: '2',
            farmerId: 'f2',
            farmerName: 'Suresh Patel',
            commodity: 'Soybean',
            quantity: 100,
            strikePrice: 4500,
            currentMarketPrice: 4200,
            contractDate: '2025-01-20',
            expiryDate: '2025-05-20',
            status: 'open',
            hedgeType: 'fixed_price',
            premium: 200,
            location: 'Madhya Pradesh'
          },
          {
            id: '3',
            farmerId: 'f3',
            farmerName: 'Vikram Singh',
            fpoId: 'fpo-2',
            fpoName: 'Punjab Wheat Cooperative',
            commodity: 'Wheat',
            quantity: 200,
            strikePrice: 2400,
            currentMarketPrice: 2350,
            contractDate: '2025-01-10',
            expiryDate: '2025-03-30',
            status: 'open',
            hedgeType: 'price_floor',
            premium: 100,
            location: 'Punjab'
          },
          {
            id: '4',
            farmerId: 'f4',
            farmerName: 'Amit Deshmukh',
            fpoId: 'fpo-3',
            fpoName: 'Maharashtra Cotton Producers',
            commodity: 'Cotton',
            quantity: 80,
            strikePrice: 6800,
            currentMarketPrice: 6500,
            contractDate: '2025-01-18',
            expiryDate: '2025-06-18',
            status: 'open',
            hedgeType: 'price_ceiling',
            premium: 170,
            location: 'Maharashtra'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (selectedCommodity !== 'All' && c.commodity !== selectedCommodity) return false;
    if (showFPOOnly && !c.fpoId) return false;
    if (c.strikePrice < priceRange[0] || c.strikePrice > priceRange[1]) return false;
    if (searchTerm && !c.commodity.toLowerCase().includes(searchTerm.toLowerCase()) 
        && !c.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleMatchContract = async (contractId: string) => {
    try {
      const response = await fetch('/api/hedge/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId })
      });

      if (response.ok) {
        alert('Match request sent! Farmer will be notified.');
        loadContracts();
      } else {
        alert('Failed to send match request. Please try again.');
      }
    } catch (error) {
      console.error('Error matching contract:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => router.push('/')}
            className="mb-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">🏪 Buyer Marketplace</h1>
          <p className="text-blue-100">Browse and match farmer hedge contracts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by commodity or farmer..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>

            {/* Commodity Filter */}
            <div>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition"
              >
                {COMMODITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* FPO Filter */}
            <div>
              <button
                onClick={() => setShowFPOOnly(!showFPOOnly)}
                className={`w-full px-4 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  showFPOOnly
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                FPO Verified Only
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Available Contracts</p>
            <p className="text-2xl font-bold text-gray-900">{filteredContracts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredContracts.reduce((sum, c) => sum + c.quantity, 0)} Q
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Avg. Price</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{Math.round(filteredContracts.reduce((sum, c) => sum + c.strikePrice, 0) / filteredContracts.length || 0)}
            </p>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map(contract => (
            <div 
              key={contract.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden group"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{contract.commodity}</h3>
                  {contract.fpoId && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                      <Shield className="w-3 h-3" />
                      FPO
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600">{contract.quantity} quintals</p>
              </div>

              {/* Farmer Info */}
              <div className="p-4 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-900 mb-1">{contract.farmerName}</p>
                {contract.fpoName && (
                  <p className="text-xs text-blue-600 mb-1">via {contract.fpoName}</p>
                )}
                {contract.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {contract.location}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Strike Price</p>
                    <p className="font-bold text-green-600">₹{contract.strikePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Market Price</p>
                    <p className="font-semibold text-gray-700">₹{contract.currentMarketPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-semibold mb-1">Potential Savings</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{((contract.strikePrice - contract.currentMarketPrice) * contract.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    vs current market price
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires: {new Date(contract.expiryDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Match Button */}
                <button
                  onClick={() => handleMatchContract(contract.id)}
                  className="w-full mt-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md group-hover:shadow-lg"
                >
                  Match Contract →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No contracts found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">How Matching Works</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✅ <strong>Send Match Request:</strong> Express interest in a contract</li>
                <li>✅ <strong>Farmer Approval:</strong> Farmer reviews and accepts your match</li>
                <li>✅ <strong>Contract Binding:</strong> Once matched, terms are locked</li>
                <li>✅ <strong>Settlement:</strong> Delivery and payment on expiry date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
