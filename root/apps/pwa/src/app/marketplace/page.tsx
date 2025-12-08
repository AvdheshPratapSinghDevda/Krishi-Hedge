'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Users, TrendingUp, CheckCircle, Search, Filter } from 'lucide-react';

interface FPO {
  id: string;
  fpo_name: string;
  district: string;
  state: string;
  primary_crops: string[];
  total_members: number;
  is_verified: boolean;
  description: string;
  fpo_type: string;
}

interface CommodityListing {
  id: string;
  commodity_name: string;
  variety: string;
  available_quantity: number;
  unit: string;
  price_per_unit: number;
  fpo: {
    fpo_name: string;
    district: string;
    state: string;
  };
}

export default function MarketplacePage() {
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [listings, setListings] = useState<CommodityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fpos' | 'commodities'>('commodities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedState, selectedCrop]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fpos') {
        // Fetch FPOs
        let url = '/api/fpo?verified=true';
        if (selectedState) url += `&state=${selectedState}`;
        if (selectedCrop) url += `&crop=${selectedCrop}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setFpos(data.data || []);
        }
      } else {
        // Fetch commodity listings
        let url = '/api/fpo/listings?status=active';
        if (selectedCrop) url += `&commodity=${selectedCrop}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setListings(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFpos = fpos.filter(fpo =>
    fpo.fpo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fpo.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredListings = listings.filter(listing =>
    listing.commodity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.fpo.fpo_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const states = ['Gujarat', 'Madhya Pradesh', 'Telangana', 'Maharashtra', 'Punjab', 'Haryana', 'Rajasthan'];
  const crops = ['Groundnut', 'Soybean', 'Wheat', 'Rice', 'Cotton', 'Mustard', 'Chickpea'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-7 h-7" />
                FPO Marketplace
              </h1>
              <p className="text-emerald-100 text-sm mt-1">Connect with Farmer Producer Organizations</p>
            </div>
            <Link
              href="/profile"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Back
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'fpos' ? 'Search FPOs...' : 'Search commodities...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setActiveTab('commodities')}
            className={`flex-1 py-4 font-semibold text-sm transition ${
              activeTab === 'commodities'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🌾 Buy Commodities ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('fpos')}
            className={`flex-1 py-4 font-semibold text-sm transition ${
              activeTab === 'fpos'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏢 Join FPO ({fpos.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Crops</option>
            {crops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>

          {(selectedState || selectedCrop) && (
            <button
              onClick={() => {
                setSelectedState('');
                setSelectedCrop('');
              }}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : activeTab === 'commodities' ? (
          // Commodity Listings
          <div className="space-y-4">
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Commodities Available</h3>
                <p className="text-gray-600 text-sm">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/commodity/${listing.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{listing.commodity_name}</h3>
                      {listing.variety && (
                        <p className="text-sm text-gray-600">Variety: {listing.variety}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">₹{listing.price_per_unit}</p>
                      <p className="text-xs text-gray-500">per {listing.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{listing.fpo.fpo_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.fpo.district}, {listing.fpo.state}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">{listing.available_quantity}</span> {listing.unit} available
                    </span>
                    <span className="text-emerald-600 text-sm font-semibold hover:underline">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          // FPO Listings
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFpos.length === 0 ? (
              <div className="col-span-2 bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No FPOs Found</h3>
                <p className="text-gray-600 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredFpos.map((fpo) => (
                <Link
                  key={fpo.id}
                  href={`/marketplace/fpo/${fpo.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {fpo.fpo_name}
                        {fpo.is_verified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{fpo.fpo_type}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{fpo.district}, {fpo.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{fpo.total_members} active members</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Primary Crops</p>
                    <div className="flex flex-wrap gap-2">
                      {fpo.primary_crops.slice(0, 3).map((crop, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium"
                        >
                          {crop}
                        </span>
                      ))}
                      {fpo.primary_crops.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{fpo.primary_crops.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{fpo.description}</p>

                  <div className="pt-4 border-t">
                    <span className="text-emerald-600 text-sm font-semibold hover:underline">
                      View Details & Join →
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
