import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import type { EmailThread, Email, Person, Project } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { getThreadMessages, mockPeople, mockProjects } from '../mock/threads';
import { CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { openaiService } from '../lib/openai-service';

export interface TinderThreadCardProps {
  thread: EmailThread;
  reply?: string;
  isEditing?: boolean;
  editedReply?: string;
  onAction: (action: 'approve' | 'reject' | 'edit' | 'save_kb' | 'cancel_edit' | 'auto_approve_with_kb' | 'reject_archive' | 'reject_with_kb') => void;
  onChangeReply?: (text: string) => void;
  showExpand: boolean;
  setShowExpand: (show: boolean) => void;
  showImprove: boolean;
  setShowImprove: (show: boolean) => void;
  jumpTarget: 'summary' | 'reply';
  setJumpTarget: (target: 'summary' | 'reply') => void;
}

const SWIPE_THRESHOLD = 0.33; // 33% of card width/height

const TinderThreadCard = forwardRef<HTMLDivElement, TinderThreadCardProps>(function TinderThreadCard({
  thread, reply, isEditing = false, editedReply = '', onAction, onChangeReply,
  showExpand, setShowExpand, showImprove, setShowImprove, jumpTarget, setJumpTarget
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
  const [autoSaveKB, setAutoSaveKB] = useState(() => {
    return localStorage.getItem('auto_save_kb') !== 'false'; // Default to true
  });
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
      const stream = openaiService.improveReplyStream(reply, userMessage, threadContext);
      
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

  // Get thread messages - create realistic sample data
  const getThreadMessages = (threadId: string) => {
    // Generate realistic email thread based on subject and participants
    const messages = [
      {
        id: `msg_${threadId}_1`,
        sender: thread.participants[0] || 'Unknown',
        body: `Hi team,\n\nI wanted to follow up on our discussion about ${thread.subject}. I think we should move forward with the proposal we discussed last week.\n\nCould everyone please review the attached documents and let me know your thoughts by Friday?\n\nBest regards,\n${thread.participants[0]?.split('@')[0] || 'User'}`,
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      }
    ];

    if (thread.participants.length > 1) {
      messages.push({
        id: `msg_${threadId}_2`,
        sender: thread.participants[1],
        body: `Thanks for the update! I've reviewed the documents and they look good to me. \n\nI have a few minor suggestions:\n\n1. Could we adjust the timeline slightly?\n2. The budget looks reasonable\n3. We should include more details about the implementation phase\n\nOverall, I'm supportive of moving forward.\n\nThanks,\n${thread.participants[1]?.split('@')[0] || 'User2'}`,
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      });
    }

    if (thread.participants.length > 2) {
      messages.push({
        id: `msg_${threadId}_3`,
        sender: thread.participants[2],
        body: `I agree with the previous comments. Let's schedule a meeting to finalize the details.\n\nI'm available next Tuesday or Wednesday afternoon. Please let me know what works for everyone.\n\nBest,\n${thread.participants[2]?.split('@')[0] || 'User3'}`,
        date: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      });
    }

    return messages;
  };

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
        <Card className={`p-6 h-[520px] flex flex-col bg-white overflow-hidden rounded-xl shadow transition-opacity duration-200 ${hideContent ? 'opacity-0' : 'opacity-100'}`}
          style={{ borderRadius: 24 }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-gray-900 line-clamp-2 mb-1 flex-1">{thread.subject}</h2>
            <Badge className={tagColor + ' text-xs'}>{tag}</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {thread.participants.slice(0, 3).join(', ')}
            {thread.participants.length > 3 && ` +${thread.participants.length - 3}`}
          </p>


          {/* Main content */}
          <div ref={mainContentRef} className="flex-1 overflow-y-auto pr-1 space-y-6">


            {/* AI Summary Section */}
            <div ref={summaryRef} className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                <span>📝</span>
                AI Summary
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">{thread.summary || 'No summary available.'}</p>
              </div>
            </div>

            {/* AI Reply Section - same hierarchy as summary */}
            {reply && (
              <div ref={replyRef} className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                  <span>🤖</span>
                  AI-Generated Reply
                </h4>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  {/* Much larger text area for better visibility */}
                  <Textarea
                    ref={textareaRef}
                    value={isEditing ? editedReply : (streamingReply || reply)}
                    onChange={(e) => onChangeReply?.(e.target.value)}
                    className="resize-none min-h-[200px] w-full text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder={isEditing ? "Edit your reply here..." : "AI-generated reply"}
                    readOnly={!isEditing}
                    style={{ cursor: isEditing ? 'text' : 'default' }}
                  />
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap mt-3">
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
                                className={`px-3 py-2 rounded font-semibold transition text-sm ${
                                  thread.status === 'approved' || thread.status === 'rejected'
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                }`}
                                onClick={() => onAction('edit')}
                                disabled={thread.status === 'approved' || thread.status === 'rejected'}
                              >
                                ✏️ Edit Reply
                              </button>
                              
                              {/* Show different buttons for processed vs active threads */}
                              {thread.status === 'approved' || thread.status === 'rejected' ? (
                                <button 
                                  className="bg-blue-600 text-white px-3 py-2 rounded font-semibold hover:bg-blue-700 transition text-sm"
                                  onClick={() => {
                                    // This would need a new action type to be handled by the parent
                                    onAction('edit'); // Temporarily use edit action for now
                                  }}
                                >
                                  🔄 Generate New Reply
                                </button>
                              ) : (
                                <button 
                                  className="bg-purple-600 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 transition text-sm"
                                  onClick={() => setShowImproveChat(!showImproveChat)}
                                >
                                  ✨ Improve with AI
                                </button>
                              )}
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
                  
                  {/* Inline improvement chat interface */}
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
                      
                      {/* Show streaming improvement directly in the textarea above */}
                      {isStreaming && (
                        <div className="text-xs text-purple-600 flex items-center gap-1">
                          <div className="animate-pulse w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          <span>Generating improved version...</span>
                        </div>
                      )}
                    </div>
                  )}
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
            {reply && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Draft</Badge>}
          </div>
        </Card>
      </motion.div>
      {/* Expand Thread Modal */}
      {showExpand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">{thread.subject}</h3>
              <button
                onClick={() => setShowExpand(false)}
                className="text-gray-500 hover:text-gray-700 transition text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content - New Layout: Email Thread + Reply (Left) and Summary + People/Projects (Right) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Section - Email Thread + Reply Draft */}
              <div className="w-2/3 border-r overflow-y-auto custom-scrollbar bg-gray-50">
                <div className="p-6 space-y-6">
                  {/* Email Thread */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-xl mb-4">📧 Email Thread</h4>
                    <div className="space-y-4">
                      {getThreadMessages(thread.id).map((msg, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm text-white font-medium flex-shrink-0">
                              {msg.sender[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-lg p-4 border shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-sm">{msg.sender}</span>
                                  <span className="text-xs text-gray-500">{new Date(msg.date).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                              </div>
                            </div>
                          </div>
                          {/* Connecting line */}
                          {idx < getThreadMessages(thread.id).length - 1 && (
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
                        <Textarea
                          value={isEditing ? editedReply : reply}
                          onChange={(e) => onChangeReply?.(e.target.value)}
                          className="resize-none w-full text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[300px]"
                          placeholder={isEditing ? "Edit your reply here..." : "AI-generated reply"}
                          readOnly={!isEditing}
                          style={{ cursor: isEditing ? 'text' : 'default' }}
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
                    <h4 className="font-semibold text-gray-800 text-xl mb-4">📝 Summary</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{thread.summary || 'No summary available.'}</p>
                    </div>
                  </div>

                  {/* People */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-3">👥 People</h4>
                    <div className="space-y-3">
                      {mockPeople.filter(person => thread.participants.includes(person.email)).map((person) => (
                        <Card key={person.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs text-white font-medium">
                                {person.name[0].toUpperCase()}
                              </div>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{person.name}</p>
                              <p className="text-xs text-gray-500 truncate">{person.email}</p>
                              {person.company && (
                                <p className="text-xs text-gray-600">{person.company} · {person.role}</p>
                              )}
                              {person.notes && (
                                <p className="text-xs text-gray-500 mt-1">{person.notes}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                      {mockPeople.filter(person => thread.participants.includes(person.email)).length === 0 && (
                        <p className="text-xs text-gray-500">No people found.</p>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-3">📋 Projects</h4>
                    <div className="space-y-3">
                      {mockProjects.filter(project => {
                        const relatedPeople = mockPeople.filter(person => thread.participants.includes(person.email));
                        return project.participants.some(pid => relatedPeople.find(rp => rp.id === pid));
                      }).map((project) => (
                        <Card key={project.id} className="p-3">
                          <h5 className="font-medium text-sm">{project.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                          <Badge className="mt-2 text-xs" variant="outline">
                            {project.status}
                          </Badge>
                        </Card>
                      ))}
                      {mockProjects.filter(project => {
                        const relatedPeople = mockPeople.filter(person => thread.participants.includes(person.email));
                        return project.participants.some(pid => relatedPeople.find(rp => rp.id === pid));
                      }).length === 0 && (
                        <p className="text-xs text-gray-500">No projects found.</p>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Reject Thread</h3>
              <p className="text-gray-600 mb-6">How would you like to handle this rejected thread?</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    onAction('reject_archive');
                  }}
                  className="bg-red-600 text-white px-4 py-3 rounded font-semibold hover:bg-red-700 transition text-left"
                >
                  🗄️ Archive Only
                  <div className="text-sm text-red-100 mt-1">Just reject and archive the thread</div>
                </button>
                
                <button
                  onClick={() => {
                    setShowRejectDialog(false);
                    onAction('reject_with_kb');
                  }}
                  className="bg-orange-600 text-white px-4 py-3 rounded font-semibold hover:bg-orange-700 transition text-left"
                >
                  📚 Save to Knowledge Base & Archive
                  <div className="text-sm text-orange-100 mt-1">Extract useful information before archiving</div>
                </button>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>

              {/* Auto-save KB preference toggle */}
              <div className="mt-4 pt-4 border-t">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoSaveKB}
                    onChange={(e) => {
                      setAutoSaveKB(e.target.checked);
                      localStorage.setItem('auto_save_kb', e.target.checked.toString());
                    }}
                    className="rounded"
                  />
                  <span>Auto-save to Knowledge Base when approving (swipe right)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TinderThreadCard; 