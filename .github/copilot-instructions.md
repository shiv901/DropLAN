# DropLAN – GitHub Copilot Instructions

## Project Overview

DropLAN is a secure local-network file transfer application.

Primary goal:

Enable any device on the same network to upload or download files through a browser without cloud storage, accounts, or external dependencies.

Target platforms:

- macOS
- Windows
- Linux

Client platforms:

- Android
- iPhone
- Windows
- macOS
- Linux

Communication occurs entirely on the local network by default.

No file data may pass through external servers.

---

# Core Product Principles

1. Simplicity first.
2. Security by default.
3. LAN-first architecture.
4. No user accounts.
5. No cloud storage.
6. No telemetry.
7. No analytics.
8. No tracking.
9. Large file support.
10. Recoverable transfers.

Every feature must support at least one of these principles.

---

# Tech Stack

## Desktop

Electron

## Frontend

React
TypeScript
Vite
TanStack Query
Zustand
Tailwind CSS

## Backend

Node.js
Express

## Realtime

Socket.IO

## QR Codes

qrcode

## File Operations

fs/promises
streams

## Validation

zod

## Testing

Vitest

---

# Architecture

Desktop App

Electron launches:

1. React UI
2. Express server
3. Socket server

Architecture:

UI
↓
IPC
↓
Electron Main Process
↓
Express Server
↓
Transfer Engine

Never expose Node APIs directly to React.

Always use preload scripts.

Use contextBridge.

---

# Electron Security Rules

Mandatory:

contextIsolation = true

sandbox = true

nodeIntegration = false

webSecurity = true

enableRemoteModule = false

Never disable any of these.

Never inject user HTML.

Never use eval.

Never use Function() constructor.

Never use dangerousInnerHTML.

---

# Local Server Rules

Bind to:

0.0.0.0

Port:

Auto-select available port.

Preferred range:

3000-3999

Display actual port in UI.

---

# Discovery

Support:

1. QR Code
2. Manual URL
3. mDNS / Bonjour discovery

Example:

http://192.168.1.10:3120

Generate QR automatically.

---

# File Transfer Requirements

Support:

- Single file
- Multiple files
- Folder upload
- Folder download
- Drag and drop
- Clipboard paste

Maximum file size:

Unlimited

Implementation must use streams.

Never load entire files into memory.

---

# Upload Requirements

Uploads must:

- Stream directly to disk
- Show progress
- Show speed
- Show ETA

Never buffer full uploads.

Use chunked streaming.

---

# Download Requirements

Downloads must:

- Support HTTP range requests
- Support pause
- Support resume

Required headers:

Accept-Ranges

Content-Length

Content-Disposition

---

# Transfer Engine

Every transfer must have:

transferId
fileName
fileSize
bytesTransferred
startedAt
completedAt
status

Statuses:

pending
uploading
paused
completed
failed
cancelled

Use UUIDs.

---

# Resume Support

Transfers must survive:

- browser refresh
- temporary disconnect
- WiFi reconnection

Store transfer metadata locally.

Never restart completed chunks.

---

# Security Model

Default mode:

LAN only

Reject requests originating outside local subnets.

Allow:

10.x.x.x

172.16.x.x - 172.31.x.x

192.168.x.x

Reject all others.

---

# Authentication

Generate temporary session token.

Minimum length:

128 bits entropy

Use crypto.randomBytes.

Never use timestamps.

Never use Math.random.

---

# Optional Protection

User may enable:

Password Protected Sharing

Passwords:

argon2 hash

Never store plaintext.

---

# Upload Validation

Validate:

filename
extension
size
path

Reject:

path traversal
null bytes
invalid filenames

Always sanitize filenames.

Use secure generated storage paths.

Never trust client filenames.

---

# File Storage

Store uploads in:

Application Managed Storage

Never write directly to arbitrary user paths.

Move files only after validation.

---

# Rate Limiting

Required.

Per IP:

100 requests/minute

Upload endpoints:

10 concurrent uploads

---

# Network Abuse Protection

Reject:

- oversized headers
- malformed multipart requests
- invalid content lengths

Log suspicious activity.

---

# Logging

Levels:

info
warn
error

Never log:

passwords
tokens
file contents

---

# Privacy Rules

DropLAN must never:

- upload user files externally
- collect analytics
- collect telemetry
- fingerprint users

---

# UI Design

Design goals:

- Minimal
- Fast
- Desktop-native feel

Main screen:

Share Files
Share Folder
Receive Files

Visible:

QR Code
IP Address
Port
Transfer Queue

---

# Transfer Queue

Each transfer shows:

Filename
Progress
Speed
ETA
Status

Actions:

Pause
Resume
Cancel
Retry

---

# Mobile Browser UI

Responsive.

Must work on:

Android Chrome
Safari iOS

Avoid desktop-only interactions.

---

# Error Handling

Never show raw exceptions.

Show:

human-readable error
technical details in logs

---

# Testing Requirements

Minimum:

Unit Tests
Integration Tests

Required coverage:

Transfer Engine
Upload Validation
Authentication
Resume Logic

---

# Performance Targets

10GB transfer must not exceed:

200MB memory usage

Streaming is mandatory.

---

# Code Quality Rules

TypeScript strict mode required.

No any types.

No ignored errors.

No disabled lint rules.

Every public function:

- typed
- documented

Prefer composition over inheritance.

---

# Future Features

Design architecture to support:

- WebRTC mode
- Internet relay mode
- End-to-end encryption
- Shared folders
- Automatic device discovery
- Background service mode

Do not implement these unless explicitly requested.

---

# Copilot Behavior

When generating code:

1. Prioritize security over convenience.
2. Use streaming over buffering.
3. Use TypeScript types everywhere.
4. Prefer established libraries.
5. Avoid custom cryptography.
6. Follow OWASP recommendations.
7. Avoid Electron anti-patterns.
8. Generate production-grade code.
9. Assume files may exceed 100GB.
10. Never sacrifice security for shorter code.
