// Sandbox Trading Mode - Type Definitions

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
