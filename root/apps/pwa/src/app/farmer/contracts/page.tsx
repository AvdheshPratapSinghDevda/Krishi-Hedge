'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Contract {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  strikePrice: number;
  deliveryWindow: string;
  status: string;
  contractType?: string;
  contract_type?: string;
  createdAt: string;
  acceptedAt?: string;
  accepted_at?: string;
  ipfsCid?: string;
  ipfs_cid?: string;
  pdfUrl?: string;
  pdf_url?: string;
}

export default function FarmerContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'accepted'>('all');

  useEffect(() => {
    const farmerId = window.localStorage.getItem("kh_user_id");
    if (!farmerId) {
      // Redirect to splash/login instead of root to avoid loop
      router.push('/splash');
      return;
    }

    // Fetch both farmer offers and accepted buyer demands
    Promise.all([
      fetch(`/api/contracts?role=farmer&farmerId=${farmerId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/buyer-demands?farmerId=${farmerId}`).then(r => r.json()).catch(() => [])
    ])
      .then(([farmerContracts, acceptedDemands]) => {
        const allContracts = [
          ...(Array.isArray(farmerContracts) ? farmerContracts : []),
          ...(Array.isArray(acceptedDemands) ? acceptedDemands : [])
        ];
        setContracts(allContracts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading contracts:', err);
        setContracts([]);
        setLoading(false);
      });
  }, [router]);  const filteredContracts = contracts.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'created') return c.status === 'CREATED';
    if (filter === 'accepted') return c.status === 'ACCEPTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      'CREATED': 'bg-yellow-100 text-yellow-700',
      'ACCEPTED': 'bg-green-100 text-green-700',
      'COMPLETED': 'bg-blue-100 text-blue-700',
      'CANCELLED': 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getContractTypeBadge = (type: string) => {
    if (type === 'BUYER_DEMAND') {
      return (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
          <i className="fa-solid fa-handshake mr-1"></i>
          Buyer Demand
        </span>
      );
    }
    return (
      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
        <i className="fa-solid fa-seedling mr-1"></i>
        My Offer
      </span>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-white hover:text-green-200">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold">My Contracts</h1>
            <p className="text-sm text-green-100">View & download blockchain-verified PDFs</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{contracts.length}</p>
              <p className="text-xs text-green-100">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'ACCEPTED').length}</p>
              <p className="text-xs text-green-100">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{contracts.filter(c => c.ipfsCid || c.ipfs_cid).length}</p>
              <p className="text-xs text-green-100">With PDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('created')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'created' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'accepted' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Accepted
          </button>
        </div>

        {/* Contracts List */}
        <div className="space-y-3">
          {filteredContracts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-file-contract text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">No contracts found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'Create a contract or browse buyer demands to get started.' 
                  : `No ${filter} contracts.`}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            filteredContracts.map((contract) => {
              const contractType = contract.contractType || contract.contract_type || '';
              const ipfsCid = contract.ipfsCid || contract.ipfs_cid;
              const acceptedAt = contract.acceptedAt || contract.accepted_at;
              
              return (
                <div
                  key={contract.id}
                  onClick={() => router.push(`/contracts/${contract.id}`)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        {getContractTypeBadge(contractType)}
                        {ipfsCid && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                            <i className="fa-solid fa-file-pdf mr-1"></i>PDF Ready
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{contract.crop}</h3>
                      <p className="text-sm text-gray-500">
                        {contract.quantity} {contract.unit} @ ₹{contract.strikePrice}/{contract.unit}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(contract.status)}`}>
                        {contract.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Delivery Window</p>
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <i className="fa-solid fa-calendar text-gray-400"></i>
                        <span>{contract.deliveryWindow || 'Not specified'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Created On</p>
                      <p className="text-gray-700 font-medium text-xs">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {acceptedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          <i className="fa-solid fa-check-circle text-green-500 mr-1"></i>
                          Accepted on {new Date(acceptedAt).toLocaleDateString()}
                        </p>
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          View Details
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </span>
                      </div>
                    </div>
                  )}

                  {!ipfsCid && contract.status === 'ACCEPTED' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-amber-600 text-xs">
                        <i className="fa-solid fa-clock"></i>
                        <span>PDF being generated...</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
