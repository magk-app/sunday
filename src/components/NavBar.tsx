import React from 'react';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="backdrop-blur-md bg-white/30 fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-3 shadow-md">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-extrabold text-blue-700">SundayL</Link>
        <Link href="/tasks" className="text-sm font-medium hover:text-blue-700">Tasks</Link>
        <Link href="/tinder" className="text-sm font-medium hover:text-blue-700">Tinder</Link>
        <Link href="/settings" className="text-sm font-medium hover:text-blue-700">Settings</Link>
        <Link href="/knowledge" className="text-sm font-medium hover:text-blue-700">Knowledge</Link>
      </div>
      <div className="text-sm text-gray-600">Alpha</div>
    </nav>
  );
} 