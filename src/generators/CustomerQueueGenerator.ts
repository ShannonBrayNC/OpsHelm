import { Signal, SignalType, TicketSignal } from '../models';

/**
 * Generator for customer queue briefs
 */
export class CustomerQueueGenerator {
  /**
   * Generate a customer queue brief from ticket signals
   */
  generate(signals: Signal[], workspace?: string): string {
    const tickets = signals.filter(s => s.type === SignalType.TICKET) as TicketSignal[];
    
    let report = `# Customer Queue Brief\n\n`;
    
    if (workspace) {
      report += `**Workspace:** ${workspace}\n\n`;
    }
    
    // Group by customer
    const customerTickets = this.groupByCustomer(tickets);
    
    report += `**Total Customers:** ${Object.keys(customerTickets).length}\n`;
    report += `**Total Tickets:** ${tickets.length}\n\n`;
    
    // Priority summary
    const critical = tickets.filter(t => t.priority === 'critical').length;
    const high = tickets.filter(t => t.priority === 'high').length;
    const medium = tickets.filter(t => t.priority === 'medium').length;
    const low = tickets.filter(t => t.priority === 'low').length;
    
    report += `## Priority Breakdown\n`;
    report += `- Critical: ${critical}\n`;
    report += `- High: ${high}\n`;
    report += `- Medium: ${medium}\n`;
    report += `- Low: ${low}\n\n`;
    
    // Customer details
    report += `## Customer Queue\n\n`;
    
    const sortedCustomers = Object.entries(customerTickets).sort(
      (a, b) => this.calculatePriority(b[1]) - this.calculatePriority(a[1])
    );
    
    for (const [customer, custTickets] of sortedCustomers) {
      report += `### ${customer} (${custTickets.length} tickets)\n`;
      
      custTickets.forEach(ticket => {
        const priorityBadge = this.getPriorityBadge(ticket.priority);
        report += `- ${priorityBadge} **${ticket.ticketId || 'N/A'}**: ${ticket.subject}\n`;
        report += `  - Status: ${ticket.status}\n`;
        report += `  - Received: ${ticket.timestamp.toLocaleString()}\n`;
      });
      
      report += `\n`;
    }
    
    return report;
  }
  
  private groupByCustomer(tickets: TicketSignal[]): Record<string, TicketSignal[]> {
    const groups: Record<string, TicketSignal[]> = {};
    
    for (const ticket of tickets) {
      const customer = ticket.customer || ticket.sender || 'Unknown';
      if (!groups[customer]) {
        groups[customer] = [];
      }
      groups[customer].push(ticket);
    }
    
    return groups;
  }
  
  private calculatePriority(tickets: TicketSignal[]): number {
    let score = 0;
    for (const ticket of tickets) {
      switch (ticket.priority) {
        case 'critical': score += 100; break;
        case 'high': score += 10; break;
        case 'medium': score += 5; break;
        case 'low': score += 1; break;
      }
    }
    return score;
  }
  
  private getPriorityBadge(priority?: string): string {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }
}
