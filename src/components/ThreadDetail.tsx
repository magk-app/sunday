import React, { useState, useEffect } from 'react';
import type { EmailThread, Email, DraftReply, Person, Project } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { openaiService } from '../lib/openai-service';
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
  onNotify: (message: string, type: 'success' | 'error') => void;
  onCreditsUsed: (amount: number) => void;
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
  onNotify,
  onCreditsUsed,
}: ThreadDetailProps) {
  const [isSending, setIsSending] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState<string>('');
  const [activePerson, setActivePerson] = useState<Person | null>(null);

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

  const generateSummary = async () => {
    if (!thread) return;
    setSummaryLoading(true);
    try {
      const result = await openaiService.summarizeThread(thread, messages);
      if (result.success && result.data) {
        setSummary(result.data);
        if (result.usage) {
          const creditsUsed = Math.ceil(result.usage.tokens / 100);
          onCreditsUsed(creditsUsed);
          onNotify(`OpenAI accessed ✔️ Tokens: ${result.usage.tokens}, Cost: $${result.usage.cost.toFixed(4)}`, 'success');
        }
      } else {
        onNotify(result.error || 'Failed to generate summary', 'error');
      }
    } catch (err) {
      console.error(err);
      onNotify('Failed to generate summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (isCollapsed && !summary && !summaryLoading) {
      generateSummary();
    }
  }, [isCollapsed]);

  const relatedPeople = people.filter((p) => thread.participants.includes(p.email));
  const relatedProjects = projects.filter((proj) => proj.participants.some(pid => relatedPeople.find(rp => rp.id === pid)));

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
                className="ml-auto"
              >
                {isCollapsed ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
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

        {/* AI Draft Reply */}
        {!isCollapsed && draft && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-blue-600">✨</span>
                  AI-Generated Reply
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-800">Draft</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">{draft.body}</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isSending || draft.status === 'sent'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSending ? (
                    <>
                      <span className="animate-pulse">Sending...</span>
                    </>
                  ) : draft.status === 'sent' ? (
                    'Sent ✓'
                  ) : (
                    'Approve & Send'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onReject(draft.id)}
                  disabled={isSending || draft.status === 'sent'}
                >
                  Reject & Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    setEditedBody(draft.body);
                  }}
                  disabled={isSending}
                >
                  Edit
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
              </div>
            </CardContent>
          </Card>
        )}

        {!isCollapsed && !draft && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="outline">
                  Edit
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

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded shadow p-6 w-[600px] max-h-[80vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Edit Reply</h3>
            <textarea
              className="w-full h-64 border p-2 rounded resize-none"
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
            />
            <div className="text-right mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={() => {
                if (draft) {
                  draft.body = editedBody;
                  setIsEditing(false);
                  onNotify('Draft updated', 'success');
                }
              }}>Save</Button>
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