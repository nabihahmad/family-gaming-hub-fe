import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import i18n from "@/i18n";
import { buildRoomInviteUrl } from "@/lib/room-links";
import { validateRoomSearch } from "@/routes/r.$code";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("loads the English and Arabic translation resources", () => {
    expect(i18n.t("app.title", { lng: "en" })).toBe("Family Games");
    expect(i18n.t("app.title", { lng: "ar" })).toBe("ألعاب العائلة");
  });

  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("accepts valid guest access codes from room-link search parameters", () => {
    expect(validateRoomSearch({ guest: "abcd2345" })).toEqual({
      guest: "ABCD2345",
    });
    expect(validateRoomSearch({ guest: "invalid" })).toEqual({
      guest: undefined,
    });
  });

  it("adds the guest access code to room invite URLs", () => {
    expect(
      buildRoomInviteUrl("https://games.example", "ABCD", "ABCD2345"),
    ).toBe("https://games.example/r/ABCD?guest=ABCD2345");
  });
});
