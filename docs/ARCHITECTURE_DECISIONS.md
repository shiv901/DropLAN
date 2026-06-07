# Architecture Decision Records (ADR)

This document records major architectural decisions for DropLAN.

Once a decision is approved, future implementations should follow it unless a new ADR supersedes it.

---

# ADR-001

Title: LAN-First Architecture

Status: Accepted

Date: 2026-05-31

## Context

The product aims to transfer files between nearby devices without cloud storage.

## Decision

DropLAN will operate LAN-first.

All file transfers occur directly between devices on the local network.

## Consequences

Benefits:

- Faster transfers
- Better privacy
- No storage costs
- Offline support

Tradeoffs:

- Devices must be reachable on the same network

---

# ADR-002

Title: Electron Desktop Application

Status: Accepted

## Context

Need support for:

- macOS
- Windows
- Linux

Need access to:

- local filesystem
- local networking
- background services

## Decision

Electron chosen.

## Why

Large ecosystem.

Strong TypeScript support.

Easy React integration.

Stable packaging.

## Rejected

Tauri

Reason:

Smaller ecosystem.

Higher learning curve.

---

# ADR-003

Title: React + TypeScript Frontend

Status: Accepted

## Decision

Frontend must use:

React

TypeScript

Strict mode enabled.

## Why

Developer familiarity.

Strong ecosystem.

Excellent Electron compatibility.

---

# ADR-004

Title: Express Server

Status: Accepted

## Decision

Express used for local HTTP server.

## Why

Simple.

Battle tested.

Large ecosystem.

Readable code.

## Rejected

Fastify

Reason:

Marginal performance benefits are irrelevant for LAN file transfers.

Maintainability preferred.

---

# ADR-005

Title: Streaming Transfers

Status: Accepted

## Decision

All uploads and downloads must use streams.

## Never

Read entire files into memory.

## Reason

Supports:

10GB+

100GB+

Low memory usage.

---

# ADR-006

Title: Chunk-Based Upload Protocol

Status: Accepted

## Decision

Uploads split into chunks.

Default chunk size:

8MB

## Reason

Supports:

resume

retry

partial recovery

progress tracking

---

# ADR-007

Title: SQLite Storage

Status: Accepted

## Decision

SQLite used for local metadata.

## Stores

transfers

files

sessions

settings

## Why

Zero setup.

Cross platform.

Reliable.

---

# ADR-008

Title: No Cloud Dependency

Status: Accepted

## Decision

No file data stored on external infrastructure.

## Allowed

Optional future signaling service.

## Forbidden

Cloud file storage.

---

# ADR-009

Title: Secure Electron Defaults

Status: Accepted

## Requirements

contextIsolation=true

sandbox=true

nodeIntegration=false

webSecurity=true

## Reason

Reduce attack surface.

---

# ADR-010

Title: QR-Based Discovery

Status: Accepted

## Discovery Priority

1. QR Code

2. Manual URL

3. mDNS

## Reason

Most reliable.

Least friction.

Works without special network support.

---

# ADR-011

Title: Browser-Based Clients

Status: Accepted

## Decision

No installation required on sender devices.

## Supported Clients

Android browsers

iOS browsers

Desktop browsers

## Reason

Lowest user friction.

---

# ADR-012

Title: Password Protection Optional

Status: Accepted

## Default

Trusted LAN mode.

## Optional

Password-protected sharing.

## Reason

Balance usability and security.

---

# ADR-013

Title: No Telemetry

Status: Accepted

## Decision

No analytics.

No tracking.

No user profiling.

No advertising.

## Reason

Privacy-first product.

# ADR-014

Title: Vite as Frontend Build System

Status: Accepted

## Context

DropLAN requires:

- Fast local development
- TypeScript support
- Electron compatibility
- Small build complexity
- Excellent React developer experience

## Decision

Frontend will use:

React + TypeScript + Vite

## Why

Benefits:

- Extremely fast startup
- Fast HMR
- Minimal configuration
- Excellent Electron integration
- Mature ecosystem
- Smaller and simpler than Webpack

## Rejected

Create React App

Reason:

Deprecated ecosystem.

Slow builds.

Poor long-term choice.

---

Next.js

Reason:

DropLAN is a desktop application.

Server-side rendering provides no meaningful value.

Adds unnecessary complexity.

---

Webpack

Reason:

More configuration.

Slower development experience.

No meaningful advantage for this project.

## Requirements

Frontend structure:

client/

src/

components/

features/

hooks/

services/

stores/

types/

utils/

App.tsx

main.tsx

## Build Commands

Development:

npm run dev

Production:

npm run build

Preview:

npm run preview

## TypeScript

Strict mode required.

No implicit any.

No disabled compiler checks.

## Styling

Preferred order:

1. Tailwind CSS
2. CSS Modules
3. Plain CSS

Avoid:

Styled Components

Reason:

Additional runtime overhead.

## State Management

Preferred order:

1. React Query (server state)
2. Zustand (client state)

Avoid Redux unless complexity justifies it.

## Result

Frontend stack is officially:

React
TypeScript
Vite
React Query
Zustand
Tailwind CSS
