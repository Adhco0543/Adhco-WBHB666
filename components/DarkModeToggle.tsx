'use client';

import { useTheme } from '@/lib/theme/dark-mode';

export function DarkModeToggle() {
  const { theme, isDark, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={() => handleThemeChange('light')}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: theme === 'light' ? '2px solid #007bff' : '1px solid #ccc',
          backgroundColor: theme === 'light' ? '#e3f2fd' : 'transparent',
          cursor: 'pointer',
        }}
        title="Light mode"
      >
        ☀️
      </button>

      <button
        onClick={() => handleThemeChange('dark')}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: theme === 'dark' ? '2px solid #007bff' : '1px solid #ccc',
          backgroundColor: theme === 'dark' ? '#1e1e1e' : 'transparent',
          color: theme === 'dark' ? '#fff' : '#000',
          cursor: 'pointer',
        }}
        title="Dark mode"
      >
        🌙
      </button>

      <button
        onClick={() => handleThemeChange('system')}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: theme === 'system' ? '2px solid #007bff' : '1px solid #ccc',
          backgroundColor: theme === 'system' ? '#f5f5f5' : 'transparent',
          cursor: 'pointer',
        }}
        title="System theme"
      >
        💻
      </button>
    </div>
  );
}
