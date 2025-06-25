import React from 'react';
import type { EmailThread } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

interface ThreadListProps {
  threads: EmailThread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

const importanceColors = {
  urgent: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
  low: 'bg-gray-300',
};

export default function ThreadList({ threads, selectedId, onSelect, onToggleImportant }: ThreadListProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <section className="w-full md:w-96 border-r bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Conversations</h2>
        <div className="space-y-2">
          {threads.map((thread) => (
            <Card
              key={thread.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedId === thread.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-white'
              }`}
              onClick={() => onSelect(thread.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                  {thread.subject}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(thread.last_message_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {thread.participants.slice(0, 3).map((email, idx) => (
                    <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs text-white font-medium">
                        {email[0].toUpperCase()}
                      </div>
                    </Avatar>
                  ))}
                  {thread.participants.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                      +{thread.participants.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 flex items-center gap-2">
                  {thread.message_count} msgs
                  {thread.importance && (
                    <span className={`inline-block w-2 h-2 rounded-full ${importanceColors[thread.importance]}`}></span>
                  )}
                </span>
              </div>

              <div className="flex gap-1 items-center">
                {thread.has_draft && (
                  <Badge className="bg-amber-100 text-amber-800">Draft</Badge>
                )}
                {thread.summary && (
                  <Badge variant="outline" className="text-xs">AI</Badge>
                )}
                {thread.status === 'approved' && <Badge className="bg-green-100 text-green-800">Approved</Badge>}
                {thread.status === 'rejected' && <Badge className="bg-red-100 text-red-800">Rejected</Badge>}
                {thread.status !== 'approved' && thread.status !== 'rejected' && thread.status !== 'pending' && (
                  <Badge>{thread.status}</Badge>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleImportant(thread.id);
                  }}
                  className="ml-1"
                  aria-label="Toggle star"
                >
                  <FontAwesomeIcon icon={thread.important ? solidStar : regularStar} className={thread.important ? 'text-yellow-400' : 'text-gray-400'} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 