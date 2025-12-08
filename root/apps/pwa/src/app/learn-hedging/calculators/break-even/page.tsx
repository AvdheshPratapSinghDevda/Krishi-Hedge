'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowLeft, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function BreakEvenCalculator() {
  const [inputs, setInputs] = useState({
    seedCost: '',
    fertilizerCost: '',
    chemicalsCost: '',
    fuelMachineryCost: '',
    landCost: '',
    laborCost: '',
    insuranceCost: '',
    financingCost: '',
    dryingStorageCost: '',
    expectedYield: ''
  });

  const [result, setResult] = useState<{
    breakEven: number;
    totalCostPerAcre: number;
    currentFuturesPrice: number;
    profitMargin: number;
    profitPerAcre: number;
    totalAcresProfit: number;
  } | null>(null);

  const [acres, setAcres] = useState('');

  const calculateBreakEven = () => {
    const costs = {
      seed: parseFloat(inputs.seedCost) || 0,
      fertilizer: parseFloat(inputs.fertilizerCost) || 0,
      chemicals: parseFloat(inputs.chemicalsCost) || 0,
      fuelMachinery: parseFloat(inputs.fuelMachineryCost) || 0,
      land: parseFloat(inputs.landCost) || 0,
      labor: parseFloat(inputs.laborCost) || 0,
      insurance: parseFloat(inputs.insuranceCost) || 0,
      financing: parseFloat(inputs.financingCost) || 0,
      dryingStorage: parseFloat(inputs.dryingStorageCost) || 0,
    };

    const totalCostPerAcre = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    const yield_per_acre = parseFloat(inputs.expectedYield) || 0;

    if (yield_per_acre === 0) {
      alert('Please enter expected yield');
      return;
    }

    const breakEvenPrice = totalCostPerAcre / yield_per_acre;
    const currentFutures = 11.85; // Mock current futures price
    const profitMargin = currentFutures - breakEvenPrice;
    const profitPerAcre = profitMargin * yield_per_acre;
    const farmAcres = parseFloat(acres) || 0;
    const totalProfit = profitPerAcre * farmAcres;

    setResult({
      breakEven: breakEvenPrice,
      totalCostPerAcre,
      currentFuturesPrice: currentFutures,
      profitMargin,
      profitPerAcre,
      totalAcresProfit: totalProfit
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <Link href="/learn-hedging" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Learning</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calculator className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Break-Even Calculator</h1>
              <p className="text-gray-600">Calculate your true cost per bushel</p>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seed Cost per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.seedCost}
                  onChange={(e) => setInputs({...inputs, seedCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fertilizer per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.fertilizerCost}
                  onChange={(e) => setInputs({...inputs, fertilizerCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="180"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chemicals per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.chemicalsCost}
                  onChange={(e) => setInputs({...inputs, chemicalsCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="75"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel & Machinery per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.fuelMachineryCost}
                  onChange={(e) => setInputs({...inputs, fuelMachineryCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="95"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Land Cost per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.landCost}
                  onChange={(e) => setInputs({...inputs, landCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="250"
                />
                <p className="text-xs text-gray-500 mt-1">Cash rent or ownership cost</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Labor per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.laborCost}
                  onChange={(e) => setInputs({...inputs, laborCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Insurance per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.insuranceCost}
                  onChange={(e) => setInputs({...inputs, insuranceCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interest/Financing per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.financingCost}
                  onChange={(e) => setInputs({...inputs, financingCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Drying/Storage per Acre ($)</label>
                <input
                  type="number"
                  value={inputs.dryingStorageCost}
                  onChange={(e) => setInputs({...inputs, dryingStorageCost: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Yield (bu/acre)</label>
                <input
                  type="number"
                  value={inputs.expectedYield}
                  onChange={(e) => setInputs({...inputs, expectedYield: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Acres</label>
              <input
                type="number"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                placeholder="500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBreakEven}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Calculate Break-Even
          </button>

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Results</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Cost per Acre</div>
                    <div className="text-2xl font-bold text-gray-900">₹{result.totalCostPerAcre.toFixed(2)}</div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Your Break-Even Price</div>
                    <div className="text-2xl font-bold text-orange-600">₹{result.breakEven.toFixed(2)}/bu</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Current Futures Price</div>
                      <div className="text-xl font-bold text-gray-900">₹{result.currentFuturesPrice.toFixed(2)}/bu</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-1">Potential Profit if Hedged</div>
                    <div className="text-2xl font-bold text-green-600">₹{result.profitMargin.toFixed(2)}/bu</div>
                    <div className="text-base text-gray-700 mt-2">= ₹{result.profitPerAcre.toFixed(2)}/acre</div>
                  </div>
                </div>

                {acres && (
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 text-center">
                    <div className="text-xs font-semibold mb-2">Total Profit You Can LOCK IN Today</div>
                    <div className="text-3xl font-bold mb-2 break-words">₹{result.totalAcresProfit.toLocaleString()}</div>
                    <div className="text-green-100 text-sm">On {acres} acres</div>
                  </div>
                )}
              </div>

              {/* Recommendation */}
              <div className={`rounded-xl p-6 border-2 ${
                result.profitMargin > 0.50 ? 'bg-green-50 border-green-300' :
                result.profitMargin > 0.20 ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-1 ${
                    result.profitMargin > 0.50 ? 'text-green-600' :
                    result.profitMargin > 0.20 ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {result.profitMargin > 0.50 ? 'Strong Hedge Candidate' :
                       result.profitMargin > 0.20 ? 'Monitor Closely' :
                       'Wait for Better Prices'}
                    </h4>
                    <p className="text-gray-700 text-sm">
                      {result.profitMargin > 0.50 && 
                        `Excellent! You have ₹${result.profitMargin.toFixed(2)}/bu profit margin. Consider hedging 25-40% of expected production to lock in this profit.`
                      }
                      {result.profitMargin > 0.20 && result.profitMargin <= 0.50 && 
                        `Moderate profit margin of ₹${result.profitMargin.toFixed(2)}/bu. Set price alerts. If prices improve to ₹${(result.breakEven + 0.50).toFixed(2)}, consider hedging.`
                      }
                      {result.profitMargin <= 0.20 && 
                        `Profit margin of only ₹${result.profitMargin.toFixed(2)}/bu is too tight. Focus on crop management to boost yields or wait for prices above ₹${(result.breakEven + 0.50).toFixed(2)}.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="flex gap-4">
                <Link href="/learn-hedging/calculators/hedge-planning" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-center transition-all">
                  Build Hedge Plan →
                </Link>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all">
                  Download Results
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Farmer Tip</h3>
          <p className="text-gray-700">
            Update this calculator every season as your costs change. Knowing your TRUE break-even is the foundation of smart marketing. 
            Most farmers underestimate their costs and hedge too late or not at all.
          </p>
        </div>
      </div>
    </div>
  );
}
