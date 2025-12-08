// Sandbox Trading Mode - Progression System

import { Level, Achievement, SandboxPlayer } from './types';

export const LEVELS: Level[] = [
  {
    level: 1,
    title: 'Rookie Trader',
    xpRequired: 0,
    unlocks: ['Basic contracts', 'Easy AI'],
    badge: { color: 'bg-gray-500', icon: 'fa-seedling' }
  },
  {
    level: 2,
    title: 'Apprentice',
    xpRequired: 500,
    unlocks: ['Medium AI', 'Market trends'],
    badge: { color: 'bg-blue-500', icon: 'fa-graduation-cap' }
  },
  {
    level: 3,
    title: 'Trader',
    xpRequired: 1500,
    unlocks: ['Advanced stats', 'Price history'],
    badge: { color: 'bg-green-500', icon: 'fa-chart-line' }
  },
  {
    level: 4,
    title: 'Expert',
    xpRequired: 3500,
    unlocks: ['Hard AI', 'All commodities'],
    badge: { color: 'bg-purple-500', icon: 'fa-star' }
  },
  {
    level: 5,
    title: 'Master',
    xpRequired: 7000,
    unlocks: ['Demand insights', 'Tips disabled'],
    badge: { color: 'bg-orange-500', icon: 'fa-crown' }
  },
  {
    level: 6,
    title: 'Legend',
    xpRequired: 12000,
    unlocks: ['Elite achievements', 'Leaderboard'],
    badge: { color: 'bg-red-500', icon: 'fa-trophy' }
  },
  {
    level: 7,
    title: 'Grandmaster',
    xpRequired: 20000,
    unlocks: ['All features', 'Special badge'],
    badge: { color: 'bg-gradient-to-r from-yellow-400 to-orange-500', icon: 'fa-gem' }
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Complete your first trade',
    icon: 'fa-handshake',
    requirement: { type: 'trades', value: 1 },
    reward: { xp: 100 },
    unlocked: false
  },
  {
    id: 'ten_trades',
    name: 'Getting Started',
    description: 'Complete 10 trades',
    icon: 'fa-fire',
    requirement: { type: 'trades', value: 10 },
    reward: { xp: 500, bonus: 50000 },
    unlocked: false
  },
  {
    id: 'profit_1l',
    name: 'Profitable',
    description: 'Earn ₹1 Lakh profit',
    icon: 'fa-money-bill-wave',
    requirement: { type: 'profit', value: 100000 },
    reward: { xp: 750 },
    unlocked: false
  },
  {
    id: 'streak_5',
    name: 'Hot Streak',
    description: 'Win 5 trades in a row',
    icon: 'fa-bolt',
    requirement: { type: 'streak', value: 5 },
    reward: { xp: 600 },
    unlocked: false
  }
];

class ProgressionManager {
  
  getLevelFromXP(xp: number): number {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i].level;
      }
    }
    return 1;
  }

  getLevelInfo(level: number): Level {
    return LEVELS.find(l => l.level === level) || LEVELS[0];
  }

  calculateXP(profit: number, isProfitable: boolean): number {
    let baseXP = 50;
    
    if (isProfitable) {
      const profitBonus = Math.min(Math.floor(profit / 1000), 100);
      baseXP += profitBonus;
    } else {
      baseXP = 20;
    }

    return baseXP;
  }

  checkAchievements(player: SandboxPlayer): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (player.achievements.includes(achievement.id)) return;

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case 'trades':
          shouldUnlock = player.stats.totalTrades >= achievement.requirement.value;
          break;
        case 'profit':
          shouldUnlock = player.stats.totalProfit >= achievement.requirement.value;
          break;
        case 'streak':
          shouldUnlock = player.stats.bestStreak >= achievement.requirement.value;
          break;
        case 'winrate':
          shouldUnlock = player.stats.totalTrades >= 20 && 
                         player.stats.winRate >= achievement.requirement.value;
          break;
        case 'level':
          shouldUnlock = player.level >= achievement.requirement.value;
          break;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  awardAchievement(player: SandboxPlayer, achievement: Achievement): SandboxPlayer {
    player.achievements.push(achievement.id);
    player.xp += achievement.reward.xp;
    if (achievement.reward.bonus) {
      player.balance += achievement.reward.bonus;
    }
    
    player.level = this.getLevelFromXP(player.xp);

    return player;
  }
}

export const progressionManager = new ProgressionManager();
