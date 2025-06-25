import React from 'react';
import type { Task } from '../types';

const statusColors = {
  todo: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-500',
};

export default function TaskList({ tasks, onComplete }: { tasks: Task[]; onComplete: (id: string) => void }) {
  return (
    <section className="bg-white rounded shadow p-4 mt-4 max-w-md mx-auto">
      <div className="font-bold mb-2">Tasks</div>
      {tasks.length === 0 ? (
        <div className="text-gray-400 text-sm">No tasks.</div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center">
              <span>{task.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[task.status]}`}>{task.status}</span>
              {task.status !== 'completed' && (
                <button
                  className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  onClick={() => onComplete(task.id)}
                >
                  Complete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
} 