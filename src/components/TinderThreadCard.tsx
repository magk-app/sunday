import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import type { EmailThread, Email } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { getThreadMessages } from '../mock/threads';
import { CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { openaiService } from '../lib/openai-service';

export interface TinderThreadCardProps {
  thread: EmailThread;
  reply?: string;
  isEditing?: boolean;
  editedReply?: string;
  onAction: (action: 'approve' | 'reject' | 'edit' | 'save_kb' | 'cancel_edit') => void;
  onChangeReply?: (text: string) => void;
  showExpand: boolean;
  setShowExpand: React.Dispatch<React.SetStateAction<boolean>>;
  showImprove: boolean;
  setShowImprove: React.Dispatch<React.SetStateAction<boolean>>;
  jumpTarget: 'summary' | 'reply' | 'edit';
  setJumpTarget: React.Dispatch<React.SetStateAction<'summary' | 'reply' | 'edit'>>;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Overlay color and label
  let overlayColor = '';
  let overlayLabel = '';
  if (swipeDir === 'right') {
    overlayColor = 'bg-green-500';
    overlayLabel = 'APPROVE';
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
          } else {
            onAction(dir === 'right' ? 'approve' : 'reject');
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

  // Section jumping with smooth scroll
  useEffect(() => {
    if (jumpTarget === 'summary' && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (jumpTarget === 'reply' && replyRef.current) {
      // Scroll to reply with extra space at bottom to separate from summary
      replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      // Add extra scroll to ensure proper spacing
      setTimeout(() => {
        if (replyRef.current) {
          const rect = replyRef.current.getBoundingClientRect();
          const additionalScroll = window.innerHeight * 0.3; // 30% of viewport height
          window.scrollBy({ top: additionalScroll, behavior: 'smooth' });
        }
      }, 500);
    } else if (jumpTarget === 'edit' && isEditing && textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus textarea after scroll
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [jumpTarget, isEditing]);

  // Reset states when modal closes
  useEffect(() => {
    if (!showImprove) {
      setStreamingReply('');
      setHasStreamedReply(false);
      setChatHistory([]);
      setChatInput('');
      setIsStreaming(false);
    }
  }, [showImprove]);

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
      setShowImprove(false);
      // Add success feedback
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Improvement applied successfully! ✅' }]);
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
          <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-6">
            <div ref={summaryRef}>
              <h4 className="text-lg font-bold text-blue-700 mb-2">AI Summary</h4>
              <p className="text-base text-gray-800 whitespace-pre-wrap">{thread.summary || 'No summary available.'}</p>
            </div>
            {/* AI Reply Section - consolidated with edit and improvement */}
            {reply && (
              <div ref={replyRef} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <span>🤖</span>
                  AI-Generated Reply
                </h4>
                
                {/* Display mode or Edit mode */}
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      ref={textareaRef}
                      value={editedReply}
                      onChange={(e) => onChangeReply?.(e.target.value)}
                      className="resize-none min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Edit your reply here..."
                      autoFocus
                    />
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-base whitespace-pre-wrap text-gray-800 bg-white rounded p-3 border">{reply}</p>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        className="bg-yellow-600 text-white px-3 py-2 rounded font-semibold hover:bg-yellow-700 transition text-sm"
                        onClick={() => onAction('edit')}
                      >
                        ✏️ Edit Reply
                      </button>
                      <button 
                        className="bg-purple-600 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 transition text-sm"
                        onClick={() => setShowImprove(true)}
                      >
                        ✨ Improve with AI
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Add bottom spacing for better scrolling */}
                <div className="h-32"></div>
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowExpand(false)} tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') setShowExpand(false); }}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto relative animate-fade-in custom-scrollbar" onClick={e => e.stopPropagation()} tabIndex={0}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold" onClick={() => setShowExpand(false)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4">Full Email Thread</h3>
            
            {/* Thread messages timeline */}
            <div className="space-y-4 mb-6">
              {getThreadMessages(thread.id).map((message, idx) => (
                <div key={message.id} className="relative">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm text-white font-medium">
                        {message.sender[0].toUpperCase()}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{message.sender}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{message.body}</p>
                    </div>
                  </div>
                  {idx < getThreadMessages(thread.id).length - 1 && (
                    <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
            
            {/* AI Reply in modal */}
            {reply && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <span>🤖</span>
                  AI-Generated Reply
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-white rounded p-3 border">{reply}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add Improvement Modal (Chatbot with Streaming) */}
      {showImprove && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={handleCancelImprovement} tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') handleCancelImprovement(); }}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto relative animate-fade-in" onClick={e => e.stopPropagation()} tabIndex={0}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold" onClick={handleCancelImprovement} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4">Suggest an Improvement</h3>
            
            {/* Current reply */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Reply:</h4>
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-800 border">{reply}</div>
            </div>
            
            {/* Chat history */}
            <div className="mb-4 h-32 overflow-y-auto bg-gray-50 rounded p-3 border">
              {chatHistory.length === 0 && !streamingReply && <div className="text-gray-400 text-sm">Type your suggestion below to improve the reply.</div>}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Streaming improved reply */}
            {(streamingReply || isStreaming) && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-green-700">Improved Reply:</h4>
                  {isStreaming && (
                    <div className="flex items-center gap-1">
                      <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                      <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
                <div className={`rounded p-3 text-sm border min-h-[80px] ${
                  streamingReply.startsWith('❌') 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-green-50 border-green-200 text-gray-800'
                }`}>
                  {streamingReply || (isStreaming ? 'Generating improvement...' : '')}
                  {isStreaming && <span className="animate-pulse">|</span>}
                </div>
                {hasStreamedReply && !streamingReply.startsWith('❌') && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                      onClick={handleAcceptImprovement}
                    >
                      ✅ Accept Improvement
                    </button>
                    <button 
                      className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition"
                      onClick={() => { setStreamingReply(''); setHasStreamedReply(false); }}
                    >
                      🔄 Try Again
                    </button>
                  </div>
                )}
                {streamingReply.startsWith('❌') && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                      onClick={() => { setStreamingReply(''); setHasStreamedReply(false); }}
                    >
                      🔄 Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Input area */}
            <div className="flex gap-2 mt-4">
              <Textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    if (!isStreaming) handleChatSend(); 
                  } 
                }}
                className="flex-1 resize-none"
                placeholder="Type your suggestion (e.g., 'Make it more formal', 'Add more details about timeline')..."
                rows={2}
                disabled={isStreaming}
              />
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleChatSend}
                disabled={isStreaming || !chatInput.trim()}
              >
                {isStreaming ? 'Improving...' : 'Improve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TinderThreadCard; 