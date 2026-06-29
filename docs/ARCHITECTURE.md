# Architecture

## Package Structure

```
droplan/                          ← npm workspace root
├── packages/
│   ├── server/                   ← Express + Socket.IO (Node.js, ESM)
│   │   └── src/
│   │       ├── server.ts         ← app factory + socket setup
│   │       ├── main.ts           ← entrypoint (calls startServer)
│   │       ├── session.ts        ← PIN generation + session tokens
│   │       ├── config.ts         ← port config
│   │       ├── logger.ts         ← structured logger
│   │       ├── middleware/
│   │       │   └── requireAuth.ts
│   │       ├── routes/
│   │       │   ├── upload.ts     ← POST /api/upload (multer)
│   │       │   ├── files.ts      ← GET/DELETE /api/files
│   │       │   └── info.ts       ← GET /api/info
│   │       ├── store/
│   │       │   ├── fileStore.ts  ← in-memory file registry + fs.watch
│   │       │   └── deviceStore.ts← in-memory connected-phone registry
│   │       └── browser-ui/
│   │           ├── index.html    ← phone upload page
│   │           └── auth.html     ← phone PIN entry page
│   ├── client/                   ← React 18 + Vite (Electron renderer)
│   │   └── src/
│   │       ├── App.tsx           ← root; IPC polling, socket, unread badge
│   │       ├── components/
│   │       │   ├── QRPanel.tsx   ← QR code + PIN display + device count
│   │       │   ├── FileList.tsx  ← received files list
│   │       │   └── StatusBar.tsx ← connection status
│   │       └── index.css         ← all styles (vanilla CSS)
│   ├── electron/                 ← Electron main + preload
│   │   └── src/
│   │       ├── main.ts           ← lifecycle, IPC handlers, QR generation
│   │       └── preload.ts        ← contextBridge surface
│   └── types/                    ← shared TypeScript contracts
│       └── src/
│           ├── ipc.ts            ← IPC channel + payload types
│           └── types.ts          ← shared data types
└── dist/                         ← compiled output (gitignored)
    ├── server/
    ├── client/
    └── electron/
```

## Runtime Modes

### Development (`npm run dev`)
```
concurrently:
  [0] node dist/server/main.js          → port 3000
  [1] vite (packages/client)            → port 5173
  [2] electron . (VITE_DEV_SERVER_URL=http://localhost:5173)
```
Electron loads React from Vite. Server is a **separate process** — Electron does NOT start it.

### Production (packaged `.app`)
```
electron main.ts
  └─ utilityProcess.fork(Resources/server/main.js)
  └─ BrowserWindow.loadFile(Resources/client/index.html)
```
Electron forks the server as a utility process and loads the built React bundle.

## Communication Layers

```
Phone browser ──HTTP/WS──▶ Express (port 3000)
                                   │
                              Socket.IO
                                   │
Electron renderer ◀──IPC──── main.ts
                          (contextBridge)
```

| From → To | Transport | Events / Calls |
|---|---|---|
| Renderer → main | IPC `invoke` | `app:getServerInfo`, `app:revealFile`, `app:notify`, `app:setDockBadge` |
| Main → renderer | IPC `send` | `server:status`, `file:received` |
| Renderer → server | HTTP fetch | `GET /api/files`, `DELETE /api/files/:id` |
| Phone → server | HTTP + multipart | `POST /api/upload` |
| Server → renderer/phone | Socket.IO emit | `file:received`, `server:connections`, `upload:progress`, `server:stopping` |

## Key Invariants

- **Electron renderer** connects to socket.io with `query: { type: 'renderer' }` → never counted in device badge, always trusted by auth middleware.
- **Phone browsers** connect with `query: { type: 'phone' }` → must have valid session cookie; registered in `deviceStore`.
- **Localhost** (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`) is always trusted by `requireAuth` middleware — no cookie needed for Electron's own API calls.
- **`SESSION_CODE`** is generated once at server startup. It resets on every restart.
- **`SERVER_PORT = 3000`** is a hardcoded constant in `main.ts` — `app:getServerInfo` returns `{ port: 3000 }` even if the Express server is not yet running. This means the React renderer's retry loop (`if (info?.port)`) can stop early if `sessionCode` arrives as `'0000'`. The `fetchSessionCode()` retry loop guards against this.
- **In dev mode, Electron waits for Vite (5173) but NOT for Express (3000).** `waitForUrl(devUrl)` only polls Vite. Express usually starts first (it's faster), but there is no guarantee. If the renderer calls `app:getServerInfo` before Express is up, `fetchSessionCode()` will retry up to 20 times × 500ms before giving up.
- **Socket.IO transports**: `['websocket', 'polling']` — both are kept because some phone browsers (especially behind corporate proxies) prefer polling first. Websocket is tried first but polling is the fallback.
- **`waitForUrl` uses Node's `http.get`, not `fetch`** — `fetch` is not available in all Electron main process builds. `http` is always available.
