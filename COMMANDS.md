# DropLAN — Command Reference

## 🚀 Start the App

```bash
npm run dev
```

Starts three services concurrently and opens the Electron window:

| Label | Service | Address |
|---|---|---|
| `[0]` | Express file server | `http://localhost:3000` |
| `[1]` | Vite React dev server | `http://localhost:5173` |
| `[2]` | Electron desktop window | — |

> The `predev` script automatically kills any stale processes on ports 3000 and 5173 before starting.

---

## 🔨 Build

```bash
# Build all packages
npm run build

# Build individual packages
npm run build --workspace=packages/electron
npm run build --workspace=packages/server
npm run build --workspace=packages/client
```

---

## 🧪 Test

```bash
# Run all 51 tests (one-shot)
npm test -- --run

# Watch mode
npm test

# Single package
npm test --workspace=packages/server -- --run
npm test --workspace=packages/client -- --run
npm test --workspace=packages/electron -- --run
```

---

## 🔍 Code Quality

```bash
# TypeScript strict-mode check (zero errors)
npm run type-check

# ESLint
npm run lint
npm run lint:fix      # auto-fix

# Prettier
npm run format        # write fixes
npm run format:check  # check only

# Full CI pipeline (runs all of the above)
npm run ci
```

---

## 🌐 API Endpoints (server on :3000)

```bash
# Health check
curl http://localhost:3000/api/health

# Server info (hostname, version)
curl http://localhost:3000/api/info

# List received files
curl http://localhost:3000/api/files

# Download a file
curl http://localhost:3000/api/files/<id>/download -o filename

# Delete a file
curl -X DELETE http://localhost:3000/api/files/<id>

# Browser upload UI (for phones)
open http://localhost:3000/
```

---

## 🛠️ Troubleshoot

```bash
# Kill stale processes on ports 3000 / 5173
lsof -ti:3000,5173 | xargs kill -9

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run type-check

# Check compiled output
ls dist/electron/   # main.js, preload.js
ls dist/server/     # main.js, routes/, browser-ui/
```

---

## 📂 Where Files Are Saved

Uploaded files land in:

```
~/Downloads/DropLAN/<uuid>-<originalname>
```

Example: `~/Downloads/DropLAN/15f26b9a-photo.jpg`
