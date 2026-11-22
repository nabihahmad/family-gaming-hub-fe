import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FlipCard } from "./FlipCard";
import { cn } from "@/lib/utils";

interface Props { front: ReactNode; back: ReactNode; className?: string; onReveal?: () => void }

/** Face-down card that flips only while pressed (prevents shoulder-surfing). */
export function HoldReveal({ front, back, className, onReveal }: Props) {
  const { t } = useTranslation();
  const [held, setHeld] = useState(false);
  const down = () => {
    setHeld(true);
    onReveal?.();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
  };
  const up = () => setHeld(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="button"
        aria-label={t("common.holdToReveal")}
        className={cn("no-select touch-none cursor-pointer", className)}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        onContextMenu={(e) => e.preventDefault()}
      >
        <FlipCard flipped={held} front={front} back={back} className="h-full w-full" />
      </div>
      <p className="text-sm text-muted-foreground">{t("common.holdToReveal")}</p>
    </div>
  );
}
