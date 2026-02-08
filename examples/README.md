# OpsHelm Examples

This directory contains example usage and demonstration scripts for OpsHelm.

## Demo Script

The `demo.ts` script demonstrates OpsHelm functionality using sample email data, without requiring actual Microsoft Graph API credentials.

### Running the Demo

```bash
npm run demo
```

This will:
1. Generate 8 sample email messages representing different signal types
2. Extract signals from the messages (tickets, meetings, tasks, promises)
3. Generate all report types in `examples/output/`

### Generated Reports

After running the demo, you'll find these reports in `examples/output/`:

- **daily-runway.md** - Daily operational snapshot
- **customer-queue-parex.md** - Customer queue for Parex workspace
- **customer-queue-parkplace.md** - Customer queue for ParkPlace workspace
- **meeting-prep.md** - Meeting preparation documents
- **promise-reminders.md** - Promise tracking and reminders
- **quarterly-accomplishments.md** - Quarterly accomplishment report

### Sample Data

The demo includes sample emails for:

**Parex Workspace:**
- Critical database issue ticket (TICKET-123)
- High priority performance ticket (INC-456)
- Weekly sync meeting
- API fix promise/commitment

**ParkPlace Workspace:**
- Backup issue support request
- Quarterly review meeting
- Infrastructure upgrade promise

**General:**
- Security audit task
- Various action items

### Understanding the Output

The demo showcases how OpsHelm:
- **Identifies workspaces** from email subject lines and sender addresses
- **Extracts signals** using keyword matching and pattern recognition
- **Prioritizes tickets** based on urgency indicators
- **Groups activities** by customer/workspace for easy management
- **Tracks commitments** to ensure follow-through
- **Generates actionable reports** in Markdown format

### Customizing the Demo

To modify the demo with your own sample data:

1. Edit `examples/demo.ts`
2. Modify the `generateSampleMessages()` function
3. Add or remove messages as needed
4. Run `npm run demo` to see your changes

### Next Steps

After reviewing the demo output:
1. Set up Microsoft Graph API credentials (see main README.md)
2. Run the actual application with `npm start`
3. Process real emails from your mailbox
4. Customize signal extraction rules for your organization
