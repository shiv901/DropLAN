# Folder Structure

```
droplan/
├── docs/                          ← project documentation (this folder)
├── packages/
│   ├── server/
│   │   ├── src/
│   │   │   ├── server.ts          ← Express app factory, auth routes, socket setup
│   │   │   ├── main.ts            ← server entrypoint (calls startServer)
│   │   │   ├── session.ts         ← PIN + session token management
│   │   │   ├── config.ts          ← port from env
│   │   │   ├── logger.ts          ← structured console logger
│   │   │   ├── middleware/
│   │   │   │   └── requireAuth.ts ← cookie validation; localhost exempt
│   │   │   ├── routes/
│   │   │   │   ├── upload.ts      ← POST /api/upload (multer, progress tracking)
│   │   │   │   ├── files.ts       ← GET /api/files, GET /api/files/:id/download, DELETE
│   │   │   │   └── info.ts        ← GET /api/info
│   │   │   ├── store/
│   │   │   │   ├── fileStore.ts   ← in-memory file registry, disk seed, fs.watch
│   │   │   │   └── deviceStore.ts ← in-memory phone registry (socket → device ID)
│   │   │   └── browser-ui/
│   │   │       ├── index.html     ← phone upload page (vanilla HTML/JS/CSS)
│   │   │       └── auth.html      ← phone PIN entry page
│   │   └── package.json           ← build: tsc && cp -r src/browser-ui/. dist/
│   │
│   ├── client/
│   │   ├── src/
│   │   │   ├── App.tsx            ← root component, IPC poll, socket init, unread badge
│   │   │   ├── components/
│   │   │   │   ├── QRPanel.tsx    ← QR image, PIN digit display, device count badge
│   │   │   │   ├── FileList.tsx   ← file list with preview/delete/open-folder
│   │   │   │   └── StatusBar.tsx  ← top bar (server status, stop button)
│   │   │   ├── api/
│   │   │   │   └── client.ts      ← typed fetch wrappers for Express API
│   │   │   ├── stores/
│   │   │   │   ├── appStore.ts    ← Zustand: app-level state
│   │   │   │   ├── transferStore.ts← Zustand: upload progress
│   │   │   │   └── uiStore.ts     ← Zustand: UI state
│   │   │   └── index.css          ← all styles (no Tailwind; vanilla CSS with custom props)
│   │   └── vite.config.ts
│   │
│   ├── electron/
│   │   ├── src/
│   │   │   ├── main.ts            ← lifecycle, IPC handlers, fetchSessionCode, QR gen
│   │   │   ├── preload.ts         ← contextBridge: exposes window.electron to renderer
│   │   │   ├── security.ts        ← webRequest/permission guards
│   │   │   └── audit.ts           ← security audit helpers
│   │   └── package.json
│   │
│   └── types/
│       └── src/
│           ├── ipc.ts             ← IpcInvokeChannels, IpcSendChannels, ServerInfo, ReceivedFile
│           └── types.ts           ← shared data types
│
├── dist/                          ← compiled output (gitignored)
│   ├── server/
│   │   └── browser-ui/            ← copied from packages/server/src/browser-ui/
│   ├── client/
│   └── electron/
│
├── build/                         ← electron-builder output (.dmg, .app)
├── package.json                   ← workspace root; dev/build/package scripts
└── tsconfig.json                  ← base TS config
```

## Key Build Artifacts

| Source | Output | Notes |
|---|---|---|
| `packages/server/src/` | `dist/server/` | `tsc` + `cp -r src/browser-ui/. dist/server/browser-ui` |
| `packages/client/src/` | `dist/client/` | `vite build` |
| `packages/electron/src/` | `dist/electron/` | `tsc` |
| All of `dist/` | `build/*.dmg` | `electron-builder` bundles everything |
