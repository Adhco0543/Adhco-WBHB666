'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get effective theme (considering system preference)
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to DOM
 */
export function applyTheme(theme: Theme): void {
  const effectiveTheme = getEffectiveTheme(theme);
  const htmlElement = document.documentElement;

  if (effectiveTheme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }

  // Also set in localStorage
  localStorage.setItem('theme-preference', theme);
}

/**
 * Get saved theme from localStorage
 */
export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme-preference') as Theme) || 'system';
}

/**
 * useTheme hook
 */
export function useTheme(): ThemeContextType {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize from localStorage
    const savedTheme = getSavedTheme();
    setThemeState(savedTheme);
    setIsDark(getEffectiveTheme(savedTheme) === 'dark');
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (savedTheme === 'system') {
        setIsDark(mediaQuery.matches);
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setIsDark(getEffectiveTheme(newTheme) === 'dark');
    applyTheme(newTheme);
  }, []);

  if (!mounted) {
    return {
      theme: 'system',
      isDark: false,
      setTheme: () => {},
    };
  }

  return { theme, isDark, setTheme };
}

/**
 * Save theme preference to database
 */
export async function saveThemePreference(userId: string, theme: Theme): Promise<void> {
  const { data: existingTheme } = await supabase
    .from('theme_preference')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingTheme) {
    await supabase
      .from('theme_preference')
      .update({ theme })
      .eq('user_id', userId);
  } else {
    await supabase
      .from('theme_preference')
      .insert({
        user_id: userId,
        theme,
      });
  }
}

/**
 * Get theme preference from database
 */
export async function getThemePreference(userId: string): Promise<Theme> {
  const { data, error } = await supabase
    .from('theme_preference')
    .select('theme')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return 'system';
  }

  return data.theme as Theme;
}
