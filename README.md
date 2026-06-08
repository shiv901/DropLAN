# DropLAN

> Drop files from any device to your Mac — no cloud, no accounts, no cables.

DropLAN is a macOS desktop app that turns your laptop into a local file-drop server. Scan the QR code with your phone (or any device on the same Wi-Fi), open the browser page, and drag files over. They land instantly in `~/Downloads/DropLAN/`.

**No internet required. Everything stays on your LAN.**

![Status](https://img.shields.io/badge/Status-Working%20Prototype-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-macOS-lightgrey)

---

## ✨ How It Works

```
┌─────────────────┐   Wi-Fi    ┌────────────────────────────┐
│  Phone / Tablet │ ─────────▶ │  DropLAN (Mac)             │
│                 │            │  ┌──────────┐ ┌──────────┐ │
│  Browser UI     │   Upload   │  │ Express  │ │ Electron │ │
│  (scan QR)      │ ─────────▶ │  │ :3000    │ │ Desktop  │ │
└─────────────────┘            │  └──────────┘ └──────────┘ │
                               └────────────────────────────┘
```

1. Run `npm run dev` on your Mac
2. The Electron window opens showing a **QR code** with your LAN address
3. Scan it on your phone — a mobile-friendly upload page opens
4. Drag-and-drop or pick files — they stream directly to `~/Downloads/DropLAN/`
5. The Electron file list updates in real time via Socket.IO

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [download](https://nodejs.org/)
- **npm 10+** — included with Node.js
- **macOS** (Windows/Linux support coming)

### Install & Run

```bash
# Clone
git clone https://github.com/shiv901/DropLAN.git
cd DropLAN

# Install all dependencies (workspaces)
npm install

# Start everything
npm run dev
```

The Electron window will open automatically. Scan the QR code and start dropping files.

> **First run?** The `npm run dev` command builds the packages, then starts the three services concurrently. It takes ~10 seconds on first launch.

---

## 📋 Commands

### Development

| Command | What it does |
|---|---|
| `npm run dev` | **Start everything** — server + client + Electron |
| `npm run build` | Production build of all packages |
| `npm test` | Run all 51 unit tests |
| `npm run type-check` | TypeScript validation (zero errors) |
| `npm run lint` | ESLint across all packages |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Prettier auto-format |
| `npm run ci` | Full pipeline: type-check → lint → format check |

### Verify the server is running

```bash
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}

curl http://localhost:3000/api/files
# → [] (or list of uploaded files)
```

### Troubleshoot stale processes

```bash
# The predev script does this automatically, but if needed:
lsof -ti:3000,5173 | xargs kill -9
npm run dev
```

---

## 📁 Project Structure

```
DropLAN/
├── packages/
│   ├── electron/         Electron main process, IPC, QR code
│   │   └── src/
│   │       ├── main.ts   Window, IPC handlers, LAN IP detection
│   │       ├── preload.ts contextBridge API exposed to renderer
│   │       └── security.ts IPC channel allowlist
│   ├── server/           Express API + Socket.IO
│   │   └── src/
│   │       ├── server.ts   HTTP server + Socket.IO setup
│   │       ├── routes/     upload, files, info, health routes
│   │       ├── store/      In-memory file store
│   │       └── browser-ui/ Mobile upload page (index.html)
│   ├── client/           React dashboard (inside Electron)
│   │   └── src/
│   │       ├── App.tsx       Status + layout
│   │       ├── components/   QRPanel, FileList, StatusBar
│   │       └── index.css     All styles
│   └── types/            Shared TypeScript interfaces
│       └── src/
│           ├── types.ts    ServerInfo, FileRecord, etc.
│           └── ipc.ts      IPC channel type definitions
├── dist/                 Compiled output (git-ignored)
├── package.json          Root workspace config + scripts
└── tsconfig.json         TypeScript strict mode (all packages)
```

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop | Electron 27 | Native macOS window |
| UI Framework | React 18 + Vite | Hot-reload React dashboard |
| Styling | Vanilla CSS | Custom dark-theme design |
| State | Zustand + React Query | Client + server state |
| Backend | Express 4 + Socket.IO | File API + real-time events |
| Language | TypeScript (strict) | Type safety across all packages |
| Testing | Vitest | 51 tests, all passing |

---

## 🔐 Security Model

DropLAN is designed for **trusted LAN use** (home/office network):

- **`contextIsolation: true`** — renderer cannot access Node.js APIs directly
- **`nodeIntegration: false`** — no Node.js in the browser context
- **IPC allowlist** — only explicitly whitelisted channels (`security.ts`) can be used
- **`contextBridge`** — the only bridge between renderer and main process
- **CORS** — server accepts requests from any origin (LAN devices need this)

> ⚠️ Do not run on untrusted public networks — there is no authentication in the MVP.

---

## 🗺️ Roadmap

### ✅ Done (MVP)
- Electron desktop window with macOS native titlebar
- QR code generated from LAN IP
- Mobile-friendly browser upload page
- File streaming to `~/Downloads/DropLAN/`
- Real-time file list via Socket.IO
- 51 unit tests, zero TypeScript errors

### 🔜 Next Up
- [ ] **File persistence** — SQLite so file list survives server restarts
- [ ] **Upload progress bar** — real-time % in the phone browser UI
- [ ] **Production packaging** — `.dmg` installer (no Node.js required)
- [ ] **Multiple file upload** — batch select and upload
- [ ] **File preview** — thumbnail for images in the Electron file list

### 💡 Future Ideas
- [ ] mDNS/Bonjour — find DropLAN on network without QR code
- [ ] Optional password protection
- [ ] Folder upload (zipped on-the-fly)
- [ ] Send files back to phone (download from Electron)
- [ ] Windows / Linux support

---

## 🧪 Testing

```bash
# Run all tests (51 total)
npm test -- --run

# Watch mode
npm test

# Single package
npm test --workspace=packages/server -- --run
```

Tests cover: IPC security, server config, logger, Electron audit, type definitions, React stores, and query client setup.

---

## 🐛 Known Issues

| Issue | Workaround |
|---|---|
| Electron Chromium renderer network service can crash on very large transfers (>1GB) via the renderer's DevTools network tab — core upload still works | Avoid loading DevTools during heavy uploads |
| File list resets on server restart | Planned fix: SQLite persistence |
| macOS font warning (`CoreText note`) in Electron logs | Cosmetic only, no impact |

---

## 🤝 Contributing

1. Fork the repo
2. Run `npm run ci` before committing — catches all type errors, lint, and format issues
3. Branch naming: `feature/`, `fix/`, `docs/`
4. PRs welcome!

---

## 📝 License

MIT — see [LICENSE](LICENSE)

---

*Built with Electron, React, Express, and TypeScript. Files transferred in testing: photos, videos up to 1.68 GB.*
