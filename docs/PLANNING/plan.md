# DropLAN Development Roadmap & Implementation Plan

## Project Context

DropLAN is a secure, LAN-first file transfer application enabling users to share files between devices (Windows/Mac/Linux desktop + Android/iOS/mobile browsers) without cloud storage, accounts, or external dependencies.

**Core Promise:** "Faster and simpler than cloud sharing"

---

## Development Phases Overview

### Phase 1: Foundation & Core Infrastructure (Weeks 1-2)

### Phase 2: Transfer Engine & APIs (Weeks 3-4)

### Phase 3: User Interface & Experience (Weeks 5-6)

### Phase 4: Security & Resilience (Weeks 7-8)

### Phase 5: Discovery & Network Features (Weeks 9-10)

### Phase 6: Platform Packaging & Release (Weeks 11-12)

---

## PHASE 1: Foundation & Core Infrastructure

**Duration:** 2 weeks  
**Goal:** Establish monorepo structure, Electron shell, and basic IPC communication.

### 1.1 Monorepo Setup

**Deliverables:**

- Root package.json with workspaces configuration
- `/server` workspace for Express + transfer engine
- `/client` workspace for React frontend
- `/electron` workspace for Electron main process
- Shared `/types` workspace for TypeScript types

**DOD (Definition of Done):**

- [ ] All workspaces install dependencies independently
- [ ] TypeScript strict mode enabled in all workspaces
- [ ] ESLint configured consistently across workspaces
- [ ] dev script runs all services concurrently
- [ ] No `any` types allowed in shared types

**Success Criteria:**

- npm install succeeds without errors
- All workspaces reference shared types correctly
- Development workflow is smooth

---

### 1.2 Electron Shell

**Deliverables:**

- Electron main process entry point
- Window creation and lifecycle management
- Secure IPC channel setup with contextBridge
- Preload script with API exposure
- Basic window menu

**DOD (Definition of Done):**

- [ ] contextIsolation = true
- [ ] sandbox = true
- [ ] nodeIntegration = false
- [ ] webSecurity = true
- [ ] enableRemoteModule = false
- [ ] Preload script exposes only necessary IPC methods
- [ ] No Node APIs directly accessible from renderer
- [ ] Window persists size/position on restart

**Success Criteria:**

- Electron app launches without errors
- Security settings verified in DevTools
- IPC communication works bidirectionally

---

### 1.3 React + Vite Frontend Skeleton

**Deliverables:**

- React app structure with Vite
- TypeScript strict configuration
- Zustand store setup (basic)
- React Query setup
- Tailwind CSS integration
- App shell component (header, sidebar placeholder)

**DOD (Definition of Done):**

- [ ] `npm run dev` starts HMR hot reload
- [ ] TypeScript compiles without errors
- [ ] No implicit `any` types
- [ ] Tailwind utilities work correctly
- [ ] State management initialized
- [ ] React Query configured with proper types

**Success Criteria:**

- App renders blank canvas with header
- HMR works (change title, refreshes instantly)
- All TypeScript checks pass

---

### 1.4 Express Server Setup

**Deliverables:**

- Express server initialization
- Port auto-selection logic (3000-3999 range)
- CORS configuration for local network
- Basic health check endpoint (/health)
- Error handling middleware
- Logging setup (info, warn, error levels)

**DOD (Definition of Done):**

- [ ] Server binds to 0.0.0.0
- [ ] Port auto-selection implemented with fallback
- [ ] CORS allows local network IPs (10.x, 172.16-31.x, 192.168.x)
- [ ] /health endpoint returns 200 with server info
- [ ] Logs don't contain passwords or tokens
- [ ] No telemetry or analytics code

**Success Criteria:**

- Server starts and prints bound port
- curl localhost:PORT/health returns status
- Multiple instances can run without conflicts

---

### 1.5 IPC Communication Layer

**Deliverables:**

- IPC channel for server status (status, port, ready state)
- IPC channel for server lifecycle (start, stop)
- IPC channel for settings retrieval
- Type-safe IPC message definitions in shared/types

**DOD (Definition of Done):**

- [ ] All IPC messages typed in shared workspace
- [ ] Main process validates all messages
- [ ] Renderer receives server port and status
- [ ] Settings persisted and retrievable
- [ ] No large data objects sent via IPC

**Success Criteria:**

- Frontend receives server status on app start
- Stopping server via IPC works correctly
- Port is displayed in frontend logs

---

### PHASE 1 Verification Checklist

- [ ] npm install && npm run dev starts without errors
- [ ] Electron app opens with React frontend
- [ ] Server starts and port is bound
- [ ] IPC communication works both directions
- [ ] All TypeScript strict checks pass
- [ ] Security settings verified

---

## PHASE 2: Transfer Engine & APIs

**Duration:** 2 weeks  
**Goal:** Implement core upload/download streaming engine with chunk-based protocol.

### 2.1 Database Schema & Migration

**Deliverables:**

- SQLite schema for transfers table
- SQLite schema for files table
- SQLite schema for sessions table
- SQLite schema for settings table
- Migration system (simple versioning)
- Database initialization on first run

**Tables to Create:**

```
transfers:
  - id (UUID, PK)
  - fileName (TEXT)
  - fileSize (BIGINT)
  - mimeType (TEXT)
  - status (pending|uploading|paused|completed|failed|cancelled)
  - bytesTransferred (BIGINT)
  - chunkSize (INT, default 8388608)
  - sessionId (FK)
  - createdAt (TIMESTAMP)
  - completedAt (TIMESTAMP)
  - totalChunks (INT)
  - failedChunks (JSON array of chunk indices)

files:
  - id (UUID, PK)
  - transferId (FK)
  - storagePath (TEXT)
  - checksum (TEXT, SHA256)
  - uploadedAt (TIMESTAMP)

sessions:
  - id (UUID, PK)
  - token (TEXT, 32 bytes random)
  - deviceName (TEXT)
  - ipAddress (TEXT)
  - createdAt (TIMESTAMP)
  - expiresAt (TIMESTAMP, 24hrs)
  - passwordProtected (BOOLEAN)

settings:
  - key (TEXT, PK)
  - value (TEXT)
```

**DOD (Definition of Done):**

- [ ] All tables created with proper constraints
- [ ] Foreign keys enforced
- [ ] Indexes on frequently queried columns
- [ ] Migration runs automatically on first run
- [ ] Database file stored in app data directory
- [ ] No migrations fail on existing data

**Success Criteria:**

- Database file created on app start
- All tables visible in SQLite browser
- Schema matches requirements

---

### 2.2 Upload API (POST /upload/init, /chunk, /complete)

**Deliverables:**

- POST /upload/init endpoint
  - Accepts: fileName, fileSize, mimeType
  - Returns: transferId, sessionToken
  - Validates: file size < system capacity
- POST /upload/:transferId/chunk endpoint
  - Accepts: chunk data, chunkIndex, chunkHash
  - Streams to disk
  - Validates: hash matches
  - Returns: ack of chunk received
- POST /upload/:transferId/complete endpoint
  - Verifies: all chunks received
  - Validates: full file hash
  - Returns: file metadata

**Implementation Details:**

- Use fs/promises and streams
- 8MB default chunk size
- Temporary storage before validation
- Atomic move to final location
- Error recovery metadata

**DOD (Definition of Done):**

- [ ] /upload/init validates input (zod)
- [ ] /upload/chunk persists to disk via stream
- [ ] Chunk hash validation prevents corruption
- [ ] /upload/complete moves file atomically
- [ ] Failed uploads leave no orphaned files
- [ ] Transfer metadata persisted immediately
- [ ] Transfer status tracked in DB
- [ ] No large buffers in memory (streams only)
- [ ] Path traversal attempts rejected
- [ ] Null bytes in filename rejected

**Success Criteria:**

- Can upload 100MB file in chunks
- Chunk verification works
- File appears in storage after completion
- Database records all metadata

---

### 2.3 Download API (GET /download/:id with range support)

**Deliverables:**

- GET /download/:id endpoint
  - Supports HTTP Range header
  - Streams from disk
  - Sets Content-Length, Content-Disposition
  - Sets Accept-Ranges header
- GET /files endpoint
  - Lists available files
  - Returns: file metadata (name, size, uploadedAt)

**Implementation Details:**

- Stream file directly to response
- Support partial content (206)
- Support pause/resume via Range requests
- Calculate Content-Length before streaming

**DOD (Definition of Done):**

- [ ] GET /download/:id returns full file
- [ ] Range requests work (bytes=0-1000)
- [ ] Content-Length header set correctly
- [ ] Content-Disposition forces download
- [ ] Accept-Ranges header present
- [ ] Invalid range requests rejected (416)
- [ ] Large files don't load into memory
- [ ] GET /files lists uploaded files only

**Success Criteria:**

- Can download uploaded file
- Partial download (range request) works
- Browser shows download progress
- 1GB file can be downloaded without memory spike

---

### 2.4 Session Management

**Deliverables:**

- Session creation on first request
- Session token generation (crypto.randomBytes)
- Session expiration (24 hours)
- Session validation middleware
- Session cleanup job

**DOD (Definition of Done):**

- [ ] Session token is 32 bytes (256-bit entropy)
- [ ] Token uses crypto.randomBytes (not Math.random)
- [ ] Session expires automatically after 24 hours
- [ ] Expired sessions prevent uploads/downloads
- [ ] Cleanup job removes expired sessions daily
- [ ] Session token never logged

**Success Criteria:**

- New client creates session automatically
- Token persisted in database
- Expired session cannot be reused

---

### 2.5 Transfer Engine Core

**Deliverables:**

- TransferManager class (in-memory tracking)
- Event emitter for transfer progress
- Pause/resume logic
- Retry logic for failed chunks
- Transfer state machine implementation

**DOD (Definition of Done):**

- [ ] Transfer state transitions correctly
- [ ] Progress events emitted accurately
- [ ] Pause stops streaming without losing state
- [ ] Resume continues from last chunk
- [ ] Failed chunks retried automatically
- [ ] State persisted to DB on every status change

**Success Criteria:**

- Transfer can be paused and resumed
- Progress updates real-time
- Failed chunks retry automatically

---

### PHASE 2 Verification Checklist

- [ ] Database initializes and schema correct
- [ ] Can upload 100MB file in chunks
- [ ] Transfer metadata persisted correctly
- [ ] Download endpoint works with range requests
- [ ] Session created and expires correctly
- [ ] All APIs type-safe with zod validation
- [ ] No files in memory at any point

---

## PHASE 3: User Interface & Experience

**Duration:** 2 weeks  
**Goal:** Build React dashboard with real-time transfer tracking, QR display, and file management.

### 3.1 Main Dashboard Component

**Deliverables:**

- Dashboard layout (3-section view)
  - Left: Share Files / Share Folder buttons
  - Center: Active transfers queue
  - Right: QR Code + URL + Device Name
- Status indicator (ready, error, no network)
- Transfer queue component

**DOD (Definition of Done):**

- [ ] Dashboard renders without errors
- [ ] Responsive on desktop and tablet
- [ ] Tailwind styling applied
- [ ] Transfer queue shows real-time updates
- [ ] QR code displays correctly
- [ ] Server status displayed
- [ ] Dark mode compatible

**Success Criteria:**

- Dashboard layout looks professional
- All sections visible and functional
- Real-time updates work

---

### 3.2 Transfer Queue UI

**Deliverables:**

- Transfer item component showing:
  - Filename
  - File size
  - Progress percentage
  - Speed (MB/s)
  - ETA
  - Status badge (uploading, completed, failed)
  - Actions (pause, cancel, retry)
- Transfer history section

**DOD (Definition of Done):**

- [ ] Each transfer shows all required fields
- [ ] Progress bar updates smoothly
- [ ] Speed calculation accurate
- [ ] ETA calculation accurate
- [ ] Pause action pauses transfer
- [ ] Cancel action removes from queue
- [ ] Completed transfers stored in history
- [ ] UI responsive on mobile

**Success Criteria:**

- Transfer progress is smooth and accurate
- All controls work as expected
- Speed and ETA calculations reasonable

---

### 3.3 QR Code Generation & Display

**Deliverables:**

- QR code generation on app start
- QR displays: http://[IP]:[PORT]
- Copy-to-clipboard button for URL
- Manual URL entry fallback
- QR refresh button

**DOD (Definition of Done):**

- [ ] QR code generated using qrcode library
- [ ] QR contains correct URL and port
- [ ] QR scannable from mobile
- [ ] Copy button works
- [ ] Manual URL fallback clear and usable
- [ ] QR updates if port changes

**Success Criteria:**

- QR code displays and is scannable
- Scanning QR takes mobile browser to correct URL
- Manual URL works as fallback

---

### 3.4 File Management UI

**Deliverables:**

- "Share Files" button → file picker
- "Share Folder" button → folder picker
- Drag-and-drop upload area
- Clipboard paste support
- Upload initiation

**DOD (Definition of Done):**

- [ ] File picker opens and works
- [ ] Folder picker works
- [ ] Drag-and-drop zone highlights on drag
- [ ] Multiple files can be selected
- [ ] Clipboard paste triggers file dialog
- [ ] Selected files show before upload starts

**Success Criteria:**

- Can select and begin uploading files
- Drag-and-drop works
- Multiple files handled correctly

---

### 3.5 Web Browser Client UI (Upload/Download)

**Deliverables:**

- Upload page accessible at http://[IP]:[PORT]
  - Drag-and-drop area
  - File picker
  - Paste support
  - Upload progress
  - List of files uploaded
- Download page
  - List of available files
  - Download links
  - File size display
  - Download progress

**DOD (Definition of Done):**

- [ ] Upload page responsive on mobile
- [ ] Drag-and-drop works on all devices
- [ ] Progress shows during upload
- [ ] Error messages clear
- [ ] Download page shows all files
- [ ] Download progress tracked
- [ ] Folder download as ZIP works
- [ ] No layout shifts during load

**Success Criteria:**

- Mobile browser can upload files easily
- Desktop browser can upload and download
- User experience is intuitive

---

### 3.6 Settings UI

**Deliverables:**

- Settings panel (gear icon)
- Password protection toggle
- Chunk size config (4-32MB)
- Storage location display
- Clear transfer history button
- About page

**DOD (Definition of Done):**

- [ ] Settings save to database
- [ ] Password protection can toggle
- [ ] Changes apply immediately
- [ ] Clear history removes files
- [ ] Settings persist across restarts

**Success Criteria:**

- Settings are accessible and functional
- Changes apply without restart

---

### PHASE 3 Verification Checklist

- [ ] Dashboard renders with all sections
- [ ] Transfer queue shows real-time updates
- [ ] QR code displays and is scannable
- [ ] File picker works
- [ ] Web browser client upload/download works
- [ ] Mobile responsive design verified
- [ ] Settings UI functional
- [ ] No console errors

---

## PHASE 4: Security & Resilience

**Duration:** 2 weeks  
**Goal:** Implement authentication, rate limiting, validation, error handling, and recovery.

### 4.1 Input Validation & Sanitization

**Deliverables:**

- Zod schemas for all endpoints
- Filename sanitization
- Path traversal prevention
- MIME type validation
- File size validation

**Validation Rules:**

- Filename: no path separators, no null bytes
- File size: <= available disk space
- MIME type: whitelist common types
- Headers: validate Content-Length, Content-Type

**DOD (Definition of Done):**

- [ ] All endpoints use zod validation
- [ ] Invalid requests return 400
- [ ] Path traversal attempts rejected
- [ ] Null bytes rejected
- [ ] File size limits enforced
- [ ] MIME type validation working
- [ ] Error messages don't leak info

**Success Criteria:**

- Malicious filenames rejected
- Path traversal blocked
- Invalid requests fail cleanly

---

### 4.2 Rate Limiting

**Deliverables:**

- Rate limiter middleware
- Per-IP rate limiting (100 req/min)
- Upload endpoint rate limiting (10 concurrent)
- Download endpoint rate limiting (20 concurrent)
- Rate limit headers in responses

**DOD (Definition of Done):**

- [ ] Rate limiter uses IP address
- [ ] Limits applied per endpoint
- [ ] 429 response when limit exceeded
- [ ] Rate-Limit headers present
- [ ] In-memory or Redis backed (initially memory)
- [ ] Expired limits cleaned up

**Success Criteria:**

- Rapid requests from single IP throttled
- 429 response when limit exceeded
- Multiple IPs not affected by each other

---

### 4.3 Password Protection (Optional)

**Deliverables:**

- Password hashing with argon2
- Session authentication middleware
- Enable/disable toggle in settings
- Password prompt in browser UI

**Implementation:**

- Hash passwords with argon2 (not bcrypt - per requirements review)
- Store hash in database
- Require password before upload/download
- Session token only issued after password verified

**DOD (Definition of Done):**

- [ ] Password never stored plaintext
- [ ] Argon2 hashing implemented
- [ ] Password prompt appears on web client
- [ ] Correct password allows upload/download
- [ ] Wrong password blocks access
- [ ] Password can be changed in settings
- [ ] Password never logged

**Success Criteria:**

- Can enable password protection
- Password required in browser when enabled
- Incorrect password rejected

---

### 4.4 CORS & Security Headers

**Deliverables:**

- CORS headers for local network IPs
- Security headers (X-Content-Type-Options, X-Frame-Options)
- CSP header configuration

**DOD (Definition of Done):**

- [ ] CORS allows only local IPs
- [ ] CORS headers set correctly
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] CSP prevents inline scripts
- [ ] Test cross-origin requests blocked

**Success Criteria:**

- Local network requests allowed
- External requests blocked
- Security headers present

---

### 4.5 Error Handling & Recovery

**Deliverables:**

- Transfer metadata persistence
- Crash recovery system
- Retry logic for failed chunks
- Human-readable error messages
- Error logging (no sensitive data)

**Recovery Scenarios:**

- Browser closes mid-upload → can resume
- WiFi disconnects → can resume
- App crashes → transfer recovers on restart
- Failed chunk → retried automatically

**DOD (Definition of Done):**

- [ ] Transfer metadata saved before streaming
- [ ] Chunk metadata saved immediately
- [ ] App crash doesn't lose transfer state
- [ ] Transfers resume automatically on restart
- [ ] Failed chunks retried with backoff
- [ ] Errors logged without passwords/tokens
- [ ] Error UI shows helpful messages

**Success Criteria:**

- Can resume after WiFi disconnect
- Can resume after browser close
- App crash doesn't lose state

---

### 4.6 Network Isolation & Verification

**Deliverables:**

- Local network IP validation
- Request origin verification
- Reject external requests

**Allowed IP Ranges:**

- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

**DOD (Definition of Done):**

- [ ] Client IP validated on every request
- [ ] External IPs rejected with 403
- [ ] IPv6 link-local addresses allowed
- [ ] Localhost always allowed
- [ ] VPN/tunnel IPs properly handled

**Success Criteria:**

- External network requests blocked
- Local network requests allowed
- No data leaks to external servers

---

### PHASE 4 Verification Checklist

- [ ] All endpoints validate input with zod
- [ ] Path traversal attempts blocked
- [ ] Rate limiting working
- [ ] Password protection functional (if enabled)
- [ ] Security headers present
- [ ] Transfer recovery works after crash
- [ ] Resume functionality verified
- [ ] All errors handled gracefully

---

## PHASE 5: Discovery & Network Features

**Duration:** 2 weeks  
**Goal:** Implement QR-based discovery, mDNS, and optional WebRTC foundation.

### 5.1 QR Code Discovery (Already Covered in Phase 3)

**Deliverables:**

- QR code displays http://[IP]:[PORT]
- QR refreshes if port changes
- Manual URL fallback

---

### 5.2 mDNS / Bonjour Discovery (Optional Phase 1)

**Deliverables:**

- mDNS service advertisement
- Service name: "DropLAN" + device name
- Automatic device discovery on network
- Discovery list in UI

**Implementation:**

- Use mdns or bonjour library
- Register service on startup
- Deregister on shutdown
- List discovered services in UI

**DOD (Definition of Done):**

- [ ] Service advertised on network
- [ ] Service name includes device identifier
- [ ] Service discoverable with standard clients
- [ ] Service deregistered cleanly on shutdown
- [ ] No external dependencies required
- [ ] Works on macOS, Windows, Linux

**Success Criteria:**

- Other devices see DropLAN in network discovery
- Click to connect works

---

### 5.3 Clipboard Share Integration

**Deliverables:**

- Paste files from clipboard in web UI
- Clipboard image paste support
- Automatic trigger on paste

**DOD (Definition of Done):**

- [ ] Paste event triggers file dialog
- [ ] Multiple clipboard images supported
- [ ] Clipboard text files handled
- [ ] Works across browsers
- [ ] Fallback if unsupported

**Success Criteria:**

- Can paste files from clipboard
- Multiple images paste as separate files

---

### 5.4 Persistent Sessions

**Deliverables:**

- Browser stores session token (localStorage)
- Token validated on each request
- Auto-login with stored token
- Token refresh/rotation

**DOD (Definition of Done):**

- [ ] Session token stored locally
- [ ] Token validated without re-auth
- [ ] Token expires after inactivity
- [ ] Expired token clears localStorage

**Success Criteria:**

- Browser doesn't ask for password twice
- Closing/reopening browser works

---

### 5.5 Advanced Discovery Features (Phase 2+)

**Planned but NOT in Phase 5:**

- WebRTC data channel (future)
- Internet relay (future)
- Peer discovery protocol (future)

---

### PHASE 5 Verification Checklist

- [ ] QR code discovery verified
- [ ] mDNS service advertised
- [ ] Other devices can discover DropLAN
- [ ] Clipboard paste works
- [ ] Session persistence verified
- [ ] Manual URL discovery works as fallback

---

## PHASE 6: Platform Packaging & Release

**Duration:** 2 weeks  
**Goal:** Build and package Electron app for macOS, Windows, Linux.

### 6.1 Build & Bundling Configuration

**Deliverables:**

- Vite build configuration for React
- Webpack or similar for Electron main
- Asset bundling
- Code splitting
- Environment variable management

**DOD (Definition of Done):**

- [ ] Production build completes without errors
- [ ] Bundle size < 200MB
- [ ] No source maps in production
- [ ] Environment variables configured
- [ ] TypeScript strict mode passes

**Success Criteria:**

- npm run build succeeds
- Build output ready for packaging

---

### 6.2 macOS Packaging

**Deliverables:**

- DMG installer
- Code signing (optional but recommended)
- Auto-update configuration
- Icon and branding

**DOD (Definition of Done):**

- [ ] DMG builds successfully
- [ ] App runs on macOS 10.13+
- [ ] Code signing works (if applicable)
- [ ] Auto-update configured
- [ ] Icon displays correctly

**Success Criteria:**

- DMG file creates working app
- App is codesigned
- Auto-update works

---

### 6.3 Windows Packaging

**Deliverables:**

- NSIS installer
- Windows code signing (optional)
- Auto-update configuration
- Start menu shortcuts

**DOD (Definition of Done):**

- [ ] NSIS installer builds
- [ ] App runs on Windows 10+
- [ ] Uninstaller works
- [ ] Registry entries created properly
- [ ] Auto-update works

**Success Criteria:**

- EXE installer installs app
- App runs and behaves correctly
- Uninstall removes all files

---

### 6.4 Linux Packaging

**Deliverables:**

- AppImage or snap package
- .deb package (Debian/Ubuntu)
- Desktop file integration
- Auto-update configuration

**DOD (Definition of Done):**

- [ ] AppImage builds
- [ ] .deb builds
- [ ] Desktop integration works
- [ ] Auto-update configured
- [ ] Works on Ubuntu 20.04+

**Success Criteria:**

- AppImage runs standalone
- .deb installs and works
- Desktop launcher available

---

### 6.5 Auto-Update System

**Deliverables:**

- electron-updater integration
- Update check on startup
- Background update downloads
- User notification for updates

**DOD (Definition of Done):**

- [ ] Update server (or release artifacts) configured
- [ ] App checks for updates on startup
- [ ] Update downloads in background
- [ ] User prompted to install
- [ ] Rollback if update fails

**Success Criteria:**

- App detects new version
- Update installs and app restarts

---

### 6.6 Release & Distribution

**Deliverables:**

- GitHub Releases setup
- Version bumping automation
- Release notes
- Download links
- Checksum verification

**DOD (Definition of Done):**

- [ ] Release artifacts uploaded to GitHub
- [ ] Version bumped in package.json
- [ ] Release notes generated
- [ ] Checksums provided
- [ ] Download links public

**Success Criteria:**

- Release visible on GitHub
- Artifacts downloadable
- Version information correct

---

### PHASE 6 Verification Checklist

- [ ] Production build completes
- [ ] macOS DMG built and tested
- [ ] Windows installer built and tested
- [ ] Linux AppImage/deb built and tested
- [ ] Auto-update system works
- [ ] Release published on GitHub
- [ ] All platforms verified to work

---

## Cross-Phase Quality Gates

### Security Gate (After Phase 4)

- [ ] Security audit completed
- [ ] No hardcoded credentials
- [ ] No telemetry/tracking code
- [ ] Network isolation verified
- [ ] Input validation comprehensive
- [ ] Dependencies checked for vulnerabilities

### Performance Gate (After Phase 2)

- [ ] 100GB file upload tested
- [ ] Memory usage < 200MB during transfer
- [ ] 10+ concurrent uploads work
- [ ] Download with range requests works
- [ ] No memory leaks detected

### Usability Gate (After Phase 3)

- [ ] Desktop UI intuitive
- [ ] Mobile browser UI responsive
- [ ] All interactions smooth
- [ ] Error messages clear
- [ ] Recovery workflows documented

### Compatibility Gate (After Phase 5)

- [ ] Works on macOS 10.13+
- [ ] Works on Windows 10+
- [ ] Works on Ubuntu 20.04+
- [ ] Mobile browsers all supported
- [ ] Network discovery works on all platforms

---

## Technical Debt & Risk Mitigation

### High Risk Items

1. **Large File Handling** → Mitigated by mandatory streaming
2. **Resume Functionality** → Mitigated by chunk-based protocol
3. **Cross-Platform Packaging** → Mitigated by proven electron-builder
4. **Performance Under Load** → Mitigated by testing in Phase 2

### Technical Debt Tracking

- Document any shortcuts or TODOs during development
- Dedicate time in Phase 5-6 for tech debt
- No tech debt allowed to block release

---

## Testing Strategy

### Unit Tests (per phase)

- Phase 1: Infrastructure tests
- Phase 2: Transfer engine tests
- Phase 3: UI component tests
- Phase 4: Security tests
- Phase 5: Discovery tests

### Integration Tests

- End-to-end upload/download flows
- Cross-platform compatibility
- Recovery scenarios

### Performance Tests

- 100GB file transfer
- Memory usage profiling
- Concurrent transfer limits

---

## Success Criteria per Phase

### Phase 1: Foundation

✅ App launches, server runs, IPC works

### Phase 2: Transfer Engine

✅ 100GB file can be uploaded and downloaded

### Phase 3: UI

✅ Desktop and mobile UX is intuitive

### Phase 4: Security

✅ No data leaves local network, all inputs validated

### Phase 5: Discovery

✅ Easy to find app on network

### Phase 6: Release

✅ App packaged for all platforms, auto-updates work

---

## Resource Estimates

| Phase     | Duration     | Primary Focus          | Risk Level |
| --------- | ------------ | ---------------------- | ---------- |
| 1         | 2 weeks      | Setup & Infrastructure | Low        |
| 2         | 2 weeks      | Core Transfer Engine   | High       |
| 3         | 2 weeks      | UI & UX                | Medium     |
| 4         | 2 weeks      | Security & Recovery    | High       |
| 5         | 2 weeks      | Discovery & Polish     | Low        |
| 6         | 2 weeks      | Packaging & Release    | Medium     |
| **Total** | **12 weeks** |                        |            |

---

## Configuration Management Strategy

### All Limits as Configs

**Principle:** No hardcoded limits. All operational parameters must be configurable.

**Configuration Structure:**

```typescript
// /types/config.ts
export interface AppConfig {
  // File Transfer
  maxFileSize: number; // bytes (500GB initial)
  chunkSize: number; // bytes (8MB default)
  maxConcurrentUploads: number; // (10 default)
  maxConcurrentDownloads: number; // (20 default)

  // Server
  portRange: [number, number]; // [3000, 3999]
  bindAddress: string; // "0.0.0.0"

  // Storage
  storagePath: string; // app data dir
  tempChunkPath: string; // for in-progress uploads

  // Session
  sessionExpirationHours: number; // (24 default)

  // Rate Limiting
  requestsPerMinute: number; // (100 default)

  // Passwords (if enabled)
  argon2Options: {
    memoryCost: number;
    timeCost: number;
  };
}

// Load from: ~/.dropLAN/config.json or env vars
// Allow override via CLI flags
```

**Config Loading Priority:**

1. CLI flags (highest priority)
2. Environment variables
3. ~/.dropLAN/config.json
4. Defaults in code (lowest priority)

**Storage Locations:**

- macOS: `~/Library/Application Support/DropLAN/`
- Windows: `%APPDATA%\DropLAN\`
- Linux: `~/.config/DropLAN/`

---

## Decision Log - FINAL DECISIONS

✅ **DECIDED (Ready to Implement)**

1. **Password Hashing**: `argon2`
   - More secure than bcrypt, purpose-built for passwords (RFC 9106)
   - Easier to use: `npm install argon2`
   - Will be optional (user can enable if needed)

2. **Maximum File Size**: `500GB (configurable)`
   - Practical limit to prevent system strain
   - Configurable via config file for stress testing
   - Will stress test to find actual limits

3. **Concurrent Limits**: `10 uploads / 20 downloads (configurable)`
   - Configurable via config file
   - Can adjust based on machine specs

4. **mDNS**: `Deferred to Phase 7`
   - QR code already solves discovery problem
   - mDNS = automatic network detection (nice-to-have)
   - Not blocking MVP

5. **Background Daemon**: `Deferred to future release`
   - Not MVP requirement
   - Adds unnecessary complexity for Phase 1

6. **End-to-End Encryption**: `Deferred to Phase 7+`
   - LAN is trusted network
   - Encryption adds overhead
   - Can add later if needed

**Config values to track:**

- MAX*FILE_SIZE_BYTES = 500 * 1024 \_ 1024 \* 1024 (500GB)
- CHUNK*SIZE_BYTES = 8 * 1024 \_ 1024 (8MB)
- MAX_CONCURRENT_UPLOADS = 10
- MAX_CONCURRENT_DOWNLOADS = 20
- SESSION_EXPIRATION_HOURS = 24
- REQUESTS_PER_MINUTE = 100

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Confirm clarifications** listed above
3. **Refine Phase 1** with detailed task breakdown
4. **Set up repository structure** as defined
5. **Begin Phase 1 implementation**
