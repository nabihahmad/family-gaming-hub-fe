import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Crown } from "lucide-react";
import type { Player } from "@/lib/protocol";
import { PlayerAvatar } from "./Avatar";
import { cn } from "@/lib/utils";

export function PlayerList({ players, hostId, meId }: { players: Player[]; hostId: string; meId: string | null }) {
  const { t } = useTranslation();
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {players.map((p, i) => (
          <motion.li
            key={p.id}
            layout
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: p.connected ? 1 : 0.45, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "spring", stiffness: 400, damping: 32, delay: i * 0.03 }}
            className={cn("flex items-center gap-3 rounded-2xl bg-card px-3 py-2 shadow-soft")}
          >
            <PlayerAvatar id={p.id} name={p.name} />
            <span className="flex-1 truncate text-base font-medium">
              <bdi>{p.name}</bdi>
              {p.id === meId && <span className="ms-1.5 text-sm text-muted-foreground">({t("lobby.you")})</span>}
            </span>
            {p.id === hostId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                <Crown className="h-3.5 w-3.5" /> {t("lobby.host")}
              </span>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
