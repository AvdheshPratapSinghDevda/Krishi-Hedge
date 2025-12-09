'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowLeft, TrendingUp, TrendingDown, Shield } from 'lucide-react';

export default function HedgePlanningCalculator() {
  const [strategy, setStrategy] = useState<'floor' | 'ceiling' | 'collar'>('floor');
  const [inputs, setInputs] = useState({
    bushelsToHedge: '',
    targetPrice: '',
    currentFutures: '11.85',
    basisEstimate: '-0.25'
  });

  const [result, setResult] = useState<{
    contractsNeeded: number;
    estimatedMargin: number;
    protectionPrice: number;
    downSideSavings: number;
    upSideMissed: number;
  } | null>(null);

  const calculateHedge = () => {
    const bushels = parseFloat(inputs.bushelsToHedge) || 0;
    const currentPrice = parseFloat(inputs.currentFutures) || 0;
    const basis = parseFloat(inputs.basisEstimate) || 0;
    
    if (bushels === 0) {
      alert('Please enter bushels to hedge');
      return;
    }

    const contracts = Math.ceil(bushels / 5000); // 5,000 bushels per contract
    const marginPerContract = 1500;
    const totalMargin = contracts * marginPerContract;
    const protectionPrice = currentPrice + basis;

    // Scenario analysis
    const lowPrice = 10.00;
    const highPrice = 13.00;
    const savingsIfDown = (currentPrice - lowPrice) * bushels;
    const missedIfUp = (highPrice - currentPrice) * bushels;

    setResult({
      contractsNeeded: contracts,
      estimatedMargin: totalMargin,
      protectionPrice,
      downSideSavings: savingsIfDown,
      upSideMissed: missedIfUp
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 pb-24">
      <div className="max-w-md mx-auto px-4">
        <Link href="/learn-hedging" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Learning</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hedge Planning Calculator</h1>
              <p className="text-gray-600">Build your protection strategy</p>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">What would you like to do?</label>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setStrategy('floor')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  strategy === 'floor' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900">Lock Minimum Price</span>
                </div>
                <p className="text-sm text-gray-600">Floor protection - prevent losses</p>
              </button>

              <button
                onClick={() => setStrategy('ceiling')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  strategy === 'ceiling' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-gray-900">Lock Maximum Price</span>
                </div>
                <p className="text-sm text-gray-600">Ceiling - limit buying costs</p>
              </button>

              <button
                onClick={() => setStrategy('collar')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  strategy === 'collar' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">Lock Both</span>
                </div>
                <p className="text-sm text-gray-600">Collar - floor and ceiling</p>
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bushels to Hedge</label>
                <input
                  type="number"
                  value={inputs.bushelsToHedge}
                  onChange={(e) => setInputs({...inputs, bushelsToHedge: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="75000"
                />
                <p className="text-xs text-gray-500 mt-1">Each contract = 5,000 bushels</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Price ($/bu)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.targetPrice}
                  onChange={(e) => setInputs({...inputs, targetPrice: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="11.50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Futures Price ($/bu)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.currentFutures}
                  onChange={(e) => setInputs({...inputs, currentFutures: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Basis Estimate ($/bu)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.basisEstimate}
                  onChange={(e) => setInputs({...inputs, basisEstimate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Local price vs Chicago (usually negative)</p>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateHedge}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Build Hedge Plan
          </button>

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Hedge Strategy for Your Farm</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Contracts Needed</div>
                    <div className="text-3xl font-bold text-gray-900">{result.contractsNeeded}</div>
                    <div className="text-xs text-gray-500 mt-1">{(result.contractsNeeded * 5000).toLocaleString()} bushels total</div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Estimated Margin Required</div>
                    <div className="text-2xl font-bold text-orange-600">₹{result.estimatedMargin.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Refundable deposit</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="text-sm text-gray-600 mb-2">Your Price Protection</div>
                  <div className="text-2xl font-bold text-green-600 mb-2 break-words">₹{result.protectionPrice.toFixed(2)}/bu</div>
                  <p className="text-xs text-gray-600">Futures ₹{inputs.currentFutures} + Basis ₹{inputs.basisEstimate}</p>
                </div>

                {/* Scenario Analysis */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">What If Scenarios:</h4>
                  
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-2">If Prices Drop to ₹1,000</div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          You Save: ₹{result.downSideSavings.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">
                          Your hedge gains ₹{(parseFloat(inputs.currentFutures) - 10).toFixed(2)}/bu × {inputs.bushelsToHedge} bushels
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-2">If Prices Rise to ₹1,300</div>
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          You Miss: ₹{result.upSideMissed.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">
                          But you locked in profit at ₹{result.protectionPrice.toFixed(2)} - still a win!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-2">Remember:</div>
                  <p className="text-gray-700 text-sm">
                    You're protecting against <strong>downside risk</strong>, which is the main goal. 
                    Missing upside when you've already locked in profit is better than losing money. 
                    You still have {(100 - (parseFloat(inputs.bushelsToHedge) / 150000 * 100)).toFixed(0)}% of crop unhedged to benefit from price rallies.
                  </p>
                </div>
              </div>

              {/* Action Steps */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Next Steps:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                    <div>
                      <div className="font-semibold text-gray-900">Secure Margin Funds</div>
                      <div className="text-sm text-gray-600">Have ${result.estimatedMargin.toLocaleString()} available in brokerage account</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                    <div>
                      <div className="font-semibold text-gray-900">Place Hedge Order</div>
                      <div className="text-sm text-gray-600">Sell {result.contractsNeeded} futures contracts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                    <div>
                      <div className="font-semibold text-gray-900">Track Position</div>
                      <div className="text-sm text-gray-600">Monitor daily, but don't panic on normal market moves</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                    <div>
                      <div className="font-semibold text-gray-900">Close Before Delivery</div>
                      <div className="text-sm text-gray-600">Exit hedge 2-4 weeks before contract expiration</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download/Share */}
              <div className="flex gap-4">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all">
                  Download Hedge Plan PDF
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all">
                  Email to Myself
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Farmer Wisdom</h3>
          <p className="text-gray-700 mb-2">
            <strong>"You can't go broke taking a profit."</strong>
          </p>
          <p className="text-gray-700">
            If the price is good TODAY and covers your costs with profit, protect some of it. 
            Most farmers hedge 20-40% to balance protection with flexibility. You can always sell more if prices rally.
          </p>
        </div>
      </div>
    </div>
  );
}
