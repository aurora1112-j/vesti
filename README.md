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
See `documents/mvp_guide.md` for MVP 功能说明、使用步骤（Sidepanel / 实时捕获 / ModelScope 摘要）与交付指引。

## ZIP 交付物使用说明（Chrome）
1) 解压 `release/Vesti_MVP.zip` 到任意目录
2) 打开 `chrome://extensions/`
3) 开启「开发者模式」
4) 点击「加载已解压的扩展程序」
5) 选择**解压后的文件夹**（确保 `manifest.json` 在根目录）

提示：如果解压后先看到一个子文件夹，请进入该文件夹再加载，避免“套娃”错误。

## Notes
- This repo contains both the Plasmo extension and a UI prototype. They are
  intentionally separate while the integration is in progress.
- No cloud backend. All data is stored locally in IndexedDB.
