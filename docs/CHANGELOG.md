# Changelog

All notable changes in chronological order. Most recent first.

---

## [0.5.0] — 2026-07-01 — Resilient Uploads & Phone Reconnection

### Fixed
- **Premature "file received" on partial uploads**: `fs.watch` was firing during multer's write, registering the file before it was complete. Fixed with an `activeUploads` Set in `fileStore.ts` — the watcher skips any path currently being written by multer.
- **Partial files saved after abort**: Added `req.on('close')` detection in the upload route. When the connection drops mid-upload, multer-written partial files are deleted from disk, `upload:error` is emitted, and `file:received` is never sent.
- **Phone shows disconnected with no recovery path**: The phone browser now has a full reconnection overlay (frosted glass + spinner) with Socket.IO auto-retry. After 5 failed attempts a "Reload page" button appears. On reconnect the upload zone is re-enabled and a "✓ Reconnected" toast shows.
- **Session expiry after DropLAN restart**: XHR 401 responses on `/api/upload` are now intercepted — the reconnect overlay switches to "Session expired" mode with a reload prompt.

---

## [0.4.0] — 2026-07-01 — Device Count Fix & Upload Error Handling

### Fixed
- **`ERR_HTTP_HEADERS_SENT` / device count stuck at 0 (KI-3)**: Root cause was `server.on('request', app)` — Socket.IO polling requests hit both the Socket.IO internal handler and Express, causing double header writes, broken polling, and phones never reaching a stable connected state. Fixed by using a mutable-handler pattern: `createServer((req,res) => handler(req,res))` with the Express app swapped in after `io` is ready. Socket.IO now intercepts `/socket.io/*` before Express sees those requests.
- Phone browser transport order changed to `['polling', 'websocket']` so the session cookie is reliably present on the first socket handshake (mobile Safari doesn't always forward cookies in WS upgrade headers).

### Added
- **Upload error handling** — multer errors and disk/OS errors are now caught by a dedicated Express error handler in `upload.ts`:
  - Error codes handled: `ENOSPC` (disk full), `EACCES`/`EPERM` (permission denied), `EROFS` (read-only volume), `LIMIT_FILE_SIZE` (file too large)
  - Emits `upload:error` socket event with a user-friendly message
  - **Phone browser**: shows an error toast via `upload:error` socket listener
  - **Electron UI**: shows a dismissible red banner in the content area (auto-hides after 8 seconds)

---

## [0.3.0] — 2026-06-29 — Settings Panel & Logo Fix

### Added
- **Settings panel** (`⚙` button in titlebar) — slide-in drawer with:
  - **Download folder** — native folder picker; change takes effect immediately (no restart). Server reseeds the file registry and all clients receive the updated list via `files:reset` socket event.
  - **Launch at Login** toggle — calls `app.setLoginItemSettings` immediately.
  - **PIN mode selector** — 4-digit (default), 6-digit, or No PIN. No-PIN shows a notice explaining the future request-to-connect flow. Changes take effect on next server restart.
- **`AppSettings`** type in `@droplan/types` — persisted to `~/Library/Application Support/DropLAN/settings.json`
- **`POST /api/admin/set-download-folder`** — localhost-only endpoint called by Electron when folder changes; calls `setUploadDir` + `fileStore.changeWatchDir`
- **`fileStore.changeWatchDir`** — closes old `fs.watch` watcher, clears registry, reseeds from new dir, emits `files:reset` to all clients
- **Logo unified** — titlebar now uses the `DropLANLogo` SVG component (WiFi arc + water drop, purple gradient) matching the `.app` icon; replaced the mismatched 📡 emoji

### Fixed
- Removed stale `@tailwind` directives from `index.css` (project uses vanilla CSS)
- Removed leftover `console.log` in `QRPanel.tsx` and `App.tsx`
- `app:openDownloadFolder` IPC now opens the user-configured folder instead of the hardcoded `~/Downloads/DropLAN`

---


## [0.2.0] — 2026-06-27 — Session Authentication

### Added
- **4-digit PIN authentication** (`packages/server/src/session.ts`)
  - `SESSION_CODE` generated at startup, logged as `Session PIN: XXXX`
  - `POST /api/auth` — validates PIN, sets `droplan_sess` + `droplan_device` cookies
  - `GET /api/session-code` — localhost-only endpoint for Electron to read PIN
- **Phone auth page** (`browser-ui/auth.html`) — dark-themed PIN entry with 4 split-box inputs, auto-advance, shake animation on error, success overlay
- **Auto-auth via QR** — QR code URL now embeds PIN as `?c=XXXX`; scanning sets session cookie + redirects to upload page
- **Session middleware** (`middleware/requireAuth.ts`) — protects all `/api/*` routes; localhost unconditionally trusted
- **Socket.IO auth middleware** — phones require valid session cookie in WebSocket upgrade headers; `type=renderer` connections always allowed
- **Device registry** (`store/deviceStore.ts`) — tracks connected phones by stable UUID; foundation for future "send to phone"
- **`GET /api/devices`** — returns list of connected devices (localhost-only)
- **PIN display in QR panel** — Electron UI shows 4 large digit boxes with "No camera? Enter this code" hint
- **`sessionCode` in `ServerInfo`** IPC type

### Fixed
- Build script `cp -r src/browser-ui` → `cp -r src/browser-ui/.` — prevents directory nesting on second builds
- **PIN `0000` bug** — `fetchSessionCode()` changed from `http://localhost:3000` to `http://127.0.0.1:3000/api/session-code`. On macOS `localhost` resolves to `::1` (IPv6) but Express binds to `0.0.0.0` (IPv4 only), causing `ECONNREFUSED` on all retries. Additionally, the retry loop now resolves to `''` on failure instead of `'0000'`, so only a genuine 4-digit response breaks the loop. Fix confirmed in `packages/electron/src/main.ts`.

---

## [0.1.5] — 2026-06-21 — Dock Badge & Connection Tracking

### Added
- **Unread file badge** on macOS Dock — increments per `file:received`, resets on window focus
- **Socket type tagging** — renderer connects with `query: { type: 'renderer' }`, phone with `query: { type: 'phone' }`; server counts only phones for device badge
- **`app:setDockBadge` IPC** — renderer calls this to update Dock badge label

### Fixed
- Electron renderer was being counted as a connected device

---

## [0.1.4] — 2026-06-17 — File Preview & UX Fixes

### Changed
- **Preview button** now opens file in default app (`shell.openPath(filePath)`) instead of revealing the folder
- **Open folder** icon retained separately to reveal the `DropLAN` folder in Finder

### Fixed
- Duplicate file shown on upload — `registerFile()` now uses upsert logic (same filename → update existing)
- Removed "Local URL" row from sidebar (was confusing; phones need QR not a raw URL)

---

## [0.1.3] — 2026-06-15 — Real-time File Watcher

### Added
- `fs.watch` watcher on `~/Downloads/DropLAN` — files dropped via Finder or AirDrop appear in the UI without restarting the server
- Hidden files (`.DS_Store`, `._*`, etc.) filtered from file list and watcher events

---

## [0.1.2] — 2026-06-10 — Electron Build Fixes

### Fixed
- `npm run package:mac` DMG now builds correctly
- `app:revealFile` opens file directly in default app
- App icon (`icon.icns`) added

---

## [0.1.1] — 2026-06-07 — Core File Transfer

### Added
- `POST /api/upload` — multer, multi-file, 500 GB limit, progress tracking via Socket.IO
- `GET /api/files`, `DELETE /api/files/:id`, `GET /api/files/:id/download` (range-request support)
- `file:received` Socket.IO event → Electron UI file list updates in real time
- QR code display in Electron sidebar
- mDNS advertisement via `bonjour-service`
- Delete confirmation dialog
- Upload progress bar with filename

---

## [0.1.0] — Initial scaffold

- Electron + React + Express monorepo setup
- `npm workspaces` with `packages/server`, `packages/client`, `packages/electron`, `packages/types`
- `concurrently` dev script
- `electron-builder` packaging config
- TypeScript ESM throughout
