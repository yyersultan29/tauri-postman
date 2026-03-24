# PROJECT_CONTEXT.md

Last updated: 2026-03-25
Project: ReqLite (desktop API client)

## Product Goal
ReqLite is a lightweight Postman-style desktop client built with Tauri + React + Rust.
Primary UX goals:
- fast request testing
- multiple tabs
- parallel request flow across tabs
- clean dark/light UI

## Tech Stack
- Frontend: React 19 + TypeScript + Vite
- Editor: CodeMirror 6 (`@uiw/react-codemirror`)
- Desktop shell: Tauri v2
- Backend HTTP: Rust + `reqwest`
- Package manager: pnpm 10

## Architecture Map
- `src/App.tsx`: UI composition only (thin container)
- `src/hooks/usePostmanLite.ts`: state/actions/orchestration
- `src/components/*`: memoized UI blocks
- `src/lib/tab-utils.ts`: pure helpers for tabs/headers/curl/serialization
- `src/types.ts`: shared types
- `src/App.css`: visual system and layout
- `src-tauri/src/lib.rs`: `send_http` command implementation

## Key UX Features
- Tabbed requests with duplicate/close/new
- Header form rows (`key`/`value`) with add/remove
- JSON syntax highlighting for body/response
- Quick actions: `Copy cURL`, `Format JSON Body`, `Clear Body`
- Response quick actions: `Copy Body`, `Copy Headers`
- Status/time badges with semantic colors
- Keyboard shortcut: `Ctrl/Cmd + Enter` to send active tab

## Local Run
```bash
pnpm install
pnpm tauri dev
```

## Build
```bash
pnpm build
```

## Release Process
1. Ensure versions match in:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
2. Commit changes.
3. Create tag:
```bash
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```
4. GitHub Action publishes installers in Releases.

## macOS Quarantine (if app blocked)
```bash
xattr -dr com.apple.quarantine "/Applications/ReqLite.app"
```

## Current Released Version
- `v0.1.2`
