"use client";
import React, { useState } from 'react';
import { mockEmails } from '../mock/emails';

interface Email {
  id: string;
  sender: string;
  recipients: string[];
  subject: string;
  snippet: string;
  body: string;
  date: string;
  importance: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function HomePage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedId, setSelectedId] = useState<string | null>(emails[0]?.id || null);
  const selectedEmail = emails.find((e) => e.id === selectedId);

  const handleApprove = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: 'approved' } : e));
  };
  const handleReject = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: 'rejected' } : e));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-700">SundayL</h1>
        <div className="flex gap-2">
          <input className="border rounded px-2 py-1" placeholder="Search (coming soon)" />
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r p-4 hidden md:block">
          <nav className="space-y-2">
            <div className="font-semibold text-gray-700">Folders</div>
            <ul className="space-y-1 mt-2">
              <li className="text-blue-600 font-medium">Inbox</li>
              <li>Important</li>
              <li>Approved</li>
              <li>Rejected</li>
            </ul>
          </nav>
        </aside>
        {/* Email List */}
        <section className="w-full md:w-1/3 border-r bg-white overflow-y-auto">
          <ul>
            {emails.map((email) => (
              <li
                key={email.id}
                className={`cursor-pointer px-4 py-3 border-b hover:bg-blue-50 ${selectedId === email.id ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedId(email.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{email.sender}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[email.status]}`}>{email.status}</span>
                </div>
                <div className="text-sm text-gray-700 truncate">{email.subject}</div>
                <div className="text-xs text-gray-500">{new Date(email.date).toLocaleString()}</div>
                <div className="text-xs text-gray-400">{email.snippet}</div>
              </li>
            ))}
          </ul>
        </section>
        {/* Email Detail */}
        <section className="flex-1 p-6 overflow-y-auto">
          {selectedEmail ? (
            <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-lg font-bold">{selectedEmail.subject}</div>
                  <div className="text-sm text-gray-600">From: {selectedEmail.sender}</div>
                  <div className="text-xs text-gray-400">To: {selectedEmail.recipients.join(', ')}</div>
                  <div className="text-xs text-gray-400">{new Date(selectedEmail.date).toLocaleString()}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${statusColors[selectedEmail.status]}`}>{selectedEmail.status}</span>
              </div>
              <div className="my-4 whitespace-pre-line text-gray-800">{selectedEmail.body}</div>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  onClick={() => handleApprove(selectedEmail.id)}
                  disabled={selectedEmail.status !== 'pending'}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={() => handleReject(selectedEmail.id)}
                  disabled={selectedEmail.status !== 'pending'}
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select an email to view details.</div>
          )}
        </section>
      </main>
    </div>
  );
} 