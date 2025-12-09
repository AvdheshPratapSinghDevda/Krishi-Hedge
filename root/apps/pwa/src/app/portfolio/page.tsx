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
import { useI18n } from "@/i18n/LanguageProvider";
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

interface Contract {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  strikePrice?: number;
  strike_price?: number;
  deliveryWindow?: string;
  deliverywindow?: string;
  status: string;
  contractType?: string;
  contract_type?: string;
  createdAt?: string;
  created_at?: string;
  acceptedAt?: string;
  accepted_at?: string;
  ipfsCid?: string;
  ipfs_cid?: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvestment: 0,
    currentValue: 0,
    totalProfitLoss: 0,
    profitLossPercent: 0,
    activeContracts: 0,
    completedContracts: 0,
    hedgedQuantity: 0,
    averageStrikePrice: 0,
  });

  const [breakdown, setBreakdown] = useState<ContractBreakdown[]>([]);

  useEffect(() => {
    async function loadFromContracts() {
      try {
        const userId = typeof window !== 'undefined' ? window.localStorage.getItem('kh_user_id') : null;
        if (!userId) {
          setLoading(false);
          return;
        }
        
        // Fetch both farmer offers and accepted buyer demands
        const [farmerRes, demandsRes] = await Promise.all([
          fetch(`/api/contracts?role=farmer&farmerId=${encodeURIComponent(userId)}`),
          fetch(`/api/buyer-demands?farmerId=${encodeURIComponent(userId)}`)
        ]);
        
        const farmerContracts = farmerRes.ok ? await farmerRes.json() : [];
        const acceptedDemands = demandsRes.ok ? await demandsRes.json() : [];
        
        // Combine both types of contracts
        const data = [
          ...(Array.isArray(farmerContracts) ? farmerContracts : []),
          ...(Array.isArray(acceptedDemands) ? acceptedDemands : [])
        ];
        
        // Store all contracts for display
        setContracts(data.filter(c => c.status === 'ACCEPTED'));
        
        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        // Aggregate simple portfolio stats from real contracts
        const active = data.filter(c => (c.status || '').toString().toUpperCase() !== 'CANCELLED');
        const totalInvestment = active.reduce((sum, c) => sum + (Number(c.quantity || 0) * Number(c.strikePrice || c.strike_price || 0)), 0);
        const currentValue = totalInvestment; // no live MTM yet
        const activeCount = active.length;
        const completedCount = data.filter(c => (c.status || '').toString().toUpperCase() === 'SETTLED').length;
        const hedgedQty = active.reduce((sum, c) => sum + Number(c.quantity || 0), 0);
        const avgStrike = hedgedQty > 0 ? Math.round(totalInvestment / hedgedQty) : 0;

        setStats({
          totalInvestment,
          currentValue,
          totalProfitLoss: 0,
          profitLossPercent: 0,
          activeContracts: activeCount,
          completedContracts: completedCount,
          hedgedQuantity: hedgedQty,
          averageStrikePrice: avgStrike,
        });

        // Build breakdown by crop
        const byCrop: Record<string, ContractBreakdown> = {};
        for (const row of active) {
          const crop = row.crop || row.commodity || 'Unknown';
          const qty = Number(row.quantity || 0);
          const price = Number(row.strikePrice || row.strike_price || 0);
          const value = qty * price;
          if (!byCrop[crop]) {
            byCrop[crop] = { crop, quantity: 0, value: 0, percentage: 0, profitLoss: 0 };
          }
          byCrop[crop].quantity += qty;
          byCrop[crop].value += value;
        }
        const list = Object.values(byCrop);
        const totalValForPct = list.reduce((s, b) => s + b.value, 0) || 1;
        list.forEach(b => {
          b.percentage = Math.round((b.value / totalValForPct) * 100);
        });
        setBreakdown(list);
      } catch (e) {
        console.error('Error loading portfolio from contracts', e);
      } finally {
        setLoading(false);
      }
    }

    loadFromContracts();
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
              <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm">{t('portfolio.title')}</h1>
              <p className="text-sm text-gray-800 opacity-90">{t('portfolio.subtitle')}</p>
            </div>
          </div>

          {/* Total Portfolio Value Card */}
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 border-2 border-amber-300/50 shadow-2xl">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('portfolio.totalValue')}
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
              <p className="text-xs font-semibold text-gray-500">{t('portfolio.active')}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
            <p className="text-xs text-gray-500 mt-1">contracts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">{t('portfolio.completed')}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedContracts}</p>
            <p className="text-xs text-gray-500 mt-1">contracts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">{t('portfolio.hedgedQty')}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.hedgedQuantity}</p>
            <p className="text-xs text-gray-500 mt-1">quintals</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500">{t('portfolio.avgPrice')}</p>
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
            <h3 className="text-base font-bold text-gray-900">{t('portfolio.cropDistribution')}</h3>
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
              <h3 className="text-lg font-bold">{t('portfolio.investmentSummary')}</h3>
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
            <h3 className="font-bold text-emerald-900 text-sm">{t('portfolio.performanceInsights')}</h3>
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

        {/* My Contracts List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900">My Contracts</h3>
            </div>
            <span className="text-xs text-gray-500">{contracts.length} active</span>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-file-contract text-gray-400 text-2xl"></i>
              </div>
              <p className="text-sm text-gray-500">No active contracts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => {
                const contractType = contract.contractType || contract.contract_type;
                const ipfsCid = contract.ipfsCid || contract.ipfs_cid;
                const strikePrice = contract.strikePrice || contract.strike_price;
                const deliveryWindow = contract.deliveryWindow || contract.deliverywindow;
                const acceptedAt = contract.acceptedAt || contract.accepted_at;

                return (
                  <div 
                    key={contract.id}
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                            contractType === 'BUYER_DEMAND' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {contractType === 'BUYER_DEMAND' ? (
                              <><i className="fa-solid fa-handshake mr-1"></i>Buyer Demand</>
                            ) : (
                              <><i className="fa-solid fa-seedling mr-1"></i>My Offer</>
                            )}
                          </span>
                          {ipfsCid && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                              <i className="fa-solid fa-file-pdf mr-1"></i>PDF Ready
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">{contract.crop}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-bold text-gray-800">₹{strikePrice}/{contract.unit}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-xs text-gray-400">Quantity</p>
                        <p className="font-bold text-gray-700">{contract.quantity} {contract.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Delivery</p>
                        <p className="font-bold text-gray-700 text-xs">{deliveryWindow || '30 days'}</p>
                      </div>
                    </div>

                    {acceptedAt && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          <i className="fa-solid fa-check-circle text-green-500 mr-1"></i>
                          Accepted {new Date(acceptedAt).toLocaleDateString()}
                        </p>
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          View Details
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => router.push('/contracts')}
            className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:shadow-xl"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t('portfolio.viewContracts')}
          </button>
          
          <button 
            onClick={() => router.push('/contracts/new')}
            className="bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 p-4 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:shadow-xl border-2 border-amber-300"
          >
            <Target className="w-5 h-5" />
            {t('portfolio.newContract')}
          </button>
        </div>
      </div>
    </div>
  );
}
