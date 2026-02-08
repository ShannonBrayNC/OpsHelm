# OpsHelm Governance Model

## 1. Purpose

OpsHelm uses AI assistance for code and content generation. The governance model exists to prevent:
- silent breaking changes during regeneration (“regen roulette”)
- accidental cross-workspace leakage (Whiteglove breach)
- insecure patterns (prompt injection, secret leakage, unsafe tooling)
- drifting behaviors (summaries change without explanation)

This governance system makes changes **auditable, reproducible, and enforceable**.

---

## 2. Governance Artifacts

### 2.1 Contract Registry (Design-time contract source of truth)
A versioned registry of function signatures and behavioral invariants for exported/public-facing code.

Stored in repo as:
- schema: `packages/schemas/contract-registry.schema.json`
- registry data: `services/agents/pm/contracts/contract-registry.json` (or `contracts/registry.json`)

Each contract entry includes:
- symbol (name + module path)
- language
- params/returns
- side effects
- stability: experimental | stable | deprecated
- owners and consumers
- test references (unit/contract/integration)

**Intent:** Treat exported functions as API contracts. AI can refactor internals, but contracts cannot drift silently.

---

### 2.2 Policy Decisions (Approval/Denial record for contract changes)
A Policy Decision is a JSON record that approves or denies a detected contract change.

Stored in repo as:
- schema: `packages/schemas/policy-decision.schema.json`
- decision artifacts: `services/agents/pm/decisions/<decisionId>.json`

A Policy Decision includes:
- decision: APPROVE | DENY | APPROVE_WITH_CONDITIONS
- reasons (human-readable)
- changes list (ContractChange entries)
- impacted consumers (best effort)
- required actions (tests, call site updates, security review, docs)

**Intent:** If a signature changes, the system must know *why*, and the decision must be explicit.

---

## 3. Governance Roles (Agents)

Governance is enforced by a PM agent system composed of specialized roles.

### 3.1 PM Orchestrator (Gatekeeper)
- consumes reports from other agents
- produces Policy Decision JSON
- blocks merges on BREAKING changes without approvals

### 3.2 ContractGuardian (Signature police)
- extracts contracts from code (AST-based)
- compares before/after with the registry
- emits contract diffs and severity labels:
  - SAFE | RISKY | BREAKING

### 3.3 TestSmith (Proof of correctness)
- requires test updates for contract changes
- blocks risky/breaking changes without tests
- ensures contract tests exist for stable exports

### 3.4 SecuritySentry (Safety + prompt-injection defense)
- flags:
  - prompt injection exposure
  - unsafe handling of untrusted email content
  - secrets leakage
  - over-permissive tool actions
  - cross-workspace mixing risks

### 3.5 Integrator (Migration + registry maintenance)
- updates call sites for approved changes
- updates registry version and deprecation metadata
- aligns docs and tests with approved changes

Prompt specs for each role live in:
- `services/agents/pm/prompts/`

---

## 4. Contract Change Classification Rules

ContractGuardian assigns severity:

### 4.1 BREAKING
- function removed
- function renamed
- required parameter removed or added
- parameter requirement changed (optional ↔ required)
- return type changed in a way that breaks callers
- side effects introduced/removed in a way that changes external behavior

### 4.2 RISKY
- default values changed
- error behavior changed
- ordering/format changes that could impact consumers
- side effects changed, but not strictly breaking

### 4.3 SAFE
- internal refactor with identical signature and behavior
- docs/comments changes only
- adding optional parameters with safe defaults
- performance improvements without behavior changes

---

## 5. Approval Policy

### 5.1 Default Policy
- SAFE: auto-approve (tests recommended but not mandatory)
- RISKY: approve only with tests and review notes
- BREAKING: deny unless:
  - a migration plan exists
  - impacted consumers are updated
  - tests are added/updated
  - registry updated and version bumped
  - if applicable, a deprecation plan exists

### 5.2 Deprecation Policy
Preferred lifecycle:
1. mark contract as `deprecated` with replacement symbol
2. allow a defined overlap window (e.g., 1–2 releases)
3. remove only after consumers are migrated and documented

---

## 6. CI / PR Enforcement (Design-time)

### 6.1 Required PR inputs
- Contract Impact must be declared in PR template:
  - None / SAFE / RISKY / BREAKING
- If RISKY or BREAKING:
  - attach or update a Policy Decision artifact
  - add/update tests

PR template is stored at:
- `.github/PULL_REQUEST_TEMPLATE.md`

### 6.2 Automated checks (Phase 2 target)
- Run contract extraction tool to emit c
