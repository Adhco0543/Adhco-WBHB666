'use client';

import { Eye, Calendar, User, AlertCircle } from 'lucide-react';
import { getEntityAuditLogs } from '@/lib/auditLogging';
import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  changes: Record<string, { old: any; new: any }>;
  timestamp: string;
  user?: { name?: string; email: string };
}

interface AuditLogViewerProps {
  entityType: string;
  entityId: string;
  teamId: string;
}

export function AuditLogViewer({ entityType, entityId, teamId }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await getEntityAuditLogs(entityType, entityId, teamId);
        setLogs(data);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [entityType, entityId, teamId]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'APPROVE':
        return 'bg-green-100 text-green-800';
      case 'REJECT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-gray-600 py-8 text-center">Loading audit history...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-gray-600 py-8 text-center flex justify-center gap-2">
        <AlertCircle size={20} />
        No changes recorded
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            className="w-full p-4 hover:bg-gray-50 transition text-left flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-gray-900 font-medium">{log.user?.name || log.user?.email || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(log.timestamp)}
                </span>
              </div>
            </div>
            <Eye size={16} className="text-gray-400" />
          </button>

          {expanded === log.id && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Changes:</h4>
              <div className="space-y-2">
                {Object.entries(log.changes).map(([field, change]) => (
                  <div key={field} className="text-sm">
                    <div className="font-medium text-gray-700">{field}</div>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-xs text-red-600 font-medium">Before:</div>
                        <div className="text-sm text-gray-900 break-all">{String(change.old) || 'empty'}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-green-600 font-medium">After:</div>
                        <div className="text-sm text-gray-900 break-all">{String(change.new) || 'empty'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Audit log modal
 */
export function AuditLogModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  teamId,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
  teamId: string;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen mx-4 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Change History - {title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <AuditLogViewer entityType={entityType} entityId={entityId} teamId={teamId} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
