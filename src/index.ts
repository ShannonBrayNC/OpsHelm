import * as dotenv from 'dotenv';
import * as path from 'path';
import { GraphService } from './services';
import { SignalExtractor } from './core';
import { WorkspaceManager } from './models';
import {
  DailyRunwayGenerator,
  CustomerQueueGenerator,
  MeetingPrepGenerator,
  PromiseReminderGenerator,
  AccomplishmentGenerator,
} from './generators';
import { writeToFile, getTimestamp } from './utils';

// Load environment variables
dotenv.config();

/**
 * Main OpsHelm application
 */
class OpsHelm {
  private graphService: GraphService;
  private workspaceManager: WorkspaceManager;
  private signalExtractor: SignalExtractor;
  private outputDir: string;

  constructor() {
    // Validate required environment variables
    const requiredEnvVars = ['TENANT_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'MAILBOX_EMAIL'];
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        `Please copy .env.example to .env and fill in the values.`
      );
    }

    // Initialize Graph service
    this.graphService = new GraphService({
      tenantId: process.env.TENANT_ID!,
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      mailboxEmail: process.env.MAILBOX_EMAIL!,
    });

    // Initialize workspace manager
    const workspacesConfig = process.env.WORKSPACES 
      ? JSON.parse(process.env.WORKSPACES) 
      : { Parex: 'parex', ParkPlace: 'parkplace' };
    
    this.workspaceManager = new WorkspaceManager(workspacesConfig);
    this.signalExtractor = new SignalExtractor(this.workspaceManager);
    
    // Set output directory
    this.outputDir = process.env.OUTPUT_DIR || './output';
  }

  /**
   * Run the daily processing workflow
   */
  async runDaily(): Promise<void> {
    console.log('🚀 OpsHelm Daily Processing Started');
    console.log('=====================================\n');

    try {
      // Fetch today's emails
      console.log('📧 Fetching today\'s emails...');
      const emails = await this.graphService.getTodaysEmails();
      console.log(`   Retrieved ${emails.length} emails\n`);

      // Extract signals
      console.log('🔍 Extracting signals...');
      const signals = this.signalExtractor.extractSignals(emails);
      console.log(`   Extracted ${signals.length} signals\n`);

      // Generate reports
      console.log('📝 Generating reports...');
      
      const timestamp = getTimestamp();
      const dailyDir = path.join(this.outputDir, timestamp);

      // Daily Runway
      const runwayGenerator = new DailyRunwayGenerator();
      const runway = runwayGenerator.generate(signals);
      writeToFile(path.join(dailyDir, 'daily-runway.md'), runway);
      console.log('   ✓ Daily Runway');

      // Customer Queue Briefs (one per workspace)
      const queueGenerator = new CustomerQueueGenerator();
      const workspaces = this.workspaceManager.getActiveWorkspaces();
      
      for (const workspace of workspaces) {
        const wsSignals = signals.filter(s => s.workspace === workspace.name);
        const queue = queueGenerator.generate(wsSignals, workspace.name);
        writeToFile(
          path.join(dailyDir, `customer-queue-${workspace.name.toLowerCase()}.md`),
          queue
        );
        console.log(`   ✓ Customer Queue: ${workspace.name}`);
      }

      // Meeting Prep
      const meetingGenerator = new MeetingPrepGenerator();
      const meetingPrep = meetingGenerator.generate(signals);
      writeToFile(path.join(dailyDir, 'meeting-prep.md'), meetingPrep);
      console.log('   ✓ Meeting Prep');

      // Promise Reminders
      const promiseGenerator = new PromiseReminderGenerator();
      const promises = promiseGenerator.generate(signals);
      writeToFile(path.join(dailyDir, 'promise-reminders.md'), promises);
      console.log('   ✓ Promise Reminders');

      console.log('\n✅ Daily processing completed successfully!');
      console.log(`📁 Reports saved to: ${dailyDir}\n`);

    } catch (error) {
      console.error('❌ Error during daily processing:', error);
      throw error;
    }
  }

  /**
   * Generate quarterly accomplishment report
   */
  async generateQuarterlyReport(): Promise<void> {
    console.log('📊 Generating Quarterly Accomplishment Report...\n');

    try {
      // Fetch last 90 days of emails
      const emails = await this.graphService.getRecentEmails(90);
      console.log(`   Retrieved ${emails.length} emails from last 90 days\n`);

      const signals = this.signalExtractor.extractSignals(emails);
      
      const accomplishmentGenerator = new AccomplishmentGenerator();
      const report = accomplishmentGenerator.generate(signals, 'quarterly');
      
      const timestamp = getTimestamp();
      const reportPath = path.join(this.outputDir, `quarterly-accomplishments-${timestamp}.md`);
      writeToFile(reportPath, report);
      
      console.log(`✅ Quarterly report saved to: ${reportPath}\n`);
    } catch (error) {
      console.error('❌ Error generating quarterly report:', error);
      throw error;
    }
  }

  /**
   * Generate yearly accomplishment report
   */
  async generateYearlyReport(): Promise<void> {
    console.log('📊 Generating Yearly Accomplishment Report...\n');

    try {
      // Fetch last 365 days of emails
      const emails = await this.graphService.getRecentEmails(365);
      console.log(`   Retrieved ${emails.length} emails from last year\n`);

      const signals = this.signalExtractor.extractSignals(emails);
      
      const accomplishmentGenerator = new AccomplishmentGenerator();
      const report = accomplishmentGenerator.generate(signals, 'yearly');
      
      const timestamp = getTimestamp();
      const reportPath = path.join(this.outputDir, `yearly-accomplishments-${timestamp}.md`);
      writeToFile(reportPath, report);
      
      console.log(`✅ Yearly report saved to: ${reportPath}\n`);
    } catch (error) {
      console.error('❌ Error generating yearly report:', error);
      throw error;
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'daily';

  try {
    const opsHelm = new OpsHelm();

    switch (command) {
      case 'daily':
        await opsHelm.runDaily();
        break;
      
      case 'quarterly':
        await opsHelm.generateQuarterlyReport();
        break;
      
      case 'yearly':
        await opsHelm.generateYearlyReport();
        break;
      
      default:
        console.error(`Unknown command: ${command}`);
        console.log('\nAvailable commands:');
        console.log('  daily      - Run daily processing (default)');
        console.log('  quarterly  - Generate quarterly accomplishment report');
        console.log('  yearly     - Generate yearly accomplishment report');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { OpsHelm };
