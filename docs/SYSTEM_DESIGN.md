# DropLAN System Design

## High Level Architecture

+------------------+
| Electron App |
+------------------+
|
+------------------+
| React Frontend |
+------------------+
|
IPC
|
+------------------+
| Main Process |
+------------------+
|
+------------------+
| Express Server |
+------------------+
|
+------------------+
| Transfer Engine |
+------------------+
|
+------------------+
| Local Storage |
+------------------+

---

# Components

## Electron Main

Responsibilities:

- Launch application
- Manage server lifecycle
- Generate QR code
- Expose secure IPC

---

## React Frontend

Responsibilities:

- Display transfer queue
- Display QR code
- Show settings
- Manage UI state

No filesystem access.

No network server logic.

---

## Express Server

Responsibilities:

- Upload endpoints
- Download endpoints
- Health checks
- Session management

---

## Transfer Engine

Responsibilities:

- Stream uploads
- Stream downloads
- Resume uploads
- Progress tracking

This is the heart of the system.

---

# Storage Structure

AppData/

uploads/

incoming/

shared/

metadata/

sessions/

logs/

transfers.db

---

# Upload Flow

Browser

↓

POST /upload/init

↓

Create Transfer

↓

Receive Transfer ID

↓

Upload Chunks

↓

Persist Chunks

↓

Verify Integrity

↓

Mark Complete

---

# Download Flow

Browser

↓

GET /download/{id}

↓

Validate Access

↓

Open Stream

↓

Support Range Requests

↓

Stream To Client

---

# Chunking Strategy

Default chunk size:

8 MB

Configurable:

4 MB - 32 MB

Reasons:

- Resume support
- Better memory control
- Recovery from failures

---

# Transfer State Machine

pending

↓

starting

↓

uploading

↓

paused

↓

uploading

↓

completed

or

failed

or

cancelled

---

# Session Model

Session

id

deviceName

ipAddress

createdAt

expiresAt

token

All sessions expire automatically.

---

# Authentication

Anonymous Mode:

Allowed on trusted LAN.

Protected Mode:

Password required.

Authentication Token:

crypto.randomBytes(32)

Expiration:

24 hours

---

# Discovery System

Priority Order:

1. QR Code
2. Manual URL
3. mDNS Discovery

Failure of discovery must never prevent manual connection.

---

# Security Controls

Validate:

- file size
- content length
- filename
- mime type

Reject:

- path traversal
- invalid headers
- malformed multipart requests

---

# Logging

Store:

transfer start

transfer complete

transfer failed

Store no file contents.

Store no passwords.

---

# Future Architecture

Potential modules:

WebRTC Engine

Internet Relay

End-to-End Encryption

Shared Workspaces

Background Service

These must remain decoupled from Transfer Engine.

---

# API Design

POST /upload/init

POST /upload/chunk

POST /upload/complete

GET /download/:id

GET /files

GET /status

GET /health

GET /session

---

# Database

SQLite

Tables:

transfers

files

sessions

settings

devices

No ORM initially.

Use raw SQL or lightweight query layer.

---

# Failure Recovery

Persist transfer metadata immediately.

Persist chunk metadata immediately.

Crash recovery:

Reconstruct state from metadata.

Resume incomplete transfers automatically.
