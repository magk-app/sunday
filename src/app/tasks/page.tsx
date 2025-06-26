'use client';
import React, { useEffect, useState } from 'react';
import { mockThreads } from '../../mock/threads';
import { Card } from '../../components/ui/card';
import type { EmailThread } from '../../types';

const LS_THREADS_KEY = 'threads';

function loadThreads(): EmailThread[] {
  if (typeof window === 'undefined') return mockThreads;
  try {
    const raw = localStorage.getItem(LS_THREADS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      return arr.map((t: any) => ({
        ...t,
        last_message_at: t.last_message_at ? new Date(t.last_message_at) : new Date(),
        created_at: t.created_at ? new Date(t.created_at) : new Date(),
        updated_at: t.updated_at ? new Date(t.updated_at) : new Date(),
      }));
    }
  } catch {}
  return mockThreads;
}

export default function TasksPage() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThreads(loadThreads());
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setThreads(loadThreads());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  const pendingThreads = threads.filter(t => t.status === 'active' || t.status === 'pending');
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks – Emails To Process</h1>
      <div className="space-y-2">
        {pendingThreads.length === 0 && <p className="text-gray-500">All caught up! 🎉</p>}
        {pendingThreads.map((t) => (
          <Card key={t.id} className="p-4">
            <h3 className="font-semibold">{t.subject}</h3>
            <p className="text-xs text-gray-500">{t.participants.length} participants • {t.message_count} messages</p>
            <p className="text-xs text-gray-400 mt-1">Status: {t.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
} 