'use client';

import { useState, useEffect } from 'react';
import { AISuggestion, WorkspaceProject } from '@/lib/workspaceTypes';
import { generateAISuggestions, getTopSuggestions } from '@/lib/aiSuggestions';

interface AISuggestionsPanelProps {
  project: WorkspaceProject;
  onSuggestionAction?: (suggestion: AISuggestion) => void;
  maxSuggestions?: number;
  compact?: boolean;
}

export function AISuggestionsPanel({
  project,
  onSuggestionAction,
  maxSuggestions = 5,
  compact = false,
}: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generateSuggestions = async () => {
      setIsLoading(true);
      try {
        const allSuggestions = generateAISuggestions(project);
        const top = getTopSuggestions(allSuggestions, maxSuggestions);
        setSuggestions(top);
      } catch (error) {
        console.error('Error generating suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSuggestions();
  }, [project, maxSuggestions]);

  const filteredSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'create_task':
        return '✓';
      case 'generate_materials_list':
        return '📋';
      case 'follow_up':
        return '📞';
      case 'mark_complete':
        return '🎉';
      case 'add_note':
        return '📝';
      case 'export_quote':
        return '📤';
      default:
        return '💡';
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleAction = (suggestion: AISuggestion) => {
    if (onSuggestionAction) {
      onSuggestionAction(suggestion);
    }
    handleDismiss(suggestion.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredSuggestions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          {suggestions.length === 0 ? 'No suggestions at this time' : 'All suggestions dismissed'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>💡</span> AI Suggestions
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {filteredSuggestions.length} action{filteredSuggestions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredSuggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={`border rounded-lg p-4 flex items-start gap-3 ${getPriorityColor(
            suggestion.priority
          )}`}
        >
          <div className="text-xl flex-shrink-0">{getSuggestionIcon(suggestion.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-medium">{suggestion.title}</h4>
                <p className="text-sm mt-1 opacity-90">{suggestion.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${getPriorityBadgeColor(suggestion.priority)}`}>
                {suggestion.priority}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleAction(suggestion)}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
              >
                {suggestion.action?.label || 'Take Action'}
              </button>
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}

      {suggestions.length > filteredSuggestions.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setDismissedIds(new Set())}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Show {suggestions.length - filteredSuggestions.length} dismissed suggestion
            {suggestions.length - filteredSuggestions.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
