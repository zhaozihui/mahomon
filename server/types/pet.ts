// Pet types for server

export enum PetType {
  CAT = 'cat',
  DOG = 'dog',
  DRAGON = 'dragon',
}

export enum ActionType {
  FEED = 'feed',
  PLAY = 'play',
  REST = 'rest',
}

export enum WorkIntensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  INTENSE = 'intense',
}

export interface PetState {
  hp: number;
  mood: number;
  exp: number;
  level: number;
  hunger: number;
  lastFeed: string | null;
  lastPlay: string | null;
  lastRest: string | null;
  totalTokens: number;
  sessionTokens: number;
  totalMessages: number;
  lastUpdateTime: string;
  tokensLastMinute: number;
  petType: PetType;
  name: string;
  createdAt: string;
}

export interface InteractionResult {
  success: boolean;
  message: string;
  hpChange: number;
  moodChange: number;
  hungerChange: number;
  expChange: number;
}

export interface UsageImpact {
  expGain: number;
  hpCost: number;
  hungerCost: number;
  moodChange: number;
  intensity: WorkIntensity;
  efficiencyBonus: number;
}

// Default pet state
export const DEFAULT_PET_STATE: PetState = {
  hp: 100,
  mood: 100,
  exp: 0,
  level: 1,
  hunger: 100,
  lastFeed: null,
  lastPlay: null,
  lastRest: null,
  totalTokens: 0,
  sessionTokens: 0,
  totalMessages: 0,
  lastUpdateTime: new Date().toISOString(),
  tokensLastMinute: 0,
  petType: PetType.CAT,
  name: '小猫咪',
  createdAt: new Date().toISOString(),
};
