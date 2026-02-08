import { Signal, SignalType, PromiseSignal } from '../models';

/**
 * Generator for promise reminders
 */
export class PromiseReminderGenerator {
  /**
   * Generate promise reminder report
   */
  generate(signals: Signal[], workspace?: string): string {
    let promises = signals.filter(s => s.type === SignalType.PROMISE) as PromiseSignal[];
    
    if (workspace) {
      promises = promises.filter(p => p.workspace === workspace);
    }
    
    let report = `# Promise Reminders\n\n`;
    
    if (workspace) {
      report += `**Workspace:** ${workspace}\n\n`;
    }
    
    const pending = promises.filter(p => !p.fulfilled);
    const fulfilled = promises.filter(p => p.fulfilled);
    
    report += `**Pending Promises:** ${pending.length}\n`;
    report += `**Fulfilled Promises:** ${fulfilled.length}\n\n`;
    
    if (pending.length === 0) {
      report += `✅ All promises fulfilled!\n`;
      return report;
    }
    
    // Group by deadline status
    const overdue = pending.filter(p => p.deadline && p.deadline < new Date());
    const dueToday = pending.filter(p => {
      if (!p.deadline) return false;
      const today = new Date();
      return p.deadline.toDateString() === today.toDateString();
    });
    const upcoming = pending.filter(p => 
      p.deadline && 
      p.deadline > new Date() && 
      p.deadline.toDateString() !== new Date().toDateString()
    );
    const noDeadline = pending.filter(p => !p.deadline);
    
    // Overdue promises
    if (overdue.length > 0) {
      report += `## 🔴 Overdue (${overdue.length})\n\n`;
      overdue.forEach(p => {
        report += this.formatPromise(p, true);
      });
    }
    
    // Due today
    if (dueToday.length > 0) {
      report += `## 🟡 Due Today (${dueToday.length})\n\n`;
      dueToday.forEach(p => {
        report += this.formatPromise(p);
      });
    }
    
    // Upcoming
    if (upcoming.length > 0) {
      report += `## 🟢 Upcoming (${upcoming.length})\n\n`;
      upcoming.forEach(p => {
        report += this.formatPromise(p);
      });
    }
    
    // No deadline
    if (noDeadline.length > 0) {
      report += `## ⚪ No Deadline (${noDeadline.length})\n\n`;
      noDeadline.forEach(p => {
        report += this.formatPromise(p);
      });
    }
    
    return report;
  }
  
  private formatPromise(promise: PromiseSignal, isOverdue: boolean = false): string {
    let output = `### ${promise.subject}\n`;
    
    if (promise.promisedBy) {
      output += `**Promised by:** ${promise.promisedBy}\n`;
    }
    
    if (promise.promisedTo) {
      output += `**Promised to:** ${promise.promisedTo}\n`;
    }
    
    if (promise.deadline) {
      const deadlineStr = promise.deadline.toLocaleDateString();
      if (isOverdue) {
        const daysOverdue = Math.floor(
          (Date.now() - promise.deadline.getTime()) / (1000 * 60 * 60 * 24)
        );
        output += `**Deadline:** ${deadlineStr} (${daysOverdue} days overdue)\n`;
      } else {
        output += `**Deadline:** ${deadlineStr}\n`;
      }
    }
    
    output += `**Received:** ${promise.timestamp.toLocaleDateString()}\n`;
    
    // Show excerpt of the promise
    const excerpt = promise.body.substring(0, 150).trim();
    if (excerpt) {
      output += `\n> ${excerpt}...\n`;
    }
    
    output += `\n`;
    
    return output;
  }
}
