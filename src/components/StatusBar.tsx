import React from 'react';

export default function StatusBar({ status, credits, totalUsed }: { status: string; credits: number; totalUsed?: number }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white px-6 py-2 flex justify-between items-center text-sm z-50">
      <span>Workflow: {status}</span>
      <div className="flex gap-4">
        <span>Credits: {credits}</span>
        {totalUsed !== undefined && <span>Used: {totalUsed}</span>}
      </div>
    </div>
  );
} 