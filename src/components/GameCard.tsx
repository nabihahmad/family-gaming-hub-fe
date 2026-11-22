import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { GameId } from "@/lib/protocol";
import { GAME_META } from "./gameMeta";
import { cn } from "@/lib/utils";

interface Props { game: GameId; disabled: boolean; highlighted: boolean; hidden: boolean; index: number; onSelect: () => void }

export function GameCard({ game, disabled, highlighted, hidden, index, onSelect }: Props) {
  const { t } = useTranslation();
  const m = GAME_META[game];
  const Icon = m.icon;
  return (
    <motion.button
      layoutId={`game-${game}`}
      type="button"
      disabled={disabled}
      onClick={onSelect}
      initial={{ opacity: 0, y: 24 }}
      animate={hidden ? { opacity: 0, y: 40 } : { opacity: disabled && !highlighted ? 0.6 : 1, y: 0, scale: highlighted ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30, delay: hidden ? 0 : index * 0.04 }}
      {...(disabled ? {} : { whileHover: { y: -4 }, whileTap: { scale: 1.03 } })}
      className={cn(
        "flex min-h-28 w-full items-center gap-4 rounded-3xl p-5 text-start shadow-soft transition-shadow hover:shadow-lift disabled:cursor-not-allowed",
        m.bg, m.fg,
        highlighted && "ring-4 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background/15">
        <Icon className="h-8 w-8" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold">{t(`games.${game}.name`)}</h3>
        <p className="mt-0.5 text-sm opacity-90">{t(`games.${game}.desc`)}</p>
        <p className="mt-1 text-xs font-semibold opacity-75">{t("lobby.playersRange", { min: m.min, max: m.max })}</p>
      </div>
    </motion.button>
  );
}
