import React from 'react';

const folders = [
  { name: 'Inbox', key: 'inbox' },
  { name: 'Important', key: 'important' },
  { name: 'Approved', key: 'approved' },
  { name: 'Rejected', key: 'rejected' },
];

export default function Sidebar({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return (
    <aside className="w-48 bg-white border-r p-4 h-full">
      <nav className="space-y-2">
        <div className="font-semibold text-gray-700">Folders</div>
        <ul className="space-y-1 mt-2">
          {folders.map((f) => (
            <li
              key={f.key}
              className={`cursor-pointer px-2 py-1 rounded ${selected === f.key ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100'}`}
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