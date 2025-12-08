'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { marketEngine } from '@/lib/sandbox/market-engine';
import { progressionManager } from '@/lib/sandbox/progression';
import { SandboxPlayer, SandboxContract } from '@/lib/sandbox/types';
import { MarketPriceWidget } from '@/components/sandbox/MarketPriceWidget';

export default function BuyerContractDetail() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const p = sandboxStorage.getPlayer();
    if (!p) {
      router.push('/sandbox');
      return;
    }
    setPlayer(p);

    // In a real implementation, we'd fetch the contract from storage
    // For now, we'll get it from the AI contracts generated in the buyer page
    // This is a simplification - normally you'd store AI contracts too
    const stored = sessionStorage.getItem(`ai_contract_${contractId}`);
    if (stored) {
      setContract(JSON.parse(stored));
    }
  }, [router, contractId]);

  const handleAccept = () => {
    if (!player || !contract) return;

    setProcessing(true);

    // Save contract
    const savedContract: SandboxContract = {
      id: `contract_${Date.now()}`,
      playerId: player.id,
      contractNumber: `SB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      commodity: contract.commodity,
      quantity: contract.quantity,
      unit: contract.unit || 'quintals',
      contractPrice: contract.contractPrice,
      marketPriceAtCreation: contract.marketPriceAtCreation,
      playerRole: 'buyer',
      createdBy: 'ai',
      status: 'accepted',
      createdAt: new Date().toISOString()
    };

    sandboxStorage.saveContract(savedContract);

    // Update player
    const updatedPlayer = { ...player };
    updatedPlayer.stats.totalTrades += 1;

    const marketPrice = marketEngine.getCurrentPrice(contract.commodity);
    const isProfitable = contract.contractPrice < marketPrice;

    if (isProfitable) {
      updatedPlayer.stats.winRate = 
        ((updatedPlayer.stats.winRate * (updatedPlayer.stats.totalTrades - 1)) + 100) / 
        updatedPlayer.stats.totalTrades;
      updatedPlayer.stats.currentStreak += 1;
      updatedPlayer.stats.bestStreak = Math.max(updatedPlayer.stats.bestStreak, updatedPlayer.stats.currentStreak);
      
      const profit = (marketPrice - contract.contractPrice) * contract.quantity;
      updatedPlayer.stats.totalProfit += profit;
      updatedPlayer.balance += profit;
      updatedPlayer.xp += 50;
    } else {
      updatedPlayer.stats.winRate = 
        (updatedPlayer.stats.winRate * (updatedPlayer.stats.totalTrades - 1)) / 
        updatedPlayer.stats.totalTrades;
      updatedPlayer.stats.currentStreak = 0;
      
      const loss = (contract.contractPrice - marketPrice) * contract.quantity;
      updatedPlayer.balance -= loss;
      updatedPlayer.xp += 10;
    }

    // Check for level up
    const newLevel = progressionManager.getLevelFromXP(updatedPlayer.xp);
    if (newLevel > updatedPlayer.level) {
      updatedPlayer.level = newLevel;
    }

    sandboxStorage.savePlayer(updatedPlayer);

    setTimeout(() => {
      router.push('/sandbox/buyer');
    }, 1500);
  };

  const handleReject = () => {
    router.push('/sandbox/buyer');
  };

  if (!player || !contract) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center pb-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const marketPrice = marketEngine.getCurrentPrice(contract.commodity);
  const priceDiff = ((contract.contractPrice - marketPrice) / marketPrice * 100).toFixed(1);
  const isProfitable = parseFloat(priceDiff) < 0;
  const totalCost = contract.contractPrice * contract.quantity;
  const potentialProfit = (marketPrice - contract.contractPrice) * contract.quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24">
      <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => router.push('/sandbox/buyer')}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-bold">Contract Details</h1>
        </div>
      </header>

      <div className="px-6 -mt-4 relative z-10 space-y-4">
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{contract.commodity}</h2>
              <p className="text-sm text-gray-500">{contract.quantity} {contract.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Contract Price</span>
              <span className="text-lg font-bold text-gray-800">₹{contract.contractPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Market Price</span>
              <span className="text-lg font-bold text-purple-600">₹{marketPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className={`border-2 rounded-lg p-3 ${
            isProfitable ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className={`fa-solid ${isProfitable ? 'fa-trending-down' : 'fa-trending-up'} ${
                  isProfitable ? 'text-green-600' : 'text-red-600'
                }`}></i>
                <span className="text-sm font-bold text-gray-700">
                  {isProfitable ? 'Below Market' : 'Above Market'}
                </span>
              </div>
              <span className={`text-lg font-bold ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                {priceDiff > '0' ? '+' : ''}{priceDiff}%
              </span>
            </div>
          </div>
        </div>

        <MarketPriceWidget commodity={contract.commodity} />

        {isProfitable && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-trophy text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-green-100">Potential Profit</p>
                <p className="text-2xl font-bold">₹{potentialProfit.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-green-100">
              This is a great deal! The contract price is below current market value.
            </p>
          </div>
        )}

        {!isProfitable && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-red-100">Potential Loss</p>
                <p className="text-2xl font-bold">₹{Math.abs(potentialProfit).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-red-100">
              Caution! This contract is priced above market value. Consider rejecting.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={processing}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
          >
            <i className="fa-solid fa-times-circle mr-2"></i>
            Reject
          </button>
          <button
            onClick={handleAccept}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-4 rounded-xl hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check-circle"></i>
                Accept Deal
              </>
            )}
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-blue-600 text-lg"></i>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">Trading Tip</h4>
              <p className="text-xs text-gray-700">
                {isProfitable 
                  ? "Look for contracts priced below market value. The bigger the discount, the better your profit!"
                  : "Compare contract prices with current market rates. Patience pays - wait for better deals!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
