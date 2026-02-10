# VESTI

Local-first AI conversation memory hub. This repo contains a Plasmo extension
(core capture pipeline) plus a Next.js UI prototype and supporting docs.

## Key Principles
- Local-first: user data stays on device
- Layered architecture: core engine, state, UI are separable
- Type safety: explicit TypeScript types, avoid `any`
- Resilient UX: graceful error handling, defensive DOM assumptions
- Performance-aware: minimize work on high-frequency updates

## Repo Structure (high level)
- `frontend/` - Plasmo extension (capture pipeline, background/offscreen, content scripts)
- `Frontend_Polish/v0-chrome-extension-prototype/` - UI prototype (Next.js)
- `Backend_Trial/v0-core-engine/` - core engine library (parsers, observer, db)
- `documents/` - engineering docs and roadmap
- `architecture/` - system design notes

## Plasmo Extension (capture pipeline)
Quick start (PowerShell):
```
cd "frontend"
pnpm install
pnpm dev
```
Load the dev build from `frontend/build/chrome-mv3-dev` in Chrome.

## UI Prototype (Next.js)
Quick start (PowerShell):
```
cd "Frontend_Polish/v0-chrome-extension-prototype"
pnpm install
pnpm dev
```

## Notes
- This repo contains both the Plasmo extension and a UI prototype. They are
  intentionally separate while the integration is in progress.
- No cloud backend. All data is stored locally in IndexedDB.
