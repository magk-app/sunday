"use client";
import React, { useEffect, useState } from 'react';
import { mockThreads, mockDraftReplies, mockPeople, mockProjects, getThreadMessages } from '../mock/threads';
import Sidebar from '../components/Sidebar';
import ThreadList from '../components/ThreadList';
import ThreadDetail from '../components/ThreadDetail';
import StatusBar from '../components/StatusBar';
import Notification from '../components/Notification';
import type { EmailThread, DraftReply } from '../types';
import { openaiService } from '../lib/openai-service';

type FolderKey = 'inbox' | 'important' | 'approved' | 'rejected';

const LS_THREADS_KEY = 'threads';
const LS_DRAFTS_KEY = 'drafts';

function loadThreads() {
  if (typeof window === 'undefined') return mockThreads;
  const raw = localStorage.getItem(LS_THREADS_KEY);
  return raw ? JSON.parse(raw) : mockThreads;
}

function loadDrafts() {
  if (typeof window === 'undefined') return mockDraftReplies;
  const raw = localStorage.getItem(LS_DRAFTS_KEY);
  return raw ? JSON.parse(raw) : mockDraftReplies;
}

function saveThreads(threads: any) {
  localStorage.setItem(LS_THREADS_KEY, JSON.stringify(threads));
}

function saveDrafts(drafts: any) {
  localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(drafts));
}

export default function HomePage() {
  const [threads, setThreads] = useState<EmailThread[]>(loadThreads());
  const [drafts, setDrafts] = useState<DraftReply[]>(loadDrafts());
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threads[0]?.id || null);
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>('inbox');
  const [credits, setCredits] = useState<number>(100);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState<number>(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;
  const threadMessages = selectedThread ? getThreadMessages(selectedThread.id) : [];
  const currentDraft = drafts.find(d => d.thread_id === selectedThreadId && d.status === 'pending') || null;

  const visibleThreads = threads.filter(t => {
    if (selectedFolder === 'inbox') return t.status === 'active';
    if (selectedFolder === 'approved') return t.status === ('approved' as any);
    if (selectedFolder === 'rejected') return t.status === ('rejected' as any);
    return true;
  });

  const handleCreditsUsed = (amount: number, tokens?: number, cost?: number) => {
    setCredits(prev => Math.max(0, prev - amount));
    setTotalCreditsUsed(prev => prev + amount);

    // Persist usage summary for Settings page
    if (tokens !== undefined && cost !== undefined) {
      const prevTokens = Number(localStorage.getItem('usage_tokens') || '0');
      const prevCost = Number(localStorage.getItem('usage_cost') || '0');
      localStorage.setItem('usage_tokens', String(prevTokens + tokens));
      localStorage.setItem('usage_cost', String(prevCost + cost));
      window.dispatchEvent(new Event('usage-updated'));
    }
  };

  const handleApprove = (draftId: string) => {
    setDrafts(prev => {
      const updated = prev.map(d => d.id === draftId ? { ...d, status: 'sent' as const, sent_at: new Date() } : d);
      saveDrafts(updated);
      return updated;
    });
    setThreads(prev => {
      const updated = prev.map(t => t.id === selectedThreadId ? { ...t, has_draft: false, status: 'approved' as EmailThread['status'] } : t);
      saveThreads(updated);
      return updated;
    });
    setNotification({ message: '✨ Reply sent successfully!', type: 'success' });
    handleCreditsUsed(2); // Deduct credits for sending
  };

  const handleReject = (draftId: string) => {
    setDrafts(prev => {
      const updated = prev.map(d => d.id === draftId ? { ...d, status: 'rejected' as const } : d);
      saveDrafts(updated);
      return updated;
    });
    setThreads(prev => {
      const updated = prev.map(t => t.id === selectedThreadId ? { ...t, has_draft: false, status: 'rejected' as EmailThread['status'] } : t);
      saveThreads(updated);
      return updated;
    });
    setNotification({ message: 'Draft rejected and archived', type: 'error' });
  };

  const handleGenerateReply = async () => {
    if (!selectedThreadId || !selectedThread) return;
    
    if (credits < 5) {
      setNotification({ message: 'Insufficient credits to generate reply', type: 'error' });
      return;
    }
    
    setNotification({ message: 'Generating AI reply...', type: 'success' });
    
    try {
      const result = await openaiService.generateReply(selectedThread, threadMessages);
      
      if (result.success && result.data) {
        const newDraft: DraftReply = {
          id: `draft_${Date.now()}`,
          thread_id: selectedThreadId,
          user_id: 'user_jack',
          body: result.data,
          generated_at: new Date(),
          status: 'pending' as const,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        setDrafts(prev => {
          const updated = [...prev.filter(d => d.thread_id !== selectedThreadId || d.status !== 'pending'), newDraft];
          saveDrafts(updated);
          return updated;
        });
        setThreads(prev => {
          const updated = prev.map(t => t.id === selectedThreadId ? { ...t, has_draft: true } : t);
          saveThreads(updated);
          return updated;
        });
        
        if (result.usage) {
          const creditsUsed = Math.ceil(result.usage.tokens / 100);
          handleCreditsUsed(creditsUsed, result.usage.tokens, result.usage.cost);
          setNotification({ message: `OpenAI accessed ✔️ Tokens: ${result.usage.tokens}, Cost: $${result.usage.cost.toFixed(4)}`, type: 'success' });
        } else {
          setNotification({ message: '✨ AI reply generated!', type: 'success' });
        }
      } else {
        setNotification({ message: result.error || 'Failed to generate reply', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to generate reply:', error);
      setNotification({ message: 'Failed to generate reply. Please try again.', type: 'error' });
    }
  };

  const handleSummaryGenerated = (threadId: string, summary: string, importance?: 'urgent' | 'high' | 'medium' | 'low') => {
    setThreads(prev => {
      const updated = prev.map(t => t.id === threadId ? { ...t, summary, importance } : t);
      saveThreads(updated);
      return updated;
    });
  };

  const handleSelectFolder = (key: string) => {
    if (["inbox", "important", "approved", "rejected"].includes(key)) {
      setSelectedFolder(key as FolderKey);
    }
  };

  const handleToggleImportant = (threadId: string) => {
    setThreads(prev => {
      const updated = prev.map(t => t.id === threadId ? { ...t, important: !t.important } : t);
      saveThreads(updated);
      return updated;
    });
  };

  // Sync localStorage whenever threads or drafts change
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    saveDrafts(drafts);
  }, [drafts]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex flex-1 overflow-hidden">
        <Sidebar selected={selectedFolder} onSelect={handleSelectFolder} />
        <ThreadList 
          threads={visibleThreads} 
          selectedId={selectedThreadId} 
          onSelect={setSelectedThreadId}
          onToggleImportant={handleToggleImportant}
        />
        <ThreadDetail
          thread={selectedThread}
          messages={threadMessages}
          draft={currentDraft}
          people={mockPeople}
          projects={mockProjects}
          onApprove={handleApprove}
          onReject={handleReject}
          onGenerateReply={handleGenerateReply}
          onNotify={(message: string, type: 'success' | 'error') => setNotification({ message, type })}
          onCreditsUsed={handleCreditsUsed}
          onSummaryGenerated={handleSummaryGenerated}
        />
      </main>
      <StatusBar 
        status={currentDraft?.status || 'Ready'} 
        credits={credits}
        totalUsed={totalCreditsUsed}
      />
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
} 