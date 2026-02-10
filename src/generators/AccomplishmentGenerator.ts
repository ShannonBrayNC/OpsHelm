import { Signal, SignalType } from '../models';

/**
 * Generator for quarterly and yearly accomplishment reports
 */
export class AccomplishmentGenerator {
  /**
   * Generate accomplishment report for a time period
   */
  generate(
    signals: Signal[], 
    period: 'quarterly' | 'yearly',
    workspace?: string
  ): string {
    let filteredSignals = workspace 
      ? signals.filter(s => s.workspace === workspace)
      : signals;
    
    const now = new Date();
    const startDate = this.getStartDate(period, now);
    
    filteredSignals = filteredSignals.filter(
      s => s.timestamp >= startDate && s.timestamp <= now
    );
    
    let report = `# ${this.capitalize(period)} Accomplishments\n\n`;
    report += `**Period:** ${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}\n`;
    
    if (workspace) {
      report += `**Workspace:** ${workspace}\n`;
    }
    
    report += `\n`;
    
    // Summary statistics
    report += `## Summary\n\n`;
    
    const tickets = filteredSignals.filter(s => s.type === SignalType.TICKET);
    const meetings = filteredSignals.filter(s => s.type === SignalType.MEETING);
    const tasks = filteredSignals.filter(s => s.type === SignalType.TASK);
    const promises = filteredSignals.filter(s => s.type === SignalType.PROMISE);
    
    report += `- **Total Emails Processed:** ${filteredSignals.length}\n`;
    report += `- **Tickets Handled:** ${tickets.length}\n`;
    report += `- **Meetings Attended:** ${meetings.length}\n`;
    report += `- **Tasks Completed:** ${tasks.length}\n`;
    report += `- **Promises Made:** ${promises.length}\n\n`;
    
    // Breakdown by workspace
    const workspaces = this.groupByWorkspace(filteredSignals);
    
    if (Object.keys(workspaces).length > 1) {
      report += `## Workspace Breakdown\n\n`;
      
      for (const [ws, wsSignals] of Object.entries(workspaces)) {
        report += `### ${ws}\n`;
        report += `- Emails: ${wsSignals.length}\n`;
        report += `- Tickets: ${wsSignals.filter(s => s.type === SignalType.TICKET).length}\n`;
        report += `- Meetings: ${wsSignals.filter(s => s.type === SignalType.MEETING).length}\n`;
        report += `\n`;
      }
    }
    
    // Monthly breakdown for yearly reports
    if (period === 'yearly') {
      report += `## Monthly Trend\n\n`;
      const monthlyData = this.groupByMonth(filteredSignals);
      
      for (const [month, monthSignals] of Object.entries(monthlyData)) {
        report += `**${month}:** ${monthSignals.length} signals\n`;
      }
      report += `\n`;
    }
    
    // Key accomplishments (top items by various criteria)
    report += `## Key Accomplishments\n\n`;
    
    // Most active days
    const dailyActivity = this.groupByDay(filteredSignals);
    const topDays = Object.entries(dailyActivity)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    
    report += `### Most Active Days\n`;
    topDays.forEach(([day, daySignals]) => {
      report += `- ${day}: ${daySignals.length} activities\n`;
    });
    
    return report;
  }
  
  private getStartDate(period: 'quarterly' | 'yearly', endDate: Date): Date {
    const start = new Date(endDate);
    
    if (period === 'quarterly') {
      start.setMonth(start.getMonth() - 3);
    } else {
      start.setFullYear(start.getFullYear() - 1);
    }
    
    return start;
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
  
  private groupByMonth(signals: Signal[]): Record<string, Signal[]> {
    const groups: Record<string, Signal[]> = {};
    
    for (const signal of signals) {
      const monthKey = signal.timestamp.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(signal);
    }
    
    return groups;
  }
  
  private groupByDay(signals: Signal[]): Record<string, Signal[]> {
    const groups: Record<string, Signal[]> = {};
    
    for (const signal of signals) {
      const dayKey = signal.timestamp.toLocaleDateString();
      
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(signal);
    }
    
    return groups;
  }
  
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
