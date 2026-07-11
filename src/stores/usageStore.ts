// Usage data store using Zustand

import { create } from 'zustand';
import { UsageData, SystemData } from '../types/usage';

interface UsageStore {
  // State
  usageData: UsageData | null;
  systemData: SystemData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;

  // Actions
  setUsageData: (data: UsageData) => void;
  setSystemData: (data: SystemData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUsageStore = create<UsageStore>((set) => ({
  usageData: null,
  systemData: null,
  isLoading: false,
  error: null,
  lastUpdate: 0,

  setUsageData: (data) => set({ usageData: data, lastUpdate: Date.now(), error: null }),
  setSystemData: (data) => set({ systemData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// Selector hooks
export const useUsageData = () => useUsageStore((state) => state.usageData);
export const useSystemData = () => useUsageStore((state) => state.systemData);