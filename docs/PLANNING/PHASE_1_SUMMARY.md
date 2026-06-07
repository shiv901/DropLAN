# PHASE 1 - Foundation & Core Infrastructure

**Duration:** 2 Weeks | **Total Effort:** ~58 Hours

## Executive Summary

Phase 1 establishes the complete foundation for DropLAN. By the end of Phase 1, you'll have:

✅ Working monorepo with 4 workspaces (server, client, electron, types)  
✅ Electron app with secure defaults running  
✅ React frontend with HMR and state management  
✅ Express server with auto-port selection  
✅ Type-safe IPC communication between Electron and React  
✅ Development environment that runs all services concurrently

**Success = npm run dev starts everything and Electron app displays server port**

---

## Task Categories (23 Total Tasks)

### 📦 Infrastructure (7 tasks) - 18 hours

Foundation work: repo setup, TypeScript, ESLint, type definitions, build scripts

### ⚛️ Frontend (6 tasks) - 16 hours

React + Vite with Tailwind, Zustand, React Query

### 🔌 Electron (5 tasks) - 14 hours

Main process, preload script, IPC channels, security verification

### 🖥️ Backend (4 tasks) - 9 hours

Express server, endpoints, logging, error handling

### 🔒 Security (1 task) - 1 hour

Final security audit checklist

---

## Task Dependency Graph

```
repo-setup
  ├── ts-config
  │   ├── eslint-setup
  │   ├── ipc-types
  │   ├── electron-main
  │   │   ├── electron-preload
  │   │   │   └── ipc-server-channel
  │   │   │       └── ipc-lifecycle
  │   │   └── electron-security ──┐
  │   ├── react-setup             │
  │   │   ├── tailwind-setup      │
  │   │   ├── zustand-setup       │
  │   │   ├── react-query-setup   │
  │   │   └── app-shell           │
  │   │       └── ipc-frontend-hook
  │   ├── express-init            │
  │   │   ├── health-endpoint     │
  │   │   ├── logging-setup       │
  │   │   │   └── error-middleware
  │   │   └── (backend done)      │
  │   ├── testing-setup           │
  │   └── dev-script              │
  │       └── vscode-debug        │
  │                               │
  └─ security-audit-p1 ◄─────────┘

Legend:
→ Must complete before
◄─ Depends on
```

---

## Recommended Execution Order

### Week 1 - Infrastructure & Backend Foundation

```
Day 1-2 (6-8 hours)
  ✓ [1] repo-setup (3h)
  ✓ [2] ts-config (2h)
  ✓ [3] eslint-setup (2h)
  Goal: Monorepo ready with consistent config

Day 3 (4-5 hours)
  ✓ [4] ipc-types (3h)
  ✓ [12] express-init (3h)
  Goal: Core infrastructure sketched

Day 4-5 (4-5 hours)
  ✓ [13] health-endpoint (2h)
  ✓ [14] logging-setup (2h)
  ✓ [15] error-middleware (2h)
  Goal: Express server ready with basics
```

### Week 1 - Electron & React Setup

```
Day 6 (7-8 hours)
  ✓ [5] electron-main (4h)
  ✓ [6] electron-preload (3h)
  Goal: Electron app window opens

Day 7 (6-7 hours)
  ✓ [7] react-setup (3h)
  ✓ [8] tailwind-setup (2h)
  ✓ [9] zustand-setup (2h)
  Goal: React app renders with styling
```

### Week 2 - Integration & Polish

```
Day 8-9 (9-10 hours)
  ✓ [10] react-query-setup (2h)
  ✓ [11] app-shell (4h)
  ✓ [16] ipc-server-channel (3h)
  ✓ [17] ipc-frontend-hook (3h)
  Goal: React shows server status via IPC

Day 10 (8-9 hours)
  ✓ [18] ipc-lifecycle (2h)
  ✓ [19] dev-script (3h)
  ✓ [20] vscode-debug (2h)
  ✓ [21] testing-setup (3h)
  Goal: npm run dev starts everything

Day 11 (3-4 hours)
  ✓ [7] electron-security (2h)
  ✓ [22] security-audit-p1 (1h)
  Goal: Security verified
```

---

## Config Management Strategy

All limits and parameters are **configurable via config file**, not hardcoded.

### Config File Location

- **macOS:** `~/Library/Application Support/DropLAN/config.json`
- **Windows:** `%APPDATA%\DropLAN\config.json`
- **Linux:** `~/.config/DropLAN/config.json`

### Default Config (config.json)

```json
{
  "maxFileSize": 549755813888,
  "chunkSize": 8388608,
  "maxConcurrentUploads": 10,
  "maxConcurrentDownloads": 20,
  "portRange": [3000, 3999],
  "bindAddress": "0.0.0.0",
  "sessionExpirationHours": 24,
  "requestsPerMinute": 100
}
```

### How Config Works

1. **Defaults** in TypeScript code
2. **Override** with config.json (if exists)
3. **Override** with environment variables
4. **Override** with CLI flags (future)

### Phase 1 Tasks Affected by Config

- [12] express-init: Use portRange from config
- [2] Phase 2 will use maxFileSize, chunkSize, concurrency limits

---

## Key Implementation Notes

### Monorepo Structure

```
DropLAN/
├── packages/
│   ├── server/          (Express + Transfer Engine)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── server.ts
│   │   │   ├── logger.ts
│   │   │   └── routes/
│   │   └── package.json
│   │
│   ├── client/          (React Frontend)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   │
│   ├── electron/        (Electron Main Process)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   └── ipc/
│   │   └── package.json
│   │
│   └── types/           (Shared TypeScript)
│       ├── src/
│       │   ├── ipc.ts
│       │   ├── config.ts
│       │   └── index.ts
│       └── package.json
│
├── package.json         (Root with workspaces)
├── tsconfig.json        (Root TypeScript config)
├── .eslintrc.json
├── .prettierrc
├── vitest.config.ts
└── docs/                (Already exists)
```

### Development Flow

```
npm run dev

  ├─ electron (packages/electron)
  │   └─ Loads React from http://localhost:5173
  │   └─ Starts Express server via Node
  │   └─ Opens window on ready
  │
  ├─ client (packages/client)
  │   └─ Vite dev server on 5173
  │   └─ HMR enabled
  │
  └─ server (packages/server)
      └─ Node server on auto-selected port
      └─ Binds to 0.0.0.0
      └─ Emits 'ready' on startup
```

### IPC Communication Pattern

```typescript
// From React component
const port = await window.electron.invoke('server:status');
// { ready: true, port: 3420 }

// Listen for updates
window.electron.on('server:status', (status) => {
  // Update UI with status
});

// Send commands from React
window.electron.send('server:start');
window.electron.send('server:stop');
```

---

## Definition of Done Checklist

### After Each Task

- [ ] Code compiles without errors
- [ ] TypeScript strict mode passes
- [ ] ESLint/Prettier formats correctly
- [ ] No console warnings
- [ ] Tests pass (if applicable)

### Phase 1 Complete

- [ ] npm install succeeds
- [ ] npm run dev starts all services
- [ ] Electron app opens
- [ ] React displays with Tailwind
- [ ] Server logs show port
- [ ] React displays server port from Electron
- [ ] IPC bidirectional communication works
- [ ] HMR works in development
- [ ] npm run lint passes
- [ ] npm run test passes
- [ ] VS Code debugging works
- [ ] No hardcoded configs (all in config.json)
- [ ] Security settings verified
- [ ] No vulnerabilities in npm audit

---

## Common Issues & Solutions

### "npm install fails in workspace"

→ Delete node_modules and package-lock.json, retry

### "Electron can't find React app"

→ Check vite.config.ts build output path
→ Check main.ts loadURL logic

### "IPC not working"

→ Verify contextBridge in preload.ts
→ Check ipcMain.handle in electron/main.ts
→ Check window.electron exists in DevTools

### "TypeScript strict mode errors"

→ Run: npx tsc --noEmit
→ Fix all errors (no ignores allowed)

### "HMR not working"

→ Check vite.config.ts has 'client' build
→ Check port 5173 is available

---

## Next Steps After Phase 1

🎉 **Phase 1 Complete** → Ready to move to **Phase 2: Transfer Engine**

Phase 2 deliverables:

- SQLite database schema
- Upload/download streaming APIs
- Chunk-based protocol
- Transfer progress tracking

---

## Quick Reference

| Task           | File                  | Hours | Priority |
| -------------- | --------------------- | ----- | -------- |
| repo-setup     | package.json          | 3     | CRITICAL |
| ts-config      | tsconfig.json         | 2     | CRITICAL |
| eslint-setup   | .eslintrc.json        | 2     | HIGH     |
| express-init   | server.ts             | 3     | CRITICAL |
| electron-main  | main.ts               | 4     | CRITICAL |
| react-setup    | client/vite.config.ts | 3     | CRITICAL |
| app-shell      | client/App.tsx        | 4     | HIGH     |
| ipc-types      | types/ipc.ts          | 3     | CRITICAL |
| dev-script     | root package.json     | 3     | CRITICAL |
| security-audit | (checklist)           | 1     | CRITICAL |

---

**Ready to start Phase 1? Confirm to begin Task [1] - Repository Setup**
