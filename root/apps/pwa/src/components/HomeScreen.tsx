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
  const [name, setName] = useState("User");
  const [forecast, setForecast] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalValue: 0,
    activeContracts: 0,
    profitLoss: 0,
    profitLossPercent: 0
  });

  // Sliding images data
  const slidingImages = [
    {
      url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop",
      title: "Protect Your Harvest",
      subtitle: "Smart hedging for farmers"
    },
    {
      url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop",
      title: "Market Intelligence",
      subtitle: "AI-powered price forecasts"
    },
    {
      url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop",
      title: "Secure Contracts",
      subtitle: "Guaranteed buyer network"
    },
    {
      url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop",
      title: "Grow With Confidence",
      subtitle: "Risk-free agriculture"
    }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load from localStorage first (instant)
      const storedProfile = window.localStorage.getItem("kh_profile");
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          const displayName = profile.fullName || profile.businessName || profile.name || 'User';
          setName(displayName);
        } catch (e) {
          console.error('Failed to parse profile:', e);
        }
      }
      
      // Then load from database for fresh data
      const userId = window.localStorage.getItem("kh_user_id");
      if (userId) {
        const loadProfile = async () => {
          try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('full_name, business_name, user_type')
              .eq('id', userId)
              .single();
            
            if (!error && profileData) {
              const displayName = profileData.full_name || profileData.business_name || 'User';
              setName(displayName);
              
              // Update localStorage
              const updatedProfile = {
                fullName: profileData.full_name,
                businessName: profileData.business_name,
                userType: profileData.user_type
              };
              window.localStorage.setItem("kh_profile", JSON.stringify(updatedProfile));
            }
          } catch (err) {
            console.error('Failed to load profile:', err);
          }
        };
        
        loadProfile();
      }
    }
  }, [router]);

  // Auto-slide images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slidingImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slidingImages.length]);

  useEffect(() => {
    // Fetch Forecast & Market Price
    fetch('/api/forecast')
      .then(res => res.json())
      .then(data => setForecast(data))
      .catch(console.error);

    // Fetch Recent Contracts for this farmer
    if (typeof window !== 'undefined') {
      const userId = window.localStorage.getItem("kh_user_id");
      if (userId) {
        fetch(`/api/contracts?role=farmer&userId=${userId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setContracts(data.slice(0, 2)); // Show top 2
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/50">
      <NotificationPrompt />
      
      {/* Premium Header with Gold Accents */}
      <header className="bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800 text-white px-6 pt-6 pb-16 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-300/10 to-yellow-400/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl border-2 border-amber-300/50">
                <i className="fa-solid fa-wheat-awn text-2xl text-emerald-900"></i>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">Krishi Hedge</span>
                <p className="text-xs text-emerald-100">Agricultural Risk Management</p>
              </div>
            </div>
            <NotificationBell />
          </div>
          
          <div className="space-y-1 mb-6">
            <p className="text-sm text-amber-200 font-medium">{getTimeGreeting()},</p>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent drop-shadow-sm">{name}</h1>
          </div>

          {/* Sliding Image Carousel */}
          <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/30">
            {slidingImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentImageIndex 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{image.title}</h3>
                  <p className="text-sm text-amber-200 font-medium">{image.subtitle}</p>
                </div>
              </div>
            ))}
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {slidingImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-amber-400 w-6' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Proper Spacing */}
      <div className="px-5 mt-6 space-y-4">
        {/* 4 Navigation Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* DEMO GAME Button */}
          <button 
            onClick={() => router.push('/sandbox')} 
            className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white p-4 rounded-2xl shadow-lg font-bold text-left flex flex-col justify-between h-32 active:scale-95 transition-all group hover:shadow-purple-500/30 border border-purple-400/30"
          >
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-gamepad text-lg"></i>
            </div>
            <div>
              <span className="text-sm font-bold block mb-1 drop-shadow-sm">DEMO GAME</span>
              <span className="text-xs text-purple-100 opacity-90">Practice risk-free trading</span>
            </div>
          </button>
          
          {/* PORTFOLIO Button */}
          <button 
            onClick={() => router.push('/portfolio')} 
            className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-gray-900 p-4 rounded-2xl shadow-lg font-bold text-left flex flex-col justify-between h-32 active:scale-95 transition-all group hover:shadow-amber-500/30 border-2 border-amber-300/50"
          >
            <div className="w-9 h-9 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <span className="text-sm font-bold block mb-1 drop-shadow-sm">PORTFOLIO</span>
              <span className="text-xs text-gray-800 opacity-90">View your holdings</span>
            </div>
          </button>
          
          {/* CONTRACTS Button */}
          <button 
            onClick={() => router.push('/contracts')} 
            className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white p-4 rounded-2xl shadow-lg font-bold text-left flex flex-col justify-between h-32 active:scale-95 transition-all group hover:shadow-emerald-500/30 border border-emerald-400/30"
          >
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold block mb-1 drop-shadow-sm">CONTRACTS</span>
              <span className="text-xs text-emerald-100 opacity-90">Manage agreements</span>
            </div>
          </button>
          
          {/* MARKET Button */}
          <button 
            onClick={() => router.push('/market')} 
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-lg font-bold text-left flex flex-col justify-between h-32 active:scale-95 transition-all group hover:shadow-blue-500/30 border border-blue-400/30"
          >
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold block mb-1 drop-shadow-sm">MARKET</span>
              <span className="text-xs text-blue-100 opacity-90">Oilseed forecasting</span>
            </div>
          </button>
        </div>
        
        {/* Portfolio Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Portfolio Overview
            </h3>
            <button onClick={() => router.push('/portfolio')} className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
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
      </div>
    </div>
  );
}
