'use client';

import { Achievement } from '@/lib/sandbox/types';
import { useEffect, useState } from 'react';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white rounded-2xl shadow-2xl p-5 max-w-sm border-4 border-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl animate-bounce">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-yellow-200 mb-1">🎉 ACHIEVEMENT UNLOCKED!</p>
            <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
            <p className="text-sm text-white/90">{achievement.description}</p>
            <p className="text-xs text-yellow-200 mt-2">+{achievement.reward.xp} XP</p>
          </div>
        </div>
      </div>
    </div>
  );
}