// Database Types
export interface Email {
  id: string;
  user_id: string;
  gmail_id: string;
  subject: string;
  sender: string;
  recipients: string[];
  body: string;
  importance_score: number;
  category: EmailCategory;
  requires_followup: boolean;
  processed_at: Date;
  created_at: Date;
  updated_at: Date;
  snippet: string;
  date: string;
  importance: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
}

export interface Thread {
  id: string;
  gmail_thread_id: string;
  user_id: string;
  subject: string;
  participants: string[];
  last_activity: Date;
  status: ThreadStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  email_id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  category_weights: Record<EmailCategory, number>;
  importance_thresholds: {
    high: number;
    medium: number;
    low: number;
  };
  notification_settings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  created_at: Date;
  updated_at: Date;
}

// Enums
export enum EmailCategory {
  CUSTOMER_SUPPORT = 'customer_support',
  BUSINESS = 'business',
  PERSONAL = 'personal',
  MARKETING = 'marketing',
  SPAM = 'spam',
  UNCATEGORIZED = 'uncategorized',
}

export enum ThreadStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  RESOLVED = 'resolved',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Gmail API Types
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: GmailPayload;
  sizeEstimate: number;
}

export interface GmailPayload {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: GmailBody;
  parts?: GmailPayload[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailBody {
  attachmentId?: string;
  size: number;
  data?: string;
}

// AI Processing Types
export interface EmailAnalysis {
  category: EmailCategory;
  importance_score: number;
  requires_followup: boolean;
  suggested_actions: string[];
  extracted_entities: {
    people: string[];
    companies: string[];
    dates: string[];
    urls: string[];
  };
  summary: string;
}

export interface WorkflowNode {
  id: string;
  type: 'email_processor' | 'ai_analyzer' | 'task_creator' | 'notification_sender';
  config: Record<string, any>;
  next_nodes: string[];
  error_handler?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  entry_point: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// MCP Types
export interface MCPServer {
  id: string;
  name: string;
  type: 'notion' | 'gmail' | 'slack' | 'custom';
  config: Record<string, any>;
  is_connected: boolean;
  last_sync: Date;
}

export interface MCPMessage {
  id: string;
  server_id: string;
  type: 'request' | 'response' | 'notification';
  payload: any;
  timestamp: Date;
}

// UI Types
export interface EmailListItem {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  importance_score: number;
  category: EmailCategory;
  requires_followup: boolean;
  created_at: Date;
  is_read: boolean;
}

export interface DashboardStats {
  total_emails: number;
  unread_emails: number;
  pending_tasks: number;
  completed_tasks: number;
  emails_processed_today: number;
  time_saved_this_week: number; // in minutes
}

// Form Types
export interface EmailFilterForm {
  category?: EmailCategory;
  date_range?: {
    start: Date;
    end: Date;
  };
  importance_threshold?: number;
  requires_followup?: boolean;
  search_query?: string;
}

export interface TaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date?: Date;
  email_id?: string;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
  last_login: Date;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

export interface EmailThread {
  id: string;
  user_id: string;
  subject: string;
  participants: string[];
  last_message_at: Date;
  message_count: number;
  has_draft: boolean;
  status: 'active' | 'archived' | 'snoozed';
  importance?: 'urgent' | 'high' | 'medium' | 'low';
  summary?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DraftReply {
  id: string;
  thread_id: string;
  user_id: string;
  body: string;
  generated_at: Date;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Person {
  id: string;
  user_id: string;
  email: string;
  name: string;
  company?: string;
  role?: string;
  notes?: string;
  last_contacted?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  participants: string[]; // person IDs
  created_at: Date;
  updated_at: Date;
}

export interface PersonProjectRelation {
  person_id: string;
  project_id: string;
  role?: string;
  created_at: Date;
} 