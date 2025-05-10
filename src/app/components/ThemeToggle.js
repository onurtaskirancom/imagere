'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Only run on client
  useEffect(() => {
    setMounted(true);
    // Initialize theme based on localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      // Use saved theme if it exists
      setTheme(savedTheme);
    } else {
      // Default to dark mode
      const initialTheme = 'dark';
      setTheme(initialTheme);
      localStorage.setItem('theme', initialTheme);
    }
    
    // Apply initial theme
    applyTheme(savedTheme || 'dark');
  }, []);

  // Apply theme changes
  function applyTheme(newTheme) {
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    if (isToggling) return;
    
    setIsToggling(true);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Prevent double-click
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  }

  // Don't render anything on server
  if (!mounted) return null;

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      title={`Current theme: ${theme}. Click to toggle.`}
    >
      {theme === 'light' ? '☀️' : '🌙'}
    </button>
  );
} 