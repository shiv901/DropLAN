# DropLAN Product Requirements Document (PRD)

## Vision

DropLAN enables secure file transfers between devices on the same network using only a browser on the sender side.

Users should be able to:

1. Open DropLAN desktop app.
2. Scan QR code.
3. Upload or download files.
4. Complete transfers without accounts, cloud storage, or complicated setup.

Target user experience:

"Faster and simpler than cloud sharing."

---

# Primary Users

## Individual Users

Transfer files between:

- Android → Mac
- Android → Windows
- iPhone → Mac
- Windows → Mac
- Linux → Windows

## Families

Shared file drop box on home network.

## Small Teams

Quick transfer of documents and media inside office LAN.

---

# Non Goals

Not intended for:

- Cloud storage
- Long-term file hosting
- Team collaboration
- Version control
- Public internet file sharing

---

# Core Features

## Receive Files

Desktop app accepts uploads from browsers.

Requirements:

- Single file upload
- Multi-file upload
- Folder upload
- Drag-and-drop upload
- Progress indication

Priority: P0

---

## Download Files

Users can download shared files from browser.

Requirements:

- File browser
- Download links
- Folder download as ZIP

Priority: P0

---

## QR Code Access

Desktop app displays:

- QR Code
- URL
- Device name

Priority: P0

---

## Transfer Queue

Display:

- File name
- File size
- Progress
- Speed
- ETA
- Status

Priority: P0

---

## Resume Transfers

Interrupted uploads must resume.

Priority: P1

---

## Device Discovery

Automatic discovery using mDNS.

Priority: P1

---

## Password Protection

Optional.

Priority: P1

---

## Shared Folder Mode

Continuous file sharing from selected folder.

Priority: P2

---

# User Stories

## Story 1

As an Android user

I want to upload a 5GB video

So that I can move it to my laptop without cloud storage.

Success Criteria:

Transfer completes without memory spikes.

---

## Story 2

As a Mac user

I want a QR code

So that devices can connect instantly.

Success Criteria:

Scan to upload within 10 seconds.

---

## Story 3

As a user

I want transfers to resume after WiFi interruptions

So that large uploads do not restart.

Success Criteria:

Resume from last completed chunk.

---

# Security Requirements

Files never leave local network.

No analytics.

No telemetry.

No external dependencies required for transfer.

Password protection optional.

Rate limiting mandatory.

Path traversal prevention mandatory.

---

# Performance Requirements

Upload:

100GB+

Memory usage:

<200MB during transfer

Concurrent uploads:

Minimum 10

Concurrent downloads:

Minimum 20

---

# Accessibility

Keyboard navigable.

Screen reader compatible.

Responsive mobile layout.

---

# Success Metrics

Upload start time < 3 seconds

Transfer failure rate < 1%

Transfer resume success > 95%

Zero cloud dependency

Zero user account requirement
