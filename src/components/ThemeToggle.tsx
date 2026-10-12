import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // fallback
  }
  return 'light';
}

export function applyTheme(theme: Theme) {
  try {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  } catch {
    // ignore
  }
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to system preference changes if user hasn't explicitly set a preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Beralih ke mode terang (Light Mode)' : 'Beralih ke mode gelap (Dark Mode)'}
      title={isDark ? 'Mode Terang (Siang)' : 'Mode Gelap (Malam)'}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-500 ${
        isDark
          ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 shadow-2xs'
          : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200 shadow-2xs'
      } ${className}`}
    >
      <span className="relative flex items-center justify-center w-4 h-4">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-300 animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-slate-600 animate-in zoom-in-75 duration-200" />
        )}
      </span>

      {showLabel && (
        <span className="text-[11px] font-medium leading-none">
          {isDark ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      )}
    </button>
  );
};
