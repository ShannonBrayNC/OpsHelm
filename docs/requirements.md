Technical requirements spec
1.1 Product goal

Build an Email-Native Ops Console that ingests Outlook mail (Microsoft Graph), extracts ticket + meeting + task + promise signals, and produces:

a daily runway (today’s tasks and priorities),

customer queue daily briefs (button push, branded),

meeting prep briefs,

promise tracking with reminders, and

quarterly/year accomplishments (review-ready).

System must support Whiteglove workspaces so that Parex and ParkPlace (ServiceNow) remain strictly separated in email ingestion, branding, templates, and data storage.

1.2 Non-goals (for POC)

No automatic sending of emails. The system generates drafts for approval.

No direct ServiceNow/ConnectWise API integration in POC (email parsing is source of truth).

No full mobile app in POC (responsive web only).

2) Core concepts
2.1 Workspace

A Workspace is a hard boundary that controls:

Mailbox source (Parex vs ParkPlace mailbox or identity context)

Allowed folders / rules

Ticket parsing patterns (ConnectWise vs ServiceNow)

Customer branding options and templates

Output identity (From name, signature, disclaimers)

Data partitioning key (workspaceId) and optional separate database

Acceptance: No data entity may be created/queried without a workspaceId.

2.2 Customer Theme (branding)

A Theme defines:

Logo URL

Colors (primary/secondary/accent/background/card/text)

Label aliases (e.g., “Severity” vs “Priority”, “Case” vs “Ticket #”)

Footer/disclaimer text blocks for exports

Optional voice template for email drafts

Acceptance: Every export (HTML/PDF/DOCX) is branded from Theme + Workspace identity.

2.3 Ticket Source

A TicketSource is an extraction profile:

type: email_parser

subject/body regex for ticket identifiers

parsing rules for metadata and standard fields

Acceptance: ConnectWise-style numeric tickets and ServiceNow-style IDs (INC/REQ/RITM/CHG/TASK) are supported via configurable patterns.

3) Data model (minimum viable)

Entities stored with evidence links and confidence scores:

EmailEvent: message metadata + classification + extracted fields + confidence + evidence links

Ticket: ticket state, last touches, next action, risk flags, evidence pointers

Task: next actions derived from email/ticket/meeting

Commitment: promises extracted from sent mail and/or replies

MeetingPrep: meeting details + prep brief + open loops

Artifact: scripts/reports/briefs produced + link + impact metrics

Impact: hours saved estimates, risk reduced, outcomes

Acceptance: Every derived object must reference at least one evidence email/event.

4) Functional requirements
4.1 Ingestion and classification

Ingest from Outlook via Graph:

Inbox + configured folders

Sent Items (for promise mining and accomplishments)

Calendar events (for meeting prep)

Classify each EmailEvent:

ConnectWise Ticket, ServiceNow Ticket, Meeting, SentSummary, Internal, Noise, Other

Extract:

ticket ID, customer, status/priority signals, asks, promises, due dates

Track processing coverage:

processed vs unprocessed

exception queue (low-confidence classification, missing ticketId, parse failures)

Acceptance:

“Inbox Coverage Meter” and “Exceptions Queue” are present and functional.

System never silently drops unparsed mail; it goes to Exceptions.

4.2 Task generation (Today’s Runway)

Generate a prioritized list of actions for the day:

derived tasks from asks/promises/stale tickets/upcoming meetings

each task has due, ETA estimate, and evidence links

Provide “Focus Mode” view for execution.

Acceptance: One-click “Generate runway” produces tasks with evidence links.

4.3 Ticket triage board

Board columns:

New | Waiting on Customer | Waiting on Me | In Progress | Risk

Ticket cards include:

ID, customer, priority/severity, queue, last touch age, next action

risk flags and reason

Acceptance: Search, filter, and “Open” ticket drill-in work in POC.

4.4 Customer Queue Daily Brief (button push)

For a selected customer and queue scope:

Produce daily summary for all open tickets in your queue:

Top risks

Stale tickets (configurable threshold)

Waiting on customer vs waiting on you

What changed since yesterday (diff section)

Draft update emails (optional output)

Output modes:

Internal Ops, Technical, Exec

Export:

HTML / Markdown (POC), PDF/DOCX later

Acceptance: “Generate Daily Brief” produces a preview + export artifact entry.

4.5 Meeting Prep Studio

Show upcoming meetings

Generate prep brief:

changes since last meeting

open loops (tickets + promises per attendee)

decisions required

Generate outputs:

agenda draft

customer update email

post-meeting recap template

Acceptance: One-click “Generate Prep Brief” creates a prep artifact and links evidence.

4.6 Promise Tracker

Mine promises from Sent Items and outbound messages

Track due dates and risk

Reminders:

due soon, overdue, escalation schedule

Draft “promise update” emails with correct workspace branding

Acceptance: Promise items include evidence links and can be converted to tasks.

4.7 Accomplishments generator (quarter/year)

Generate review-ready bullet list with metrics:

tickets touched/closed

artifacts delivered

hours saved estimates (ROI)

risk reductions / customer outcomes

Output tones:

Performance Review, Exec Update, Resume bullets

Acceptance: Generates a structured “wins” section for the selected time window.

4.8 Whiteglove enforcement

Workspace isolation:

separate ingestion config

separate theme sets

separate storage partition

UI guardrail banner:

“Whiteglove Mode” indicates ParkPlace identity and export branding

Acceptance: No cross-workspace customer theme leakage; theme list is filtered by workspace.

5) Quality attributes and guardrails

Evidence-first: Every summary has clickable receipts (emails/threads).

Auditability: AI outputs have confidence + “why” explanation.

No side effects without approval: drafts only; user approves send.

Performance: rules/folder allow-lists minimize noise processing.

Security:

protect secrets

redact sensitive content in logs

prompt injection defenses (retrieved email content treated as untrusted)

6) POC UI pages (must exist)

Command Center

Customer Brief

Ticket Triage

Meeting Prep

Promise Tracker

Inbox Intel

Accomplishments

Settings (Workspace identity + branding controls)
