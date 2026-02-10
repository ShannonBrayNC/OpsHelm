import { Signal, SignalType, TicketSignal, MeetingSignal, TaskSignal, PromiseSignal } from '../models';

/**
 * Generator for daily runway reports
 */
export class DailyRunwayGenerator {
  /**
   * Generate a daily runway report from signals
   */
  generate(signals: Signal[], date: Date = new Date()): string {
    const dateStr = date.toISOString().split('T')[0];
    
    let report = `# Daily Runway Report - ${dateStr}\n\n`;
    
    // Group signals by workspace
    const workspaceSignals = this.groupByWorkspace(signals);
    
    for (const [workspace, wsSignals] of Object.entries(workspaceSignals)) {
      report += `## Workspace: ${workspace}\n\n`;
      
      // Meetings for today
      const meetings = wsSignals.filter(s => s.type === SignalType.MEETING) as MeetingSignal[];
      if (meetings.length > 0) {
        report += `### Meetings (${meetings.length})\n`;
        meetings.forEach(m => {
          report += `- **${m.subject}**\n`;
          report += `  - From: ${m.sender}\n`;
          report += `  - Time: ${m.timestamp.toLocaleString()}\n`;
          if (m.attendees && m.attendees.length > 0) {
            report += `  - Attendees: ${m.attendees.join(', ')}\n`;
          }
          report += `\n`;
        });
      }
      
      // Active tickets
      const tickets = wsSignals.filter(s => s.type === SignalType.TICKET) as TicketSignal[];
      if (tickets.length > 0) {
        report += `### Active Tickets (${tickets.length})\n`;
        const criticalTickets = tickets.filter(t => t.priority === 'critical');
        const highTickets = tickets.filter(t => t.priority === 'high');
        const mediumTickets = tickets.filter(t => t.priority === 'medium');
        
        if (criticalTickets.length > 0) {
          report += `\n**Critical:**\n`;
          criticalTickets.forEach(t => {
            report += `- ${t.ticketId || 'N/A'}: ${t.subject}\n`;
          });
        }
        
        if (highTickets.length > 0) {
          report += `\n**High Priority:**\n`;
          highTickets.forEach(t => {
            report += `- ${t.ticketId || 'N/A'}: ${t.subject}\n`;
          });
        }
        
        if (mediumTickets.length > 0) {
          report += `\n**Medium Priority:**\n`;
          mediumTickets.forEach(t => {
            report += `- ${t.ticketId || 'N/A'}: ${t.subject}\n`;
          });
        }
      }
      
      // Tasks
      const tasks = wsSignals.filter(s => s.type === SignalType.TASK) as TaskSignal[];
      const pendingTasks = tasks.filter(t => !t.completed);
      if (pendingTasks.length > 0) {
        report += `\n### Pending Tasks (${pendingTasks.length})\n`;
        pendingTasks.forEach(t => {
          report += `- [ ] ${t.subject}\n`;
          if (t.assignee) {
            report += `  - Assignee: ${t.assignee}\n`;
          }
          if (t.dueDate) {
            report += `  - Due: ${t.dueDate.toLocaleDateString()}\n`;
          }
        });
      }
      
      report += `\n`;
    }
    
    return report;
  }
  
  private groupByWorkspace(signals: Signal[]): Record<string, Signal[]> {
    const groups: Record<string, Signal[]> = {};
    
    for (const signal of signals) {
      if (!groups[signal.workspace]) {
        groups[signal.workspace] = [];
      }
      groups[signal.workspace]!.push(signal);
    }
    
    return groups;
  }
}
