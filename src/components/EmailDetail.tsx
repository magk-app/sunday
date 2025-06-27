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
  if (!email) return <div className="text-gray-500 dark:text-gray-400">Select an email to view details.</div>;

  return (
    <section className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800">
      <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6 mb-4 border dark:border-gray-600">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{email.subject}</h2>
        
        <div className="mb-4 text-gray-600 dark:text-gray-400 space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">From: <span className="font-semibold text-gray-900 dark:text-white">{email.sender}</span></div>
          <div className="text-xs text-gray-400 dark:text-gray-500">To: {email.recipients.join(', ')}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(email.date).toLocaleString()}</div>
        </div>

        <hr className="border-gray-200 dark:border-gray-600 mb-4" />
        <div className="my-4 whitespace-pre-line text-gray-800 dark:text-gray-200 text-base border-t dark:border-gray-600 pt-4">{email.body}</div>
        
        <div className="flex items-center gap-2 mt-6">
          <Button
            variant="default" 
            size="sm"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            Reply
          </Button>
          <Button variant="outline" size="sm">Forward</Button>
          <Button variant="outline" size="sm">Archive</Button>
        </div>
      </Card>

             {/* Related Tasks */}
       <Card className="max-w-2xl mx-auto p-4 dark:bg-gray-800 dark:border-gray-600">
         <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Related Tasks</h3>
         {tasks && tasks.length > 0 ? (
           <div className="space-y-2">
             {tasks.map((task: any, idx: number) => (
               <div key={idx} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600">
                 <span className="text-gray-900 dark:text-white">{task.title}</span>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-gray-400 dark:text-gray-500 text-sm">No tasks found.</div>
         )}
       </Card>
    </section>
  );
} 