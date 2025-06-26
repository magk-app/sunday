'use client';

import { useEffect } from 'react';

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize dark mode from localStorage or default to dark
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDark = savedDarkMode === null ? true : savedDarkMode === 'true'; // Default to dark mode
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save the default if not set
    if (savedDarkMode === null) {
      localStorage.setItem('darkMode', 'true');
    }
  }, []);

  return <>{children}</>;
} 