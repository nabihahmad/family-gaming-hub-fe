<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Frontend only: all game logic and authentication enforcement live in the external WebSocket backend (VITE_API_URL / VITE_WS_URL); this project contains only the auth/guest-entry UI and sends bearer sessions to that backend. Never add Lovable Cloud, server code, or a local auth provider.
- `src/lib/protocol.ts` mirrors the backend contract; change it only together with the backend. Why: message shapes must match exactly.
- `src/lib/socket.ts` owns the WebSocket; game components get only `view` + `sendEvent`. Why: keeps games testable and socket-agnostic.
- All UI text goes through `src/i18n/{en,ar}.json`; use logical (start/end) utilities for RTL. Why: full Arabic RTL support.
- Werewolves role art lives at `public/roles/<roleId>.webp`; keep file names stable. Why: art can be swapped without code changes.
