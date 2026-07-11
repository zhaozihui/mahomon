// Pet core logic for server

import { PetState, PetType, ActionType, WorkIntensity, InteractionResult, UsageImpact, DEFAULT_PET_STATE } from '../types/pet.js';

// Level titles
const LEVEL_TITLES: Record<number, string> = {
  1: '新手',
  5: '学徒',
  10: '熟练',
  20: '精通',
  30: '专家',
  50: '大师',
  70: '宗师',
  90: '传奇',
};

// Pet icons
const PET_ICONS: Record<PetType, string> = {
  [PetType.CAT]: '🐱',
  [PetType.DOG]: '🐕',
  [PetType.DRAGON]: '🐉',
};

// Config constants
const CONFIG = {
  COOLDOWN_FEED: 0,
  COOLDOWN_PLAY: 0,
  COOLDOWN_REST: 0,

  FEED_HUNGER: 30,
  FEED_MOOD: 10,
  PLAY_MOOD: 20,
  PLAY_HP_COST: 10,
  REST_HP: 25,

  EXP_PER_1K_TOKENS: 1,
  LEVEL_UP_BASE: 100,
  HP_COST_PER_10K_TOKENS: 2,

  INTENSITY_LOW: 100,
  INTENSITY_MEDIUM: 500,
  INTENSITY_HIGH: 1000,
};

interface TokenHistoryEntry {
  time: Date;
  tokens: number;
}

export class Pet {
  state: PetState;
  private lastTokenCount: number;
  private tokenHistory: TokenHistoryEntry[] = [];
  private lastSessionTokens: number = 0;
  private lastExpressionState: string = 'normal';

  constructor(state?: Partial<PetState>) {
    this.state = { ...DEFAULT_PET_STATE, ...state } as PetState;
    this.lastTokenCount = this.state.totalTokens;
    this.lastSessionTokens = this.state.sessionTokens;
  }

  updateFromUsage(totalTokens: number, sessionInput: number = 0, sessionOutput: number = 0): UsageImpact {
    const now = new Date();
    const currentSessionTokens = sessionInput + sessionOutput;

    const sessionDelta = currentSessionTokens - this.lastSessionTokens;
    if (sessionDelta > 0) {
      const recorded = Math.min(sessionDelta, 10000);
      this.tokenHistory.push({ time: now, tokens: recorded });
      const cutoff = new Date(now.getTime() - 5 * 60 * 1000);
      this.tokenHistory = this.tokenHistory.filter(entry => entry.time > cutoff);
    }
    this.lastSessionTokens = currentSessionTokens;

    const intensity = this.calculateIntensity();

    if (totalTokens <= this.lastTokenCount) {
      this.state.sessionTokens = currentSessionTokens;
      return { expGain: 0, hpCost: 0, hungerCost: 0, moodChange: 0, intensity, efficiencyBonus: 0 };
    }

    const newTokens = totalTokens - this.lastTokenCount;
    this.lastTokenCount = totalTokens;

    const impact: UsageImpact = {
      expGain: 0,
      hpCost: 0,
      hungerCost: 0,
      moodChange: 0,
      intensity,
      efficiencyBonus: 0,
    };

    const baseExp = Math.floor(newTokens / 1000);
    if (newTokens > 100000) {
      impact.expGain = baseExp;
    } else {
      const intensityBonus = this.getIntensityBonus(intensity);
      impact.expGain = Math.floor(baseExp * (1 + intensityBonus));
    }

    if (impact.expGain > 0) {
      this.addExp(impact.expGain);
    }

    const hpCost = this.calculateHpCost(newTokens, intensity);
    if (hpCost > 0) {
      this.state.hp = Math.max(0, this.state.hp - hpCost);
      impact.hpCost = hpCost;
    }

    const hungerCost = Math.floor(newTokens / 20000);
    if (hungerCost > 0) {
      this.state.hunger = Math.max(0, this.state.hunger - hungerCost);
      impact.hungerCost = hungerCost;
    }

    if (sessionOutput > 0 && sessionInput > 0) {
      const outputRatio = sessionOutput / (sessionInput + sessionOutput);
      if (outputRatio > 0.5) {
        const moodGain = Math.floor((outputRatio - 0.5) * 10);
        this.state.mood = Math.min(100, this.state.mood + moodGain);
        impact.moodChange = moodGain;
      }
    }

    this.state.totalTokens = totalTokens;
    this.state.sessionTokens = sessionInput + sessionOutput;
    this.state.lastUpdateTime = now.toISOString();

    if (intensity === WorkIntensity.INTENSE) {
      this.lastExpressionState = 'intense';
    } else if (intensity === WorkIntensity.HIGH || intensity === WorkIntensity.MEDIUM) {
      this.lastExpressionState = 'working';
    } else if (impact.expGain > 0) {
      this.lastExpressionState = 'happy';
    }

    return impact;
  }

  private calculateIntensity(): WorkIntensity {
    if (this.tokenHistory.length === 0) {
      this.state.tokensLastMinute = 0;
      return WorkIntensity.LOW;
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const recentTokens = this.tokenHistory
      .filter(entry => entry.time > oneMinuteAgo)
      .reduce((sum, entry) => sum + entry.tokens, 0);

    this.state.tokensLastMinute = recentTokens;

    if (recentTokens > CONFIG.INTENSITY_HIGH) {
      return WorkIntensity.INTENSE;
    } else if (recentTokens > CONFIG.INTENSITY_MEDIUM) {
      return WorkIntensity.HIGH;
    } else if (recentTokens > CONFIG.INTENSITY_LOW) {
      return WorkIntensity.MEDIUM;
    }
    return WorkIntensity.LOW;
  }

  private getIntensityBonus(intensity: WorkIntensity): number {
    const bonuses: Record<WorkIntensity, number> = {
      [WorkIntensity.LOW]: 0.0,
      [WorkIntensity.MEDIUM]: 0.1,
      [WorkIntensity.HIGH]: 0.25,
      [WorkIntensity.INTENSE]: 0.5,
    };
    return bonuses[intensity] || 0.0;
  }

  private calculateHpCost(tokens: number, intensity: WorkIntensity): number {
    const baseCost = Math.floor(tokens * CONFIG.HP_COST_PER_10K_TOKENS / 10000);

    const multipliers: Record<WorkIntensity, number> = {
      [WorkIntensity.LOW]: 1.0,
      [WorkIntensity.MEDIUM]: 1.2,
      [WorkIntensity.HIGH]: 1.5,
      [WorkIntensity.INTENSE]: 2.0,
    };

    return Math.floor(baseCost * (multipliers[intensity] || 1.0));
  }

  tick(seconds: number = 60): { hp: number; mood: number; hunger: number } {
    const changes = { hp: 0, mood: 0, hunger: 0 };
    const minutes = seconds / 60;

    const levelBonus = 1 + (this.state.level - 1) * 0.02;

    let hungerDecay = Math.floor(minutes * 0.5);
    if (this.state.sessionTokens > 0) {
      hungerDecay = Math.floor(hungerDecay * 1.5);
    }
    if (hungerDecay > 0) {
      this.state.hunger = Math.max(0, this.state.hunger - hungerDecay);
      changes.hunger = -hungerDecay;
    }

    const moodDecay = Math.floor(minutes * 0.2);
    if (moodDecay > 0) {
      this.state.mood = Math.max(0, this.state.mood - moodDecay);
      changes.mood = -moodDecay;
    }

    if (this.state.hunger > 50) {
      const hpRecover = Math.floor(minutes * 0.3 * levelBonus);
      this.state.hp = Math.min(100, this.state.hp + hpRecover);
      changes.hp = hpRecover;
    } else if (this.state.hunger > 20) {
      const hpRecover = Math.floor(minutes * 0.1 * levelBonus);
      this.state.hp = Math.min(100, this.state.hp + hpRecover);
      changes.hp = hpRecover;
    }

    return changes;
  }

  interact(action: ActionType): InteractionResult {
    const now = new Date();

    switch (action) {
      case ActionType.FEED:
        return this.feed(now);
      case ActionType.PLAY:
        return this.play(now);
      case ActionType.REST:
        return this.rest(now);
      default:
        return { success: false, message: '未知动作', hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
    }
  }

  private feed(now: Date): InteractionResult {
    if (this.state.lastFeed) {
      const elapsed = (now.getTime() - new Date(this.state.lastFeed).getTime()) / 1000;
      if (elapsed < CONFIG.COOLDOWN_FEED) {
        const remaining = Math.floor(CONFIG.COOLDOWN_FEED - elapsed);
        return { success: false, message: `还需要等待 ${Math.floor(remaining / 60)} 分钟`, hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
      }
    }

    if (this.state.hunger >= 100) {
      return { success: false, message: '已经吃饱了～', hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
    }

    const levelBonus = 1 + (this.state.level - 1) * 0.01;
    const hungerGain = Math.min(Math.floor(CONFIG.FEED_HUNGER * levelBonus), 100 - this.state.hunger);
    this.state.hunger += hungerGain;
    this.state.mood = Math.min(100, this.state.mood + CONFIG.FEED_MOOD);
    this.state.lastFeed = now.toISOString();

    return {
      success: true,
      message: '好吃！(￣▽￣)ノ',
      hpChange: 0,
      moodChange: CONFIG.FEED_MOOD,
      hungerChange: hungerGain,
      expChange: 0,
    };
  }

  private play(now: Date): InteractionResult {
    if (this.state.lastPlay) {
      const elapsed = (now.getTime() - new Date(this.state.lastPlay).getTime()) / 1000;
      if (elapsed < CONFIG.COOLDOWN_PLAY) {
        const remaining = Math.floor(CONFIG.COOLDOWN_PLAY - elapsed);
        return { success: false, message: `还需要等待 ${Math.floor(remaining / 60)} 分钟`, hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
      }
    }

    if (this.state.hp < CONFIG.PLAY_HP_COST) {
      return { success: false, message: '太累了，需要休息 (－_－)', hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
    }

    this.state.hp -= CONFIG.PLAY_HP_COST;
    const moodGain = Math.min(CONFIG.PLAY_MOOD, 100 - this.state.mood);
    this.state.mood += moodGain;
    this.state.lastPlay = now.toISOString();

    const expGain = 5 + this.state.level;
    this.addExp(expGain);

    return {
      success: true,
      message: '好开心！(◕‿◕)',
      hpChange: -CONFIG.PLAY_HP_COST,
      moodChange: moodGain,
      hungerChange: 0,
      expChange: expGain,
    };
  }

  private rest(now: Date): InteractionResult {
    if (this.state.lastRest) {
      const elapsed = (now.getTime() - new Date(this.state.lastRest).getTime()) / 1000;
      if (elapsed < CONFIG.COOLDOWN_REST) {
        const remaining = Math.floor(CONFIG.COOLDOWN_REST - elapsed);
        return { success: false, message: `还需要等待 ${Math.floor(remaining / 60)} 分钟`, hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
      }
    }

    if (this.state.hp >= 100) {
      return { success: false, message: '精力充沛，不需要休息', hpChange: 0, moodChange: 0, hungerChange: 0, expChange: 0 };
    }

    const levelBonus = 1 + (this.state.level - 1) * 0.02;
    const hpGain = Math.min(Math.floor(CONFIG.REST_HP * levelBonus), 100 - this.state.hp);
    this.state.hp += hpGain;
    this.state.lastRest = now.toISOString();

    const hungerRecover = 5;
    this.state.hunger = Math.min(100, this.state.hunger + hungerRecover);

    return {
      success: true,
      message: '休息一下～ (－_－) zzZ',
      hpChange: hpGain,
      moodChange: 0,
      hungerChange: hungerRecover,
      expChange: 0,
    };
  }

  addExp(amount: number): number {
    this.state.exp += amount;
    let levelUps = 0;

    while (this.state.exp >= this.getExpForNextLevel()) {
      this.state.exp -= this.getExpForNextLevel();
      this.state.level += 1;
      levelUps++;

      this.state.hp = Math.min(100, this.state.hp + 20);
      this.state.mood = Math.min(100, this.state.mood + 10);

      if (this.state.level >= 99) {
        this.state.level = 99;
        this.state.exp = 0;
        break;
      }
    }

    return levelUps;
  }

  getExpForNextLevel(): number {
    return CONFIG.LEVEL_UP_BASE * this.state.level;
  }

  getLevelTitle(): string {
    let title = '新手';
    for (const [level, t] of Object.entries(LEVEL_TITLES)) {
      if (this.state.level >= parseInt(level)) {
        title = t;
      }
    }
    return title;
  }

  getIcon(): string {
    return PET_ICONS[this.state.petType] || '🐱';
  }

  getStatusText(): string {
    const intensity = this.calculateIntensity();

    if (this.state.hp <= 20) return '体力不足，需要休息';
    if (this.state.hunger <= 20) return '肚子饿了，想吃东西';
    if (intensity === WorkIntensity.INTENSE) return '高强度工作中！';
    if (intensity === WorkIntensity.HIGH) return '努力工作中...';
    if (this.state.mood <= 30) return '有点无聊，想玩耍';
    if (this.state.mood >= 80) return '心情很好～';
    return `${this.getLevelTitle()}状态`;
  }

  toObject(): PetState {
    return { ...this.state };
  }

  static fromObject(data: Partial<PetState>): Pet {
    return new Pet(data);
  }
}
