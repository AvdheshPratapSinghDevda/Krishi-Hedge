# Sandbox Trading Mode - Complete Implementation Guide

## 📋 Executive Summary

This document outlines the complete implementation of a **Sandbox Trading Mode** - a gamified, risk-free practice environment where users learn commodity trading by creating contracts and trading with AI opponents. The feature includes dual flows (Farmer/Buyer modes), AI trading bots, market simulation, RPG-style progression, and achievements.

---

## 🎯 Feature Overview

### Core Concept
A practice trading game that teaches real market skills without financial risk. Users start with ₹10 lakhs virtual balance, trade against intelligent AI opponents, earn experience points, unlock achievements, and progress through 7 skill levels.

### Two Distinct Flows

#### **1. Farmer Mode (Seller)**
- Create contracts for crops you want to sell
- Set price, quantity, delivery terms
- AI evaluates your contract against current market
- Get instant feedback: "Price too high by 12%!" or "✅ Accepted!"
- Learn optimal pricing strategies

#### **2. Buyer Mode**
- Browse AI-created contracts from virtual farmers
- See market comparison for each contract
- Accept profitable contracts or skip
- Build a diverse portfolio
- Learn to identify good deals

---

## 🏗️ Architecture Overview

### File Structure
```
root/apps/pwa/src/
├── app/
│   └── sandbox/
│       ├── page.tsx                    # Main dashboard
│       ├── farmer/
│       │   ├── page.tsx               # Farmer mode dashboard
│       │   ├── create/page.tsx        # Create contract
│       │   └── [id]/page.tsx          # Contract detail
│       └── buyer/
│           ├── page.tsx               # Buyer mode dashboard
│           ├── browse/page.tsx        # Browse AI contracts
│           └── [id]/page.tsx          # Contract detail
├── lib/
│   └── sandbox/
│       ├── types.ts                   # TypeScript interfaces
│       ├── storage.ts                 # localStorage manager
│       ├── market-engine.ts           # Market price simulation
│       ├── ai-bot.ts                  # AI trading logic
│       ├── progression.ts             # XP, levels, achievements
│       └── contract-manager.ts        # Contract CRUD
└── components/
    └── sandbox/
        ├── StatsCard.tsx              # Reusable stats display
        ├── ContractCard.tsx           # Contract list item
        ├── MarketPriceWidget.tsx      # Live price ticker
        ├── LevelBadge.tsx             # Level display
        ├── AchievementPopup.tsx       # Achievement unlocked
        └── TipCard.tsx                # Dynamic tips
```

---

## 📊 Data Models

### TypeScript Interfaces

```typescript
// lib/sandbox/types.ts

// Player profile and stats
export interface SandboxPlayer {
  id: string;
  name: string;
  balance: number;               // Virtual currency (starts at 1000000)
  level: number;                 // 1-7
  xp: number;                    // Experience points
  stats: {
    totalTrades: number;
    winRate: number;             // Percentage
    totalProfit: number;
    currentStreak: number;
    bestStreak: number;
  };
  achievements: string[];        // Achievement IDs
  createdAt: string;
  lastPlayed: string;
}

// Market commodity with live simulation
export interface SandboxCommodity {
  id: string;
  name: string;
  variety?: string;
  basePrice: number;             // Reference price
  currentPrice: number;          // Simulated live price
  trend: 'bullish' | 'bearish' | 'stable';
  demandLevel: 'high' | 'medium' | 'low';
  volatility: number;            // 0-1 (affects price movement)
  lastUpdated: string;
  priceHistory: Array<{
    timestamp: string;
    price: number;
  }>;
}

// Contract in sandbox
export interface SandboxContract {
  id: string;
  playerId: string;
  contractNumber: string;        // e.g., "SB-2024-001"
  
  // Contract details
  commodity: string;
  variety?: string;
  quantity: number;
  unit: 'quintals' | 'tonnes';
  contractPrice: number;         // Price player set/accepted
  marketPriceAtCreation: number;
  
  // Role and flow
  playerRole: 'farmer' | 'buyer';
  createdBy: 'player' | 'ai';
  
  // AI evaluation (for farmer mode)
  aiDecision?: 'accepted' | 'rejected' | 'counter_offer';
  aiReasoning?: string;          // "Price 8% above market, too risky"
  counterOfferPrice?: number;
  
  // Status and timestamps
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  completedAt?: string;
  
  // Profit calculation
  profitLoss?: number;           // Calculated on completion
  isProfitable?: boolean;
}

// AI bot configuration
export interface AIBot {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  avatar?: string;
  acceptanceThreshold: number;    // Price tolerance (easy: 15%, medium: 10%, hard: 5%)
  counterOfferChance: number;     // 0-1
  personality: {
    aggressive: number;           // 0-1
    riskTolerance: number;        // 0-1
  };
}

// Achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;                   // Font Awesome icon class
  requirement: {
    type: 'trades' | 'profit' | 'streak' | 'winrate' | 'level';
    value: number;
  };
  reward: {
    xp: number;
    bonus?: number;               // Optional balance bonus
  };
  unlocked: boolean;
}

// Challenge/Goal
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'permanent';
  progress: number;
  target: number;
  reward: {
    xp: number;
    bonus: number;
  };
  expiresAt?: string;
  completed: boolean;
}

// Level definition
export interface Level {
  level: number;
  title: string;
  xpRequired: number;
  unlocks: string[];              // Features/benefits
  badge: {
    color: string;
    icon: string;
  };
}
```

---

## 🎮 Market Simulation Engine

### Geometric Brownian Motion (GBM)

```typescript
// lib/sandbox/market-engine.ts

import { SandboxCommodity } from './types';

const COMMODITIES_CONFIG = [
  { name: 'Soybean', basePrice: 4500, volatility: 0.12 },
  { name: 'Mustard', basePrice: 5500, volatility: 0.15 },
  { name: 'Groundnut', basePrice: 6200, volatility: 0.10 },
  { name: 'Sunflower', basePrice: 5800, volatility: 0.14 },
  { name: 'Sesame', basePrice: 7500, volatility: 0.18 },
  { name: 'Castor', basePrice: 5200, volatility: 0.13 }
];

class MarketEngine {
  private commodities: Map<string, SandboxCommodity> = new Map();
  private updateInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeCommodities();
  }

  // Initialize all commodities
  private initializeCommodities() {
    const stored = this.loadFromStorage();
    
    if (stored && stored.length > 0) {
      stored.forEach(c => this.commodities.set(c.name, c));
    } else {
      COMMODITIES_CONFIG.forEach(config => {
        const commodity: SandboxCommodity = {
          id: `commodity_${config.name.toLowerCase()}`,
          name: config.name,
          basePrice: config.basePrice,
          currentPrice: config.basePrice,
          trend: 'stable',
          demandLevel: 'medium',
          volatility: config.volatility,
          lastUpdated: new Date().toISOString(),
          priceHistory: [{
            timestamp: new Date().toISOString(),
            price: config.basePrice
          }]
        };
        this.commodities.set(commodity.name, commodity);
      });
      this.saveToStorage();
    }
  }

  // Geometric Brownian Motion formula
  private calculatePriceMovement(
    currentPrice: number,
    volatility: number,
    trend: string,
    deltaTime: number = 1
  ): number {
    // Drift based on trend
    const drift = trend === 'bullish' ? 0.05 : trend === 'bearish' ? -0.05 : 0;
    
    // Random component (Wiener process)
    const randomShock = (Math.random() - 0.5) * 2; // -1 to 1
    
    // GBM: dS = S * (drift * dt + volatility * randomShock * sqrt(dt))
    const change = currentPrice * (drift * deltaTime + volatility * randomShock * Math.sqrt(deltaTime));
    
    return currentPrice + change;
  }

  // Mean reversion to keep prices realistic
  private applyMeanReversion(price: number, basePrice: number, strength: number = 0.1): number {
    const deviation = price - basePrice;
    const maxDeviation = basePrice * 0.15; // ±15% from base
    
    if (Math.abs(deviation) > maxDeviation) {
      // Pull back towards base
      return price - (deviation * strength);
    }
    
    return price;
  }

  // Update all commodity prices
  updatePrices() {
    this.commodities.forEach((commodity, name) => {
      // Calculate new price using GBM
      let newPrice = this.calculatePriceMovement(
        commodity.currentPrice,
        commodity.volatility,
        commodity.trend
      );

      // Apply mean reversion
      newPrice = this.applyMeanReversion(newPrice, commodity.basePrice);

      // Ensure price doesn't go negative
      newPrice = Math.max(newPrice, commodity.basePrice * 0.5);

      // Random trend shifts (5% chance)
      if (Math.random() < 0.05) {
        const trends: Array<'bullish' | 'bearish' | 'stable'> = ['bullish', 'bearish', 'stable'];
        commodity.trend = trends[Math.floor(Math.random() * trends.length)];
      }

      // Random demand shifts (10% chance)
      if (Math.random() < 0.10) {
        const demands: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
        commodity.demandLevel = demands[Math.floor(Math.random() * demands.length)];
      }

      // Update commodity
      commodity.currentPrice = Math.round(newPrice);
      commodity.lastUpdated = new Date().toISOString();
      commodity.priceHistory.push({
        timestamp: commodity.lastUpdated,
        price: commodity.currentPrice
      });

      // Keep only last 50 price points
      if (commodity.priceHistory.length > 50) {
        commodity.priceHistory.shift();
      }

      this.commodities.set(name, commodity);
    });

    this.saveToStorage();
  }

  // Start auto-update (every 30-60 seconds)
  startAutoUpdate() {
    if (this.updateInterval) return;
    
    const updateFrequency = 45000 + Math.random() * 15000; // 45-60s
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, updateFrequency);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  // Get current price for a commodity
  getCurrentPrice(commodityName: string): number {
    return this.commodities.get(commodityName)?.currentPrice || 0;
  }

  // Get all commodities
  getAllCommodities(): SandboxCommodity[] {
    return Array.from(this.commodities.values());
  }

  // Storage helpers
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    const data = Array.from(this.commodities.values());
    localStorage.setItem('sandbox_market_data', JSON.stringify(data));
  }

  private loadFromStorage(): SandboxCommodity[] | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('sandbox_market_data');
    return stored ? JSON.parse(stored) : null;
  }
}

export const marketEngine = new MarketEngine();
```

---

## 🤖 AI Trading Bot Logic

```typescript
// lib/sandbox/ai-bot.ts

import { AIBot, SandboxContract, SandboxCommodity } from './types';
import { marketEngine } from './market-engine';

const AI_BOTS: AIBot[] = [
  {
    id: 'bot_easy',
    name: 'Pratham Trader',
    difficulty: 'easy',
    acceptanceThreshold: 0.15,      // ±15%
    counterOfferChance: 0.3,
    personality: { aggressive: 0.3, riskTolerance: 0.7 }
  },
  {
    id: 'bot_medium',
    name: 'Madhyam Vyapari',
    difficulty: 'medium',
    acceptanceThreshold: 0.10,      // ±10%
    counterOfferChance: 0.5,
    personality: { aggressive: 0.5, riskTolerance: 0.5 }
  },
  {
    id: 'bot_hard',
    name: 'Expert Broker',
    difficulty: 'hard',
    acceptanceThreshold: 0.05,      // ±5%
    counterOfferChance: 0.7,
    personality: { aggressive: 0.8, riskTolerance: 0.2 }
  }
];

class AITradingBot {
  
  // Select bot based on player level
  selectBot(playerLevel: number): AIBot {
    if (playerLevel <= 2) return AI_BOTS[0];      // Easy
    if (playerLevel <= 5) return AI_BOTS[1];      // Medium
    return AI_BOTS[2];                             // Hard
  }

  // Evaluate a farmer's contract
  evaluateContract(
    contract: Partial<SandboxContract>,
    playerLevel: number
  ): {
    decision: 'accepted' | 'rejected' | 'counter_offer';
    reasoning: string;
    counterPrice?: number;
  } {
    const bot = this.selectBot(playerLevel);
    const marketPrice = marketEngine.getCurrentPrice(contract.commodity!);
    const contractPrice = contract.contractPrice!;
    
    // Calculate price deviation
    const deviation = (contractPrice - marketPrice) / marketPrice;
    const deviationPercent = Math.abs(deviation * 100);

    // Check if within tolerance
    const withinTolerance = deviationPercent <= (bot.acceptanceThreshold * 100);

    // Factor in demand (high demand = more lenient)
    const commodity = marketEngine.getAllCommodities()
      .find(c => c.name === contract.commodity);
    const demandBonus = commodity?.demandLevel === 'high' ? 0.05 : 
                        commodity?.demandLevel === 'low' ? -0.05 : 0;

    const adjustedThreshold = bot.acceptanceThreshold + demandBonus;

    // Decision logic
    if (deviation > 0) {
      // Farmer wants MORE than market (bad for buyer)
      if (deviationPercent <= (adjustedThreshold * 100)) {
        // Within tolerance, but maybe counter
        if (Math.random() < bot.counterOfferChance) {
          const counterPrice = Math.round(marketPrice * (1 + (adjustedThreshold / 2)));
          return {
            decision: 'counter_offer',
            reasoning: `Your price is ${deviationPercent.toFixed(1)}% above market. Counter-offering ₹${counterPrice}/qtl.`,
            counterPrice
          };
        } else {
          return {
            decision: 'accepted',
            reasoning: `✅ Accepted! Price is ${deviationPercent.toFixed(1)}% above market, within acceptable range for current ${commodity?.demandLevel || 'medium'} demand.`
          };
        }
      } else {
        return {
          decision: 'rejected',
          reasoning: `❌ Price too high by ${deviationPercent.toFixed(1)}%! Market price is ₹${marketPrice}. Consider lowering your price.`
        };
      }
    } else {
      // Farmer wants LESS than market (good for buyer!)
      return {
        decision: 'accepted',
        reasoning: `✅ Excellent deal! Your price is ${Math.abs(deviationPercent).toFixed(1)}% below market. Accepted immediately!`
      };
    }
  }

  // Generate AI contract for buyer mode
  generateAIContract(
    playerLevel: number,
    commodities: SandboxCommodity[]
  ): Partial<SandboxContract> {
    // Select random commodity
    const commodity = commodities[Math.floor(Math.random() * commodities.length)];
    
    // Generate quantity (10-100 quintals)
    const quantity = Math.round((Math.random() * 90 + 10) / 10) * 10;

    // Price variance based on difficulty
    const bot = this.selectBot(playerLevel);
    const marketPrice = commodity.currentPrice;
    
    // Sometimes offer good deals, sometimes bad
    const priceMultiplier = Math.random() < 0.4 
      ? 1 - (Math.random() * bot.acceptanceThreshold)  // Good deal (below market)
      : 1 + (Math.random() * bot.acceptanceThreshold);  // Bad deal (above market)

    const contractPrice = Math.round(marketPrice * priceMultiplier);

    return {
      id: `ai_contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      commodity: commodity.name,
      quantity,
      unit: 'quintals',
      contractPrice,
      marketPriceAtCreation: marketPrice,
      playerRole: 'buyer',
      createdBy: 'ai',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  // Generate multiple AI contracts for browsing
  generateContractPool(playerLevel: number, count: number = 8): Partial<SandboxContract>[] {
    const commodities = marketEngine.getAllCommodities();
    const contracts: Partial<SandboxContract>[] = [];

    for (let i = 0; i < count; i++) {
      contracts.push(this.generateAIContract(playerLevel, commodities));
    }

    return contracts;
  }
}

export const aiBot = new AITradingBot();
```

---

## 📈 Progression System

```typescript
// lib/sandbox/progression.ts

import { Level, Achievement, SandboxPlayer } from './types';

// Level definitions
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

// Achievement definitions
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
    id: 'fifty_trades',
    name: 'Experienced',
    description: 'Complete 50 trades',
    icon: 'fa-medal',
    requirement: { type: 'trades', value: 50 },
    reward: { xp: 1000, bonus: 100000 },
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
    id: 'profit_5l',
    name: 'Big Winner',
    description: 'Earn ₹5 Lakh profit',
    icon: 'fa-sack-dollar',
    requirement: { type: 'profit', value: 500000 },
    reward: { xp: 1500, bonus: 250000 },
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
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Win 10 trades in a row',
    icon: 'fa-fire-flame-curved',
    requirement: { type: 'streak', value: 10 },
    reward: { xp: 1200, bonus: 150000 },
    unlocked: false
  },
  {
    id: 'winrate_70',
    name: 'Consistent',
    description: 'Maintain 70% win rate (min 20 trades)',
    icon: 'fa-chart-simple',
    requirement: { type: 'winrate', value: 70 },
    reward: { xp: 800 },
    unlocked: false
  },
  {
    id: 'reach_level_5',
    name: 'Master Trader',
    description: 'Reach level 5',
    icon: 'fa-crown',
    requirement: { type: 'level', value: 5 },
    reward: { xp: 2000, bonus: 500000 },
    unlocked: false
  }
];

class ProgressionManager {
  
  // Calculate level from XP
  getLevelFromXP(xp: number): number {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i].level;
      }
    }
    return 1;
  }

  // Get level info
  getLevelInfo(level: number): Level {
    return LEVELS.find(l => l.level === level) || LEVELS[0];
  }

  // Calculate XP for trade outcome
  calculateXP(profit: number, isProfitable: boolean): number {
    let baseXP = 50; // Base XP for completing a trade
    
    if (isProfitable) {
      // Bonus XP based on profit magnitude
      const profitBonus = Math.min(Math.floor(profit / 1000), 100);
      baseXP += profitBonus;
    } else {
      // Still earn some XP for learning
      baseXP = 20;
    }

    return baseXP;
  }

  // Check and unlock achievements
  checkAchievements(player: SandboxPlayer): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (player.achievements.includes(achievement.id)) return; // Already unlocked

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

  // Award achievement
  awardAchievement(player: SandboxPlayer, achievement: Achievement): SandboxPlayer {
    player.achievements.push(achievement.id);
    player.xp += achievement.reward.xp;
    if (achievement.reward.bonus) {
      player.balance += achievement.reward.bonus;
    }
    
    // Recalculate level
    player.level = this.getLevelFromXP(player.xp);

    return player;
  }
}

export const progressionManager = new ProgressionManager();
```

---

## 💾 Storage Manager

```typescript
// lib/sandbox/storage.ts

import { SandboxPlayer, SandboxContract, Challenge } from './types';

const STORAGE_KEYS = {
  PLAYER: 'sandbox_player',
  CONTRACTS: 'sandbox_contracts',
  CHALLENGES: 'sandbox_challenges',
  SETTINGS: 'sandbox_settings'
};

class SandboxStorage {
  
  // Player operations
  getPlayer(): SandboxPlayer | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER);
    return stored ? JSON.parse(stored) : null;
  }

  savePlayer(player: SandboxPlayer): void {
    if (typeof window === 'undefined') return;
    player.lastPlayed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
  }

  createNewPlayer(name: string): SandboxPlayer {
    const player: SandboxPlayer = {
      id: `player_${Date.now()}`,
      name,
      balance: 1000000, // ₹10 Lakhs
      level: 1,
      xp: 0,
      stats: {
        totalTrades: 0,
        winRate: 0,
        totalProfit: 0,
        currentStreak: 0,
        bestStreak: 0
      },
      achievements: [],
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };
    
    this.savePlayer(player);
    return player;
  }

  // Contract operations
  getContracts(): SandboxContract[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return stored ? JSON.parse(stored) : [];
  }

  saveContract(contract: SandboxContract): void {
    const contracts = this.getContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    
    if (index >= 0) {
      contracts[index] = contract;
    } else {
      contracts.push(contract);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    }
  }

  getContract(id: string): SandboxContract | null {
    const contracts = this.getContracts();
    return contracts.find(c => c.id === id) || null;
  }

  // Reset all data
  resetAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const sandboxStorage = new SandboxStorage();
```

---

## 🎨 UI Components

### Stats Card Component

```typescript
// components/sandbox/StatsCard.tsx

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'purple' 
}: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.purple} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && trendValue && (
          <span className={`text-xs font-bold ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
```

---

## 📱 Main Pages Implementation

### 1. Sandbox Dashboard

```typescript
// app/sandbox/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sandboxStorage } from '@/lib/sandbox/storage';
import { SandboxPlayer } from '@/lib/sandbox/types';
import { progressionManager, LEVELS } from '@/lib/sandbox/progression';
import StatsCard from '@/components/sandbox/StatsCard';
import { 
  Wallet, TrendingUp, Target, Award,
  Users, ShoppingCart, ArrowRight
} from 'lucide-react';

export default function SandboxDashboard() {
  const router = useRouter();
  const [player, setPlayer] = useState<SandboxPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let p = sandboxStorage.getPlayer();
    if (!p) {
      // Get player name from main profile
      const profileStr = localStorage.getItem('kh_profile');
      const name = profileStr ? JSON.parse(profileStr).fullName || 'Player' : 'Player';
      p = sandboxStorage.createNewPlayer(name);
    }
    setPlayer(p);
    setLoading(false);
  }, []);

  if (loading || !player) {
    return <div className="min-h-screen bg-purple-50 flex items-center justify-center">
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
      {/* Header */}
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
              <span className="text-sm font-bold text-yellow-300">PRACTICE MODE</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Sandbox Trading</h1>
          <p className="text-purple-200 text-sm mb-6">Learn risk-free before real trading</p>

          {/* Balance and Level */}
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

            {/* XP Progress */}
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
      </header>

      <div className="px-6 -mt-8 relative z-10 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard 
            title="Total Trades"
            value={player.stats.totalTrades}
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard 
            title="Win Rate"
            value={`${player.stats.winRate}%`}
            icon={Target}
            color="green"
          />
          <StatsCard 
            title="Total Profit"
            value={`₹${(player.stats.totalProfit / 1000).toFixed(0)}K`}
            icon={Wallet}
            trend={player.stats.totalProfit > 0 ? 'up' : 'down'}
            trendValue={player.stats.totalProfit > 0 ? 'Profitable' : 'Learning'}
            color="orange"
          />
          <StatsCard 
            title="Current Streak"
            value={player.stats.currentStreak}
            icon={Award}
            color="blue"
            trend={player.stats.currentStreak >= 3 ? 'up' : 'neutral'}
            trendValue={player.stats.currentStreak >= 3 ? '🔥 Hot!' : undefined}
          />
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
            <h2 className="font-bold text-lg mb-1">Choose Your Role</h2>
            <p className="text-sm text-purple-100">Practice as farmer or buyer</p>
          </div>

          <div className="p-4 space-y-3">
            {/* Farmer Mode */}
            <button
              onClick={() => router.push('/sandbox/farmer')}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:border-green-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Play as Seller</h3>
                    <p className="text-xs text-gray-600">Create contracts, get AI feedback</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Buyer Mode */}
            <button
              onClick={() => router.push('/sandbox/buyer')}
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">Play as Buyer</h3>
                    <p className="text-xs text-gray-600">Browse AI contracts, find deals</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition" />
              </div>
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-yellow-600 text-xl"></i>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">Quick Tip</h4>
              <p className="text-xs text-gray-700">
                {player.stats.totalTrades === 0 
                  ? "Start with Seller mode to learn pricing. AI will give you instant feedback!"
                  : player.stats.winRate < 50
                  ? "Try to match market prices closely. Check the live prices before setting your price."
                  : "Great job! Try Buyer mode to practice identifying profitable deals from the other side."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create type definitions (`lib/sandbox/types.ts`)
- [ ] Build storage manager (`lib/sandbox/storage.ts`)
- [ ] Implement market engine with GBM (`lib/sandbox/market-engine.ts`)
- [ ] Create main dashboard page (`app/sandbox/page.tsx`)

### Phase 2: AI & Logic (Week 2)
- [ ] Implement AI bot evaluation logic (`lib/sandbox/ai-bot.ts`)
- [ ] Build progression system (`lib/sandbox/progression.ts`)
- [ ] Create contract manager (`lib/sandbox/contract-manager.ts`)
- [ ] Add achievement checking and rewards

### Phase 3: Farmer Flow (Week 3)
- [ ] Create farmer dashboard (`app/sandbox/farmer/page.tsx`)
- [ ] Build contract creation form (`app/sandbox/farmer/create/page.tsx`)
- [ ] Implement AI evaluation flow
- [ ] Add contract detail page with feedback display

### Phase 4: Buyer Flow (Week 4)
- [ ] Create buyer dashboard (`app/sandbox/buyer/page.tsx`)
- [ ] Build AI contract browsing (`app/sandbox/buyer/browse/page.tsx`)
- [ ] Implement accept/reject logic
- [ ] Add profit calculation on acceptance

### Phase 5: Polish & Features (Week 5)
- [ ] Build all reusable components (StatsCard, ContractCard, etc.)
- [ ] Implement achievement popup animations
- [ ] Add challenge system
- [ ] Create leaderboard (optional)
- [ ] Add tutorial overlay for first-time users

### Phase 6: Integration (Week 6)
- [ ] Add sandbox tab to bottom navigation
- [ ] Integrate with main app auth flow
- [ ] Add "Practice Mode" prompts in real contract flow
- [ ] Analytics tracking
- [ ] Bug fixes and optimization

---

## 🎯 Success Metrics

### User Engagement
- **Target**: 80% of new users complete at least 5 sandbox trades before real trading
- **Measure**: Average trades per user, conversion to real mode

### Learning Effectiveness
- **Target**: Win rate improvement of 15%+ after 10 sandbox trades
- **Measure**: Compare sandbox win rate vs real contract success

### Feature Adoption
- **Target**: 50% of users return to sandbox at least once
- **Measure**: DAU/MAU ratio for sandbox feature

---

## 🔧 Technical Considerations

### Performance
- Market price updates run on separate interval (45-60s)
- Contract list virtualized for 100+ items
- localStorage capped at 5MB total (cleanup old data)

### Offline Support
- All sandbox features work offline
- Sync state when online (optional cloud backup)

### Accessibility
- Keyboard navigation for all interactions
- Screen reader support for stats and feedback
- High contrast mode for UI elements

### Mobile Optimization
- Touch-friendly buttons (min 44px)
- Swipe gestures for contract browsing
- Bottom sheet for quick actions

---

## 📝 Summary

This comprehensive sandbox mode provides:

✅ **Dual Flows**: Separate farmer (seller) and buyer experiences  
✅ **AI Opponents**: 3 difficulty levels with realistic evaluation  
✅ **Market Simulation**: GBM-based price movements with mean reversion  
✅ **Progression**: 7 levels, XP system, 15+ achievements  
✅ **Gamification**: Streaks, challenges, tips, badges  
✅ **Educational**: Instant feedback teaches optimal pricing  
✅ **Risk-Free**: ₹10L virtual balance, practice unlimited  

The feature is designed to reduce user anxiety about real trading, teach market mechanics through hands-on practice, and increase confidence before financial commitment.

---

**Ready to implement? Start with Phase 1 and build incrementally!** 🚀
