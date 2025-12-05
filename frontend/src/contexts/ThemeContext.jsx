import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Update CSS custom properties
    if (theme === 'dark') {
      root.style.setProperty('--background', '0 0% 3.9%');
      root.style.setProperty('--foreground', '0 0% 98%');
      root.style.setProperty('--card', '0 0% 3.9%');
      root.style.setProperty('--card-foreground', '0 0% 98%');
      root.style.setProperty('--popover', '0 0% 3.9%');
      root.style.setProperty('--popover-foreground', '0 0% 98%');
      root.style.setProperty('--primary', '0 0% 98%');
      root.style.setProperty('--primary-foreground', '0 0% 9%');
      root.style.setProperty('--secondary', '0 0% 14.9%');
      root.style.setProperty('--secondary-foreground', '0 0% 98%');
      root.style.setProperty('--muted', '0 0% 14.9%');
      root.style.setProperty('--muted-foreground', '0 0% 63.9%');
      root.style.setProperty('--accent', '0 0% 14.9%');
      root.style.setProperty('--accent-foreground', '0 0% 98%');
      root.style.setProperty('--destructive', '0 62.8% 30.6%');
      root.style.setProperty('--destructive-foreground', '0 0% 98%');
      root.style.setProperty('--border', '0 0% 14.9%');
      root.style.setProperty('--input', '0 0% 14.9%');
      root.style.setProperty('--ring', '0 0% 83.1%');
    } else {
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '0 0% 3.9%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '0 0% 3.9%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '0 0% 3.9%');
      root.style.setProperty('--primary', '0 0% 9%');
      root.style.setProperty('--primary-foreground', '0 0% 98%');
      root.style.setProperty('--secondary', '0 0% 96.1%');
      root.style.setProperty('--secondary-foreground', '0 0% 9%');
      root.style.setProperty('--muted', '0 0% 96.1%');
      root.style.setProperty('--muted-foreground', '0 0% 45.1%');
      root.style.setProperty('--accent', '0 0% 96.1%');
      root.style.setProperty('--accent-foreground', '0 0% 9%');
      root.style.setProperty('--destructive', '0 84.2% 60.2%');
      root.style.setProperty('--destructive-foreground', '0 0% 98%');
      root.style.setProperty('--border', '0 0% 89.8%');
      root.style.setProperty('--input', '0 0% 89.8%');
      root.style.setProperty('--ring', '0 0% 3.9%');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
