"use client";
import React, { useState } from 'react';
import { mockThreads, mockDraftReplies, mockPeople, mockProjects, getThreadMessages } from '../mock/threads';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ThreadList from '../components/ThreadList';
import ThreadDetail from '../components/ThreadDetail';
import StatusBar from '../components/StatusBar';
import Notification from '../components/Notification';
import type { EmailThread, DraftReply } from '../types';

type FolderKey = 'inbox' | 'important' | 'approved' | 'rejected';

export default function HomePage() {
  const [threads] = useState<EmailThread[]>(mockThreads);
  const [drafts, setDrafts] = useState<DraftReply[]>(mockDraftReplies);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threads[0]?.id || null);
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>('inbox');
  const [credits, setCredits] = useState<number>(100);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;
  const threadMessages = selectedThread ? getThreadMessages(selectedThread.id) : [];
  const currentDraft = drafts.find(d => d.thread_id === selectedThreadId && d.status === 'pending') || null;

  const handleApprove = (draftId: string) => {
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'sent', sent_at: new Date() } : d));
    setNotification({ message: '✨ Reply sent successfully!', type: 'success' });
    setCredits(c => c - 5); // Deduct credits for sending
  };

  const handleReject = (draftId: string) => {
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'rejected' } : d));
    setNotification({ message: 'Draft rejected and archived', type: 'error' });
  };

  const handleGenerateReply = async () => {
    if (!selectedThreadId) return;
    
    setCredits(c => c - 2); // Deduct credits for generation
    setNotification({ message: 'Generating AI reply...', type: 'success' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDraft: DraftReply = {
      id: `draft_${Date.now()}`,
      thread_id: selectedThreadId,
      user_id: 'user_jack',
      body: `Thank you for your message. I've reviewed the thread and here's my response:\n\n[AI-generated content based on conversation context]\n\nBest regards,\nJack`,
      generated_at: new Date(),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    setDrafts(prev => [...prev.filter(d => d.thread_id !== selectedThreadId || d.status !== 'pending'), newDraft]);
    setNotification({ message: '✨ AI reply generated!', type: 'success' });
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
        <ThreadList threads={threads} selectedId={selectedThreadId} onSelect={setSelectedThreadId} />
        <ThreadDetail
          thread={selectedThread}
          messages={threadMessages}
          draft={currentDraft}
          people={mockPeople}
          projects={mockProjects}
          onApprove={handleApprove}
          onReject={handleReject}
          onGenerateReply={handleGenerateReply}
        />
      </main>
      <StatusBar status={currentDraft?.status || 'Ready'} credits={credits} />
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
} 