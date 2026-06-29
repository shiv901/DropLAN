# DropLAN — Project Overview

**DropLAN** is a local-network file transfer app built with Electron + React on the desktop and a plain HTML/JS interface in the browser (for phones). Files are transferred over the local Wi-Fi network — no internet, no cloud, no sign-up.

## Core Use Case

1. Open DropLAN on your Mac.
2. Scan the QR code with your phone.
3. Drop files from your phone → they land in `~/Downloads/DropLAN` on the Mac.
4. Open or delete files directly from the Electron UI.

## Target Platforms

- **Primary**: macOS (Electron app, `.dmg` / `.app`)
- **Planned**: Windows, Linux (stubs exist, untested)
- **Phone client**: any browser (iOS Safari, Android Chrome)

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop app | Electron 28 |
| Desktop UI | React 18 + Vite 5 + TypeScript |
| Local server | Express 4 + Socket.IO 4 + Multer |
| Build tooling | TypeScript ESM, `npm workspaces`, `electron-builder` |
| Shared types | `@droplan/types` internal package |

## Non-Goals

- Internet relay / TURN server
- Cloud storage integration
- Encryption in transit (assumes trusted LAN)
- Multi-host coordination (one Mac host at a time)
