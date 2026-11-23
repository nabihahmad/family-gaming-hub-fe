import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldReveal } from "@/components/HoldReveal";
import { FlipCard } from "@/components/FlipCard";
import type { WerewolvesView } from "@/lib/protocol";
import { Confetti, HostLobbyButton, type GameProps } from "../common";
import { RoleBack, RoleFace } from "./RoleCard";
import { NightPrompt } from "./NightPrompt";
import { cn } from "@/lib/utils";

function Countdown({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.round((endsAt - now) / 1000));
  return (
    <p
      className="font-mono text-6xl font-bold tabular-nums text-moon"
      dir="ltr"
    >
      {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
    </p>
  );
}

export function Werewolves({
  view,
  sendEvent,
  room,
  meId,
  isHost,
  backToLobby,
}: GameProps<WerewolvesView>) {
  const { t } = useTranslation();
  const others = room.players.filter((p) => p.id !== meId);

  return (
    <div className="night dark flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
        {view.phase === "role_reveal" && view.myRole && (
          <>
            <h2 className="text-xl font-semibold text-muted-foreground">
              {t("werewolves.yourRole")}
            </h2>
            <HoldReveal
              className="h-[26rem] w-72"
              front={<RoleBack />}
              back={<RoleFace role={view.myRole} />}
            />
            {view.acked ? (
              <p className="text-muted-foreground">
                {t("werewolves.waitingOthers")}
              </p>
            ) : (
              <Button
                variant="moon"
                size="xl"
                onClick={() => sendEvent("ack_role")}
              >
                {t("werewolves.gotIt")}
              </Button>
            )}
          </>
        )}

        {view.phase === "night" &&
          (view.prompt ? (
            <NightPrompt
              prompt={view.prompt}
              myRole={view.myRole}
              players={room.players}
              meId={meId}
              onSubmit={(targets) => sendEvent("night_action", { targets })}
            />
          ) : (
            <motion.div
              className="flex flex-col items-center gap-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Moon className="h-24 w-24 text-moon" />
              </motion.div>
              <h2 className="text-3xl font-bold">{t("werewolves.night")}</h2>
              <p className="text-lg text-muted-foreground">
                {t("werewolves.closeEyes")}
              </p>
            </motion.div>
          ))}

        {view.phase === "day" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Sun className="h-20 w-20 text-moon" />
            <h2 className="text-3xl font-bold">{t("werewolves.day")}</h2>
            {view.endsAt && <Countdown endsAt={view.endsAt} />}
            {isHost && (
              <Button
                variant="moon"
                size="xl"
                onClick={() => sendEvent("end_game")}
              >
                {t("werewolves.startVote")}
              </Button>
            )}
          </div>
        )}

        {view.phase === "vote" && (
          <>
            <h2 className="text-3xl font-bold">{t("werewolves.vote")}</h2>
            <p className="text-muted-foreground">{t("werewolves.voteHint")}</p>
            {view.endsAt && <Countdown endsAt={view.endsAt} />}
            <div className="grid w-full grid-cols-3 gap-2">
              {others.map((p) => (
                <button
                  key={p.id}
                  onClick={() => sendEvent("vote", { target: p.id })}
                  className={cn(
                    "flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl p-2 transition active:scale-95",
                    view.myVote === p.id
                      ? "bg-moon/15 ring-2 ring-moon"
                      : "bg-card",
                  )}
                >
                  <div className="h-28 w-20">
                    <RoleBack />
                  </div>
                  <span className="w-full truncate text-sm font-medium">
                    <bdi>{p.name}</bdi>
                  </span>
                </button>
              ))}
            </div>
            {view.totalPlayers !== undefined && (
              <p className="text-sm text-muted-foreground">
                {t("werewolves.voted", {
                  voted: view.votedCount ?? 0,
                  total: view.totalPlayers,
                })}
              </p>
            )}
          </>
        )}

        {view.phase === "result" && view.result && (
          <>
            <h2 className="text-3xl font-bold">{t("werewolves.result")}</h2>
            <div className="grid w-full grid-cols-3 gap-3">
              {room.players.map((p, i) => {
                const role = view.result!.roles[p.id];
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <FlipCard
                      flipped
                      delay={0.4 + i * 0.35}
                      className={cn(
                        "aspect-[3/4] w-full",
                        view.result!.dead.includes(p.id) &&
                          "ring-4 ring-destructive",
                      )}
                      front={<RoleBack />}
                      back={
                        role ? <RoleFace role={role} compact /> : <RoleBack />
                      }
                    />
                    <span className="w-full truncate text-center text-sm font-medium">
                      <bdi>{p.name}</bdi>
                    </span>
                    {view.result!.dead.includes(p.id) && (
                      <span className="text-xs font-semibold text-destructive">
                        {t("werewolves.killed")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {view.result.winners.length > 0 && (
              <>
                <Confetti />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + room.players.length * 0.35 }}
                  className="rounded-3xl bg-moon px-6 py-4 text-center text-2xl font-extrabold text-moon-foreground shadow-lift"
                >
                  {t("werewolves.won", {
                    team: view.result.winners
                      .map((winner) =>
                        t(`teams.${winner}`, { defaultValue: winner }),
                      )
                      .join(t("werewolves.winnerSeparator")),
                  })}
                </motion.div>
              </>
            )}
            {isHost && (
              <Button
                variant="moon"
                size="xl"
                onClick={() => sendEvent("next_game")}
              >
                {t("werewolves.nextGame")}
              </Button>
            )}
            <HostLobbyButton isHost={isHost} onClick={backToLobby} />
          </>
        )}
      </div>
    </div>
  );
}
