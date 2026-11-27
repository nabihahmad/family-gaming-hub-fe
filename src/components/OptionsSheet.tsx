import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { ROLE_IDS, type GameId, type GameOptions, type Lang, type Pack } from "@/lib/protocol";
import { DEFAULT_ROLES, GAME_META } from "./gameMeta";
import { cn } from "@/lib/utils";

const MIN_PACK_CARDS: Record<GameId, number> = { codenames: 25, imposter: 1, werewolves: 0 };

export function OptionsSheet({ game, playerCount, onClose, onStart }: { game: GameId; playerCount: number; onClose: () => void; onStart: (o: GameOptions) => void }) {
  const { t, i18n } = useTranslation();
  const m = GAME_META[game];
  const [lang, setLang] = useState<Lang>(i18n.language === "ar" ? "ar" : "en");
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [imposters, setImposters] = useState(1);
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [nightDiscoveries, setNightDiscoveries] = useState(true);
  const requiredRoles = playerCount + 3;
  const maxImposters = Math.min(3, Math.max(1, Math.floor((playerCount - 1) / 2)));
  const rolesForGame = roles.length <= requiredRoles
    ? [...roles, ...Array.from({ length: requiredRoles - roles.length }, () => "villager")]
    : roles;

  useEffect(() => {
    if (game === "werewolves") return;
    let alive = true;
    setPacks(null);
    api.packs(game, lang).then((p) => {
      if (!alive) return;
      setPacks(p);
      setSelected(p.filter((x) => x.count >= MIN_PACK_CARDS[game]).map((x) => x.id));
    }).catch(() => alive && setPacks([]));
    return () => { alive = false; };
  }, [game, lang]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const roleCount = (r: string) => roles.filter((x) => x === r).length;
  const cycleRole = (r: string) => {
    const max = r === "werewolf" || r === "mason" ? 2 : r === "villager" ? 3 : 1;
    const c = roleCount(r);
    setRoles((rs) => (c >= max ? rs.filter((x) => x !== r) : rs.length < requiredRoles ? [...rs, r] : rs));
  };

  const canStart = playerCount >= m.min && playerCount <= m.max && (game === "werewolves"
    ? rolesForGame.length === requiredRoles && roles.some((r) => r === "werewolf" || r === "minion")
    : selected.length > 0 && (game !== "imposter" || imposters <= maxImposters));

  useEffect(() => {
    setImposters((count) => Math.min(count, maxImposters));
  }, [maxImposters]);

  const start = () => {
    const o: GameOptions = { lang };
    if (game !== "werewolves") o.packs = selected;
    if (game === "imposter") o.imposters = imposters;
    if (game === "werewolves") {
      o.roles = rolesForGame;
      o.nightDiscoveries = nightDiscoveries;
    }
    onStart(o);
  };

  return (
    <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        layoutId={`game-${game}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("flex items-center gap-3 p-5", m.bg, m.fg)}>
          <m.icon className="h-7 w-7" />
          <h2 className="flex-1 text-2xl font-bold">{t(`games.${game}.name`)}</h2>
          <button aria-label={t("options.cancel")} onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-background/15"><X /></button>
        </div>
        <motion.div className="flex flex-col gap-6 overflow-y-auto p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t("options.language")}</h3>
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
              {(["en", "ar"] as Lang[]).map((l) => (
                <button key={l} lang={l} onClick={() => setLang(l)} className={cn("h-12 rounded-xl text-base font-semibold transition", lang === l ? "bg-card shadow-soft" : "text-muted-foreground")}>
                  {l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>
          </section>

          {game !== "werewolves" && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t("options.packs")}</h3>
              {packs === null ? <p className="text-muted-foreground">{t("options.loading")}</p> : packs.length === 0 ? <p className="text-muted-foreground">{t("options.noPacks")}</p> : (
                <div className="flex flex-wrap gap-2" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
                  {packs.map((p) => {
                    const disabled = p.count < MIN_PACK_CARDS[game];
                    const on = selected.includes(p.id);
                    return (
                      <button key={p.id} disabled={disabled} onClick={() => toggle(p.id)}
                        className={cn("min-h-12 rounded-full border-2 px-4 text-sm font-medium transition disabled:opacity-40", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}>
                        {p.name} <span className="opacity-70">· {t("options.cards", { count: p.count })}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {game === "imposter" && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t("options.imposters")}</h3>
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
                {[1, 2, 3].filter((n) => n <= maxImposters).map((n) => (
                  <button key={n} onClick={() => setImposters(n)} className={cn("h-12 rounded-xl text-lg font-bold", imposters === n ? "bg-card shadow-soft" : "text-muted-foreground")}>{n}</button>
                ))}
              </div>
            </section>
          )}

          {game === "werewolves" && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t("options.roles")} · {rolesForGame.length}</h3>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_IDS.map((r) => {
                  const c = rolesForGame.filter((role) => role === r).length;
                  const selectedCount = roleCount(r);
                  return (
                    <button key={r} onClick={() => cycleRole(r)} className={cn("relative overflow-hidden rounded-xl border-2 transition", selectedCount ? "border-moon" : "border-transparent opacity-50")}>
                      <img src={`/roles/${r}.webp`} alt={t(`roles.${r}.name`)} loading="lazy" width={512} height={682} className="aspect-[3/4] w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-werewolf/85 px-1 py-1 text-center text-xs font-semibold text-werewolf-foreground">{t(`roles.${r}.name`)}{c > 1 && ` ×${c}`}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {game === "werewolves" && (
            <section className="flex items-center justify-between gap-4 rounded-2xl bg-muted p-4">
              <div>
                <h3 className="font-semibold">{t("options.nightDiscoveries")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("options.nightDiscoveriesHint")}
                </p>
              </div>
              <Switch
                checked={nightDiscoveries}
                onCheckedChange={setNightDiscoveries}
                aria-label={t("options.nightDiscoveries")}
              />
            </section>
          )}

          <Button variant={m.button} size="xl" disabled={!canStart} onClick={start}>{t("options.start")}</Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
