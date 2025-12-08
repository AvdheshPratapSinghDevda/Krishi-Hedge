'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  IndianRupee,
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface PortfolioStats {
  totalInvestment: number;
  currentValue: number;
  totalProfitLoss: number;
  profitLossPercent: number;
  activeContracts: number;
  completedContracts: number;
  hedgedQuantity: number;
  averageStrikePrice: number;
}

interface ContractBreakdown {
  crop: string;
  quantity: number;
  value: number;
  percentage: number;
  profitLoss: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvestment: 250000,
    currentValue: 287500,
    totalProfitLoss: 37500,
    profitLossPercent: 15,
    activeContracts: 5,
    completedContracts: 12,
    hedgedQuantity: 150,
    averageStrikePrice: 4250
  });

  const [breakdown, setBreakdown] = useState<ContractBreakdown[]>([
    { crop: 'Soybean', quantity: 60, value: 150000, percentage: 52, profitLoss: 22500 },
    { crop: 'Mustard', quantity: 45, value: 90000, percentage: 31, profitLoss: 10000 },
    { crop: 'Groundnut', quantity: 30, value: 37500, percentage: 13, profitLoss: 3750 },
    { crop: 'Sunflower', quantity: 15, value: 10000, percentage: 4, profitLoss: 1250 }
  ]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/50">
      {/* Header */}
      <header className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-gray-900 px-6 pt-6 pb-20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => router.push('/')} 
              className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/40 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm">My Portfolio</h1>
              <p className="text-sm text-gray-800 opacity-90">Track your investments & performance</p>
            </div>
          </div>

          {/* Total Portfolio Value Card */}
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 border-2 border-amber-300/50 shadow-2xl">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total Portfolio Value
            </p>
            <div className="flex items-end gap-2 mb-3">
              <h2 className="text-5xl font-bold text-gray-900">
                ₹{stats.currentValue.toLocaleString('en-IN')}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 pt-3 border-t border-gray-800/20">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                stats.totalProfitLoss >= 0 
                  ? 'bg-green-500/20 text-green-900' 
                  : 'bg-red-500/20 text-red-900'
              }`}>
                {stats.totalProfitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-lg">
                  {stats.totalProfitLoss >= 0 ? '+' : ''}₹{Math.abs(stats.totalProfitLoss).toLocaleString('en-IN')}
                </span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                stats.profitLossPercent >= 0 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {stats.profitLossPercent >= 0 ? '+' : ''}{stats.profitLossPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 -mt-12 relative z-20 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Active</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
            <p className="text-xs text-gray-500 mt-1">contracts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Completed</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedContracts}</p>
            <p className="text-xs text-gray-500 mt-1">contracts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Hedged Qty</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.hedgedQuantity}</p>
            <p className="text-xs text-gray-500 mt-1">quintals</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Avg Price</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.averageStrikePrice}</p>
            <p className="text-xs text-gray-500 mt-1">per quintal</p>
          </div>
        </div>

        {/* Crop-wise Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Crop-wise Distribution</h3>
          </div>

          <div className="space-y-4">
            {breakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-seedling text-green-700"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.crop}</p>
                      <p className="text-xs text-gray-500">{item.quantity} quintals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{item.value.toLocaleString('en-IN')}</p>
                    <p className={`text-xs font-semibold ${item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.profitLoss >= 0 ? '+' : ''}₹{Math.abs(item.profitLoss).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">{item.percentage}% of portfolio</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Overview */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Investment Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-sm text-blue-100">Initial Investment</span>
                <span className="text-lg font-bold">₹{stats.totalInvestment.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-sm text-blue-100">Current Value</span>
                <span className="text-lg font-bold">₹{stats.currentValue.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">Absolute Returns</span>
                <div className="flex items-center gap-2">
                  {stats.totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                  <span className="text-lg font-bold">
                    {stats.totalProfitLoss >= 0 ? '+' : ''}₹{Math.abs(stats.totalProfitLoss).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">Performance Insights</h3>
          </div>
          
          <ul className="space-y-2.5 text-sm text-emerald-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2" />
              <span>Your portfolio is well-diversified across {breakdown.length} different crops</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2" />
              <span>Average return of {stats.profitLossPercent.toFixed(1)}% outperforms market by 3.2%</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2" />
              <span>You've successfully hedged {stats.hedgedQuantity} quintals against price volatility</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2" />
              <span>{stats.completedContracts} completed contracts show strong execution track record</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => router.push('/contracts')}
            className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:shadow-xl"
          >
            <CheckCircle2 className="w-5 h-5" />
            View Contracts
          </button>
          
          <button 
            onClick={() => router.push('/contracts/new')}
            className="bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 p-4 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:shadow-xl border-2 border-amber-300"
          >
            <Target className="w-5 h-5" />
            New Contract
          </button>
        </div>
      </div>
    </div>
  );
}
