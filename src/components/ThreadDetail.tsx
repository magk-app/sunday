import React, { useState, useEffect } from 'react';
import type { EmailThread, Email, DraftReply, Person, Project } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { summarizeThread } from '../lib/ai/summarize';
import { classifyImportance } from '../lib/ai/classify';
import { analyzeThreadFull } from '../lib/ai/extract';
import { improveReply } from '../lib/ai/reply';
import Link from 'next/link';

interface ThreadDetailProps {
  thread: EmailThread | null;
  messages: Email[];
  draft: DraftReply | null;
  people: Person[];
  projects: Project[];
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
  onGenerateReply: () => void;
  onUpdateDraft: (draftId: string, newBody: string) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
  onCreditsUsed: (amount: number, tokens: number, cost: number) => void;
  onSummaryGenerated: (threadId: string, summary: string, importance?: 'urgent' | 'high' | 'medium' | 'low') => void;
}

export default function ThreadDetail({
  thread,
  messages,
  draft,
  people,
  projects,
  onApprove,
  onReject,
  onGenerateReply,
  onUpdateDraft,
  onNotify,
  onCreditsUsed,
  onSummaryGenerated,
}: ThreadDetailProps) {
  // All hooks must be at the top, before any return
  const [isSending, setIsSending] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [summary, setSummary] = useState<string | null>(thread?.summary || null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState<string>('');
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [isSavingKB, setIsSavingKB] = useState(false);
  const [showImproveChat, setShowImproveChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string>('');
  const [hasStreamedReply, setHasStreamedReply] = useState(false);

  useEffect(() => {
    if (isCollapsed && !summary && !summaryLoading && thread) {
      handleGenerateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollapsed]);

  // Reset summary state when thread prop changes
  useEffect(() => {
    setSummary(thread?.summary || null);
  }, [thread?.id]);

  // All hooks above, now do the early return
  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to view
      </div>
    );
  }

  const handleApprove = async () => {
    if (!draft) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sending
    onApprove(draft.id);
    setIsSending(false);
  };

  const handleGenerateReply = async () => {
    setIsGenerating(true);
    await onGenerateReply();
    setIsGenerating(false);
  };

  const handleGenerateSummary = async () => {
    if (!thread) return;
    setSummaryLoading(true);
    
    try {
      const result = await summarizeThread(thread, messages);
      const impRes = await classifyImportance(thread, messages);
      
      if (result.success && result.data) {
        setSummary(result.data);
        const importance = impRes.success ? impRes.data : undefined;
        onSummaryGenerated(thread.id, result.data, importance);
        onNotify('✨ Summary generated!', 'success');
        
        // Track usage for both calls
        if (result.usage) {
          const prevTokens = Number(localStorage.getItem('usage_tokens') || '0');
          const prevCost = Number(localStorage.getItem('usage_cost') || '0');
          let totalTokens = result.usage.tokens;
          let totalCost = result.usage.cost;
          
          if (impRes.usage) {
            totalTokens += impRes.usage.tokens;
            totalCost += impRes.usage.cost;
          }
          
          localStorage.setItem('usage_tokens', String(prevTokens + totalTokens));
          localStorage.setItem('usage_cost', String(prevCost + totalCost));
          window.dispatchEvent(new Event('usage-updated'));
          
          onCreditsUsed(Math.ceil(totalTokens / 100), totalTokens, totalCost);
        }
      } else {
        onNotify(result.error || 'Failed to generate summary', 'error');
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      onNotify('Failed to generate summary', 'error');
    }
    
    setSummaryLoading(false);
  };

  const relatedPeople = people.filter((p) => thread.participants.includes(p.email));
  const relatedProjects = projects.filter((proj) => proj.participants.some(pid => relatedPeople.find(rp => rp.id === pid)));

  const handleSaveToKB = async () => {
    if (!thread) return;
    setIsSavingKB(true);
    
    try {
      const res = await analyzeThreadFull(thread, messages);
      if (res.success && res.data) {
        try {
          const people = JSON.parse(localStorage.getItem('kb_people') || '[]');
          const projects = JSON.parse(localStorage.getItem('kb_projects') || '[]');
          const newPeople = [...people, ...res.data.people.filter(p => !people.includes(p))];
          const newProjects = [...projects, ...res.data.projects.filter(p => !projects.includes(p))];
          localStorage.setItem('kb_people', JSON.stringify(newPeople));
          localStorage.setItem('kb_projects', JSON.stringify(newProjects));
          
          // Track usage
          if (res.usage) {
            const prevTokens = Number(localStorage.getItem('usage_tokens') || '0');
            const prevCost = Number(localStorage.getItem('usage_cost') || '0');
            localStorage.setItem('usage_tokens', String(prevTokens + res.usage.tokens));
            localStorage.setItem('usage_cost', String(prevCost + res.usage.cost));
            window.dispatchEvent(new Event('usage-updated'));
            
            onCreditsUsed(Math.ceil(res.usage.tokens / 100), res.usage.tokens, res.usage.cost);
          }
          
          onNotify('✨ Saved to Knowledge Base!', 'success');
        } catch {
          onNotify('Failed to save to knowledge base', 'error');
        }
      } else {
        onNotify(res.error || 'Failed to analyze thread', 'error');
      }
    } catch (error) {
      console.error('Failed to save to KB:', error);
      onNotify('Failed to save to knowledge base', 'error');
    }
    
    setIsSavingKB(false);
  };

  const handleReject = () => {
    if (!draft) return;
    onReject(draft.id);
  };

  const toggleImportant = () => {
    // This demo just notifies; in real app mutate store
    onNotify(thread.important ? 'Removed from important' : 'Marked as important', 'success');
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !draft) return;
    
    setIsStreaming(true);
    const userMessage = chatInput.trim();
    setChatInput('');
    
    try {
      // Simulate streaming by using the improveReply method
      const result = await improveReply(draft.body, userMessage, thread?.subject);
      
      if (result.success && result.data) {
        setStreamingReply(result.data);
        setHasStreamedReply(true);
        
        // Track usage for improvement
        if (result.usage) {
          onCreditsUsed(Math.ceil(result.usage.tokens / 100), result.usage.tokens, result.usage.cost);
        }
      } else {
        setStreamingReply('❌ Failed to improve reply: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setStreamingReply('❌ Error occurred while improving reply');
    }
    
    setIsStreaming(false);
  };

  const handleAcceptImprovement = () => {
    if (!streamingReply || streamingReply.startsWith('❌') || !draft) return;
    setEditedBody(streamingReply);
    // Update the draft with the improved reply
    onNotify('Reply improved successfully!', 'success');
    setShowImproveChat(false);
    setStreamingReply('');
    setHasStreamedReply(false);
  };

  const handleCancelImprovement = () => {
    setShowImproveChat(false);
    setStreamingReply('');
    setHasStreamedReply(false);
    setChatInput('');
  };

  return (
    <div className="flex-1 flex">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Thread Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{thread.subject}</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-2">
                {thread.participants.slice(0, 4).map((email, idx) => (
                  <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm text-white font-medium">
                      {email[0].toUpperCase()}
                    </div>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {thread.participants.length} participants · {thread.message_count} messages
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-auto relative group"
                title={isCollapsed ? "Expand to show full thread" : "Collapse to show AI summary"}
              >
                {isCollapsed ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {isCollapsed ? "Expand to show full thread" : "Collapse to show AI summary"}
                </span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSaveToKB} disabled={isSavingKB} className="ml-2">
                {isSavingKB ? 'Saving…' : 'Save to KB'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Collapsed Summary */}
        {isCollapsed && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-blue-600">✨</span>
                  AI-Generated Summary
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-800">Summary</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border border-gray-400 border-t-transparent rounded-full" />
                  <span className="italic text-sm">Generating summary...</span>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{summary || 'No summary available.'}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Message Timeline */}
        {!isCollapsed && (
        <div className="space-y-4 mb-6">
          {messages.map((message, idx) => (
            <Card key={message.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
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
              </CardContent>
              {idx < messages.length - 1 && (
                <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gray-200" />
              )}
            </Card>
          ))}
        </div>
        )}

        {/* AI Draft Reply or Sent Message */}
        {!isCollapsed && draft && (
          <Card className={`border-2 ${draft.status === 'sent' ? 'border-green-200 bg-green-50' : draft.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className={draft.status === 'sent' ? 'text-green-600' : draft.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}>
                    {draft.status === 'sent' ? '✅' : draft.status === 'rejected' ? '❌' : '✨'}
                  </span>
                  {draft.status === 'sent' ? 'Reply Sent' : draft.status === 'rejected' ? 'Reply Rejected' : 'AI-Generated Reply'}
                </CardTitle>
                <Badge className={
                  draft.status === 'sent' ? 'bg-green-100 text-green-800' : 
                  draft.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-amber-100 text-amber-800'
                }>
                  {draft.status === 'sent' ? 'Sent' : draft.status === 'rejected' ? 'Rejected' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={isEditing ? editedBody : (streamingReply || draft.body)}
                onChange={(e) => setEditedBody(e.target.value)}
                className="resize-none min-h-[200px] w-full text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white mb-4"
                placeholder={isEditing ? "Edit your reply here..." : "AI-generated reply"}
                readOnly={!isEditing}
                style={{ cursor: isEditing ? 'text' : 'default' }}
              />
              
              {/* Improvement chat interface */}
              {showImproveChat && (
                <div className="mb-4 border-t pt-3 space-y-3">
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
                    <Button 
                      className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={handleChatSend}
                      disabled={isStreaming || !chatInput.trim()}
                    >
                      {isStreaming ? 'Improving...' : 'Improve'}
                    </Button>
                  </div>
                  
                  {isStreaming && (
                    <div className="text-xs text-purple-600 flex items-center gap-1">
                      <div className="animate-pulse w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Generating improved version...</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Only show action buttons for pending drafts */}
              {draft.status === 'pending' && (
                <div className="flex gap-2 flex-wrap">
                  {isEditing ? (
                    <>
                      <Button 
                        className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                        onClick={() => {
                          if (draft && editedBody !== draft.body) {
                            onUpdateDraft(draft.id, editedBody);
                            onNotify('Reply updated successfully!', 'success');
                          }
                          setIsEditing(false);
                        }}
                      >
                        ✅ Save Changes
                      </Button>
                      <Button 
                        className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition"
                        onClick={() => {
                          setIsEditing(false);
                          setEditedBody(draft.body);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-purple-600 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 transition text-sm"
                        onClick={() => setShowImproveChat(!showImproveChat)}
                      >
                        ✨ Improve with AI
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleApprove}
                        disabled={isSending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSending ? (
                          <>
                            <span className="animate-pulse">Sending...</span>
                          </>
                        ) : (
                          'Approve & Send'
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isSending}
                      >
                        Reject & Archive
                      </Button>
                      <Button 
                        className="bg-yellow-600 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-700 transition"
                        onClick={() => {
                          setIsEditing(true);
                          setEditedBody(draft.body);
                        }}
                        disabled={isSending}
                      >
                        ✏️ Edit Reply
                      </Button>
                      <Button 
                        className="bg-purple-600 text-white px-3 py-2 rounded font-semibold hover:bg-purple-700 transition text-sm"
                        onClick={() => setShowImproveChat(!showImproveChat)}
                      >
                        ✨ Improve with AI
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateReply}
                        disabled={isSending || isGenerating}
                        className="w-9 h-9"
                      >
                        {isGenerating ? (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </Button>
                      {hasStreamedReply && !streamingReply.startsWith('❌') && (
                        <Button 
                          className="bg-green-600 text-white px-3 py-2 rounded font-semibold hover:bg-green-700 transition text-sm"
                          onClick={handleAcceptImprovement}
                        >
                          ✅ Accept Improvement
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* Show only 'New Reply' for sent/rejected */}
              {(draft.status === 'sent' || draft.status === 'rejected') && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleGenerateReply}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Generating...
                      </>
                    ) : (
                      '🔄 New Reply'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isCollapsed && !draft && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              {thread.status === 'rejected' ? (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={handleGenerateReply}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Generating...
                      </>
                    ) : (
                      '🔄 New Reply'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    className="bg-yellow-600 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-700 transition"
                    size="sm" 
                    variant="outline"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    onClick={handleGenerateReply}
                    disabled={isGenerating}
                    size="icon"
                    className="w-10 h-10"
                  >
                    {isGenerating ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Knowledge Sidebar */}
      <aside className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Knowledge Base</h3>
          <Link href="/knowledge" className="text-xs text-blue-600 hover:underline">See more</Link>
        </div>
        
        {/* People */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-gray-700">People</h4>
          <div className="space-y-2">
            {relatedPeople.length === 0 && <p className="text-xs text-gray-500">No people found.</p>}
            {relatedPeople.map((person) => (
              <Card key={person.id} className="p-3 cursor-pointer" onClick={() => setActivePerson(person)}>
                <div className="flex items-start gap-2">
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-700">Projects</h4>
          <div className="space-y-2">
            {relatedProjects.length === 0 && <p className="text-xs text-gray-500">No projects found.</p>}
            {relatedProjects.map((project) => (
              <Card key={project.id} className="p-3">
                <h5 className="font-medium text-sm">{project.name}</h5>
                <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                <Badge className="mt-2 text-xs" variant="outline">
                  {project.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </aside>

      {/* Modal for see more */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded shadow p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">All People</h3>
            <div className="space-y-2">
              {people.map((person) => (
                <Card key={person.id} className="p-3">
                  <p className="font-medium text-sm">{person.name}</p>
                  <p className="text-xs text-gray-500">{person.email}</p>
                </Card>
              ))}
            </div>
            <h3 className="font-bold text-lg mt-6 mb-4">All Projects</h3>
            <div className="space-y-2">
              {projects.map((project) => (
                <Card key={project.id} className="p-3">
                  <p className="font-medium text-sm">{project.name}</p>
                  <p className="text-xs text-gray-600">{project.description}</p>
                </Card>
              ))}
            </div>
            <div className="text-right mt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}



      {activePerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={()=>setActivePerson(null)}>
          <div className="bg-white rounded shadow p-6 w-80" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm text-white font-medium">
                  {activePerson.name[0].toUpperCase()}
                </div>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{activePerson.name}</h3>
                <p className="text-xs text-gray-500">{activePerson.email}</p>
              </div>
            </div>
            {activePerson.company && (
              <p className="text-sm mb-2"><strong>Company:</strong> {activePerson.company}</p>
            )}
            {activePerson.role && (
              <p className="text-sm mb-2"><strong>Role:</strong> {activePerson.role}</p>
            )}
            {activePerson.notes && (
              <p className="text-sm mb-2"><strong>Notes:</strong> {activePerson.notes}</p>
            )}
            <div className="text-right mt-4">
              <Button variant="outline" onClick={()=>setActivePerson(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 