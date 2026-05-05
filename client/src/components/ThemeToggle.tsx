import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-3 border border-[var(--nothing-border-strong)] hover:border-[var(--nothing-green)] transition-colors text-[var(--nothing-text-dim)] hover:text-[var(--nothing-text)] bg-[var(--nothing-surface)] relative group"
      aria-label="Toggle Theme"
    >
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--nothing-green)] group-hover:scale-125 transition-transform"></div>
      {theme === 'light' ? <Moon size={14} className="animate-in fade-in zoom-in duration-300" /> : <Sun size={14} className="animate-in fade-in zoom-in duration-300" />}
    </button>
  );
};

export default ThemeToggle;
