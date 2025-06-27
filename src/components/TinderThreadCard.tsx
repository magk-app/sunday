import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import type { EmailThread, Email, Person, Project } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { improveReplyStream } from '../lib/ai/reply';
import { Button } from './ui/button';

export interface TinderThreadCardProps {
  thread: EmailThread;
  reply?: string;
  isEditing?: boolean;
  editedReply?: string;
  onAction: (action: 'approve' | 'reject' | 'edit' | 'save_kb' | 'cancel_edit' | 'auto_approve_with_kb' | 'reject_archive' | 'reject_with_kb' | 'generate_new') => void;
  onChangeReply?: (text: string) => void;
  showExpand: boolean;
  setShowExpand: (show: boolean) => void;
  showImprove: boolean;
  setShowImprove: (show: boolean) => void;
  jumpTarget: 'summary' | 'reply';
  setJumpTarget: (target: 'summary' | 'reply') => void;
  messages: Email[];
}

const SWIPE_THRESHOLD = 0.33; // 33% of card width/height

const TinderThreadCard = forwardRef<HTMLDivElement, TinderThreadCardProps>(function TinderThreadCard({
  thread, reply, isEditing = false, editedReply = '', onAction, onChangeReply,
  showExpand, setShowExpand, showImprove, setShowImprove, jumpTarget, setJumpTarget, messages
}, ref) {
  const [swipeDir, setSwipeDir] = useState<null | 'right' | 'left' | 'up' | 'down'>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [editMode, setEditMode] = useState(isEditing);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [streamingReply, setStreamingReply] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStreamedReply, setHasStreamedReply] = useState(false);
  const [showImproveChat, setShowImproveChat] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [autoSaveKB, setAutoSaveKB] = useState(true); // Default to true
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize autoSaveKB from localStorage after mount
  useEffect(() => {
    setMounted(true);
    setAutoSaveKB(localStorage.getItem('auto_save_kb') !== 'false');
  }, []);

  // Overlay color and label
  let overlayColor = '';
  let overlayLabel = '';
  if (swipeDir === 'right') {
    overlayColor = 'bg-green-500';
    overlayLabel = autoSaveKB ? 'APPROVE + SAVE' : 'APPROVE';
  } else if (swipeDir === 'left') {
    overlayColor = 'bg-red-500';
    overlayLabel = 'REJECT';
  } else if (swipeDir === 'up') {
    overlayColor = 'bg-blue-500';
    overlayLabel = 'SAVE TO KB';
  } else if (swipeDir === 'down') {
    overlayColor = 'bg-yellow-400';
    overlayLabel = 'EDIT';
  }

  // Tag badge color
  const tag = thread.status === 'approved' ? 'approved' :
    thread.status === 'rejected' ? 'rejected' :
    thread.status === 'pending' || !thread.status ? 'pending' :
    thread.status;
  const tagColor = tag === 'approved' ? 'bg-green-100 text-green-800' :
    tag === 'rejected' ? 'bg-red-100 text-red-800' :
    'bg-gray-200 text-gray-700';

  // Hide content if swiping past threshold
  const hideContent = swipeProgress > SWIPE_THRESHOLD;
  const overlayOpacity = Math.min(1, swipeProgress * 2);

  // Function to handle approve with auto-save KB option
  const handleApprove = () => {
    if (autoSaveKB) {
      onAction('auto_approve_with_kb');
    } else {
      onAction('approve');
    }
  };

  // Function to handle reject - show dialog
  const handleReject = () => {
    setShowRejectDialog(true);
  };

  // Swipe handlers
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (locked) return;
      let progress = 0;
      let dir: null | 'right' | 'left' | 'up' | 'down' = null;
      const w = cardRef.current?.offsetWidth || 1;
      const h = cardRef.current?.offsetHeight || 1;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Horizontal
        progress = Math.abs(e.deltaX) / w;
        dir = e.deltaX > 0 ? 'right' : 'left';
        x.set(e.deltaX);
        y.set(0);
      } else {
        // Vertical
        progress = Math.abs(e.deltaY) / h;
        dir = e.deltaY > 0 ? 'down' : 'up';
        y.set(e.deltaY);
        x.set(0);
      }
      setSwipeDir(dir);
      setSwipeProgress(progress);
    },
    onSwiped: (e) => {
      if (locked) return;
      let progress = 0;
      let dir: null | 'right' | 'left' | 'up' | 'down' = null;
      const w = cardRef.current?.offsetWidth || 1;
      const h = cardRef.current?.offsetHeight || 1;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        progress = Math.abs(e.deltaX) / w;
        dir = e.deltaX > 0 ? 'right' : 'left';
      } else {
        progress = Math.abs(e.deltaY) / h;
        dir = e.deltaY > 0 ? 'down' : 'up';
      }
      if (progress > SWIPE_THRESHOLD && dir && !locked) {
        setLocked(true);
        // Animate card off-screen
        let animateTo = {};
        if (dir === 'right') animateTo = { x: w * 1.2, opacity: 0, rotate: 15, transition: { duration: 0.22 } };
        else if (dir === 'left') animateTo = { x: -w * 1.2, opacity: 0, rotate: -15, transition: { duration: 0.22 } };
        else if (dir === 'up') animateTo = { y: -h * 1.2, opacity: 0, rotate: -8, transition: { duration: 0.22 } };
        else if (dir === 'down') animateTo = { y: h * 1.2, opacity: 0, rotate: 8, transition: { duration: 0.18 } };
        controls.start(animateTo).then(() => {
          if (dir === 'up') {
            setShowSaved(true);
            setTimeout(() => {
              setShowSaved(false);
              controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
              setLocked(false);
              setSwipeDir(null);
              setSwipeProgress(0);
            }, 700);
            onAction('save_kb');
          } else if (dir === 'down') {
            setEditMode(true);
            setTimeout(() => {
              setLocked(false);
              setSwipeDir(null);
              setSwipeProgress(0);
              controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
              if (textareaRef.current) textareaRef.current.focus();
            }, 220);
            onAction('edit');
          } else if (dir === 'right') {
            handleApprove();
          } else if (dir === 'left') {
            // Reset card position and show reject dialog
            controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
            setLocked(false);
            setSwipeDir(null);
            setSwipeProgress(0);
            handleReject();
          }
        });
      } else {
        // Snap back
        controls.start({ x: 0, y: 0, opacity: 1, rotate: 0, transition: { duration: 0.18 } });
        setSwipeDir(null);
        setSwipeProgress(0);
      }
    },
    trackMouse: true,
  });

  // Reset card position when thread changes
  useEffect(() => {
    setLocked(false);
    setSwipeDir(null);
    setSwipeProgress(0);
    setShowSaved(false);
    setEditMode(isEditing);
    controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
  }, [thread.id, isEditing]);

  // Edit mode synchronization
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditing]);

  // Remove janky scroll detection - keep it simple

  // Simple scroll to top when thread changes
  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [thread.id]);

  // Handle jump target scrolling
  useEffect(() => {
    if (!mainContentRef.current) return;
    
    if (jumpTarget === 'summary' && summaryRef.current) {
      const offsetTop = summaryRef.current.offsetTop - mainContentRef.current.offsetTop;
      mainContentRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
    } else if (jumpTarget === 'reply' && replyRef.current) {
      const offsetTop = replyRef.current.offsetTop - mainContentRef.current.offsetTop;
      mainContentRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }, [jumpTarget]);

  // Reset states when improvement chat closes
  useEffect(() => {
    if (!showImproveChat) {
      setStreamingReply('');
      setHasStreamedReply(false);
      setChatHistory([]);
      setChatInput('');
      setIsStreaming(false);
    }
  }, [showImproveChat]);

  // Chatbot improvement handler with streaming
  const handleChatSend = async () => {
    if (!chatInput.trim() || !reply) return;
    
    const userMessage = chatInput.trim();
    setChatHistory((h) => [...h, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsStreaming(true);
    setStreamingReply('');
    setHasStreamedReply(false);
    
    try {
      const threadContext = `Subject: ${thread.subject}\nParticipants: ${thread.participants.join(', ')}`;
      const stream = improveReplyStream(reply, userMessage, threadContext);
      
      for await (const chunk of stream) {
        setStreamingReply(chunk);
      }
      
      setHasStreamedReply(true);
      
      // Track usage for improvement - estimate tokens and cost
      // Since this is streaming, we estimate based on input/output length
      const estimatedTokens = Math.ceil((reply.length + userMessage.length + streamingReply.length) / 4);
      const estimatedCost = estimatedTokens * 0.00002; // Rough estimate for GPT-4o
      const prevTokens = Number(localStorage.getItem('usage_tokens') || '0');
      const prevCost = Number(localStorage.getItem('usage_cost') || '0');
      localStorage.setItem('usage_tokens', String(prevTokens + estimatedTokens));
      localStorage.setItem('usage_cost', String(prevCost + estimatedCost));
      window.dispatchEvent(new Event('usage-updated'));
    } catch (error) {
      console.error('Streaming error:', error);
      setStreamingReply('❌ Error: Failed to improve reply. Please check your connection and try again.');
      setHasStreamedReply(false);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAcceptImprovement = () => {
    if (hasStreamedReply && streamingReply && onChangeReply && !streamingReply.startsWith('❌')) {
      onChangeReply(streamingReply);
      setShowImproveChat(false);
      setStreamingReply('');
      setHasStreamedReply(false);
      setChatHistory([]);
      setChatInput('');
    }
  };

  const handleCancelImprovement = () => {
    setShowImprove(false);
    setStreamingReply('');
    setHasStreamedReply(false);
    setChatHistory([]);
    setChatInput('');
    setIsStreaming(false);
  };

  // Helper to get people/projects from localStorage (KB)
  function getKBPeople() {
    try {
      return JSON.parse(localStorage.getItem('kb_people') || '[]') || [];
    } catch { return []; }
  }
  function getKBProjects() {
    try {
      return JSON.parse(localStorage.getItem('kb_projects') || '[]') || [];
    } catch { return []; }
  }

  // Get up-to-date people/projects from KB
  const kbPeople = getKBPeople();
  const kbProjects = getKBProjects();

  // For the right-side modal (expanded view):
  // Related people: those whose email is in thread.participants
  const relatedPeople = kbPeople.filter((person: any) => thread.participants.includes(person.email));
  const relatedProjects = kbProjects.filter((project: any) => {
    return project.participants && project.participants.some((pid: string) => relatedPeople.find((rp: any) => rp.id === pid));
  });

  return (
    <div ref={cardRef} className="relative w-full max-w-xl mx-auto select-none" style={{ minHeight: 420 }}>
      <motion.div
        {...handlers}
        animate={controls}
        style={{ x, y, rotate: 0, opacity: 1 }}
        className={`relative`}
      >
        {/* Overlay (inside card, follows card movement) */}
        {swipeDir && (
          <motion.div
            className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none ${overlayColor}`}
            style={{
              opacity: overlayOpacity,
              borderRadius: 24,
              transition: 'opacity 0.1s linear',
            }}
          >
            {hideContent && (
              <span className="text-5xl font-extrabold text-white drop-shadow-lg tracking-wide">{overlayLabel}</span>
            )}
          </motion.div>
        )}
        {/* Save to KB status */}
        {showSaved && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-blue-500"
            style={{ borderRadius: 24, opacity: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-4xl font-bold text-white">Saved to Knowledge Base!</span>
          </motion.div>
        )}
        <Card className={`p-6 h-[520px] flex flex-col bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow dark:shadow-gray-900/50 transition-opacity duration-200 ${hideContent ? 'opacity-0' : 'opacity-100'}`}
          style={{ borderRadius: 24 }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white line-clamp-2 mb-1 flex-1">{thread.subject}</h2>
            <Badge className={tagColor + ' text-xs'}>{tag}</Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {thread.participants.slice(0, 3).join(', ')}
            {thread.participants.length > 3 && ` +${thread.participants.length - 3}`}
          </p>

          {/* Main content */}
          <div ref={mainContentRef} className="flex-1 overflow-y-auto pr-1 space-y-6">

            {/* AI Summary Section */}
            <div ref={summaryRef} className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-lg">
                <span>📝</span>
                AI Summary
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
                <p className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{thread.summary || 'No summary available.'}</p>
              </div>
            </div>

            {/* AI Reply Section - same hierarchy as summary */}
            {reply && (
              <div ref={replyRef} className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-lg">
                  <span>🤖</span>
                  AI-Generated Reply
                </h4>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  {/* Much larger text area for better visibility */}
                  <Textarea
                    ref={textareaRef}
                    value={isEditing ? editedReply : (streamingReply || reply)}
                    onChange={(e) => onChangeReply?.(e.target.value)}
                    className="resize-none min-h-[200px] w-full text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900"
                    placeholder={isEditing ? "Edit your reply here..." : "AI-generated reply"}
                    readOnly={!isEditing}
                    style={{ cursor: isEditing ? 'text' : 'default' }}
                  />
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap mt-3">
                    {isEditing ? (
                      <>
                        <button 
                          className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition"
                          onClick={() => onAction('edit')}
                        >
                          ✅ Save Changes
                        </button>
                        <button 
                          className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition"
                          onClick={() => onAction('cancel_edit')}
                        >
                          Cancel
                        </button>
                        <button 
                          className="bg-purple-600 dark:bg-purple-500 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition text-sm"
                          onClick={() => setShowImproveChat(!showImproveChat)}
                        >
                          ✨ Improve with AI
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className={`px-3 py-2 rounded font-semibold transition text-sm ${
                            thread.status === 'approved' || thread.status === 'rejected'
                              ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600'
                          }`}
                          onClick={() => onAction('edit')}
                          disabled={thread.status === 'approved' || thread.status === 'rejected'}
                        >
                          ✏️ Edit Reply
                        </button>
                        
                        {/* Show different buttons for processed vs active threads */}
                        {thread.status === 'rejected' && !reply ? (
                          <button 
                            className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition text-sm"
                            onClick={() => onAction('generate_new')}
                          >
                            🔄 New Reply
                          </button>
                        ) : thread.status === 'pending' || (!thread.status && reply) ? (
                          <button 
                            className="bg-purple-600 dark:bg-purple-500 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition text-sm"
                            onClick={() => setShowImproveChat(!showImproveChat)}
                          >
                            ✨ Improve with AI
                          </button>
                        ) : null}
                        {hasStreamedReply && !streamingReply.startsWith('❌') && (
                          <button 
                            className="bg-green-600 dark:bg-green-500 text-white px-3 py-2 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition text-sm"
                            onClick={handleAcceptImprovement}
                          >
                            ✅ Accept Improvement
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Inline improvement chat interface */}
                  {showImproveChat && (
                    <div className="mt-4 border-t dark:border-gray-600 pt-3 space-y-3">
                      <div className="flex gap-2">
                        <Textarea
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { 
                            if (e.key === 'Enter' && !e.shiftKey) { 
                              e.preventDefault(); 
                              if (!isStreaming) handleChatSend(); 
                            } 
                          }}
                          className="flex-1 resize-none text-sm"
                          placeholder="e.g., 'Make it more formal', 'Add details about timeline'..."
                          rows={2}
                          disabled={isStreaming}
                        />
                        <button 
                          className="bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                          onClick={handleChatSend}
                          disabled={isStreaming || !chatInput.trim()}
                        >
                          {isStreaming ? 'Improving...' : 'Improve'}
                        </button>
                      </div>
                      
                      {/* Show streaming improvement directly in the textarea above */}
                      {isStreaming && (
                        <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <div className="animate-pulse w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                          <span>Generating improved version...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show "New Reply" button for rejected threads without a draft */}
            {!reply && thread.status === 'rejected' && (
              <div ref={replyRef} className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-lg">
                  <span>🤖</span>
                  Generate New Reply
                </h4>
                <div className={`rounded-lg p-6 border text-center bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700`}>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">This thread was rejected. Generate a new reply to continue the conversation.</p>
                  <button 
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                    onClick={() => onAction('generate_new')}
                  >
                    🔄 New Reply
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Footer badges */}
          <div className="flex gap-2 items-center mt-2">
            {thread.importance && (
              <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                {thread.importance}
              </Badge>
            )}
            {reply && <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px]">Draft</Badge>}
          </div>
        </Card>
      </motion.div>
      {/* Expand Thread Modal */}
      {showExpand && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{thread.subject}</h3>
              <button
                onClick={() => setShowExpand(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content - New Layout: Email Thread + Reply (Left) and Summary + People/Projects (Right) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Section - Email Thread + Reply Draft */}
              <div className="w-2/3 border-r dark:border-gray-600 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-700">
                <div className="p-6 space-y-6">
                  {/* Email Thread */}
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-xl mb-4">📧 Email Thread</h4>
                    <div className="space-y-4">
                      {messages.map((msg: Email, idx: number) => (
                        <div key={idx} className="relative">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
                              {msg.sender[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-600 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{msg.sender}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.date).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                              </div>
                            </div>
                          </div>
                          {/* Connecting line */}
                          {idx < messages.length - 1 && (
                            <div className="absolute left-5 top-12 w-0.5 h-8 bg-gray-300"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Draft - Bottom of left section */}
                  {reply && (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-gray-800 text-xl mb-4">✉️ Reply Draft</h4>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <textarea
                          className="resize-none w-full text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[300px]"
                          value={reply || ''}
                          readOnly
                          placeholder="No reply draft available"
                        />
                        
                        {/* Improvement chat interface */}
                        {showImproveChat && (
                          <div className="mt-4 border-t pt-3 space-y-3">
                            <div className="flex gap-2">
                              <Textarea
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => { 
                                  if (e.key === 'Enter' && !e.shiftKey) { 
                                    e.preventDefault(); 
                                    if (!isStreaming) handleChatSend(); 
                                  } 
                                }}
                                className="flex-1 resize-none text-sm"
                                placeholder="e.g., 'Make it more formal', 'Add details about timeline'..."
                                rows={2}
                                disabled={isStreaming}
                              />
                              <button 
                                className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={handleChatSend}
                                disabled={isStreaming || !chatInput.trim()}
                              >
                                {isStreaming ? 'Improving...' : 'Improve'}
                              </button>
                            </div>
                            
                            {isStreaming && (
                              <div className="text-xs text-purple-600 flex items-center gap-1">
                                <div className="animate-pulse w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                <span>Generating improved version...</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {isEditing ? (
                            <>
                              <button 
                                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                                onClick={() => onAction('edit')}
                              >
                                ✅ Save Changes
                              </button>
                              <button 
                                className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition"
                                onClick={() => onAction('cancel_edit')}
                              >
                                Cancel
                              </button>
                              <button 
                                className="bg-purple-600 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 transition text-sm"
                                onClick={() => setShowImproveChat(!showImproveChat)}
                              >
                                ✨ Improve with AI
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="bg-yellow-600 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-700 transition"
                                onClick={() => onAction('edit')}
                              >
                                ✏️ Edit Reply
                              </button>
                              <button 
                                className="bg-purple-600 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 transition text-sm"
                                onClick={() => setShowImproveChat(!showImproveChat)}
                              >
                                ✨ Improve with AI
                              </button>
                              {hasStreamedReply && !streamingReply.startsWith('❌') && (
                                <button 
                                  className="bg-green-600 text-white px-3 py-2 rounded font-semibold hover:bg-green-700 transition text-sm"
                                  onClick={handleAcceptImprovement}
                                >
                                  ✅ Accept Improvement
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section - Summary + People/Projects */}
              <div className="w-1/3 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                  {/* AI Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-xl mb-4">📝 Summary</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border dark:border-gray-600">
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{thread.summary || 'No summary available.'}</p>
                    </div>
                  </div>

                  {/* Knowledge Base Section */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg mb-3">👥 People</h4>
                    <div className="space-y-3">
                      {kbPeople.length > 0 ? kbPeople.map((person: { id: string; name: string; email: string; company?: string; role?: string; notes?: string; }) => (
                        <div key={person.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                          <h5 className="font-medium text-gray-900 dark:text-white">{person.name}</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
                          {person.company && person.role && (
                            <p className="text-xs text-gray-600 dark:text-gray-300">{person.company} · {person.role}</p>
                          )}
                          {person.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{person.notes}</p>
                          )}
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No people found.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg mb-3">📋 Projects</h4>
                    <div className="space-y-3">
                      {kbProjects.length > 0 ? kbProjects.map((project: { id: string; name: string; description?: string; }) => (
                        <div key={project.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                          <h5 className="font-medium text-gray-900 dark:text-white">{project.name}</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No projects found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setJumpTarget(jumpTarget)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border dark:border-gray-600">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Reply Rejected</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">How would you like to handle this rejected thread?</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => onAction('generate_new')} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🔄 Generate New Reply
                </Button>
                
                <Button 
                  onClick={() => onAction('reject_archive')} 
                  variant="outline" 
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  📂 Archive Thread
                </Button>
                
                <Button 
                  onClick={() => onAction('reject_with_kb')} 
                  variant="outline" 
                  className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  📚 Archive & Save to KB
                </Button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t dark:border-gray-600">
              <Button 
                onClick={() => setJumpTarget(jumpTarget)} 
                variant="ghost" 
                size="sm" 
                className="w-full dark:hover:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TinderThreadCard; 