# OpsHelm — Delivery Milestones

This document defines phased delivery milestones for OpsHelm.  
Each phase is scoped to produce **visible, demoable value** while minimizing rework and risk.

---

## Phase 0 — Foundation (Setup & Guardrails)

**Objective:** Establish a stable, governed development environment before feature velocity increases.

### Deliverables
- GitHub repository initialized (`OpsHelm`)
- Minimal Node workspaces configured
- Folder structure established:
  - `apps/portal`
  - `packages/schemas`
  - `services/agents`
  - `docs/`
- Contract Registry schema committed
- Policy Decision schema committed
- PM Agent prompt specifications committed
- CI pipeline enabled (build-only)

### Acceptance Criteria
- Repo builds successfully on every push/PR
- Contract and policy schemas are versioned in GitHub
- PR template enforces contract impact disclosure
- No production features yet; scaffolding only

---

## Phase 1 — Operational Awareness (POC / Daily Driver)

**Objective:** Replace manual inbox triage with a trusted daily operational cockpit.

This phase must already save measurable time.

### Functional Scope

#### 1. Email Ingestion (Microsoft Graph)
- Ingest:
  - Inbox
  - Workspace-approved folders
  - Sent Items
  - Calendar events
- Classify messages:
  - Ticket / Meeting / SentSummary / Internal / Noise
- Extract ticket IDs via workspace configuration
- Track processing coverage and exceptions

#### 2. Core UI Pages (POC)
- Command Center
- Ticket Triage Board
- Inbox Intelligence
- Promise Tracker
- Meeting Prep
- Settings (Workspace + Branding)

#### 3. Today’s Runway
- One-click generation of daily tasks derived from:
  - ticket asks
  - promises
  - stale tickets
  - upcoming meetings
- Evidence links required for each task

#### 4. Ticket Triage Board
- Buckets:
  - New
  - Waiting on Customer
  - Waiting on Me
  - In Progress
  - Risk
- Ticket cards with:
  - ID, customer, priority/severity
  - last touch age
  - next action
  - risk reason

#### 5. Promise Mining (Baseline)
- Extract promises from Sent Items
- Track due dates and risk
- Manual reminder review (no auto-send)

#### 6. Whiteglove Workspace Support (Baseline)
- Separate Parex and ParkPlace workspaces
- ServiceNow ticket ID patterns enabled
- Workspace-scoped branding and identity
- Guardrail banner indicating active workspace

### Governance Scope
- Contract Registry populated manually for core functions
- Contract extraction tool runs manually (POC)
- Policy Decision artifacts created for breaking changes

### Acceptance Criteria
- Daily workflow can be run end-to-end from OpsHelm
- Inbox coverage is visible
- No missed tickets when email is the source of truth
- You can demo OpsHelm as a **personal daily command center**

---

## Phase 2 — Customer Output & Time Leverage

**Objective:** Turn operational awareness into customer-facing and review-ready outputs.

This is where hours are reclaimed at scale.

### Functional Scope

#### 1. Customer Queue Daily Briefs
- One-click generation for a selected:
  - workspace
  - customer
  - queue/scope
- Includes:
  - open ticket summary
  - top risks
  - stale tickets
  - waiting on customer vs waiting on team
  - **diff since last brief**
- Output modes:
  - Internal Ops
  - Technical
  - Executive
- Export:
  - HTML
  - Markdown
  - PDF (optional)
- Branded per workspace and theme

#### 2. Meeting Prep Studio (Expanded)
- Meeting history awareness
- “What changed since last meeting”
- Decision prompts
- One-click generation of:
  - agenda
  - update email draft
  - post-meeting recap

#### 3. Promise Tracker (Automated)
- Reminder scheduling:
  - upcoming
  - due today
  - overdue escalation
- Draft promise updates with receipts
- Convert promises into tasks automatically

#### 4. Accomplishments Generator
- Quarterly and yearly rollups:
  - tickets handled
  - artifacts delivered
  - promises kept
  - proactive saves
  - estimated hours saved
- Output tones:
  - Performance Review
  - Executive Summary
  - Resume Bullets

#### 5. Log Analyzer & Tool Integration
- Link tickets to:
  - log analyzer outputs
  - scripts and diagnostics
- Include artifacts in briefs and accomplishments

### Governance Expansion
- Contract extraction automated in CI
- Contract diffs required on PRs
- PM Agent enforces:
  - breaking change approvals
  - migration plans
  - test requirements

### Acceptance Criteria
- Daily customer brief is a button push
- Review season output is a button push
- Manual summarization effort reduced by >50%
- OpsHelm becomes your **primary work interface**

---

## Phase 3 — Autonomous Assistance (Optional / Future)

**Objective:** Move from “assistant” to “trusted operator.”

### Candidate Capabilities
- Predictive risk alerts (before tickets escalate)
- Suggested next actions ranked by impact
- Draft escalation strategies
- Auto-generated follow-ups pending approval
- Cross-customer pattern detection

### Hard Rule
- No autonomous external actions without explicit approval gates

---

## Success Metrics (All Phases)

- Inbox coverage ≥ 95%
- Zero missed ticket updates when email is source
- Time spent on daily prep reduced by ≥ 50%
- Review prep time reduced from days → minutes
- Customer-facing outputs require minimal editing

---

## Guiding Principle

> If OpsHelm cannot explain *why* something matters, it must show the receipts.

Evidence beats confidence.
