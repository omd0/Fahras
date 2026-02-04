import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light';

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
    (set) => ({
      mode: 'light',

      toggleTheme: () => {},

      setTheme: () => {
        set({ mode: 'light' });
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
