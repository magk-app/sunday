import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function Header() {
  return (
    <Card className="flex items-center justify-between px-6 py-4 mb-2 shadow-none border-b rounded-none bg-white">
      <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Sunday</h1>
      <div className="flex gap-2 items-center">
        <Input className="w-64" placeholder="Search (coming soon)" />
        {/* Future: <Button variant="outline">Settings</Button> <Avatar /> */}
      </div>
    </Card>
  );
} 