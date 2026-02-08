# OpsHelm Governance Runbook (Phase 1 — Manual Enforcement)

## 1. Purpose
Phase 1 governance is **manual but real**: it prevents breaking contract drift and workspace boundary violations before CI automation exists.

This runbook defines the required steps for:
- every PR
- every AI-assisted regeneration
- any change to exported functions

---

## 2. Required Repo Files
Ensure these exist in `main`:

- `docs/governance.md`
- `packages/schemas/contract-registry.schema.json`
- `packages/schemas/policy-decision.schema.json`
- `services/agents/pm/contracts/contract-registry.json`
- `services/agents/pm/tools/extract_contracts.py`
- `.github/PULL_REQUEST_TEMPLATE.md`

---

## 3. The “Contract Safety” Checklist (every PR)

### Step A — Declare Contract Impact
In the PR description (template), select one:
- None
- SAFE
- RISKY
- BREAKING

If you’re unsure, default to **RISKY**.

---

### Step B — Run Contract Extraction (before pushing)
From repo root:

```bash
python services/agents/pm/tools/extract_contracts.py . > /tmp/contracts.extracted.json

python services/agents/pm/tools/extract_contracts.py . | Out-File -Encoding utf8 .\contracts.extracted.json

## Step C — Compare Extracted Contracts vs Registry (Manual, Phase 1)

In Phase 1, perform a manual diff:

- Search extracted output for affected symbols.
- Confirm:
  - Exported function names haven’t changed
  - Required parameters haven’t changed
  - Return types haven’t changed (when specified)
  - Side effects haven’t expanded without documentation

If the change is anything other than **SAFE**, you must create a **Policy Decision** artifact.

---

## 4. Creating a Policy Decision (When Required)

A Policy Decision is required when:

- Contract impact is **RISKY** or **BREAKING**
- Workspace isolation boundaries are affected
- Security posture changes (tools, permissions, untrusted content handling)

### Step A — Create Decision File

Create:
services/agents/pm/decisions/<decisionId>.json



Use the policy schema and include:

- `decision` (APPROVE / DENY / APPROVE_WITH_CONDITIONS)
- `reasons`
- `changes` list with severity and diff
- `requiredActions`

### Step B — Minimum Required Content for BREAKING Approvals

If approving **BREAKING** changes, you must include:

- Migration plan
- Impacted consumers
- Tests covering new behavior
- Rollback notes

If any are missing, the decision **must be DENY**.

---

## 5. “Never Break” Invariants (Release Blockers)

These are non-negotiable. Any violation requires **DENY**.

### 5.1 Workspace Isolation

- All reads/writes/exports include `workspaceId`
- No cross-workspace joins or exports
- Themes filtered by workspace
- Evidence links never cross workspaces

### 5.2 No Auto-Send

- Generated emails are drafts only
- No sending or external side effects without explicit approval

### 5.3 Evidence-First

- Summaries and briefs include evidence links
- Low-confidence parsing goes to **Exceptions**, never dropped

---

## 6. Manual Review Flow (Recommended)

For each PR:

1. **ContractGuardian**
   - Identify changed exports and signatures
   - Label severity SAFE / RISKY / BREAKING

2. **TestSmith**
   - Confirm tests exist for RISKY / BREAKING changes

3. **SecuritySentry**
   - Verify safe handling of untrusted content
   - Ensure no secrets in logs
   - Confirm no cross-workspace mixing risk

4. **PM Orchestrator**
   - Write Policy Decision artifact if required
   - Approve / deny / approve with conditions

---

## 7. Versioning the Contract Registry

When approved changes alter contracts:

- Bump `registryVersion`
  - Patch for SAFE
  - Minor for RISKY
  - Major for BREAKING
- Update `updatedAt`
- Update affected contract entry (or add new one)

---

## 8. Definition of Done — Phase 1 Governance

Phase 1 is complete when:

- Contract Registry exists and is used for review
- Policy Decisions are created when required
- BREAKING changes never land without justification
- Workspace isolation and no-auto-send invariants are consistently upheld

**Phase 2** will automate these checks in CI.


---

## Optional (but very helpful) tiny helper: policy decision template
If you want a starter decision template file you can copy each time, say so and I’ll paste a “blank but valid” `decision-template.json` that conforms to the schema.

Next, if you want to accelerate implementation: I can generate the **first GitHub Issues** for Phase 1 (ingestion runner + store + portal wiring), aligned to these contracts, so Codex/agents can work without ambiguity.
::contentReference[oaicite:0]{index=0}

