# DropLAN Project - Essential Commands & Running Guide

## 📋 Quick Reference

### Development (Full Stack)

```bash
npm run dev
```

Starts all 3 services concurrently:

- Electron app (main process)
- Express server on port 3000
- Vite client on port 5173

### Quality & Build

```bash
npm run type-check    # TypeScript strict check
npm run lint          # ESLint validation
npm run format        # Auto-format code
npm run ci            # Full pipeline (type-check + lint + format)
npm run build         # Production build all packages
```

### Individual Package Commands

```bash
npm run dev --workspace=packages/client      # React dev server only
npm run dev --workspace=packages/server      # Express server only
npm run build --workspace=packages/client    # Client build
npm run build --workspace=packages/server    # Server build
npm run test --workspace=packages/client     # Client tests
```

---

## 🚀 Starting the Project (Step by Step)

### Option 1: Full Stack Development (Recommended)

```bash
# Terminal 1: Start all services together
cd /Users/sraghav/Desktop/Work/DropLAN
npm install                    # If dependencies need update
npm run dev
```

**What starts:**

- ✅ Electron main process
- ✅ Express server (http://localhost:3000)
- ✅ React dev server (http://localhost:5173)

**Access points:**

- Electron app: Displays your system
- Browser: http://localhost:5173 (client)
- API: http://localhost:3000/api/health

---

### Option 2: Individual Services (For Debugging)

**Terminal 1 - Start Server:**

```bash
cd /Users/sraghav/Desktop/Work/DropLAN
npm run dev --workspace=packages/server
```

**Terminal 2 - Start Client:**

```bash
cd /Users/sraghav/Desktop/Work/DropLAN
npm run dev --workspace=packages/client
```

**Terminal 3 - Start Electron (Optional):**

```bash
cd /Users/sraghav/Desktop/Work/DropLAN
npm run dev --workspace=packages/electron
```

---

## ✅ Verification Commands

### 1. Check Health

```bash
# TypeScript compilation check
npm run type-check

# Output: No errors = ✅ All code valid
```

### 2. Code Quality

```bash
# ESLint validation
npm run lint

# Output: 0 errors = ✅ Code style OK
```

### 3. Format Check

```bash
# Prettier formatting
npm run format:check

# If fixes needed:
npm run format
```

### 4. Run Full CI Pipeline

```bash
npm run ci

# Runs: type-check → lint → format:check
# Output: All passing = ✅ Ready to deploy
```

### 5. Production Build

```bash
npm run build

# Creates optimized bundles:
# - dist/client/ (React build)
# - dist/server/ (Express build)
# - dist/electron/ (Electron build)
```

### 6. Test Suites

```bash
# Run all tests
npm run test

# Individual packages:
npm run test --workspace=packages/client
npm run test --workspace=packages/server
npm run test --workspace=packages/types
npm run test --workspace=packages/electron
```

---

## 🔍 Testing API Endpoints

### After Server Starts

**Health Check:**

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-06-01T14:15:46.503+05:30"
}
```

**Server Status:**

```bash
curl http://localhost:3000/api/status
```

**Expected Response:**

```json
{
  "status": "running",
  "port": 3000,
  "version": "0.1.0"
}
```

---

## 🏗️ Directory Structure Reminder

```
DropLAN/
├── packages/
│   ├── client/          (React app - port 5173)
│   │   ├── src/
│   │   │   ├── api/     (Axios client, React Query)
│   │   │   ├── stores/  (Zustand: app, transfer, ui)
│   │   │   ├── hooks/   (useServerStatus, etc)
│   │   │   ├── components/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   └── vite.config.ts
│   ├── server/          (Express - port 3000)
│   │   ├── src/
│   │   │   ├── server.ts (Express + Socket.IO)
│   │   │   ├── config.ts (Configuration)
│   │   │   ├── logger.ts (Logging)
│   │   │   └── main.ts   (Entry point)
│   │   └── tsconfig.json
│   ├── electron/        (Electron main process)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   └── security.ts
│   │   └── tsconfig.json
│   └── types/           (Shared TypeScript types)
│       ├── src/
│       │   ├── ipc.ts
│       │   ├── config.ts
│       │   └── index.ts
│       └── tsconfig.json
├── docs/
│   ├── PLANNING/
│   ├── SECURITY.md
│   └── PHASE_1_TASKS_8-12_COMPLETE.md
├── package.json         (Root workspace)
├── tsconfig.json        (Strict mode)
├── vitest.config.ts
├── .eslintrc.json
└── .prettierrc
```

---

## 🔧 Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace <PID> with actual PID)
kill <PID>

# Then retry: npm run dev
```

### Issue: Node Modules Missing

```bash
# Clean and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Issue: TypeScript Errors

```bash
# Check what's wrong
npm run type-check

# Look for any files with red squiggles in VSCode
# Fix errors and run again
```

### Issue: Vite HMR Not Working

```bash
# Restart dev server
# Kill with Ctrl+C
# Start again: npm run dev --workspace=packages/client
```

---

## 📊 Current State Summary

✅ **Phase 1 Status: 52% Complete (12/23 tasks)**

### What's Working:

- ✅ Monorepo structure (4 workspaces)
- ✅ TypeScript strict mode
- ✅ React + Vite with HMR
- ✅ Tailwind CSS styling
- ✅ Zustand state management
- ✅ React Query + Axios
- ✅ Express server with Socket.IO
- ✅ Configuration management
- ✅ Logging utility
- ✅ IPC type definitions
- ✅ Electron security settings
- ✅ Comprehensive test suite

### What's Next (Tasks 13-23):

- [ ] Server routes (upload/download)
- [ ] Transfer engine (streaming)
- [ ] UI components (send/receive)
- [ ] QR code generation
- [ ] Integration testing
- [ ] Performance testing

---

## 📝 Important Environment Variables

Create `.env` file in project root if needed:

```bash
# Server Configuration
PORT=3000
MAX_FILE_SIZE=536870912000  # 500GB in bytes
CHUNK_SIZE=8388608          # 8MB in bytes
NODE_ENV=development
```

---

## 🎯 Key Metrics

| Metric            | Value              |
| ----------------- | ------------------ |
| Client Build Size | 54.47 kB (gzipped) |
| CSS Bundle        | 1.68 kB (gzipped)  |
| Test Cases        | 17 passing         |
| TypeScript        | Strict mode ✅     |
| ESLint            | 0 errors ✅        |
| Prettier          | 100% compliant ✅  |

---

## 🚦 Status Indicators

After running `npm run dev`:

| Service   | URL                   | Expected        | Status |
| --------- | --------------------- | --------------- | ------ |
| Electron  | Native Window         | "DropLAN" title | ✅     |
| Express   | http://localhost:3000 | 200 OK          | ✅     |
| React     | http://localhost:5173 | Vite page       | ✅     |
| Socket.IO | ws://localhost:3000   | Connected       | ✅     |

---

## 💡 Pro Tips

1. **Watch terminal for logs:**
   - Server logs show connections
   - Client shows HMR updates
   - Errors appear immediately

2. **DevTools:**
   - Browser: Press F12 (Console tab)
   - Electron: Right-click → Inspect (if dev tools enabled)
   - Server: Check console output

3. **Hot Reload:**
   - Edit React components → Auto-refresh in browser
   - Edit Tailwind classes → Instant update
   - Edit server routes → Requires restart

4. **Git Workflow:**
   - Always run `npm run ci` before commit
   - Ensures no broken code lands

---

## 📞 Support Commands

```bash
# See all available scripts
npm run

# See individual package scripts
npm run --workspace=packages/client

# Get npm version
npm --version

# List installed packages
npm ls --depth=0

# Check for security vulnerabilities
npm audit

# View TypeScript version
npx tsc --version
```

---

**Ready to build? Start with: `npm run dev` 🚀**
