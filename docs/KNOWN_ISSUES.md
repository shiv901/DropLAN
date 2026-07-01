# Known Issues

## Active

_No active known issues._

---

## Fixed

| Issue | Fix |
|---|---|
| **KI-3** — Device count shows 0 / ERR_HTTP_HEADERS_SENT spam | **Root cause**: `server.on('request', app)` caused Socket.IO polling requests to hit both the Socket.IO internal handler AND Express → double header writes → broken polling → phone sockets never authenticated → device count stuck at 0. **Fix**: Rewrote `startServer()` to use a mutable-handler pattern: `createServer((req,res) => handler(req,res))` with `handler` swapped to the real Express app once `io` is ready. Socket.IO intercepts `/socket.io/*` polling internally before Express ever sees those requests. Also changed phone transport order to `['polling','websocket']` for reliable cookie delivery. |
| **KI-1** — PIN shows as `0000` | `fetchSessionCode()` changed to `http://127.0.0.1:3000/api/session-code`. `localhost` on macOS resolves to `::1` (IPv6) but Express binds to `0.0.0.0` (IPv4 only) → `ECONNREFUSED`. Also added 20-retry loop resolving to `''` on failure, not `'0000'`. Fix verified in code (`packages/electron/src/main.ts`). |
| `auth.html` ENOENT on second build | Changed `cp -r src/browser-ui` → `cp -r src/browser-ui/.` in build script |
| Duplicate file shown on upload | Upsert logic in `registerFile()` — same filename updates existing entry |
| Hidden files (`.DS_Store`, etc.) appearing in file list | Filter on server: `name.startsWith('.')` excluded from file registry |
| Finder-dropped files not appearing without restart | `fs.watch` watcher added to `watchUploadDir()` |
| Preview button opened folder, not file | Changed `app:revealFile` IPC to use `shell.openPath(filePath)` |
| Electron renderer counted as a device | Socket tagged as `type=renderer`, excluded from phone count |
| Dock badge showed total file count (never cleared) | Replaced with `unreadCount` that resets on `window focus` |
