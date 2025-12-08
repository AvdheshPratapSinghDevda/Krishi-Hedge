// Sandbox Trading Mode - AI Trading Bot

import { AIBot, SandboxContract, SandboxCommodity } from './types';
import { marketEngine } from './market-engine';

const AI_BOTS: AIBot[] = [
  {
    id: 'bot_easy',
    name: 'Pratham Trader',
    difficulty: 'easy',
    acceptanceThreshold: 0.15,
    counterOfferChance: 0.3,
    personality: { aggressive: 0.3, riskTolerance: 0.7 }
  },
  {
    id: 'bot_medium',
    name: 'Madhyam Vyapari',
    difficulty: 'medium',
    acceptanceThreshold: 0.10,
    counterOfferChance: 0.5,
    personality: { aggressive: 0.5, riskTolerance: 0.5 }
  },
  {
    id: 'bot_hard',
    name: 'Expert Broker',
    difficulty: 'hard',
    acceptanceThreshold: 0.05,
    counterOfferChance: 0.7,
    personality: { aggressive: 0.8, riskTolerance: 0.2 }
  }
];

class AITradingBot {
  
  selectBot(playerLevel: number): AIBot {
    if (playerLevel <= 2) return AI_BOTS[0];
    if (playerLevel <= 5) return AI_BOTS[1];
    return AI_BOTS[2];
  }

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
    
    const deviation = (contractPrice - marketPrice) / marketPrice;
    const deviationPercent = Math.abs(deviation * 100);

    const commodity = marketEngine.getCommodity(contract.commodity!);
    const demandBonus = commodity?.demandLevel === 'high' ? 0.05 : 
                        commodity?.demandLevel === 'low' ? -0.05 : 0;

    const adjustedThreshold = bot.acceptanceThreshold + demandBonus;

    if (deviation > 0) {
      if (deviationPercent <= (adjustedThreshold * 100)) {
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
      return {
        decision: 'accepted',
        reasoning: `✅ Excellent deal! Your price is ${Math.abs(deviationPercent).toFixed(1)}% below market. Accepted immediately!`
      };
    }
  }

  generateAIContract(
    playerLevel: number,
    commodities: SandboxCommodity[]
  ): Partial<SandboxContract> {
    const commodity = commodities[Math.floor(Math.random() * commodities.length)];
    const quantity = Math.round((Math.random() * 90 + 10) / 10) * 10;
    const bot = this.selectBot(playerLevel);
    const marketPrice = commodity.currentPrice;
    
    const priceMultiplier = Math.random() < 0.4 
      ? 1 - (Math.random() * bot.acceptanceThreshold)
      : 1 + (Math.random() * bot.acceptanceThreshold);

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
