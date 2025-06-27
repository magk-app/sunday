'use client';
import React, { useEffect, useState } from 'react';
import { mockThreads } from '../../mock/threads';
import { Card } from '../../components/ui/card';
import type { EmailThread } from '../../types';
import { getThreads } from '../../lib/entity-storage';

const LS_THREADS_KEY = 'threads';

export default function TasksPage() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load threads from localStorage after mount
  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const loadedThreads = await getThreads();
        setThreads(loadedThreads);
      } catch {
        setThreads([]);
      }
    }
    loadData();
  }, []);

  // Listen for storage changes from main app
  useEffect(() => {
    const handleStorageChange = async () => {
      try {
        const loadedThreads = await getThreads();
        setThreads(loadedThreads);
      } catch {
        setThreads([]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!mounted) {
    return <div className="p-6">Loading...</div>;
  }

  const pendingThreads = threads.filter(t => t.status === 'active' || t.status === 'pending');
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks – Emails To Process</h1>
      <div className="space-y-2">
        {pendingThreads.length === 0 && <p className="text-gray-500 dark:text-gray-400">All caught up! 🎉</p>}
        {pendingThreads.map((t) => (
          <Card key={t.id} className="p-4">
            <h3 className="font-semibold">{t.subject}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.participants.length} participants • {t.message_count} messages</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Status: {t.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
} 