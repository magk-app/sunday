import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function Header() {
  return (
    <Card className="flex items-center justify-between px-6 py-4 mb-2 shadow-none border-b rounded-none bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Assistant</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Workspace: Production</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
        </div>
      </div>
    </Card>
  );
} 