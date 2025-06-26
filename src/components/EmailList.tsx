import React from 'react';
import type { Email } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function EmailList({ emails, selectedId, onSelect }: { emails: Email[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="w-full md:w-1/3 border-r dark:border-gray-600 bg-white dark:bg-gray-800 overflow-y-auto">
      <Card className="p-0 border-none shadow-none bg-transparent">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Emails</h2>
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onSelect(email.id)}
              className={`cursor-pointer px-4 py-3 border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 ${selectedId === email.id ? 'bg-blue-100 dark:bg-gray-600' : ''}`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{email.subject}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(email.date).toLocaleString()}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{email.snippet}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
} 