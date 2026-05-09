/**
 * AI Suggestions Engine
 * Generates contextual suggestions based on project state and activity
 */

import type { WorkspaceProject } from "@/lib/workspaceTypes";

export interface AISuggestion {
  id: string;
  type: "action" | "reminder" | "opportunity" | "warning";
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    handler: string; // Handler identifier for UI
  };
  priority: "low" | "medium" | "high";
  timestamp: Date;
}

/**
 * Generate suggestions based on project state
 */
export function generateAISuggestions(project: WorkspaceProject): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const now = new Date();

  // Suggestion 1: Create task from quote
  if (project.quotes.length > 0 && project.tasks.length === 0) {
    suggestions.push({
      id: `sugg_task_${project.id}`,
      type: "opportunity",
      title: "📋 Create task from quote?",
      description: `You have ${project.quotes.length} quote(s) but no tasks yet. Create a task to track quote follow-up.`,
      icon: "✅",
      action: {
        label: "Create Task",
        handler: "create_task_from_quote",
      },
      priority: "medium",
      timestamp: now,
    });
  }

  // Suggestion 2: Generate materials list
  if (project.quotes.length > 0 && project.materialsList.length === 0) {
    suggestions.push({
      id: `sugg_materials_${project.id}`,
      type: "opportunity",
      title: "📦 Generate materials list?",
      description: `Create a materials list from your quotes to track supplies and costs.`,
      icon: "📦",
      action: {
        label: "Generate Materials",
        handler: "generate_materials_list",
      },
      priority: "medium",
      timestamp: now,
    });
  }

  // Suggestion 3: Follow-up reminder
  const draftQuotes = project.quotes.filter((q) => q.status === "draft");
  if (draftQuotes.length > 0) {
    suggestions.push({
      id: `sugg_followup_${project.id}`,
      type: "reminder",
      title: "💬 Follow up with customer?",
      description: `You have ${draftQuotes.length} draft quote(s) waiting for approval. Send a follow-up message.`,
      icon: "💬",
      action: {
        label: "Send Follow-up",
        handler: "send_followup",
      },
      priority: "high",
      timestamp: now,
    });
  }

  // Suggestion 4: Overdue tasks warning
  const overdueTasks = project.tasks.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    return new Date(t.dueDate) < now;
  });
  if (overdueTasks.length > 0) {
    suggestions.push({
      id: `sugg_overdue_${project.id}`,
      type: "warning",
      title: "⚠️ Overdue tasks",
      description: `You have ${overdueTasks.length} overdue task(s). Check them and update status.`,
      icon: "⚠️",
      action: {
        label: "View Tasks",
        handler: "view_tasks",
      },
      priority: "high",
      timestamp: now,
    });
  }

  // Suggestion 5: Mark project complete
  const completedTasks = project.tasks.filter((t) => t.status === "completed").length;
  const totalTasks = project.tasks.length;
  if (
    project.status !== "completed" &&
    totalTasks > 0 &&
    completedTasks === totalTasks
  ) {
    suggestions.push({
      id: `sugg_complete_${project.id}`,
      type: "action",
      title: "✨ Mark project complete?",
      description: `All tasks are done! Consider marking this project as completed.`,
      icon: "✨",
      action: {
        label: "Mark Complete",
        handler: "mark_project_complete",
      },
      priority: "medium",
      timestamp: now,
    });
  }

  // Suggestion 6: Add project notes
  if (project.notes.length === 0) {
    suggestions.push({
      id: `sugg_notes_${project.id}`,
      type: "action",
      title: "📝 Add project notes?",
      description: `Document important details, client preferences, or project requirements.`,
      icon: "📝",
      action: {
        label: "Add Note",
        handler: "add_note",
      },
      priority: "low",
      timestamp: now,
    });
  }

  // Suggestion 7: Export quote for client
  if (
    project.quotes.length > 0 &&
    project.quotes.some((q) => q.status === "draft")
  ) {
    suggestions.push({
      id: `sugg_export_${project.id}`,
      type: "action",
      title: "📤 Export quote for client?",
      description: `Share your quote as PDF or email to get client approval faster.`,
      icon: "📤",
      action: {
        label: "Export Quote",
        handler: "export_quote",
      },
      priority: "low",
      timestamp: now,
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
  });
}

/**
 * Filter suggestions by type
 */
export function filterSuggestions(
  suggestions: AISuggestion[],
  type: AISuggestion["type"]
): AISuggestion[] {
  return suggestions.filter((s) => s.type === type);
}

/**
 * Get highest priority suggestions
 */
export function getTopSuggestions(
  suggestions: AISuggestion[],
  count: number = 3
): AISuggestion[] {
  return suggestions.slice(0, count);
}
