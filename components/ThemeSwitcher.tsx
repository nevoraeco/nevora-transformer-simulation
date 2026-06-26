'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../app/providers';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Enterprise Theme Toggle
 * Features tactile micro-animations, strict binary state management,
 * and WCAG-compliant focus states mapped to the Nevora brand palette.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by rendering a placeholder of the exact same dimensions
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        // Base dimensions and layout
        "group relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent",
        "transition-all duration-300 ease-in-out",
        
        // Light Mode styling
        "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        
        // Dark Mode styling (Obsidian/Emerald mapping)
        "dark:text-gray-400 dark:hover:border-border dark:hover:bg-card dark:hover:text-emerald",
        
        // Enterprise Accessibility (Keyboard focus only)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
      )}
    >
      {isDark ? (
        <Sun 
          size={18} 
          strokeWidth={2} 
          className="transition-transform duration-300 group-hover:rotate-45" 
        />
      ) : (
        <Moon 
          size={18} 
          strokeWidth={2} 
          className="transition-transform duration-300 group-hover:-rotate-12" 
        />
      )}
    </button>
  );
}