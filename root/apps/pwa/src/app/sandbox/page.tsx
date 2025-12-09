'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { SandboxPlayer } from '@/lib/sandbox/types';
import { progressionManager, LEVELS } from '@/lib/sandbox/progression';
import { marketEngine } from '@/lib/sandbox/market-engine';
import { useI18n } from '@/i18n/LanguageProvider';

export default function SandboxDashboard() {
  const router = useRouter();
  const { t } = useI18n();
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketEngine.startAutoUpdate();
    
    let p = sandboxStorage.getPlayer();
    if (!p) {
      const profileStr = typeof window !== 'undefined' ? localStorage.getItem('kh_profile') : null;
      const name = profileStr ? JSON.parse(profileStr).fullName || 'Player' : 'Player';
      p = sandboxStorage.createNewPlayer(name);
    }
    
    // Ensure stats object exists with all properties
    if (!p.stats) {
      p.stats = {
        totalTrades: 0,
        winRate: 0,
        totalProfit: 0,
        currentStreak: 0,
        bestStreak: 0
      };
      sandboxStorage.savePlayer(p);
    }
    
    setPlayer(p);
    setLoading(false);

    return () => {
      marketEngine.stopAutoUpdate();
    };
  }, []);

  if (loading || !player || !player.stats) {
    return <div className="min-h-screen bg-purple-50 flex items-center justify-center pb-20">
      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
    </div>;
  }

  const levelInfo = progressionManager.getLevelInfo(player.level);
  const nextLevel = LEVELS.find(l => l.level === player.level + 1);
  const progressToNext = nextLevel 
    ? ((player.xp - levelInfo.xpRequired) / (nextLevel.xpRequired - levelInfo.xpRequired)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-24">
      <header className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 text-white px-6 pt-6 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-gamepad text-yellow-300"></i>
              <span className="text-sm font-bold text-yellow-300">{t('sandbox.badge')}</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">{t('sandbox.title')}</h1>
          <p className="text-purple-200 text-sm mb-6">{t('sandbox.subtitle')}</p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-purple-200 mb-1">Virtual Balance</p>
                <p className="text-3xl font-bold">₹{(player.balance / 100000).toFixed(1)}L</p>
              </div>
              <div className={`px-3 py-1.5 ${levelInfo.badge.color} rounded-lg`}>
                <p className="text-xs font-bold text-white">
                  <i className={`fa-solid ${levelInfo.badge.icon} mr-1`}></i>
                  Lvl {player.level}
                </p>
                <p className="text-xs text-white/90">{levelInfo.title}</p>
              </div>
            </div>

            {nextLevel && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-200">XP Progress</span>
                  <span className="text-white font-bold">{player.xp} / {nextLevel.xpRequired}</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] text-yellow-100 border border-yellow-200/40">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{t('sandbox.disclaimer')}</span>
        </div>
      </header>

      <div className="px-6 -mt-8 relative z-10 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-lg"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('sandbox.stats.totalTrades')}</p>
            <p className="text-2xl font-bold text-gray-800">{player.stats.totalTrades}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-bullseye text-lg"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('sandbox.stats.winRate')}</p>
            <p className="text-2xl font-bold text-gray-800">{player.stats.winRate}%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-wallet text-lg"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('sandbox.stats.totalProfit')}</p>
            <p className="text-2xl font-bold text-gray-800">₹{(player.stats.totalProfit / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-fire text-lg"></i>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('sandbox.stats.currentStreak')}</p>
            <p className="text-2xl font-bold text-gray-800">{player.stats.currentStreak}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
            <h2 className="font-bold text-lg mb-1">{t('sandbox.practice.title')}</h2>
            <p className="text-sm text-purple-100">{t('sandbox.practice.subtitle')}</p>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={() => router.push('/sandbox/farmer')}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:border-green-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <i className="fa-solid fa-user-tie text-xl"></i>
                  </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">{t('sandbox.practice.playSellerTitle')}</h3>
                      <p className="text-xs text-gray-600">{t('sandbox.practice.playSellerSubtitle')}</p>
                    </div>
                </div>
                <i className="fa-solid fa-arrow-right text-green-600 group-hover:translate-x-1 transition"></i>
              </div>
            </button>

            <button
              onClick={() => router.push('/sandbox/buyer')}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <i className="fa-solid fa-shopping-cart text-xl"></i>
                  </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">{t('sandbox.practice.playBuyerTitle')}</h3>
                      <p className="text-xs text-gray-600">{t('sandbox.practice.playBuyerSubtitle')}</p>
                    </div>
                </div>
                <i className="fa-solid fa-arrow-right text-blue-600 group-hover:translate-x-1 transition"></i>
              </div>
            </button>

            <button
              onClick={() => router.push('/sandbox/futures')}
              className="w-full bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4 hover:border-orange-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <i className="fa-solid fa-chart-candlestick text-xl"></i>
                  </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">{t('sandbox.practice.futuresTitle')}</h3>
                      <p className="text-xs text-gray-600">{t('sandbox.practice.futuresSubtitle')}</p>
                    </div>
                </div>
                <i className="fa-solid fa-arrow-right text-orange-600 group-hover:translate-x-1 transition"></i>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-yellow-600 text-xl"></i>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{t('sandbox.quickTip.title')}</h4>
              <p className="text-xs text-gray-700">
                {player.stats.totalTrades === 0 
                  ? t('sandbox.quickTip.start')
                  : player.stats.winRate < 50
                  ? t('sandbox.quickTip.lowWinRate')
                  : t('sandbox.quickTip.goodWinRate')
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
