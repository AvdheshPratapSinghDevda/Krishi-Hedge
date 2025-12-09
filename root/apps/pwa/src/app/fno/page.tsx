'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, Shield, ArrowRight, RefreshCw } from 'lucide-react';

interface FuturesContract {
  id: string;
  commodity: string;
  contractMonth: string;
  strikePrice: number;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  expiry: string;
}

interface OptionContract {
  strikePrice: number;
  callPremium: number;
  putPremium: number;
  callOI: number;
  putOI: number;
}

export default function FnOMarketplace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'futures' | 'options'>('futures');
  const [selectedCommodity, setSelectedCommodity] = useState('soybean');
  const [futures, setFutures] = useState<FuturesContract[]>([]);
  const [options, setOptions] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(true);

  const commodities = [
    { id: 'soybean', name: 'Soybean' },
    { id: 'groundnut', name: 'Groundnut' },
    { id: 'mustard', name: 'Mustard' },
    { id: 'castor', name: 'Castor' }
  ];

  useEffect(() => {
    loadMarketData();
  }, [selectedCommodity, activeTab]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Real API call for F&O data
      const endpoint = activeTab === 'futures' 
        ? `/api/fno/futures?commodity=${selectedCommodity}`
        : `/api/fno/options?commodity=${selectedCommodity}`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'futures') {
          setFutures(data);
        } else {
          setOptions(data);
        }
      }
    } catch (error) {
      console.error('Failed to load F&O data:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = (contractId: string, type: 'buy' | 'sell') => {
    router.push(`/fno/order?contract=${contractId}&type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white px-6 py-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">F&O Trading</h1>
              <p className="text-sm text-blue-100">Futures & Options Marketplace</p>
            </div>
          </div>
          <button
            onClick={loadMarketData}
            className="bg-white/20 backdrop-blur-sm p-3 rounded-xl hover:bg-white/30 transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Live Market Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-xs text-emerald-100 mb-1">NCDEX</p>
            <p className="text-lg font-bold text-emerald-300">+2.4%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-xs text-blue-100 mb-1">Volume</p>
            <p className="text-lg font-bold">12.5K</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-xs text-blue-100 mb-1">OI</p>
            <p className="text-lg font-bold">45.2K</p>
          </div>
        </div>
      </header>

      {/* Commodity Selector */}
      <div className="px-5 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {commodities.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCommodity(c.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                selectedCommodity === c.id
                  ? 'bg-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Futures/Options Tabs */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('futures')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'futures'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Futures
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'options'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Options
          </button>
        </div>
      </div>

      {/* Market Data */}
      <div className="px-5 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full" />
          </div>
        ) : activeTab === 'futures' ? (
          <div className="space-y-3">
            {futures.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No futures contracts available</p>
              </div>
            ) : (
              futures.map(contract => (
                <div
                  key={contract.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{contract.commodity}</h3>
                      <p className="text-sm text-gray-600">{contract.contractMonth}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      contract.change >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {contract.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {contract.changePercent.toFixed(2)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Last Price</p>
                      <p className="text-lg font-bold text-gray-900">₹{contract.lastPrice}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Volume</p>
                      <p className="text-sm font-bold text-gray-900">{(contract.volume / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">OI</p>
                      <p className="text-sm font-bold text-gray-900">{(contract.openInterest / 1000).toFixed(1)}K</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => placeOrder(contract.id, 'buy')}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => placeOrder(contract.id, 'sell')}
                      className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-rose-700 active:scale-95 transition-all"
                    >
                      Sell
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      Expiry: {new Date(contract.expiry).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Options Chain
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-5 bg-gray-50 p-3 text-xs font-semibold text-gray-700 border-b border-gray-200">
              <div className="col-span-2 text-right pr-2">CALL</div>
              <div className="text-center">STRIKE</div>
              <div className="col-span-2 pl-2">PUT</div>
            </div>
            {options.length === 0 ? (
              <div className="text-center py-16">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No options contracts available</p>
              </div>
            ) : (
              options.map((opt, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 p-3 text-sm border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer"
                  onClick={() => router.push(`/fno/option?strike=${opt.strikePrice}`)}
                >
                  <div className="text-right font-semibold text-emerald-700">₹{opt.callPremium}</div>
                  <div className="text-right text-xs text-gray-500">{(opt.callOI / 1000).toFixed(1)}K</div>
                  <div className="text-center font-bold text-gray-900">₹{opt.strikePrice}</div>
                  <div className="text-xs text-gray-500">{(opt.putOI / 1000).toFixed(1)}K</div>
                  <div className="font-semibold text-rose-700">₹{opt.putPremium}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Educational Banner */}
      <div className="px-5 mt-6">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 mb-1">New to F&O Trading?</h4>
              <p className="text-sm text-amber-800 mb-3">Practice risk-free in our sandbox before trading real money</p>
              <button
                onClick={() => router.push('/sandbox/futures')}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-all inline-flex items-center gap-2"
              >
                Practice in Sandbox
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
