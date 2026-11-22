import { create } from "zustand";
import { toast } from "sonner";
import i18n from "@/i18n";
import { GameSocket, type SocketStatus } from "@/lib/socket";
import {
  clearCreds,
  getAccessToken,
  getCreds,
  notifyAccessExpired,
  saveCreds,
  saveName,
} from "@/lib/storage";
import type { ClientMessage, RoomState } from "@/lib/protocol";
import { useGameStore } from "./gameStore";

interface RoomStore {
  status: SocketStatus | "idle";
  room: RoomState | null;
  playerId: string | null;
  joinError: string | null;
  socket: GameSocket | null;
  join: (roomCode: string, name: string) => void;
  send: (msg: ClientMessage) => void;
  leave: () => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  status: "idle",
  room: null,
  playerId: null,
  joinError: null,
  socket: null,
  join: (roomCode, name) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      notifyAccessExpired();
      set({ joinError: i18n.t("auth.sessionExpired"), status: "idle" });
      return;
    }
    get().socket?.close();
    saveName(name);
    set({ joinError: null });
    const socket = new GameSocket({
      onStatus: (status) => set({ status }),
      onAuthExpired: () => {
        notifyAccessExpired();
        set({ socket: null, room: null, playerId: null, status: "idle" });
      },
      onOpen: () => {
        const creds = getCreds(roomCode);
        socket.send({
          type: "join",
          payload: {
            roomCode,
            name,
            accessToken,
            playerId: creds?.playerId,
            token: creds?.token,
          },
        });
      },
      onMessage: (m) => {
        switch (m.type) {
          case "joined":
            saveCreds(m.payload.roomCode, m.payload.playerId, m.payload.token);
            set({ playerId: m.payload.playerId });
            break;
          case "room_state":
            set({ room: m.payload });
            if (m.payload.phase === "lobby") useGameStore.getState().clear();
            break;
          case "game_view":
            useGameStore.getState().setView(m.payload);
            break;
          case "error": {
            const c = m.payload.code;
            if (/token|auth|player|not_found|room/i.test(c) && !get().room) {
              clearCreds();
              get().socket?.close();
              set({
                socket: null,
                joinError: m.payload.message,
                status: "idle",
              });
            } else {
              toast.error(
                i18n.exists(`errors.${c}`)
                  ? i18n.t(`errors.${c}`)
                  : m.payload.message,
              );
            }
            break;
          }
        }
      },
    });
    set({ socket });
    socket.connect();
  },
  send: (msg) => get().socket?.send(msg),
  leave: () => {
    get().socket?.close();
    useGameStore.getState().clear();
    set({ socket: null, room: null, playerId: null, status: "idle" });
  },
}));
