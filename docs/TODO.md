# TODO & Roadmap

Priority: 🟠 High → 🟡 Medium → 🟢 Future/Parked

---

## 🟠 High Priority

- [x] **Settings panel** — ⚙️ drawer in titlebar
  - Change download folder (live change, no restart)
  - Toggle "launch at login"
  - PIN length: 4-digit / 6-digit / No PIN (takes effect on restart)
  - No-PIN option raises a "request-to-connect" notice (future feature)

- [x] **Error handling on upload failures**
  - Multer error handler in `upload.ts` catches `ENOSPC`, `EACCES`, `EPERM`, `EROFS`, `LIMIT_FILE_SIZE`
  - Emits `upload:error` socket event with user-friendly message
  - Phone browser: toast via `upload:error` socket listener
  - Electron UI: dismissible red banner in the content area (auto-hides after 8s)

---

## 🟡 Medium Priority

- [ ] **Image/video thumbnails** — generate base64 thumbnail on server after upload, send with `file:received`
- [ ] **Right-click context menu** — native macOS context menu on file rows (`ipcMain` + `Menu.buildFromTemplate`)
- [ ] **Sort & filter file list** — sort by name/size/date; search by filename
- [ ] **Multiple upload queue UI** — "3 of 5 files uploading" summary instead of stacked progress bars
- [ ] **Rate limiting on `/api/auth`** — 3 attempts then lockout (brute-force protection for 4-digit PIN)
- [x] **Device count badge** — fixed (KI-3): phone sockets now accepted at socket level; registration gated on valid session cookie; phone transport order changed to polling-first for reliable cookie delivery

---

## 🟢 Future / Parked

### Features
- [ ] **Send to phone (H1)** — push a file from Mac to a specific connected phone
  - Device registry is already implemented (`deviceStore.ts`)
  - Requires: file picker → one-time download token (`GET /api/push/:token`) → phone receives `file:push` socket event → download prompt
  - Needs device selection UI design (which phone to send to)

- [ ] **Request-to-connect mode** — phone sees DropLAN on network, sends a join request, Mac accepts/declines
  - Requires mDNS service discovery on the phone side + IPC approval flow in Electron

- [ ] **Remember devices & nicknames** — `droplan_device` cookie already persists 1 year; add nickname storage (Electron preferences), show in device list with last-seen time

- [ ] **Selective folder sharing** — toggle to expose/hide `~/Downloads/DropLAN` contents for phone download (currently all files are accessible to authenticated phones)

- [ ] **Configurable PIN length** — default 4, allow 3–8 in settings panel

### Infrastructure
- [ ] **Auto-update** — `electron-updater` with GitHub Releases feed
- [ ] **Windows / Linux support** — path handling audit, platform-specific packaging
- [ ] **mDNS UX improvement** — mDNS (`DropLAN._droplan._tcp.local`) runs but phones still need QR for practical use; investigate better discovery flow

### Parked Bugs (low urgency)
- [ ] **Notifications** — works in signed builds; macOS blocks unsigned Electron dev process notifications
