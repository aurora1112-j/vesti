# VESTI

Local-first AI conversation memory hub. This repo contains a Chrome side panel
prototype plus supporting docs and experiments.

## Key Principles
- Local-first: user data stays on device
- Layered architecture: core engine, state, UI are separable
- Type safety: explicit TypeScript types, no `any`
- Resilient UX: graceful error handling, defensive DOM assumptions
- Performance-aware UI: minimal work on high-frequency updates

## Repo Structure (high level)
- `Frontend Polish/` - UI prototypes and design prompts
- `Backend Trial/` - backend experiments (if any)
- `architecture/` - system design notes
- `documents/` - supporting docs

## Frontend Prototype
Path:
- `Frontend Polish/v0-chrome-extension-prototype`

Quick start (PowerShell):
```
cd "Frontend Polish/v0-chrome-extension-prototype"
pnpm install
pnpm dev
```

## Scripts (frontend prototype)
- `pnpm dev` - local dev server
- `pnpm build` - production build
- `pnpm lint` - lint checks

## Status
Prototype stage. UI is designed to be migratable to a real extension (e.g. Plasmo)
with a service layer swap.
