"use client";
import React, { useEffect, useState } from 'react';
import { mockThreads, mockPeople, mockProjects } from '../mock/threads';
import { getThreadMessages, getThreads, updateThread, createThread, deleteThread, initMockDataIfNeeded, getPeople, getProjects, upsertPerson, upsertProject } from '../lib/entity-storage';
import { mockEmails } from '../mock/emails';
import Sidebar from '../components/Sidebar';
import ThreadList from '../components/ThreadList';
import ThreadDetail from '../components/ThreadDetail';
import StatusBar from '../components/StatusBar';
import Notification from '../components/Notification';
import type { EmailThread, DraftReply, Email } from '../types';
import { summarizeThread } from '../lib/ai/summarize';
import { generateReply, improveReply, improveReplyStream } from '../lib/ai/reply';
import { analyzeThreadFull } from '../lib/ai/extract';

type FolderKey = 'inbox' | 'important' | 'approved' | 'rejected';

const LS_THREADS_KEY = 'threads';
const LS_DRAFTS_KEY = 'drafts';

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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [threadMessages, setThreadMessages] = useState<Email[]>([]);
  const [kbPeople, setKbPeople] = useState([]);
  const [kbProjects, setKbProjects] = useState([]);

  // Initialize data only on client to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    (async () => {
      await initMockDataIfNeeded(mockThreads, mockEmails);
      const loadedThreads = await getThreads();
      setThreads(loadedThreads);
      // Load drafts from localStorage
      try {
        const raw = localStorage.getItem(LS_DRAFTS_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          setDrafts(arr.map((d: any) => ({
            ...d,
            generated_at: d.generated_at ? new Date(d.generated_at) : new Date(),
            created_at: d.created_at ? new Date(d.created_at) : new Date(),
            updated_at: d.updated_at ? new Date(d.updated_at) : new Date(),
            sent_at: d.sent_at ? new Date(d.sent_at) : undefined,
          })));
        } else {
          setDrafts([]);
        }
      } catch { setDrafts([]); }
      // Load KB people/projects from localStorage
      try {
        setKbPeople(JSON.parse(localStorage.getItem('kb_people') || '[]') || []);
      } catch { setKbPeople([]); }
      try {
        setKbProjects(JSON.parse(localStorage.getItem('kb_projects') || '[]') || []);
      } catch { setKbProjects([]); }
      const firstThread = loadedThreads[0];
      if (firstThread) {
        setSelectedThreadId(firstThread.id);
      }

      // --- SYNC PEOPLE/PROJECTS WITH THREADS ---
      // 1. Gather all unique participant emails from threads
      const allParticipantEmails = Array.from(new Set(
        loadedThreads.flatMap(t => t.participants)
      ));
      // 2. Gather all unique project names from mockProjects (or threads if referenced)
      // (Assume projects are only in mockProjects for now)
      const allProjectNames = Array.from(new Set(
        (mockProjects || []).map(p => p.name)
      ));
      // 3. Load current KB
      let kbPeople = await getPeople();
      let kbProjects = await getProjects();
      // 4. Add missing people
      for (const email of allParticipantEmails) {
        if (!kbPeople.some(p => p.email === email)) {
          const name = email.split('@')[0];
          const newPerson = {
            id: `person_${name}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email,
          };
          await upsertPerson(newPerson);
          kbPeople.push(newPerson);
        }
      }
      // 5. Add missing projects (by name)
      for (const proj of mockProjects) {
        if (!kbProjects.some(p => p.name === proj.name)) {
          await upsertProject(proj);
          kbProjects.push(proj);
        }
      }
    })();
  }, []);

  // Listen for storage changes from Tinder
  useEffect(() => {
    const handleStorageChange = async () => {
      const loadedThreads = await getThreads();
      setThreads(loadedThreads);
      // Load drafts from localStorage
      try {
        const raw = localStorage.getItem(LS_DRAFTS_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          setDrafts(arr.map((d: any) => ({
            ...d,
            generated_at: d.generated_at ? new Date(d.generated_at) : new Date(),
            created_at: d.created_at ? new Date(d.created_at) : new Date(),
            updated_at: d.updated_at ? new Date(d.updated_at) : new Date(),
            sent_at: d.sent_at ? new Date(d.sent_at) : undefined,
          })));
        } else {
          setDrafts([]);
        }
      } catch { setDrafts([]); }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync localStorage whenever threads change
  useEffect(() => {
    if (mounted) {
      threads.forEach(async t => {
        await updateThread(t.id, t);
      });
    }
  }, [threads, mounted]);

  // Sync OpenAI usage from localStorage
  useEffect(() => {
    const load = () => {
      setTokenUsage(Number(localStorage.getItem('usage_tokens') || '0'));
      setCost(Number(localStorage.getItem('usage_cost') || '0'));
    };
    load();
    const handler = () => load();
    window.addEventListener('usage-updated', handler);
    return () => window.removeEventListener('usage-updated', handler);
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      if (selectedThreadId) {
        const msgs = await getThreadMessages(selectedThreadId);
        setThreadMessages(msgs);
      } else {
        setThreadMessages([]);
      }
    }
    fetchMessages();
  }, [selectedThreadId]);

  if (!mounted) {
    return <div>Loading...</div>; // Prevent hydration mismatch
  }

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;
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
    // This function is no longer used
  };

  const handleApprove = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft || draft.status === 'sent') return;
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'sent', sent_at: new Date() } : d));
    setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, status: 'approved', has_draft: false } : t));
    setNotification({ message: '✨ Reply sent successfully!', type: 'success' });
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
    setDrafts(prev => prev.filter(d => !(d.thread_id === selectedThreadId && d.status === 'pending')));
    if (tokenUsage < 5) {
      setNotification({ message: 'Insufficient credits to generate reply', type: 'error' });
      return;
    }
    // Only remove pending drafts if credits are sufficient
    setDrafts(prev => prev.filter(d => !(d.thread_id === selectedThreadId && d.status === 'pending')));
    setNotification({ message: 'Generating AI reply...', type: 'success' });
    try {
      const result = await generateReply(selectedThread, threadMessages);
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
          const usage = result.usage;
          const creditsUsed = Math.ceil(usage.tokens / 100);
          setTokenUsage(prev => prev + creditsUsed);
          setCost(prev => prev + usage.cost);
          setNotification({ message: `OpenAI accessed ✔️ Tokens: ${usage.tokens}, Cost: $${usage.cost.toFixed(4)}`, type: 'success' });
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
      return updated;
    });
    
    // Dispatch storage event to sync with Tinder
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateDraft = (draftId: string, newBody: string) => {
    setDrafts(prev => {
      const updated = prev.map(d => d.id === draftId ? { ...d, body: newBody, updated_at: new Date() } : d);
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
          people={kbPeople}
          projects={kbProjects}
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
        credits={tokenUsage}
        totalUsed={tokenUsage}
        cost={cost}
      />
      <div className="fixed bottom-12 right-6 bg-white/90 px-4 py-2 rounded shadow text-xs text-gray-700 z-50">
        Tokens used: {tokenUsage} | Cost: ${cost.toFixed(4)}
      </div>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
} 