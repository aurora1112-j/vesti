# Changelog

All notable changes to this project will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/lang/zh-CN/).

版本控制流程说明见：[`documents/version_control_plan.md`](documents/version_control_plan.md)

---

## [Unreleased]

### Added
- 新增版本治理工程文档：`documents/version_control_plan.md`
- 在工程文档中补充分支/标签/发布流程入口与执行摘要

### Changed
- 版本控制策略从“单主分支 + 临时发布”升级为“Trunk-Based Lite + SemVer + pre-release”
- 后续发布要求 Git tag 与 `frontend/package.json` 版本号强绑定（发布前校验）

### Fixed
- N/A

### Docs
- 初始化 `CHANGELOG.md` 基线结构（含 `Unreleased` 与版本锚点）

### Chore
- N/A

---

## [1.0.0] - 2026-02-11

### Added
- MVP 基线发布（Local-First）
- ChatGPT / Claude 会话捕获、IndexedDB 存储、Sidepanel Timeline/Reader
- ModelScope 摘要与周报基础能力（MVP 范围）

### Notes
- `v1.0.0` 作为后续版本治理起点；从该版本之后，统一采用分支 + annotated tag 发布。

---

[Unreleased]: https://github.com/abraxas914/VESTI/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/abraxas914/VESTI/releases/tag/v1.0.0
