'use client';

import { Save, Trash2, Copy, Star } from 'lucide-react';
import { SavedView, saveView, updateView, deleteView, duplicateView, setDefaultView } from '@/lib/savedViews';
import { useState } from 'react';

interface SavedViewsPanelProps {
  views: SavedView[];
  currentView?: SavedView;
  onSelectView: (view: SavedView) => void;
  teamId: string;
  entityType: string;
  onRefresh?: () => void;
}

export function SavedViewsPanel({
  views,
  currentView,
  onSelectView,
  teamId,
  entityType,
  onRefresh,
}: SavedViewsPanelProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [viewName, setViewName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSaveNewView = async () => {
    if (!viewName) return;

    try {
      await saveView({
        team_id: teamId,
        user_id: '', // Will be set by backend
        name: viewName,
        entity_type: entityType,
        filters: currentView?.filters || [],
        sort: currentView?.sort,
        columns: currentView?.columns,
      });
      setViewName('');
      setShowSaveForm(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error saving view:', error);
    }
  };

  const handleDelete = async (viewId: string) => {
    setIsDeleting(viewId);
    try {
      await deleteView(viewId);
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting view:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDuplicate = async (view: SavedView) => {
    try {
      await duplicateView(view.id, `${view.name} (Copy)`);
      onRefresh?.();
    } catch (error) {
      console.error('Error duplicating view:', error);
    }
  };

  const handleSetDefault = async (viewId: string) => {
    try {
      await setDefaultView(teamId, entityType, viewId);
      onRefresh?.();
    } catch (error) {
      console.error('Error setting default view:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Saved Views</h3>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          <Save size={16} className="inline mr-1" />
          Save View
        </button>
      </div>

      {showSaveForm && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="View name (e.g., 'Overdue Invoices')"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveNewView}
              disabled={!viewName}
              className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveForm(false);
                setViewName('');
              }}
              className="flex-1 px-3 py-1 bg-gray-200 text-gray-900 text-sm rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {views.length === 0 ? (
          <p className="text-gray-600 text-sm py-4 text-center">No saved views yet</p>
        ) : (
          views.map((view) => (
            <div
              key={view.id}
              className={`p-3 rounded border cursor-pointer transition ${
                currentView?.id === view.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div
                  onClick={() => onSelectView(view)}
                  className="flex-1"
                >
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {view.name}
                    {view.is_default && (
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {view.filters?.length || 0} filter{(view.filters?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleSetDefault(view.id)}
                    title="Set as default"
                    className="p-1 text-gray-400 hover:text-yellow-500 transition"
                  >
                    <Star size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(view)}
                    title="Duplicate"
                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(view.id)}
                    disabled={isDeleting === view.id}
                    title="Delete"
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Filter builder component
 */
export function FilterBuilder({
  filters,
  onChange,
  entityType,
}: {
  filters: any[];
  onChange: (filters: any[]) => void;
  entityType: string;
}) {
  const commonFields: Record<string, string[]> = {
    invoice: ['status', 'amount', 'due_date', 'client_id', 'project_id'],
    expense: ['category', 'amount', 'billable', 'date', 'project_id'],
    time_entry: ['project_id', 'billable', 'date', 'user_id', 'hours'],
    project: ['status', 'budget', 'start_date', 'end_date', 'client_id'],
  };

  const operators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains', 'startsWith'];
  const fields = commonFields[entityType] || [];

  const addFilter = () => {
    onChange([...filters, { field: fields[0] || '', operator: 'eq', value: '' }]);
  };

  const updateFilter = (index: number, updates: Partial<any>) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-gray-900">Filters</h4>

      {filters.map((filter, index) => (
        <div key={index} className="flex gap-2 items-end">
          <select
            value={filter.field}
            onChange={(e) => updateFilter(index, { field: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>

          <select
            value={filter.operator}
            onChange={(e) => updateFilter(index, { operator: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {operators.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            placeholder="Value"
            className="px-3 py-2 border border-gray-300 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => removeFilter(index)}
            className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        onClick={addFilter}
        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded hover:border-gray-400 transition text-sm"
      >
        + Add Filter
      </button>
    </div>
  );
}
