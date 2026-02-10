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

## MVP Scope (platform support)
Back-end capture in MVP is limited to ChatGPT and Claude. Gemini and DeepSeek
remain as UI buttons/placeholders only and do not connect to parsing or storage.

Platform support matrix:
| Platform | MVP Backend Capture | UI Button |
| --- | --- | --- |
| ChatGPT | Yes | Yes |
| Claude | Yes | Yes |
| Gemini | No (UI-only) | Yes |
| DeepSeek | No (UI-only) | Yes |


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

## MVP Guide
See `documents/mvp_guide.md` for MVP ??????????Sidepanel??????ModelScope ?????????


## ZIP ????????Chrome?
1) ?? `release/Vesti_MVP.zip` ?????
2) ?? `chrome://extensions/`
3) ?????????
4) ??????????????
5) ??**???????**??? `manifest.json` ?????

??????????????????????????????????????


## Notes
- This repo contains both the Plasmo extension and a UI prototype. They are
  intentionally separate while the integration is in progress.
- No cloud backend. All data is stored locally in IndexedDB.
