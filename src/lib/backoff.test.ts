import { describe, expect, it } from "vitest";
import { PING_INTERVAL_MS, WARMUP_RETRY_MS, reconnectDelay } from "./backoff";

describe("reconnect timing", () => {
  it("backs off 1s, 2s, 4s", () => {
    expect([0, 1, 2].map(reconnectDelay)).toEqual([1000, 2000, 4000]);
  });
  it("caps at 10s", () => {
    expect(reconnectDelay(4)).toBe(10000);
    expect(reconnectDelay(20)).toBe(10000);
  });
  it("retries warm-up every 2s and pings every 25s", () => {
    expect(WARMUP_RETRY_MS).toBe(2000);
    expect(PING_INTERVAL_MS).toBe(25000);
  });
});
