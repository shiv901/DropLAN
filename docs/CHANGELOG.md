# Changelog

All notable changes in chronological order. Most recent first.

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
