'use client';
import React from 'react';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="nav-floating backdrop-blur-md bg-white/70 dark:bg-gray-800/70 fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-3 shadow-lg rounded-full transition-colors">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-extrabold text-blue-700 dark:text-blue-400">SUNDAY</Link>
        <Link href="/tasks" className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 dark:text-gray-300">Tasks</Link>
        <Link href="/tinder" className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 dark:text-gray-300">Tinder</Link>
        <Link href="/knowledge" className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 dark:text-gray-300">Knowledge</Link>
        <Link href="/settings" className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 dark:text-gray-300">Settings</Link>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">Alpha: V0.2.3</span>
    </nav>
  );
} 