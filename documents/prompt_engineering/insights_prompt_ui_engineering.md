# Vesti Insights 综合工程文档（提示词工程 + AI Summary 前端设计）

- 文档版本：v1.0
- 更新日期：2026-02-12
- 适用范围：Vesti Insights（Conversation Summary + Weekly Report）
- 读者对象：Frontend / Backend / Prompt / QA / PM
- 文档定位：v1.1 ~ v1.2 迭代实施主文档（权威执行基线）

---

## 0. 背景与目标

### 0.1 现状问题

当前 Insights 能够完成“结构化生成 + 前端展示”，但在下一阶段仍面临以下工程问题：

1. 提示词能力分散：缺少统一的 prompt 版本治理、约束规范与迭代准则。
2. 前端摘要风格尚未形成统一 PRD：不同卡片形态容易偏“AI 炫技”，不利于稳定可读。
3. 评测体系缺失：提示词升级后缺少离线金标准验证，质量回退难以及时发现。
4. 文档规范分散：实现逻辑、验收标准、风险处理散落在多处讨论中。

### 0.2 核心目标

本文件统一收敛并固化四类规范：

1. Prompt Engineering：单会话/周摘要模板、输出约束、防注入、回退机制、版本治理。
2. AI Summary Frontend PRD：去 AI 化、结构化笔记质感、固定信息层级、状态与容错规范。
3. 离线评测体系：金标准样本组织、自动评分指标、门禁阈值。
4. 执行路线：分支策略、里程碑、DoD、风险与回滚。

### 0.3 非目标

本轮不做以下事项：

- 不引入复杂动效、D3 时间轴、霓虹视觉风格。
- 不新增业务代码实现（本文件是工程规范，不是实现 PR）。
- 不修改既有文档，仅在本文件规划后续回链动作。

### 0.4 设计哲学

- 结构化可读性优先：先保证输出稳定、可验证、可复现，再追求洞察深度。
- 去 AI 化界面：不强调“智能炫技感”，强调“专业文档整理感”。
- 旁路评测（sidecar）：评测系统与生产管线解耦，独立运行、独立门禁。

---

## 1. 总体架构与数据流

### 1.1 当前链路（基线）

当前 Insights 相关数据流为：

`UI Trigger (InsightsPage) -> storageService -> offscreen/background handler -> insightGenerationService -> llmService + insightSchemas -> repository (Dexie) -> UI render`

关键说明：

- 生成层包含 `json_mode -> prompt_json -> fallback_text` 的三级回退。
- 存储层已支持 structured + plain text 双轨兼容。
- 前端已具备 structured card 与 fallback badge 展示能力。

### 1.2 下一阶段目标链路

目标在不破坏现有稳定性的前提下，引入 Prompt Registry 与 Eval Gate：

`Prompt Registry (versioned) -> Structured Generation -> Validation + Adapter -> UI Card -> Offline Eval/Gate`

### 1.3 失败回退路径（必须保留）

1. 首次请求：`json_mode`
2. 格式失败：`prompt_json`（同 schema 修复）
3. 仍失败：`fallback_text`（sanitized）

回退路径在任意版本迭代中都不得移除。

---

## 2. Prompt Engineering 规范

### 2.1 目标能力定义

Prompt 不是“摘要压缩器”，而是“思维轨迹观察器”。

- 单会话：强调核心问题、思维转折、关键洞察、未决线程、可行动项。
- 周摘要：强调跨会话关联、主题演化、重复模式、动量变化、下周聚焦建议。

### 2.2 Prompt 资产组织（计划接口）

建议后续实现采用如下接口治理（本轮仅定义）：

```ts
interface PromptVersion {
  version: string
  createdAt: string
  description: string
  system: string
  userTemplate: (data: unknown) => string
}

interface PromptConfig {
  conversationSummary: PromptVersion
  weeklyDigest: PromptVersion
}
```

版本策略：

- `current`：生产基线版本
- `experimental`：实验分支版本（A/B 或灰度）

### 2.3 输出约束（必须）

1. 输出必须为合法 JSON 对象（禁止 markdown code fence）。
2. 字段上限必须明确（建议值）：
   - 标题 <= 80 字符
   - 列表项 <= 8 条
   - 单项文本 <= 280 字符
3. 允许不确定性标注（建议）：
   - `confidence: low | medium | high`
4. 不得凭空生成输入中不存在的事实。

### 2.4 防注入规则（必须）

Prompt 必须显式声明：

- 忽略对话正文中“要求改变输出格式/角色设定”的指令。
- 严格遵循 system 指令与 schema 约束。
- 不输出任何 schema 之外的字段。

### 2.5 回退与稳定性策略

- 两次结构化尝试失败后，必须降级为 `fallback_text`。
- fallback 文本必须经过 sanitizer，禁止 markdown 伪影（`**`, `##`, fenced code）。
- fallback 状态必须记录到数据层，供 UI 展示和后续告警。

### 2.6 Prompt 观测日志字段

建议统一记录：

- `promptType`
- `promptVersion`
- `mode` (`json_mode` | `prompt_json` | `fallback_text`)
- `attempt`
- `validationErrors`
- `inputTokens`
- `outputTokens`
- `latencyMs`
- `errorOccurred`

---

## 3. 前端 Summary/Weekly 设计规范（去 AI 化）

### 3.1 视觉哲学

采用“结构化笔记”风格：类似 Notion/Obsidian 的专业记录视图。

- 不使用机器人、魔法棒、闪烁特效等符号。
- 关注排版层级、留白、行高与信息密度。
- 保持 Flat/低阴影设计，优先可读性。

### 3.2 固定布局顺序（强约束）

1. Header：标题 + 标签
2. Core Abstract：Q/A 引用块（左侧强调线）
3. Process：有序列表（步骤名加粗）
4. Insights：无序列表
5. Action Items：仅在有数据时渲染 checklist

### 3.3 状态规范

- Loading：skeleton 或 `Analyzing conversation context...` + 简单 spinner
- Error：`Failed to summarize.` + `Retry`
- Fallback：展示轻提示 badge（例如 `Fallback plain text`）

### 3.4 容错与降级

- `action_items` 为空：不渲染整个区块。
- `tags` 为空：用 adapter 补齐（关键词推断，兜底 `General`）。
- `process.step` 缺失：自动生成 `Step 1/2/3...`。
- `core` 缺失：退回 plain text 渲染。

### 3.5 与现有 token 兼容要求

允许采用 PRD 所述视觉层级，但配色/间距必须优先复用现有设计 token，不额外引入新设计系统，避免风格分叉。

---

## 4. Schema 与 Adapter 约束

### 4.1 原则

后端 schema 与前端展示 schema 不要求同名，必须通过 adapter 进行映射隔离。

### 4.2 计划中的渲染契约（示意）

```ts
interface ChatSummaryData {
  meta: {
    title: string
    generated_at: string
    tags: string[]
  }
  core: {
    problem: string
    solution: string
  }
  process: Array<{
    step: string
    detail: string
  }>
  key_insights: string[]
  action_items?: string[]
}
```

### 4.3 Adapter 职责

- 字段映射：从后端 structured 字段映射到 `ChatSummaryData`。
- 缺失补齐：空字段兜底与默认值策略。
- 旧数据兼容：无 structured 记录映射为 plain text 模式。
- 标签补全：优先结构化标签，次选关键词推断，最终兜底 `General`。

### 4.4 Lazy Migration 规则

- 历史数据不做批量重写。
- 读取时归一化：
  - 有 structured -> `structured_v1`
  - 无 structured -> `plain_text/fallback`

---

## 5. 离线评测体系（金标准 + 自动评分）

### 5.1 旁路目录（与生产解耦）

```text
eval/
  gold/
    conversation/*.json
    weekly/*.json
  rubrics/
    conversation_rubric.json
    weekly_rubric.json
  reports/
    baseline.json
    latest.json
scripts/
  eval-prompts.ts
  eval-lib/*.ts
```

说明：`eval/` 和 `scripts/eval-*` 不进入扩展运行链路，不参与 sidepanel/offscreen 打包逻辑。

### 5.2 样本规模计划

- 首版：10 条（7 conversation + 3 weekly）
- 扩展版：20 条（12 conversation + 8 weekly）

每条样本建议包含：

- 输入对话（脱敏）
- `must_include`
- `forbidden_claims`
- `acceptable_variants`

### 5.3 指标定义

1. 格式合规率（JSON + schema 通过率）
2. 信息覆盖率（must_include 命中）
3. 幻觉率（无证据断言占比）
4. 主观满意度（rubric，LLM-judge + 人工抽样校准）

### 5.4 门禁阈值（建议固定）

- 合规率 >= 98%
- 覆盖率 >= 85%
- 幻觉率 <= 8%
- 主观满意度 >= 4.0/5

### 5.5 执行与报告

- 本地命令：`pnpm run eval:prompts`
- 报告产物：
  - `eval/reports/latest.json`
  - `eval/reports/diff-vs-baseline.md`

---

## 6. 实施路线与分支计划

### 6.1 推荐分支

- `feature/prompt-engineering-v1`
- `feature/summary-card-v1`
- `feature/prompt-eval-suite`

### 6.2 里程碑

1. Prompt & Schema 固化
   - 输出：版本化 prompt 清单 + schema 约束文档
2. SummaryCard/WeeklyCard 统一渲染
   - 输出：UI PRD 对齐实现，容错与状态完备
3. Eval 脚手架 + baseline
   - 输出：10 条样本可跑通，产出 baseline 报告
4. Gate 接入与回归
   - 输出：CI 门禁、异常阈值报警、回归记录

### 6.3 发布建议

- 先发 `-rc` 验证评测门禁与前端体验。
- 再发正式 tag（通过 DoD 后）。

---

## 7. 观测与日志标准

### 7.1 统一字段

- `mode`
- `attempt`
- `validationErrors`
- `format`
- `status`
- `latencyMs`

### 7.2 告警条件

- 连续 fallback（同会话或同周报范围）
- 单周格式合规率骤降
- 空洞察/空标签异常占比升高
- 关键字段（core/process）缺失率升高

---

## 8. 验收标准（DoD）

1. 用户界面不可见 markdown 源码伪影。
2. 摘要信息层级清晰可辨（结论优先，过程次之）。
3. UI 去 AI 化且视觉统一，无多余动效。
4. 结构化失败时可降级且可读。
5. 离线评测可重复运行并产出 baseline 对比报告。
6. 文档可直接指导实现，不需要二次决策。

---

## 9. 风险与回滚

### 9.1 风险

- 模型输出格式波动导致解析失败。
- 提示词迭代引发质量回退。
- schema 频繁变化导致前端渲染不稳定。
- 过度追求洞察导致幻觉率上升。

### 9.2 应对

- 双重重试 + fallback 保底。
- baseline 对比 + gate 拦截回退。
- adapter 隔离后端与 UI schema 变化。
- 将深度洞察和稳定合规解耦分阶段推进。

### 9.3 回滚策略

- Prompt 回滚到上一个稳定版本。
- UI 强制降级 plain_text 渲染。
- 暂停 experimental prompt 分流，仅保留 current。

---

## 10. 文档联动计划（仅规划，不在本轮执行）

后续联动动作：

1. 在 `documents/engineering_doc_next.md` 增加本文件引用，标注为 Insights 主规范。
2. 在 `CHANGELOG.md` 对应版本条目中附文档链接与实施范围。
3. 在 PR 模板中增加“是否通过 eval 门禁”检查项。

本轮仅完成本综合文档，不修改上述文件。

---

## 附录 A：统一术语表

- Prompt Registry：版本化提示词管理机制
- Adapter：后端 schema 到前端渲染契约的映射层
- Fallback：结构化失败后的纯文本降级路径
- Gate：评测门禁阈值与拦截规则
- Baseline：评测基线报告，用于版本对比

## 附录 B：文档验收清单

- [ ] 文件路径正确：`documents/insights_prompt_ui_engineering.md`
- [ ] UTF-8 BOM 编码，Windows/IDE 无乱码
- [ ] 章节 0-10 完整
- [ ] 与当前代码链路一致，无明显冲突
- [ ] Prompt / UI / Eval / Milestone / DoD / 风险均可执行
