'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, TrendingDown, Lock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const COMMODITIES = [
  { value: 'soybean', label: 'Soybean', avgPrice: 4500 },
  { value: 'mustard', label: 'Mustard', avgPrice: 5500 },
  { value: 'groundnut', label: 'Groundnut', avgPrice: 5200 },
  { value: 'sunflower', label: 'Sunflower', avgPrice: 5800 },
];

const HEDGE_TYPES = [
  {
    value: 'price_floor',
    label: 'Price Floor Protection',
    icon: TrendingDown,
    description: 'Protect against price drops. Get guaranteed minimum price.',
    premium: 3,
    color: 'green'
  },
  {
    value: 'price_ceiling',
    label: 'Price Ceiling Lock',
    icon: Shield,
    description: 'Lock in current prices to avoid future increases.',
    premium: 2.5,
    color: 'blue'
  },
  {
    value: 'fixed_price',
    label: 'Fixed Price Contract',
    icon: Lock,
    description: 'Agree on exact price today for future delivery.',
    premium: 4,
    color: 'purple'
  }
];

export default function CreateHedgeContract() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    commodity: '',
    quantity: '',
    hedgeType: 'price_floor',
    strikePrice: '',
    expiryMonths: '3',
    fpoId: '',
    notes: ''
  });
  const [estimatedPremium, setEstimatedPremium] = useState(0);
  const [creating, setCreating] = useState(false);

  const selectedCommodity = COMMODITIES.find(c => c.value === formData.commodity);
  const selectedHedgeType = HEDGE_TYPES.find(h => h.value === formData.hedgeType);

  const calculatePremium = () => {
    if (!selectedCommodity || !formData.quantity || !formData.strikePrice) return 0;
    const qty = parseFloat(formData.quantity);
    const strike = parseFloat(formData.strikePrice);
    const premiumRate = selectedHedgeType?.premium || 3;
    return Math.round(qty * strike * (premiumRate / 100));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Recalculate premium
    if (field === 'quantity' || field === 'strikePrice' || field === 'hedgeType') {
      setTimeout(() => {
        setEstimatedPremium(calculatePremium());
      }, 100);
    }
  };

  const handleSubmit = async () => {
    setCreating(true);
    
    try {
      const response = await fetch('/api/hedge/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          premium: estimatedPremium,
          status: 'open',
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const contract = await response.json();
        router.push(`/hedge/contract/${contract.id}`);
      } else {
        alert('Failed to create contract. Please try again.');
      }
    } catch (error) {
      console.error('Error creating hedge:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => router.push('/hedge')}
            className="flex items-center gap-2 mb-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
          <h1 className="text-3xl font-bold mb-2">Create Hedge Contract</h1>
          <p className="text-green-100">Protect your crop prices with a futures hedge</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s === step 
                  ? 'bg-green-600 text-white' 
                  : s < step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Commodity & Quantity */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Commodity & Quantity</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Commodity</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMODITIES.map(comm => (
                    <button
                      key={comm.value}
                      onClick={() => {
                        handleInputChange('commodity', comm.value);
                        if (!formData.strikePrice) {
                          handleInputChange('strikePrice', comm.avgPrice.toString());
                        }
                      }}
                      className={`p-4 border-2 rounded-lg transition ${
                        formData.commodity === comm.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{comm.label}</div>
                      <div className="text-xs text-gray-500">Avg: ₹{comm.avgPrice}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity (quintals)
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Enter quantity in quintals"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition"
                  min="1"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Minimum: 10 quintals | Maximum: 1000 quintals
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.commodity || !formData.quantity || parseFloat(formData.quantity) < 10}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue to Hedge Type →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Hedge Type & Strike Price */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Hedge Strategy</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Hedge Type</label>
                <div className="space-y-3">
                  {HEDGE_TYPES.map(hedge => {
                    const Icon = hedge.icon;
                    return (
                      <button
                        key={hedge.value}
                        onClick={() => handleInputChange('hedgeType', hedge.value)}
                        className={`w-full p-4 border-2 rounded-lg transition text-left ${
                          formData.hedgeType === hedge.value
                            ? `border-${hedge.color}-600 bg-${hedge.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-${hedge.color}-100`}>
                            <Icon className={`w-6 h-6 text-${hedge.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{hedge.label}</h3>
                            <p className="text-sm text-gray-600 mb-2">{hedge.description}</p>
                            <p className="text-xs font-semibold text-orange-600">
                              Premium: {hedge.premium}% of contract value
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Strike Price (₹ per quintal)
                </label>
                <input
                  type="number"
                  value={formData.strikePrice}
                  onChange={(e) => handleInputChange('strikePrice', e.target.value)}
                  placeholder="Enter strike price"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition"
                  min="100"
                />
                {selectedCommodity && (
                  <p className="mt-2 text-sm text-gray-500">
                    Current market average: ₹{selectedCommodity.avgPrice} per quintal
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contract Duration
                </label>
                <select
                  value={formData.expiryMonths}
                  onChange={(e) => handleInputChange('expiryMonths', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition"
                >
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setEstimatedPremium(calculatePremium());
                    setStep(3);
                  }}
                  disabled={!formData.strikePrice || parseFloat(formData.strikePrice) < 100}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Review Contract →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Hedge Contract</h2>
            
            <div className="space-y-6">
              {/* Summary Box */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commodity</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedCommodity?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="text-lg font-bold text-gray-900">{formData.quantity} quintals</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hedge Type</p>
                    <p className="text-lg font-bold text-gray-900">{selectedHedgeType?.label}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Strike Price</p>
                    <p className="text-lg font-bold text-green-600">₹{parseFloat(formData.strikePrice).toLocaleString()}/quintal</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contract Duration</p>
                    <p className="text-lg font-bold text-gray-900">{formData.expiryMonths} Months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(Date.now() + parseInt(formData.expiryMonths) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Total Contract Value:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{(parseFloat(formData.quantity) * parseFloat(formData.strikePrice)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Premium ({selectedHedgeType?.premium}%):</span>
                    <span className="text-xl font-bold text-orange-600">
                      ₹{estimatedPremium.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* FPO Selection (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  FPO Association (Optional)
                </label>
                <select
                  value={formData.fpoId}
                  onChange={(e) => handleInputChange('fpoId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition"
                >
                  <option value="">No FPO (Individual Contract)</option>
                  <option value="fpo-1">Gujarat Groundnut FPO</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  FPO-backed contracts often get higher buyer trust and better matching.
                </p>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any special conditions or notes for buyers..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition resize-none"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important Terms:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>Premium must be paid upfront to activate the contract</li>
                      <li>Contract becomes binding once matched with a buyer</li>
                      <li>Settlement occurs on expiry date at prevailing market price</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                  disabled={creating}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={creating}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Contract...
                    </span>
                  ) : (
                    'Create Hedge Contract'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
