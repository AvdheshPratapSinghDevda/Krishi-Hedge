// Sandbox Trading Mode - Market Simulation Engine

import { SandboxCommodity } from './types';

const COMMODITIES_CONFIG = [
  { name: 'Soybean', basePrice: 4500, volatility: 0.12 },
  { name: 'Mustard', basePrice: 5500, volatility: 0.15 },
  { name: 'Groundnut', basePrice: 6200, volatility: 0.10 },
  { name: 'Sunflower', basePrice: 5800, volatility: 0.14 },
];

class MarketEngine {
  private commodities: Map<string, SandboxCommodity> = new Map();
  private updateInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeCommodities();
  }

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

  private calculatePriceMovement(
    currentPrice: number,
    volatility: number,
    trend: string,
    deltaTime: number = 1
  ): number {
    const drift = trend === 'bullish' ? 0.05 : trend === 'bearish' ? -0.05 : 0;
    const randomShock = (Math.random() - 0.5) * 2;
    const change = currentPrice * (drift * deltaTime + volatility * randomShock * Math.sqrt(deltaTime));
    return currentPrice + change;
  }

  private applyMeanReversion(price: number, basePrice: number, strength: number = 0.1): number {
    const deviation = price - basePrice;
    const maxDeviation = basePrice * 0.15;
    
    if (Math.abs(deviation) > maxDeviation) {
      return price - (deviation * strength);
    }
    return price;
  }

  updatePrices() {
    this.commodities.forEach((commodity) => {
      let newPrice = this.calculatePriceMovement(
        commodity.currentPrice,
        commodity.volatility,
        commodity.trend
      );

      newPrice = this.applyMeanReversion(newPrice, commodity.basePrice);
      newPrice = Math.max(newPrice, commodity.basePrice * 0.5);

      if (Math.random() < 0.05) {
        const trends: Array<'bullish' | 'bearish' | 'stable'> = ['bullish', 'bearish', 'stable'];
        commodity.trend = trends[Math.floor(Math.random() * trends.length)];
      }

      if (Math.random() < 0.10) {
        const demands: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
        commodity.demandLevel = demands[Math.floor(Math.random() * demands.length)];
      }

      commodity.currentPrice = Math.round(newPrice);
      commodity.lastUpdated = new Date().toISOString();
      commodity.priceHistory.push({
        timestamp: commodity.lastUpdated,
        price: commodity.currentPrice
      });

      if (commodity.priceHistory.length > 50) {
        commodity.priceHistory.shift();
      }

      this.commodities.set(commodity.name, commodity);
    });

    this.saveToStorage();
  }

  startAutoUpdate() {
    if (this.updateInterval) return;
    
    const updateFrequency = 45000 + Math.random() * 15000;
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

  getCurrentPrice(commodityName: string): number {
    return this.commodities.get(commodityName)?.currentPrice || 0;
  }

  getCommodity(commodityName: string): SandboxCommodity | undefined {
    return this.commodities.get(commodityName);
  }

  getAllCommodities(): SandboxCommodity[] {
    return Array.from(this.commodities.values());
  }

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
