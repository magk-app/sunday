# SundayL - Email Assistant & MAGK Framework

## Overview

SundayL is an intelligent email assistant that processes, categorizes, and helps manage your email workflow. Built on the MAGK (Multi-Agent Knowledge Graph) framework, it provides a foundation for creating automated business processes with AI agents.

## SundayL Email Assistant

### Features
- **Automatic Email Processing**: Daily processing of emails to identify important threads requiring follow-up
- **Smart Categorization**: AI-powered classification of emails (customer support, business, etc.)
- **Human-in-the-Loop Interface**: Interactive platform for reviewing and approving AI suggestions
- **Knowledge Base**: Second brain functionality tracking people, projects, and conversations
- **Gamification**: Point system for email processing and task completion

### Technical Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: Gmail API, Clerk/OAuth authentication
- **Database**: Supabase for data persistence
- **AI Engine**: LangGraph for workflow orchestration, LlamaIndex for RAG
- **MLOps**: Internal AI database for user preference tracking and continuous improvement

## MAGK Framework

### Vision
A general platform for building automated business processes using AI agents. Users can describe their automation needs, and the platform creates and deploys custom workflows.

### Key Features
- **Workflow Creation**: AI agent that builds custom automation workflows
- **Integration Machine**: MCP (Model Context Protocol) server connections
- **Human-in-the-Loop Testing**: Trial periods with monitoring and feedback
- **Workflow Marketplace**: Publish, rate, and combine workflows
- **Compositional Agents**: Combine multiple workflows for complex processes
- **ROI Tracking**: Measure time saved vs. manual processing

### Business Model
- **Priority Waitlist**: $3 deposit for early access
- **Viral Loops**: Referral system to reduce CAC
- **Usage-Based Pricing**: API costs + 50% markup for cloud and agent credits

## Getting Started

### Prerequisites
- Node.js 18+
- TypeScript
- Supabase account
- Gmail API credentials
- Clerk/OAuth setup

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file with:
```
# Gmail API
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Development Roadmap

### Phase 1: Core Email Processing
- [ ] Gmail API integration
- [ ] Email parsing and categorization
- [ ] Basic UI for email review
- [ ] Supabase schema setup

### Phase 2: AI Enhancement
- [ ] LangGraph workflow implementation
- [ ] LlamaIndex RAG setup
- [ ] User preference learning
- [ ] Human-in-the-loop interface

### Phase 3: MAGK Platform
- [ ] MCP server integration
- [ ] Workflow creation agent
- [ ] Marketplace functionality
- [ ] Compositional workflows

## Contributing

This project follows a structured development approach with:
- TypeScript-first development
- Comprehensive testing
- Documentation-driven development
- Regular progress tracking via plan.md

## License

MIT License - see LICENSE file for details 