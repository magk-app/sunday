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
  try {
    const raw = localStorage.getItem(LS_THREADS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      // Parse dates properly
      return arr.map((t: any) => ({
        ...t,
        last_message_at: t.last_message_at ? new Date(t.last_message_at) : new Date(),
        created_at: t.created_at ? new Date(t.created_at) : new Date(),
        updated_at: t.updated_at ? new Date(t.updated_at) : new Date(),
      }));
    }
  } catch {}
  return mockThreads;
}

function loadDrafts() {
  if (typeof window === 'undefined') return mockDraftReplies;
  try {
    const raw = localStorage.getItem(LS_DRAFTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      return arr.map((d: any) => ({
        ...d,
        generated_at: d.generated_at ? new Date(d.generated_at) : new Date(),
        created_at: d.created_at ? new Date(d.created_at) : new Date(),
        updated_at: d.updated_at ? new Date(d.updated_at) : new Date(),
        sent_at: d.sent_at ? new Date(d.sent_at) : undefined,
      }));
    }
  } catch {}
  return mockDraftReplies;
}

function saveThreads(threads: any) {
  localStorage.setItem(LS_THREADS_KEY, JSON.stringify(threads));
}

function saveDrafts(drafts: any) {
  localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(drafts));
}

// Usage tracking functions
function updateUsageTracking(tokens: number, cost: number) {
  const prevTokens = Number(localStorage.getItem('usage_tokens') || '0');
  const prevCost = Number(localStorage.getItem('usage_cost') || '0');
  localStorage.setItem('usage_tokens', String(prevTokens + tokens));
  localStorage.setItem('usage_cost', String(prevCost + cost));
  window.dispatchEvent(new Event('usage-updated'));
}

export default function HomePage() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [drafts, setDrafts] = useState<DraftReply[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderKey>('inbox');
  const [credits, setCredits] = useState<number>(100);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState<number>(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize data only on client to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    setThreads(loadThreads());
    setDrafts(loadDrafts());
    const firstThread = loadThreads()[0];
    if (firstThread) {
      setSelectedThreadId(firstThread.id);
    }
  }, []);

  // Listen for storage changes from Tinder
  useEffect(() => {
    const handleStorageChange = () => {
      setThreads(loadThreads());
      setDrafts(loadDrafts());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync localStorage whenever threads or drafts change
  useEffect(() => {
    if (mounted) {
      saveThreads(threads);
    }
  }, [threads, mounted]);

  useEffect(() => {
    if (mounted) {
      saveDrafts(drafts);
    }
  }, [drafts, mounted]);

  if (!mounted) {
    return <div>Loading...</div>; // Prevent hydration mismatch
  }

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;
  const threadMessages = selectedThread ? getThreadMessages(selectedThread.id) : [];
  // Prioritize pending drafts, but fall back to the most recent draft for this thread
  const currentDraft = drafts.find(d => d.thread_id === selectedThreadId && d.status === 'pending') || 
                      drafts.filter(d => d.thread_id === selectedThreadId && d.status !== 'rejected' && d.status !== 'sent')
                           .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] || 
                      null;

  const visibleThreads = threads.filter(t => {
    if (selectedFolder === 'inbox') return true;
    if (selectedFolder === 'important') return t.important;
    if (selectedFolder === 'approved') return t.status === 'approved';
    if (selectedFolder === 'rejected') return t.status === 'rejected';
    return true;
  });

  const handleCreditsUsed = (amount: number, tokens?: number, cost?: number) => {
    setCredits(prev => Math.max(0, prev - amount));
    setTotalCreditsUsed(prev => prev + amount);

    // Persist usage summary for Settings page
    if (tokens !== undefined && cost !== undefined) {
      updateUsageTracking(tokens, cost);
    }
  };

  const handleApprove = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft || draft.status === 'sent') return;
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'sent', sent_at: new Date() } : d));
    setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, status: 'approved', has_draft: false } : t));
    setNotification({ message: '✨ Reply sent successfully!', type: 'success' });
    handleCreditsUsed(2);
    window.dispatchEvent(new Event('storage'));
  };

  const handleReject = (draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
    setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, status: 'rejected', has_draft: false } : t));
    setNotification({ message: 'Reply rejected and deleted', type: 'error' });
    window.dispatchEvent(new Event('storage'));
  };

  const handleGenerateReply = async () => {
    if (!selectedThreadId || !selectedThread) return;
    setDrafts(prev => prev.filter(d => !(d.thread_id === selectedThreadId && d.status === 'pending')));
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
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        };
        setDrafts(prev => [...prev, newDraft]);
        setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, has_draft: true, status: 'pending' as EmailThread['status'] } : t));
        if (result.usage) {
          const creditsUsed = Math.ceil(result.usage.tokens / 100);
          handleCreditsUsed(creditsUsed, result.usage.tokens, result.usage.cost);
          setNotification({ message: `OpenAI accessed ✔️ Tokens: ${result.usage.tokens}, Cost: $${result.usage.cost.toFixed(4)}`, type: 'success' });
        } else {
          setNotification({ message: '✨ AI reply generated!', type: 'success' });
        }
        window.dispatchEvent(new Event('storage'));
      } else {
        setNotification({ message: result.error || 'Failed to generate reply', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Failed to generate reply. Please try again.', type: 'error' });
    }
  };

  const handleSummaryGenerated = (threadId: string, summary: string, importance?: 'urgent' | 'high' | 'medium' | 'low') => {
    setThreads(prev => {
      const updated = prev.map(t => t.id === threadId ? { ...t, summary, importance } : t);
      saveThreads(updated);
      return updated;
    });
    
    // Dispatch storage event to sync with Tinder
    window.dispatchEvent(new Event('storage'));
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
    
    // Dispatch storage event to sync with Tinder
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateDraft = (draftId: string, newBody: string) => {
    setDrafts(prev => {
      const updated = prev.map(d => d.id === draftId ? { ...d, body: newBody, updated_at: new Date() } : d);
      saveDrafts(updated);
      return updated;
    });
    
    // Dispatch storage event to sync with Tinder
    window.dispatchEvent(new Event('storage'));
  };

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
          onUpdateDraft={handleUpdateDraft}
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