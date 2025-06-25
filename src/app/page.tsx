"use client";
import React, { useState } from 'react';
import { mockEmails } from '../mock/emails';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import TaskList from '../components/TaskList';
import StatusBar from '../components/StatusBar';
import Notification from '../components/Notification';
import type { Email, Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

// Mock AI task extraction from email body
function extractTasksFromEmail(email: Email): Task[] {
  // For demo, extract lines starting with "- [ ]" as tasks
  const lines = email.body.split('\n');
  return lines
    .filter((line) => line.trim().startsWith('- [ ]'))
    .map((line, idx) => ({
      id: `${email.id}_task_${idx}`,
      email_id: email.id,
      user_id: email.user_id,
      title: line.replace('- [ ]', '').trim() || 'Untitled Task',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    }));
}

type FolderKey = 'inbox' | 'important' | 'approved' | 'rejected';
const folderFilters: Record<FolderKey, (e: Email) => boolean> = {
  inbox: (e: Email) => e.status === 'pending',
  important: (e: Email) => e.importance === 'high',
  approved: (e: Email) => e.status === 'approved',
  rejected: (e: Email) => e.status === 'rejected',
};

export default function HomePage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedId, setSelectedId] = useState<string | null>(emails[0]?.id || null);
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>('inbox');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [credits, setCredits] = useState<number>(100);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter emails by folder
  const filteredEmails = emails.filter(folderFilters[selectedFolder]);
  const selectedEmail = emails.find((e) => e.id === selectedId) || filteredEmails[0] || null;

  // Extract tasks for selected email
  React.useEffect(() => {
    if (selectedEmail) {
      // Simulate API credit usage and mock AI extraction
      setCredits((c) => c - 1);
      setTasks(extractTasksFromEmail(selectedEmail));
    } else {
      setTasks([]);
    }
  }, [selectedEmail]);

  const handleApprove = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: 'approved' } : e));
    setNotification({ message: 'Email approved!', type: 'success' });
  };
  const handleReject = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: 'rejected' } : e));
    setNotification({ message: 'Email rejected.', type: 'error' });
  };
  const handleCompleteTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: TaskStatus.COMPLETED } : t));
    setNotification({ message: 'Task completed!', type: 'success' });
  };

  const handleSelectFolder = (key: string) => {
    if (["inbox", "important", "approved", "rejected"].includes(key)) {
      setSelectedFolder(key as FolderKey);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar selected={selectedFolder} onSelect={handleSelectFolder} />
        <EmailList emails={filteredEmails} selectedId={selectedId} onSelect={setSelectedId} />
        <section className="flex-1 p-6 overflow-y-auto">
          <EmailDetail email={selectedEmail} onApprove={handleApprove} onReject={handleReject} tasks={tasks} />
          <TaskList tasks={tasks} onComplete={handleCompleteTask} />
        </section>
      </main>
      <StatusBar status={selectedEmail?.status || 'N/A'} credits={credits} />
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
} 