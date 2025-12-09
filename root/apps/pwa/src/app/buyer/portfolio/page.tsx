'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BuyerPortfolioPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buyerId = localStorage.getItem('kh_buyer_id');
    if (!buyerId) {
      router.push('/splash');
      return;
    }

    // Fetch all contracts for this buyer (both offers they accepted and demands they created)
    Promise.all([
      fetch(`/api/contracts?role=buyer&buyerId=${buyerId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/buyer-demands?buyerId=${buyerId}`).then(r => r.json()).catch(() => [])
    ])
      .then(([acceptedOffers, myDemands]) => {
        // Combine both: offers they accepted + demands that were accepted by farmers
        const allContracts = [
          ...(Array.isArray(acceptedOffers) ? acceptedOffers : []),
          ...(Array.isArray(myDemands) ? myDemands.filter((d: any) => d.status === 'ACCEPTED') : [])
        ];
        // Show only accepted contracts in portfolio
        const matched = allContracts.filter(c => c.status === 'ACCEPTED');
        setPositions(matched);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPositions([]);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 p-6 text-white shadow-lg">
        <h1 className="text-xl font-bold">Portfolio</h1>
        <p className="text-slate-400 text-xs">Active Positions & Settlements</p>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-10">Loading positions...</div>
        ) : positions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-solid fa-folder-open text-2xl"></i>
            </div>
            <h3 className="text-slate-800 font-bold">No Active Positions</h3>
            <p className="text-slate-500 text-sm mb-4">Your order book is empty.</p>
            <button 
              onClick={() => router.push('/market')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700"
            >
              Go to Market
            </button>
          </div>
        ) : (
          positions.map(p => {
            // Handle different field name formats from API
            const crop = p.crop;
            const quantity = p.quantity;
            const unit = p.unit || 'Quintals';
            const strikePrice = p.strikePrice || p.strike_price;
            const deliveryWindow = p.deliveryWindow || p.deliverywindow || '30 days';
            const status = p.status;
            const contractType = p.contractType || p.contract_type;
            const ipfsCid = p.ipfsCid || p.ipfs_cid;
            const createdAt = p.createdAt || p.created_at;
            const acceptedAt = p.acceptedAt || p.accepted_at;
            
            return (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {contractType === 'BUYER_DEMAND' ? 'My Demand' : 'Farmer Offer'}
                      </span>
                      {ipfsCid && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                          <i className="fa-solid fa-file-pdf mr-1"></i>PDF Ready
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{crop}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Strike Price</p>
                    <p className="font-bold text-slate-800">₹{strikePrice}/{unit}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-slate-400 text-xs">Quantity</p>
                    <p className="font-bold text-slate-700">{quantity} {unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Delivery Window</p>
                    <p className="font-bold text-slate-700">{deliveryWindow}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-slate-400 text-xs">Status</p>
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mt-1">
                      {status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Accepted On</p>
                    <p className="font-bold text-slate-700 text-xs">
                      {acceptedAt ? new Date(acceptedAt).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <i className="fa-solid fa-check-circle"></i> Contract Active
                  </span>
                  <button 
                    onClick={() => router.push(`/contracts/${p.id}`)}
                    className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    View Details
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
