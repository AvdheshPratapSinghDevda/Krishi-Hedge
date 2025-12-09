'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function DecisionHelperCalculator() {
  const [inputs, setInputs] = useState({
    currentFutures: '',
    breakEven: '',
    expectedYield: '',
    acres: '',
    cropOutlook: 'good' as 'good' | 'uncertain' | 'poor',
    marketSentiment: 'bullish' as 'bullish' | 'bearish' | 'neutral'
  });

  const [result, setResult] = useState<{
    decision: 'YES' | 'MAYBE' | 'NOT_YET';
    profitMargin: number;
    recommendation: string;
    hedgePercentage: string;
    reasoning: string[];
    nextSteps: string[];
  } | null>(null);

  const analyzeDecision = () => {
    const futures = parseFloat(inputs.currentFutures) || 0;
    const breakEven = parseFloat(inputs.breakEven) || 0;
    
    if (futures === 0 || breakEven === 0) {
      alert('Please enter futures price and break-even');
      return;
    }

    const profitMargin = futures - breakEven;
    let decision: 'YES' | 'MAYBE' | 'NOT_YET';
    let recommendation: string;
    let hedgePercentage: string;
    let reasoning: string[] = [];
    let nextSteps: string[] = [];

    // Decision Logic
    if (profitMargin > 0.50) {
      decision = 'YES';
      recommendation = 'Strong hedge candidate';
      
      // Adjust based on crop outlook and sentiment
      if (inputs.cropOutlook === 'good' && inputs.marketSentiment === 'bearish') {
        hedgePercentage = '40-60%';
        reasoning = [
          `Excellent profit margin of ₹${profitMargin.toFixed(2)}/bu`,
          'Good crop outlook means you likely have the bushels',
          'Bearish market sentiment suggests prices may fall',
          'Lock in profits now to protect your operation'
        ];
      } else if (inputs.cropOutlook === 'good') {
        hedgePercentage = '30-40%';
        reasoning = [
          `Strong profit margin of ₹${profitMargin.toFixed(2)}/bu`,
          'Good crop outlook provides supply confidence',
          'Hedge a portion while keeping flexibility',
          'Can add more hedges if prices improve'
        ];
      } else if (inputs.cropOutlook === 'uncertain') {
        hedgePercentage = '20-30%';
        reasoning = [
          `Good profit margin of ₹${profitMargin.toFixed(2)}/bu`,
          'Uncertain crop outlook suggests caution',
          'Hedge conservatively to avoid over-commitment',
          'Adjust position as crop develops'
        ];
      } else {
        hedgePercentage = '10-20%';
        reasoning = [
          `Profit available at ₹${profitMargin.toFixed(2)}/bu`,
          'Poor crop outlook limits hedging',
          'Only hedge what you\'re confident producing',
          'Focus on crop management first'
        ];
      }

      nextSteps = [
        'Calculate exact bushels to hedge (use Hedge Planning Calculator)',
        'Check margin requirements with your broker',
        'Place hedge order within next 2-3 days',
        'Set calendar reminder to review position monthly',
        'Track local basis for delivery planning'
      ];

    } else if (profitMargin > 0.20) {
      decision = 'MAYBE';
      recommendation = 'Monitor closely - marginal opportunity';
      hedgePercentage = '10-20%';
      
      reasoning = [
        `Tight profit margin of ₹${profitMargin.toFixed(2)}/bu`,
        'After hedging costs, profit may be minimal',
        'Better opportunities may come',
        'Set price alerts for improvement'
      ];

      const targetPrice = (breakEven + 0.50).toFixed(2);
      nextSteps = [
        `Set price alert at ₹${targetPrice} (break-even + ₹50)`,
        'Monitor weather forecasts and USDA reports',
        'Review basis trends in your area',
        'Consider small hedge (10-15%) as insurance',
        'Re-calculate weekly as prices change'
      ];

    } else {
      decision = 'NOT_YET';
      recommendation = 'Wait for better prices';
      hedgePercentage = '0%';
      
      reasoning = [
        `Insufficient margin: only ₹${profitMargin.toFixed(2)}/bu`,
        profitMargin < 0 ? 'Current price is BELOW your break-even' : 'Profit too small to justify hedging costs',
        'Focus on reducing costs or improving yields',
        'Wait for market rally before hedging'
      ];

      const targetPrice = (breakEven + 0.50).toFixed(2);
      nextSteps = [
        `Set urgent price alert at ₹${targetPrice}`,
        'Review your break-even - can you reduce costs?',
        'Evaluate yield improvement opportunities',
        'Consider alternative marketing strategies',
        'Don\'t hedge at unprofitable prices'
      ];
    }

    setResult({
      decision,
      profitMargin,
      recommendation,
      hedgePercentage,
      reasoning,
      nextSteps
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
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Should I Hedge? Decision Helper</h1>
              <p className="text-gray-600">Get a clear recommendation for your farm</p>
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Current Futures Price ($/bu)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.currentFutures}
                  onChange={(e) => setInputs({...inputs, currentFutures: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-lg font-semibold"
                  placeholder="11.85"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Your Break-Even Price ($/bu)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.breakEven}
                  onChange={(e) => setInputs({...inputs, breakEven: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-lg font-semibold"
                  placeholder="10.35"
                />
                <Link href="/learn-hedging/calculators/break-even" className="text-xs text-green-600 hover:text-green-700">
                  → Calculate break-even
                </Link>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  3. Expected Yield (bu/acre)
                </label>
                <input
                  type="number"
                  value={inputs.expectedYield}
                  onChange={(e) => setInputs({...inputs, expectedYield: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  4. Total Acres
                </label>
                <input
                  type="number"
                  value={inputs.acres}
                  onChange={(e) => setInputs({...inputs, acres: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  placeholder="500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                5. What's your crop outlook?
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setInputs({...inputs, cropOutlook: 'good'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inputs.cropOutlook === 'good'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2"></div>
                  <div className="font-bold text-gray-900">Good</div>
                  <div className="text-xs text-gray-600">Confident in yield</div>
                </button>

                <button
                  onClick={() => setInputs({...inputs, cropOutlook: 'uncertain'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inputs.cropOutlook === 'uncertain'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🤔</div>
                  <div className="font-bold text-gray-900">Uncertain</div>
                  <div className="text-xs text-gray-600">Wait and see</div>
                </button>

                <button
                  onClick={() => setInputs({...inputs, cropOutlook: 'poor'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inputs.cropOutlook === 'poor'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2"></div>
                  <div className="font-bold text-gray-900">Poor</div>
                  <div className="text-xs text-gray-600">Potential loss</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                6. What's the market sentiment?
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setInputs({...inputs, marketSentiment: 'bullish'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inputs.marketSentiment === 'bullish'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2"></div>
                  <div className="font-bold text-gray-900">Bullish</div>
                  <div className="text-xs text-gray-600">Positive news</div>
                </button>

                <button
                  onClick={() => setInputs({...inputs, marketSentiment: 'bearish'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inputs.marketSentiment === 'bearish'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📉</div>
                  <div className="font-bold text-gray-900">Bearish</div>
                  <div className="text-xs text-gray-600">Negative news</div>
                </button>

                <button
                  onClick={() => setInputs({...inputs, marketSentiment: 'neutral'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    inputs.marketSentiment === 'neutral'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">➡️</div>
                  <div className="font-bold text-gray-900">Neutral</div>
                  <div className="text-xs text-gray-600">Uncertain</div>
                </button>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeDecision}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Get My Recommendation
          </button>

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Decision Card */}
              <div className={`rounded-2xl p-8 border-4 ${
                result.decision === 'YES' ? 'bg-green-50 border-green-300' :
                result.decision === 'MAYBE' ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {result.decision === 'YES' ? '' :
                     result.decision === 'MAYBE' ? '' : ''}
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
                    result.decision === 'YES' ? 'text-green-700' :
                    result.decision === 'MAYBE' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {result.decision === 'YES' ? 'YES - Hedge Now' :
                     result.decision === 'MAYBE' ? 'MAYBE - Monitor Closely' :
                     'NOT YET - Wait'}
                  </h2>
                  <p className="text-base md:text-lg text-gray-700">{result.recommendation}</p>
                </div>

                <div className="bg-white rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Profit Margin if Locked</div>
                      <div className={`text-3xl font-bold ${
                        result.profitMargin > 0.50 ? 'text-green-600' :
                        result.profitMargin > 0.20 ? 'text-yellow-600' :
                        result.profitMargin > 0 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        ${result.profitMargin.toFixed(2)}/bu
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Recommended Hedge</div>
                      <div className="text-3xl font-bold text-gray-900">{result.hedgePercentage}</div>
                      <div className="text-sm text-gray-600">of expected production</div>
                    </div>
                  </div>

                  {inputs.expectedYield && inputs.acres && (
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="text-sm text-gray-600 mb-1">That's approximately:</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {(() => {
                          const totalBushels = parseFloat(inputs.expectedYield) * parseFloat(inputs.acres);
                          const hedgePercentNum = parseInt(result.hedgePercentage.split('-')[0]) / 100;
                          const hedgeBushels = Math.round(totalBushels * hedgePercentNum);
                          return hedgeBushels.toLocaleString();
                        })()}
                      </div>
                      <div className="text-sm text-gray-600">bushels to hedge</div>
                    </div>
                  )}
                </div>

                {/* Reasoning */}
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Why This Recommendation:</h3>
                  <div className="space-y-3">
                    {result.reasoning.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          result.decision === 'YES' ? 'text-green-600' :
                          result.decision === 'MAYBE' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <span className="text-gray-700">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Your Next Steps:</h3>
                  <div className="space-y-3">
                    {result.nextSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                          result.decision === 'YES' ? 'bg-green-600' :
                          result.decision === 'MAYBE' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {result.decision === 'YES' && (
                <div className="flex gap-4">
                  <Link href="/learn-hedging/calculators/hedge-planning" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-center transition-all">
                    Build Full Hedge Plan →
                  </Link>
                  <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all">
                    Download Recommendation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Decision-Making Tip</h3>
          <p className="text-gray-700 mb-3">
            <strong>The golden rule:</strong> If you can lock in a profit that covers your costs and living expenses, 
            protect at least part of it. Don't get greedy waiting for the absolute top.
          </p>
          <p className="text-gray-700">
            Markets can turn fast. A bird in hand (locked profit) is worth two in the bush (hoping for higher prices).
          </p>
        </div>
      </div>
    </div>
  );
}
