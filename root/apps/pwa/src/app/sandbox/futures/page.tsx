'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { SandboxPlayer } from '@/lib/sandbox/types';

interface Position {
  id: string;
  commodity: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  margin: number;
  timestamp: number;
  status: 'OPEN' | 'CLOSED';
  exitPrice?: number;
  pnl?: number;
}

const COMMODITIES = [
  { name: 'Soybean', currentPrice: 4850, symbol: '🌱' },
  { name: 'Groundnut', currentPrice: 5200, symbol: '🥜' },
  { name: 'Sunflower', currentPrice: 6100, symbol: '🌻' },
  { name: 'Mustard', currentPrice: 5450, symbol: '🌾' },
];

const MARGIN_RATE = 0.10; // 10% margin requirement

export default function FuturesTradingPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITIES[0]);
  const [quantity, setQuantity] = useState('10');
  const [showSuccess, setShowSuccess] = useState(false);
  const [simulatedPrice, setSimulatedPrice] = useState<number | null>(null);

  useEffect(() => {
    const p = sandboxStorage.getPlayer();
    if (!p) {
      router.push('/sandbox');
      return;
    }
    setPlayer(p);

    // Load positions from localStorage
    const saved = localStorage.getItem('kh_sandbox_positions');
    if (saved) {
      setPositions(JSON.parse(saved));
    }
  }, [router]);

  const savePositions = (newPositions: Position[]) => {
    setPositions(newPositions);
    localStorage.setItem('kh_sandbox_positions', JSON.stringify(newPositions));
  };

  const calculateMargin = (price: number, qty: number): number => {
    return Math.round(price * qty * MARGIN_RATE);
  };

  const calculatePnL = (pos: Position): number => {
    const currentPrice = pos.status === 'CLOSED' ? (pos.exitPrice || pos.currentPrice) : pos.currentPrice;
    if (pos.type === 'BUY') {
      return (currentPrice - pos.entryPrice) * pos.quantity;
    } else {
      return (pos.entryPrice - currentPrice) * pos.quantity;
    }
  };

  const handleBuy = () => {
    if (!player) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const margin = calculateMargin(selectedCommodity.currentPrice, qty);
    
    if (player.balance < margin) {
      alert(`Insufficient balance. Need ₹${margin.toLocaleString()} margin but have ₹${player.balance.toLocaleString()}`);
      return;
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      commodity: selectedCommodity.name,
      type: 'BUY',
      quantity: qty,
      entryPrice: selectedCommodity.currentPrice,
      currentPrice: selectedCommodity.currentPrice,
      margin,
      timestamp: Date.now(),
      status: 'OPEN',
    };

    // Deduct margin
    const updatedPlayer = {
      ...player,
      balance: player.balance - margin,
    };
    sandboxStorage.savePlayer(updatedPlayer);
    setPlayer(updatedPlayer);

    savePositions([...positions, newPosition]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSell = () => {
    if (!player) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const margin = calculateMargin(selectedCommodity.currentPrice, qty);
    
    if (player.balance < margin) {
      alert(`Insufficient balance. Need ₹${margin.toLocaleString()} margin but have ₹${player.balance.toLocaleString()}`);
      return;
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      commodity: selectedCommodity.name,
      type: 'SELL',
      quantity: qty,
      entryPrice: selectedCommodity.currentPrice,
      currentPrice: selectedCommodity.currentPrice,
      margin,
      timestamp: Date.now(),
      status: 'OPEN',
    };

    // Deduct margin
    const updatedPlayer = {
      ...player,
      balance: player.balance - margin,
    };
    sandboxStorage.savePlayer(updatedPlayer);
    setPlayer(updatedPlayer);

    savePositions([...positions, newPosition]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSettle = (positionId: string) => {
    if (!player || simulatedPrice === null) {
      alert('Please enter settlement price');
      return;
    }

    const position = positions.find(p => p.id === positionId);
    if (!position || position.status === 'CLOSED') return;

    const pnl = position.type === 'BUY' 
      ? (simulatedPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - simulatedPrice) * position.quantity;

    const settledPosition: Position = {
      ...position,
      status: 'CLOSED',
      exitPrice: simulatedPrice,
      currentPrice: simulatedPrice,
      pnl,
    };

    // Return margin + P/L
    const updatedPlayer = {
      ...player,
      balance: player.balance + position.margin + pnl,
      stats: {
        ...player.stats,
        totalTrades: player.stats.totalTrades + 1,
        totalProfit: player.stats.totalProfit + pnl,
        winRate: Math.round(((player.stats.winRate * player.stats.totalTrades + (pnl > 0 ? 100 : 0)) / (player.stats.totalTrades + 1))),
        currentStreak: pnl > 0 ? player.stats.currentStreak + 1 : 0,
        bestStreak: Math.max(player.stats.bestStreak, pnl > 0 ? player.stats.currentStreak + 1 : 0),
      },
    };

    sandboxStorage.savePlayer(updatedPlayer);
    setPlayer(updatedPlayer);

    const updatedPositions = positions.map(p => p.id === positionId ? settledPosition : p);
    savePositions(updatedPositions);
    setSimulatedPrice(null);
  };

  const openPositions = positions.filter(p => p.status === 'OPEN');
  const closedPositions = positions.filter(p => p.status === 'CLOSED').slice(0, 5);
  const totalMarginUsed = openPositions.reduce((sum, p) => sum + p.margin, 0);
  const unrealizedPnL = openPositions.reduce((sum, p) => sum + calculatePnL(p), 0);

  if (!player) {
    return <div className="min-h-screen bg-purple-50 flex items-center justify-center pb-20">
      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pb-24">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          <i className="fa-solid fa-check-circle mr-2"></i>
          Position Opened!
        </div>
      )}

      <header className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white px-6 pt-6 pb-16 relative overflow-hidden">
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
              <i className="fa-solid fa-chart-candlestick text-yellow-300"></i>
              <span className="text-sm font-bold text-yellow-300">FUTURES</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Futures Trading</h1>
          <p className="text-orange-200 text-sm mb-6">Practice margin-based hedging</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <p className="text-xs text-orange-200 mb-1">Available Balance</p>
              <p className="text-2xl font-bold">₹{(player.balance / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <p className="text-xs text-orange-200 mb-1">Margin Used</p>
              <p className="text-2xl font-bold">₹{(totalMarginUsed / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 -mt-8 relative z-10 space-y-4">
        {/* Trading Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-orange-100">
          <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-orange-600"></i>
            Open Position
          </h2>

          {/* Commodity Selector */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">Select Commodity</label>
            <div className="grid grid-cols-2 gap-2">
              {COMMODITIES.map(comm => (
                <button
                  key={comm.name}
                  onClick={() => setSelectedCommodity(comm)}
                  className={`p-3 rounded-xl border-2 transition ${
                    selectedCommodity.name === comm.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{comm.symbol}</div>
                  <div className="text-xs font-bold text-gray-800">{comm.name}</div>
                  <div className="text-xs text-gray-600">₹{comm.currentPrice}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">Quantity (Quintals)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Enter quantity"
            />
          </div>

          {/* Margin Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Required Margin (10%):</span>
              <span className="font-bold text-gray-800">
                ₹{calculateMargin(selectedCommodity.currentPrice, parseInt(quantity) || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Entry Price: ₹{selectedCommodity.currentPrice}/quintal
            </div>
          </div>

          {/* Buy/Sell Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBuy}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              <i className="fa-solid fa-arrow-up mr-2"></i>
              BUY
            </button>
            <button
              onClick={handleSell}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              <i className="fa-solid fa-arrow-down mr-2"></i>
              SELL
            </button>
          </div>
        </div>

        {/* Open Positions */}
        {openPositions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-orange-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Open Positions</h3>
            
            <div className="space-y-3">
              {openPositions.map(pos => {
                const pnl = calculatePnL(pos);
                return (
                  <div key={pos.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            pos.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {pos.type}
                          </span>
                          <span className="font-bold text-gray-800">{pos.commodity}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {pos.quantity} quintals @ ₹{pos.entryPrice}
                        </div>
                      </div>
                      <div className={`text-right ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="text-sm font-bold">
                          {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()}
                        </div>
                        <div className="text-xs">Unrealized P/L</div>
                      </div>
                    </div>

                    {/* Settlement */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <label className="text-xs text-gray-600 mb-1 block">Simulate Settlement Price</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter price"
                          value={simulatedPrice || ''}
                          onChange={(e) => setSimulatedPrice(parseFloat(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleSettle(pos.id)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Unrealized P/L:</span>
                <span className={`font-bold ${unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {unrealizedPnL >= 0 ? '+' : ''}₹{unrealizedPnL.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Trade History */}
        {closedPositions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-orange-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Recent Settlements</h3>
            
            <div className="space-y-2">
              {closedPositions.map(pos => (
                <div key={pos.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        pos.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {pos.type}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{pos.commodity}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {pos.quantity} @ ₹{pos.entryPrice} → ₹{pos.exitPrice}
                    </div>
                  </div>
                  <div className={`text-right ${(pos.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="text-sm font-bold">
                      {(pos.pnl || 0) >= 0 ? '+' : ''}₹{(pos.pnl || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-graduation-cap text-yellow-600 text-xl"></i>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">How Futures Work</h4>
              <p className="text-xs text-gray-700 mb-2">
                <strong>Margin:</strong> You only need to pay 10% upfront to control a full position.
              </p>
              <p className="text-xs text-gray-700 mb-2">
                <strong>BUY:</strong> Profit when price goes UP. Loss when price goes DOWN.
              </p>
              <p className="text-xs text-gray-700">
                <strong>SELL:</strong> Profit when price goes DOWN. Loss when price goes UP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
