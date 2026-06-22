import { create } from 'zustand';

interface ThemeStore {
  darkMode: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  darkMode: false,
  toggle: () => set((state) => ({ darkMode: !state.darkMode })),
}));
