# Sunday MVP UI Spec Sheet

## Overview
This document describes the user interface for the Sunday MVP. The goal is to display emails fetched from the Gmail API, allow users to view details, and approve or reject emails in a simple workflow. The UI is modern, beautiful, and workflow-driven, using Tailwind CSS and shadcn/ui. Authentication is optional for MVP; use mock/local data if needed.

---

## 1. Main Layout
- **Top Nav Bar**: App name/logo ("Sunday"), navigation links (Settings, Profile)
  - **Profile**: Shows user's name and avatar on the right; clicking opens a dropdown with options to log out and add account.
- **Sidebar (per page)**: Contextual navigation for each page (e.g., email folders for Email, knowledge sections for Knowledge Base, etc.)
- **Main Content Area**: Varies by page (Email List, Tinder View, Knowledge Base, Settings, etc.)

---

## 2. Pages & Components

### 2.1 Email List Page
- **List of emails** (mocked or from Gmail API)
  - Sender
  - Subject
  - Snippet/preview
  - Date/time
  - **AI-generated summary** (using GPT-4o mini)
  - **Importance indicator**: (urgent, high, medium, low) - classified by AI, shown as colored tag/icon
  - **Status**: (pending, approved, rejected) - shown as colored tag with background (workflow style)
  - **Manual Knowledge Base button**: Store this email/thread in the knowledge base
- **Search bar** (future: filter by sender, date, etc.)
- **Pagination or infinite scroll** (if >20 emails)
- **Rescrape Button**: Triggers Gmail rescrape; opens a menu to select how many emails to fetch (e.g., 20, 50, 100, all)

### 2.2 Tinder View Page
- **Single email at a time** (card view)
  - Shows sender, subject, body, AI summary, importance, status, and draft reply
  - **Swipe right**: Approve
  - **Swipe left**: Reject
  - **Swipe down**: Edit reply
  - **Swipe up**: Store thread in knowledge base
  - **Manual buttons** for all actions (for desktop)
  - **Progress indicator**: Shows how many emails left to review

### 2.3 Email Detail View
- **Full email content**
  - Sender, recipients, subject, date
  - Body (HTML/text)
  - Attachments (future)
  - **Approval Workflow**
    - Approve button (primary)
    - Reject button (secondary)
    - Status indicator (pending/approved/rejected)
    - Optional: Add note or reason for action
  - **Manual Knowledge Base button**

### 2.4 Knowledge Base Page
- **List of people and projects**
- **Person Detail**
  - Name, contact info, avatar
  - AI-generated summary about the person
  - Email threads involving this person
  - Network level (how connected/important)
  - Reason for involvement/relationship
- **Project Detail**
  - Project name, description
  - Related people
  - Related email threads

### 2.5 Settings Page
- **Profile**
  - Change profile picture (file upload; discuss storage in DB or cloud)
  - Name, email
- **API Key Management**
  - Connect your own API key (overrides default company key)
- **Usage & Analytics**
  - See actual cost usage (OpenAI, Supabase, etc.)
  - See hours saved (assume 5 min per email processed)
- **Account**
  - Log out, add account

### 2.6 Workflow/Status Bar
- Shows current workflow step (e.g., "Reviewing", "Approved", "Rejected")
- Progress indicator (future: multi-step workflows)

### 2.7 Notifications/Toasts
- Show success/error messages for actions (approve/reject, save to knowledge base, etc.)

---

## 3. User Flow
1. User lands on the main page (Email List)
2. Sees a list of emails with AI summaries, importance, and status
3. Can rescrape emails from Gmail (choose how many)
4. Clicks an email to view details or enters Tinder View to process one by one
5. Approves, rejects, edits, or stores emails/threads in knowledge base
6. Navigates to Knowledge Base to view people/projects in detail
7. Uses Settings to manage profile, API keys, and view usage

---

## 4. Example Data
Import the data from emails.ts in mock. Add fields for AI summary, importance, and status.

---

## 5. Wireframe (Text)

```
+---------------------------------------------------------------+
| Sunday (logo)   [Email] [Tinder View] [Knowledge] [Settings]  |
|                        [Profile ▼]                            |
+-------------------+-------------------------------------------+
| Inbox            | Sender   Subject   AI Summary   Importance |
| Important        | Alice    Project...  ...         Urgent    |
| Approved         | Bob      Meeting... ...         Medium     |
| Rejected         | ...      ...         ...         ...       |
+-------------------+-------------------------------------------+
| [Email List]     | [Email Detail/Tinder View/Knowledge]       |
|                  | ...                                        |
+---------------------------------------------------------------+
```

---

## 6. MVP Requirements
- [ ] Email list with mock/example data, AI summary, importance, status
- [ ] Tinder View for workflow processing
- [ ] Email detail view
- [ ] Approve/Reject/Edit/Store to Knowledge Base workflow
- [ ] Status updates in UI
- [ ] Rescrape button with menu
- [ ] Knowledge Base with detailed person/project info
- [ ] Settings page with profile, API key, usage, hours saved
- [ ] Basic styling (Tailwind, shadcn/ui)
- [ ] No authentication required (for MVP)

---

## 7. Future Enhancements
- Real Gmail API integration
- User authentication (Clerk)
- Database persistence (Supabase)
- Multi-step workflows
- Attachments, labels, search/filter
- User preferences and analytics
- Advanced knowledge graph visualizations 