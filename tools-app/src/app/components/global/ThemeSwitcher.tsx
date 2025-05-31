'use client';

import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only read from localStorage after the component mounts
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else {
      // Check system preference if no saved theme
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemPreference);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.dataset.theme = theme; // sets data-theme attr
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
  };

  // Prevent rendering the theme-dependent content until after hydration
  if (!mounted) {
    return (
      <button 
        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--system-color-elevation-base-hover)] transition-colors cursor-pointer"
      >
        <div className="w-[18px] h-[18px]" /> {/* Placeholder to maintain layout */}
      </button>
    );
  }

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
