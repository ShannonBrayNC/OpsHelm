/**
 * Signal types extracted from emails
 */
export enum SignalType {
  TICKET = 'ticket',
  MEETING = 'meeting',
  TASK = 'task',
  PROMISE = 'promise',
}

/**
 * Base signal interface
 */
export interface Signal {
  id: string;
  type: SignalType;
  workspace: string;
  subject: string;
  body: string;
  sender: string;
  recipients: string[];
  timestamp: Date;
  extractedData: Record<string, any>;
}

/**
 * Ticket signal - extracted from support/issue emails
 */
export interface TicketSignal extends Signal {
  type: SignalType.TICKET;
  ticketId?: string;
  customer?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
}

/**
 * Meeting signal - extracted from calendar invites and meeting-related emails
 */
export interface MeetingSignal extends Signal {
  type: SignalType.MEETING;
  meetingTime?: Date;
  location?: string;
  attendees?: string[];
  agenda?: string;
}

/**
 * Task signal - extracted from action items in emails
 */
export interface TaskSignal extends Signal {
  type: SignalType.TASK;
  assignee?: string;
  dueDate?: Date;
  completed?: boolean;
}

/**
 * Promise signal - extracted from commitment statements in emails
 */
export interface PromiseSignal extends Signal {
  type: SignalType.PROMISE;
  promisedTo?: string;
  promisedBy?: string;
  deadline?: Date;
  fulfilled?: boolean;
}
