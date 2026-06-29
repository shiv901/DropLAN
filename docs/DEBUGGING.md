# Debugging

## Dev Logs

Run `npm run dev` — all three processes are interleaved with prefixes:

```
[0]  → packages/server (Express)
[1]  → packages/client (Vite)
[2]  → packages/electron (Electron)
```

The server logs the session PIN at startup:
```
[0] Session PIN: 4753
```

---

## Common Issues

### PIN shows as `0000` in Electron UI

> **This bug is fixed** as of v0.2.0. This section is kept for reference if the issue resurfaces.

**Root cause — two contributing factors:**

1. `fetchSessionCode()` in `main.ts` used `http://localhost:3000/api/session-code`. On macOS, `localhost` resolves to `::1` (IPv6), but the Express server binds to `0.0.0.0` (IPv4 only) → `ECONNREFUSED` on every attempt.

2. **Race condition**: `SERVER_PORT = 3000` is a hardcoded constant in `main.ts`. This means `app:getServerInfo` returns `{ port: 3000, sessionCode: '0000', ... }` even when the server is not yet ready. `App.tsx` checks `if (info?.port)` — which is truthy for the hardcoded `3000` — and stops retrying, locking in `sessionCode: '0000'` before the server is up.

**Fix applied**: Changed to `http://127.0.0.1:3000/api/session-code`. Added 20-retry loop (20 × 500ms = 10s) in `fetchSessionCode()` that resolves to `''` (not `'0000'`) on failure, so only a genuine 4-digit response breaks the loop.

**Why curl worked but Node didn't**: `curl` defaults to IPv4 (`127.0.0.1`). Node's `http.get('http://localhost:...')` resolves via `dns.lookup` which on macOS returns `::1` first.

---

### `auth.html` not found (ENOENT in server logs)

**Cause**: The build script `cp -r src/browser-ui dest/` nests the directory inside itself on second builds.

**Fix applied**: Changed to `cp -r src/browser-ui/. dest/` (note the `/.`).

**Manual workaround**: `cp packages/server/src/browser-ui/auth.html dist/server/browser-ui/`

---

### Phone gets stuck at PIN screen after scanning QR

1. Check server logs for `Session PIN: XXXX` — confirm the QR was generated with the right PIN.
2. Check the QR URL: it should contain `?c=XXXX` where XXXX matches the logged PIN.
3. If PIN is `0000`, see "PIN shows as 0000" above.
4. Open phone browser's network tab — check if `POST /api/auth` is being called and what it returns.

---

### Files not appearing in Electron after phone upload

1. Check server logs for `File received: filename`.
2. Check that Socket.IO connection is established: look for `Client connected: ... (type=renderer)` in logs.
3. Confirm the `file:received` socket event is being emitted (add `console.log` in server upload route temporarily).
4. Check `FileList.tsx` — the component listens for `file:received` and updates its state.

---

### Device count still shows 0

The device count relies on phones connecting with `query: { type: 'phone' }` in the socket.io handshake. 

1. Check server logs for `Client connected: ... (type=phone)`.
2. If you only see `type=unknown` — the `browser-ui/index.html` socket init is missing the query parameter.
3. The Electron renderer connects as `type=renderer` and is excluded from the count.

---

### Socket.IO phone connection rejected (`Socket rejected (no valid session)`)

The phone does not have a valid `droplan_sess` cookie.

1. Ensure the phone authenticated via PIN entry or QR scan before the socket.io connection is initiated.
2. `index.html` (upload page) is only served to authenticated sessions — the socket.io `<script>` should only run after authentication.

---

### Notifications not working (dev mode)

Native macOS notifications from unsigned Electron processes in dev mode are often silently blocked by macOS. This is expected. Test notifications in the packaged `.app` (after signing or running with `open -a "DropLAN"` bypass).

---

## Electron Log Noise

### `CoreText note: Client requested name ".AppleColorEmojiUI"` warnings

These appear in every Electron dev session on macOS and are **harmless**. They come from Chromium's font system trying to use a private Apple API. No action needed; they can be ignored.

---

### Socket connects then disconnects in ~14ms at startup

Logs like:
```
Client connected: XxxXxxX (type=renderer)
Client disconnected: XxxXxxX
Client connected: YyyYyyY (type=renderer)
```
This is **normal in dev mode**. Vite's HMR causes the React app to reload briefly, triggering a socket reconnect. It is not an auth failure. Look for the final stable connection (usually the third entry).

---

## Useful Curl Commands

```bash
# Health check
curl http://localhost:3000/api/health

# Get session PIN (localhost only)
curl http://127.0.0.1:3000/api/session-code

# Authenticate
curl -c cookies.txt -X POST http://192.168.x.x:3000/api/auth \
  -H 'Content-Type: application/json' \
  -d '{"code":"4753"}'

# List files (requires cookie)
curl -b cookies.txt http://192.168.x.x:3000/api/files

# Test auto-auth redirect
curl -v http://192.168.x.x:3000/?c=4753 2>&1 | grep -E "(Set-Cookie|Location|HTTP/)"

# Upload a file
curl -b cookies.txt -F "files=@/path/to/file.jpg" http://192.168.x.x:3000/api/upload
```

---

## Checking Built Output

If a change doesn't appear at runtime, confirm the compiled file was updated:

```bash
ls -la dist/server/browser-ui/     # verify auth.html is present
node -e "import('./dist/server/main.js')"  # smoke-test server import
```
