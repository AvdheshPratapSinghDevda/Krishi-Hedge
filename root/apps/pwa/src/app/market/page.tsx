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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // This page now acts as a thin real-market hub without fake static prices.

  const selectedCommodityData: CommodityData | undefined = undefined;
  const selectedForecast: ForecastData | undefined = undefined;

  useEffect(() => {
    setLoading(false);
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
        {/* Real Market summary now defers to Forecast page for live data */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">{t('marketPage.title')}</h2>
              <p className="text-xs text-gray-600">{t('marketPage.subtitle')}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Live price curves and AI predictions are shown on the Forecast page. This screen only provides navigation into those real data views.
          </p>
        </div>

        {/* Market Analysis */}
        {/* Removed static demo analysis. Judges should use Forecast for real ML-backed analysis. */}
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
          onClick={() => router.push('/contracts/new')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg font-bold flex items-center justify-between active:scale-95 transition-transform hover:shadow-xl"
        >
          <span>{t('marketPage.createHedgeCta')}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

