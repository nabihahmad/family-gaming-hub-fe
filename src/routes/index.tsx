import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Copy, Grid3x3, LogOut, Moon, VenetianMask } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColdStart } from "@/components/ColdStart";
import { LangToggle } from "@/components/LangToggle";
import { api, type AccessSession, withWarmup } from "@/lib/api";
import { useDocumentLang } from "@/hooks/use-ui-lang";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "@/lib/storage";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    room:
      typeof search.room === "string" &&
      /^[A-HJ-NP-Z2-9]{4}$/i.test(search.room)
        ? search.room.toUpperCase()
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Family Games — party games on your phones" },
      {
        name: "description",
        content:
          "Play Codenames, Imposter and Werewolves together on your phones.",
      },
      {
        property: "og:title",
        content: "Family Games — party games on your phones",
      },
      {
        property: "og:description",
        content:
          "Start a room and play Codenames, Imposter and Werewolves together on your phones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, i18n } = useTranslation();
  useDocumentLang(i18n.language);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [warming, setWarming] = useState(false);
  const [session, setSession] = useState<AccessSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mode, setMode] = useState<"admin" | "guest">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (search.room) setCode(search.room);
  }, [search.room]);

  useEffect(() => {
    api.health().catch(() => {});
    const token = getAccessToken();
    if (!token) {
      setCheckingSession(false);
    } else {
      api
        .session(token)
        .then(setSession)
        .catch(() => {
          clearAccessToken();
          setSession(null);
        })
        .finally(() => setCheckingSession(false));
    }
    const onExpired = () => {
      setSession(null);
      setCheckingSession(false);
      setAuthError(t("auth.sessionExpired"));
    };
    window.addEventListener("fg:auth-expired", onExpired);
    return () => window.removeEventListener("fg:auth-expired", onExpired);
  }, [t]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    try {
      const result =
        mode === "admin"
          ? await api.login(username, password)
          : await api.redeemAccessCode(accessCode);
      saveAccessToken(result.accessToken);
      setSession({
        role: result.role,
        ...(result.role === "admin" ? { accessCode: result.accessCode } : {}),
      });
      setPassword("");
    } catch {
      setAuthError(
        t(mode === "admin" ? "auth.loginFailed" : "auth.accessFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const newRoom = async () => {
    setBusy(true);
    setAuthError("");
    try {
      const r = await withWarmup(api.createRoom, setWarming);
      void navigate({ to: "/r/$code", params: { code: r.code } });
    } catch {
      setAuthError(t("auth.failed"));
      setBusy(false);
    }
  };
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 4) void navigate({ to: "/r/$code", params: { code } });
  };
  const logout = async () => {
    const token = getAccessToken();
    if (!token) {
      clearAccessToken();
      setSession(null);
      return;
    }
    setBusy(true);
    setAuthError("");
    try {
      await api.logout(token);
      clearAccessToken();
      setSession(null);
      setCode("");
      setAccessCode("");
    } catch {
      setAuthError(t("auth.logoutFailed"));
    } finally {
      setBusy(false);
    }
  };
  const copyAccessCode = async () => {
    if (!session?.accessCode) return;
    try {
      await navigator.clipboard.writeText(session.accessCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setAuthError(t("auth.copyFailed"));
    }
  };

  const icons = [
    { I: Grid3x3, c: "bg-codenames text-codenames-foreground", r: -10 },
    { I: VenetianMask, c: "bg-imposter text-imposter-foreground", r: 0 },
    { I: Moon, c: "bg-werewolf text-werewolf-foreground", r: 10 },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-6">
      {warming && <ColdStart />}
      <div className="flex justify-end">
        <LangToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
        <div className="flex">
          {icons.map(({ I, c, r }, i) => (
            <motion.div
              key={i}
              initial={{ y: 40, opacity: 0, rotate: 0 }}
              animate={{ y: i === 1 ? -10 : 0, opacity: 1, rotate: r }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                delay: i * 0.08,
              }}
              className={`-mx-2 flex h-28 w-20 items-center justify-center rounded-2xl shadow-lift ${c}`}
            >
              <I className="h-9 w-9" />
            </motion.div>
          ))}
        </div>
        <div>
          <h1 className="text-4xl font-extrabold">{t("app.title")}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {t("app.tagline")}
          </p>
        </div>
        {checkingSession ? (
          <p className="text-sm text-muted-foreground">
            {t("options.loading")}
          </p>
        ) : !session ? (
          <section className="w-full space-y-4 text-start">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === "admin" ? "default" : "secondary"}
                onClick={() => {
                  setMode("admin");
                  setAuthError("");
                }}
              >
                {t("auth.adminLogin")}
              </Button>
              <Button
                type="button"
                variant={mode === "guest" ? "default" : "secondary"}
                onClick={() => {
                  setMode("guest");
                  setAuthError("");
                }}
              >
                {t("auth.guestAccess")}
              </Button>
            </div>
            <form onSubmit={signIn} className="flex flex-col gap-3">
              {mode === "admin" ? (
                <>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder={t("auth.username")}
                    aria-label={t("auth.username")}
                    className="h-12 rounded-xl"
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder={t("auth.password")}
                    aria-label={t("auth.password")}
                    className="h-12 rounded-xl"
                  />
                  <Button
                    type="submit"
                    size="xl"
                    disabled={busy || !username.trim() || !password}
                  >
                    {t("auth.signIn")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("auth.guestHint")}
                  </p>
                  <Input
                    value={accessCode}
                    onChange={(e) =>
                      setAccessCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/[^A-HJ-NP-Z2-9]/g, "")
                          .slice(0, 8),
                      )
                    }
                    placeholder={t("auth.accessCode")}
                    aria-label={t("auth.accessCode")}
                    dir="ltr"
                    autoCapitalize="characters"
                    className="h-12 rounded-xl text-center font-mono text-xl tracking-[0.3em]"
                  />
                  <Button
                    type="submit"
                    size="xl"
                    disabled={busy || accessCode.length !== 8}
                  >
                    {t("auth.continue")}
                  </Button>
                </>
              )}
              {authError && (
                <p
                  role="alert"
                  className="text-center text-sm text-destructive"
                >
                  {authError}
                </p>
              )}
            </form>
          </section>
        ) : (
          <section className="w-full space-y-4">
            {session.role === "admin" ? (
              <>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("auth.shareAccessCode")}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span
                      className="font-mono text-3xl font-extrabold tracking-[0.25em]"
                      dir="ltr"
                    >
                      {session.accessCode}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={copied ? t("auth.copied") : t("auth.copy")}
                      onClick={copyAccessCode}
                    >
                      <Copy />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {copied ? t("auth.copied") : t("auth.shareHint")}
                  </p>
                </div>
                <Button
                  size="xl"
                  className="w-full"
                  onClick={newRoom}
                  disabled={busy}
                >
                  {t("landing.newRoom")}
                </Button>
              </>
            ) : (
              <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
                {t("auth.guestReady")}
              </p>
            )}
            <form onSubmit={join} className="flex w-full flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t("landing.or")}</p>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 4),
                    )
                  }
                  placeholder={t("landing.joinCode")}
                  aria-label={t("landing.joinCode")}
                  dir="ltr"
                  autoCapitalize="characters"
                  className="h-12 rounded-xl text-center font-mono text-xl tracking-[0.3em] placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="touch"
                  disabled={code.length !== 4}
                >
                  {t("landing.join")}
                </Button>
              </div>
            </form>
            <Button
              type="button"
              variant="ghost"
              onClick={logout}
              disabled={busy}
              className="w-full"
            >
              <LogOut />
              {t(
                session.role === "admin"
                  ? "auth.logoutAdmin"
                  : "auth.logoutGuest",
              )}
            </Button>
            {authError && (
              <p role="alert" className="text-center text-sm text-destructive">
                {authError}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
