import { cn } from "@/lib/utils";

const HUES = ["bg-team-red", "bg-team-blue", "bg-codenames", "bg-imposter", "bg-werewolf", "bg-moon", "bg-primary"];
function hash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }

export function PlayerAvatar({ id, name, className }: { id: string; name: string; className?: string }) {
  return (
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-primary-foreground", HUES[hash(id) % HUES.length], className)}>
      {Array.from(name.trim())[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
