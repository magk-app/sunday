'use client';
import React, { useState } from 'react';
import { mockThreads, getThreadMessages } from '../../mock/threads';
import ThreadDetail from '../../components/ThreadDetail';
import { Button } from '../../components/ui/button';

export default function TinderViewPage() {
  const [index, setIndex] = useState(0);
  const thread = mockThreads[index];
  const messages = thread ? getThreadMessages(thread.id) : [];

  const moveNext = () => setIndex((i) => Math.min(i + 1, mockThreads.length - 1));
  const movePrev = () => setIndex((i) => Math.max(i - 1, 0));

  if (!thread) return <div className="p-6">No threads.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Button onClick={movePrev} disabled={index === 0}>Previous</Button>
        <span>{index + 1} / {mockThreads.length}</span>
        <Button onClick={moveNext} disabled={index === mockThreads.length - 1}>Next</Button>
      </div>
      <ThreadDetail
        thread={thread}
        messages={messages}
        draft={null as any}
        people={[]}
        projects={[]}
        onApprove={() => {}}
        onReject={() => {}}
        onGenerateReply={() => Promise.resolve()}
        onNotify={() => {}}
        onCreditsUsed={() => {}}
        onSummaryGenerated={() => {}}
      />
    </div>
  );
} 