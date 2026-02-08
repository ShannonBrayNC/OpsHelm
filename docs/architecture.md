# OpsHelm Architecture

## 1. Overview

OpsHelm is an **Email-Native Ops Console** composed of:
- a **Portal UI** (React) for daily operation,
- an **Ingestion layer** that pulls Outlook mail/calendar via Microsoft Graph and parses ticket signals,
- an **Ops data store** that holds normalized entities (tickets, tasks, commitments, artifacts),
- an **Agent system** that generates briefs, prep packs, and drafts with strict guardrails,
- a **Governance layer** that prevents AI-driven breaking changes via a Contract Registry and Policy Decisions.

The system is explicitly designed around **Workspace isolation** (Whiteglove) so partner identities and sources never mix.

---

## 2. Repository Layout

Minimal-work workspaces structure:

OpsHelm/
├─ apps/
│ └─ portal/ # React UI (POC pages)
├─ packages/
│ └─ schemas/ # JSON schemas (contracts/policy)
├─ services/
│ ├─ ingestion/ # Graph pull, parsing, normalization (Phase 1+)
│ └─ agents/ # PM + content agents (Phase 1+)
├─ docs/
│ ├─ requirements.md
│ ├─ milestones.md
│ └─ architecture.md
└─ .github/workflows/ci.yml



---

## 3. Core Components

### 3.1 Portal (apps/portal)
**Responsibilities**
- Workspace switch (Parex vs ParkPlace) with guardrail banner
- Theme switch (customer branding) filtered by workspace
- Pages:
  - Command Center (Runway, Urgency Ribbon, Meetings)
  - Ticket Triage Board
  - Customer Brief generator (Phase 2 output)
  - Meeting Prep Studio
  - Promise Tracker
  - Inbox Intelligence (coverage + exceptions)
  - Accomplishments generator
  - Settings (workspace identity + branding controls)

**Does not**
- Send emails automatically
- Perform direct ticket system API calls (POC)

---

### 3.2 Ingestion Service (services/ingestion)
**Responsibilities**
- Microsoft Graph ingestion:
  - Mail: inbox + allowed folders + sent items
  - Calendar: events
- Message classification:
  - Ticket / Meeting / SentSummary / Internal / Noise / Other
- Ticket extraction per workspace source rules:
  - ConnectWise: numeric IDs
  - ServiceNow: INC/REQ/RITM/CHG/TASK patterns
- Normalize into core entities:
  - EmailEvent, Ticket, Task, Commitment, MeetingPrep stubs, Artifact
- Maintain Inbox Coverage + Exceptions queue

**Key constraint**
- All writes must include `workspaceId`.

---

### 3.3 Ops Store
Storage holds normalized operational state, not raw attachments by default.

**Minimum tables/collections**
- EmailEvent
- Ticket
- Task
- Commitment
- MeetingPrep
- Artifact
- Impact
- ProcessingState (checkpoints, last run timestamps, coverage stats)

**POC-friendly options**
- SQLite (fast local), later Postgres/Azure SQL
- Partition by `workspaceId` (and optionally separate DB files per workspace for extra safety)

---

### 3.4 Agent System (services/agents)
Agents generate outputs and enforce safety rules. Outputs are evidence-backed artifacts (HTML/MD now, PDF later).

**Content agents**
- DailyRunwayAgent
- CustomerBriefAgent
- MeetingPrepAgent
- PromiseMiningAgent
- AccomplishmentsAgent
- DraftEmailAgent (drafts only)

**Governance agents**
- PM Orchestrator (policy decision output)
- ContractGuardian (signature diffs)
- TestSmith (test coverage enforcement)
- SecuritySentry (prompt-injection + unsafe patterns)
- Integrator (call site updates, registry updates)

---

### 3.5 Governance Layer (packages/schemas + services/agents/pm)
**Core artifacts**
- Contract Registry (versioned)
- Policy Decision (approve/deny/conditions)

**Policy goal**
Prevent “regen roulette”:
- No breaking changes without recorded approval + migration plan + tests
- Contract diffs are required for exported symbols

---

## 4. Data Flow (High-Level)

### 4.1 End-to-end pipeline

1) Ingestion reads mail/calendar (Graph)
2) Classifier tags messages
3) Extractor identifies ticket IDs + key fields
4) Normalizer updates Ops Store entities
5) Portal queries Ops Store to show dashboards
6) Agents generate outputs (briefs, prep packs, drafts)
7) Artifacts stored and linked back to evidence

---

## 5. Trust Boundaries and Isolation

### 5.1 Workspace Isolation (Whiteglove)
Workspace is the primary boundary:
- Separate mail source configuration
- Separate ticket parsing rules
- Separate branding identity (From name/signature/footer)
- Separate theme allow-list
- Data partition key required everywhere

**Hard rule**
- No cross-workspace joins, exports, or drafts.

### 5.2 Untrusted content handling
Email bodies and attachments are untrusted input.
- Treat as data, not instructions
- Avoid direct tool actions based on raw content
- Prefer extraction to structured fields first

---

## 6. Architecture Diagrams (Mermaid)

### 6.1 Component diagram

```mermaid
flowchart LR
  subgraph UI[Portal (React)]
    A1[Workspace Switch + Guardrail]
    A2[Pages: Runway, Triage, Briefs, Prep, Promises, Inbox Intel]
  end

  subgraph ING[Ingestion Service]
    B1[Graph Pull: Mail + Calendar]
    B2[Classifier]
    B3[Ticket Extractors<br/>ConnectWise + ServiceNow]
    B4[Normalizer]
  end

  subgraph STORE[Ops Store]
    C1[(EmailEvent)]
    C2[(Ticket)]
    C3[(Task)]
    C4[(Commitment)]
    C5[(MeetingPrep)]
    C6[(Artifact + Impact)]
    C7[(ProcessingState)]
  end

  subgraph AGENTS[Agent System]
    D1[DailyRunwayAgent]
    D2[CustomerBriefAgent]
    D3[MeetingPrepAgent]
    D4[PromiseMiningAgent]
    D5[AccomplishmentsAgent]
    D6[DraftEmailAgent<br/>Drafts Only]
  end

  subgraph GOV[Governance / PM]
    E1[Contract Registry]
    E2[Policy Decisions]
    E3[ContractGuardian]
    E4[TestSmith]
    E5[SecuritySentry]
    E6[Integrator]
  end

  A2 -->|Query| STORE
  B1 --> B2 --> B3 --> B4 --> STORE
  AGENTS -->|Read| STORE
  AGENTS -->|Write artifacts| STORE
  GOV -->|Gates changes| AGENTS
  GOV -->|Gates changes| ING
  GOV -->|Gates changes| UI

6.2 Ingestion pipeline (email to ticket/task)

flowchart TD
  M[Microsoft Graph: Mail] --> CL[Classify EmailEvent]
  CL --> EX[Extract fields + ticketId]
  EX -->|low confidence| Q[Exceptions Queue]
  EX --> N[Normalize entities]
  N --> EE[(EmailEvent)]
  N --> T[(Ticket)]
  N --> K[(Task)]
  N --> P[(Commitment)]
  N --> PS[(ProcessingState)]

6.3 Workspace isolation boundary

flowchart LR
  subgraph W1[Workspace: Parex]
    M1[Mailbox/Folders Parex]
    S1[Ticket Sources: ConnectWise]
    D1[(Data Partition: workspaceId=parex)]
    O1[Outputs: Parex identity + themes]
  end

  subgraph W2[Workspace: ParkPlace (Whiteglove)]
    M2[Mailbox/Folders ParkPlace]
    S2[Ticket Sources: ServiceNow via email]
    D2[(Data Partition: workspaceId=parkplace)]
    O2[Outputs: ParkPlace identity + themes]
  end

  M1 --> S1 --> D1 --> O1
  M2 --> S2 --> D2 --> O2

  X[Hard Rule: No cross-workspace reads/writes/exports]
  D1 --- X --- D2


7. Key Interfaces (Contracts)
7.1 Ingestion API surface (internal)

ingest_mail(workspaceId, sinceToken) -> IngestionResult

classify_email(event) -> Classification

extract_ticket_fields(event, workspaceConfig) -> ExtractedFields

upsert_ticket(workspaceId, ticketId, fields) -> Ticket

record_exception(workspaceId, eventId, reason)

All must remain stable once marked stable in the Contract Registry.

7.2 Agent API surface (internal)

generate_runway(workspaceId, date) -> Artifact

generate_customer_brief(workspaceId, customerId, scope, mode) -> Artifact

generate_meeting_prep(workspaceId, meetingId) -> Artifact

mine_promises(workspaceId, window) -> [Commitment]

generate_accomplishments(workspaceId, window, tone) -> Artifact

8. Deployment and Runtime (POC and future)
8.1 POC (local-first)

Portal: local dev server (Vite)

Ingestion: CLI or scheduled script (manual trigger)

Store: SQLite file(s) partitioned by workspace

8.2 Future (Azure-friendly)

Portal: Azure Static Web Apps

Ingestion: Azure Functions / Container App

Store: Azure SQL / Postgres

Secrets: Key Vault

Auth: Entra ID / OAuth (Graph)

9. CI/CD and Governance Gates
9.1 CI (initial)

Build portal

Run basic lint/tests if present

9.2 Governance gates (Phase 2)

Contract extraction step (artifact)

Contract diff vs registry

If BREAKING: require Policy Decision artifact and migration updates

Security checks:

secrets scan

unsafe patterns scan (prompt injection boundaries)

10. Operational Observability

Minimum operational signals in Ops Store:

Last ingestion run per workspace

Processed/unprocessed counts

Exceptions by category

“Coverage %” trend

Portal must display:

Coverage meter

Exceptions queue entrypoint

Last sync timestamps

11. Architectural “Never Do” List

Never auto-send email without explicit approval.

Never allow workspace identity to be inferred implicitly; it must be selected or explicit.

Never mix data across workspaces in queries, exports, or drafts.

Never let raw email content directly drive tool actions without sanitization and policy gates.

Never accept breaking signature changes without a recorded Policy Decision.





