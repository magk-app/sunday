'use client';
import React, { useEffect, useState, useRef } from 'react';
import { mockThreads } from '../../mock/threads';
import TinderThreadCard from '../../components/TinderThreadCard';
import { Button } from '../../components/ui/button';
import type { EmailThread, DraftReply } from '../../types';
import type { Email } from '../../types';
import { summarizeThread } from '../../lib/ai/summarize';
import { generateReply } from '../../lib/ai/reply';
import { analyzeThreadFull } from '../../lib/ai/extract';
import { getThreads, updateThread, initMockDataIfNeeded, getThreadMessages } from '../../lib/entity-storage';
import { mockEmails } from '../../mock/emails';

interface ThreadWithExtras extends EmailThread { __handled?: boolean }

// Helpers for localStorage persistence
const LS_DRAFTS_KEY = 'drafts';

// Usage tracking functions
function updateUsageTracking(tokens: number, cost: number) {
  const prevTokens = Number(localStorage.getItem('usage_tokens') || '0');
  const prevCost = Number(localStorage.getItem('usage_cost') || '0');
  localStorage.setItem('usage_tokens', String(prevTokens + tokens));
  localStorage.setItem('usage_cost', String(prevCost + cost));
  window.dispatchEvent(new Event('usage-updated'));
}

export default function TinderViewPage() {
  // All hooks must be at the top, before any early returns
  const [threads, setThreads] = useState<ThreadWithExtras[]>([]);
  const [drafts, setDrafts] = useState<DraftReply[]>([]);
  const [index, setIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReply, setEditedReply] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationFading, setNotificationFading] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0); // in minutes
  const [showSplash, setShowSplash] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiProgress, setAIProgress] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [showExpand, setShowExpand] = useState(false);
  const [showImprove, setShowImprove] = useState(false);
  const [jumpTarget, setJumpTarget] = useState<'summary'|'reply'>('summary');
  const [tokenUsage, setTokenUsage] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [currentMessages, setCurrentMessages] = useState<Email[]>([]);

  // Refs for scrolling
  const cardAreaRef = useRef<HTMLDivElement>(null);

  // Initialize data only on client
  useEffect(() => {
    (async () => {
      await initMockDataIfNeeded(mockThreads, mockEmails);
      const loadedThreads = await getThreads();
      setThreads((loadedThreads as ThreadWithExtras[]).map(t => ({ ...t, __handled: t.__handled ?? false })));
    })();
  }, []);

  // Load drafts from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DRAFTS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        setDrafts(arr.map((d: any) => ({
          ...d,
          generated_at: d.generated_at ? new Date(d.generated_at) : undefined,
          created_at: d.created_at ? new Date(d.created_at) : undefined,
          updated_at: d.updated_at ? new Date(d.updated_at) : undefined,
          sent_at: d.sent_at ? new Date(d.sent_at) : undefined,
        })));
      } else {
        setDrafts([]);
      }
    } catch { setDrafts([]); }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = async () => {
      const loadedThreads = await getThreads();
      setThreads(loadedThreads);
      setDrafts(drafts);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [threads, drafts]);

  // Sync localStorage whenever threads change
  useEffect(() => {
    threads.forEach(async t => {
      const { __handled, ...threadFields } = t;
      await updateThread(t.id, threadFields as Partial<EmailThread>);
    });
  }, [threads]);

  // Only generate AI for the current thread on start
  useEffect(() => {
    if (!showSplash && threads.length > 0) {
      (async () => {
        const t = threads[index];
        if (!t) return; // Guard against undefined
        
        if (!t.summary || !drafts.find(d => d.thread_id === t.id && d.status === 'pending')) {
          setLoadingAI(true);
          const messages = await getThreadMessages(t.id);
          let updatedThreads = [...threads];
          let updatedDrafts = [...drafts];
          // Generate summary if missing
          if (!t.summary) {
            try {
              const resSum = await summarizeThread(t, messages, true);
              if (resSum.success && resSum.data) {
                updatedThreads[index].summary = resSum.data;
                // Track usage
                if (resSum.usage) {
                  updateUsageTracking(resSum.usage.tokens, resSum.usage.cost);
                }
              }
            } catch (error) {
              console.error('Failed to generate summary:', error);
            }
          }
          // Generate reply if missing and not already processed
          const existingDraft = updatedDrafts.find(d => d.thread_id === t.id && d.status === 'pending');
          if (!existingDraft && t.status !== 'approved' && t.status !== 'rejected') {
            try {
              const resRep = await generateReply(t, messages);
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
                updatedThreads[index].has_draft = true;
                // Track usage
                if (resRep.usage) {
                  updateUsageTracking(resRep.usage.tokens, resRep.usage.cost);
                }
              }
            } catch (error) {
              console.error('Failed to generate reply:', error);
            }
          }
          setThreads(updatedThreads);
          setDrafts(updatedDrafts);
          // Preload next thread in background
          if (index + 1 < threads.length) {
            const next = updatedThreads[index + 1];
            const nextMessages = await getThreadMessages(next.id);
            if (!next.summary) {
              summarizeThread(next, nextMessages, true).then(resSum => {
                if (resSum.success && resSum.data) {
                  const tCopy = [...updatedThreads];
                  tCopy[index + 1].summary = resSum.data;
                  setThreads(tCopy);
                  // Track usage
                  if (resSum.usage) {
                    updateUsageTracking(resSum.usage.tokens, resSum.usage.cost);
                  }
                }
              }).catch(error => console.error('Background summary failed:', error));
            }
            const nextDraft = updatedDrafts.find(d => d.thread_id === next.id && d.status === 'pending');
            if (!nextDraft && next.status !== 'approved' && next.status !== 'rejected') {
              generateReply(next, nextMessages).then(resRep => {
                if (resRep.success && resRep.data) {
                  const newDraft: DraftReply = {
                    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    thread_id: next.id,
                    user_id: 'user_jack',
                    body: resRep.data,
                    generated_at: new Date(),
                    status: 'pending' as const,
                    created_at: new Date(),
                    updated_at: new Date(),
                  };
                  const dCopy = [...updatedDrafts, newDraft];
                  setDrafts(dCopy);
                  const tCopy = [...updatedThreads];
                  tCopy[index + 1].has_draft = true;
                  setThreads(tCopy);
                  // Track usage
                  if (resRep.usage) {
                    updateUsageTracking(resRep.usage.tokens, resRep.usage.cost);
                  }
                }
              }).catch(error => console.error('Background reply failed:', error));
            }
          }
          setLoadingAI(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSplash, index]);

  // When all cards are processed, show celebration
  useEffect(() => {
    const allProcessed = threads.every(t => t.__handled === true);
    if (allProcessed && threads.length > 0 && !showSplash && processedCount > 0) {
      setShowCelebration(true);
    }
  }, [threads, showSplash, processedCount]);

  // Ensure all threads start with status 'pending' unless already set
  useEffect(() => {
    setThreads(prev => prev.map(t => ({ ...t, status: t.status || 'pending', __handled: t.__handled || false })));
  }, []);

  // Sync status changes with main app
  useEffect(() => {
    window.dispatchEvent(new Event('storage'));
  }, [threads, drafts]);

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

  // Whenever currentThread changes, fetch its messages
  useEffect(() => {
    async function fetchMessages() {
      const currentThread = threads[index];
      if (currentThread) {
        const msgs = await getThreadMessages(currentThread.id);
        setCurrentMessages(msgs);
      } else {
        setCurrentMessages([]);
      }
    }
    fetchMessages();
  }, [threads, index]);

  // Early returns should come after all hooks
  if (threads.length === 0) return <div className="p-6">No threads.</div>;

  const currentThread = threads[index];

  // Prioritize pending drafts, but fall back to the most recent draft for this thread
  // Skip deleted/filtered drafts when looking for current draft
  const currentDraft = drafts.find(d => d.thread_id === currentThread.id && d.status === 'pending') || 
                      drafts.filter(d => d.thread_id === currentThread.id && d.status !== 'rejected')
                           .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] || 
                      null;

  const updateThreadState = (updated: Partial<ThreadWithExtras>) => {
    setThreads(prev => {
      const newArr = prev.map((t, idx) => idx === index ? { ...t, ...updated } : t);
      return newArr;
    });
  };

  const updateDraft = (updated: Partial<DraftReply>) => {
    if (!currentDraft) return;
    setDrafts(prev => {
      const newArr = prev.map(d => d.id === currentDraft.id ? { ...d, ...updated } : d);
      return newArr;
    });
  };

  const handleAction = async (action: 'approve' | 'reject' | 'edit' | 'save_kb' | 'cancel_edit' | 'auto_approve_with_kb' | 'reject_archive' | 'reject_with_kb' | 'generate_new') => {
    const current = threads[index];
    if (!current) return;
    
    // Prevent actions on already processed threads
    if ((action === 'approve' || action === 'reject' || action === 'auto_approve_with_kb' || action === 'reject_archive' || action === 'reject_with_kb') && (current.status === 'approved' || current.status === 'rejected')) {
      setNotification('Thread already processed');
      setTimeout(() => {
        setNotificationFading(true);
        setTimeout(() => {
          setNotification(null);
          setNotificationFading(false);
        }, 300);
      }, 2700);
      return;
    }
    
    if (action === 'approve' || action === 'auto_approve_with_kb') {
      setProcessedCount((c) => c + 1);
      setTimeSaved((t) => t + 5); // 5 min per email
      updateThreadState({ status: 'approved', __handled: true });
      if (currentDraft) updateDraft({ status: 'sent', sent_at: new Date() });
      // Persist to storage
      await updateThread(current.id, { status: 'approved' as EmailThread['status'] });
      // If auto-approve with KB, also save to knowledge base
      if (action === 'auto_approve_with_kb') {
        setIsProcessing(true);
        const messages = await getThreadMessages(current.id);
        try {
          const res = await analyzeThreadFull(current, messages);
          if (res.success && res.data) {
            try {
              const people = JSON.parse(localStorage.getItem('kb_people') || '[]');
              const projects = JSON.parse(localStorage.getItem('kb_projects') || '[]');
              const newPeople = [...people, ...res.data.people.filter((p: string) => !people.includes(p))];
              const newProjects = [...projects, ...res.data.projects.filter((p: string) => !projects.includes(p))];
              localStorage.setItem('kb_people', JSON.stringify(newPeople));
              localStorage.setItem('kb_projects', JSON.stringify(newProjects));
              
              // Track usage if available
              if (res.usage) {
                updateUsageTracking(res.usage.tokens, res.usage.cost);
              }
              
              setNotification('Thread approved & saved to Knowledge Base!');
            } catch {
              setNotification('Thread approved (KB save failed)');
            }
          } else {
            setNotification('Thread approved (KB save failed)');
          }
        } catch (error) {
          console.error('Failed to analyze thread:', error);
          setNotification('Thread approved (KB save failed)');
        }
        setIsProcessing(false);
      } else {
        setNotification('Thread approved!');
      }
      setTimeout(() => {
        setIndex(i => Math.min(i + 1, threads.length - 1));
      }, 300);
    } else if (action === 'reject_archive' || action === 'reject_with_kb') {
      setProcessedCount((c) => c + 1);
      setTimeSaved((t) => t + 5); // 5 min per email
      updateThreadState({ status: 'rejected', __handled: true, has_draft: false });
      // Delete the draft completely when rejecting
      if (currentDraft) {
        setDrafts(prev => {
          const updated = prev.filter(d => d.id !== currentDraft.id);
          return updated;
        });
      }
      // Persist to storage
      await updateThread(current.id, { status: 'rejected' as EmailThread['status'], has_draft: false });
      // If reject with KB, also save to knowledge base
      if (action === 'reject_with_kb') {
        setIsProcessing(true);
        const messages = await getThreadMessages(current.id);
        try {
          const res = await analyzeThreadFull(current, messages);
          if (res.success && res.data) {
            try {
              const people = JSON.parse(localStorage.getItem('kb_people') || '[]');
              const projects = JSON.parse(localStorage.getItem('kb_projects') || '[]');
              const newPeople = [...people, ...res.data.people.filter((p: string) => !people.includes(p))];
              const newProjects = [...projects, ...res.data.projects.filter((p: string) => !projects.includes(p))];
              localStorage.setItem('kb_people', JSON.stringify(newPeople));
              localStorage.setItem('kb_projects', JSON.stringify(newProjects));
              
              // Track usage if available
              if (res.usage) {
                updateUsageTracking(res.usage.tokens, res.usage.cost);
              }
              
              setNotification('Reply rejected & deleted, saved to Knowledge Base');
            } catch {
              setNotification('Reply rejected & deleted (KB save failed)');
            }
          } else {
            setNotification('Reply rejected & deleted (KB save failed)');
          }
        } catch (error) {
          console.error('Failed to analyze thread:', error);
          setNotification('Reply rejected & deleted (KB save failed)');
        }
        setIsProcessing(false);
      } else {
        setNotification('Reply rejected & deleted');
      }
      setTimeout(() => {
        setIndex(i => Math.min(i + 1, threads.length - 1));
      }, 300);
    } else if (action === 'save_kb') {
      setIsProcessing(true);
      const messages = await getThreadMessages(current.id);
      try {
        const res = await analyzeThreadFull(current, messages);
        if (res.success && res.data) {
          try {
            const people = JSON.parse(localStorage.getItem('kb_people') || '[]');
            const projects = JSON.parse(localStorage.getItem('kb_projects') || '[]');
            const newPeople = [...people, ...res.data.people.filter((p: string) => !people.includes(p))];
            const newProjects = [...projects, ...res.data.projects.filter((p: string) => !projects.includes(p))];
            localStorage.setItem('kb_people', JSON.stringify(newPeople));
            localStorage.setItem('kb_projects', JSON.stringify(newProjects));
            
            // Track usage if available
            if (res.usage) {
              updateUsageTracking(res.usage.tokens, res.usage.cost);
            }
            
            setNotification('Saved to Knowledge Base');
            setTimeout(() => {
              setNotificationFading(true);
              setTimeout(() => {
                setNotification(null);
                setNotificationFading(false);
              }, 300);
            }, 2700);
          } catch {
            setNotification('Failed to save to KB');
            setTimeout(() => {
              setNotificationFading(true);
              setTimeout(() => {
                setNotification(null);
                setNotificationFading(false);
              }, 300);
            }, 2700);
          }
        } else {
          setNotification('Failed to save to KB');
          setTimeout(() => {
            setNotificationFading(true);
            setTimeout(() => {
              setNotification(null);
              setNotificationFading(false);
            }, 300);
          }, 2700);
        }
      } catch (error) {
        console.error('Failed to analyze thread:', error);
        setNotification('Failed to save to KB');
        setTimeout(() => {
          setNotificationFading(true);
          setTimeout(() => {
            setNotification(null);
            setNotificationFading(false);
          }, 300);
        }, 2700);
      }
      setIsProcessing(false);
    } else if (action === 'edit') {
      // Prevent editing sent drafts or drafts for processed threads
      if (currentDraft && (currentDraft.status === 'sent' || current.status === 'approved' || current.status === 'rejected')) {
        const message = currentDraft.status === 'sent' 
          ? 'Cannot edit sent replies' 
          : 'Cannot edit replies for processed threads. Generate a new reply instead.';
        setNotification(message);
        setTimeout(() => {
          setNotificationFading(true);
          setTimeout(() => {
            setNotification(null);
            setNotificationFading(false);
          }, 300);
        }, 2700);
        return;
      }
      
      if (isEditing) {
        // Save the edit
        if (currentDraft && editedReply) {
          updateDraft({ body: editedReply, updated_at: new Date() });
          setNotification('Reply updated successfully!');
          setTimeout(() => {
            setNotificationFading(true);
            setTimeout(() => {
              setNotification(null);
              setNotificationFading(false);
            }, 300);
          }, 2700);
        }
        setIsEditing(false);
      } else {
        // Enter edit mode
        setIsEditing(true);
        setEditedReply(currentDraft?.body || '');
        setJumpTarget('reply');
      }
    } else if (action === 'cancel_edit') {
      setIsEditing(false);
      setEditedReply('');
    } else if (action === 'generate_new') {
      // Generate a new reply for processed threads
      setNotification('Generating new reply...');
      setIsProcessing(true);
      
      try {
        const messages = await getThreadMessages(current.id);
        const result = await generateReply(current, messages);
        
        if (result.success && result.data) {
          const newDraft: DraftReply = {
            id: `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            thread_id: current.id,
            user_id: 'user_jack',
            body: result.data,
            generated_at: new Date(),
            status: 'pending' as const,
            created_at: new Date(),
            updated_at: new Date(),
          };
          
          setDrafts(prev => {
            const updated = [...prev, newDraft];
            return updated;
          });
          updateThreadState({ has_draft: true, status: 'pending' });
          // Persist to storage
          await updateThread(current.id, { has_draft: true, status: 'pending' });
          
          // Track usage
          if (result.usage) {
            updateUsageTracking(result.usage.tokens, result.usage.cost);
          }
          
          setNotification('✨ New reply generated!');
        } else {
          setNotification('Failed to generate new reply');
        }
      } catch (error) {
        console.error('Failed to generate new reply:', error);
        setNotification('Failed to generate new reply');
      }
      
      setIsProcessing(false);
      setTimeout(() => {
        setNotificationFading(true);
        setTimeout(() => {
          setNotification(null);
          setNotificationFading(false);
        }, 300);
      }, 2700);
    }
  };

  const handleChangeReply = (newReply: string) => {
    setEditedReply(newReply);
    // Also update the draft immediately for streaming improvements
    if (currentDraft && currentDraft.status !== 'sent') {
      updateDraft({ body: newReply, updated_at: new Date() });
    }
  };

  const movePrev = () => setIndex((i) => Math.max(i - 1, 0));
  const moveNext = () => setIndex((i) => Math.min(i + 1, threads.length - 1));

  const thread = threads[index];

  const handleSaveEditedReply = () => {
    if (!currentDraft) return;
    updateDraft({ body: editedReply, updated_at: new Date() });
    setIsEditing(false);
    setNotification('Draft updated');
  };

  // Card counter
  const cardCount = threads.length > 0 ? `Card ${index + 1} of ${threads.length}` : '';

  // Reset simulation logic
  const handleReset = () => {
    setResetting(true);
    let resetThreads = threads.map(t => ({ ...t, status: 'pending' as EmailThread['status'], has_draft: true, __handled: false }));
    let resetDrafts = drafts.map(d => ({ ...d, status: 'pending' as DraftReply['status'] }));
    setThreads(resetThreads);
    setDrafts(resetDrafts);
    setIndex(0);
    setProcessedCount(0);
    setTimeSaved(0);
    setShowCelebration(false);
    setResetting(false);
    setNotification('Simulation reset!');
    setShowSplash(true);
    // Sync with main app by dispatching storage event
    window.dispatchEvent(new Event('storage'));
  };

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg text-center animate-fade-in border border-gray-100">
          <div className="text-7xl mb-6 animate-bounce">📧</div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tinder for Emails
          </h1>
          <p className="text-gray-600 mb-8 text-lg">Process your emails like a pro</p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">How to Swipe</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👉</span>
                <span><b>Swipe right</b> to <span className="text-green-600 font-semibold">approve & send</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👈</span>
                <span><b>Swipe left</b> to <span className="text-red-600 font-semibold">reject & archive</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👆</span>
                <span><b>Swipe up</b> to <span className="text-blue-600 font-semibold">save to knowledge base</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👇</span>
                <span><b>Swipe down</b> to <span className="text-yellow-600 font-semibold">edit the AI reply</span></span>
              </div>
            </div>
          </div>
          
          {loadingAI ? (
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div className="text-blue-700 font-semibold text-lg">Generating AI for all emails...</div>
              <div className="text-gray-500 text-sm">{aiProgress}% complete</div>
            </div>
          ) : (
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
              onClick={() => setShowSplash(false)}
            >
              <span>🚀</span>
              Let's Process Some Emails!
            </button>
          )}
          
          <div className="mt-8 text-gray-400 text-sm">
            ✨ Powered by AI • Built with care
          </div>
        </div>
      </div>
    );
  }
  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 z-50 flex flex-col items-center justify-center">
        {/* CSS Confetti Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 opacity-80 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`circle-${i}`}
              className="absolute w-3 h-3 bg-blue-300 rounded-full opacity-70 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Main content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md text-center z-10 border border-white/20">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold mb-6 text-gray-800">All Done!</h2>
          <p className="mb-6 text-lg text-gray-700">You've processed all your emails like a champion! 🚀</p>
          
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{processedCount}</div>
              <div className="text-sm text-gray-600">Cards Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{timeSaved}</div>
              <div className="text-sm text-gray-600">Minutes Saved</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleReset}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🎊 Celebrate Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setShowCelebration(false); setShowSplash(true); }}
              className="border-2 border-gray-400 hover:border-gray-600 font-semibold py-3 px-6 rounded-full"
            >
              Return to Main App
            </Button>
          </div>
          
          <div className="mt-6 text-2xl">✨ You crushed it! ✨</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6 relative">
      {/* Header stats with proper spacing */}
      <div className="w-full max-w-xl flex justify-between items-center mb-4">
        <span className="text-sm text-gray-700 font-medium">Processed: {processedCount}</span>
        <span className="text-sm text-gray-700 font-medium ml-8">Time Saved: {timeSaved} min</span>
        <button 
          className="ml-auto bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-300 transition disabled:opacity-50" 
          onClick={handleReset} 
          disabled={resetting}
        >
          {resetting ? 'Resetting...' : 'Reset Simulation'}
        </button>
      </div>
      
      {/* Minimalistic vertical dot nav on left of card area */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
        {['summary', 'reply'].map((section) => (
          <button
            key={section}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              jumpTarget === section 
                ? 'bg-white shadow-lg border-2 border-blue-500 scale-125' 
                : 'bg-white/70 hover:bg-white hover:scale-110 shadow-md border border-gray-200'
            } group relative`}
            onClick={() => setJumpTarget(section as 'summary'|'reply')}
            aria-label={`Jump to ${section}`}
          >
            {/* Tooltip on hover */}
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </span>
          </button>
        ))}
      </div>
      
      {/* Card area */}
      <div ref={cardAreaRef} className="w-full max-w-xl mx-auto">
        {threads[index] && (
          <TinderThreadCard
            key={threads[index].id}
            thread={threads[index]}
            reply={currentDraft?.body}
            isEditing={isEditing}
            editedReply={editedReply}
            onChangeReply={handleChangeReply}
            onAction={handleAction}
            showExpand={showExpand}
            setShowExpand={setShowExpand}
            showImprove={showImprove}
            setShowImprove={setShowImprove}
            jumpTarget={jumpTarget}
            setJumpTarget={setJumpTarget}
            messages={currentMessages}
          />
        )}
      </div>
      
      {/* Fixed footer action bar with proper buttons */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-center bg-white border-t py-4 z-30 shadow-lg">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg" 
          onClick={() => setShowExpand(true)}
        >
          📧 Expand Thread
        </button>
      </div>
      
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
      
      {/* Notification with fade animation */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-lg shadow text-white bg-blue-600 transition-all duration-300 ${
          notificationFading ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
        }`}>
          <span>{notification}</span>
          <button className="ml-4 text-white font-bold" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </div>
  );
} 