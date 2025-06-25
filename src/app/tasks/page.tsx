import React from 'react';
import { mockThreads } from '../../mock/threads';
import { Card } from '../../components/ui/card';

export default function TasksPage() {
  const pendingThreads = mockThreads.filter(t => t.status === 'active');
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks – Emails To Process</h1>
      <div className="space-y-2">
        {pendingThreads.length === 0 && <p className="text-gray-500">All caught up! 🎉</p>}
        {pendingThreads.map((t) => (
          <Card key={t.id} className="p-4">
            <h3 className="font-semibold">{t.subject}</h3>
            <p className="text-xs text-gray-500">{t.participants.length} participants • {t.message_count} messages</p>
          </Card>
        ))}
      </div>
    </div>
  );
} 