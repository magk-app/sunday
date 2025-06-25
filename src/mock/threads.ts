import type { EmailThread, Email, DraftReply, Person, Project } from '../types';
import { mockEmails } from './emails';

// Group emails into threads
export const mockThreads: EmailThread[] = [
  {
    id: 'thread_ark',
    user_id: 'user_jack',
    subject: 'Interested in Project ARK and MCP App Store',
    participants: ['jack145945@gmail.com', 'nmorgan@mit.edu', 'sipb-ark@mit.edu'],
    last_message_at: new Date('2024-06-12T09:00:00Z'),
    message_count: 5,
    has_draft: true,
    status: 'active',
    created_at: new Date('2024-06-10T09:00:00Z'),
    updated_at: new Date('2024-06-12T09:00:00Z'),
  },
  {
    id: 'thread_texts',
    user_id: 'user_jack',
    subject: 'Texts.com Desktop App Crashing on Windows 11',
    participants: ['jack145945@gmail.com', 'support@texts.com', 'info@beeper.com'],
    last_message_at: new Date('2024-06-24T13:12:00Z'),
    message_count: 7,
    has_draft: true,
    status: 'active',
    created_at: new Date('2024-06-24T11:20:00Z'),
    updated_at: new Date('2024-06-24T13:12:00Z'),
  },
];

// Mock draft replies
export const mockDraftReplies: DraftReply[] = [
  {
    id: 'draft_ark_1',
    thread_id: 'thread_ark',
    user_id: 'user_jack',
    body: `Hi Nathaniel,

Thanks for the meeting details! Friday 1pm works perfectly for me. I'm excited to learn more about Project ARK and how I can contribute.

See you then!

Best regards,
Jack`,
    generated_at: new Date('2024-06-12T10:00:00Z'),
    status: 'pending',
    created_at: new Date('2024-06-12T10:00:00Z'),
    updated_at: new Date('2024-06-12T10:00:00Z'),
  },
  {
    id: 'draft_texts_1',
    thread_id: 'thread_texts',
    user_id: 'user_jack',
    body: `Hi team,

I appreciate your efforts to help resolve this issue. I've tried the suggested fix but unfortunately the app is still crashing immediately on launch.

Here are some additional details that might help:
- Windows 11 version: 22H2
- Texts.com version: 0.84.12
- No error messages appear
- Event Viewer shows no obvious errors

Would it be helpful if I provided debug logs or tried a beta version?

Thanks,
Jack`,
    generated_at: new Date('2024-06-24T13:15:00Z'),
    status: 'pending',
    created_at: new Date('2024-06-24T13:15:00Z'),
    updated_at: new Date('2024-06-24T13:15:00Z'),
  },
];

// Mock people from emails
export const mockPeople: Person[] = [
  {
    id: 'person_nathaniel',
    user_id: 'user_jack',
    email: 'nmorgan@mit.edu',
    name: 'Nathaniel Morgan',
    company: 'MIT',
    role: 'Project ARK Lead',
    notes: 'Leading the MCP app store project. Very responsive and helpful.',
    last_contacted: new Date('2024-06-12T09:00:00Z'),
    created_at: new Date('2024-06-10T09:00:00Z'),
    updated_at: new Date('2024-06-12T09:00:00Z'),
  },
  {
    id: 'person_obed',
    user_id: 'user_jack',
    email: 'info@beeper.com',
    name: 'Obed (Beeper Support)',
    company: 'Beeper',
    role: 'Support Engineer',
    notes: 'Helpful support agent for Texts.com issues.',
    last_contacted: new Date('2024-06-24T13:12:00Z'),
    created_at: new Date('2024-06-24T11:21:00Z'),
    updated_at: new Date('2024-06-24T13:12:00Z'),
  },
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: 'project_ark',
    user_id: 'user_jack',
    name: 'Project ARK - MCP App Store',
    description: 'Building a modular LLM setup and MCP app store for AI workflow automation',
    status: 'active',
    participants: ['person_nathaniel'],
    created_at: new Date('2024-06-10T09:00:00Z'),
    updated_at: new Date('2024-06-12T09:00:00Z'),
  },
];

// Helper to get thread messages
export function getThreadMessages(threadId: string): Email[] {
  const threadMap: Record<string, string[]> = {
    thread_ark: ['email_ark_1', 'email_ark_2', 'email_ark_3', 'email_ark_4', 'email_ark_5'],
    thread_texts: ['email_texts_1', 'email_texts_2', 'email_texts_3', 'email_texts_4', 'email_texts_5', 'email_texts_6', 'email_texts_7'],
  };
  
  const emailIds = threadMap[threadId] || [];
  return mockEmails.filter(email => emailIds.includes(email.id));
} 