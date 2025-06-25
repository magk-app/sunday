import React from 'react';

export default function StatusBar({ status, credits }: { status: string; credits: number }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white px-6 py-2 flex justify-between items-center text-sm z-50">
      <span>Workflow: {status}</span>
      <span>API Credits: {credits}</span>
    </div>
  );
} 