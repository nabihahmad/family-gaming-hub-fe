import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FlipCard } from "@/components/FlipCard";
import type { CardColor, CodenamesView } from "@/lib/protocol";
import { cn } from "@/lib/utils";

const SOLID: Record<CardColor, string> = {
  red: "bg-team-red text-team-red-foreground",
  blue: "bg-team-blue text-team-blue-foreground",
  neutral: "bg-card-neutral text-card-neutral-foreground",
  assassin: "bg-assassin text-assassin-foreground",
};
const KEY: Record<CardColor, string> = {
  red: "ring-team-red bg-team-red/15",
  blue: "ring-team-blue bg-team-blue/15",
  neutral: "ring-card-neutral bg-card-neutral/25",
  assassin: "ring-assassin bg-assassin/25",
};

export function Board({ view, canReveal, onReveal }: { view: CodenamesView; canReveal: boolean; onReveal: (i: number) => void }) {
  const { t } = useTranslation();
  const [armed, setArmed] = useState<number | null>(null);
  const ar = view.lang === "ar";
  const tap = (i: number) => {
    if (!canReveal || view.board[i]?.revealed) return;
    if (armed === i) { onReveal(i); setArmed(null); navigator.vibrate?.(15); } else setArmed(i);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2" dir={ar ? "rtl" : "ltr"} lang={view.lang}>
        {view.board.map((c, i) => {
          const key = view.isSpymaster && !c.revealed && c.color ? KEY[c.color] : "";
          const fontSize = ar ? "text-[clamp(0.7rem,3.4vw,1.05rem)]" : "text-[clamp(0.55rem,2.8vw,0.9rem)]";
          return (
            <motion.button
              key={i}
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => tap(i)}
              className="aspect-[4/3] w-full"
              aria-label={c.word}
            >
              <FlipCard
                flipped={c.revealed}
                className="h-full w-full"
                front={
                  <div className={cn("flex h-full w-full items-center justify-center rounded-lg bg-card p-0.5 shadow-soft ring-2 ring-transparent transition", key, armed === i && "ring-primary ring-4")}>
                    <span className={cn("break-words text-center font-bold leading-tight", fontSize, !ar && "uppercase")}>{c.word}</span>
                  </div>
                }
                back={
                  <div className={cn("flex h-full w-full items-center justify-center rounded-lg p-0.5", c.color ? SOLID[c.color] : "bg-muted")}>
                    <span className={cn("break-words text-center font-semibold leading-tight opacity-70", fontSize)}>{c.word}</span>
                  </div>
                }
              />
            </motion.button>
          );
        })}
      </div>
      <p className={cn("h-5 text-center text-sm font-semibold text-primary transition-opacity", armed === null && "opacity-0")}>{t("codenames.tapAgain")}</p>
      {view.isSpymaster && (
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          <span className="font-semibold">{t("codenames.legend")}:</span>
          {(["red", "blue", "neutral", "assassin"] as CardColor[]).map((c) => (
            <span key={c} className="inline-flex items-center gap-1"><span className={cn("h-3 w-3 rounded-sm", SOLID[c])} />{t(`codenames.${c}`)}</span>
          ))}
        </div>
      )}
    </div>
  );
}
