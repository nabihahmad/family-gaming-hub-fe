import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Player, RoomState, SendEvent } from "@/lib/protocol";

export interface GameProps<V> { view: V; sendEvent: SendEvent; room: RoomState; meId: string | null; isHost: boolean; backToLobby: () => void }

export const playerName = (players: Player[], id?: string) => players.find((p) => p.id === id)?.name ?? "?";

export function HostLobbyButton({ isHost, onClick, label }: { isHost: boolean; onClick: () => void; label?: string }) {
  const { t } = useTranslation();
  if (!isHost) return <p className="text-center text-muted-foreground">{t("common.waitingHost")}</p>;
  return <Button variant="outline" size="touch" onClick={onClick}>{label ?? t("common.backToLobby")}</Button>;
}

export function Confetti() {
  const colors = ["bg-team-red", "bg-team-blue", "bg-moon", "bg-imposter", "bg-codenames"];
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i} className={`absolute top-0 h-3 w-2 rounded-sm ${colors[i % colors.length]} animate-[confetti_1.8s_ease-in_forwards]`}
          style={{ insetInlineStart: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.08}s` }} />
      ))}
    </div>
  );
}
