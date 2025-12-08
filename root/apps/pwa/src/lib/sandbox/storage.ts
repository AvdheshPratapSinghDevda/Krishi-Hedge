// Sandbox Trading Mode - Storage Manager

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

  deleteContract(id: string): void {
    const contracts = this.getContracts();
    const filtered = contracts.filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(filtered));
    }
  }

  // Get contracts by role
  getContractsByRole(role: 'farmer' | 'buyer'): SandboxContract[] {
    return this.getContracts().filter(c => c.playerRole === role);
  }

  // Get pending AI contracts for buyer mode
  getPendingAIContracts(): SandboxContract[] {
    return this.getContracts().filter(c => 
      c.createdBy === 'ai' && 
      c.playerRole === 'buyer' && 
      c.status === 'pending'
    );
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
