# HANDOFF.md

Last updated: 2026-03-25
Current branch: `main`
Last release: `v0.1.2`
Last release commit: `v0.1.2` tag

## Current State (stable)
- Product name is now `ReqLite`.
- Build pipeline for multi-platform releases is working.
- UX includes:
- tabs and parallel request workflow
- row-based headers editor
- JSON highlighting (key/string/number/bool/null)
- request/response copy helpers
- status/time color badges

## Known Gaps / Risks
- Local builds on Node `22.11.0` show a Vite compatibility warning (recommended `22.12+`).
- No automated test suite yet (manual verification only).

## Priority Backlog
1. Add request history + saved collections.
2. Add environment variables (`{{baseUrl}}`, tokens, etc.).
3. Add import/export for requests (JSON).
4. Add response search and pretty/raw toggle.
5. Add basic integration tests for critical flow.

## Session Notes
### 2026-03-24
- Refactored large `App.tsx` into hook + memoized components.
- Added persistent context docs (`AGENTS.md`, `PROJECT_CONTEXT.md`, `DECISIONS.md`, `HANDOFF.md`).
- Verified `pnpm build` after refactor and release prep.
- Published `v0.1.1` tag and assets.

### 2026-03-24 (Production UX pass)
- Added manager-friendly onboarding copy in header and clearer start flow.
- Added quick request templates (Health Check, Create Item JSON, Bearer Auth Check).
- Added dedicated Bearer token input that syncs `Authorization` header automatically.
- Added friendlier URL validation with clear `http://` / `https://` guidance before send.
- Added response summary cards (status class, latency, payload size) and stronger empty-state guidance.
- Refined visual system and responsive layout in `src/App.css` for desktop/mobile clarity.
- Verified `pnpm build` (TypeScript + Vite build successful).
- Next: run manual QA in `pnpm tauri dev` and then optimize bundle splitting to address the existing >500kb chunk warning.

### 2026-03-24 (UI simplification pass)
- Simplified UI to reduce cognitive load for first-time users.
- Removed template cards and long instructional copy from the default view.
- Kept primary flow focused on method + URL + send.
- Moved optional inputs into compact collapsible sections (`Body`, `Auth`, `Headers`).
- Simplified response panel to compact status/time/size badges without extra cards.
- Reduced header actions to essential controls only (`+ New Tab`, theme toggle).
- Reworked `src/App.css` to a cleaner, calmer visual style inspired by API-client tools.
- Verified `pnpm build` after simplification.
- Next: validate UX in desktop runtime (`pnpm tauri dev`) with a non-technical user smoke test.

### 2026-03-25 (Editor + form polish)
- Fixed JSON syntax highlighting mode so it stays active while typing incomplete JSON (not only for fully valid JSON).
- Fixed CSS selector from `.field span` to `.field > span` so label styling no longer overrides CodeMirror token colors.
- Increased and normalized `Method` select height to match adjacent controls.
- Verified `pnpm build` after changes.
- Next: quick visual check in running desktop app for select alignment on macOS.

### 2026-03-25 (Release v0.1.2)
- Aligned release versions to `0.1.2` in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json` (plus `src-tauri/Cargo.lock` package entry).
- Included UI simplification + JSON highlight + form sizing fixes in the release payload.
- Verified `pnpm build` on release version.
- Next: monitor release assets from GitHub Actions and gather first usability feedback from non-technical users.

### 2026-03-25 (Performance optimization + release prep v0.1.3)
- Split CodeMirror into a lazy-loaded chunk via new `LazyJsonCodeEditor` wrapper and switched request/response editors to use it.
- Avoided mounting response CodeMirror until a response exists (uses lightweight placeholder textarea in empty state).
- Reduced font payload by switching to latin/cyrillic subset imports in `src/main.tsx`.
- Updated tab persistence to a slower debounce (`700ms`) plus `requestIdleCallback` scheduling to cut write pressure while typing.
- Limited auto pretty-formatting to JSON responses under `256KB`; larger/non-JSON responses stay raw to reduce parse overhead.
- Aligned release versions to `0.1.3` in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json` (plus `src-tauri/Cargo.lock` package entry).
- Verified `pnpm build` successfully after optimization and version bump.
- Next: run manual QA in `pnpm tauri dev`, then publish `v0.1.3` tag for GitHub Actions release artifacts.

## Bootstrap Checklist (for next Codex run)
1. Read `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md`.
3. Read `docs/HANDOFF.md`.
4. Read `docs/DECISIONS.md`.
5. Only then start code changes.
