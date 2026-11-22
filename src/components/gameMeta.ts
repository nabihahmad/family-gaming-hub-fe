import { Grid3x3, Moon, VenetianMask, type LucideIcon } from "lucide-react";
import type { GameId } from "@/lib/protocol";

export const GAME_META: Record<GameId, { icon: LucideIcon; min: number; max: number; bg: string; fg: string; button: "codenames" | "imposter" | "moon" }> = {
  codenames: { icon: Grid3x3, min: 4, max: 12, bg: "bg-codenames", fg: "text-codenames-foreground", button: "codenames" },
  imposter: { icon: VenetianMask, min: 3, max: 12, bg: "bg-imposter", fg: "text-imposter-foreground", button: "imposter" },
  werewolves: { icon: Moon, min: 3, max: 10, bg: "bg-werewolf", fg: "text-werewolf-foreground", button: "moon" },
};

export const DEFAULT_ROLES = ["werewolf", "werewolf", "seer", "robber", "troublemaker", "villager"];
