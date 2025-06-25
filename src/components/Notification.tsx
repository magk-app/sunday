import React from 'react';

export default function Notification({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  const color = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-white ${color}`}>
      <span>{message}</span>
      <button className="ml-4 text-white font-bold" onClick={onClose}>×</button>
    </div>
  );
} 