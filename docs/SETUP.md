# Setup & Development

## Prerequisites

- Node.js 20+
- npm 9+
- macOS (primary). Windows/Linux: untested.

## Install

```bash
git clone <repo>
cd droplan
npm install          # installs all workspaces
```

## Development

```bash
npm run dev
```

This runs (via `concurrently`):
- Builds `packages/electron` and `packages/server` (TypeScript → `dist/`)
- Starts Express server on port 3000
- Starts Vite dev server on port 5173
- Starts Electron (loads `http://localhost:5173`)

The `predev` script (`lsof -ti:3000,5173 | xargs kill -9`) kills any stale processes on ports 3000 and 5173 first. This prevents `EADDRINUSE` errors on rapid restarts.

### Dev notes

- Hot reload: Vite handles React changes automatically. Server changes require restarting `npm run dev`.
- DevTools: Opens automatically in dev mode (detached window).
- The server logs the session PIN on startup: `Session PIN: 4753`

## Type Checking

```bash
npm run type-check   # runs tsc --noEmit across all packages
```

## Tests

```bash
npm test             # runs vitest in all packages
```

## Build & Package

```bash
npm run build        # compile all packages to dist/
npm run package:mac  # build .dmg via electron-builder
```

The packaged `.app` bundles:
- `dist/electron/` → Electron main + preload
- `dist/client/` → built React app (as `extraResources`)
- `dist/server/` → Express server (as `extraResources`)

## Environment Variables

| Variable | Default | Used by |
|---|---|---|
| `SERVER_PORT` | `3000` | `packages/electron/src/main.ts` |
| `PORT` | `3000` | `packages/server/src/config.ts` |
| `VITE_DEV_SERVER_URL` | (unset in prod) | Electron: if set, loads Vite URL instead of built bundle |

## Download Folder

Files received from phones land in:
```
~/Downloads/DropLAN/
```
Created automatically on first run. External drops (Finder, AirDrop) into this folder are also detected via `fs.watch`.

> **macOS `fs.watch` quirk**: On macOS, `fs.watch` emits `'rename'` events for both file creation and deletion, not `'change'`. The watcher calls `seedFromDisk()` on every event to reconcile the full file list.

## `argon2` Dependency

`argon2` is listed in `packages/server/package.json` but not used. It was planned for PIN hashing. Do not remove it — it will be used when PIN auth is hardened.
