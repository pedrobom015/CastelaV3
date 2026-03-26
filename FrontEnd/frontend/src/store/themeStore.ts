import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "blue" | "orange" | "gray";

interface ThemeState {
	theme: Theme;
	setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: "blue",
			setTheme: (theme) => set({ theme }),
		}),
		{
			name: "adp-theme",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
