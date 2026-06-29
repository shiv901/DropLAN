# TODO & Roadmap

Priority: 🟠 High → 🟡 Medium → 🟢 Future/Parked

---

## 🟠 High Priority

- [ ] **Settings panel** — ⚙️ drawer in titlebar
  - Change download folder (currently hardcoded to `~/Downloads/DropLAN`)
  - Toggle "launch at login"
  - Toggle "show in menu bar" (future)
  - PIN length (default 4)

- [ ] **Error handling on upload failures**
  - Disk full / permission denied → catch in multer middleware
  - Emit `upload:error` socket event with user-friendly message
  - Show error toast on phone browser UI

---

## 🟡 Medium Priority

- [ ] **Image/video thumbnails** — generate base64 thumbnail on server after upload, send with `file:received`
- [ ] **Right-click context menu** — native macOS context menu on file rows (`ipcMain` + `Menu.buildFromTemplate`)
- [ ] **Sort & filter file list** — sort by name/size/date; search by filename
- [ ] **Multiple upload queue UI** — "3 of 5 files uploading" summary instead of stacked progress bars
- [ ] **Rate limiting on `/api/auth`** — 3 attempts then lockout (brute-force protection for 4-digit PIN)
- [ ] **Device count badge** — needs live phone test to confirm socket lifecycle behaviour (see KNOWN_ISSUES.md KI-3)

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
