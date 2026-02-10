# OpsHelm

**Steering chaos into calm waters**

An Email-native Ops Console that ingests Outlook mail via Microsoft Graph to extract ticket, meeting, task, and promise signals. Produces daily runways, customer queue briefs, meeting prep, promise reminders, and quarterly/yearly accomplishments. Supports fully isolated Whiteglove workspaces.

## Features

### Core Capabilities
- ✉️ **Email Ingestion**: Connects to Microsoft Outlook via Graph API
- 🔍 **Signal Extraction**: Automatically identifies tickets, meetings, tasks, and promises
- 🏢 **Workspace Isolation**: Fully isolated environments for different clients (e.g., Parex, ParkPlace)
- 📊 **Daily Operations**: Generates daily runway reports for operational visibility
- 👥 **Customer Queues**: Creates prioritized customer queue briefs
- 📅 **Meeting Prep**: Automated meeting preparation documents
- ⏰ **Promise Tracking**: Reminds about commitments and deadlines
- 🎯 **Accomplishments**: Quarterly and yearly accomplishment reports

### POC Exclusions
This proof-of-concept intentionally excludes:
- Auto-send functionality (reports are generated but not emailed)
- Direct ServiceNow/ConnectWise API integration
- Mobile apps

## Architecture

```
OpsHelm/
├── src/
│   ├── core/              # Core signal extraction logic
│   ├── services/          # External service integrations (Microsoft Graph)
│   ├── models/            # Data models and types
│   ├── generators/        # Report generators
│   ├── utils/             # Utility functions
│   └── index.ts           # Main application
├── config/                # Configuration files
├── output/                # Generated reports (created at runtime)
└── .env                   # Environment configuration
```

## Setup

### Prerequisites
- Node.js 18+ and npm
- Microsoft 365 account with app registration
- Azure AD tenant with appropriate permissions

### 1. Clone and Install

```bash
git clone https://github.com/ShannonBrayNC/OpsHelm.git
cd OpsHelm
npm install
```

### 2. Configure Microsoft Graph API

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Name: "OpsHelm"
4. Register the application
5. Note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** > **New client secret**
7. Create a secret and note the value
8. Go to **API permissions** > **Add a permission**
9. Select **Microsoft Graph** > **Application permissions**
10. Add these permissions:
    - `Mail.Read` (Read mail in all mailboxes)
    - `User.Read.All` (Read all users' full profiles)
11. Grant admin consent for your organization

### 3. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Microsoft Graph API Configuration
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# Email Configuration
MAILBOX_EMAIL=your-mailbox@company.com

# Workspace Configuration
WORKSPACES={"Parex":"parex","ParkPlace":"parkplace"}

# Output Configuration
OUTPUT_DIR=./output
```

### 4. Build

```bash
npm run build
```

## Usage

### Daily Processing

Run the daily workflow to process today's emails and generate all reports:

```bash
npm start
# or
npm run dev  # for development mode
# or
node dist/index.js daily
```

This generates:
- `output/YYYY-MM-DD/daily-runway.md` - Daily runway report
- `output/YYYY-MM-DD/customer-queue-*.md` - Customer queue briefs per workspace
- `output/YYYY-MM-DD/meeting-prep.md` - Meeting preparation documents
- `output/YYYY-MM-DD/promise-reminders.md` - Promise reminders

### Quarterly Report

Generate a quarterly accomplishment report:

```bash
node dist/index.js quarterly
```

### Yearly Report

Generate a yearly accomplishment report:

```bash
node dist/index.js yearly
```

## Workspace Isolation

OpsHelm supports fully isolated "Whiteglove" workspaces for different clients. Each workspace is identified by a prefix in email subjects or sender addresses.

Configure workspaces in `.env`:

```env
WORKSPACES={"ClientA":"clienta","ClientB":"clientb","ClientC":"clientc"}
```

The system will:
- Automatically classify emails into workspaces
- Generate separate customer queue reports per workspace
- Track accomplishments separately by workspace
- Maintain complete isolation between clients

## Signal Types

### 1. Tickets
Extracted from emails containing support/issue keywords:
- ticket, issue, problem, bug, error, support, help, incident, case

**Extracted Data:**
- Ticket ID (e.g., TICKET-123)
- Priority (critical, high, medium, low)
- Status (open, in-progress, resolved, closed)
- Customer information

### 2. Meetings
Extracted from emails containing meeting-related keywords:
- meeting, call, discussion, sync, standup, review, presentation, demo

**Extracted Data:**
- Meeting time
- Location
- Attendees
- Agenda

### 3. Tasks
Extracted from emails containing task keywords:
- todo, task, action item, deliverable, complete, finish, assignment

**Extracted Data:**
- Assignee
- Due date
- Completion status

### 4. Promises
Extracted from emails containing commitment keywords:
- will deliver, committed to, promise, guarantee, by deadline, by EOD

**Extracted Data:**
- Promised to/by
- Deadline
- Fulfillment status

## Report Formats

All reports are generated in Markdown format for easy viewing, sharing, and version control.

### Daily Runway
Shows today's operational snapshot:
- Upcoming meetings
- Active tickets by priority
- Pending tasks
- Organized by workspace

### Customer Queue Brief
Prioritized view of customer tickets:
- Total customers and tickets
- Priority breakdown (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low)
- Sorted by urgency

### Meeting Prep
Preparation documents for upcoming meetings:
- Meeting details (time, organizer, attendees)
- Agenda
- Related context from other signals

### Promise Reminders
Tracks commitments:
- 🔴 Overdue promises
- 🟡 Due today
- 🟢 Upcoming deadlines
- ⚪ No deadline

### Accomplishment Reports
Quarterly and yearly summaries:
- Total activities (emails, tickets, meetings, tasks)
- Workspace breakdown
- Monthly trends (yearly report)
- Most active days

## Development

### Project Structure

```
src/
├── core/
│   └── SignalExtractor.ts       # Email signal extraction logic
├── services/
│   └── GraphService.ts          # Microsoft Graph API client
├── models/
│   ├── Signal.ts                # Signal type definitions
│   └── Workspace.ts             # Workspace management
├── generators/
│   ├── DailyRunwayGenerator.ts
│   ├── CustomerQueueGenerator.ts
│   ├── MeetingPrepGenerator.ts
│   ├── PromiseReminderGenerator.ts
│   └── AccomplishmentGenerator.ts
└── utils/
    └── fileUtils.ts             # File I/O utilities
```

### Adding New Signal Types

1. Add the signal type to `src/models/Signal.ts`
2. Add extraction logic to `src/core/SignalExtractor.ts`
3. Update report generators as needed

### Adding New Report Types

1. Create a new generator in `src/generators/`
2. Implement the `generate()` method
3. Add to the main workflow in `src/index.ts`

## Security Considerations

- Never commit `.env` file or secrets to version control
- Use Azure AD app permissions with minimum required scope
- Store sensitive data (API keys, credentials) in secure vaults for production
- Regularly rotate client secrets
- Review and audit API access logs

## Troubleshooting

### "Missing required environment variables"
- Ensure `.env` file exists and contains all required values
- Check that values are not empty or contain placeholders

### "Error fetching emails from Graph API"
- Verify Azure AD app permissions are granted
- Confirm admin consent has been given
- Check that the mailbox email exists and is accessible
- Validate client ID, tenant ID, and client secret

### "No emails found"
- Check date range being queried
- Verify the mailbox has received emails in the period
- Ensure mailbox permissions are correctly configured

## License

ISC

## Contributing

This is a proof-of-concept project. For production use, consider:
- Enhanced error handling and retry logic
- Persistent storage for signals and historical data
- Advanced NLP for better signal extraction
- Integration with ticketing systems (ServiceNow, ConnectWise)
- Email sending capabilities
- Web UI for report viewing
- Real-time notifications

## Support

For questions or issues, please open an issue on GitHub.
