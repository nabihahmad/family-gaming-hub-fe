import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/Avatar";
import type { CodenamesView, Team } from "@/lib/protocol";
import { playerName, type GameProps } from "../common";
import { cn } from "@/lib/utils";

export function Setup({ view, sendEvent, room, isHost }: GameProps<CodenamesView>) {
  const { t } = useTranslation();
  const sm = view.teams.spymasters;
  const ready = (["red", "blue"] as Team[]).every((tm) => sm[tm] && view.teams[tm].some((id) => id !== sm[tm]));
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <div className="grid grid-cols-2 gap-3">
        {(["red", "blue"] as Team[]).map((tm) => (
          <div key={tm} className={cn("flex flex-col gap-2 rounded-3xl p-3 shadow-soft", tm === "red" ? "bg-team-red/15" : "bg-team-blue/15")}>
            <h3 className={cn("text-center text-lg font-bold", tm === "red" ? "text-team-red" : "text-team-blue")}>{t(`codenames.${tm}`)}</h3>
            <ul className="flex min-h-20 flex-col gap-1.5">
              {view.teams[tm].map((id) => (
                <li key={id} className="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5">
                  <PlayerAvatar id={id} name={playerName(room.players, id)} className="h-8 w-8 text-sm" />
                  <span className="flex-1 truncate text-sm font-medium"><bdi>{playerName(room.players, id)}</bdi></span>
                  {sm[tm] === id && <Eye className="h-4 w-4" aria-label={t("codenames.spymaster")} />}
                </li>
              ))}
            </ul>
            <Button variant={tm} size="touch" onClick={() => sendEvent("set_team", { team: tm })} disabled={view.myTeam === tm}>
              {t(tm === "red" ? "codenames.joinRed" : "codenames.joinBlue")}
            </Button>
          </div>
        ))}
      </div>
      {view.myTeam && !sm[view.myTeam] && (
        <Button variant="outline" size="touch" onClick={() => sendEvent("become_spymaster")}><Eye /> {t("codenames.becomeSpymaster")}</Button>
      )}
      {isHost && (
        <div className="flex flex-col gap-1">
          <Button variant="codenames" size="xl" disabled={!ready} onClick={() => sendEvent("begin")}>{t("codenames.begin")}</Button>
          {!ready && <p className="text-center text-sm text-muted-foreground">{t("codenames.beginHint")}</p>}
        </div>
      )}
    </div>
  );
}
