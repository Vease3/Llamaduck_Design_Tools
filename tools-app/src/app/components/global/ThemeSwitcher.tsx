'use client';

import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (
      localStorage.getItem('theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    ) as 'light' | 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme; // sets data-theme attr
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--system-color-elevation-base-hover)] transition-colors cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-[var(--system-color-elevation-base-content)]" strokeWidth={2} />
      ) : (
        <Moon size={18} className="text-[var(--system-color-elevation-base-content)]" strokeWidth={2} />
      )}
    </button>
  );
}
