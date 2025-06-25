# SundayL & MAGK Development Plan
====================================================
## 1. Immediate Next Steps (Sprint & Action Items)
====================================================
### 1.1 Environment & Project Setup
- [x] Install dependencies (`npm install`)
- [x] Set up `.env.local` from example
- [X] Add/refine API keys for Supabase, OpenAI/Anthropic
- [x] Configure Tailwind CSS
- [ ] Set up Supabase project and credentials
- [ ] Enable Gmail API in Google Cloud
- [ ] Fill in all API keys in `.env.local`

### 1.2 Database & Schema
- [ ] Create Supabase tables for emails, threads, tasks
- [ ] Set up Row Level Security (RLS) policies
- [ ] Generate TypeScript types from schema

### 1.3 Core Infrastructure
- [x] Initialize Next.js app (with TypeScript)
- [x] Set up project structure (src/app, components, lib, types, hooks, mock)
- [ ] Configure Supabase client
- [ ] Implement basic API routes

### 1.4 Email Processing Foundation + AI
- [ ] Set up langgraph using the javascript repo and set up agents
- [ ] Set up email scraping from gmail using gmail authentication
- [ ] Find and process email threads and display them online
- [ ] Showcase Usage in settings to show how much everything is being used for
- [ ] Integrate Gmail API for fetching emails
- [ ] Parse emails (subject, sender, body, etc.)
- [ ] Store emails in Supabase
- [ ] Display email list in UI (mock/local data for MVP)
### AI Model Selection & Cost Tracking (TODO)
- [ ] Update all OpenAI API calls to use centralized `openai-service.ts` for consistency and maintainability.
- [ ] Use the following models for each feature:
    - Summarize emails: **gpt-4o-mini** ($0.0005 input / $0.0015 output per 1K tokens)
    - Generate response: **gpt-4o** ($0.005 input / $0.015 output per 1K tokens)
    - Save to knowledge base: **gpt-4o** ($0.005 input / $0.015 output per 1K tokens)
    - Importance classification: **gpt-4o-nano** ($0.00025 input / $0.00075 output per 1K tokens)
- [ ] Display estimated costs (and 50% discounted "Sunday Surfaces" cost) in **Settings → Usage & Analytics**.
- [ ] Add a usage dashboard showing: total tokens, estimated $ cost, discounted cost, emails processed, hours saved (5 min per email).
- [ ] Implement a "Scrape to Knowledge Base" button that ingests the current email/thread and stores AI-enriched metadata.

### 1.5 UI & Workflow
- [x] Create UI spec sheet (see `docs/ui-spec.md`)
- [x] Build sample email UI (list + detail view)
- [ ] Implement approve/reject workflow (local state)
- [x] Status updates in UI
- [x] Basic styling with Tailwind & shadcn/ui
- [x] **Thread-based email grouping** (2024-12-25)
- [x] **AI-generated reply drafts** (2024-12-25)
- [x] **Knowledge base sidebar (people & projects)** (2024-12-25)
- [x] **Modern UI with shadcn/ui components** (2024-12-25)
- [ ] Landing page for product showcase
- [ ] **Tinder View for email triage** (swipe/approve/reject/edit/store)
- [ ] **AI-generated email summary and importance classification in list**
- [ ] **Status tags with workflow colors (pending/approved/rejected)**
- [ ] **Manual knowledge base button in email views**
- [ ] **Knowledge base: detailed person/project info, network, threads**
- [ ] **Settings: profile pic, API key, usage/cost, hours saved**
- [ ] **Rescrape button with menu for email import**

### 1.6 Bug Tracking & QA
- [ ] Log installation and setup bugs in `bugs.md`
- [ ] Log and fix new bugs as they arise

### Archived Tasks
- [ ] Set up Clerk authentication and OAuth


---
====================================================
## 2. Long-Term Development Plan (Hierarchical by Module)
====================================================

### 2.1 Core Email Assistant
- Email fetching, parsing, and storage
- AI-powered email categorization and importance scoring
- Approval/rejection workflow (human-in-the-loop)
- Task extraction and follow-up detection
- Email thread management
- Daily briefing and notification system

### 2.2 AI & Knowledge Base
- Integrate OpenAI/Anthropic for email analysis
- Implement LangGraph workflow for email processing
- LlamaIndex RAG setup for knowledge base
- Generate and store email embeddings
- Semantic search across email history
- User preference learning system

### 2.3 MAGK Framework
- Workflow creation agent (AI builds custom workflows)
- MCP server integration (Notion, Gmail, etc.)
- MCP protocol implementation (cross-platform sync)
- Workflow marketplace (share and rate workflows)
- Compositional workflow system (combine multiple workflows)

### 2.4 UI/UX & Human-in-the-Loop
- Email review dashboard
- Task management interface
- Knowledge base UI
- Workflow editor (future)
- Notifications/toasts and status bar

### 2.5 Integrations & Extensibility
- Add connectors for Slack, WhatsApp, Notion, Google Calendar, etc.
- Modular architecture for easy integration
- API endpoints for all major modules

### 2.6 DevOps & Security
- CI/CD pipeline setup
- Automated testing (unit, integration, E2E)
- Secrets management and audit logging
- Data encryption and GDPR compliance

---
====================================================
## 3. Testing & Quality Assurance
====================================================

### 3.1 Unit Testing
- Test utility functions, API handlers, and core logic
- Use Jest or similar framework

### 3.2 Integration Testing
- Test API endpoints with database
- Test email fetching/parsing end-to-end

### 3.3 End-to-End (E2E) Testing
- Simulate user flows (sign-in, email review, approval, etc.)
- Use Cypress or Playwright

### 3.4 Manual QA
- Regular manual walkthroughs of UI
- Cross-browser and device testing
- Regression testing after major changes

### 3.5 Bug Tracking
- All bugs and issues tracked in `bugs.md` (see new format)
- Prioritize and assign bugs for each sprint

---
====================================================
## 4. Notes
====================================================

- Detailed database schema, user preferences, and advanced ideas have been moved to `docs/specs.md` and `docs/ideas.md` for clarity.
- Success metrics and gamification ideas are tracked in `docs/ideas.md`.
- This plan is reviewed and updated weekly.

**Status:** 🟡 In Progress - Major UI refactor completed
**Last Updated:** 2024-12-25

=====================================
# Next Steps for SundayL Development
=====================================

## Tools & Technologies Under Consideration
**Mintify** - Potential integration for financial email processing and expense tracking automation.
---

## General Tasks for SundayL
### Core Infrastructure
- [x] **Basic Next.js App**: Create main layout and pages (shadCN)
- [ ] **Authentication Flow**: Implement Clerk sign-in/sign-up
- [ ] **Database Connection**: Set up Supabase client and basic queries
- [ ] **API Routes**: Create basic API structure

### Email Processing Foundation
- [ ] **Gmail API Integration**: Basic email fetching functionality
- [ ] **Email Parsing**: Extract subject, sender, body, etc.
- [ ] **Database Storage**: Store emails in Supabase
- [ ] **Basic UI**: Simple email list view

### Frontend Spec & UI Prototyping
- [ ] **Create UI Spec Sheet**: Document the layout and components for the MVP (no auth, just Gmail API and local DB)
- [ ] **Build Example Email UI**: Show a sample email in the interface
- [ ] **Build Example Workflow UI**: Show a simple approval workflow (approve/reject email)
- [ ] **Use local state or mock data for now**

### Bug Tracking
- [x] **Log Installation Bugs**: See `bugs.md` for langgraph and dependency issues
- [ ] **Log and Fix New Bugs**: Record any new issues in `bugs.md` and attempt to fix; if not, document them

## Week 2 Goals: Email Processing

### AI Integration
- [x] **OpenAI/Anthropic Setup**: Configure AI model access (2024-12-25)
- [ ] **Email Categorization**: Basic AI-powered email classification
- [ ] **Importance Scoring**: Implement email importance algorithm
- [ ] **Follow-up Detection**: Identify emails requiring action
- [x] **Draft Reply Generation**: AI-powered reply suggestions (2024-12-25)

### Human-in-the-Loop Interface
- [x] **Email Review Dashboard**: UI for reviewing processed emails (2024-12-25)
- [x] **Approval/Rejection Workflow**: User interaction with AI suggestions (2024-12-25)
- [x] **Email Thread Management**: Group related emails (2024-12-25)
- [ ] **Task Creation**: Convert emails to actionable tasks

### Backend Integration
- [x] **Supabase Schema Created**: threads, messages, draft_replies, people, projects (2024-12-25)
- [ ] **Supabase Integration**: Replace mock data with real database
- [ ] **Real OpenAI Integration**: Wire up actual API calls
- [ ] **Gmail API Integration**: Fetch real emails

### New Features Added (2024-12-25)
- [x] **Thread-based UI**: Emails grouped by conversation threads
- [x] **AI Draft Replies**: Generate and approve/reject AI responses
- [x] **Knowledge Base**: Track people and projects from emails
- [x] **Modern Design**: Beautiful UI with shadcn/ui components
- [x] **Sending Animation**: Visual feedback when approving replies
- [x] **API Credits System**: Track usage of AI features

### Next Immediate Steps
- [ ] Create landing page to showcase the product
- [ ] Implement Supabase data fetching/mutations
- [ ] Wire up real OpenAI API for reply generation
- [ ] Add more API routes for knowledge base operations
- [ ] Implement real email sending (mock for now)
- [ ] Add search and filtering capabilities
- [ ] Implement user authentication with Clerk/Supabase Auth

## Week 3 Goals: Advanced Features

### Knowledge Base
- [ ] **LlamaIndex Setup**: Configure RAG system
- [ ] **Email Embeddings**: Generate and store email embeddings
- [ ] **Knowledge Graph**: Build connections between emails, people, projects
- [ ] **Search Functionality**: Semantic search across email history

### LangGraph Workflow
- [ ] **Workflow Definition**: Define email processing workflow
- [ ] **Node Implementation**: Create individual workflow nodes
- [ ] **State Management**: Handle workflow state and transitions
- [ ] **Error Handling**: Robust error handling and recovery

## Week 4 Goals: MCP Integration

### MCP Server Setup
- [ ] **Notion MCP**: Set up Notion MCP server for task management
- [ ] **Gmail MCP**: Implement Gmail MCP server for email access
- [ ] **MCP Protocol**: Implement MCP client for server communication
- [ ] **Cross-Platform Sync**: Synchronize data across platforms

### MAGK Framework Foundation
- [ ] **Workflow Creation Agent**: AI agent for building custom workflows
- [ ] **MCP Connection Framework**: Generic MCP server connection system
- [ ] **Workflow Marketplace**: Basic marketplace for sharing workflows
- [ ] **Compositional Workflows**: System for combining multiple workflows

## Technical Implementation Details

### File Structure
```
sundayl/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   └── api/                 # API route handlers
├── prisma/                  # Database schema (if using Prisma)
├── public/                  # Static assets
└── docs/                    # Documentation
```

### Key Configuration Files Needed
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `.env.local` - Environment variables
- `supabase/config.toml` - Supabase configuration

### API Routes to Implement
- `/api/auth/*` - Authentication endpoints
- `/api/emails/*` - Email processing endpoints
- `/api/tasks/*` - Task management endpoints
- `/api/workflows/*` - Workflow management endpoints
- `/api/mcp/*` - MCP server endpoints

===================================
## Success Criteria for Each Phase
===================================

### Phase 1 Success (Week 1)
- [ ] User can sign up and log in
- [ ] Basic email fetching works
- [ ] Emails are stored in database
- [ ] Simple UI displays email list

### Phase 2 Success (Week 2)
- [ ] AI categorizes emails accurately
- [ ] Users can approve/reject AI suggestions
- [ ] Tasks are created from emails
- [ ] Email threads are properly grouped

### Phase 3 Success (Week 3)
- [ ] Knowledge base provides relevant context
- [ ] LangGraph workflow processes emails end-to-end
- [ ] User preferences improve over time
- [ ] Search functionality works effectively

### Phase 4 Success (Week 4)
- [ ] MCP servers are connected and functional
- [ ] Workflow creation agent can build custom workflows
- [ ] Marketplace allows workflow sharing
- [ ] Cross-platform data synchronization works

## Risk Mitigation

### Technical Risks
- **Gmail API Limits**: Implement rate limiting and caching
- **AI Model Costs**: Monitor usage and implement cost controls
- **Database Performance**: Optimize queries and implement indexing
- **Security**: Implement proper authentication and data encryption

### Timeline Risks
- **Scope Creep**: Stick to defined phases and features
- **Technical Debt**: Regular refactoring and code review
- **Integration Issues**: Test integrations early and often
- **Performance Issues**: Monitor and optimize continuously

---

**Next Review**: Daily during active development
**Status**: 🟡 In Progress

0.1.2: **Last Updated**: 2024-12-25: Implemented thread-based UI, AI reply generation, knowledge base, and modern design with shadcn/ui

