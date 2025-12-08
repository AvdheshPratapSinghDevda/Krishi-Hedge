'use client';

import { useState, useEffect } from 'react';
import { marketEngine } from '@/lib/sandbox/market-engine';
import { SandboxCommodity } from '@/lib/sandbox/types';

interface MarketPriceWidgetProps {
  commodity: string;
  showTrend?: boolean;
}

export function MarketPriceWidget({ commodity, showTrend = true }: MarketPriceWidgetProps) {
  const [price, setPrice] = useState<SandboxCommodity | null>(null);

  useEffect(() => {
    const updatePrice = () => {
      const p = marketEngine.getCommodity(commodity);
      if (p) setPrice(p);
    };

    updatePrice();
    const interval = setInterval(updatePrice, 1000);
    return () => clearInterval(interval);
  }, [commodity]);

  if (!price) return null;

  const trendIcon = price.trend === 'bullish' ? 'fa-arrow-trend-up' : price.trend === 'bearish' ? 'fa-arrow-trend-down' : 'fa-minus';
  const trendColor = price.trend === 'bullish' ? 'text-green-600' : price.trend === 'bearish' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Market Price</p>
          <p className="text-2xl font-bold text-gray-800">₹{price.currentPrice.toLocaleString()}</p>
        </div>
        {showTrend && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <i className={`fa-solid ${trendIcon}`}></i>
            <span className="text-sm font-bold">{price.trend === 'stable' ? 'Stable' : price.trend}</span>
          </div>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-purple-200 flex items-center justify-between text-xs text-gray-600">
        <span>Demand: {price.demandLevel}</span>
        <span className="text-purple-600 font-bold">Live</span>
      </div>
    </div>
  );
}