import { createClient } from '@/lib/supabase/server';

export interface AuditLog {
  id?: string;
  team_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, { old: any; new: any }>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(log: AuditLog) {
  try {
    const supabase = createClient();

    const { error } = await supabase.from('audit_logs').insert({
      ...log,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log audit event:', error);
      return null;
    }

    return true;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return null;
  }
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  teamId: string
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('team_id', teamId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: string, teamId: string, limit = 50) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return [];
  }
}

/**
 * Get all audit logs for a team
 */
export async function getTeamAuditLogs(teamId: string, limit = 100, offset = 0) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('team_id', teamId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching team audit logs:', error);
    return [];
  }
}

/**
 * Track changes between old and new values
 */
export function trackChanges(oldValues: Record<string, any>, newValues: Record<string, any>) {
  const changes: Record<string, { old: any; new: any }> = {};

  // Check for updated fields
  Object.keys(newValues).forEach((key) => {
    if (oldValues[key] !== newValues[key]) {
      changes[key] = {
        old: oldValues[key],
        new: newValues[key],
      };
    }
  });

  // Check for deleted fields
  Object.keys(oldValues).forEach((key) => {
    if (!(key in newValues)) {
      changes[key] = {
        old: oldValues[key],
        new: null,
      };
    }
  });

  return changes;
}

/**
 * Create audit log entry helper
 */
export async function createAuditLog(
  teamId: string,
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'VIEW',
  entityType: string,
  entityId: string,
  changes: Record<string, any> = {}
) {
  return logAuditEvent({
    team_id: teamId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    changes,
  });
}

/**
 * Audit event types
 */
export const AUDIT_ACTIONS = {
  // Basic CRUD
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',

  // Business actions
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  SEND: 'SEND', // e.g., send invoice
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE',

  // Access
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // Bulk operations
  BULK_DELETE: 'BULK_DELETE',
  BULK_UPDATE: 'BULK_UPDATE',
  BULK_EXPORT: 'BULK_EXPORT',
};

/**
 * Entity types for auditing
 */
export const AUDITABLE_ENTITIES = [
  'invoice',
  'payment',
  'time_entry',
  'expense',
  'project',
  'quote',
  'document',
  'user',
  'team',
  'team_member',
  'safety_log',
  'equipment',
  'subcontractor',
  'approval',
  'change_order',
];
