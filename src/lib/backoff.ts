/** Reconnect delay in ms: 1s, 2s, 4s, 8s, then capped at 10s. */
export function reconnectDelay(attempt: number): number {
  return Math.min(1000 * 2 ** Math.max(0, attempt), 10_000);
}
export const WARMUP_RETRY_MS = 2000;
export const PING_INTERVAL_MS = 25_000;
