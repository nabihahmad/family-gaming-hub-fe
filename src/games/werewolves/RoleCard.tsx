import { useTranslation } from "react-i18next";
import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleFace({ role, compact }: { role: string; compact?: boolean }) {
  const { t } = useTranslation();
  const name = t(`roles.${role}.name`, { defaultValue: role });
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-card shadow-lift">
      <img src={`/roles/${role}.webp`} alt={name} width={512} height={682} className="min-h-0 w-full flex-1 object-cover" draggable={false} />
      <div className={cn("bg-werewolf text-werewolf-foreground text-center", compact ? "px-1 py-1" : "px-3 py-3")}>
        <p className={cn("font-bold", compact ? "text-xs" : "text-xl")}>{name}</p>
        {!compact && <p className="text-sm opacity-80">{t(`roles.${role}.description`, { defaultValue: "" })}</p>}
      </div>
    </div>
  );
}

export function RoleBack({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-moon/40 bg-werewolf text-moon shadow-lift">
      <Moon className="h-1/4 w-1/4" />
      {label && <span className="text-xs font-semibold">{label}</span>}
    </div>
  );
}
