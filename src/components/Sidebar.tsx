import React from 'react';

const folders = [
  { name: 'Inbox', key: 'inbox' },
  { name: 'Important', key: 'important' },
  { name: 'Approved', key: 'approved' },
  { name: 'Rejected', key: 'rejected' },
];

export default function Sidebar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return (
    <aside className="w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 h-full transition-colors">
      <nav className="space-y-2">
        <div className="font-semibold text-gray-700 dark:text-gray-300">Folders</div>
        <ul className="space-y-1 mt-2">
          {folders.map((f) => (
            <li
              key={f.key}
              className={`cursor-pointer px-2 py-1 rounded transition-colors ${
                selected === f.key 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
              onClick={() => onSelect(f.key)}
            >
              {f.name}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 