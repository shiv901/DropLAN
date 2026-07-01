# API Reference

Base URL: `http://{lanIp}:3000`

All routes marked 🔒 require a valid session cookie (`droplan_sess`).  
Requests from `127.0.0.1` / `::1` (Electron renderer) are always trusted — no cookie needed.

---

## Public Endpoints

### `GET /api/health`
Health check. Returns 200 when server is ready.
```json
{ "status": "ok", "timestamp": "2026-06-27T10:00:00.000Z" }
```

### `GET /api/status`
```json
{ "status": "running", "port": 3000, "version": "0.1.0" }
```

### `GET /api/session-code`
Returns the session PIN. **Localhost-only** — returns 403 for all other origins.
```json
{ "code": "4753" }
```

### `POST /api/auth`
Authenticate with the 4-digit PIN. Sets `droplan_sess` + `droplan_device` cookies on success.

**Request body:**
```json
{ "code": "4753" }
```

**Success (200):**
```json
{ "ok": true }
```

**Failure (401):**
```json
{ "error": "Invalid code" }
```

### `GET /api/info`
```json
{ "hostname": "Shivs-MacBook", "appVersion": "0.1.0" }
```

---

## Protected Endpoints 🔒

### `GET /api/files`
List all received files.
```json
{
  "files": [
    {
      "id": "uuid",
      "name": "photo.jpg",
      "size": 1048576,
      "receivedAt": "2026-06-27T10:00:00.000Z",
      "diskPath": "/Users/user/Downloads/DropLAN/photo.jpg"
    }
  ]
}
```
> `diskPath` is only useful in the Electron context (for Reveal in Finder).

### `GET /api/files/:id/download`
Stream file to client. Supports HTTP range requests (resume).

Headers set: `Content-Disposition: attachment`, `Accept-Ranges: bytes`

### `DELETE /api/files/:id`
Delete file from disk and registry.
```json
{ "success": true }
```

### `POST /api/upload`
Upload one or more files. Field name: `files` (multipart/form-data). Max 50 files, 500 GB per file.

**Success (200):**
```json
{
  "uploaded": [
    { "id": "uuid", "name": "file.pdf", "size": 2048, "receivedAt": "..." }
  ]
}
```

### `GET /api/devices`
List currently connected phone clients. Localhost-only (Electron use).
```json
{
  "devices": [
    { "id": "uuid", "socketId": "abc", "connectedAt": "...", "name": "iPhone" }
  ]
}
```

### `POST /api/shutdown`
Gracefully stop the server. Emits `server:stopping` to all sockets before closing.
```json
{ "ok": true }
```

---

## Browser Routes

### `GET /`
- With `?c={PIN}` and valid PIN → sets session cookie + redirects to `/`
- With valid session cookie → serves `browser-ui/index.html` (upload page)
- No session → serves `browser-ui/auth.html` (PIN entry)

---

## Admin Endpoints (Localhost-Only)

### `POST /api/admin/set-download-folder`
Change the download folder at runtime — no server restart needed. Called by Electron after the user picks a new folder in Settings.

**Request body:**
```json
{ "folder": "/Users/user/Documents/Drops" }
```

**Success (200):**
```json
{ "ok": true, "folder": "/Users/user/Documents/Drops" }
```

Returns 403 for non-localhost callers.

---


### Server → Client

| Event | Payload | Description |
|---|---|---|
| `file:received` | `{ id, name, size, receivedAt }` | New file uploaded by phone |
| `file:removed` | `{ id }` | File deleted from disk |
| `files:reset` | `{ files[] }` | Download folder changed — full file list reset |
| `server:connections` | `{ count, devices[] }` | Phone connection count changed |
| `upload:progress` | `{ uploadId, filename, pct, received, total }` | Upload progress update |
| `upload:error` | `{ message, code }` | Upload failed server-side (disk full, permission denied, etc.) |
| `server:stopping` | `{}` | Server about to shut down |

### Auth
Phone sockets must have a valid `droplan_sess` cookie in the WebSocket upgrade request headers. Renderer sockets must send `query: { type: 'renderer' }`.
