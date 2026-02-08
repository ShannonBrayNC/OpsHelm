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
