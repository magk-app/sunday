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
  urgent: 'bg-red-600 dark:bg-red-500',
  high: 'bg-orange-500 dark:bg-orange-400',
  medium: 'bg-yellow-400 dark:bg-yellow-300',
  low: 'bg-gray-300 dark:bg-gray-500',
};

export default function ThreadList({ threads, selectedId, onSelect, onToggleImportant }: ThreadListProps) {
  const formatDate = (dateRaw: Date | string) => {
    try {
      const date = typeof dateRaw === 'string' ? new Date(dateRaw) : dateRaw;
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = diff / (1000 * 60 * 60);

      if (hours < 1) return 'Just now';
      if (hours < 24) return `${Math.floor(hours)}h ago`;
      if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <section className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Conversations</h2>
        <div className="space-y-2">
          {threads.map((thread) => (
            <Card
              key={thread.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-lg ${
                selectedId === thread.id 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                  : 'hover:bg-white dark:hover:bg-gray-700'
              } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600`}
              onClick={() => onSelect(thread.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2">
                  {thread.subject}
                </h3>
                <span className="text-xs text-gray-300 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(thread.last_message_at || new Date())}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {thread.participants.slice(0, 3).map((email, idx) => (
                    <Avatar key={idx} className="w-6 h-6 border-2 border-white dark:border-gray-700">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center text-xs text-white font-medium">
                        {email[0].toUpperCase()}
                      </div>
                    </Avatar>
                  ))}
                  {thread.participants.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                      +{thread.participants.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-200 dark:text-gray-300 flex items-center gap-2">
                  {thread.message_count} msgs
                  {thread.importance && (
                    <span className={`inline-block w-2 h-2 rounded-full ${importanceColors[thread.importance]}`}></span>
                  )}
                </span>
              </div>

              <div className="flex gap-1 items-center">
                {thread.has_draft && (
                  <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">Draft</Badge>
                )}
                {thread.summary && (
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700">AI</Badge>
                )}
                {thread.status === 'approved' && <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Approved</Badge>}
                {thread.status === 'rejected' && <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Rejected</Badge>}
                {thread.status !== 'approved' && thread.status !== 'rejected' && thread.status !== 'pending' && (
                  <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{thread.status}</Badge>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleImportant(thread.id);
                  }}
                  className="ml-1 transition-colors hover:text-yellow-500 dark:hover:text-yellow-400"
                  aria-label="Toggle star"
                >
                  <FontAwesomeIcon icon={thread.important ? solidStar : regularStar} className={thread.important ? 'text-yellow-400 dark:text-yellow-300' : 'text-gray-400 dark:text-gray-500'} />
                </button>
              </div>
            </Card>
          ))}
          {threads.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No conversations found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 