import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldReveal } from "@/components/HoldReveal";
import { FlipCard } from "@/components/FlipCard";
import type {
  Player,
  WerewolvesPrivateResult,
  WerewolvesView,
} from "@/lib/protocol";
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

function NightResults({
  results,
  players,
}: {
  results: WerewolvesPrivateResult[];
  players: Player[];
}) {
  const { t } = useTranslation();

  return (
    <section className="w-full">
      <HoldReveal
        className="h-56 w-full"
        front={
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-card p-4">
            <Moon className="h-12 w-12 text-moon" />
            <h3 className="text-center font-semibold">
              {t("werewolves.nightResults")}
            </h3>
          </div>
        }
        back={
          <div className="h-full overflow-y-auto rounded-2xl bg-card p-4">
            {results.length ? (
              <div className="flex flex-col gap-4">
                {results.map((result, index) => (
                  <div
                    key={`${result.kind}-${index}`}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-center text-sm font-medium text-muted-foreground">
                      {t(`roles.${result.kind}.name`)}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {result.cards.map((card) => {
                        const centerNumber = card.target.startsWith("center-")
                          ? Number(card.target.slice("center-".length)) + 1
                          : undefined;
                        const targetName =
                          centerNumber !== undefined
                            ? t("werewolves.center", { n: centerNumber })
                            : (players.find(
                                (player) => player.id === card.target,
                              )?.name ?? card.target);
                        return (
                          <div
                            key={`${card.target}-${card.role}`}
                            className="flex w-20 flex-col items-center gap-1"
                          >
                            <div className="h-24 w-16">
                              <RoleFace role={card.role} compact />
                            </div>
                            <span className="w-full truncate text-center text-xs">
                              <bdi>{targetName}</bdi>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                {t("werewolves.noNightResults")}
              </p>
            )}
          </div>
        }
      />
    </section>
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
  const showNightDiscoveries = room.options?.nightDiscoveries !== false;
  const availableRoles = view.availableRoles ?? [];

  return (
    <div className="night dark flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
        {(view.phase === "day" || view.phase === "vote") &&
          availableRoles.length > 0 && (
            <div className="flex w-full flex-wrap justify-center gap-2">
              {availableRoles.map(({ role, count }) => {
                const name = t(`roles.${role}.name`);
                return (
                  <div
                    key={role}
                    className="relative h-10 w-10"
                    title={count > 1 ? `${name} (${count})` : name}
                  >
                    <img
                      src={`/roles/${role}.webp`}
                      alt={count > 1 ? `${name} (${count})` : name}
                      className="h-full w-full rounded-full border-2 border-moon/50 object-cover shadow"
                    />
                    {count > 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-moon px-1 text-[10px] font-bold text-background shadow"
                      >
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
            {showNightDiscoveries && (
              <NightResults
                results={view.privateResults ?? []}
                players={room.players}
              />
            )}
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
            {showNightDiscoveries && (
              <NightResults
                results={view.privateResults ?? []}
                players={room.players}
              />
            )}
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
