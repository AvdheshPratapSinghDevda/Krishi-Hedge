'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  FileText, Plus, Filter, Search, TrendingUp, TrendingDown,
  Calendar, Package, DollarSign, CheckCircle, Clock, XCircle,
  Eye, Edit3, ChevronRight, AlertCircle, BarChart3, Wallet
} from 'lucide-react';
import { useI18n } from "@/i18n/LanguageProvider";

// Contract interface - Supabase ready
interface Contract {
  id: string;
  contractNumber?: string;
  commodity: string;
  quantity: number;
  unit: string;
  strikePrice: number;
  currentPrice?: number;
  contractType: 'buy' | 'sell' | 'hedge';
  status: 'active' | 'pending' | 'completed' | 'expired' | 'cancelled';
  startDate: string;
  expiryDate: string;
  premium?: number;
  counterparty?: string;
  profitLoss?: number;
  createdAt: string;
  updatedAt?: string;
}

interface Stats {
  activeContracts: number;
  pendingReview: number;
  totalValue: number;
  profitLoss: number;
}

export default function ContractsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [stats, setStats] = useState<Stats>({
    activeContracts: 0,
    pendingReview: 0,
    totalValue: 0,
    profitLoss: 0
  });

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchQuery, statusFilter, commodityFilter]);

  const loadContracts = async () => {
    try {
      // Prefer real contracts from API (Supabase via /api/contracts)
      const userId = typeof window !== 'undefined' ? window.localStorage.getItem('kh_user_id') : null;

      if (userId) {
        const res = await fetch(`/api/contracts?role=farmer&userId=${encodeURIComponent(userId)}`);

        if (res.ok) {
          const apiData: any[] = await res.json();

          const mapped: Contract[] = apiData.map((row) => {
            // Map backend status to UI status buckets
            const rawStatus = (row.status || '').toString().toUpperCase();
            const statusMap: Record<string, Contract['status']> = {
              CREATED: 'pending',
              MATCHED_WITH_BUYER_DEMO: 'active',
              SETTLED: 'completed',
              CANCELLED: 'cancelled',
              EXPIRED: 'expired',
            };
            const uiStatus = statusMap[rawStatus] || 'pending';

            const createdAt: string = row.createdAt || row.created_at || new Date().toISOString();

            // Rough expiry: createdAt + 30 days or fallback to createdAt
            let expiryDate = createdAt;
            try {
              const base = new Date(createdAt);
              const deliveryWindow: string | undefined = row.deliveryWindow || row.deliverywindow;
              let days = 30;
              if (deliveryWindow) {
                const match = deliveryWindow.match(/(\d+)\s*Day/i);
                if (match) days = parseInt(match[1], 10);
              }
              base.setDate(base.getDate() + days);
              expiryDate = base.toISOString();
            } catch {
              // ignore, keep default expiryDate
            }

            return {
              id: row.id,
              contractNumber: row.id?.slice(0, 8) || undefined,
              commodity: row.crop || 'Oilseed',
              quantity: Number(row.quantity) || 0,
              unit: row.unit || 'quintals',
              strikePrice: Number(row.strikePrice ?? row.strike_price ?? 0),
              currentPrice: undefined, // could be wired to live price later
              contractType: 'hedge',
              status: uiStatus,
              startDate: createdAt,
              expiryDate,
              premium: undefined,
              counterparty: undefined,
              profitLoss: undefined,
              createdAt,
              updatedAt: row.updatedAt || row.updated_at || undefined,
            };
          });

          setContracts(mapped);
          calculateStats(mapped);
          setLoading(false);
          return;
        } else {
          console.error('Failed to fetch contracts from API:', await res.text());
        }
      }

      // Fallback: use local demo data if API or userId not available
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('kh_contracts') : null;
      if (stored) {
        const data: Contract[] = JSON.parse(stored);
        setContracts(data);
        calculateStats(data);
      } else {
        // Demo data (used only as last resort)
        const demoContracts: Contract[] = [
          {
            id: '1',
            contractNumber: 'CON-2024-001',
            commodity: 'Soybean',
            quantity: 100,
            unit: 'quintals',
            strikePrice: 4250,
            currentPrice: 4350,
            contractType: 'hedge',
            status: 'active',
            startDate: '2024-11-01',
            expiryDate: '2025-01-31',
            premium: 5000,
            counterparty: 'ABC Trading Co.',
            profitLoss: 10000,
            createdAt: '2024-11-01T10:00:00Z'
          },
          {
            id: '2',
            contractNumber: 'CON-2024-002',
            commodity: 'Mustard',
            quantity: 50,
            unit: 'quintals',
            strikePrice: 5500,
            currentPrice: 5450,
            contractType: 'sell',
            status: 'pending',
            startDate: '2024-12-01',
            expiryDate: '2025-02-28',
            premium: 3000,
            counterparty: 'XYZ Oil Mill',
            profitLoss: -2500,
            createdAt: '2024-12-01T10:00:00Z'
          },
          {
            id: '3',
            contractNumber: 'CON-2024-003',
            commodity: 'Groundnut',
            quantity: 75,
            unit: 'quintals',
            strikePrice: 6200,
            currentPrice: 6150,
            contractType: 'buy',
            status: 'completed',
            startDate: '2024-10-01',
            expiryDate: '2024-11-30',
            premium: 4500,
            counterparty: 'LMN Traders',
            profitLoss: -3750,
            createdAt: '2024-10-01T10:00:00Z'
          }
        ];
        setContracts(demoContracts);
        calculateStats(demoContracts);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('kh_contracts', JSON.stringify(demoContracts));
        }
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contractsList: Contract[]) => {
    const active = contractsList.filter(c => c.status === 'active').length;
    const pending = contractsList.filter(c => c.status === 'pending').length;
    const totalValue = contractsList
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.quantity * c.strikePrice), 0);
    const profitLoss = contractsList
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.profitLoss || 0), 0);

    setStats({ activeContracts: active, pendingReview: pending, totalValue, profitLoss });
  };

  const filterContracts = () => {
    let filtered = [...contracts];

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.counterparty?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (commodityFilter !== 'all') {
      filtered = filtered.filter(c => c.commodity === commodityFilter);
    }

    setFilteredContracts(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} />, text: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} />, text: 'Pending' },
      completed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={14} />, text: 'Completed' },
      expired: { color: 'bg-gray-100 text-gray-700', icon: <AlertCircle size={14} />, text: 'Expired' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} />, text: 'Cancelled' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button onClick={() => router.push('/')} className="text-gray-600 flex-shrink-0">
              <ChevronRight size={20} className="rotate-180 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold truncate">{t('contracts.title')}</h1>
              <p className="text-xs text-gray-500 hidden sm:block truncate">{t('contracts.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/contracts/create')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base flex-shrink-0"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">New Contract</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <FileText className="text-green-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Active</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Wallet className="text-blue-600" size={20} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Value</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{formatCurrency(stats.totalValue).replace('₹', '₹')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${stats.profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {stats.profitLoss >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs sm:text-sm text-gray-600 truncate">P&L</p>
                <p className={`text-sm sm:text-lg font-bold truncate ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.profitLoss)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Commodity Filter */}
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Commodities</option>
              <option value="Soybean">Soybean</option>
              <option value="Mustard">Mustard</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Sunflower">Sunflower</option>
            </select>
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredContracts.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={40} />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No contracts found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' || commodityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : t('contracts.noneCta')}
              </p>
              <button
                onClick={() => router.push('/contracts/create')}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
              >
                <Plus size={18} />
                Create Contract
              </button>
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <div key={contract.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{contract.commodity}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Contract #{contract.contractNumber}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                    className="text-gray-400 hover:text-green-600 flex-shrink-0"
                  >
                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{contract.quantity} {contract.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Strike Price</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{formatCurrency(contract.strikePrice)}/qtl</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Price</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{formatCurrency(contract.currentPrice || 0)}/qtl</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">P&L</p>
                    <p className={`text-sm sm:text-base font-semibold truncate ${(contract.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(contract.profitLoss || 0) >= 0 ? '+' : ''}{formatCurrency(contract.profitLoss || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4 border-t">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 overflow-hidden">
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      <span className="truncate">Expires: {formatDate(contract.expiryDate)}</span>
                    </span>
                    {contract.counterparty && (
                      <span className="hidden lg:inline truncate">• {contract.counterparty}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Eye size={14} className="sm:w-4 sm:h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
