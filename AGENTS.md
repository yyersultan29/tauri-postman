# AGENTS.md (ReqLite)

Project-specific instructions for any Codex run in this repository.

## Mandatory Startup (always first)
1. Read `docs/PROJECT_CONTEXT.md`.
2. Read `docs/HANDOFF.md`.
3. Read `docs/DECISIONS.md`.
4. If there is any conflict:
- `HANDOFF.md` has highest priority for current state.
- `DECISIONS.md` has highest priority for architecture constraints.
- `PROJECT_CONTEXT.md` is the baseline map.

## Working Rules
- Do not rewrite architecture blindly; follow current module split.
- Keep UI behavior stable unless task explicitly changes behavior.
- Prefer incremental changes and verify with `pnpm build`.
- For release changes, keep versions aligned in:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Documentation Discipline (required)
- After each meaningful task, append a short dated note to `docs/HANDOFF.md`:
- what changed
- what was verified
- what is next
- If you make a non-trivial technical decision, append it to `docs/DECISIONS.md`.

## Useful Commands
- Install deps: `pnpm install`
- Frontend dev: `pnpm dev`
- Desktop dev: `pnpm tauri dev`
- Build frontend: `pnpm build`
- Build desktop bundle (local): `pnpm tauri build`

## Release Reminder
- Main branch: `main`
- Version tags format: `vX.Y.Z`
- GitHub Action: `.github/workflows/release.yml`
