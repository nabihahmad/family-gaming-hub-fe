import type { GameId, Lang, Pack } from "./protocol";
import { getAccessToken, notifyAccessExpired } from "./storage";

export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3000";
export const WS_URL =
  (import.meta.env["VITE_WS_URL"] as string | undefined) ||
  API_URL.replace(/^http/, "ws") + "/ws";

/** Thrown when the server can't be reached at all (cold start), as opposed to an HTTP error. */
export class NetworkError extends Error {}

export interface AccessSession {
  role: "admin" | "guest";
  accessCode?: string;
}

async function req<T>(
  path: string,
  init?: RequestInit,
  token = getAccessToken(),
): Promise<T> {
  let res: Response;
  try {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    res = await fetch(API_URL + path, { ...init, headers });
  } catch {
    throw new NetworkError("unreachable");
  }
  if (res.status >= 502) throw new NetworkError(String(res.status));
  if (!res.ok) {
    if (
      res.status === 401 &&
      path !== "/api/auth/login" &&
      path !== "/api/auth/guest"
    )
      notifyAccessExpired();
    const body = (await res.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    throw new Error(
      typeof body?.message === "string" ? body.message : `HTTP ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<{ ok: boolean }>("/health"),
  login: (username: string, password: string) =>
    req<{ accessToken: string; accessCode: string; role: "admin" }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
      null,
    ),
  redeemAccessCode: (code: string) =>
    req<{ accessToken: string; role: "guest" }>(
      "/api/auth/guest",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
      null,
    ),
  session: (token?: string) =>
    req<AccessSession>("/api/auth/me", undefined, token ?? getAccessToken()),
  logout: (token: string) =>
    req<{ ok: boolean }>("/api/auth/logout", { method: "POST" }, token),
  createRoom: () =>
    req<{ code: string }>("/api/rooms", { method: "POST", body: "{}" }),
  getRoom: (code: string) =>
    req<{ exists: boolean; game?: GameId; phase?: "lobby" | "playing" }>(
      `/api/rooms/${encodeURIComponent(code)}`,
    ),
  packs: (game: GameId, lang: Lang) =>
    req<Pack[]>(`/api/packs?game=${game}&lang=${lang}`),
};

/** Retry while the backend is waking up. Calls onWarming(true) once the first attempt fails. */
export async function withWarmup<T>(
  fn: () => Promise<T>,
  onWarming: (w: boolean) => void,
  signal?: { cancelled: boolean },
): Promise<T> {
  for (;;) {
    try {
      const r = await fn();
      onWarming(false);
      return r;
    } catch (e) {
      if (!(e instanceof NetworkError) || signal?.cancelled) {
        onWarming(false);
        throw e;
      }
      onWarming(true);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
