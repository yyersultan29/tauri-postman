# HANDOFF.md

Last updated: 2026-03-24
Current branch: `main`
Last release: `v0.1.1`
Last release commit: `d276fbe`

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
- Vite warns about chunk size > 500kb (not blocking, but optimization target).
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

## Bootstrap Checklist (for next Codex run)
1. Read `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md`.
3. Read `docs/HANDOFF.md`.
4. Read `docs/DECISIONS.md`.
5. Only then start code changes.
