import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColdStart } from "@/components/ColdStart";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Lobby } from "@/components/Lobby";
import { api, withWarmup } from "@/lib/api";
import {
  getAccessToken,
  getCreds,
  getGuestCode,
  getName,
  saveGuestCode,
  saveAccessToken,
} from "@/lib/storage";
import { useRoomStore } from "@/store/roomStore";
import { useGameStore } from "@/store/gameStore";
import { useDocumentLang } from "@/hooks/use-ui-lang";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { Codenames } from "@/games/codenames/Codenames";
import { Imposter } from "@/games/imposter/Imposter";
import { Werewolves } from "@/games/werewolves/Werewolves";

export const Route = createFileRoute("/r/$code")({
  validateSearch: validateRoomSearch,
  head: ({ params }) => ({
    meta: [
      { title: `Room ${params.code.toUpperCase()} — Family Games` },
      {
        name: "description",
        content:
          "You've been invited to a Family Games room. Enter your name to join.",
      },
      {
        property: "og:title",
        content: `Join room ${params.code.toUpperCase()} — Family Games`,
      },
      {
        property: "og:description",
        content:
          "Play Codenames, Imposter and Werewolves together on your phones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RoomPage,
});

export function validateRoomSearch(search: Record<string, unknown>) {
  return {
    guest:
      typeof search.guest === "string" &&
      /^[A-HJ-NP-Z2-9]{8}$/i.test(search.guest)
        ? search.guest.toUpperCase()
        : undefined,
  };
}

type Check = "checking" | "missing" | "ok";

function RoomPage() {
  const code = Route.useParams().code.toUpperCase();
  const { guest } = Route.useSearch();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { status, room, playerId, joinError, join, send, leave } =
    useRoomStore();
  const current = useGameStore((s) => s.current);
  const [check, setCheck] = useState<Check>("checking");
  const [warming, setWarming] = useState(false);
  const [name, setName] = useState("");
  const [shareCode, setShareCode] = useState<string | null>(() =>
    getGuestCode(),
  );

  useEffect(() => {
    const signal = { cancelled: false };
    const onExpired = () => {
      void navigate({ to: "/", search: { room: code } });
    };
    window.addEventListener("fg:auth-expired", onExpired);
    const initializeRoom = async () => {
      if (guest) {
        saveGuestCode(guest);
        setShareCode(guest);
      }
      let token = getAccessToken();
      if (!token && guest) {
        try {
          const session = await withWarmup(
            () => api.redeemAccessCode(guest),
            setWarming,
            signal,
          );
          if (signal.cancelled) return;
          token = session.accessToken;
          saveAccessToken(token);
        } catch {
          if (!signal.cancelled)
            void navigate({ to: "/", search: { room: code } });
          return;
        }
      }

      if (guest) {
        await navigate({
          to: "/r/$code",
          params: { code },
          search: { guest: undefined },
          replace: true,
        });
      }

      if (!token) {
        void navigate({ to: "/", search: { room: code } });
        return;
      }

      setName(getName());
      try {
        const roomStatus = await withWarmup(
          async () => {
            const session = await api.session(token);
            const guestCode = session.accessCode ?? getGuestCode();
            setShareCode(guestCode);
            if (session.accessCode) saveGuestCode(session.accessCode);
            return api.getRoom(code);
          },
          setWarming,
          signal,
        );
        if (signal.cancelled) return;
        if (!roomStatus.exists) return setCheck("missing");
        setCheck("ok");
        const creds = getCreds(code);
        if (creds?.name) join(code, creds.name);
      } catch {
        if (signal.cancelled) return;
        if (!getAccessToken())
          void navigate({ to: "/", search: { room: code } });
        else setCheck("missing");
      }
    };
    void initializeRoom();
    return () => {
      signal.cancelled = true;
      window.removeEventListener("fg:auth-expired", onExpired);
      leave();
    };
  }, [code, guest, join, leave, navigate]);

  const playing = room?.phase === "playing";
  const gameLang = playing
    ? (room?.options?.lang ?? i18n.language)
    : i18n.language;
  useDocumentLang(gameLang);
  useWakeLock(!!playing);

  if (warming || status === "warming") return <ColdStart />;

  if (check === "missing") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold">{t("join.notFound")}</h1>
        <p className="text-muted-foreground">{t("join.notFoundBody")}</p>
        <Button asChild size="xl">
          <Link to="/">{t("landing.newRoom")}</Link>
        </Button>
      </main>
    );
  }

  if (check === "checking") return <main className="min-h-dvh" />;

  if (status === "idle" || status === "closed") {
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const n = name.trim();
      if (n) join(code, n);
    };
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            {t("join.title")}
          </p>
          <p
            className="font-mono text-4xl font-extrabold tracking-[0.25em]"
            dir="ltr"
          >
            {code}
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            autoFocus
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("join.name")}
            aria-label={t("join.name")}
            className="h-14 rounded-2xl text-center text-lg"
          />
          <Button type="submit" size="xl" disabled={!name.trim()}>
            {t("join.button")}
          </Button>
          {joinError && (
            <p className="text-center text-sm text-destructive">{joinError}</p>
          )}
        </form>
      </main>
    );
  }

  if (!room)
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <ConnectionBadge />
      </main>
    );

  if (room.phase === "lobby" || !current)
    return (
      <main className="min-h-dvh">
        <Lobby room={room} meId={playerId} guestCode={shareCode} />
      </main>
    );

  const isHost = room.hostId === playerId;
  const common = {
    room,
    meId: playerId,
    isHost,
    sendEvent: (name: string, data?: object) =>
      send({ type: "game_event", payload: { name, data } }),
    backToLobby: () => send({ type: "back_to_lobby", payload: {} }),
  };
  const lang = room.options?.lang ?? "en";
  return (
    <main
      className="flex min-h-dvh flex-col"
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none fixed inset-x-0 top-2 z-20 flex justify-center">
        {status !== "connected" && <ConnectionBadge />}
      </div>
      {current.game === "codenames" && (
        <Codenames view={current.view} {...common} />
      )}
      {current.game === "imposter" && (
        <Imposter view={current.view} {...common} />
      )}
      {current.game === "werewolves" && (
        <Werewolves view={current.view} {...common} />
      )}
    </main>
  );
}
