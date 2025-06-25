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
    <section className="w-full md:w-1/3 border-r bg-white overflow-y-auto">
      <Card className="p-0 border-none shadow-none bg-transparent">
        <h2 className="text-lg font-bold px-4 pt-4 pb-2">Inbox</h2>
        <ul>
          {emails.slice(0, 10).map((email) => (
            <li
              key={email.id}
              className={`cursor-pointer px-4 py-3 border-b hover:bg-blue-50 ${selectedId === email.id ? 'bg-blue-100' : ''}`}
              onClick={() => onSelect(email.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-base">{email.sender}</span>
                <Badge className={statusColors[email.status]}>{email.status}</Badge>
              </div>
              <div className="text-sm font-medium text-gray-900 truncate">{email.subject}</div>
              <div className="text-xs text-gray-500">{new Date(email.date).toLocaleString()}</div>
              <div className="text-xs text-gray-400">{email.snippet}</div>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
} 