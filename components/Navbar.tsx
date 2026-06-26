'use client';

import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

/**
 * Enterprise Navigation Interface
 * Features hardware-accelerated translucent blur profiles, unified semantic token bindings,
 * and typographic alignments matched to modern premium design frameworks.
 */
export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md transition-colors duration-300 ease-in-out dark:bg-background/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Brand Identity / Wordmark */}
          <div className="flex items-center gap-2 select-none">
            <span className="font-heading text-base font-bold tracking-wider text-emerald transition-opacity hover:opacity-90">
              Nevora Ecovolt
            </span>
          </div>

          {/* Core Layout Controllers */}
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
          
        </div>
      </div>
    </nav>
  );
}