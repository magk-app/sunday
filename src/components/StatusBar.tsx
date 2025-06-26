import React from 'react';

export default function StatusBar({ status, credits, totalUsed, cost }: { status: string; credits: number; totalUsed?: number; cost?: number }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 px-6 py-2 flex justify-between items-center text-sm z-50 border-t border-gray-700 dark:border-gray-600">
      <span>Workflow: {status}</span>
      <div className="flex gap-4">
        <span>Tokens used: {totalUsed ?? credits}</span>
        {cost !== undefined && <span>Cost: ${cost.toFixed(4)}</span>}
      </div>
    </div>
  );
} 