# Postman Lite (Tauri)

Desktop mini-Postman built with Tauri + React + Rust.

## Local Development

```bash
pnpm install
pnpm tauri dev
```

## Release to GitHub

Workflow is configured in `.github/workflows/release.yml`.

1. Push project to a GitHub repository.
2. Create and push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

3. Open GitHub:
- `Actions` tab: wait for `Release Tauri App` workflow to finish.
- `Releases` tab: download generated installers for macOS, Windows, Linux.
