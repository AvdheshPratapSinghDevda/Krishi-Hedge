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
  const [showFilters, setShowFilters] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Government-Ready Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and Title */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/')} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ChevronRight size={20} className="rotate-180 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Contracts Management</h1>
                <p className="text-xs text-gray-500">Agricultural Commodity Contracts Portal</p>
              </div>
            </div>

            {/* Right: Search, Filter, New Contract */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Search"
              >
                <Search size={18} className="text-gray-600" />
              </button>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Filters"
              >
                <Filter size={18} className="text-gray-600" />
                {(statusFilter !== 'all' || commodityFilter !== 'all') && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* New Contract Button */}
              <button
                onClick={() => router.push('/contracts/new')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm"
              >
                <Plus size={16} />
                <span>New Contract</span>
              </button>
              <button
                onClick={() => router.push('/contracts/new')}
                className="sm:hidden p-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors shadow-sm"
                aria-label="New contract"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Expandable Filters Section */}
          {showFilters && (
            <div className="py-4 border-t bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by commodity, contract number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* All Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending Review</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                </div>

                {/* All Commodities Filter */}
                <div className="relative">
                  <select
                    value={commodityFilter}
                    onChange={(e) => setCommodityFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Commodities</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Groundnut">Groundnut</option>
                    <option value="Sunflower">Sunflower</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || statusFilter !== 'all' || commodityFilter !== 'all') && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs text-gray-600 font-medium">Active Filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">×</button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">×</button>
                    </span>
                  )}
                  {commodityFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                      Commodity: {commodityFilter}
                      <button onClick={() => setCommodityFilter('all')} className="hover:text-blue-900">×</button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setCommodityFilter('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Stats Bar - Compact Single Row */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Active Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Value</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Net P&L</p>
              <p className={`text-xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitLoss >= 0 ? '+' : ''}{formatCurrency(stats.profitLoss)}
              </p>
            </div>
          </div>
        </div>

        {/* Contracts List - Government Ready Design */}
        <div className="space-y-3">
          {filteredContracts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contracts Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'all' || commodityFilter !== 'all'
                  ? 'No contracts match your current filters. Try adjusting your search criteria.'
                  : 'You have not created any contracts yet. Create your first contract to begin hedging.'}
              </p>
              <button
                onClick={() => router.push('/contracts/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 shadow-sm transition-colors"
              >
                <Plus size={20} />
                Create New Contract
              </button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredContracts.length}</span> of <span className="font-semibold">{contracts.length}</span> contracts
                </p>
              </div>

              {/* Contract Cards */}
              {filteredContracts.map((contract) => (
                <div 
                  key={contract.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Contract Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold text-gray-900">{contract.commodity}</h3>
                          {getStatusBadge(contract.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            Contract No: <span className="font-mono font-medium text-gray-900">{contract.contractNumber || contract.id.slice(0, 8)}</span>
                          </span>
                          {contract.counterparty && (
                            <>
                              <span>•</span>
                              <span>Counterparty: <span className="font-medium text-gray-900">{contract.counterparty}</span></span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/contracts/${contract.id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="View details"
                      >
                        <ChevronRight size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Contract Details Grid */}
                  <div className="px-6 py-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Quantity</p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {contract.quantity} <span className="text-sm font-normal text-gray-600">{contract.unit}</span>
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Strike Price</p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {formatCurrency(contract.strikePrice)}
                          <span className="text-sm font-normal text-gray-600">/qtl</span>
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Price</p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {contract.currentPrice ? (
                            <>
                              {formatCurrency(contract.currentPrice)}
                              <span className="text-sm font-normal text-gray-600">/qtl</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Profit/Loss</p>
                        <p className={`text-lg font-bold truncate ${(contract.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {contract.profitLoss !== undefined && contract.profitLoss !== null ? (
                            <>{(contract.profitLoss || 0) >= 0 ? '+' : ''}{formatCurrency(contract.profitLoss)}</>
                          ) : (
                            <span className="text-sm text-gray-400 font-normal">Pending</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Contract Timeline */}
                    <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500">Start:</span> 
                          <span className="font-medium text-gray-900">{formatDate(contract.startDate)}</span>
                        </span>
                        <span className="hidden sm:inline text-gray-400">→</span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500">Expiry:</span> 
                          <span className="font-medium text-gray-900">{formatDate(contract.expiryDate)}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/contracts/${contract.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
