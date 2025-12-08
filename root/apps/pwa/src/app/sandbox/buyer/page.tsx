'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { aiBot } from '@/lib/sandbox/ai-bot';
import { marketEngine } from '@/lib/sandbox/market-engine';
import { SandboxPlayer, SandboxContract } from '@/lib/sandbox/types';
import { ContractCard } from '@/components/sandbox/ContractCard';

export default function BuyerDashboard() {
  const router = useRouter();
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [aiContracts, setAiContracts] = useState<SandboxContract[]>([]);
  const [myContracts, setMyContracts] = useState<SandboxContract[]>([]);
  const [tab, setTab] = useState<'browse' | 'my'>('browse');

  useEffect(() => {
    marketEngine.startAutoUpdate();
    
    const p = sandboxStorage.getPlayer();
    if (!p) {
      router.push('/sandbox');
      return;
    }
    setPlayer(p);

    // Get player's buyer contracts
    const allContracts = sandboxStorage.getContracts();
    const buyerContracts = allContracts.filter((c: SandboxContract) => 
      c.playerId === p.id && c.playerRole === 'buyer'
    );
    setMyContracts(buyerContracts);

    // Generate AI contracts
    const generated: Partial<SandboxContract>[] = [];
    const commodities = marketEngine.getAllCommodities();
    
    for (let i = 0; i < 5; i++) {
      const contract = aiBot.generateAIContract(p.level, commodities);
      generated.push(contract);
      
      // Store in sessionStorage so detail page can access it
      sessionStorage.setItem(`ai_contract_${contract.id}`, JSON.stringify(contract));
    }
    
    setAiContracts(generated as SandboxContract[]);

    return () => {
      marketEngine.stopAutoUpdate();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24">
      <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white px-6 pt-6 pb-12 relative overflow-hidden">
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
              <i className="fa-solid fa-shopping-cart text-blue-200"></i>
              <span className="text-sm font-bold text-blue-200">BUYER MODE</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Browse Contracts</h1>
          <p className="text-blue-100 text-sm">Find profitable deals from AI sellers</p>
        </div>
      </header>

      <div className="px-6 -mt-6 relative z-10 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('browse')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${
                tab === 'browse' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-store mr-2"></i>
              Browse ({aiContracts.length})
            </button>
            <button
              onClick={() => setTab('my')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${
                tab === 'my' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-handshake mr-2"></i>
              My Deals ({myContracts.length})
            </button>
          </div>
        </div>

        {tab === 'browse' && (
          <>
            {aiContracts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-search text-3xl"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">No Contracts Available</h3>
                <p className="text-sm text-gray-600">Check back later for new deals!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiContracts.map(contract => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onClick={() => router.push(`/sandbox/buyer/${contract.id}`)}
                    showBadge={false}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'my' && (
          <>
            {myContracts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-handshake text-3xl"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">No Deals Yet</h3>
                <p className="text-sm text-gray-600">Accept contracts from the Browse tab!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myContracts.map(contract => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
