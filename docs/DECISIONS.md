# Design Decisions

## Authentication: 4-digit PIN + Session Cookie

**Decision**: A random 4-digit PIN is generated at server startup. It is:
- Shown as large digit boxes in the Electron QR panel
- Embedded in the QR code URL (`?c=1234`) so scanning auto-authenticates
- Validated via `POST /api/auth` for manual entry on phones

**Why**: Simple to explain to users. QR scan = zero friction. Manual entry = low friction. No accounts, no passwords.

**What was rejected**:
- *No auth* — anyone on the local network (café, office) could access and download files. Rejected as a security requirement.
- *6-digit PIN* — deemed too much friction for manual entry. Settled on 4 (configurable in a future settings panel).
- *1-to-1 exclusive sessions* — overly complex, breaks multi-device use. Shared PIN is simpler and sufficient.

**Session storage**: `HttpOnly; SameSite=Strict` cookie (`droplan_sess`). Token is a 32-byte random hex string stored in an in-memory `Set`. Invalidated on server restart.

---

## Localhost Always Trusted

**Decision**: The `requireAuth` middleware skips cookie validation if `req.ip` matches a loopback address. A separate check uses the `Host` header approach internally.

**Why**: The Electron renderer calls the Express API directly on `localhost`. Having it manage cookies would add complexity for no security benefit — only the local machine can reach `127.0.0.1`.

---

## In-Memory File Store + `fs.watch`

**Decision**: Received files are tracked in an in-memory `Map` (keyed by UUID). On startup, the store is seeded by scanning `~/Downloads/DropLAN`. An `fs.watch` watcher detects external drops (Finder, AirDrop) and syncs without a restart.

**Why**: Avoids SQLite or any database dependency. Files never leave the local disk. The watch approach was added after the user reported that Finder-dropped files didn't appear without restarting.

---

## Browser UI: Plain HTML, No Framework

**Decision**: `auth.html` and `index.html` are self-contained HTML files with vanilla JS and inline CSS. No React, no build step.

**Why**: The phone browser-UI has minimal logic. Adding a build step for it would complicate the pipeline. The files are simply copied to `dist/server/browser-ui/` at build time.

**Build script fix**: The original `cp -r src/browser-ui dest/` nested the directory inside itself on second runs. Fixed to `cp -r src/browser-ui/. dest/` which always copies contents.

---

## Device Registry (Foundation for Send-to-Phone)

**Decision**: Each phone that authenticates gets a stable UUID (`droplan_device` cookie, 1-year expiry). The `deviceStore` maps this ID to the phone's current socket ID.

**Why**: Enables future "send to phone" feature — you need a socket ID to push a file event to a specific device. The registry is built now so the architecture doesn't need to change later.

---

## QR Code Embeds PIN

**Decision**: The QR URL is `http://{lanIp}:3000/?c={PIN}`. Scanning auto-authenticates via server-side cookie set + redirect.

**Why**: Scanning a QR should be frictionless. The PIN is only needed for devices without a camera. The displayed `lanUrl` in the sidebar is shown without `?c=` to keep it clean for manual copy.

---

## `sandbox: false` in BrowserWindow

**Decision**: `sandbox: false` is set in the Electron `BrowserWindow` webPreferences.

**Why**: The preload script uses `require('./security')` to import a local module. Electron's sandbox mode restricts `require` in preload scripts and caused this import to fail silently — `contextBridge.exposeInMainWorld` was never reached, so `window.electron` was `undefined` in the renderer and all IPC calls returned `undefined` via optional chaining.

**Why it's still secure**: The real Electron security boundary is `contextIsolation: true` + `nodeIntegration: false`. `contextIsolation` ensures the renderer cannot access the preload's scope. `nodeIntegration: false` ensures the renderer cannot use Node APIs. `sandbox: false` only relaxes restrictions in the **preload**, which is trusted code we control.

---

## `HttpOnly` Session Cookie over localStorage / Bearer Token

**Decision**: Session tokens are stored in an `HttpOnly; SameSite=Strict` cookie, not in `localStorage` or sent as an `Authorization: Bearer` header.

**Why**:
- `HttpOnly` — cookie cannot be read or stolen by JavaScript (XSS protection)
- `SameSite=Strict` — browser will not send the cookie on cross-site requests (CSRF protection)
- Cookies are sent automatically by browsers in both HTTP requests AND in the WebSocket upgrade handshake — no JS plumbing needed to pass the token to socket.io

**What was rejected**:
- *localStorage* — readable by any JS on the page; requires explicit JS code to attach to every request
- *Bearer token in header* — requires phone browser to store token and attach to socket.io `auth` option; more complex than relying on automatic cookie behavior

---

## In-Memory Store over SQLite

**Decision**: File metadata is stored in an in-memory `Map`. SQLite was explicitly on the roadmap but deprioritised.

**Why it was rejected early**: The `fs.watch` watcher + `seedFromDisk` approach means the disk is always the source of truth. On restart, the file list is rebuilt from `~/Downloads/DropLAN` automatically. This eliminates the need for a database for the core use-case. SQLite would add complexity (migrations, WAL mode, file path) for a benefit that `fs.watch` already provides.

**Trade-off**: File metadata (e.g. `receivedAt` timestamp) is lost on restart. Acceptable for v0.x.

---

## Filename Strategy: Mirrors macOS Finder Copy Behavior

**Decision**: `uniqueFilename()` in `upload.ts` names files like macOS Finder:
1. Strip path separators and control characters (prevents directory traversal)
2. Use original filename as-is if no conflict exists
3. If conflict: try `stem (2).ext`, `stem (3).ext`, etc.
4. UUID only if the entire sanitised name is empty (e.g. file named `\x00`)

**Why**: Users expect files to have readable names, not UUID prefixes. The ` (N)` suffix convention is familiar from macOS and Windows.

---

## CORS `*` Intentional

**Decision**: `Access-Control-Allow-Origin: *` is set on all Express responses.

**Why**: Phone browsers are on a different origin than the Mac's server (different IP, different scheme). Without CORS, browser security policies block the fetch. On a LAN, the permissive CORS policy is acceptable — the PIN authentication layer is the actual access control. Opening CORS to `*` does not allow cross-origin cookie access (that is governed by `SameSite` and `HttpOnly`).

---

## `argon2` Package in `server/package.json` — Currently Unused

`argon2` is listed in `packages/server/package.json` dependencies but is not imported anywhere. It was anticipated for hashing the session PIN before comparison, but the current implementation compares the PIN in plain text (`code.trim() === SESSION_CODE`). This is acceptable because the PIN is a short-lived, low-entropy value already visible to anyone near the Mac screen. If PIN security is hardened in the future, `argon2` is already available.
