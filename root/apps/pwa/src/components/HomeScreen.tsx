'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "./NotificationBell";
import NotificationPrompt from "./NotificationPrompt";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sparkles, 
  FileText, 
  Target,
  BarChart3,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface MarketStats {
  totalValue: number;
  activeContracts: number;
  profitLoss: number;
  profitLossPercent: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [name, setName] = useState("Farmer");
  const [forecast, setForecast] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalValue: 0,
    activeContracts: 0,
    profitLoss: 0,
    profitLossPercent: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const phone = window.localStorage.getItem("kh_phone");
      if (!phone) {
        router.replace('/splash');
      }
      
      const userId = window.localStorage.getItem("kh_user_id");
      if (userId) {
        fetch(`/api/profile?userId=${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data.name) {
              setName(data.name);
              const existingProfile = window.localStorage.getItem("kh_profile");
              if (existingProfile) {
                const parsed = JSON.parse(existingProfile);
                const updated = { ...parsed, name: data.name, location: data.location, crops: data.crops };
                window.localStorage.setItem("kh_profile", JSON.stringify(updated));
              }
            }
          })
          .catch(err => {
            console.error('Failed to load profile from DB:', err);
            const profile = window.localStorage.getItem("kh_profile");
            if (profile) {
              try {
                const p = JSON.parse(profile);
                if (p.name) setName(p.name);
              } catch (e) {}
            }
          });
      } else {
        const profile = window.localStorage.getItem("kh_profile");
        if (profile) {
          try {
            const p = JSON.parse(profile);
            if (p.name) setName(p.name);
          } catch (e) {}
        }
      }
    }
  }, [router]);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      fetch('/api/forecast').then(res => res.json()),
      typeof window !== 'undefined' && window.localStorage.getItem("kh_user_id")
        ? fetch(`/api/contracts?role=farmer&userId=${window.localStorage.getItem("kh_user_id")}`).then(res => res.json())
        : Promise.resolve([])
    ])
      .then(([forecastData, contractsData]) => {
        setForecast(forecastData);
        const allContracts = Array.isArray(contractsData) ? contractsData : [];
        setContracts(allContracts.slice(0, 3));
        
        // Calculate stats
        const totalValue = allContracts.reduce((sum: number, c: any) => sum + (c.strikePrice * c.quantity || 0), 0);
        const activeCount = allContracts.filter((c: any) => c.status === 'CREATED' || c.status === 'MATCHED').length;
        const profitLoss = allContracts.reduce((sum: number, c: any) => sum + (c.profitLoss || 0), 0);
        const profitLossPercent = totalValue > 0 ? (profitLoss / totalValue) * 100 : 0;
        
        setMarketStats({
          totalValue,
          activeContracts: activeCount,
          profitLoss,
          profitLossPercent
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
      <NotificationPrompt />
      
      {/* Premium Header */}
      <header className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white px-6 pt-6 pb-32 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-wheat-awn text-xl text-green-900"></i>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight">Krishi Hedge</span>
                <p className="text-xs text-green-100">Agricultural Risk Management</p>
              </div>
            </div>
            <NotificationBell />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-green-100 font-medium">{getTimeGreeting()},</p>
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          </div>
        </div>
      </header>

      {/* Stats Cards - Overlapping Header */}
      <div className="px-5 -mt-24 relative z-20 space-y-4">
        
        {/* Portfolio Overview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio Overview
            </h3>
            <button onClick={() => router.push('/contracts')} className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
              View All
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{marketStats.totalValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Active Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{marketStats.activeContracts}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Net P&L</span>
              <div className="flex items-center gap-2">
                {marketStats.profitLoss >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-bold ${marketStats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketStats.profitLoss >= 0 ? '+' : ''}₹{Math.abs(marketStats.profitLoss).toLocaleString('en-IN')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${marketStats.profitLoss >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {marketStats.profitLossPercent >= 0 ? '+' : ''}{marketStats.profitLossPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Market Price */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full -mr-16 -mt-16" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {forecast?.crop || 'Soybean'} • Indore Mandi
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live Price
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-sm ${
                forecast?.trend === 'down' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {forecast?.trend === 'down' ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                {forecast?.change || '0'}%
              </div>
            </div>
            
            <div className="flex items-end gap-2 mb-2">
              <h2 className="text-4xl font-bold text-gray-900">
                ₹{forecast?.currentPrice?.toLocaleString('en-IN') || '...'}
              </h2>
              <span className="text-sm text-gray-400 font-medium mb-1.5">/quintal</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Today's High: ₹{((forecast?.currentPrice || 0) * 1.02).toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>Low: ₹{((forecast?.currentPrice || 0) * 0.98).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* AI Prediction Card */}
        <div 
          onClick={() => router.push('/forecast')} 
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-5 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">AI Price Forecast</h3>
                <p className="text-xs text-blue-100">30-Day Prediction Model</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
              <p className="text-sm mb-2">Expected Price Movement</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-3xl font-bold">₹{forecast?.predictedPrice?.toLocaleString('en-IN') || '...'}</span>
                <span className="text-sm mb-1.5 text-blue-100">/qtl</span>
              </div>
              <p className="text-xs text-blue-100">
                {forecast?.trend === 'down' ? '↓ Bearish' : '↑ Bullish'} trend detected
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-blue-100">Model Confidence</span>
                <span className="font-bold">{forecast?.confidence || 85}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${forecast?.confidence || 85}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 px-1 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/contracts/new')} 
              className="bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 p-5 rounded-2xl shadow-lg font-bold text-left flex flex-col justify-between h-32 active:scale-95 transition-transform group hover:shadow-xl"
            >
              <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold block">Create Contract</span>
                <span className="text-xs text-gray-700 opacity-80">Forward hedge</span>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/sandbox')} 
              className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900 p-5 rounded-2xl shadow-md border border-purple-300/50 font-bold text-left flex flex-col justify-between h-32 active:scale-95 transition-transform group hover:shadow-lg"
            >
              <div className="w-10 h-10 bg-purple-300/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-gamepad text-lg"></i>
              </div>
              <div>
                <span className="text-sm font-bold block">Practice Mode</span>
                <span className="text-xs text-purple-700 opacity-80">Risk-free trading</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Contracts */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Contracts
            </h3>
            {contracts.length > 0 && (
              <button onClick={() => router.push('/contracts')} className="text-xs font-medium text-green-600 hover:text-green-700">
                View All
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No Active Contracts</p>
              <p className="text-xs text-gray-500 mb-4">Start hedging your crops to protect against price volatility</p>
              <button 
                onClick={() => router.push('/contracts/new')}
                className="text-xs font-semibold text-green-600 hover:text-green-700 px-4 py-2 bg-green-50 rounded-lg inline-flex items-center gap-1"
              >
                Create First Contract
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => router.push(`/contracts/${c.id}`)} 
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-base">{c.quantity} Qtl {c.crop}</h4>
                        {c.status === 'MATCHED' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : c.status === 'CREATED' ? (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Exp: {c.deliveryWindow}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === 'MATCHED' 
                            ? 'bg-green-100 text-green-700' 
                            : c.status === 'CREATED'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {c.status === 'CREATED' ? 'PENDING' : c.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <IndianRupee className="w-4 h-4 text-gray-600" />
                        <span className="text-lg font-bold text-gray-900">
                          {c.strikePrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">/qtl</span>
                    </div>
                  </div>
                  
                  {c.profitLoss !== undefined && c.profitLoss !== 0 && (
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      c.profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <span className="text-xs font-medium text-gray-600">Current P&L</span>
                      <span className={`text-sm font-bold ${
                        c.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {c.profitLoss >= 0 ? '+' : ''}₹{c.profitLoss?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Market Insights */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">Market Insights</h3>
          </div>
          <ul className="space-y-2 text-xs text-emerald-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
              <span>Market volatility is {forecast?.trend === 'down' ? 'high' : 'moderate'} - consider hedging positions</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
              <span>Monsoon forecast indicates {forecast?.trend === 'up' ? 'favorable' : 'challenging'} conditions</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
              <span>Global commodity prices trending {forecast?.trend === 'up' ? 'upward' : 'downward'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
