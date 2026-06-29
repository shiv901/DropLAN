# Security

## Threat Model

DropLAN is designed for **trusted local networks** (home, small office). It is NOT designed to be exposed to the internet or used on adversarial networks (public Wi-Fi, corporate with unknown peers).

---

## Authentication: Session PIN

- A **4-digit PIN** is generated randomly at server startup using `Math.floor(1000 + Math.random() * 9000)`.
- The PIN is displayed in the Electron UI and embedded in the QR code URL (`?c=1234`).
- Phones must authenticate via `POST /api/auth` (manual PIN entry) or by scanning the QR (auto-auth via `GET /?c=1234`).
- On success, the server sets two cookies:
  - `droplan_sess` — 32-byte hex session token, `HttpOnly; SameSite=Strict; Path=/`. In-memory, cleared on restart.
  - `droplan_device` — stable device UUID, `SameSite=Strict; Path=/; Max-Age=31536000` (1 year). For device identity.

**Why `HttpOnly`**: Cannot be read or stolen by JavaScript — protects against XSS attacks on the phone browser.

**Why `SameSite=Strict`**: Browser will not send the cookie on cross-site requests — CSRF protection. Also means the cookie is automatically included in the WebSocket upgrade handshake without any JS plumbing.

- The PIN resets every server restart. Old sessions are invalidated.

---

## Middleware: `requireAuth`

Location: `packages/server/src/middleware/requireAuth.ts`

```
Request from 127.0.0.1 / ::1 / ::ffff:127.0.0.1  →  always next() (Electron trusted)
Request with valid droplan_sess cookie             →  next()
Otherwise                                          →  401 Unauthorized
```

Applied to all `/api/*` routes except: `/api/health`, `/api/auth`, `/api/status`.

---

## Socket.IO Auth Middleware

```ts
io.use((socket, next) => {
  if (socket.handshake.query.type === 'renderer') return next();  // Electron trusted
  const token = parseCookie(socket.handshake.headers.cookie, 'droplan_sess');
  if (isValidSession(token)) return next();
  next(new Error('Unauthorized'));
});
```

Unauthenticated phones cannot subscribe to `file:received` or any other event.

---

## Localhost-Only: `GET /api/session-code`

Returns the PIN. Only accessible from `127.0.0.1` / `::1` (returns 403 otherwise). Used exclusively by the Electron main process.

---

## Electron Security

- `contextIsolation: true`, `nodeIntegration: false` — renderer cannot access Node APIs directly.
- `webSecurity: true` — standard browser security model enforced.
- `sandbox: false` — required because the preload loads `require('./security')`. With `sandbox: true`, this `require` fails silently and `window.electron` is never defined. Security is maintained by `contextIsolation` (the actual boundary), not sandbox.
- All Node access goes through `preload.ts` via `contextBridge`.
- `security.ts` — additional `webRequest` guards and permission request handlers.
- `trafficLightPosition: { x: 16, y: 16 }` — macOS-only; positions traffic lights inside the custom titlebar. Without it, traffic lights overlap header content at the default position.

---

## What Is NOT Protected

- **Brute-force** — No rate limit on `POST /api/auth`. 10,000 guesses for a 4-digit PIN is feasible. Future: 3-attempt lockout.
- **PIN in plain text comparison** — `code.trim() === SESSION_CODE`. The PIN is short-lived and already visible on screen; `argon2` is in `server/package.json` but unused (future hardening).
- **Download without knowing filename** — `GET /api/files/:id/download` is protected by auth, but no per-file access control beyond session.
- **Encryption in transit** — Plain HTTP. LAN eavesdropping is possible.
- **Public network safety** — PIN is visible on the Mac screen. Avoid use on untrusted networks.

---

## Future

- [ ] Rate limit on `/api/auth` (3 attempts, then lockout with exponential backoff)
- [ ] Configurable PIN length (settings panel)
- [ ] Request-to-connect mode (phone requests, Mac must approve)
- [ ] HTTPS via self-signed cert (for encrypted LAN transport)
