import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { VenetianMask } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldReveal } from "@/components/HoldReveal";
import { FlipCard } from "@/components/FlipCard";
import type { ImposterView } from "@/lib/protocol";
import { HostLobbyButton, type GameProps } from "../common";

const Face = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl p-6 text-center shadow-lift ${className}`}>{children}</div>
);

export function Imposter({ view, sendEvent, isHost, backToLobby }: GameProps<ImposterView>) {
  const { t } = useTranslation();
  const [looked, setLooked] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  useEffect(() => {
    if (timer === null || timer <= 0) return;
    const id = setTimeout(() => setTimer((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);
  const big = view.lang === "ar" ? "text-4xl" : "text-3xl";

  const secret = (
    <Face className={view.isImposter ? "bg-imposter text-imposter-foreground" : "bg-card"}>
      {view.isImposter ? (
        <>
          <VenetianMask className="h-12 w-12" />
          <p className={`${big} font-extrabold`}>{t("imposter.youAreImposter")}</p>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t("imposter.yourWord")}</p>
          <p className={`${big} font-extrabold break-words`}>{view.word}</p>
        </>
      )}
      {view.hint && <p className="text-base opacity-80">{t("imposter.hint", { hint: view.hint })}</p>}
    </Face>
  );
  const back = (
    <Face className="bg-imposter text-imposter-foreground">
      <VenetianMask className="h-16 w-16 opacity-80" />
    </Face>
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
      {view.phase === "reveal" && (
        <>
          <HoldReveal className="h-96 w-72" front={back} back={secret} onReveal={() => setLooked(true)} />
          {view.iAmReady ? <p className="text-muted-foreground">{t("imposter.waiting")}</p> : (
            <Button variant="imposter" size="xl" disabled={!looked} onClick={() => sendEvent("ready")}>{t("imposter.seen")}</Button>
          )}
          <p className="text-sm font-semibold text-muted-foreground">{t("imposter.ready", { ready: view.readyCount, total: view.totalPlayers })}</p>
        </>
      )}
      {view.phase === "discussion" && (
        <>
          <motion.h2 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center text-4xl font-extrabold">{t("imposter.discuss")}</motion.h2>
          {timer !== null ? (
            <p className="font-mono text-6xl font-bold tabular-nums" dir="ltr">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</p>
          ) : (
            <Button variant="outline" size="touch" onClick={() => setTimer(180)}>{t("imposter.timer")}</Button>
          )}
          <HoldReveal className="h-56 w-44" front={back} back={secret} />
          {isHost && <Button variant="imposter" size="xl" onClick={() => sendEvent("reveal_imposter")}>{t("imposter.reveal")}</Button>}
        </>
      )}
      {view.phase === "result" && view.result && (
        <>
          <FlipCard
            flipped
            delay={0.3}
            className="h-80 w-72"
            front={back}
            back={
              <Face className="bg-imposter text-imposter-foreground">
                <p className="text-sm opacity-80">{t("imposter.theImposter")}</p>
                {view.result.imposters.map((n) => <p key={n} className="text-3xl font-extrabold"><bdi>{n}</bdi></p>)}
                <p className="mt-3 text-sm opacity-80">{t("imposter.theWord")}</p>
                <p className={`${big} font-extrabold`}>{view.result.word}</p>
              </Face>
            }
          />
          {isHost && <Button variant="imposter" size="xl" onClick={() => sendEvent("next_round")}>{t("imposter.nextRound")}</Button>}
          <HostLobbyButton isHost={isHost} onClick={backToLobby} />
        </>
      )}
    </div>
  );
}
