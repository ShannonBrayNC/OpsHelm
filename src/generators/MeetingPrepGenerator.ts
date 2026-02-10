import { Signal, SignalType, MeetingSignal } from '../models';

/**
 * Generator for meeting prep documents
 */
export class MeetingPrepGenerator {
  /**
   * Generate meeting prep document for upcoming meetings
   */
  generate(signals: Signal[], meetingSubject?: string): string {
    const meetings = signals.filter(s => s.type === SignalType.MEETING) as MeetingSignal[];
    
    let report = `# Meeting Prep\n\n`;
    
    if (meetingSubject) {
      // Find specific meeting
      const meeting = meetings.find(m => 
        m.subject.toLowerCase().includes(meetingSubject.toLowerCase())
      );
      
      if (meeting) {
        return this.generateSingleMeetingPrep(meeting, signals);
      } else {
        report += `Meeting "${meetingSubject}" not found.\n`;
        return report;
      }
    }
    
    // Generate prep for all upcoming meetings
    if (meetings.length === 0) {
      report += `No upcoming meetings found.\n`;
      return report;
    }
    
    report += `**Total Meetings:** ${meetings.length}\n\n`;
    
    for (const meeting of meetings) {
      report += this.generateMeetingSection(meeting, signals);
      report += `\n---\n\n`;
    }
    
    return report;
  }
  
  private generateSingleMeetingPrep(meeting: MeetingSignal, allSignals: Signal[]): string {
    let report = `# Meeting Prep: ${meeting.subject}\n\n`;
    
    report += `**Date/Time:** ${meeting.timestamp.toLocaleString()}\n`;
    report += `**Organizer:** ${meeting.sender}\n`;
    
    if (meeting.attendees && meeting.attendees.length > 0) {
      report += `**Attendees:** ${meeting.attendees.join(', ')}\n`;
    }
    
    if (meeting.location) {
      report += `**Location:** ${meeting.location}\n`;
    }
    
    report += `\n## Agenda\n`;
    if (meeting.agenda) {
      report += `${meeting.agenda}\n`;
    } else {
      report += `${meeting.body.substring(0, 500)}...\n`;
    }
    
    // Find related signals
    report += `\n## Related Context\n`;
    const relatedSignals = this.findRelatedSignals(meeting, allSignals);
    
    if (relatedSignals.length > 0) {
      relatedSignals.forEach(signal => {
        report += `- [${signal.type.toUpperCase()}] ${signal.subject}\n`;
      });
    } else {
      report += `No related context found.\n`;
    }
    
    return report;
  }
  
  private generateMeetingSection(meeting: MeetingSignal, allSignals: Signal[]): string {
    let section = `## ${meeting.subject}\n\n`;
    
    section += `**Time:** ${meeting.timestamp.toLocaleString()}\n`;
    section += `**Organizer:** ${meeting.sender}\n`;
    
    if (meeting.attendees && meeting.attendees.length > 0) {
      section += `**Attendees:** ${meeting.attendees.slice(0, 5).join(', ')}`;
      if (meeting.attendees.length > 5) {
        section += ` and ${meeting.attendees.length - 5} more`;
      }
      section += `\n`;
    }
    
    // Brief preview
    const preview = meeting.body.substring(0, 200).trim();
    if (preview) {
      section += `\n**Preview:** ${preview}...\n`;
    }
    
    return section;
  }
  
  private findRelatedSignals(meeting: MeetingSignal, allSignals: Signal[]): Signal[] {
    const keywords = this.extractKeywords(meeting.subject);
    
    return allSignals
      .filter(s => s.id !== meeting.id && s.type !== SignalType.MEETING)
      .filter(s => {
        const signalText = `${s.subject} ${s.body}`.toLowerCase();
        return keywords.some(keyword => signalText.includes(keyword));
      })
      .slice(0, 5);
  }
  
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (remove common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
  }
}
