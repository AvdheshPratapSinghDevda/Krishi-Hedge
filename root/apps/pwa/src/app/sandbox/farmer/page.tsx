'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { SandboxPlayer, SandboxContract } from '@/lib/sandbox/types';
import { ContractCard } from '@/components/sandbox/ContractCard';

export default function FarmerDashboard() {
  const router = useRouter();
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [contracts, setContracts] = useState<SandboxContract[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    const p = sandboxStorage.getPlayer();
    if (!p) {
      router.push('/sandbox');
      return;
    }
    setPlayer(p);

    const allContracts = sandboxStorage.getContracts();
    const farmerContracts = allContracts.filter((c: SandboxContract) => 
      c.playerId === p.id && c.playerRole === 'farmer'
    );
    setContracts(farmerContracts);
  }, [router]);

  const filteredContracts = contracts.filter(c => 
    filter === 'all' || c.status === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
      <header className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white px-6 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/sandbox')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-user-tie text-green-200"></i>
              <span className="text-sm font-bold text-green-200">SELLER MODE</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Your Contracts</h1>
          <p className="text-green-100 text-sm">Create contracts & get AI feedback</p>
        </div>
      </header>

      <div className="px-6 -mt-6 relative z-10 space-y-4">
        <button
          onClick={() => router.push('/sandbox/farmer/create')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus-circle text-xl"></i>
          <span>Create New Contract</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                  filter === f 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-file-contract text-3xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">No Contracts Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              {filter === 'all' 
                ? "Create your first contract to practice selling!"
                : `No ${filter} contracts to show.`}
            </p>
            <button
              onClick={() => router.push('/sandbox/farmer/create')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Create Contract
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
