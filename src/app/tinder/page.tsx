'use client';
import React, { useEffect, useState } from 'react';
import { mockThreads, mockDraftReplies, getThreadMessages } from '../../mock/threads';
import TinderThreadCard from '../../components/TinderThreadCard';
import { Button } from '../../components/ui/button';
import type { EmailThread, DraftReply } from '../../types';
import { openaiService } from '../../lib/openai-service';
import { useSwipeable } from 'react-swipeable';

interface ThreadWithExtras extends EmailThread { __handled?: boolean }

// Helpers for localStorage persistence
const LS_THREADS_KEY = 'threads';
const LS_DRAFTS_KEY = 'drafts';

function loadThreads(): ThreadWithExtras[] {
  try {
    const raw = localStorage.getItem(LS_THREADS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      // Parse dates
      return arr.map((t: any) => ({
        ...t,
        last_message_at: t.last_message_at ? new Date(t.last_message_at) : undefined,
        created_at: t.created_at ? new Date(t.created_at) : undefined,
        updated_at: t.updated_at ? new Date(t.updated_at) : undefined,
      }));
    }
  } catch {}
  return [...mockThreads];
}

function loadDrafts(): DraftReply[] {
  try {
    const raw = localStorage.getItem(LS_DRAFTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      return arr.map((d: any) => ({
        ...d,
        generated_at: d.generated_at ? new Date(d.generated_at) : undefined,
        created_at: d.created_at ? new Date(d.created_at) : undefined,
        updated_at: d.updated_at ? new Date(d.updated_at) : undefined,
        sent_at: d.sent_at ? new Date(d.sent_at) : undefined,
      }));
    }
  } catch {}
  return [...mockDraftReplies];
}

function saveThreads(threads: ThreadWithExtras[]) {
  localStorage.setItem(LS_THREADS_KEY, JSON.stringify(threads));
}

function saveDrafts(drafts: DraftReply[]) {
  localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(drafts));
}

export default function TinderViewPage() {
  const [threads, setThreads] = useState<ThreadWithExtras[]>(loadThreads());
  const [drafts, setDrafts] = useState<DraftReply[]>(loadDrafts());
  const [index, setIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReply, setEditedReply] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0); // in minutes
  const [showSplash, setShowSplash] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiProgress, setAIProgress] = useState(0);

  if (threads.length === 0) return <div className="p-6">No threads.</div>;

  const currentThread = threads[index];

  const currentDraft = drafts.find(d => d.thread_id === currentThread.id && d.status === 'pending');

  const updateThread = (updated: Partial<ThreadWithExtras>) => {
    setThreads(prev => {
      const newArr = prev.map((t, idx) => idx === index ? { ...t, ...updated } : t);
      saveThreads(newArr);
      return newArr;
    });
  };

  const updateDraft = (updated: Partial<DraftReply>) => {
    if (!currentDraft) return;
    setDrafts(prev => {
      const newArr = prev.map(d => d.id === currentDraft.id ? { ...d, ...updated } : d);
      saveDrafts(newArr);
      return newArr;
    });
  };

  const handleAction = async (action: 'approve' | 'reject' | 'edit' | 'save_kb') => {
    const current = threads[index];
    if (!current) return;
    if (action === 'approve' || action === 'reject') {
      setProcessedCount((c) => c + 1);
      setTimeSaved((t) => t + 5); // 5 min per email
      updateThread({ status: action as 'approved' | 'rejected', has_draft: false, __handled: true });
      if (currentDraft) updateDraft({ status: action === 'approve' ? 'sent' : 'rejected', sent_at: new Date() });
      setTimeout(() => {
        setIndex(i => Math.min(i + 1, threads.length - 1));
      }, 300);
    } else if (action === 'save_kb') {
      setIsProcessing(true);
      const messages = getThreadMessages(current.id);
      const res = await openaiService.analyzeThreadFull(current, messages);
      if (res.success && res.data) {
        try {
          const people = JSON.parse(localStorage.getItem('kb_people') || '[]');
          const projects = JSON.parse(localStorage.getItem('kb_projects') || '[]');
          const newPeople = [...people, ...res.data.people.filter((p: string) => !people.includes(p))];
          const newProjects = [...projects, ...res.data.projects.filter((p: string) => !projects.includes(p))];
          localStorage.setItem('kb_people', JSON.stringify(newPeople));
          localStorage.setItem('kb_projects', JSON.stringify(newProjects));
          setNotification('Saved to Knowledge Base');
        } catch {
          setNotification('Failed to save to KB');
        }
      } else {
        setNotification('Failed to save to KB');
      }
      setIsProcessing(false);
    } else if (action === 'edit') {
      setIsEditing(true);
      setEditedReply(currentDraft?.body || '');
      return;
    }
  };

  const movePrev = () => setIndex((i) => Math.max(i - 1, 0));
  const moveNext = () => setIndex((i) => Math.min(i + 1, threads.length - 1));

  // On initial mount: generate detailed summary & reply if missing
  useEffect(() => {
    const generateForThreads = async () => {
      setIsProcessing(true);
      const updatedThreads = [...threads];
      const updatedDrafts = [...drafts];

      for (const t of updatedThreads) {
        const messages = getThreadMessages(t.id);

        // Detailed summary
        if (!t.summary) {
          const resSum = await openaiService.summarizeThread(t, messages, true);
          if (resSum.success && resSum.data) {
            t.summary = resSum.data;
          }
        }

        // Generate reply if no pending draft
        const existingDraft = updatedDrafts.find(d => d.thread_id === t.id && d.status === 'pending');
        if (!existingDraft) {
          const resRep = await openaiService.generateReply(t, messages);
          if (resRep.success && resRep.data) {
            const newDraft: DraftReply = {
              id: `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              thread_id: t.id,
              user_id: 'user_jack',
              body: resRep.data,
              generated_at: new Date(),
              status: 'pending' as const,
              created_at: new Date(),
              updated_at: new Date(),
            };
            updatedDrafts.push(newDraft);
            t.has_draft = true;
          }
        }
      }

      setThreads(updatedThreads);
      setDrafts(updatedDrafts);
      saveThreads(updatedThreads);
      saveDrafts(updatedDrafts);
      setIsProcessing(false);
    };

    // Only run if no summaries or drafts in localStorage (first load)
    if (threads.some(t => !t.summary) || threads.some(t => !drafts.find(d => d.thread_id === t.id))) {
      generateForThreads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload/generate summary and reply for next card
  useEffect(() => {
    const preloadNext = async () => {
      const nextIdx = index + 1;
      if (nextIdx >= threads.length) return;
      const t = threads[nextIdx];
      const messages = getThreadMessages(t.id);
      let updated = false;
      if (!t.summary) {
        const resSum = await openaiService.summarizeThread(t, messages, true);
        if (resSum.success && resSum.data) {
          t.summary = resSum.data;
          updated = true;
        }
      }
      const existingDraft = drafts.find(d => d.thread_id === t.id && d.status === 'pending');
      if (!existingDraft) {
        const resRep = await openaiService.generateReply(t, messages);
        if (resRep.success && resRep.data) {
          const newDraft: DraftReply = {
            id: `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            thread_id: t.id,
            user_id: 'user_jack',
            body: resRep.data,
            generated_at: new Date(),
            status: 'pending' as const,
            created_at: new Date(),
            updated_at: new Date(),
          };
          setDrafts((prev) => [...prev, newDraft]);
          t.has_draft = true;
          updated = true;
        }
      }
      if (updated) {
        setThreads([...threads]);
        saveThreads(threads);
        saveDrafts(drafts);
        setNotification('AI summary and reply generated for next email');
      }
    };
    preloadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const thread = threads[index];

  const handleSaveEditedReply = () => {
    if (!currentDraft) return;
    updateDraft({ body: editedReply, updated_at: new Date() });
    setIsEditing(false);
    setNotification('Draft updated');
  };

  // Sync localStorage when arrays change
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    saveDrafts(drafts);
  }, [drafts]);

  // Card counter
  const cardCount = threads.length > 0 ? `Card ${index + 1} of ${threads.length}` : '';

  // When all cards are processed, show celebration
  useEffect(() => {
    if (index >= threads.length) {
      setShowCelebration(true);
    }
  }, [index, threads.length]);

  // Ensure all threads start with status 'pending' unless already set
  useEffect(() => {
    setThreads(prev => prev.map(t => ({ ...t, status: t.status || 'pending' })));
  }, []);

  const handleGetStarted = async () => {
    setLoadingAI(true);
    let updatedThreads = [...threads];
    let updatedDrafts = [...drafts];
    let completed = 0;
    for (let i = 0; i < updatedThreads.length; i++) {
      const t = updatedThreads[i];
      const messages = getThreadMessages(t.id);
      // Generate summary if missing
      if (!t.summary) {
        const resSum = await openaiService.summarizeThread(t, messages, true);
        if (resSum.success && resSum.data) {
          t.summary = resSum.data;
        }
      }
      // Generate reply if no pending draft
      const existingDraft = updatedDrafts.find(d => d.thread_id === t.id && d.status === 'pending');
      if (!existingDraft) {
        const resRep = await openaiService.generateReply(t, messages);
        if (resRep.success && resRep.data) {
          const newDraft: DraftReply = {
            id: `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            thread_id: t.id,
            user_id: 'user_jack',
            body: resRep.data,
            generated_at: new Date(),
            status: 'pending' as const,
            created_at: new Date(),
            updated_at: new Date(),
          };
          updatedDrafts.push(newDraft);
          t.has_draft = true;
        }
      }
      completed++;
      setAIProgress(Math.round((completed / updatedThreads.length) * 100));
    }
    setThreads(updatedThreads);
    setDrafts(updatedDrafts);
    saveThreads(updatedThreads);
    saveDrafts(updatedDrafts);
    setLoadingAI(false);
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <ul className="text-left mb-6 text-gray-700 space-y-2">
            <li><b>Swipe right</b> to <span className="text-green-600 font-semibold">approve</span></li>
            <li><b>Swipe left</b> to <span className="text-red-600 font-semibold">reject</span></li>
            <li><b>Swipe up</b> to <span className="text-blue-600 font-semibold">save to knowledge base</span></li>
            <li><b>Swipe down</b> to <span className="text-yellow-600 font-semibold">edit the suggestion</span></li>
          </ul>
          {loadingAI ? (
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2" />
              <div className="text-blue-700 font-semibold">Generating AI for all emails... {aiProgress}%</div>
            </div>
          ) : (
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition" onClick={handleGetStarted}>Get Started</button>
          )}
        </div>
      </div>
    );
  }
  if (showCelebration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 animate-fade-in">
        {/* Confetti animation placeholder */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* TODO: Add confetti animation here */}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center z-10">
          <h2 className="text-3xl font-bold mb-4">All done!</h2>
          <p className="mb-6 text-lg text-gray-700">You've processed all your emails. 🎉</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition" onClick={() => window.location.href = '/'}>Return to Main App</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      {/* Top bar for processed count and time saved */}
      <div className="w-full max-w-xl flex justify-between items-center mb-4">
        <span className="text-sm text-gray-700 font-medium">Processed: {processedCount}</span>
        <span className="text-sm text-gray-700 font-medium">Time Saved: {timeSaved} min</span>
      </div>
      {/* Card */}
      {threads[index] && (
        <TinderThreadCard
          key={threads[index].id}
          thread={threads[index]}
          reply={drafts.find(d => d.thread_id === threads[index].id && d.status === 'pending')?.body}
          isEditing={isEditing}
          editedReply={editedReply}
          onChangeReply={setEditedReply}
          onAction={handleAction}
        />
      )}
      {/* Card counter */}
      {threads.length > 0 && !showCelebration && (
        <div className="mt-4 text-gray-500 text-sm font-medium">{cardCount}</div>
      )}
      {isEditing && (
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSaveEditedReply}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      )}
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-white bg-blue-600">
          <span>{notification}</span>
          <button className="ml-4 text-white font-bold" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </div>
  );
} 