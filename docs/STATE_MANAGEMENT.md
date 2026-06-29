# State Management

DropLAN uses a hybrid approach: React local state for UI concerns, Zustand stores for shared app state, and the Express server as the source of truth for files.

---

## Electron Renderer (`packages/client`)

### `App.tsx` — local React state

| State | Type | Purpose |
|---|---|---|
| `serverInfo` | `ServerInfo \| null` | Port, LAN URL, QR data URL, session code |
| `status` | `'connecting' \| 'connected' \| 'disconnected' \| 'stopped'` | UI connection state |
| `socket` | `Socket \| null` | Active Socket.IO connection |
| `connectedDevices` | `number` | Phone count from `server:connections` event |
| `unreadCount` | `number` | Increments on `file:received`, resets on `window focus` |
| `activeUploads` | `UploadProgress[]` | In-progress uploads shown in status area |

### Startup Sequence
1. `useEffect` polls `window.electron.invoke('app:getServerInfo')` every 500ms (max 30 tries = 15s)
2. On success: sets `serverInfo`, creates Socket.IO connection to `localhost:{port}` with `query: { type: 'renderer' }`
3. Socket events drive state changes (`file:received`, `server:connections`, `upload:progress`)

> **Why no HTTP health check**: An earlier version fetched `GET /api/health` from the renderer to confirm the server was running. This caused false `'offline'` states when timing or network conditions failed the check. Removed — status is now **purely IPC-driven**. The renderer trusts whatever the Electron main process reports.

> **`onFileCountChange` prop removed**: `FileList.tsx` previously accepted an `onFileCountChange(count)` callback used for dock-badge counting. This was replaced by the `file:received` socket event incrementing `unreadCount` in `App.tsx`. `FileList` no longer has this prop.

### Zustand Stores
- `appStore.ts` — app-level state (server running status, settings)
- `transferStore.ts` — upload transfer state
- `uiStore.ts` — modal/drawer visibility

---

## Server State (`packages/server`)

### `fileStore.ts` — in-memory file registry
```ts
Map<string, StoredFile>   // keyed by UUID
```
- Seeded from `~/Downloads/DropLAN` on startup (skips hidden files: `name.startsWith('.')`)
- Updated on upload via `registerFile()`
- Synced on external file drops via `fs.watch` watcher (calls `seedFromDisk` + emits `file:received`)
- Upsert logic: same filename → updates existing entry instead of creating duplicate

### `deviceStore.ts` — phone registry
```ts
Map<string, ConnectedDevice>   // keyed by stable device UUID
```
- Device UUID persists in `droplan_device` cookie (1-year expiry)
- Socket ID updates when a known device reconnects
- Cleared on server restart

### `session.ts` — session tokens
```ts
Set<string>   // 32-byte hex session tokens
```
- `SESSION_CODE` = 4-digit PIN (new on every restart)
- `createSession()` adds a token; `isValidSession()` checks membership
- Cleared on restart — phones must re-authenticate

---

## IPC Contract (`packages/types/src/ipc.ts`)

### Invoke channels (renderer → main)
```ts
'app:getServerInfo'    → ServerInfo
'app:revealFile'       → void  (opens file in default app)
'app:openDownloadFolder' → void
'app:notify'           → void  ({ title, body })
'app:setDockBadge'     → void  (string label, '' clears)
'app:quit'             → void
'app:getVersion'       → string
'app:openDevTools'     → void
```

### Send channels (main → renderer)
```ts
'server:status'        → ServerStatusMessage
'file:received'        → ReceivedFile
'transfer:progress'    → TransferProgressMessage
'transfer:complete'    → TransferCompleteMessage
'error:fatal'          → ErrorMessage
```

### `ServerInfo` shape
```ts
{
  port: number;
  lanUrl: string;        // clean URL without PIN (shown in UI)
  qrDataUrl: string;     // QR encodes lanUrl + ?c={PIN}
  hostname: string;
  sessionCode: string;   // 4-digit PIN shown as digit boxes
  mdnsUrl?: string;      // http://hostname.local:3000
}
```
