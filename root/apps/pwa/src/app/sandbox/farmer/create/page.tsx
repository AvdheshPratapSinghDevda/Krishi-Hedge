'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { marketEngine } from '@/lib/sandbox/market-engine';
import { aiBot } from '@/lib/sandbox/ai-bot';
import { progressionManager } from '@/lib/sandbox/progression';
import { SandboxPlayer, SandboxContract } from '@/lib/sandbox/types';
import { MarketPriceWidget } from '@/components/sandbox/MarketPriceWidget';

const COMMODITIES = ['Soybean', 'Mustard', 'Groundnut', 'Sunflower', 'Sesame', 'Castor'];

export default function CreateFarmerContract() {
  const router = useRouter();
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [commodity, setCommodity] = useState('Soybean');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [aiEvaluation, setAiEvaluation] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const p = sandboxStorage.getPlayer();
    if (!p) {
      router.push('/sandbox');
      return;
    }
    setPlayer(p);
  }, [router]);

  const handleEvaluate = () => {
    if (!quantity || !price || !player) return;

    const marketPrice = marketEngine.getCurrentPrice(commodity);
    const evaluation = aiBot.evaluateContract(
      {
        commodity,
        quantity: parseFloat(quantity),
        contractPrice: parseFloat(price)
      },
      player.level
    );

    setAiEvaluation({ ...evaluation, marketPrice });
  };

  const handleSubmit = () => {
    if (!player || !quantity || !price) return;

    setSubmitting(true);
    const marketPrice = marketEngine.getCurrentPrice(commodity);

    const contract: SandboxContract = {
      id: `contract_${Date.now()}`,
      playerId: player.id,
      contractNumber: `SB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      commodity,
      quantity: parseFloat(quantity),
      unit: 'quintals',
      contractPrice: parseFloat(price),
      marketPriceAtCreation: marketPrice,
      playerRole: 'farmer',
      createdBy: 'player',
      aiDecision: aiEvaluation?.decision,
      aiReasoning: aiEvaluation?.reasoning,
      counterOfferPrice: aiEvaluation?.counterOffer,
      status: aiEvaluation?.decision === 'accepted' ? 'accepted' : 'rejected',
      createdAt: new Date().toISOString()
    };

    sandboxStorage.saveContract(contract);

    // Update player stats and XP
    const updatedPlayer = { ...player };
    updatedPlayer.stats.totalTrades += 1;

    if (aiEvaluation?.decision === 'accepted') {
      updatedPlayer.stats.winRate = 
        ((updatedPlayer.stats.winRate * (updatedPlayer.stats.totalTrades - 1)) + 100) / 
        updatedPlayer.stats.totalTrades;
      updatedPlayer.stats.currentStreak += 1;
      updatedPlayer.stats.bestStreak = Math.max(updatedPlayer.stats.bestStreak, updatedPlayer.stats.currentStreak);
      
      const profit = (parseFloat(price) - marketPrice) * parseFloat(quantity);
      updatedPlayer.stats.totalProfit += profit;
      updatedPlayer.balance += profit;
      updatedPlayer.xp += 50;
    } else {
      updatedPlayer.stats.winRate = 
        (updatedPlayer.stats.winRate * (updatedPlayer.stats.totalTrades - 1)) / 
        updatedPlayer.stats.totalTrades;
      updatedPlayer.stats.currentStreak = 0;
      updatedPlayer.xp += 10;
    }

    // Check for level up
    const newLevel = progressionManager.getLevelFromXP(updatedPlayer.xp);
    if (newLevel > updatedPlayer.level) {
      updatedPlayer.level = newLevel;
    }

    sandboxStorage.savePlayer(updatedPlayer);

    setTimeout(() => {
      router.push('/sandbox/farmer');
    }, 1500);
  };

  if (!player) return null;

  const marketPrice = marketEngine.getCurrentPrice(commodity);
  const priceDiff = price ? ((parseFloat(price) - marketPrice) / marketPrice * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
      <header className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => router.push('/sandbox/farmer')}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-bold">Create Contract</h1>
        </div>
      </header>

      <div className="px-6 -mt-4 relative z-10 space-y-4">
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fa-solid fa-seedling text-green-600 mr-2"></i>
              Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => {
                setCommodity(e.target.value);
                setAiEvaluation(null);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            >
              {COMMODITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <MarketPriceWidget commodity={commodity} />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fa-solid fa-weight-hanging text-green-600 mr-2"></i>
              Quantity (Quintals)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setAiEvaluation(null);
              }}
              placeholder="e.g., 100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <i className="fa-solid fa-indian-rupee-sign text-green-600 mr-2"></i>
              Your Price (₹ per Quintal)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setAiEvaluation(null);
              }}
              placeholder={`Market: ₹${marketPrice}`}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
            {price && (
              <p className={`text-xs mt-1 ${parseFloat(priceDiff) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(priceDiff) > 0 ? '+' : ''}{priceDiff}% vs market
              </p>
            )}
          </div>

          <button
            onClick={handleEvaluate}
            disabled={!quantity || !price}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-robot"></i>
            Get AI Feedback
          </button>
        </div>

        {aiEvaluation && (
          <div className={`bg-white rounded-xl shadow-lg p-5 border-2 ${
            aiEvaluation.decision === 'accepted' ? 'border-green-500' : 
            aiEvaluation.decision === 'counter_offer' ? 'border-yellow-500' : 
            'border-red-500'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                aiEvaluation.decision === 'accepted' ? 'bg-green-100 text-green-600' :
                aiEvaluation.decision === 'counter_offer' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                <i className={`fa-solid ${
                  aiEvaluation.decision === 'accepted' ? 'fa-check-circle' :
                  aiEvaluation.decision === 'counter_offer' ? 'fa-handshake' :
                  'fa-times-circle'
                } text-2xl`}></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">
                  {aiEvaluation.decision === 'accepted' ? '✅ Accepted!' :
                   aiEvaluation.decision === 'counter_offer' ? '💬 Counter Offer' :
                   '❌ Rejected'}
                </h3>
                <p className="text-sm text-gray-700 mb-2">{aiEvaluation.reasoning}</p>
                <p className="text-xs text-gray-500">AI Buyer: {aiEvaluation.botName}</p>
              </div>
            </div>

            {aiEvaluation.counterOffer && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-bold text-gray-700 mb-1">Counter Offer:</p>
                <p className="text-lg font-bold text-yellow-700">₹{aiEvaluation.counterOffer.toLocaleString()} per quintal</p>
              </div>
            )}

            {aiEvaluation.decision === 'accepted' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Potential Profit:</span>
                  <span className="text-lg font-bold text-green-700">
                    ₹{((parseFloat(price) - aiEvaluation.marketPrice) * parseFloat(quantity)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Submit Contract
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
