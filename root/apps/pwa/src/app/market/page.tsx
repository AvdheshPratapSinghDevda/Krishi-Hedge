'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  RefreshCw,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
interface CommodityData {
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string;
}

interface ForecastData {
  commodity: string;
  prediction30Day: number;
  prediction60Day: number;
  prediction90Day: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export default function MarketPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('Soybean');
  const [refreshing, setRefreshing] = useState(false);

  const commodities: CommodityData[] = [
    {
      name: 'Soybean',
      currentPrice: 4580,
      change: 125,
      changePercent: 2.81,
      high: 4620,
      low: 4455,
      volume: 15420,
      lastUpdated: '2 mins ago'
    },
    {
      name: 'Mustard',
      currentPrice: 5240,
      change: -85,
      changePercent: -1.59,
      high: 5325,
      low: 5190,
      volume: 12350,
      lastUpdated: '5 mins ago'
    },
    {
      name: 'Groundnut',
      currentPrice: 5890,
      change: 210,
      changePercent: 3.70,
      high: 5920,
      low: 5680,
      volume: 9870,
      lastUpdated: '1 min ago'
    },
    {
      name: 'Sunflower',
      currentPrice: 6150,
      change: 45,
      changePercent: 0.74,
      high: 6185,
      low: 6105,
      volume: 7650,
      lastUpdated: '4 mins ago'
    }
  ];

  const forecasts: ForecastData[] = [
    {
      commodity: 'Soybean',
      prediction30Day: 4720,
      prediction60Day: 4850,
      prediction90Day: 4980,
      confidence: 87,
      trend: 'bullish'
    },
    {
      commodity: 'Mustard',
      prediction30Day: 5180,
      prediction60Day: 5120,
      prediction90Day: 5050,
      confidence: 82,
      trend: 'bearish'
    },
    {
      commodity: 'Groundnut',
      prediction30Day: 6050,
      prediction60Day: 6180,
      prediction90Day: 6290,
      confidence: 89,
      trend: 'bullish'
    },
    {
      commodity: 'Sunflower',
      prediction30Day: 6170,
      prediction60Day: 6190,
      prediction90Day: 6210,
      confidence: 76,
      trend: 'neutral'
    }
  ];

  const selectedCommodityData = commodities.find(c => c.name === selectedCommodity);
  const selectedForecast = forecasts.find(f => f.commodity === selectedCommodity);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-6 pt-6 pb-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/')} 
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('marketPage.title')}</h1>
                <p className="text-sm text-blue-100">{t('marketPage.subtitle')}</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className={`w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Live Market Indicator */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">{t('marketPage.liveBadge')}</span>
          </div>
        </div>
      </header>

      <div className="px-5 mt-6 space-y-4">
        {/* Commodity Selector */}
        <div className="grid grid-cols-2 gap-3">
          {commodities.map((commodity) => (
            <button
              key={commodity.name}
              onClick={() => setSelectedCommodity(commodity.name)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCommodity === commodity.name
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white border-gray-200 text-gray-900 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{commodity.name}</span>
                {commodity.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <div className="text-left">
                <p className={`text-lg font-bold ${selectedCommodity === commodity.name ? 'text-white' : 'text-gray-900'}`}>
                  ₹{commodity.currentPrice.toLocaleString('en-IN')}
                </p>
                <p className={`text-xs font-semibold ${
                  selectedCommodity === commodity.name 
                    ? commodity.change >= 0 ? 'text-green-200' : 'text-red-200'
                    : commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {commodity.change >= 0 ? '+' : ''}{commodity.change} ({commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent}%)
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Current Market Data */}
        {selectedCommodityData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {selectedCommodityData.name} - Current Market
              </h3>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                selectedCommodityData.change >= 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedCommodityData.change >= 0 ? '↑' : '↓'} {Math.abs(selectedCommodityData.changePercent)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('marketPage.currentPrice')}</p>
                <p className="text-2xl font-bold text-gray-900">₹{selectedCommodityData.currentPrice.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">per quintal</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('marketPage.dailyVolume')}</p>
                <p className="text-2xl font-bold text-gray-900">{selectedCommodityData.volume.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">quintals</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('marketPage.dayHigh')}</p>
                <p className="text-sm font-bold text-green-600">₹{selectedCommodityData.high.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('marketPage.dayLow')}</p>
                <p className="text-sm font-bold text-red-600">₹{selectedCommodityData.low.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('marketPage.lastUpdated')}</p>
                <p className="text-sm font-bold text-gray-700">{selectedCommodityData.lastUpdated}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Forecast Section */}
        {selectedForecast && (
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white rounded-2xl shadow-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <LineChartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t('marketPage.aiForecastTitle')}</h3>
                    <p className="text-xs text-blue-100">{t('marketPage.aiForecastSubtitle')}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  selectedForecast.trend === 'bullish'
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                    : selectedForecast.trend === 'bearish'
                    ? 'bg-red-500/20 text-red-100 border border-red-400/30'
                    : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                }`}>
                  {selectedForecast.trend === 'bullish' ? '↑ Bullish' : selectedForecast.trend === 'bearish' ? '↓ Bearish' : '→ Neutral'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-xs text-blue-100 mb-1">30 Days</p>
                  <p className="text-lg font-bold">₹{selectedForecast.prediction30Day.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-blue-200 mt-1">
                    {selectedCommodityData && (
                      <>
                        {selectedForecast.prediction30Day >= selectedCommodityData.currentPrice ? '+' : ''}
                        {((selectedForecast.prediction30Day - selectedCommodityData.currentPrice) / selectedCommodityData.currentPrice * 100).toFixed(1)}%
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-xs text-blue-100 mb-1">60 Days</p>
                  <p className="text-lg font-bold">₹{selectedForecast.prediction60Day.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-blue-200 mt-1">
                    {selectedCommodityData && (
                      <>
                        {selectedForecast.prediction60Day >= selectedCommodityData.currentPrice ? '+' : ''}
                        {((selectedForecast.prediction60Day - selectedCommodityData.currentPrice) / selectedCommodityData.currentPrice * 100).toFixed(1)}%
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-xs text-blue-100 mb-1">90 Days</p>
                  <p className="text-lg font-bold">₹{selectedForecast.prediction90Day.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-blue-200 mt-1">
                    {selectedCommodityData && (
                      <>
                        {selectedForecast.prediction90Day >= selectedCommodityData.currentPrice ? '+' : ''}
                        {((selectedForecast.prediction90Day - selectedCommodityData.currentPrice) / selectedCommodityData.currentPrice * 100).toFixed(1)}%
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-blue-100">Model Confidence</span>
                  <span className="font-bold">{selectedForecast.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${selectedForecast.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Analysis */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">{t('marketPage.marketAnalysisTitle')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{t('marketPage.priceTrendTitle')}</p>
                <p className="text-xs text-gray-600">
                  {selectedForecast?.trend === 'bullish' 
                    ? `${selectedCommodity} shows strong upward momentum with predicted ${selectedForecast.confidence}% confidence in price appreciation.`
                    : selectedForecast?.trend === 'bearish'
                    ? `${selectedCommodity} indicates downward pressure with ${selectedForecast.confidence}% model confidence for price correction.`
                    : `${selectedCommodity} demonstrates stable pricing patterns with minimal volatility expected.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{t('marketPage.tradingVolumeTitle')}</p>
                <p className="text-xs text-gray-600">
                  Current trading volume at {selectedCommodityData?.volume.toLocaleString('en-IN')} quintals indicates {selectedCommodityData && selectedCommodityData.volume > 10000 ? 'high' : 'moderate'} market activity and liquidity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{t('marketPage.seasonalTitle')}</p>
                <p className="text-xs text-gray-600">
                  December harvest season approaching. Historical data suggests seasonal price adjustments in Q1 2026.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => {
            const params = new URLSearchParams();
            if (selectedCommodity) params.set('crop', selectedCommodity);
            if (selectedCommodityData) params.set('price', String(selectedCommodityData.currentPrice));
            router.push(`/contracts/new?${params.toString()}`);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg font-bold flex items-center justify-between active:scale-95 transition-transform hover:shadow-xl"
        >
          <span>{t('marketPage.createHedgeCta')}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

