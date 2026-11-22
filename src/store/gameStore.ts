import { create } from "zustand";
import type { GameView } from "@/lib/protocol";

interface GameStore { current: GameView | null; setView: (v: GameView) => void; clear: () => void }

export const useGameStore = create<GameStore>((set) => ({
  current: null,
  setView: (current) => set({ current }),
  clear: () => set({ current: null }),
}));
