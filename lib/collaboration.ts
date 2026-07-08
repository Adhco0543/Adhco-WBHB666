import { createClient } from '@/lib/supabase/server';

export interface Comment {
  id?: string;
  team_id: string;
  user_id: string;
  entity_type: string; // 'invoice', 'project', etc.
  entity_id: string;
  content: string;
  mentions?: string[]; // user IDs
  created_at?: string;
  updated_at?: string;
}

export interface ActivityFeedItem {
  id?: string;
  team_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_title?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface Mention {
  id?: string;
  team_id: string;
  mentioned_user_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at?: string;
}

/**
 * Add a comment to an entity
 */
export async function addComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Handle mentions
    if (comment.mentions && comment.mentions.length > 0) {
      await createMentions(
        comment.team_id,
        comment.user_id,
        comment.mentions,
        comment.entity_type,
        comment.entity_id
      );
    }

    // Log activity
    await logActivity({
      team_id: comment.team_id,
      user_id: comment.user_id,
      action: 'COMMENTED',
      entity_type: comment.entity_type,
      entity_id: comment.entity_id,
      description: `Added comment: "${comment.content.substring(0, 50)}..."`,
    });

    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get comments for an entity
 */
export async function getEntityComments(entityType: string, entityId: string, teamId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:users(id, name, email, avatar_url)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Create mentions from user IDs
 */
async function createMentions(
  teamId: string,
  userId: string,
  mentionedUserIds: string[],
  entityType: string,
  entityId: string
) {
  try {
    const supabase = createClient();

    const mentions = mentionedUserIds
      .filter(id => id !== userId) // Don't mention self
      .map(mentionedUserId => ({
        team_id: teamId,
        mentioned_user_id: mentionedUserId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        is_read: false,
        created_at: new Date().toISOString(),
      }));

    if (mentions.length > 0) {
      const { error } = await supabase.from('mentions').insert(mentions);
      if (error) console.error('Error creating mentions:', error);
    }
  } catch (error) {
    console.error('Error handling mentions:', error);
  }
}

/**
 * Get user mentions
 */
export async function getUserMentions(userId: string, teamId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('mentions')
      .select(
        `
        *,
        mentioned_by:users!user_id(id, name, email, avatar_url),
        comment:comments(content)
      `
      )
      .eq('mentioned_user_id', userId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return [];
  }
}

/**
 * Mark mention as read
 */
export async function readMention(mentionId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('mentions')
      .update({ is_read: true })
      .eq('id', mentionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking mention as read:', error);
    throw error;
  }
}

/**
 * Log activity
 */
export async function logActivity(activity: Omit<ActivityFeedItem, 'id' | 'created_at'>) {
  try {
    const supabase = createClient();

    const { error } = await supabase.from('activity_logs').insert({
      ...activity,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
}

/**
 * Get activity feed for team
 */
export async function getTeamActivityFeed(teamId: string, limit = 50) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('activity_logs')
      .select(
        `
        *,
        user:users(id, name, email, avatar_url)
      `
      )
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}

/**
 * Get activity feed for entity
 */
export async function getEntityActivityFeed(entityType: string, entityId: string, teamId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('activity_logs')
      .select(
        `
        *,
        user:users(id, name, email, avatar_url)
      `
      )
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching entity activity:', error);
    return [];
  }
}

/**
 * Get activity for a specific user
 */
export async function getUserActivityFeed(userId: string, teamId: string, limit = 50) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('activity_logs')
      .select(
        `
        *,
        user:users(id, name, email, avatar_url)
      `
      )
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
}

/**
 * Activity types for consistent logging
 */
export const ACTIVITY_TYPES = {
  // CRUD
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',

  // Collaboration
  COMMENTED: 'COMMENTED',
  MENTIONED: 'MENTIONED',

  // Status changes
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SENT: 'SENT',
  PAID: 'PAID',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',

  // Sharing
  SHARED: 'SHARED',
  UNSHARED: 'UNSHARED',

  // Imports
  IMPORTED: 'IMPORTED',
  EXPORTED: 'EXPORTED',
};

/**
 * Format activity message for display
 */
export function formatActivityMessage(activity: ActivityFeedItem): string {
  const actions: Record<string, string> = {
    CREATED: 'created',
    UPDATED: 'updated',
    DELETED: 'deleted',
    COMMENTED: 'commented on',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SENT: 'sent',
    PAID: 'marked as paid',
    STARTED: 'started',
    COMPLETED: 'completed',
    SHARED: 'shared',
    IMPORTED: 'imported',
  };

  const action = actions[activity.action] || activity.action.toLowerCase();
  return `${action} ${activity.entity_type}: ${activity.entity_title || activity.entity_id}`;
}
