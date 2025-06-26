import type { EmailThread, Email, Person, Project } from '../types';
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
    status: 'pending',
    important: true,
    summary: 'Discussion about joining Project ARK and MCP App Store.',
    importance: 'high',
    created_at: new Date('2024-06-10T09:00:00Z'),
    updated_at: new Date('2024-06-12T09:00:00Z'),
    messages: mockEmails.filter(e => e.subject.includes('ARK')),
    aiReply: undefined,
  },
  {
    id: 'thread_texts',
    user_id: 'user_jack',
    subject: 'Texts.com Desktop App Crashing on Windows 11',
    participants: ['jack145945@gmail.com', 'support@texts.com', 'info@beeper.com'],
    last_message_at: new Date('2024-06-24T13:12:00Z'),
    message_count: 7,
    has_draft: true,
    status: 'pending',
    important: false,
    summary: 'Support request for Texts.com desktop app crash.',
    importance: 'urgent',
    created_at: new Date('2024-06-24T11:20:00Z'),
    updated_at: new Date('2024-06-24T13:12:00Z'),
    messages: mockEmails.filter(e => e.subject.includes('Texts.com')),
    aiReply: undefined,
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
// REMOVE getThreadMessages from here. Use the async version from entity-storage.ts instead. 