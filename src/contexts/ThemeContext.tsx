import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'orange' | 'sapphire' | 'violet' | 'rose' | 'amber';
export type ColorMode = 'light' | 'dark';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  colorHex: string;
  badge: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'orange',
    name: 'Bright Orange (Fintech)',
    colorHex: '#ff7a1a',
    badge: 'Vibrant SaaS',
    description: 'Bright orange & deep slate. Modern, energetic and high-contrast.'
  },
  {
    id: 'sapphire',
    name: 'Sapphire (Bluestone)',
    colorHex: '#2563eb',
    badge: 'Bluestone Classic',
    description: 'Deep royal blue & midnight navy. Professional corporate SaaS style.'
  },
  {
    id: 'violet',
    name: 'Violet Onyx',
    colorHex: '#7c3aed',
    badge: 'Modern Luxury',
    description: 'Electric violet & obsidian dark surfaces. Sleek tech-forward aesthetic.'
  },
  {
    id: 'rose',
    name: 'Sunset Crimson',
    colorHex: '#e11d48',
    badge: 'Warm Modern',
    description: 'Vibrant crimson rose & warm zinc slate. Distinctive and energetic.'
  },
  {
    id: 'amber',
    name: 'Amber Bronze',
    colorHex: '#d97706',
    badge: 'Executive Bronze',
    description: 'Rich amber bronze & warm stone tones. Premium editorial feel.'
  }
];

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeOptions: ThemeOption[];
  colorMode: ColorMode;
  isDark: boolean;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('omni_theme') as string | null;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved as ThemeId;
    }
    return 'orange';
  });

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const saved = localStorage.getItem('omni_color_mode') as ColorMode | null;
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('omni_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
    root.setAttribute('data-mode', colorMode);
    localStorage.setItem('omni_color_mode', colorMode);
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: setCurrentTheme,
        themeOptions: THEME_OPTIONS,
        colorMode,
        isDark: colorMode === 'dark',
        setColorMode,
        toggleColorMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
