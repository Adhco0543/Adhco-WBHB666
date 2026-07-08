import { create } from 'zustand';
import { useCallback } from 'react';

interface BulkActionState {
  selectedIds: Set<string>;
  isSelectAll: boolean;
  actions: {
    toggle: (id: string) => void;
    toggleAll: (ids: string[]) => void;
    clear: () => void;
    isSelected: (id: string) => boolean;
  };
}

export const useBulkActionStore = create<BulkActionState>((set, get) => ({
  selectedIds: new Set<string>(),
  isSelectAll: false,

  actions: {
    toggle: (id: string) => {
      set((state) => {
        const newSelectedIds = new Set(state.selectedIds);
        if (newSelectedIds.has(id)) {
          newSelectedIds.delete(id);
        } else {
          newSelectedIds.add(id);
        }
        return { selectedIds: newSelectedIds, isSelectAll: false };
      });
    },

    toggleAll: (ids: string[]) => {
      set((state) => {
        const newSelectedIds = new Set(state.selectedIds);
        const shouldSelectAll = newSelectedIds.size !== ids.length;

        if (shouldSelectAll) {
          ids.forEach((id) => newSelectedIds.add(id));
        } else {
          newSelectedIds.clear();
        }

        return {
          selectedIds: newSelectedIds,
          isSelectAll: shouldSelectAll,
        };
      });
    },

    clear: () => {
      set({ selectedIds: new Set(), isSelectAll: false });
    },

    isSelected: (id: string) => {
      return get().selectedIds.has(id);
    },
  },
}));

export function useBulkActions() {
  const { selectedIds, actions } = useBulkActionStore();

  return {
    selectedIds: Array.from(selectedIds),
    count: selectedIds.size,
    ...actions,
  };
}

/**
 * Bulk action operations
 */
export async function bulkDeleteItems(
  ids: string[],
  endpoint: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Bulk update items with same values
 */
export async function bulkUpdateItems(
  ids: string[],
  updates: Record<string, any>,
  endpoint: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Bulk export items to CSV
 */
export function bulkExportToCSV(
  items: Array<Record<string, any>>,
  filename: string,
  columns?: string[]
) {
  if (items.length === 0) return;

  // Determine columns
  const cols = columns || Object.keys(items[0]);
  
  // Create CSV header
  const header = cols.join(',');
  
  // Create CSV rows
  const rows = items.map((item) =>
    cols
      .map((col) => {
        const value = item[col];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      })
      .join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Bulk import from CSV
 */
export function bulkImportFromCSV(
  file: File,
  onData: (rows: Array<Record<string, string>>) => void,
  onError: (error: Error) => void
) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        onError(new Error('CSV file is empty'));
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim());
      const rows: Array<Record<string, string>> = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        rows.push(row);
      }

      onData(rows);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to parse CSV'));
    }
  };

  reader.onerror = () => {
    onError(new Error('Failed to read file'));
  };

  reader.readAsText(file);
}

/**
 * Hook for bulk operations on a list
 */
export function useBulkOperations<T extends { id: string }>(
  items: T[],
  onUpdate?: (updated: T[]) => void
) {
  const { selectedIds, count, toggle, toggleAll, clear } = useBulkActions();

  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  const deleteSelected = useCallback(async () => {
    const selected = getSelectedItems();
    // Implementation depends on API
    clear();
    return selected;
  }, [getSelectedItems, clear]);

  const exportSelected = useCallback(() => {
    const selected = getSelectedItems();
    bulkExportToCSV(selected, `export_${Date.now()}.csv`);
  }, [getSelectedItems]);

  return {
    selectedIds,
    count,
    toggle,
    toggleAll,
    clear,
    getSelectedItems,
    deleteSelected,
    exportSelected,
  };
}
