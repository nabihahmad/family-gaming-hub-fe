import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CodenamesView } from "@/lib/protocol";
import { Confetti, HostLobbyButton, type GameProps } from "../common";
import { Setup } from "./Setup";
import { Board } from "./Board";
import { cn } from "@/lib/utils";

export function Codenames(props: GameProps<CodenamesView>) {
  const { view, sendEvent, isHost, backToLobby } = props;
  const { t } = useTranslation();
  const [clueText, setClueText] = useState("");
  const [clueNumber, setClueNumber] = useState("1");
  if (view.phase === "setup") return <Setup {...props} />;
  const myTurn =
    view.myTeam === view.turn &&
    !view.isSpymaster &&
    view.phase === "playing" &&
    !!view.clue;
  const canGiveClue =
    view.myTeam === view.turn &&
    view.isSpymaster &&
    view.phase === "playing" &&
    !view.clue;
  const parsedClueNumber = Number(clueNumber);
  const team = (tm: "red" | "blue") => t(`codenames.${tm}`);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 py-4">
      <div
        className={cn(
          "flex items-center justify-between rounded-2xl px-4 py-3 font-bold shadow-soft",
          view.turn === "red"
            ? "bg-team-red text-team-red-foreground"
            : "bg-team-blue text-team-blue-foreground",
        )}
      >
        <span className="text-team-red-foreground">
          {view.remaining.red}{" "}
          <span className="text-xs font-medium opacity-80">{team("red")}</span>
        </span>
        <span>{t("codenames.turn", { team: team(view.turn) })}</span>
        <span>
          {view.remaining.blue}{" "}
          <span className="text-xs font-medium opacity-80">{team("blue")}</span>
        </span>
      </div>
      {view.clue ? (
        <div
          className="rounded-2xl border bg-card px-4 py-3 text-center"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("codenames.clueFrom", { team: team(view.clue.team) })}
          </p>
          <p className="mt-1 text-2xl font-extrabold" lang={view.lang}>
            <bdi>{view.clue.text}</bdi>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("codenames.clueNumber", {
              number: view.clue.number === 0 ? "∞" : view.clue.number,
            })}
            {" · "}
            {t("codenames.guesses", {
              made: view.guessesMade ?? 0,
              limit: view.clue.number === 0 ? "∞" : view.clue.number + 1,
            })}
          </p>
        </div>
      ) : canGiveClue ? (
        <form
          className="flex flex-col gap-3 rounded-2xl border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              !clueText.trim() ||
              !Number.isInteger(parsedClueNumber) ||
              parsedClueNumber < 0 ||
              parsedClueNumber > 25
            )
              return;
            sendEvent("give_clue", {
              text: clueText.trim(),
              number: parsedClueNumber,
            });
            setClueText("");
            setClueNumber("1");
          }}
        >
          <p className="text-center text-sm font-semibold text-muted-foreground">
            {t("codenames.giveClue")}
          </p>
          <Input
            value={clueText}
            onChange={(event) => setClueText(event.target.value)}
            maxLength={80}
            placeholder={t("codenames.clue")}
            aria-label={t("codenames.clue")}
            required
            className="h-12 rounded-xl text-center text-lg"
          />
          <label className="flex items-center justify-center gap-3 text-sm font-medium">
            <span>{t("codenames.number")}</span>
            <Input
              type="number"
              min={0}
              max={25}
              step={1}
              value={clueNumber}
              onChange={(event) => setClueNumber(event.target.value)}
              aria-label={t("codenames.number")}
              className="h-11 w-24 rounded-xl text-center font-mono text-lg"
            />
            <span className="text-muted-foreground">
              {t("codenames.zeroInfinity")}
            </span>
          </label>
          <Button
            type="submit"
            variant="codenames"
            size="touch"
            disabled={
              !clueText.trim() ||
              !Number.isInteger(parsedClueNumber) ||
              parsedClueNumber < 0 ||
              parsedClueNumber > 25
            }
          >
            {t("codenames.sendClue")}
          </Button>
        </form>
      ) : view.phase === "playing" ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("codenames.waitingClue")}
        </p>
      ) : null}
      <Board
        view={view}
        canReveal={myTurn}
        onReveal={(index) => sendEvent("reveal", { index })}
      />
      {myTurn && (
        <Button
          variant="outline"
          size="touch"
          onClick={() => sendEvent("end_turn")}
        >
          {t("codenames.endTurn")}
        </Button>
      )}
      {view.phase === "finished" && view.winner && (
        <>
          <Confetti />
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "rounded-3xl p-6 text-center text-3xl font-extrabold shadow-lift",
              view.winner === "red"
                ? "bg-team-red text-team-red-foreground"
                : "bg-team-blue text-team-blue-foreground",
            )}
          >
            {t("codenames.wins", { team: team(view.winner) })}
          </motion.div>
          <HostLobbyButton isHost={isHost} onClick={backToLobby} />
        </>
      )}
    </div>
  );
}
