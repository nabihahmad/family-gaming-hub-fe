export type GameId = "codenames" | "imposter" | "werewolves";
export type Lang = "en" | "ar";
export const GAME_IDS: GameId[] = ["codenames", "imposter", "werewolves"];

export interface Player {
  id: string;
  name: string;
  connected: boolean;
}

export interface GameOptions {
  lang: Lang;
  packs?: string[] | undefined;
  imposters?: number | undefined;
  roles?: string[] | undefined;
}

export interface RoomState {
  code: string;
  hostId: string;
  phase: "lobby" | "playing";
  game?: GameId | undefined;
  options?: GameOptions | undefined;
  players: Player[];
}

export interface Pack {
  id: string;
  name: string;
  count: number;
}

export type Team = "red" | "blue";
export type CardColor = "red" | "blue" | "neutral" | "assassin";

export interface CodenamesView {
  phase: "setup" | "playing" | "finished";
  lang: Lang;
  teams: {
    red: string[];
    blue: string[];
    spymasters: { red?: string | undefined; blue?: string | undefined };
  };
  myTeam?: Team | undefined;
  isSpymaster: boolean;
  board: { word: string; revealed: boolean; color?: CardColor | undefined }[];
  turn: Team;
  remaining: { red: number; blue: number };
  clue?: { team: Team; text: string; number: number } | undefined;
  guessesMade?: number | undefined;
  winner?: Team | undefined;
}

export interface ImposterView {
  phase: "reveal" | "discussion" | "result";
  lang: Lang;
  isImposter: boolean;
  word?: string | undefined;
  hint?: string | undefined;
  readyCount: number;
  totalPlayers: number;
  iAmReady: boolean;
  result?: { imposters: string[]; word: string } | undefined;
}

export const ROLE_IDS = [
  "doppelganger",
  "werewolf",
  "minion",
  "mason",
  "seer",
  "robber",
  "troublemaker",
  "drunk",
  "insomniac",
  "villager",
  "hunter",
  "tanner",
] as const;
export type RoleId = (typeof ROLE_IDS)[number];

/** Provisional: the backend will finalize this type. Every field is optional on purpose. */
export interface WerewolvesPrompt {
  kind: string;
  options?: {
    players?: string[] | undefined;
    center?: number | undefined;
    min?: number | undefined;
    max?: number | undefined;
  };
  result?: { target: string; role: string }[] | undefined;
  info?: string[] | undefined;
}
export interface WerewolvesView {
  phase: "role_reveal" | "night" | "day" | "vote" | "result";
  lang: Lang;
  myRole?: string | undefined;
  acked?: boolean | undefined;
  prompt?: WerewolvesPrompt | undefined;
  endsAt?: number | undefined;
  myVote?: string | undefined;
  votedCount?: number | undefined;
  totalPlayers?: number | undefined;
  result?: {
    roles: Record<string, string>;
    votes?: Record<string, string> | undefined;
    winner?: string | undefined;
  };
}

export type GameView =
  | { game: "codenames"; view: CodenamesView }
  | { game: "imposter"; view: ImposterView }
  | { game: "werewolves"; view: WerewolvesView };

export type ClientMessage =
  | {
      type: "join";
      payload: {
        roomCode: string;
        name: string;
        accessToken: string;
        playerId?: string | undefined;
        token?: string | undefined;
      };
    }
  | { type: "select_game"; payload: { game: GameId; options: GameOptions } }
  | { type: "start_game"; payload: Record<string, never> }
  | { type: "game_event"; payload: { name: string; data?: object | undefined } }
  | { type: "back_to_lobby"; payload: Record<string, never> }
  | { type: "ping"; payload: Record<string, never> };

export type ServerMessage =
  | {
      type: "joined";
      payload: { playerId: string; token: string; roomCode: string };
    }
  | { type: "room_state"; payload: RoomState }
  | { type: "game_view"; payload: GameView }
  | { type: "error"; payload: { code: string; message: string } }
  | { type: "pong"; payload: Record<string, never> };

export type SendEvent = (name: string, data?: object) => void | undefined;
