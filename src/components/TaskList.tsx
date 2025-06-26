import React from 'react';
import type { Task } from '../types';

const statusColors = {
  todo: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  in_progress: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  cancelled: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

export default function TaskList({ tasks, onComplete }: { tasks: Task[]; onComplete: (id: string) => void }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 p-4 mt-4 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
      <div className="font-bold mb-2 text-gray-900 dark:text-white">Tasks</div>
      {tasks.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500 text-sm">No tasks.</div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center">
              <span className="text-gray-900 dark:text-gray-100">{task.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[task.status]}`}>{task.status}</span>
              {task.status !== 'completed' && (
                <button
                  className="ml-2 bg-green-500 dark:bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
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