import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { CodenamesView } from "@/lib/protocol";
import { Confetti, HostLobbyButton, type GameProps } from "../common";
import { Setup } from "./Setup";
import { Board } from "./Board";
import { cn } from "@/lib/utils";

export function Codenames(props: GameProps<CodenamesView>) {
  const { view, sendEvent, isHost, backToLobby } = props;
  const { t } = useTranslation();
  if (view.phase === "setup") return <Setup {...props} />;
  const myTurn = view.myTeam === view.turn && !view.isSpymaster && view.phase === "playing";
  const team = (tm: "red" | "blue") => t(`codenames.${tm}`);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 py-4">
      <div className={cn("flex items-center justify-between rounded-2xl px-4 py-3 font-bold shadow-soft", view.turn === "red" ? "bg-team-red text-team-red-foreground" : "bg-team-blue text-team-blue-foreground")}>
        <span className="text-team-red-foreground">{view.remaining.red} <span className="text-xs font-medium opacity-80">{team("red")}</span></span>
        <span>{t("codenames.turn", { team: team(view.turn) })}</span>
        <span>{view.remaining.blue} <span className="text-xs font-medium opacity-80">{team("blue")}</span></span>
      </div>
      <Board view={view} canReveal={myTurn} onReveal={(index) => sendEvent("reveal", { index })} />
      {myTurn && <Button variant="outline" size="touch" onClick={() => sendEvent("end_turn")}>{t("codenames.endTurn")}</Button>}
      {view.phase === "finished" && view.winner && (
        <>
          <Confetti />
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={cn("rounded-3xl p-6 text-center text-3xl font-extrabold shadow-lift", view.winner === "red" ? "bg-team-red text-team-red-foreground" : "bg-team-blue text-team-blue-foreground")}>
            {t("codenames.wins", { team: team(view.winner) })}
          </motion.div>
          <HostLobbyButton isHost={isHost} onClick={backToLobby} />
        </>
      )}
    </div>
  );
}
