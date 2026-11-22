import { useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAME_IDS, type GameId, type GameOptions, type RoomState } from "@/lib/protocol";
import { useRoomStore } from "@/store/roomStore";
import { PlayerList } from "./PlayerList";
import { GameCard } from "./GameCard";
import { OptionsSheet } from "./OptionsSheet";
import { QrModal } from "./QrModal";
import { ConnectionBadge } from "./ConnectionBadge";
import { LangToggle } from "./LangToggle";

export function Lobby({ room, meId }: { room: RoomState; meId: string | null }) {
  const { t } = useTranslation();
  const send = useRoomStore((s) => s.send);
  const [open, setOpen] = useState<GameId | null>(null);
  const [qr, setQr] = useState(false);
  const isHost = room.hostId === meId;
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/r/${room.code}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success(t("lobby.copied")); } catch { /* ignore */ }
  };
  const start = (game: GameId, options: GameOptions) => {
    send({ type: "select_game", payload: { game, options } });
    send({ type: "start_game", payload: {} });
    setOpen(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-10 pt-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{t("lobby.room")}</p>
          <p className="font-mono text-3xl font-extrabold tracking-[0.2em]" dir="ltr">{room.code}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="icon" onClick={copy} aria-label={t("lobby.copy")}><Copy /></Button>
          <Button variant="secondary" size="icon" onClick={() => setQr(true)} aria-label={t("lobby.qr")}><QrCode /></Button>
          <LangToggle />
        </div>
      </header>
      <ConnectionBadge />

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{t("lobby.players")} · {room.players.length}</h2>
        <PlayerList players={room.players} hostId={room.hostId} meId={meId} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">{isHost ? t("lobby.pickGame") : t("lobby.waitingHost")}</h2>
        <LayoutGroup>
          {GAME_IDS.map((g, i) => (
            <GameCard key={g} game={g} index={i} disabled={!isHost} highlighted={room.game === g} hidden={open !== null && open !== g} onSelect={() => setOpen(g)} />
          ))}
          <AnimatePresence>
            {open && <OptionsSheet key={open} game={open} playerCount={room.players.filter((player) => player.connected).length} onClose={() => setOpen(null)} onStart={(o) => start(open, o)} />}
          </AnimatePresence>
        </LayoutGroup>
      </section>
      <QrModal open={qr} onOpenChange={setQr} url={url} code={room.code} />
    </div>
  );
}
