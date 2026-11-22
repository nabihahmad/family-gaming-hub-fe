import { WS_URL } from "./api";
import { PING_INTERVAL_MS, WARMUP_RETRY_MS, reconnectDelay } from "./backoff";
import type { ClientMessage, ServerMessage } from "./protocol";

export type SocketStatus =
  "connecting" | "warming" | "connected" | "reconnecting" | "closed";

interface Opts {
  onMessage: (m: ServerMessage) => void;
  onStatus: (s: SocketStatus) => void;
  onOpen: () => void;
  onAuthExpired: () => void;
}

/** Owns the WebSocket: connect, reconnect with backoff, heartbeat, typed send. */
export class GameSocket {
  private ws: WebSocket | null = null;
  private attempt = 0;
  private everConnected = false;
  private stopped = false;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private opts: Opts) {}

  connect() {
    this.stopped = false;
    this.opts.onStatus(
      this.everConnected
        ? "reconnecting"
        : this.attempt > 0
          ? "warming"
          : "connecting",
    );
    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      this.everConnected = true;
      this.opts.onStatus("connected");
      this.opts.onOpen();
      this.pingTimer = setInterval(
        () => this.send({ type: "ping", payload: {} }),
        PING_INTERVAL_MS,
      );
    };
    ws.onmessage = (e) => {
      try {
        this.opts.onMessage(JSON.parse(String(e.data)) as ServerMessage);
      } catch {
        /* ignore malformed */
      }
    };
    ws.onclose = (event) => {
      this.clearPing();
      if (this.ws === ws) this.ws = null;
      if (event.code === 4003) {
        this.stopped = true;
        this.opts.onStatus("closed");
        this.opts.onAuthExpired();
        return;
      }
      if (!this.stopped) this.scheduleRetry();
    };
  }

  private scheduleRetry() {
    const delay = this.everConnected
      ? reconnectDelay(this.attempt)
      : WARMUP_RETRY_MS;
    this.attempt++;
    this.opts.onStatus(this.everConnected ? "reconnecting" : "warming");
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }

  private clearPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(msg));
  }

  close() {
    this.stopped = true;
    this.clearPing();
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.ws?.close();
    this.ws = null;
    this.opts.onStatus("closed");
  }
}
