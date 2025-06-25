import React, { useState } from 'react';
import type { EmailThread, Email, DraftReply, Person, Project } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';

interface ThreadDetailProps {
  thread: EmailThread | null;
  messages: Email[];
  draft: DraftReply | null;
  people: Person[];
  projects: Project[];
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
  onGenerateReply: () => void;
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
}: ThreadDetailProps) {
  const [isSending, setIsSending] = useState(false);

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
            </div>
          </CardHeader>
        </Card>

        {/* Message Timeline */}
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

        {/* AI Draft Reply */}
        {draft && (
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
                  onClick={onGenerateReply}
                  disabled={isSending}
                >
                  Generate New Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!draft && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Button onClick={onGenerateReply} size="lg">
                Generate AI Reply
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Knowledge Sidebar */}
      <aside className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Knowledge Base</h3>
        
        {/* People */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-gray-700">People</h4>
          <div className="space-y-2">
            {people.map((person) => (
              <Card key={person.id} className="p-3">
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
            {projects.map((project) => (
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
    </div>
  );
} 