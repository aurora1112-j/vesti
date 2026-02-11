---
name: vesti-parser-debugging
description: Claude/ChatGPT parser debugging SOP for role mismatch, AI response loss, duplicate messages, and ordering issues. Use to run sampling, root-cause analysis, fix strategy selection, and acceptance verification.
---

# Vesti Parser Debugging Skill

## Scope

当 Vesti 出现以下问题时使用本 Skill：
- 角色错配（例如 `user:3, ai:0/1`）
- AI 回复缺失
- 用户消息重复
- Sidepanel 顺序与网页顺序不一致

## Preconditions

- 在 `chrome://extensions` 仅保留一个 Vesti 实例。
- 在真实对话页复现问题（建议同时准备 1 个新会话 + 1 个受污染旧会话）。
- 打开 DevTools Console，确认 parser 日志可见。

## Step-by-step

1. **隔离环境**
   - 关闭其他同类扩展。
   - Reload 扩展并刷新页面。

2. **采样取证**
   - 运行 selector probe、testid histogram、anchor chain、top-vs-iframe 脚本。
   - 保存最新 parser stats + 1 张截图。

3. **根因归类**
   - selector miss（assistant 标识缺失）
   - content pollution（Thought/Show more/Done 混入）
   - mixed container role confusion
   - storage amplification（count-only 增量放大问题）

4. **策略修复**
   - assistant 标识不稳时，优先 `Anchor & Exclusion`。
   - action bar 稳定时，增加 copy-action reverse lookup。
   - selector 策略仅作为 fallback。
   - 存储层使用 signature compare + replace，修复旧会话污染。

5. **验收回归**
   - 检查角色分布、顺序、重复、正文清洁度。
   - 覆盖手动保存与自动捕获两条路径。

## Decision Table

| Condition | Primary Strategy | Secondary Strategy |
| --- | --- | --- |
| Assistant selector 稳定 | Role Selector | Anchor fallback |
| Assistant selector 缺失/classless | Anchor & Exclusion | Copy-action reverse |
| Thought 文本污染 | Text cleaning regex | Message content selector refinement |
| 重复写入 / 历史脏数据 | Signature compare + replace | Transactional full rewrite by uuid |

## Required Outputs per Debug Round

- 1 句症状描述
- 最新 parser stats 对象
- 1 份 DOM 证据包（dump + histogram）
- 1 张截图（可选但推荐）
- 本轮结论（改了什么、还剩什么）

## Acceptance Checklist

- [ ] 非空会话不再出现单边角色分布
- [ ] 解析消息数与页面气泡数接近
- [ ] 手动保存后无相邻重复
- [ ] AI 文本不含 `Thought for Ns` / `Show more` / `Done` 污染
- [ ] Sidepanel 顺序与网页顺序一致
- [ ] 手动保存和自动捕获都通过
