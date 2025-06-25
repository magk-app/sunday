import React from 'react';
import type { Email, Task } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function EmailDetail({ email, onApprove, onReject, tasks }: { email: Email | null; onApprove: (id: string) => void; onReject: (id: string) => void; tasks: Task[] }) {
  if (!email) return <div className="text-gray-500">Select an email to view details.</div>;
  return (
    <Card className="max-w-2xl mx-auto bg-white rounded shadow p-6 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold mb-1">{email.subject}</h2>
          <div className="text-sm text-gray-600">From: <span className="font-semibold">{email.sender}</span></div>
          <div className="text-xs text-gray-400">To: {email.recipients.join(', ')}</div>
          <div className="text-xs text-gray-400">{new Date(email.date).toLocaleString()}</div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[email.status]}`}>{email.status}</span>
      </div>
      <div className="my-4 whitespace-pre-line text-gray-800 text-base border-t pt-4">{email.body}</div>
      <div className="flex gap-2 mt-4">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => onApprove(email.id)}
          disabled={email.status !== 'pending'}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => onReject(email.id)}
          disabled={email.status !== 'pending'}
        >
          Reject
        </Button>
      </div>
      <div className="mt-8 border-t pt-4">
        <h3 className="font-semibold mb-2 text-lg">Extracted Tasks (AI)</h3>
        {tasks.length === 0 ? (
          <div className="text-gray-400 text-sm">No tasks found.</div>
        ) : (
          <ul className="list-disc pl-5 text-sm">
            {tasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
} 