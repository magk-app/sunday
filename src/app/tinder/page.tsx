'use client';
import React, { useEffect, useState } from 'react';
import { mockThreads, mockDraftReplies, getThreadMessages } from '../../mock/threads';
import TinderThreadCard from '../../components/TinderThreadCard';
import { Button } from '../../components/ui/button';
import type { EmailThread, DraftReply } from '../../types';
import { openaiService } from '../../lib/openai-service';

interface ThreadWithExtras extends EmailThread { __handled?: boolean }

// Helpers for localStorage persistence
const LS_THREADS_KEY = 'threads';
const LS_DRAFTS_KEY = 'drafts';

function loadThreads(): ThreadWithExtras[] {
  try {
    const raw = localStorage.getItem(LS_THREADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...mockThreads];
}

function loadDrafts(): DraftReply[] {
  try {
    const raw = localStorage.getItem(LS_DRAFTS_KEY);
    if (raw) return JSON.parse(raw);
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

    if (action === 'approve') {
      updateThread({ status: 'approved' as const, has_draft: false, __handled: true });
      if (currentDraft) updateDraft({ status: 'sent' as const, sent_at: new Date() });
    } else if (action === 'reject') {
      updateThread({ status: 'rejected' as const, has_draft: false, __handled: true });
      if (currentDraft) updateDraft({ status: 'rejected' as const });
    } else if (action === 'save_kb') {
      // Call OpenAI knowledge extraction and store in KB (localStorage)
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
          alert('Saved to Knowledge Base');
        } catch {}
      } else {
        alert('Failed to save to KB');
      }
      setIsProcessing(false);
    } else if (action === 'edit') {
      setIsEditing(true);
      setEditedReply(currentDraft?.body || '');
      return; // don't advance
    }

    // Automatically advance to next thread after short delay to allow exit animation
    setTimeout(() => {
      setIndex(i => Math.min(i + 1, threads.length - 1));
    }, 300);
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

  const thread = threads[index];

  const handleSaveEditedReply = () => {
    if (!currentDraft) return;
    updateDraft({ body: editedReply, updated_at: new Date() });
    setIsEditing(false);
  };

  // Sync localStorage when arrays change
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    saveDrafts(drafts);
  }, [drafts]);

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      {/* Controls */}
      <div className="flex justify-between items-center w-full max-w-xl">
        <Button onClick={movePrev} disabled={index === 0}>Prev</Button>
        {/* Dot pagination */}
        <div className="flex gap-1">
          {threads.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
          ))}
        </div>
        <Button onClick={moveNext} disabled={index === threads.length - 1}>Next</Button>
      </div>

      {/* Card */}
      <TinderThreadCard
        thread={thread}
        reply={currentDraft?.body}
        isEditing={isEditing}
        editedReply={editedReply}
        onChangeReply={setEditedReply}
        onAction={handleAction}
      />

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSaveEditedReply}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
} 