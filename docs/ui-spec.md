# SundayL MVP UI Spec Sheet

## Overview
This document describes the user interface for the SundayL MVP. The goal is to display emails fetched from the Gmail API, allow users to view details, and approve or reject emails in a simple workflow. No authentication is required for this version; use mock/local data if needed.

---

## 1. Main Layout
- **Header**: App name/logo, navigation (future: settings, profile)
- **Sidebar** (optional): Folders/labels (Inbox, Important, Approved, Rejected)
- **Main Content Area**: Email list and detail view

---

## 2. Components

### 2.1 Email List
- **List of emails** (mocked or from Gmail API)
  - Sender
  - Subject
  - Snippet/preview
  - Date/time
  - Importance indicator (icon/color)
  - Status (pending/approved/rejected)
- **Search bar** (future: filter by sender, date, etc.)
- **Pagination or infinite scroll** (if >20 emails)

### 2.2 Email Detail View
- **Full email content**
  - Sender, recipients, subject, date
  - Body (HTML/text)
  - Attachments (future)
- **Approval Workflow**
  - Approve button (primary)
  - Reject button (secondary)
  - Status indicator (pending/approved/rejected)
  - Optional: Add note or reason for action

### 2.3 Workflow/Status Bar
- Shows current workflow step (e.g., "Reviewing", "Approved", "Rejected")
- Progress indicator (future: multi-step workflows)

### 2.4 Notifications/Toasts
- Show success/error messages for actions (approve/reject)

---

## 3. User Flow
1. User lands on the main page
2. Sees a list of emails (mocked or fetched)
3. Clicks an email to view details
4. Approves or rejects the email
5. Status updates in the list and detail view

---

## 4. Example Data
```json
{
  "id": "email_1",
  "sender": "alice@example.com",
  "recipients": ["bob@example.com"],
  "subject": "Project Update",
  "snippet": "Hi Bob, just wanted to update you on...",
  "body": "Hi Bob,\n\nJust wanted to update you on the project status. We are on track for delivery next week.\n\nBest,\nAlice",
  "date": "2024-06-24T10:00:00Z",
  "importance": "high",
  "status": "pending"
}
```

---

## 5. Wireframe (Text)

```
+---------------------------------------------------+
| SundayL (logo)                [Search] [Settings] |
+-------------------+-------------------------------+
| Inbox            | Sender   Subject      Date     |
| Important        | Alice    Project...   10:00am  |
| Approved         | Bob      Meeting...   09:00am  |
| Rejected         | ...      ...          ...      |
+-------------------+-------------------------------+
| [Email List]     | [Email Detail View]            |
|                  | Sender: Alice                  |
|                  | Subject: Project Update        |
|                  | Body: ...                      |
|                  | [Approve] [Reject]             |
+---------------------------------------------------+
```

---

## 6. MVP Requirements
- [ ] Email list with mock/example data
- [ ] Email detail view
- [ ] Approve/Reject workflow (local state)
- [ ] Status updates in UI
- [ ] Basic styling (Tailwind, shadcn/ui)
- [ ] No authentication required

---

## 7. Future Enhancements
- Real Gmail API integration
- User authentication (Clerk)
- Database persistence (Supabase)
- Multi-step workflows
- Attachments, labels, search/filter
- User preferences and analytics 