/**
 * Demo script to showcase OpsHelm functionality with sample data
 * This demonstrates the system without requiring actual Microsoft Graph API access
 */

import { Message } from '@microsoft/microsoft-graph-types';
import { SignalExtractor } from '../src/core';
import { WorkspaceManager } from '../src/models';
import {
  DailyRunwayGenerator,
  CustomerQueueGenerator,
  MeetingPrepGenerator,
  PromiseReminderGenerator,
  AccomplishmentGenerator,
} from '../src/generators';
import { writeToFile } from '../src/utils';
import * as path from 'path';

/**
 * Generate sample email messages
 */
function generateSampleMessages(): Message[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return [
    // Parex workspace tickets
    {
      id: 'msg-001',
      subject: '[Parex] TICKET-123 Critical Database Issue',
      body: {
        content: 'We are experiencing critical database connectivity issues affecting all users. This needs immediate attention.',
        contentType: 'text',
      },
      bodyPreview: 'We are experiencing critical database connectivity issues...',
      from: {
        emailAddress: {
          address: 'support@parex.com',
          name: 'Parex Support',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'ops@company.com',
            name: 'Ops Team',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: yesterday.toISOString(),
      isRead: false,
    },
    {
      id: 'msg-002',
      subject: 'Parex - High priority ticket INC-456',
      body: {
        content: 'Users reporting slow application response times. Need to investigate performance issues.',
        contentType: 'text',
      },
      bodyPreview: 'Users reporting slow application response times...',
      from: {
        emailAddress: {
          address: 'admin@parex.com',
          name: 'Parex Admin',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'ops@company.com',
            name: 'Ops Team',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: now.toISOString(),
      isRead: false,
    },
    // ParkPlace workspace tickets
    {
      id: 'msg-003',
      subject: 'ParkPlace Support Request - Backup Issue',
      body: {
        content: 'Automated backups have failed for the last 3 nights. Need help troubleshooting.',
        contentType: 'text',
      },
      bodyPreview: 'Automated backups have failed for the last 3 nights...',
      from: {
        emailAddress: {
          address: 'it@parkplace.com',
          name: 'ParkPlace IT',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'ops@company.com',
            name: 'Ops Team',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: now.toISOString(),
      isRead: false,
    },
    // Meeting emails
    {
      id: 'msg-004',
      subject: '[Parex] Weekly Sync Meeting',
      body: {
        content: 'Weekly sync meeting to discuss ongoing projects and blockers. Please come prepared with status updates.',
        contentType: 'text',
      },
      bodyPreview: 'Weekly sync meeting to discuss ongoing projects...',
      from: {
        emailAddress: {
          address: 'manager@parex.com',
          name: 'Parex Manager',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'ops@company.com',
            name: 'Ops Team',
          },
        },
        {
          emailAddress: {
            address: 'dev@parex.com',
            name: 'Dev Team',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: now.toISOString(),
      isRead: false,
    },
    {
      id: 'msg-005',
      subject: 'ParkPlace Quarterly Review Meeting',
      body: {
        content: 'Quarterly business review meeting with ParkPlace stakeholders. Will discuss Q4 performance and Q1 goals.',
        contentType: 'text',
      },
      bodyPreview: 'Quarterly business review meeting with ParkPlace stakeholders...',
      from: {
        emailAddress: {
          address: 'exec@parkplace.com',
          name: 'ParkPlace Executive',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'ops@company.com',
            name: 'Ops Team',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: tomorrow.toISOString(),
      isRead: false,
    },
    // Task emails
    {
      id: 'msg-006',
      subject: 'Action Items: Complete security audit by Friday',
      body: {
        content: 'Please complete the security audit for all Parex systems by end of week. This is a high priority task.',
        contentType: 'text',
      },
      bodyPreview: 'Please complete the security audit for all Parex systems...',
      from: {
        emailAddress: {
          address: 'security@company.com',
          name: 'Security Team',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'ops@company.com',
            name: 'Ops Team',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: now.toISOString(),
      isRead: false,
    },
    // Promise emails
    {
      id: 'msg-007',
      subject: 'Re: Infrastructure Upgrade Timeline',
      body: {
        content: 'I promise to deliver the infrastructure upgrade for ParkPlace by next Monday EOD. All components will be tested and deployed.',
        contentType: 'text',
      },
      bodyPreview: 'I promise to deliver the infrastructure upgrade...',
      from: {
        emailAddress: {
          address: 'ops@company.com',
          name: 'Ops Team',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'it@parkplace.com',
            name: 'ParkPlace IT',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: yesterday.toISOString(),
      isRead: true,
    },
    {
      id: 'msg-008',
      subject: 'Committed to delivering Parex API fixes',
      body: {
        content: 'I am committed to delivering the API fixes for Parex by deadline Friday. This will resolve the integration issues.',
        contentType: 'text',
      },
      bodyPreview: 'I am committed to delivering the API fixes...',
      from: {
        emailAddress: {
          address: 'dev@company.com',
          name: 'Dev Team',
        },
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'admin@parex.com',
            name: 'Parex Admin',
          },
        },
      ],
      ccRecipients: [],
      receivedDateTime: now.toISOString(),
      isRead: true,
    },
  ];
}

/**
 * Run the demo
 */
function runDemo() {
  console.log('🎬 OpsHelm Demo - Sample Data Processing');
  console.log('==========================================\n');

  // Initialize workspace manager
  const workspaceManager = new WorkspaceManager({
    Parex: 'parex',
    ParkPlace: 'parkplace',
  });

  // Generate sample messages
  console.log('📧 Generating sample email messages...');
  const messages = generateSampleMessages();
  console.log(`   Created ${messages.length} sample emails\n`);

  // Extract signals
  console.log('🔍 Extracting signals from messages...');
  const signalExtractor = new SignalExtractor(workspaceManager);
  const signals = signalExtractor.extractSignals(messages);
  console.log(`   Extracted ${signals.length} signals\n`);

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'examples', 'output');
  
  // Generate Daily Runway
  console.log('📝 Generating Daily Runway Report...');
  const runwayGenerator = new DailyRunwayGenerator();
  const runway = runwayGenerator.generate(signals);
  writeToFile(path.join(outputDir, 'daily-runway.md'), runway);
  console.log('   ✓ Saved to examples/output/daily-runway.md');

  // Generate Customer Queue (Parex)
  console.log('📝 Generating Customer Queue (Parex)...');
  const queueGenerator = new CustomerQueueGenerator();
  const parexSignals = signals.filter(s => s.workspace === 'Parex');
  const parexQueue = queueGenerator.generate(parexSignals, 'Parex');
  writeToFile(path.join(outputDir, 'customer-queue-parex.md'), parexQueue);
  console.log('   ✓ Saved to examples/output/customer-queue-parex.md');

  // Generate Customer Queue (ParkPlace)
  console.log('📝 Generating Customer Queue (ParkPlace)...');
  const parkplaceSignals = signals.filter(s => s.workspace === 'ParkPlace');
  const parkplaceQueue = queueGenerator.generate(parkplaceSignals, 'ParkPlace');
  writeToFile(path.join(outputDir, 'customer-queue-parkplace.md'), parkplaceQueue);
  console.log('   ✓ Saved to examples/output/customer-queue-parkplace.md');

  // Generate Meeting Prep
  console.log('📝 Generating Meeting Prep...');
  const meetingGenerator = new MeetingPrepGenerator();
  const meetingPrep = meetingGenerator.generate(signals);
  writeToFile(path.join(outputDir, 'meeting-prep.md'), meetingPrep);
  console.log('   ✓ Saved to examples/output/meeting-prep.md');

  // Generate Promise Reminders
  console.log('📝 Generating Promise Reminders...');
  const promiseGenerator = new PromiseReminderGenerator();
  const promises = promiseGenerator.generate(signals);
  writeToFile(path.join(outputDir, 'promise-reminders.md'), promises);
  console.log('   ✓ Saved to examples/output/promise-reminders.md');

  // Generate Accomplishment Report
  console.log('📝 Generating Accomplishment Report...');
  const accomplishmentGenerator = new AccomplishmentGenerator();
  const accomplishments = accomplishmentGenerator.generate(signals, 'quarterly');
  writeToFile(path.join(outputDir, 'quarterly-accomplishments.md'), accomplishments);
  console.log('   ✓ Saved to examples/output/quarterly-accomplishments.md');

  console.log('\n✅ Demo completed successfully!');
  console.log('📁 All reports saved to examples/output/\n');

  // Print summary
  console.log('📊 Summary:');
  console.log(`   - Total Signals: ${signals.length}`);
  console.log(`   - Tickets: ${signals.filter(s => s.type === 'ticket').length}`);
  console.log(`   - Meetings: ${signals.filter(s => s.type === 'meeting').length}`);
  console.log(`   - Tasks: ${signals.filter(s => s.type === 'task').length}`);
  console.log(`   - Promises: ${signals.filter(s => s.type === 'promise').length}`);
  console.log(`   - Workspaces: Parex (${parexSignals.length}), ParkPlace (${parkplaceSignals.length})\n`);
}

// Run the demo
runDemo();
