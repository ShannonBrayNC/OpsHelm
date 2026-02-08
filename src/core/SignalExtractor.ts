import { Message } from '@microsoft/microsoft-graph-types';
import {
  Signal,
  SignalType,
  TicketSignal,
  MeetingSignal,
  TaskSignal,
  PromiseSignal,
} from '../models';
import { WorkspaceManager } from '../models/Workspace';

/**
 * Engine for extracting signals from emails
 */
export class SignalExtractor {
  private workspaceManager: WorkspaceManager;

  constructor(workspaceManager: WorkspaceManager) {
    this.workspaceManager = workspaceManager;
  }

  /**
   * Extract all signals from a batch of emails
   */
  extractSignals(messages: Message[]): Signal[] {
    const signals: Signal[] = [];

    for (const message of messages) {
      const extractedSignals = this.extractSignalsFromMessage(message);
      signals.push(...extractedSignals);
    }

    return signals;
  }

  /**
   * Extract signals from a single email message
   */
  private extractSignalsFromMessage(message: Message): Signal[] {
    const signals: Signal[] = [];
    const subject = message.subject || '';
    const body = message.body?.content || message.bodyPreview || '';
    const sender = message.from?.emailAddress?.address || '';
    const recipients = [
      ...(message.toRecipients || []),
      ...(message.ccRecipients || []),
    ].map((r) => r.emailAddress?.address || '');

    const workspace = this.workspaceManager.identifyWorkspace(subject, sender);

    // Check for ticket signals
    if (this.isTicketEmail(subject, body)) {
      signals.push(this.extractTicket(message, workspace));
    }

    // Check for meeting signals
    if (this.isMeetingEmail(subject, body)) {
      signals.push(this.extractMeeting(message, workspace));
    }

    // Check for task signals
    if (this.isTaskEmail(subject, body)) {
      signals.push(this.extractTask(message, workspace));
    }

    // Check for promise signals
    if (this.isPromiseEmail(subject, body)) {
      signals.push(this.extractPromise(message, workspace));
    }

    return signals;
  }

  /**
   * Check if email is a ticket/support request
   */
  private isTicketEmail(subject: string, body: string): boolean {
    const ticketKeywords = [
      'ticket',
      'issue',
      'problem',
      'bug',
      'error',
      'support',
      'help',
      'incident',
      'case',
    ];
    const text = `${subject} ${body}`.toLowerCase();
    return ticketKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Check if email is meeting-related
   */
  private isMeetingEmail(subject: string, body: string): boolean {
    const meetingKeywords = [
      'meeting',
      'call',
      'discussion',
      'sync',
      'standup',
      'review',
      'presentation',
      'demo',
    ];
    const text = `${subject} ${body}`.toLowerCase();
    return meetingKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Check if email contains tasks
   */
  private isTaskEmail(subject: string, body: string): boolean {
    const taskKeywords = [
      'todo',
      'task',
      'action item',
      'deliverable',
      'complete',
      'finish',
      'assignment',
    ];
    const text = `${subject} ${body}`.toLowerCase();
    return taskKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Check if email contains promises/commitments
   */
  private isPromiseEmail(subject: string, body: string): boolean {
    const promiseKeywords = [
      'will deliver',
      'committed to',
      'promise',
      'guarantee',
      'by deadline',
      'by eod',
      'by friday',
    ];
    const text = `${subject} ${body}`.toLowerCase();
    return promiseKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Extract ticket signal details
   */
  private extractTicket(message: Message, workspace: string): TicketSignal {
    const subject = message.subject || '';
    const body = message.body?.content || message.bodyPreview || '';
    
    // Simple ticket ID extraction (e.g., TICKET-123, INC-456)
    const ticketIdMatch = subject.match(/[A-Z]+-\d+/);
    const ticketId = ticketIdMatch ? ticketIdMatch[0] : undefined;

    // Simple priority detection
    const priority = this.detectPriority(subject, body);

    return {
      id: message.id || '',
      type: SignalType.TICKET,
      workspace,
      subject,
      body,
      sender: message.from?.emailAddress?.address || '',
      recipients: this.extractRecipients(message),
      timestamp: new Date(message.receivedDateTime || Date.now()),
      extractedData: {},
      ticketId,
      priority,
      status: 'open',
    };
  }

  /**
   * Extract meeting signal details
   */
  private extractMeeting(message: Message, workspace: string): MeetingSignal {
    const subject = message.subject || '';
    const body = message.body?.content || message.bodyPreview || '';

    return {
      id: message.id || '',
      type: SignalType.MEETING,
      workspace,
      subject,
      body,
      sender: message.from?.emailAddress?.address || '',
      recipients: this.extractRecipients(message),
      timestamp: new Date(message.receivedDateTime || Date.now()),
      extractedData: {},
      attendees: this.extractRecipients(message),
    };
  }

  /**
   * Extract task signal details
   */
  private extractTask(message: Message, workspace: string): TaskSignal {
    return {
      id: message.id || '',
      type: SignalType.TASK,
      workspace,
      subject: message.subject || '',
      body: message.body?.content || message.bodyPreview || '',
      sender: message.from?.emailAddress?.address || '',
      recipients: this.extractRecipients(message),
      timestamp: new Date(message.receivedDateTime || Date.now()),
      extractedData: {},
      completed: false,
    };
  }

  /**
   * Extract promise signal details
   */
  private extractPromise(message: Message, workspace: string): PromiseSignal {
    return {
      id: message.id || '',
      type: SignalType.PROMISE,
      workspace,
      subject: message.subject || '',
      body: message.body?.content || message.bodyPreview || '',
      sender: message.from?.emailAddress?.address || '',
      recipients: this.extractRecipients(message),
      timestamp: new Date(message.receivedDateTime || Date.now()),
      extractedData: {},
      promisedBy: message.from?.emailAddress?.address || '',
      fulfilled: false,
    };
  }

  /**
   * Extract all recipients from a message
   */
  private extractRecipients(message: Message): string[] {
    return [
      ...(message.toRecipients || []),
      ...(message.ccRecipients || []),
    ].map((r) => r.emailAddress?.address || '').filter(email => email);
  }

  /**
   * Detect priority from email content
   */
  private detectPriority(
    subject: string,
    body: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const text = `${subject} ${body}`.toLowerCase();
    
    if (text.includes('critical') || text.includes('urgent')) {
      return 'critical';
    } else if (text.includes('high priority')) {
      return 'high';
    } else if (text.includes('low priority')) {
      return 'low';
    }
    
    return 'medium';
  }
}
