# DropLAN Docs

This folder contains living documentation for the DropLAN project. These files are the **canonical, up-to-date** references:

| File | Contents |
|---|---|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | What DropLAN is, tech stack, non-goals |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Package layout, runtime modes, communication layers |
| [DECISIONS.md](./DECISIONS.md) | Why key decisions were made (and what was rejected) |
| [SETUP.md](./SETUP.md) | Install, dev, build, package commands |
| [API.md](./API.md) | All HTTP endpoints + Socket.IO events |
| [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) | Full annotated directory tree |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | React state, Zustand stores, server stores, IPC contract |
| [SECURITY.md](./SECURITY.md) | Auth model, threat model, what is/isn't protected |
| [DEBUGGING.md](./DEBUGGING.md) | Common issues + curl commands |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Active bugs, parked issues, fixed issues |
| [TODO.md](./TODO.md) | Prioritised feature backlog |
| [CHANGELOG.md](./CHANGELOG.md) | Notable changes by version |

---

## Documentation Policy

Documentation is part of the implementation — not an afterthought.

**Every significant change must include:**

- Updates to the relevant doc(s) above (architecture change → `ARCHITECTURE.md`, new endpoint → `API.md`, etc.)
- An entry in `CHANGELOG.md` under the current version
- An update to `TODO.md` if work is added or completed
- An update to `DECISIONS.md` if the reasoning behind a decision changes
- Removal of any documentation that is no longer accurate — stale docs are worse than no docs
