# SundayL & MAGK Development Plan
====================================================
COMPLETED TASKS:
====================================================
### docs Specific Tasks (within code base)
- [X] 0.1.0: all good
- [X]: bug.md: MOVE TODO to the plan.md and organize it better 

### Backend Specific Tasks (within code base)
- [X] src/api/analyze-email and src/api/generate-reply are they used or not? compared to openai-service.ts, which one is actually used? if there are unused ones, remove them, if the api is actually used, then use one system for all the ai calls, maybe seperate out some of the openai services into different functions in a folder for modularity
- [?]: Knowledge Base: ensure that there are utility restful functions that can CRUD people and projects 
and be able to be ran by any LLM, or manually, right now you cannot add people manually, you should 
be able to add them manually filling a form out, OR use a NEW openAI call to be able to add people 
and project automatically
- [X]: AI function: implement the save to KB function that can write to knowledge base CRUD people and project function based on the email threads in the input (if there is nothing) and UPDATE the thread instead with both existing and new data  if there are already infromation there
- [X]: Types.ts and also the information for people should be a little bit more comprehensive
in the schema type, right now its simple make sure it is easily possible for admins to add new types 
in teh future and have that reflected in the ui


### Frontend Specific Tasks (within code base)
- [X]: Knowledge Base: The forms for adding new people and projects should be a pop up with a form, in the form there should be an option to generate a new person or project based on AI
- [X]: AI Function for above: generate a new person based on AI, and then add them to the knowledge base
- [X]: there should be an ability to edit manually or edit with ai as well, removing people and projects is just a delete function
- [X]: Add a summary field for people and projects, and a notes field for people, and a description field for projects
- [X]: THE UI is still ugly, use consistent colors and styles, and shadcn/ui components to help with this

==================================
- [x]: Settings Page: There should be different sections for different settings: here are the initial ones you should constrainedMemory
Profile, AI Setting, Usage, and Other Settings
- [x]:  Settings Page: Profile setting does not have profile picture, set up profile picture and store in 
 lcoal storage for now
AI default model, drop down for default model if there are multiple models
A place to showcase what models and api keys are being used (openai and anthropic and open source) and teh ability to add and remove keys
- [x]: Playground, a way to show all the lib/ai Functions, their prompts tmeperature and paragemeters 
and have a way to edit them and update them 
- [x]: Showcase total usage and cost for each model and api key accurately and in total, and set limits like in openai
- [x]: the knowledge base displayed should use the unified stoarge object as well (entity storage)

==================================
MISC TASKS
- [x]: Write documentation for the thread details, and tinder thread card because its very compliex
- [X]: Notifications should have more colors and types.
- [X]: IF a component is used globally, then it should be in the components folder, if not and only used in one place, then there should a folder for each page that has unique copmonents
- [X]: Extract to project doesn't work yet

====================================================
## FINISHED TASKS PART 2
====================================================
### 1.1 Environment & Project Setup
- [x] Install dependencies (`npm install`)
- [x] Set up `.env.local` from example
- [X] Add/refine API keys for Supabase, OpenAI/Anthropic
- [x] Configure Tailwind CSS

### 1.2 Database & Schem
### 1.3 Core Infrastructure
- [x] Initialize Next.js app (with TypeScript)
- [x] Set up project structure (src/app, components, lib, types, hooks, mock)
### 1.4 Email Processing Foundation + AI
- [x] Showcase Usage in settings to show how much everything is being used for


### 1.5 UI & Workflow
- [x] Create UI spec sheet (see `docs/ui-spec.md`)
- [x] Build sample email UI (list + detail view)
- [x] Implement approve/reject workflow (local state)
- [x] Status updates in UI
- [x] Basic styling with Tailwind & shadcn/ui
- [x] **Thread-based email grouping** (2024-12-25)
- [x] **AI-generated reply drafts** (2024-12-25)
- [x] **Knowledge base sidebar (people & projects)** (2024-12-25)
- [x] **Modern UI with shadcn/ui components** (2024-12-25)
- [x] **Tinder View for email triage** (swipe/approve/reject/edit/store)
- [x] **AI-generated email summary and importance classification in list**
- [x] **Manual knowledge base button in email views**
- [x] **Knowledge base: detailed person/project info, network, threads**
- [x] **Settings: profile pic, API key, usage/cost, hours saved**

### 1.6 Bug Tracking & QA
- [x] Log installation and setup bugs in `bugs.md`
- [x] Log and fix new bugs as they arise

### Archived Tasks
- [x] Set up Clerk authentication and OAuth


FINISHED TASKS PART 3
### Human-in-the-Loop Interface
- [x] **Email Review Dashboard**: UI for reviewing processed emails (2024-12-25)
- [x] **Approval/Rejection Workflow**: User interaction with AI suggestions (2024-12-25)
- [x] **Email Thread Management**: Group related emails (2024-12-25)

### Backend Integration
- [x] **Supabase Schema Created**: threads, messages, draft_replies, people, projects (2024-12-25)
- [x] **Supabase Integration**: Replace mock data with real database
- [x] **Real OpenAI Integration**: Wire up actual API calls
- [x] **Gmail API Integration**: Fetch real emails

### New Features Added (2024-12-25)
- [x] **Thread-based UI**: Emails grouped by conversation threads
- [x] **AI Draft Replies**: Generate and approve/reject AI responses
- [x] **Knowledge Base**: Track people and projects from emails
- [x] **Modern Design**: Beautiful UI with shadcn/ui components
- [x] **Sending Animation**: Visual feedback when approving replies
- [x] **API Credits System**: Track usage of AI features

### Next Immediate Steps
- [x] Create landing page to showcase the product
- [x] Implement Supabase data fetching/mutations
- [x] Wire up real OpenAI API for reply generation
- [x] Add more API routes for knowledge base operations
- [x] Implement real email sending (mock for now)
- [x] Add search and filtering capabilities
- [x] Implement user authentication with Clerk/Supabase Auth

====================================================
## 0. Operational Tasls
====================================================
### MAGK Tasks
- [ ]: Create a documentation that labels all the possible functions such as summarization, generation, editing, translation, and other functions from the open AI playground and their usage prompts for initial module creation for workflows. also create a table of content for all the functions there
- [ ]: Implement a MAGK playground that allows the tweaking of the ai utility functions, then save it
- [ ]: Build a LangGraph workflow builder that lets users compose, visualise, and persist custom AI workflows
- [ ]: Implement initial MCP protocol (gRPC) and containerise Notion & Gmail MCP servers for local testing

### DOCUMENTATION  Specific Tasks (within code base)
- [ ]: Change the name of the entire code base from SundayL to Sunday for all parts of the code base with the full audit.
- []: Plan.md: reorganize the plan.md to have a human plan: a long term todo list that tracks all major future feautres, and move non execution related stuff into other doucmentations that is more related
- [ ] 0.2.0: Update Documentation: there are actually some openai api integrations that works in 0.2.0 and it is not mocked, manual addition of knowledge base doesn't work yet
- [ ] bug tracking: bugs.md should track completed bugs based on version to be a bit more organized, additionally, there are dependecies issues (which are bugs but for some reason in different sections) and also todo list bugs, unify them into different pipelines (todo list bugs are the first reports, and there are detailed bug reports that have actions taken and suggested next steps, and other fields included in the.md, and dependencies are just a type of a bug)

### Frontend BUGS 
====================================================================
- []: Tinder Page: Major bug, currently shows no threads when the thread is clicked on and actually crashes the app when you click on the thread. Even though there's mock thread, that should be in a local storage or filled if there's no thread in there. Significant bug that needs to be fixed.
- []: Main page: New reply, editing reply, improve and apply with AI does not work at all. With the new unified storage system.
- []: Main page: Import and start doesn't work. The status changes also doesn't work with the new 0.2.5 version.
- []: Main Page: When an email is sent, the workflow doesn't work as in the reply is not permanent and you must make it such that the replies is not editable when it's sent and when a workflow is rejected, you should be able to edit the workflow.

### Backend FEATURES
==================================================================
- []: Supabase **prod** & **staging** environment setup with credentials managed in `.env.local`
- []: Create core tables (`users`, `emails`, `email_threads`, `tasks`, `people`, `projects`, `embeddings`, `usage_logs`) and enforce row-level security
- []: Gmail ingestion micro-service (OAuth2, 5-minute cron sync, attachment storage in Supabase buckets)
- []: LangGraph AI pipeline: summarisation → importance scoring → task detection → entity extraction → draft reply generation
- []: Retrieval-augmented search layer (LlamaIndex + pgvector) exposed via `/api/search`
- []: Secure REST API layer guarded by NextAuth session; add rate-limiting & edge-cache support
- []: Monitoring & usage dashboard powered by Logflare (logs), Sentry (errors), and `usage_logs` table
- []: CI/CD pipeline with GitHub Actions (lint → type-check → test → preview deploy) and automated Supabase migrations
- []: MCP Phase-2 integration – bidirectional sync between Supabase tasks and Notion/Gmail via gRPC protocol
- []: Real email sending pipeline via Gmail API (`gmail.send` scope) with background queue and retry logic
- []: User authentication with NextAuth (Google provider) and secure session handling

### Frontend FEATURES PART 2
==================================================================
- []: TASK PAGE: Create a clickup database  workflow with list views showing tasks, priorities, etc
- []: TASK Page: there should be a way to create a new email thread from scratch from the task page, and then have a way to add it to the tasks page directly from the task page
- []: Main page: Implement scrolling and patch elation when there's more and more emails to process and display by 10 emails per page.
- []: Usage dashboard UI with charts for tokens, cost, and hours saved
- []: Add semantic search bar that calls `/api/search` and highlights results
- []: Improve responsive design for mobile & tablet breakpoints
- []: Global error boundary and rich toast notifications for API failures
- []: Settings page enhancements – add / remove API keys, default model dropdown
- []: Dark-mode refinements with saved user preference
- []: Enhanced task list UI with status filters, drag-and-drop prioritisation, linked to Supabase `tasks` table
- []: Performance optimisation for large email / thread lists (virtualisation & lazy data fetching)


### V0.3.0: BACKEND & INFRASTRUCTURE ROADMAP
====================================================================
**Objective**: Deliver a production-ready backend that ingests Gmail messages, processes them with AI, persists rich metadata, and exposes secure APIs while tracking cost and usage.

#### 1. Supabase Foundation
- [ ] Provision separate **prod** and **staging** projects and store credentials in `.env.local`.
- [ ] Create tables: `users`, `emails`, `email_threads`, `tasks`, `people`, `projects`, `embeddings`, `usage_logs`.
- [ ] Define relationships & indexes (FKs, composite keys) for performant queries.
- [ ] Implement **Row-Level Security**:
  - [ ] User-scoped read/write policies.
  - [ ] Service-role bypass for server functions.
- [ ] Configure Supabase **Storage** buckets: `profile_pics`, `attachments`.
- [ ] Generate TypeScript client with `supabase gen types typescript --linked`.
- [ ] Add seed script (`pnpm supabase db seed`) for local development.

#### 2. Gmail Ingestion Service
- [ ] Implement OAuth2 flow via **NextAuth Google provider** requesting `gmail.readonly` and `gmail.send`.
- [ ] Background edge-function / cron to pull new messages every 5 min and store in Supabase.
- [ ] Normalize and persist:
  - [ ] Headers, plain text, HTML, attachments (store file in bucket).
  - [ ] Thread reconstruction → link to `email_threads`.
- [ ] Fire webhook/queue job to trigger AI pipeline on new email.

#### 3. AI Processing Pipeline (LangGraph Workers)
- [ ] Set up **LangGraph** graph with the following nodes:
  - [ ] `summarizeEmail` (model: `gpt-4o-mini`)
  - [ ] `classifyImportance` (model: `gpt-4o-nano`)
  - [ ] `detectTasks & followUps` (model: `gpt-4o-nano`)
  - [ ] `extractEntities` (model: `gpt-4o`)
  - [ ] `generateDraftReply` (model: `gpt-4o`)
- [ ] Refactor all OpenAI calls to shared `lib/ai/openai-service.ts` (retry, exponential backoff, logging).
- [ ] Persist outputs (summary, importance_score, tasks, entities, draft_reply) back to Supabase.

#### 4. Knowledge Base & Retrieval-Augmented Generation
- [ ] Integrate **LlamaIndex**; create RAG over email history.
- [ ] Generate embeddings (`text-embedding-3-small`) for every email & store in `embeddings` (pgvector).
- [ ] Build semantic search endpoint `/api/search`.
- [ ] Construct **Knowledge Graph** views connecting People ↔ Projects ↔ Threads.

#### 5. API & Service Layer
- [ ] RESTful route handlers under `/api/*` protected by NextAuth session.
- [ ] Add rate-limiting (e.g., `@upstash/ratelimit`) and caching where appropriate.
- [ ] Implement RPC helpers for common Supabase actions.

#### 6. Monitoring, Usage, and Cost Dashboard
- [ ] Stream Supabase logs to **Logflare**; surface errors in **Sentry**.
- [ ] Log per-user token usage in `usage_logs`.
- [ ] Expose `/api/usage` and UI charts (tokens, cost, hours saved).

#### 7. DevOps & CI/CD
- [ ] GitHub Actions workflow: `lint → type-check → unit-test → deploy preview`.
- [ ] Database migrations via `supabase migration` files committed to repo.
- [ ] Secrets managed via GitHub & Vercel environment variables.
- [ ] Enable preview deployments for each PR.

#### 8. MCP & External Integrations (Phase 2)
- [ ] Containerize **Notion MCP** and **Gmail MCP** servers.
- [ ] Define gRPC **MCP Protocol**; generate client stubs.
- [ ] Implement bidirectional sync between Supabase tasks and Notion.

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
- Validate thread grouping under complex nested conversations
- Verify AI reply generation quality across unusual email scenarios

### 3.4 Manual QA
- Regular manual walkthroughs of UI
- Cross-browser and device testing
- Regression testing after major changes

### 3.5 Bug Tracking
- All bugs and issues tracked in `bugs.md` (see new format)
- Prioritize and assign bugs for each sprint

---
=====================================
# Next Steps for SundayL Development
=====================================
## Tools & Technologies Under Consideration
**Mintify** - Potential integration for financial email processing and expense tracking automation.
---

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
