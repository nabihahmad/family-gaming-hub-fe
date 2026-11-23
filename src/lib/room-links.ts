export function buildRoomInviteUrl(
  origin: string,
  roomCode: string,
  guestCode?: string | null,
): string {
  const url = new URL(`/r/${encodeURIComponent(roomCode)}`, origin);
  if (guestCode) url.searchParams.set("guest", guestCode);
  return url.toString();
}
