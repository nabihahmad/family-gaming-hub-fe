import { useTranslation } from "react-i18next";
import { useRoomStore } from "@/store/roomStore";
import { cn } from "@/lib/utils";

export function ConnectionBadge() {
  const { t } = useTranslation();
  const status = useRoomStore((s) => s.status);
  const ok = status === "connected";
  const label = ok ? t("conn.connected") : status === "reconnecting" ? t("conn.reconnecting") : t("conn.connecting");
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground" aria-live="polite">
      <span className={cn("h-2 w-2 rounded-full", ok ? "bg-success" : "animate-pulse bg-moon")} />
      {label}
    </div>
  );
}
