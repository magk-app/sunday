-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Email Threads Table
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  participants TEXT[] NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL,
  message_count INTEGER DEFAULT 0,
  has_draft BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'snoozed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table (renamed from emails)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  gmail_id TEXT UNIQUE,
  sender TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  snippet TEXT,
  importance_score NUMERIC(3,2) DEFAULT 0.5,
  sent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draft Replies Table
CREATE TABLE IF NOT EXISTS draft_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- People Table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  notes TEXT,
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Person-Project Relationships
CREATE TABLE IF NOT EXISTS person_project_relations (
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (person_id, project_id)
);

-- Indexes for performance
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_last_message_at ON threads(last_message_at DESC);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

CREATE INDEX idx_draft_replies_thread_id ON draft_replies(thread_id);
CREATE INDEX idx_draft_replies_status ON draft_replies(status);

CREATE INDEX idx_people_user_id ON people(user_id);
CREATE INDEX idx_people_email ON people(email);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Row Level Security (RLS) Policies
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_project_relations ENABLE ROW LEVEL SECURITY;

-- Policies (assuming auth.uid() returns the current user's ID)
CREATE POLICY "Users can view own threads" ON threads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own threads" ON threads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own threads" ON threads
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own messages" ON messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own draft replies" ON draft_replies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own draft replies" ON draft_replies
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own people" ON people
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own relations" ON person_project_relations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM people WHERE people.id = person_project_relations.person_id AND people.user_id = auth.uid())
  );

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draft_replies_updated_at BEFORE UPDATE ON draft_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 