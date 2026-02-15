# Changelog

All notable changes to this project will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/lang/zh-CN/).

版本控制流程说明见：[`documents/version_control_plan.md`](documents/version_control_plan.md)

---

## [Unreleased]

### Added
- N/A

### Changed
- N/A

### Fixed
- N/A

### Docs
- N/A

### Chore
- N/A

---

## [1.1.0-rc.4] - 2026-02-15

### Added
- Timeline conversation cards now support inline title rename with persistence (`Pencil`, `Enter/Blur` save, `Esc` cancel).
- Added dedicated `Data` tab in Dock with full Data Management panel.
- Added local telemetry action type `rename_title` for card action tracking.
- Added `unlimitedStorage` permission and storage limit helpers (`900MB` warning, `1GB` write block).
- Added export serializer layer for `json/txt/md` with unified payload (`content`, `mime`, `filename`).
- Added bundled serif assets: `frontend/public/fonts/TiemposHeadline-Medium.woff2`, `frontend/public/fonts/TiemposText-Regular.woff2`.

### Changed
- Settings page now keeps model access controls and links to Data Management instead of duplicating full data actions.
- Sidepanel typography contract tightened (`vesti-page-title`, `vesti-brand-wordmark`) with preload/fallback behavior.
- Export pipeline uses structured `EXPORT_DATA` format responses across runtime handlers.
- Release artifacts refreshed from commit `a9e1572`.

### Fixed
- Settings toggle thumb vertical alignment is center-locked (`44x24` track, `20x20` thumb, no Y-axis jitter).
- Duration utility ambiguity resolved to explicit transition duration syntax in key UI controls.

### Docs
- Added `documents/engineering_data_management_v1_2.md`.
- Updated `documents/prompt_engineering/insights_prompt_ui_engineering.md` to `v1.2-ui-pre.6`.
- Added UI guardrail section in `Frontend_Polish/frontend-prompting-system.md`.

### Release Artifact
- `release/Vesti_MVP_v1.1.0-rc.4.zip`
- `SHA256: B86BF1B8BC4064504D1CA850A4A80CCD8FEFAFD93E723635FD86E2D2D99F7AF6`
- Built at: `2026-02-15 21:38:32 +08:00`

---

## [1.0.0] - 2026-02-11

### Added
- MVP 基线发布（Local-First）
- ChatGPT / Claude 会话捕获、IndexedDB 存储、Sidepanel Timeline/Reader
- ModelScope 摘要与周报基础能力（MVP 范围）

### Notes
- `v1.0.0` 作为后续版本治理起点；从该版本之后，统一采用分支 + annotated tag 发布。

---

[Unreleased]: https://github.com/abraxas914/VESTI/compare/v1.1.0-rc.4...HEAD
[1.1.0-rc.4]: https://github.com/abraxas914/VESTI/releases/tag/v1.1.0-rc.4
[1.0.0]: https://github.com/abraxas914/VESTI/releases/tag/v1.0.0
