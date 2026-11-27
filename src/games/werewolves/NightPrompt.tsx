import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FlipCard } from "@/components/FlipCard";
import { PlayerAvatar } from "@/components/Avatar";
import type { Player, WerewolvesPrompt } from "@/lib/protocol";
import { RoleBack, RoleFace } from "./RoleCard";
import { cn } from "@/lib/utils";

const DEFAULT_MAX: Record<string, number> = { seer: 2, troublemaker: 2, robber: 1, drunk: 1, doppelganger: 1, werewolf: 1 };

export function NightPrompt({ prompt, myRole, players, meId, onSubmit }: {
  prompt: WerewolvesPrompt; myRole?: string | undefined; players: Player[]; meId: string | null; onSubmit: (targets: string[]) => void;
}) {
  const { t, i18n } = useTranslation();
  const [sel, setSel] = useState<string[]>([]);
  const opts = prompt.options;
  const selectablePlayers = (opts?.players ?? []).map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[];
  const centers = Array.from({ length: opts?.center ?? 0 }, (_, i) => `center-${i}`);
  const max = opts?.max ?? DEFAULT_MAX[prompt.kind] ?? 1;
  const min = opts?.min ?? 1;
  const isCenter = (s: string) => s.startsWith("center-");
  const toggle = (id: string) => setSel((s) => {
    if (s.includes(id)) return s.filter((x) => x !== id);
    // Seer: one player OR two center cards — don't mix.
    const base = s.length && isCenter(s[0]!) !== isCenter(id) ? [] : s;
    const limit = prompt.kind === "seer" && !isCenter(id) ? 1 : max;
    return [...base, id].slice(-limit);
  });
  const resultFor = (id: string) => prompt.result?.find((r) => r.target === id)?.role;
  const hasChoices = selectablePlayers.length + centers.length > 0;
  const promptKey = i18n.exists(`werewolves.prompt.${prompt.kind}`) ? prompt.kind : "generic";

  return (
    <div className="flex flex-col items-center gap-5">
      {myRole && <div className="h-44 w-32"><RoleFace role={myRole} compact /></div>}
      <h2 className="text-2xl font-bold text-moon">{t("werewolves.yourTurn")}</h2>
      <p className="max-w-xs text-center text-muted-foreground">{t(`werewolves.prompt.${promptKey}`)}</p>
      {prompt.info && prompt.info.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {prompt.info.map((id) => <li key={id} className="rounded-full bg-card px-3 py-1 font-semibold"><bdi>{players.find((p) => p.id === id)?.name ?? id}</bdi></li>)}
        </ul>
      )}
      {selectablePlayers.length > 0 && (
        <div className="grid w-full grid-cols-3 gap-2">
          {selectablePlayers.filter((p) =>
            p.id !== meId ||
            prompt.kind === "insomniac" ||
            prompt.result?.some((result) => result.target === p.id),
          ).map((p) => {
            const r = resultFor(p.id);
            return (
              <button key={p.id} disabled={!!prompt.result} onClick={() => toggle(p.id)}
                className={cn("flex flex-col items-center gap-1 rounded-2xl p-2 transition", sel.includes(p.id) ? "bg-moon text-moon-foreground" : "bg-card")}>
                {r ? <div className="h-24 w-18"><RoleFace role={r} compact /></div> : <PlayerAvatar id={p.id} name={p.name} />}
                <span className="w-full truncate text-sm font-medium"><bdi>{p.name}</bdi></span>
              </button>
            );
          })}
        </div>
      )}
      {centers.length > 0 && (
        <div className="flex gap-3">
          {centers.map((c, i) => {
            const r = resultFor(c);
            return (
              <button key={c} disabled={!!prompt.result} onClick={() => toggle(c)} className={cn("h-28 w-20 rounded-3xl transition", sel.includes(c) && "ring-4 ring-moon")}>
                <FlipCard flipped={!!r} className="h-full w-full" front={<RoleBack label={t("werewolves.center", { n: i + 1 })} />} back={r ? <RoleFace role={r} compact /> : null} />
              </button>
            );
          })}
        </div>
      )}
      {!prompt.result && hasChoices && (
        <Button variant="moon" size="xl" disabled={sel.length < min} onClick={() => onSubmit(sel)}>{t("common.confirm")}</Button>
      )}
      {!prompt.result && !hasChoices && <Button variant="moon" size="xl" onClick={() => onSubmit([])}>{t("werewolves.gotIt")}</Button>}
    </div>
  );
}
