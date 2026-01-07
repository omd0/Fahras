import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      mode: 'light',

      // Actions
      toggleTheme: () => {
        const currentMode = get().mode;
        set({ mode: currentMode === 'light' ? 'dark' : 'light' });
      },

      setTheme: (mode: ThemeMode) => {
        set({ mode });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
  )
);
