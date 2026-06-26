'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Enterprise Standard: Strict binary themes eliminate edge-case UI bugs 
// caused by conflicting OS-level settings.
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to 'dark' to establish the Nevora Ecovolt brand identity immediately
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // 1. Mount & Initialize from Storage
  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme);
    } else {
      // Graceful fallback: Check OS preference once, but heavily bias toward dark mode
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setThemeState(prefersLight ? 'light' : 'dark');
    }
  }, []);

  // 2. Apply Theme to DOM (Triggers the Tailwind .dark class)
  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme, isMounted]);

  // 3. Persist User Preference
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Prevent rendering children until mounted to avoid hydration flash
  // Render a hidden div or just the children (layout.tsx handles the visual suppression)
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to consume the Theme context.
 * Throws a safe error if used outside of the ThemeProvider wrapper.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}