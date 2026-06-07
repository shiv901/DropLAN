# DropLAN Development Plan - Complete Index

## 📚 Documentation Files (Session State)

All planning documents are saved in: `/Users/sraghav/.copilot/session-state/fcbda7c9-4bb2-446d-b3cd-a17006912df9/`

### 1. **plan.md** - Master Development Roadmap

- Complete 6-phase plan (12 weeks)
- All decisions documented
- Configuration management strategy
- Success metrics per phase
- Technical debt tracking

### 2. **PHASE_1_SUMMARY.md** - Phase 1 Executive Summary

- Overview of Phase 1 goals
- 23-task breakdown by category
- Recommended execution order
- Common issues & solutions
- Quick reference table

### 3. **PHASE_1_BREAKDOWN.txt** - Detailed Task Specifications

- 23 detailed task descriptions
- Each task has: objective, actions, DOD, verification
- Task dependency graph
- Estimated hours per task
- Code examples where applicable

### 4. **This File** - Index & Reference

---

## 🗂️ Database Tracking (SQL - Session)

Two tables created for progress tracking:

### `clarifications` Table

Tracks all decisions made during planning:

- Password hashing: **argon2**
- File size cap: **500GB (configurable)**
- mDNS: **Deferred to Phase 7**
- Background daemon: **Future release**
- E2E encryption: **Phase 7+**

### `phase_1_tasks` Table

23 tasks with:

- Task ID, title, description
- Category (infrastructure, frontend, electron, backend, security)
- Estimated hours (total: 58 hours)
- Dependencies (to determine execution order)
- Status tracking (pending → in_progress → done)

---

## 🎯 Quick Start Guide

### Step 1: Review Planning

1. Read: **PHASE_1_SUMMARY.md** (10 min overview)
2. Skim: **plan.md** (understand full 12-week vision)
3. Reference: **PHASE_1_BREAKDOWN.txt** (as you code)

### Step 2: Environment Setup

- Location: `/Users/sraghav/Desktop/Work/DropLAN`
- Existing: `/docs` folder with product requirements
- Action: Start with **Task [1] - Repository Setup**

### Step 3: Track Progress

- Mark tasks complete in SQL: `UPDATE phase_1_tasks SET status = 'done' WHERE id = 'X'`
- Run: `npm run lint` and `npm run test` after each task
- Verify DOD checklist for each task

### Step 4: Next Phase

- After Phase 1 complete: Move to **Phase 2: Transfer Engine**
- Phase 2 deliverables: Database, APIs, streaming

---

## 📊 Phase Overview

| Phase | Duration | Goal                | Status     |
| ----- | -------- | ------------------- | ---------- |
| 1     | 2 weeks  | Foundation & IPC    | 📋 Planned |
| 2     | 2 weeks  | Transfer Engine     | 📋 Pending |
| 3     | 2 weeks  | User Interface      | 📋 Pending |
| 4     | 2 weeks  | Security & Recovery | 📋 Pending |
| 5     | 2 weeks  | Discovery & Network | 📋 Pending |
| 6     | 2 weeks  | Packaging & Release | 📋 Pending |

---

## 🔧 Configuration Management

All operational values are **configurable** (not hardcoded):

### Config File Locations

- **macOS:** `~/Library/Application Support/DropLAN/config.json`
- **Windows:** `%APPDATA%\DropLAN\config.json`
- **Linux:** `~/.config/DropLAN/config.json`

### Default Values

```json
{
  "maxFileSize": 549755813888, // 500GB
  "chunkSize": 8388608, // 8MB
  "maxConcurrentUploads": 10,
  "maxConcurrentDownloads": 20,
  "portRange": [3000, 3999],
  "bindAddress": "0.0.0.0",
  "sessionExpirationHours": 24,
  "requestsPerMinute": 100
}
```

### Priority Order

1. **CLI flags** (highest)
2. **Environment variables**
3. **config.json file**
4. **Built-in defaults** (lowest)

---

## 💡 Key Decisions Locked In

✅ **Hashing:** argon2 (more secure, purpose-built)  
✅ **Database:** SQLite (metadata only, not files)  
✅ **Frontend:** React + Vite + TypeScript strict  
✅ **Backend:** Express on Node.js  
✅ **Desktop:** Electron with secure defaults  
✅ **Transfer:** Streaming (no buffers, handles 100GB+)  
✅ **Architecture:** 4-workspace monorepo

---

## 📖 SQL Usage Explained

### What Goes in SQL?

- ✅ Transfer metadata (ID, filename, progress, status)
- ✅ File references (storagePath, checksum, uploadedAt)
- ✅ Session tokens (sessionId, expiration, ipAddress)
- ✅ App settings (config overrides, user preferences)

### What Does NOT Go in SQL?

- ❌ File contents (stored on disk, streamed to network)
- ❌ Plaintext passwords (only argon2 hash)
- ❌ Sensitive tokens (never logged)

### Why This Design?

- **Performance:** Metadata in DB, files on disk = fast
- **Scalability:** Streaming support for 100GB+ files
- **Recovery:** Can reconstruct state from metadata after crash
- **Resume:** Chunk metadata allows resuming uploads
- **Memory:** No files loaded into memory

---

## 🏗️ Monorepo Structure

```
DropLAN/
├── packages/
│   ├── server/
│   │   ├── src/main.ts, server.ts, logger.ts, routes/
│   │   └── package.json
│   ├── client/
│   │   ├── src/components/, features/, hooks/, stores/, types/
│   │   ├── App.tsx, main.tsx
│   │   └── vite.config.ts
│   ├── electron/
│   │   ├── src/main.ts, preload.ts, ipc/
│   │   └── package.json
│   └── types/
│       ├── src/ipc.ts, config.ts, index.ts
│       └── package.json
├── docs/                      (Already exists)
├── package.json               (Root with workspaces)
├── tsconfig.json              (Root config)
├── .eslintrc.json, .prettierrc, vitest.config.ts
└── .vscode/launch.json        (Debugging)
```

---

## ✅ Success Criteria Checklist

### Phase 1 Complete When:

- [ ] npm install succeeds
- [ ] npm run dev starts all services without errors
- [ ] Electron app opens with React frontend
- [ ] Express server starts on auto-selected port
- [ ] React displays server port via IPC
- [ ] TypeScript strict mode passes
- [ ] npm run lint passes all checks
- [ ] npm run test passes
- [ ] HMR works (React changes reload instantly)
- [ ] VS Code debugging functional
- [ ] No hardcoded config values
- [ ] Security checklist verified
- [ ] npm audit shows no vulnerabilities

---

## 🚀 Commands You'll Use

```bash
# Install everything
npm install

# Start development (all services)
npm run dev

# Code quality
npm run lint
npm run format

# Testing
npm run test

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

---

## 📋 Task Tracking Template

When updating SQL progress:

```sql
-- Mark task in progress
UPDATE phase_1_tasks SET status = 'in_progress' WHERE id = 'repo-setup';

-- Mark task complete
UPDATE phase_1_tasks SET status = 'done' WHERE id = 'repo-setup';

-- View all pending tasks
SELECT id, title, estimated_hours FROM phase_1_tasks WHERE status = 'pending';

-- View progress summary
SELECT status, COUNT(*) as count, ROUND(SUM(estimated_hours), 1) as hours
FROM phase_1_tasks GROUP BY status;
```

---

## 🎯 Next Immediate Actions

1. **Review** PHASE_1_SUMMARY.md (10 min)
2. **Understand** task dependencies in PHASE_1_BREAKDOWN.txt
3. **Start** Task [1] - Repository Setup
4. **Track** progress in SQL
5. **Verify** DOD after each task

---

## 📞 Questions to Return To

- **File size limit:** 500GB initial, will stress test
- **Config values:** All parameters configurable, never hardcoded
- **SQL design:** Metadata only, files on disk with streaming
- **Phases:** 6 phases, 12 weeks total, MVP at Phase 3
- **mDNS:** Deferred to Phase 7 (nice-to-have)

---

## 📝 Documentation Status

✅ **Complete:** Comprehensive 6-phase plan  
✅ **Complete:** 23 detailed Phase 1 tasks  
✅ **Complete:** Configuration strategy  
✅ **Complete:** Decision log  
⏳ **Ready:** To begin Phase 1 implementation

---

**You are here:** 📍 Planning Complete → Ready to Code Phase 1

**Next:** Run Task [1] - Repository Setup
