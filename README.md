# DropLAN - Secure Local Network File Transfer

> **Faster and simpler than cloud sharing** 🚀

A desktop application (Windows/Mac/Linux) that enables secure file transfer between devices on the same local network through a web browser. No cloud storage, no accounts, no external dependencies.

![Phase](<https://img.shields.io/badge/Phase-1%20Foundation%20(52%25)-blue>)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Project Status

**Phase 1: Foundation & Core Infrastructure**

- ✅ Completed: 12/23 tasks (52%)
- ⏱️ Estimated completion: 2-3 days
- 📊 Test coverage: 17 cases passing

### Completed Milestones

- ✅ Monorepo structure with npm workspaces
- ✅ Electron shell with security hardening
- ✅ React + Vite frontend with HMR
- ✅ Tailwind CSS styling
- ✅ Zustand state management
- ✅ React Query + Axios
- ✅ Express server with Socket.IO
- ✅ Configuration management system
- ✅ Comprehensive logging

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 10+
- macOS, Windows, or Linux

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/yourusername/DropLAN.git
cd DropLAN

# Install dependencies
npm install

# Run full stack (Electron + Server + Client)
npm run dev
```

**Access points after startup:**

- 🖥️ Electron app (native window)
- 🌐 Web UI: http://localhost:5173
- 🔌 API: http://localhost:3000

---

## 📋 Important Commands

### Development

```bash
npm run dev                    # Start all 3 services (recommended)
npm run dev --workspace=packages/client     # React only
npm run dev --workspace=packages/server     # Server only
```

### Quality & Build

```bash
npm run type-check            # TypeScript validation
npm run lint                  # ESLint
npm run format                # Prettier auto-format
npm run ci                    # Full pipeline (type-check → lint → format)
npm run build                 # Production build
npm run test                  # Run all tests
```

### API Testing (After server starts)

```bash
# Health check
curl http://localhost:3000/api/health

# Server status
curl http://localhost:3000/api/status
```

---

## 📁 Project Structure

```
DropLAN/
├── packages/
│   ├── client/              React frontend (Vite + Tailwind)
│   ├── server/              Express backend + Socket.IO
│   ├── electron/            Electron main process
│   └── types/               Shared TypeScript definitions
├── docs/
│   ├── RUNNING_PROJECT.md   Detailed run guide
│   ├── SECURITY.md          Security documentation
│   ├── PLANNING/            Phase planning documents
│   └── PHASE_1_*.md         Task-specific docs
├── package.json             Root workspace config
├── tsconfig.json            TypeScript strict mode
└── COMMANDS.md              Quick command reference
```

---

## 🏗️ Technology Stack

| Layer          | Technology            | Purpose                   |
| -------------- | --------------------- | ------------------------- |
| **Desktop**    | Electron              | Multi-platform native app |
| **Frontend**   | React 18 + Vite       | UI with hot reload        |
| **Styling**    | Tailwind CSS          | Responsive design         |
| **State**      | Zustand + React Query | Client + server state     |
| **Backend**    | Express + Socket.IO   | API + real-time events    |
| **Language**   | TypeScript (strict)   | Type safety               |
| **Testing**    | Vitest                | Unit & integration tests  |
| **Validation** | Zod                   | Schema validation         |
| **Hashing**    | Argon2                | Password hashing          |

---

## 🔐 Security Features

- 🔒 **Electron Security**: contextIsolation, sandbox, no nodeIntegration
- 🔑 **IPC Whitelisting**: Only allowed channels can communicate
- 🛡️ **CORS LAN-Only**: Rejects external network requests
- 🔐 **Argon2 Hashing**: Industry-grade password hashing
- 📋 **Configuration Security**: No hardcoded secrets
- 📝 **Structured Logging**: No sensitive data leaked

See [docs/SECURITY.md](docs/SECURITY.md) for detailed security audit.

---

## 📊 Quality Metrics

| Metric        | Status | Details                    |
| ------------- | ------ | -------------------------- |
| TypeScript    | ✅     | Strict mode, 0 `any` types |
| ESLint        | ✅     | 0 errors, ~10 warnings     |
| Prettier      | ✅     | 100% compliant             |
| Build Size    | ✅     | 54.47 kB gzipped (client)  |
| Tests         | ✅     | 17 passing                 |
| Type Coverage | ✅     | 100%                       |

---

## 🎯 Phase 1 Deliverables (Completed)

### Tasks 1-7: Foundation & Electron

- ✅ Monorepo setup with 4 workspaces
- ✅ TypeScript strict configuration
- ✅ ESLint & Prettier integration
- ✅ IPC type definitions
- ✅ Electron main process + security
- ✅ Preload script with validation
- ✅ Security audit + documentation

### Tasks 8-12: React & UI (Latest)

- ✅ React + Vite with HMR
- ✅ Tailwind CSS integration
- ✅ Zustand stores (app, transfer, ui)
- ✅ React Query setup with caching
- ✅ Express server initialization

---

## 📈 Remaining Phase 1 Tasks (13-23)

| #     | Task            | Est. Time | Status     |
| ----- | --------------- | --------- | ---------- |
| 13    | Server Routes   | 3h        | ⏳ Pending |
| 14    | IPC Integration | 3h        | ⏳ Pending |
| 15    | Transfer Engine | 4h        | ⏳ Pending |
| 16    | QR Code Gen     | 2h        | ⏳ Pending |
| 17    | UI Components   | 4h        | ⏳ Pending |
| 18    | Error Handling  | 2h        | ⏳ Pending |
| 19-23 | Testing & QA    | 8h        | ⏳ Pending |

**Total Remaining:** ~26 hours → **2-3 days @ 5h/day**

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific package tests
npm run test --workspace=packages/client
npm run test --workspace=packages/server

# Test coverage
npm run test -- --coverage
```

**Current:** 17 test cases passing

- Zustand stores: 9 cases
- React Query: 3 cases
- Server config: 2 cases
- Logger: 2 cases
- Components: 1 case

---

## 🔧 Configuration

### Environment Variables

```bash
# Server configuration
PORT=3000                         # Server port (default: 3000)
MAX_FILE_SIZE=536870912000       # Max file size in bytes (default: 500GB)
CHUNK_SIZE=8388608               # Upload chunk size (default: 8MB)
NODE_ENV=development              # development|production|test
```

### Platform-Specific Paths

- **macOS:** `~/Library/Application Support/DropLAN/config.json`
- **Windows:** `%APPDATA%\DropLAN\config.json`
- **Linux:** `~/.config/DropLAN/config.json`

---

## 📚 Documentation

- **[RUNNING_PROJECT.md](docs/RUNNING_PROJECT.md)** - Detailed run guide
- **[COMMANDS.md](COMMANDS.md)** - Quick command reference
- **[SECURITY.md](docs/SECURITY.md)** - Security best practices
- **[PLANNING/plan.md](docs/PLANNING/plan.md)** - Complete roadmap
- **[PHASE_1_TASKS_8-12_COMPLETE.md](docs/PHASE_1_TASKS_8-12_COMPLETE.md)** - Latest progress

---

## 🤝 Contributing

Contributions welcome! Please ensure:

1. **Run quality checks before committing:**

   ```bash
   npm run ci
   ```

2. **Follow the branch naming convention:**
   - `feature/description` - New features
   - `fix/description` - Bug fixes
   - `docs/description` - Documentation

3. **Write tests for new functionality**

4. **Update documentation as needed**

---

## 🐛 Known Issues

1. **TypeScript Version Warning** - Using v5.9.3 (ESLint supports up to 5.6.0), works fine
2. **Vitest Watch Mode** - May hang on some systems; use individual package tests as workaround
3. **npm audit** - 6 vulnerabilities in transitive dependencies (acceptable for MVP)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🗓️ Development Timeline

| Phase                          | Duration | Status            |
| ------------------------------ | -------- | ----------------- |
| Phase 1: Foundation            | 2 weeks  | 52% (in progress) |
| Phase 2: Transfer Engine       | 2 weeks  | ⏳ Pending        |
| Phase 3: UI & UX               | 2 weeks  | ⏳ Pending        |
| Phase 4: Security & Resilience | 2 weeks  | ⏳ Pending        |
| Phase 5: Discovery Features    | 2 weeks  | ⏳ Pending        |
| Phase 6: Packaging & Release   | 2 weeks  | ⏳ Pending        |

---

## 🎓 Learning Resources

### Key Concepts

- **Local Network First:** No external servers, everything stays on LAN
- **Streaming Transfer:** Files never fully loaded into memory
- **Electron Security:** Multi-layer isolation for desktop safety
- **Type Safety:** 100% TypeScript coverage with strict mode

### Architecture Patterns

- **Monorepo:** 4 independent workspaces sharing types
- **IPC Communication:** Type-safe Electron↔React messaging
- **State Management:** Zustand (client) + React Query (server)
- **Configuration Priority:** ENV > config.json > hardcoded defaults

---

## 📞 Support

### Quick Troubleshooting

**Port 3000 in use?**

```bash
lsof -i :3000 && kill -9 <PID>
```

**Dependencies issue?**

```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**

```bash
npm run type-check
```

---

## 🚀 Next Steps

1. **Start Development:**

   ```bash
   npm run dev
   ```

2. **Check Progress:**

   ```bash
   npm run ci
   ```

3. **Run Tests:**

   ```bash
   npm run test
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

---

**Built with ❤️ using Electron, React, Express, and TypeScript**

Last Updated: June 1, 2026 | Phase 1: 52% Complete
