# SundayL – AI Email & Workflow Automation Platform

## Project Description
SundayL is an advanced AI-powered email assistant and workflow automation platform. It is designed to help users manage, triage, and act on their digital communications with unprecedented efficiency. Built on the MAGK (Multi-Agent Knowledge Graph) framework, SundayL leverages state-of-the-art AI to automate repetitive tasks, extract actionable insights, and provide a unified interface for all your messaging and productivity needs.

## Vision
Our vision is to create a central AI "chief-of-staff" that connects to all your digital tools—email, messaging, calendar, notes, and more—empowering you to focus on high-value work while the AI handles the busywork. SundayL aims to:
- Unify your digital communications in one intelligent dashboard
- Automate triage, summarization, and follow-up for emails and messages
- Extract and track tasks, commitments, and key information
- Provide actionable suggestions and reminders
- Offer a seamless, human-in-the-loop experience for trust and control

## Key Features
- **Unified Inbox**: Aggregate emails (Gmail, Outlook, etc.) and, soon, messages from other platforms into a single, searchable feed.
- **AI-Powered Triage**: Automatically prioritize, categorize, and flag important emails and threads.
- **Smart Summaries**: Generate concise summaries of long email threads and highlight action items, deadlines, and questions.
- **Draft Replies & Follow-ups**: One-click AI-generated responses in your tone, with easy review and editing before sending.
- **Task Extraction**: Detect and extract tasks, commitments, and reminders from emails, and sync with your preferred task manager.
- **Daily Briefing**: Receive a morning summary of your most important emails, meetings, and tasks.
- **Knowledge Base**: Track people, projects, and conversations for context and recall, building a "second brain" for your communications.
- **Gamification**: Earn points and achievements for processing emails and completing tasks, making productivity fun.
- **Human-in-the-Loop Controls**: Always review and approve AI actions before they're executed, ensuring trust and transparency.
- **Extensible Integrations**: Modular architecture for adding new connectors (Slack, WhatsApp, Notion, etc.) as the platform grows.

## Technical Stack & Architecture
- **Frontend/UI**:
  - Next.js (TypeScript) for a modern, responsive web app
  - Tailwind CSS & shadcn/ui for rapid, beautiful UI development
  - React Query/SWR for efficient data fetching and caching
- **Backend/Orchestration**:
  - Node.js (Express/Fastify) or Python (FastAPI/Django) for API and orchestration
  - Event-driven design for real-time updates and automation triggers
  - REST/GraphQL API for frontend-backend communication
- **AI/LLM Layer**:
  - OpenAI GPT-4.1, Anthropic Claude, and support for local LLMs (Llama 2, Mistral)
  - Model router for cost/performance optimization
  - LangChain or similar for prompt orchestration and tool use
- **Integrations**:
  - Gmail API, Outlook/Graph API for email
  - Modular connectors for Slack, WhatsApp, Notion, Google Calendar, etc.
  - Model Context Protocol (MCP) for standardized tool integrations
- **Database & Storage**:
  - PostgreSQL (user data, configs, metadata)
  - Supabase for managed Postgres and authentication
  - S3/Cloud Storage for logs, files, and large data
  - Vector DB (ChromaDB, Pinecone) for semantic search and knowledge base
- **Cache & Performance**:
  - Redis or in-memory cache for fast context and deduplication
- **Security**:
  - OAuth 2.0 for secure authentication with external services
  - Encrypted data at rest and in transit
  - Secrets management and audit logging
- **DevOps & Cloud**:
  - Docker for containerization
  - AWS/GCP/Azure for scalable cloud deployment
  - CI/CD pipelines for automated testing and deployment

## Setup Guide
### Prerequisites
- Node.js 18+
- TypeScript
- Supabase account (for database and auth)
- Gmail API credentials (for email integration)
- Clerk or OAuth provider setup (for user authentication)
- (Optional) OpenAI/Anthropic API keys for advanced AI features

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/sundayl.git
   cd sundayl
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy the example environment file and fill in your API keys:
     ```bash
     cp env.example .env.local
     ```
   - Edit `.env.local` with your credentials:
     ```env
     GMAIL_CLIENT_ID=your_client_id
     GMAIL_CLIENT_SECRET=your_client_secret
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     CLERK_PUBLISHABLE_KEY=your_clerk_key
     CLERK_SECRET_KEY=your_clerk_secret
     OPENAI_API_KEY=your_openai_key
     ANTHROPIC_API_KEY=your_anthropic_key
     ```
4. **Initialize the database (if needed):**
   - Set up your Supabase project and run any migrations as described in `SETUP.md`.
5. **Start the development server:**
   ```bash
   npm run dev
   ```
6. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting
- If you encounter issues with API keys or authentication, double-check your `.env.local` file.
- For Gmail API issues, ensure your OAuth consent screen and scopes are correctly configured in Google Cloud Console.
- For Supabase, verify your project URL and anon key.
- See `SETUP.md` and `docs/execution/bugs.md` for more troubleshooting tips.

## File & Project Structure
```
sundayl/
├── src/
│   ├── app/                 # Next.js app directory (routing, pages)
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and API clients
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   └── mock/                # Mock data for development/testing
├── docs/                    # Documentation (standards, specs, business, execution)
│   ├── ui-spec.md           # UI/UX specifications
│   ├── standards.md         # Documentation standards & guidelines
│   ├── business.md          # Business model, GTM, and market opportunity
│   └── execution/           # Bugs, plans, sprints, and operational docs
├── plan.md                  # Development roadmap
├── next-steps.md            # Immediate next steps
├── SETUP.md                 # Detailed setup and onboarding guide
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

## Contributing
We welcome contributions from the community! To get started:
- Read our [contributing guidelines](docs/contributing.md) for coding standards, PR process, and code of conduct.
- Open issues for bugs, feature requests, or questions.
- Fork the repo and submit pull requests for improvements.
- Join our community discussions in the issues or on our chat platform (see `docs/standards.md`).

**Thank you for helping build the future of AI-powered productivity!** 