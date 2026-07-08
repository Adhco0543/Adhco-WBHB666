'use client';

import { MessageSquare, Send, Trash2, AtSign } from 'lucide-react';
import { addComment, getEntityComments, deleteComment, getTeamActivityFeed } from '@/lib/collaboration';
import { useState, useEffect, useRef } from 'react';

interface CommentsPanelProps {
  entityType: string;
  entityId: string;
  teamId: string;
  userId: string;
  onCommentAdded?: () => void;
}

export function CommentsPanel({
  entityType,
  entityId,
  teamId,
  userId,
  onCommentAdded,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [entityType, entityId, teamId]);

  const loadComments = async () => {
    try {
      const data = await getEntityComments(entityType, entityId, teamId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({
        team_id: teamId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        content: newComment,
        mentions,
      });

      setNewComment('');
      setMentions([]);
      await loadComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-gray-600 text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-600 text-center py-8 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">{comment.profiles?.name || comment.profiles?.email || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">{formatDate(comment.created_at)}</div>
                </div>
                {comment.user_id === userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... (Type @ to mention)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none min-h-20"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-600">Press Ctrl+Enter to submit or click the send button</div>
      </div>

      {/* Activity Feed - Recent Actions */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare size={16} />
          Recent Activity
        </h4>
        {/* Activity feed will be loaded separately */}
      </div>
    </div>
  );
}

/**
 * Activity Feed Component
 */
export function ActivityFeed({ teamId, limit = 10 }: { teamId: string; limit?: number }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [teamId]);

  const loadActivities = async () => {
    try {
      const data = await getTeamActivityFeed(teamId, limit);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600 text-center py-4">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-gray-600 text-center py-8 text-sm">No recent activity</div>;
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <div className="text-blue-600 font-bold">{activity.user?.name?.[0] || '?'}</div>
          <div className="flex-1">
            <div className="text-gray-900">
              <span className="font-medium">{activity.user?.name || 'Unknown'}</span>
              {' '}
              <span className="text-gray-700">{activity.action.toLowerCase()}</span>
              {' '}
              <span className="font-medium">{activity.entity_title || activity.entity_type}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">{new Date(activity.created_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
