import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  resetToLightMode: () => void;
  isLight: boolean;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Light Mode is the default theme for dashboards!
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('shms_dashboard_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // ignore localStorage errors
    }
    // Default is Light Mode for dashboards
    return 'light';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('shms_dashboard_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const resetToLightMode = () => {
    setThemeState('light');
    try {
      localStorage.setItem('shms_dashboard_theme', 'light');
    } catch {
      // ignore
    }
  };

  // Ensure documentElement and body NEVER have .theme-light
  // so that public website (outside .dashboard-scope) is 100% untouched
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        resetToLightMode,
        isLight: theme === 'light',
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
