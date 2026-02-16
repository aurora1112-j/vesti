# Vesti v1.3 Platform Expansion Spec

Version: v1.3  
Status: Decision Complete (post-v1.2 execution target)  
Scope: Parser/Observer expansion + compatibility hardening + release gates

---

## 1. Summary

v1.3 extends capture coverage beyond ChatGPT/Claude and keeps v1.2 governance logic intact.  
Rollout is locked to two phases:

1. Phase 1: Gemini + DeepSeek
2. Phase 2: Doubao + Qwen

Each phase has independent implementation, QA, and release gate.

Current execution scope:
- Phase 1 (Gemini + DeepSeek) is complete on current baseline.
- This iteration executes **Phase 2 only** (Doubao + Qwen).
- It stays aligned with v1.2 strict identity policy:
  - no stable platform session ID => `held/missing_conversation_id`
  - force archive does not bypass missing ID.

---

## 2. Scope and Boundaries

### In scope
- New content script entries for new platforms.
- New parser modules per platform.
- Platform enum and UI token extension.
- Regression hardening for existing platforms.
- Phase-based release criteria.

### Out of scope
- Reworking capture governance decision engine from v1.2.
- Adding additional archive entry surfaces beyond already planned scope.
- New data schema migration for conversations/messages.

---

## 3. Platform Rollout Strategy (Locked)

## 3.1 Phase 1

### Gemini
- Domain matches:
  - `https://gemini.google.com/*`

### DeepSeek
- Domain matches:
  - `https://chat.deepseek.com/*`

Deliverable:
- Production-ready parser + observer integration for both platforms.

## 3.2 Phase 2

### Doubao
- Domain matches:
  - `https://www.doubao.com/*`

### Qwen
- Domain matches:
  - `https://chat.qwen.ai/*`

Deliverable:
- Production-ready parser + observer integration for both platforms.

## 3.3 Phase 2 execution profile (locked)

- Domain scope stays strict:
  - `https://www.doubao.com/*`
  - `https://chat.qwen.ai/*`
- UI platform theme is unified to six Metro colors:
  - ChatGPT `#10A37F`
  - Claude `#CC785C`
  - Gemini `#AD89EB`
  - DeepSeek `#0D28F3`
  - Qwen `#615CED`
  - Doubao `#1E6FFF`
- Phase2 reuses v1.2 capture governance and Step4 manual archive chain without protocol changes.

---

## 4. Platform Onboarding Contract (Mandatory Template)

Every new platform must implement all items below before merge.

## 4.1 Parser strategy stack

1. Primary: role-selector strategy
2. Fallback: anchor strategy
3. Text normalization + noise cleaning
4. Near-duplicate suppression

No platform can ship with selector-only strategy.

## 4.2 Parse stats contract

Each parse cycle must log:

```ts
{
  platform: Platform
  source: "selector" | "anchor"
  totalCandidates: number
  keptMessages: number
  roleDistribution: { user: number; ai: number }
  droppedNoise: number
  droppedUnknownRole: number
  durationMs?: number
}
```

## 4.3 Message validity constraints

- Message `role` must resolve to `user | ai`.
- Empty/whitespace-only content must be dropped.
- Parser must avoid input-box/toolbar/footer noise capture.

## 4.4 Session identity contract

Each parser must provide stable `sessionUUID` extraction:
- Prefer URL conversation ID.
- If unavailable, return `null` (no temporary fallback ID).
- Gatekeeper blocks persistence with `missing_conversation_id` until ID stabilizes.

---

## 5. File and Module Mapping

## 5.1 New content entrypoints

- `frontend/src/contents/gemini.ts`
- `frontend/src/contents/deepseek.ts`
- `frontend/src/contents/doubao.ts`
- `frontend/src/contents/qwen.ts`

## 5.2 New parser modules

- `frontend/src/lib/core/parser/gemini/GeminiParser.ts`
- `frontend/src/lib/core/parser/deepseek/DeepSeekParser.ts`
- `frontend/src/lib/core/parser/doubao/DoubaoParser.ts`
- `frontend/src/lib/core/parser/qwen/QwenParser.ts`

## 5.3 Shared parser utility extension

- Extend `frontend/src/lib/core/parser/shared/selectorUtils.ts` only for reusable helpers.
- Platform-specific heuristics stay inside platform parser module.

## 5.4 Type/UI expansion

- `frontend/src/lib/types/index.ts`:
  - `Platform` adds `Doubao | Qwen`
- UI updates:
  - `PlatformTag` styles for new platforms
  - any platform filter options in sidepanel views
- Tailwind/CSS tokens add:
  - `--doubao-bg/text/border`
  - `--qwen-bg/text/border`

---

## 6. Compatibility and Regression Rules

1. ChatGPT/Claude parsers cannot regress behavior or stats quality.
2. Existing capture settings and governance behavior from v1.2 must remain unchanged.
3. Existing data format (`conversations/messages`) remains backward compatible.
4. Existing timeline/reader/insights rendering continues to work for old records.

Regression baseline:
- Compare against latest stable logs from ChatGPT/Claude before each phase release.

---

## 7. Phase Release Gates

## 7.1 Technical gate per platform

- Parser detect accuracy: no false positive on unsupported pages.
- Capture success on standard conversation flow.
- Role distribution non-single-side in normal U-A sessions.
- No duplicate write amplification under repeated observer events.

## 7.2 QA gate per phase

- Minimum 12 manual sampled cases per phase:
  - 2 platforms x 3 modes x 2 scenarios (standard + edge)
- Required artifacts follow `manual_sampling_and_acceptance.md`.

## 7.3 No-Go conditions

- Blocker defect count > 0
- Role misclassification persistent in normal sessions
- Governance flow broken for force archive
- ChatGPT/Claude regression reproduced

---

## 8. Debug and Observability Requirements

Each new platform must expose:
- parser stats logs
- capture decision logs from v1.2 governance layer
- reason-coded failures (`detect_failed`, `role_unknown`, `empty_payload`, etc.)

Debug workflow must follow:
- `documents/capture_engine/capture_debugging_playbook.md`

---

## 9. Test Scenarios (Must Cover)

## 9.1 Per platform

1. Standard U-A-U-A conversation capture
2. Long answer with streaming updates
3. Edit/retry/re-generate message flow
4. Manual mode hold + force archive
5. Smart mode threshold crossing

## 9.2 Cross-platform regression

1. Existing ChatGPT + Claude sanity run
2. Sidepanel platform filter includes new values
3. Platform badge rendering for new values
4. Export JSON/TXT/MD includes new platform names safely

---

## 10. Implementation Sequence (v1.3)

1. Phase 1 parser/domain integration
2. Phase 1 manual QA and bug fixing
3. Phase 1 release
4. Phase 2 parser/domain integration
5. Phase 2 manual QA and bug fixing
6. Final v1.3 release and release-note merge

No cross-phase batching is allowed.

---

## 11. Explicit Assumptions

1. v1.2 governance engine is already released and stable before v1.3 starts.
2. Domain matching lists above are the initial production list for v1.3.
3. If a platform changes DOM structure, parser fallback and debug process are used; governance layer logic is unchanged.
