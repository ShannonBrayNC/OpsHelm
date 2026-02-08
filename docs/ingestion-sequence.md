# OpsHelm — Phase 1 Ingestion Runner Sequence

This document defines the deterministic execution flow for email and calendar ingestion in Phase 1.

The ingestion runner may be implemented as:
- a CLI command
- a scheduled job
- a manual trigger

Behavior must remain consistent regardless of trigger type.

---

## 1. Inputs

Required:
- workspaceId
- mailbox configuration for workspace
- allowed folders (optional)
- ticket source configuration
- last successful checkpoint (ProcessingState)

Optional:
- override start date (manual backfill)

---

## 2. High-Level Flow

1. Load workspace configuration
2. Load last checkpoint
3. Pull new messages/events from Graph
4. Classify messages
5. Extract ticket fields
6. Normalize entities
7. Record exceptions
8. Update ProcessingState
9. Emit ingestion summary

---

## 3. Detailed Steps

### Step 1: Load Workspace Configuration
- Resolve:
  - mailbox identity
  - allowed folders
  - ticket source patterns
  - branding identity (for later use)
- Validate workspaceId exists

**Fail-fast**
- If workspace config is missing → abort run

---

### Step 2: Load ProcessingState
Retrieve:
- lastSuccessfulRun timestamp
- delta tokens (if supported)
- lastProcessedMessageId (if needed)

If no state exists:
- initialize state
- mark run as initial bootstrap

---

### Step 3: Pull Data from Microsoft Graph

#### Mail
- Query:
  - Inbox
  - workspace-approved folders
  - Sent Items
- Filter:
  - receivedDateTime > lastSuccessfulRun
- Limit:
  - reasonable batch size (configurable)

#### Calendar
- Pull:
  - upcoming meetings (configurable window)
  - recently modified meetings

---

### Step 4: Classify EmailEvents

For each message:
- Assign category:
  - Ticket
  - Meeting
  - SentSummary
  - Internal
  - Noise
  - Other
- Produce classification confidence score

Store:
- EmailEvent record (even if Noise)

---

### Step 5: Extract Ticket Fields

If category == Ticket:
- Apply ticket source patterns (ordered):
  1. ServiceNow patterns (if configured)
  2. ConnectWise patterns (if configured)
- Extract:
  - ticketId
  - customer (if possible)
  - priority/severity signals
  - status cues (waiting on, blocked, etc.)
- Extract asks and promises
- Extract due dates

If ticketId not found or confidence < threshold:
- route to Exceptions

---

### Step 6: Normalize Entities

#### EmailEvent
- Always stored

#### Ticket
- Upsert by (workspaceId, ticketId)
- Update:
  - lastCustomerTouch
  - lastInternalTouch
  - status bucket
  - risk flags
  - nextAction

#### Task
- Create or update when:
  - ask detected
  - promise detected
  - ticket stale threshold exceeded

#### Commitment
- Create/update when promise language detected
- Set reminder metadata

---

### Step 7: Exception Handling

Exceptions include:
- low-confidence classification
- missing ticketId
- conflicting signals
- parse failures

Store:
- Exception record linked to EmailEvent
- Reason code and details

Never drop messages silently.

---

### Step 8: Update ProcessingState

Record:
- run start/end timestamps
- message counts:
  - processed
  - classified
  - exceptions
- coverage percentage
- new checkpoint values

Mark run as successful only if:
- normalization completed
- state written successfully

---

### Step 9: Emit Ingestion Summary

Produce:
- runId
- workspaceId
- counts
- exception summary
- duration

Expose summary to:
- logs
- Portal (Inbox Intelligence page)

---

## 4. Idempotency Rules

- Re-running ingestion for same window must not duplicate:
  - EmailEvents
  - Tickets
  - Commitments
- Upserts keyed by:
  - messageId (EmailEvent)
  - (workspaceId, ticketId)
  - deterministic commitment hash

---

## 5. Safety Rules

- Treat email content as untrusted input
- Do not execute or render scripts from email bodies
- Do not send emails
- Do not cross workspace boundaries
- Do not modify ticket systems

---

## 6. Phase 1 Definition of Done

- Inbox coverage visible in Portal
- Exceptions queue populated correctly
- Tickets reliably tracked via email alone
- No missed ticket updates in daily workflow
- Ingestion behavior is deterministic and explainable
