import type { Lang } from "./protocol";

// Access sessions are tab-scoped; room reconnect credentials and UI preferences persist per browser.
const K = {
  id: "fg.playerId",
  token: "fg.token",
  name: "fg.name",
  room: "fg.room",
  lang: "fg.lang",
  access: "fg.access",
};
const ls = () => (typeof window === "undefined" ? null : window.localStorage);
const ss = () => (typeof window === "undefined" ? null : window.sessionStorage);

export const getAccessToken = () => ss()?.getItem(K.access) ?? null;
export const saveAccessToken = (token: string) =>
  ss()?.setItem(K.access, token);
export const clearAccessToken = () => ss()?.removeItem(K.access);
export function notifyAccessExpired() {
  clearAccessToken();
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("fg:auth-expired"));
}

export function getCreds(room: string) {
  const s = ls();
  if (!s) return null;
  const playerId = s.getItem(K.id),
    token = s.getItem(K.token),
    r = s.getItem(K.room);
  if (playerId && token && r === room)
    return { playerId, token, name: s.getItem(K.name) ?? "" };
  return null;
}
export function saveCreds(room: string, playerId: string, token: string) {
  const s = ls();
  if (!s) return;
  s.setItem(K.id, playerId);
  s.setItem(K.token, token);
  s.setItem(K.room, room);
}
export function clearCreds() {
  const s = ls();
  s?.removeItem(K.id);
  s?.removeItem(K.token);
  s?.removeItem(K.room);
}
export const getName = () => ls()?.getItem(K.name) ?? "";
export const saveName = (n: string) => ls()?.setItem(K.name, n);
export const getLang = (): Lang | null => {
  const v = ls()?.getItem(K.lang);
  return v === "ar" || v === "en" ? v : null;
};
export const saveLang = (l: Lang) => ls()?.setItem(K.lang, l);
