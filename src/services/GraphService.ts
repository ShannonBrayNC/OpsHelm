import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { Message } from '@microsoft/microsoft-graph-types';

/**
 * Configuration for Microsoft Graph service
 */
export interface GraphConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  mailboxEmail: string;
}

/**
 * Service for interacting with Microsoft Graph API to fetch emails
 */
export class GraphService {
  private client: Client;
  private mailboxEmail: string;

  constructor(config: GraphConfig) {
    const credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );

    this.client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken([
            'https://graph.microsoft.com/.default',
          ]);
          return token.token;
        },
      },
    });

    this.mailboxEmail = config.mailboxEmail;
  }

  /**
   * Fetch emails from the mailbox within a date range
   */
  async fetchEmails(
    startDate: Date,
    endDate: Date,
    maxResults: number = 100
  ): Promise<Message[]> {
    try {
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      const response = await this.client
        .api(`/users/${this.mailboxEmail}/messages`)
        .filter(
          `receivedDateTime ge ${startIso} and receivedDateTime le ${endIso}`
        )
        .select([
          'id',
          'subject',
          'body',
          'from',
          'toRecipients',
          'ccRecipients',
          'receivedDateTime',
          'bodyPreview',
          'isRead',
        ])
        .top(maxResults)
        .orderby('receivedDateTime desc')
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error fetching emails from Graph API:', error);
      throw error;
    }
  }

  /**
   * Fetch a single email by ID
   */
  async fetchEmailById(messageId: string): Promise<Message> {
    try {
      const message = await this.client
        .api(`/users/${this.mailboxEmail}/messages/${messageId}`)
        .select([
          'id',
          'subject',
          'body',
          'from',
          'toRecipients',
          'ccRecipients',
          'receivedDateTime',
          'bodyPreview',
        ])
        .get();

      return message;
    } catch (error) {
      console.error(`Error fetching email ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Get today's emails
   */
  async getTodaysEmails(): Promise<Message[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.fetchEmails(today, tomorrow);
  }

  /**
   * Get emails from the last N days
   */
  async getRecentEmails(days: number = 7): Promise<Message[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.fetchEmails(startDate, endDate);
  }
}
