'use client';

import { useState, useEffect } from 'react';
import { ConversationSummary, WorkspaceProject } from '@/lib/workspaceTypes';
import { generateConversationSummary, formatSummaryForDisplay } from '@/lib/conversationSummary';

interface ConversationSummaryPanelProps {
  project: WorkspaceProject;
  isCompact?: boolean;
}

export function ConversationSummaryPanel({
  project,
  isCompact = false,
}: ConversationSummaryPanelProps) {
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    keyTopics: true,
    decisions: true,
    actionItems: true,
  });

  useEffect(() => {
    const generateSummary = async () => {
      setIsLoading(true);
      try {
        const generated = generateConversationSummary(project);
        setSummary(generated);
      } catch (error) {
        console.error('Error generating summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [project]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!summary || (!summary.keyTopics.length && !summary.decisions.length && !summary.actionItems.length)) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          Start chatting to generate conversation insights
        </p>
      </div>
    );
  }

  const displayMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => (
      <p key={idx} className="text-sm text-gray-700 mb-2">
        {line}
      </p>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3">
        <h3 className="font-semibold text-gray-900">Conversation Summary</h3>
        <p className="text-xs text-gray-500 mt-1">
          {summary.totalMessages} messages • {summary.participants.length} participants
        </p>
      </div>

      {/* Key Topics */}
      {summary.keyTopics.length > 0 && (
        <div className="border-l-4 border-blue-500 pl-4">
          <button
            onClick={() => toggleSection('keyTopics')}
            className="flex items-center gap-2 w-full text-left"
          >
            <span className={`transition-transform ${expandedSections.keyTopics ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <h4 className="font-medium text-gray-900">Key Topics ({summary.keyTopics.length})</h4>
          </button>
          {expandedSections.keyTopics && (
            <div className="mt-3 space-y-2 ml-6">
              {summary.keyTopics.map((topic, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm text-gray-700">{topic}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Decisions */}
      {summary.decisions.length > 0 && (
        <div className="border-l-4 border-green-500 pl-4">
          <button
            onClick={() => toggleSection('decisions')}
            className="flex items-center gap-2 w-full text-left"
          >
            <span className={`transition-transform ${expandedSections.decisions ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <h4 className="font-medium text-gray-900">Decisions ({summary.decisions.length})</h4>
          </button>
          {expandedSections.decisions && (
            <div className="mt-3 space-y-2 ml-6">
              {summary.decisions.map((decision, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm text-gray-700">{decision}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Items */}
      {summary.actionItems.length > 0 && (
        <div className="border-l-4 border-orange-500 pl-4">
          <button
            onClick={() => toggleSection('actionItems')}
            className="flex items-center gap-2 w-full text-left"
          >
            <span className={`transition-transform ${expandedSections.actionItems ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <h4 className="font-medium text-gray-900">Action Items ({summary.actionItems.length})</h4>
          </button>
          {expandedSections.actionItems && (
            <div className="mt-3 space-y-2 ml-6">
              {summary.actionItems.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 rounded"
                    readOnly
                  />
                  <span className="text-sm text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {summary.timeline.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
          <div className="space-y-2 ml-2">
            {summary.timeline.slice(0, 3).map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 text-xs mt-1">
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="text-gray-600">{event.event}</span>
              </div>
            ))}
            {summary.timeline.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                +{summary.timeline.length - 3} more events
              </p>
            )}
          </div>
        </div>
      )}

      {/* Participants */}
      {summary.participants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Participants ({summary.participants.length})</h4>
          <div className="flex flex-wrap gap-2">
            {summary.participants.map((participant, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                {participant}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
