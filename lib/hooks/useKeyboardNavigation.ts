import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

/**
 * Hook for keyboard shortcuts
 * Usage: useKeyboardShortcut({ key: 'k', ctrl: true, action: handleSearch })
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrl, shift, alt, meta, action } = shortcut;
      
      const isKeyMatch = e.key.toLowerCase() === key.toLowerCase();
      const isCtrlMatch = ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const isShiftMatch = shift ? e.shiftKey : !e.shiftKey;
      const isAltMatch = alt ? e.altKey : !e.altKey;
      const isMetaMatch = meta ? e.metaKey : true;

      if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);
}

/**
 * Hook for managing multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const { key, ctrl, shift, alt, meta, action } = shortcut;
        
        const isKeyMatch = e.key.toLowerCase() === key.toLowerCase();
        const isCtrlMatch = ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const isShiftMatch = shift ? e.shiftKey : !e.shiftKey;
        const isAltMatch = alt ? e.altKey : !e.altKey;
        const isMetaMatch = meta ? e.metaKey : true;

        if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch) {
          e.preventDefault();
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook for arrow key navigation
 */
export function useArrowKeyNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  currentIndex: number = 0
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newIndex = currentIndex;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % itemCount;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = (currentIndex - 1 + itemCount) % itemCount;
      }

      if (newIndex !== currentIndex) {
        onSelect(newIndex);
      }
    },
    [currentIndex, itemCount, onSelect]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook for Enter/Escape key handling
 */
export function useEnterEscapeKeys(
  onEnter?: () => void,
  onEscape?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && onEnter) {
        onEnter();
      } else if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape]);
}

// Common app shortcuts
export const APP_SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, description: 'Open search' },
  NEW_INVOICE: { key: 'i', ctrl: true, description: 'Create new invoice' },
  NEW_PROJECT: { key: 'p', ctrl: true, description: 'Create new project' },
  NEW_EXPENSE: { key: 'e', ctrl: true, description: 'Log expense' },
  LOG_TIME: { key: 't', ctrl: true, description: 'Log time entry' },
  SAVE: { key: 's', ctrl: true, description: 'Save current form' },
  CLOSE_MODAL: { key: 'Escape', description: 'Close modal/dialog' },
  HELP: { key: '?', description: 'Show help' },
};

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const keys: string[] = [];
  
  if (shortcut.ctrl) keys.push('Ctrl');
  if (shortcut.shift) keys.push('Shift');
  if (shortcut.alt) keys.push('Alt');
  if (shortcut.meta) keys.push('Cmd');
  
  keys.push(shortcut.key.toUpperCase());
  
  return keys.join('+');
}
