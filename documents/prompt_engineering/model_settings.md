# Vesti Model Access RFC (v1.2-pre.2)

- Document version: v1.2-pre.2
- Updated on: 2026-02-13
- Scope: Vesti Settings / Insights (Summary + Weekly)
- Audience: Frontend / Extension / Backend / QA / DevOps
- Positioning: v1.1 stable delivery + v1.2 research baseline

---

## Revision Notes (This Update)

This revision captures the latest alignment from the team:

1. v1.1 stable baseline switches from Qwen to `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`.
2. Proxy standard endpoint is now fixed to `POST /api/chat` (aligned with deployed Vercel proxy).
3. Streaming switch priority is upgraded to **P1.5** (higher than P2, lower than P0 stability work).
4. A formal `thinkHandlingPolicy` is introduced to handle `<think>...</think>` outputs safely.
5. This iteration is documentation-only. No implementation changes are included in this RFC update.

---

## 0. Context and Goals

### 0.1 Current context

- Vercel proxy has been deployed and verified with `POST /api/chat`.
- ModelScope support feedback indicates Qwen stability is volatile during release window.
- For early demo phase, reliability must be prioritized over maximum model novelty.

### 0.2 Goals

1. Keep v1.1 path stable and demo-ready.
2. Define v1.2 research path without destabilizing current behavior.
3. Keep Hybrid Access architecture and progressive-disclosure UX intact.
4. Add explicit policy for reasoning-tag (`<think>`) handling.

### 0.3 Non-goals

- No code changes in this document update.
- No message protocol renaming.
- No mandatory streaming rollout in v1.1.

---

## 1. Hybrid Architecture (unchanged)

### 1.1 Route by mode

- **Demo Mode (default):** `Extension -> Vercel Proxy -> ModelScope`
- **Custom Mode (BYOK):** `Extension -> ModelScope` (user key stored locally)

### 1.2 Security and trust boundary

1. Developer key is server-side only.
2. User BYOK key is not relayed through developer proxy.
3. Both routes remain bound to ModelScope gateway policy.

### 1.3 Endpoint standardization

- Standard proxy endpoint: `POST /api/chat`
- Previous `/api/vesti/chat` path is deprecated in RFC scope.

---

## 2. Dual-Track Strategy

### 2.1 v1.1 stable track (delivery first)

- Default model: `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`
- Non-stream baseline: `enable_thinking=false`
- Stable fallback chain remains: `json_mode -> prompt_json -> fallback_text`
- Objective: predictable demo stability and low operational risk

### 2.2 v1.2 research track

- Scope: capability detector + optional stream/reasoning
- Activation: feature-flag/policy controlled
- Default state: off unless explicitly enabled

### 2.3 Promotion gate (from stable to research expansion)

Suggested thresholds to increase v1.2 exposure:

1. format compliance >= 98%
2. fallback rate <= 8%
3. upstream error rate <= 3%
4. p95 latency <= 10s

If any threshold fails, route immediately back to v1.1 stable behavior.

---

## 3. Planned Interface Additions (Doc-only)

### 3.1 Existing planned fields retained

```ts
mode?: "demo_proxy" | "custom_byok"
proxyUrl?: string
gatewayLock?: "modelscope"
customModelId?: string
```

### 3.2 v1.2 planned fields

```ts
streamMode?: "off" | "on"                // default off
reasoningPolicy?: "off" | "auto" | "force" // default off
capabilitySource?: "model_id_heuristic" | "provider_catalog"
```

### 3.3 New planned output handling policy

```ts
thinkHandlingPolicy?: "strip" | "keep_debug" | "keep_raw" // default strip
```

Policy meaning:

- `strip`: remove `<think>...</think>` from user-facing output
- `keep_debug`: retain think content only in debug/log-safe channel
- `keep_raw`: retain full raw model output (debug-only, not default UI)

---

## 4. Capability Detector (v1.2 research)

### 4.1 Planned interface

```ts
detectModelCapability(modelId, opts?) => {
  tier,
  supportsReasoning,
  requiresStreamForReasoning,
  supportsJsonMode
}
```

`tier`: `general | reasoning | unknown`

### 4.2 Detection priority

1. provider catalog (when available)
2. model-id heuristic fallback

### 4.3 Guardrails

- `unknown` defaults to `general`
- do not enter reasoning mode from weak inference
- detection failure must not block stable request path

---

## 5. Payload Rules and State Machine

### 5.1 Payload construction rules

`buildInferencePayload(settings, capability, callContext)` must use conditional injection:

1. non-stream baseline: `enable_thinking=false`
2. reasoning params only when policy + capability + stream conditions are met
3. unsupported fields must be omitted (never send undefined noise)

### 5.2 Decision matrix

| Mode | reasoningPolicy | streamMode | capability tier | enable_thinking | route |
| --- | --- | --- | --- | --- | --- |
| demo_proxy | off | off | any | false | stable |
| demo_proxy | auto | off | any | false | stable |
| demo_proxy | auto | on | reasoning | true if allowed | candidate |
| custom_byok | off | off | any | false | stable |
| custom_byok | auto | on | reasoning | true if allowed | candidate |
| custom_byok | force | on | unknown/general | false (downgrade) | fallback stable |

### 5.3 State machine

```text
Stable(v1.1)
  -> Probe(v1.2 auto)
    -> ReasoningCandidate
      -> Success
      -> Fail -> FallbackStable
```

### 5.4 Fallback invariants

- Keep base chain: `json_mode -> prompt_json -> fallback_text`
- Any stream/reasoning failure must degrade to non-stream stable path

---

## 6. Progressive Disclosure UX (reinforced)

### 6.1 Default OFF (Demo Mode)

Show only ready state and confidence cues:

- green badge (`Demo Channel Active`)
- default model label (DeepSeek R1 Distill 32B)
- test action
- gateway lock text

Hide advanced config inputs in this state.

### 6.2 ON (Expert Mode)

Reveal advanced controls only when user opts in:

- model select/combobox
- API key input (masked)
- save + test actions
- non-editable gateway lock evidence

### 6.3 Visual priority

- Save = primary
- Test = secondary
- use lightweight transition only (no new animation libraries)

---

## 7. Priority Re-ordering (Roadmap)

### P0 (must-have now)

1. DeepSeek baseline model policy in docs
2. proxy endpoint standardization (`/api/chat`)
3. think handling policy definition
4. stable fallback guarantees and rollback criteria

### P1.5 (next, elevated)

1. streaming switch (feature flag)
2. stream state machine and rollback hooks
3. safe integration with fallback chain

### P2 (later)

1. deeper reasoning optimization
2. provider catalog-driven capability auto-detection
3. advanced tuning and experiment expansion

---

## 8. Observability and Alerts

### 8.1 Required fields

- `capabilityTier`
- `reasoningPolicy`
- `streamMode`
- `route`
- `mode`
- `fallbackStage`
- `upstreamStatus`

### 8.2 Alert conditions

1. reasoning branch failure spike
2. stream mode latency/timeout surge
3. abnormal ratio of unknown capabilities
4. sustained fallback stage escalation

---

## 9. Acceptance and Rollback

### 9.1 Documentation acceptance (this round)

- file exists at `documents/prompt_engineering/model_settings.md`
- baseline model is DeepSeek R1 Distill 32B
- endpoint standard is `/api/chat`
- includes think handling policy and P0/P1.5/P2 priority
- explicitly states docs-only scope

### 9.2 Future implementation acceptance

- demo mode remains stable
- stream off fully reproduces v1.1 stable behavior
- stream failures auto-degrade to non-stream stable path

### 9.3 Rollback strategy

- set `streamMode=off`
- set `reasoningPolicy=off`
- force stable route + stable payload rules

---

## Assumptions and Defaults

1. This round updates only `documents/prompt_engineering/model_settings.md`.
2. Proxy standard endpoint is `/api/chat`.
3. v1.1 stable default model is `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`.
4. Stream switch priority is P1.5.
5. Default UX priority is stability over visible reasoning trace.
6. No code/protocol implementation changes are included in this update.
