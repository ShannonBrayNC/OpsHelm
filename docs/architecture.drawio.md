# OpsHelm Architecture — draw.io Diagram Guide

This section describes how to recreate the OpsHelm architecture diagram in draw.io (or similar tools).
Each heading represents a swimlane or grouped container.

---

## Lane 1: User / Operator

### Box: Operator (You)
- Uses OpsHelm Portal
- Reviews drafts and summaries
- Approves outputs (no auto-send)

Arrow:
- Operator → Portal (manual actions)

---

## Lane 2: Portal UI (apps/portal)

### Group: OpsHelm Portal (React)

Boxes inside:
- Workspace Switch + Guardrail Banner
- Command Center (Runway + Urgency Ribbon + Meetings)
- Ticket Triage Board
- Inbox Intelligence
- Meeting Prep Studio
- Promise Tracker
- Accomplishments Generator
- Settings (Workspace + Branding)

Notes:
- Theme selector is filtered by Workspace
- No direct external system calls

Arrows:
- Portal → Ops Store (read queries)
- Portal → Agent System (generate requests)

---

## Lane 3: Ingestion Service (services/ingestion)

### Group: Ingestion Pipeline

Boxes (top to bottom):
1. Graph Connector
   - Mail (Inbox + allowed folders)
   - Sent Items
   - Calendar

2. Email Classifier
   - Ticket
   - Meeting
   - SentSummary
   - Internal
   - Noise

3. Ticket Extractors
   - ConnectWise (numeric)
   - ServiceNow (INC/REQ/RITM/CHG/TASK)

4. Field Extractor
   - customer
   - priority/severity
   - asks
   - promises
   - due dates

5. Normalizer
   - maps to core entities
   - enforces workspaceId

6. Exceptions Router
   - low confidence
   - parse failures

Arrows:
- Graph Connector → Classifier → Extractors → Normalizer → Ops Store
- Extractors → Exceptions Router → Ops Store

---

## Lane 4: Ops Store (Data Layer)

### Group: Ops Store

Boxes:
- EmailEvent
- Ticket
- Task
- Commitment
- MeetingPrep
- Artifact
- Impact
- ProcessingState

Rules (annotation):
- Every row includes workspaceId
- No cross-workspace joins
- Evidence links stored, not raw content

Arrows:
- Ingestion → Ops Store (write)
- Agents → Ops Store (read/write)
- Portal → Ops Store (read)

---

## Lane 5: Agent System (services/agents)

### Group: Content Agents

Boxes:
- DailyRunwayAgent
- CustomerBriefAgent
- MeetingPrepAgent
- PromiseMiningAgent
- AccomplishmentsAgent
- DraftEmailAgent (Drafts only)

Behavior:
- Read Ops Store
- Generate artifacts
- Attach evidence links
- No side effects

Arrows:
- Agents → Ops Store (write Artifacts)
- Portal → Agents (invoke)

---

## Lane 6: Governance & PM System

### Group: Governance

Boxes:
- Contract Registry
- Policy Decisions
- ContractGuardian
- TestSmith
- SecuritySentry
- Integrator

Rules:
- Governs code changes, not runtime behavior
- Blocks breaking changes without approval
- Produces Policy Decision artifacts

Arrows:
- Governance → CI / PR flow
- Governance → Agents / Ingestion / Portal (design-time gates)

---

## Lane 7: External Systems (Boundary)

### Boxes:
- Microsoft Graph
- ConnectWise (email notifications)
- ServiceNow (email notifications)

Boundary Rule:
- Email + calendar only in Phase 1
- No direct API writes

---

## Global Annotations

- 🔒 Workspace isolation is a hard boundary
- 📎 Evidence-first everywhere
- ✋ No auto-send
- 📜 Contracts > regeneration
