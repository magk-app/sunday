import type { Email } from '../types/index';

export const mockEmails: Email[] = [
  {
    id: 'email_1',
    sender: 'alice@example.com',
    recipients: ['bob@example.com'],
    subject: 'Project Update',
    snippet: 'Hi Bob, just wanted to update you on...',
    body: `Hi Bob,\n\nJust wanted to update you on the project status. We are on track for delivery next week.\n\nBest,\nAlice`,
    date: '2024-06-24T10:00:00Z',
    importance: 'high',
    status: 'pending',
  },
  {
    id: 'email_2',
    sender: 'carol@example.com',
    recipients: ['bob@example.com'],
    subject: 'Meeting Reminder',
    snippet: 'Don\'t forget our meeting at 2pm...',
    body: `Hi Bob,\n\nJust a reminder about our meeting at 2pm today.\n\nThanks,\nCarol`,
    date: '2024-06-24T08:30:00Z',
    importance: 'medium',
    status: 'pending',
  },
  {
    id: 'email_3',
    sender: 'dave@example.com',
    recipients: ['bob@example.com'],
    subject: 'Invoice Attached',
    snippet: 'Please find the invoice attached...',
    body: `Hi Bob,\n\nPlease find the invoice attached for last month.\n\nRegards,\nDave`,
    date: '2024-06-23T16:45:00Z',
    importance: 'low',
    status: 'approved',
  },
]; 