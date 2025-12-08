'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, MapPin, Calendar, TrendingUp, Shield, CheckCircle, XCircle, Package, IndianRupee } from 'lucide-react';

interface ContractDetails {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  buyerId?: string;
  buyerName?: string;
  fpoId?: string;
  fpoName?: string;
  commodity: string;
  quantity: number;
  strikePrice: number;
  currentMarketPrice: number;
  premium: number;
  hedgeType: string;
  contractDate: string;
  expiryDate: string;
  matchedDate?: string;
  status: string;
  notes?: string;
  ipfsHash?: string;
}

interface MatchRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  offeredPrice: number;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContractDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [matches, setMatches] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'farmer' | 'buyer' | 'fpo' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('kh_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        setUserType(parsed.userType || 'farmer');
      }
    }
    loadContractDetails();
  }, [contractId]);

  const loadContractDetails = async () => {
    try {
      // Load contract details
      const contractRes = await fetch(`/api/hedge/contracts/${contractId}`);
      if (contractRes.ok) {
        const data = await contractRes.json();
        setContract(data);
      }
      
      // Load match requests
      const matchRes = await fetch(`/api/hedge/match?contractId=${contractId}`);
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        setMatches(matchData);
      }
    } catch (error) {
      console.error('Failed to load contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/hedge/match', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'accept' })
      });

      if (response.ok) {
        alert('Match accepted! Contract is now matched.');
        loadContractDetails();
      } else {
        alert('Failed to accept match. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/hedge/match', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'reject' })
      });

      if (response.ok) {
        alert('Match rejected.');
        loadContractDetails();
      }
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract not found</h2>
          <button onClick={() => router.push('/hedge')} className="text-green-600 hover:underline">
            ← Back to marketplace
          </button>
        </div>
      </div>
    );
  }

  const statusColor = {
    open: 'bg-green-100 text-green-800 border-green-300',
    matched: 'bg-blue-100 text-blue-800 border-blue-300',
    executed: 'bg-purple-100 text-purple-800 border-purple-300',
    expired: 'bg-gray-100 text-gray-800 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  }[contract.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => router.push('/hedge')}
            className="flex items-center gap-2 mb-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{contract.commodity} Hedge Contract</h1>
              <p className="text-green-100">Contract ID: {contract.id.slice(0, 8)}...</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColor}`}>
              {contract.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contract Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contract Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Commodity</p>
                <p className="text-xl font-bold text-gray-900">{contract.commodity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantity</p>
                <p className="text-xl font-bold text-gray-900">{contract.quantity} quintals</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Strike Price</p>
                <p className="text-xl font-bold text-green-600">₹{contract.strikePrice.toLocaleString()}/quintal</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Market Price</p>
                <p className="text-xl font-bold text-gray-700">₹{contract.currentMarketPrice.toLocaleString()}/quintal</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-xl font-bold text-gray-900">₹{(contract.strikePrice * contract.quantity).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Premium</p>
                <p className="text-xl font-bold text-orange-600">₹{contract.premium.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Farmer Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Farmer</p>
                <p className="font-bold text-gray-900">{contract.farmerName}</p>
                <p className="text-sm text-gray-600">{contract.farmerPhone}</p>
              </div>
            </div>

            {/* FPO Info */}
            {contract.fpoName && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Verified by FPO</p>
                  <p className="font-bold text-gray-900">{contract.fpoName}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            )}

            {/* Buyer Info (if matched) */}
            {contract.buyerName && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Matched Buyer</p>
                  <p className="font-bold text-gray-900">{contract.buyerName}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Contract Date</p>
                <p className="font-semibold text-gray-900">{new Date(contract.contractDate).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Expiry Date</p>
                <p className="font-semibold text-gray-900">{new Date(contract.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Notes */}
            {contract.notes && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-1">Additional Notes</p>
                <p className="text-sm text-gray-700">{contract.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Match Requests (Farmer view only) */}
        {userType === 'farmer' && contract.status === 'open' && matches.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Match Requests ({matches.length})</h2>
            <div className="space-y-4">
              {matches.map(match => (
                <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{match.buyerName}</p>
                      <p className="text-sm text-gray-600">Offered: ₹{match.offeredPrice.toLocaleString()}/quintal</p>
                      {match.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{match.message}"</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {match.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptMatch(match.id)}
                        className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectMatch(match.id)}
                        className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No matches message */}
        {userType === 'farmer' && contract.status === 'open' && matches.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No match requests yet</h3>
            <p className="text-gray-500">Buyers will send match requests when interested in your contract</p>
          </div>
        )}
      </div>
    </div>
  );
}
