'use client';

import { Check, X, Download, Trash2, Eye } from 'lucide-react';
import { useBulkActions, bulkExportToCSV, bulkDeleteItems } from '@/lib/hooks/useBulkActions';
import { useState } from 'react';

interface BulkActionsToolbarProps {
  items: Array<{ id: string; [key: string]: any }>;
  onDelete?: (ids: string[]) => void;
  onUpdate?: (ids: string[], updates: Record<string, any>) => void;
  onExport?: (items: any[]) => void;
  entityType: string;
  allowedActions?: ('delete' | 'export' | 'update' | 'view')[];
}

export function BulkActionsToolbar({
  items,
  onDelete,
  onUpdate,
  onExport,
  entityType,
  allowedActions = ['delete', 'export', 'view'],
}: BulkActionsToolbarProps) {
  const { selectedIds, count, clear } = useBulkActions();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (count === 0) return null;

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedIds);
      clear();
      setShowConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(selectedItems);
    } else {
      bulkExportToCSV(selectedItems, `${entityType}_export_${Date.now()}.csv`);
    }
    clear();
  };

  return (
    <>
      {/* Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg z-40">
        <div className="flex items-center gap-4">
          <Check className="text-blue-200" size={24} />
          <span className="font-semibold">{count} item{count !== 1 ? 's' : ''} selected</span>
        </div>

        <div className="flex items-center gap-3">
          {allowedActions.includes('view') && (
            <button
              onClick={() => {
                /* Handle view */
              }}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Eye size={16} />
              View
            </button>
          )}

          {allowedActions.includes('export') && (
            <button
              onClick={handleExport}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Download size={16} />
              Export
            </button>
          )}

          {allowedActions.includes('delete') && (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition"
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}

          <button
            onClick={clear}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete {count} item{count !== 1 ? 's' : ''}?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Checkbox component for items in lists/tables
 */
export function BulkActionCheckbox({ id, checked, onChange }: { id: string; checked: boolean; onChange: (id: string) => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onChange(id)}
      className="w-5 h-5 cursor-pointer accent-blue-600"
    />
  );
}

/**
 * Select all checkbox for tables
 */
export function BulkActionSelectAll({
  allIds,
  selectedIds,
  onChange,
}: {
  allIds: string[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const isAllSelected = selectedIds.length === allIds.length && allIds.length > 0;
  const isPartialSelected = selectedIds.length > 0 && selectedIds.length < allIds.length;

  return (
    <input
      type="checkbox"
      indeterminate={isPartialSelected}
      checked={isAllSelected}
      onChange={() => {
        if (isAllSelected) {
          onChange([]);
        } else {
          onChange(allIds);
        }
      }}
      className="w-5 h-5 cursor-pointer accent-blue-600"
    />
  );
}
