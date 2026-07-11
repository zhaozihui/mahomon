// Pet state store using Zustand

import { create } from 'zustand';
import { Pet, PetState, ActionType, InteractionResult, UsageImpact } from '../lib/pet';

interface PetStore {
  pet: Pet;
  lastTickTime: number;

  updateFromUsage: (totalTokens: number, sessionInput: number, sessionOutput: number) => UsageImpact;
  interact: (action: ActionType) => InteractionResult;
  tick: (seconds?: number) => { hp: number; mood: number; hunger: number };
  loadState: (state: Partial<PetState>) => void;
  getState: () => PetState;
  reset: () => void;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pet: new Pet(),
  lastTickTime: Date.now(),

  updateFromUsage: (totalTokens, sessionInput, sessionOutput) => {
    const currentPet = get().pet;
    // 创建新实例避免引用问题
    const newPet = Pet.fromObject(currentPet.toObject());
    const impact = newPet.updateFromUsage(totalTokens, sessionInput, sessionOutput);
    set({ pet: newPet });
    return impact;
  },

  interact: (action) => {
    const currentPet = get().pet;
    const newPet = Pet.fromObject(currentPet.toObject());
    const result = newPet.interact(action);
    set({ pet: newPet });
    return result;
  },

  tick: (seconds = 60) => {
    const currentPet = get().pet;
    const now = Date.now();
    const elapsed = Math.floor((now - get().lastTickTime) / 1000);

    if (elapsed >= 60) {
      const newPet = Pet.fromObject(currentPet.toObject());
      const changes = newPet.tick(elapsed);
      set({ pet: newPet, lastTickTime: now });
      return changes;
    }
    return { hp: 0, mood: 0, hunger: 0 };
  },

  loadState: (state) => {
    const pet = Pet.fromObject(state);
    set({ pet, lastTickTime: Date.now() });
  },

  getState: () => {
    return get().pet.toObject();
  },

  reset: () => {
    const pet = new Pet();
    set({ pet, lastTickTime: Date.now() });
  },
}));

export const usePetState = () => usePetStore((state) => state.pet.state);
export const usePetActions = () => usePetStore((state) => ({
  updateFromUsage: state.updateFromUsage,
  interact: state.interact,
  tick: state.tick,
  loadState: state.loadState,
  reset: state.reset,
}));