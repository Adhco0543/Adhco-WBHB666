/**
 * Assistant Actions Layer
 * High-level business logic combining storage and app logic
 */

import {
  SavedOutput,
  Task,
  ActivityFeedItem,
  OnboardingProfile,
  DashboardSummary,
  TaskStatus,
  TaskPriority,
  TaskType,
} from "./assistantTypes";
import * as storage from "./assistantStorage";

// Helper to generate UUIDs
function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Output (Draft) Actions
// ============================================================================
export function createOutput(
  type: SavedOutput["type"],
  title: string,
  content: string,
  metadata?: SavedOutput["metadata"]
): SavedOutput {
  const output: SavedOutput = {
    id: generateId(),
    type,
    title,
    content,
    status: "draft",
    createdAt: new Date().toISOString(),
    metadata,
  };

  storage.saveOutput(output);

  // Log to activity feed
  addActivityFeedItem({
    type: "draft_created",
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Draft Created`,
    description: title,
    linkedOutputId: output.id,
  });

  return output;
}

export function getOutput(id: string): SavedOutput | undefined {
  return storage.getOutputs().find(o => o.id === id);
}

export function editOutput(id: string, updates: { title?: string; content?: string }): void {
  storage.updateOutput(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export function sendOutput(id: string): void {
  const output = getOutput(id);
  if (!output) return;

  storage.updateOutput(id, { status: "sent" });
  
  addActivityFeedItem({
    type: output.type === "email" ? "email_sent" : "quote_sent",
    title: `${output.type.charAt(0).toUpperCase() + output.type.slice(1)} Sent`,
    description: output.title,
    linkedOutputId: id,
  });
}

export function removeOutput(id: string): void {
  const output = getOutput(id);
  storage.deleteOutput(id);
  
  if (output) {
    addActivityFeedItem({
      type: "draft_created",
      title: `${output.type.charAt(0).toUpperCase() + output.type.slice(1)} Deleted`,
      description: output.title,
    });
  }
}

// ============================================================================
// Task Actions
// ============================================================================
export function createTask(
  title: string,
  description: string,
  type: TaskType = "custom",
  priority: TaskPriority = "medium",
  dueDate?: string
): Task {
  const task: Task = {
    id: generateId(),
    title,
    description,
    type,
    priority,
    dueDate,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  storage.saveTask(task);

  // Log to activity feed
  addActivityFeedItem({
    type: "task_created",
    title: "Task Created",
    description: title,
    linkedTaskId: task.id,
  });

  return task;
}

export function getTask(id: string): Task | undefined {
  return storage.getTasks().find(t => t.id === id);
}

export function updateTaskStatus(
  id: string,
  status: TaskStatus
): void {
  const task = getTask(id);
  storage.updateTask(id, {
    status,
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
  });

  if (status === "completed" && task) {
    addActivityFeedItem({
      type: "task_completed",
      title: "Task Completed",
      description: task.title,
      linkedTaskId: id,
    });
  }
}

export function deleteTask(id: string): void {
  storage.deleteTask(id);
}

// ============================================================================
// Activity Feed Actions
// ============================================================================
export function addActivityFeedItem(
  item: Omit<ActivityFeedItem, "id" | "timestamp">
): ActivityFeedItem {
  const activityItem: ActivityFeedItem = {
    ...item,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  storage.addActivityFeedItem(activityItem);
  return activityItem;
}

// ============================================================================
// Dashboard / Summary Actions
// ============================================================================
export function getDashboardSummary(): DashboardSummary {
  const profile = storage.getProfile();
  const recentOutputs = storage.getRecentOutputs(5);
  const pendingTasks = storage.getPendingTasks();
  const activityFeed = storage.getActivityFeed(5);
  const allTasks = storage.getTasks();
  const allOutputs = storage.getOutputs();

  return {
    profile,
    recentOutputs,
    pendingTasks,
    activityFeed,
    stats: {
      totalQuotes: allOutputs.filter(o => o.type === "quote").length,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === "completed").length,
      openTasks: allTasks.filter(t => t.status !== "completed").length,
    },
  };
}

// ============================================================================
// Profile Actions
// ============================================================================
export function getProfile(): OnboardingProfile | null {
  return storage.getProfile();
}

export function saveProfile(profile: OnboardingProfile): void {
  storage.saveProfile(profile);
  
  addActivityFeedItem({
    type: "chat",
    title: "Profile Updated",
    description: `Role: ${profile.role}`,
  });
}

// ============================================================================
// Batch Output Creation (from Assistant Logic)
// ============================================================================
export function createQuoteDraft(
  customerInfo: string,
  linkedTaskId?: string
): SavedOutput {
  const output = createOutput(
    "quote",
    "Quote Draft",
    `Quote created from: ${customerInfo}`,
    { customerName: customerInfo }
  );

  if (linkedTaskId) {
    storage.updateOutput(output.id, { linkedTaskId });
  }

  return output;
}

export function createEmailDraft(
  emailContent: string,
  linkedTaskId?: string
): SavedOutput {
  return createOutput(
    "email",
    "Email Draft",
    emailContent,
    undefined
  );
}

export function createMaterialsList(
  projectDetails: string,
  linkedTaskId?: string
): SavedOutput {
  return createOutput(
    "materials",
    "Materials List Draft",
    projectDetails,
    { projectName: projectDetails }
  );
}

export function createTaskReminder(
  title: string,
  dueDate?: string
): Task {
  return createTask(
    title,
    `Task reminder: ${title}`,
    "task_reminder",
    "medium",
    dueDate
  );
}

// ============================================================================
// Search & Filter Actions
// ============================================================================
export function searchOutputs(query: string): SavedOutput[] {
  const lowerQuery = query.toLowerCase();
  return storage.getOutputs().filter(
    o =>
      o.title.toLowerCase().includes(lowerQuery) ||
      o.content.toLowerCase().includes(lowerQuery)
  );
}

export function getOutputsByType(
  type: SavedOutput["type"]
): SavedOutput[] {
  return storage.getOutputs(type);
}

export function getTasksByPriority(priority: TaskPriority): Task[] {
  return storage.getTasks().filter(t => t.priority === priority);
}

export function getOverdueTasks(): Task[] {
  const now = new Date();
  return storage.getTasks().filter(t => {
    if (!t.dueDate || t.status === "completed") return false;
    return new Date(t.dueDate) < now;
  });
}

// ============================================================================
// Dashboard Control Center Actions
// ============================================================================
export function getStats() {
  const outputs = storage.getOutputs();
  const tasks = storage.getTasks();
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const quotes = outputs.filter((o) => o.type === "quote");
  const materials = outputs.filter((o) => o.type === "materials");
  const emails = outputs.filter((o) => o.type === "email");

  // Rough revenue estimate: assume ~$500 per quote (adjust as needed)
  const estimatedRevenue = quotes.length * 500;

  return {
    totalQuotes: quotes.length,
    totalMaterials: materials.length,
    totalEmails: emails.length,
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks,
    completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    estimatedRevenue,
  };
}

export function getFollowUpSuggestions() {
  const outputs = storage.getOutputs();
  const tasks = storage.getTasks();

  const suggestions = [];

  // Quotes older than 7 days without follow-up
  const oldQuotes = outputs.filter((o) => {
    if (o.type !== "quote" || o.status === "sent") return false;
    const daysOld = (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 7;
  });

  if (oldQuotes.length > 0) {
    suggestions.push({
      id: "follow-up-quotes",
      type: "follow-up" as const,
      title: `${oldQuotes.length} Quote${oldQuotes.length > 1 ? "s" : ""} Need Follow-up`,
      description: `You have ${oldQuotes.length} quote${oldQuotes.length > 1 ? "s" : ""} older than 7 days. Consider reaching out to customers.`,
      action: "/dashboard#recent-work",
      priority: "high" as const,
    });
  }

  // Overdue tasks
  const overdueTasks = getOverdueTasks();
  if (overdueTasks.length > 0) {
    suggestions.push({
      id: "overdue-tasks",
      type: "warning" as const,
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? "s" : ""}`,
      description: `You have ${overdueTasks.length} task${overdueTasks.length > 1 ? "s" : ""} past their due date.`,
      action: "/dashboard#pending-tasks",
      priority: "high" as const,
    });
  }

  // Tasks needing completion
  const activeTasks = tasks.filter((t) => t.status === "in-progress");
  if (activeTasks.length > 3) {
    suggestions.push({
      id: "active-tasks-high",
      type: "suggestion" as const,
      title: `${activeTasks.length} Tasks In Progress`,
      description: "Consider focusing on completing these before starting new ones.",
      action: "/dashboard#pending-tasks",
      priority: "medium" as const,
    });
  }

  return suggestions;
}

export function markTaskComplete(id: string): void {
  const task = storage.getTask(id);
  if (!task) return;

  storage.updateTask(id, { status: "completed" });

  addActivityFeedItem({
    type: "task_completed",
    title: `Task Completed: ${task.title}`,
    description: task.description,
    linkedTaskId: id,
  });
}

export function updateTaskPriority(id: string, priority: TaskPriority): void {
  const task = storage.getTask(id);
  if (!task) return;

  storage.updateTask(id, { priority });

  addActivityFeedItem({
    type: "chat",
    title: `Task Priority Changed: ${task.title}`,
    description: `Priority changed to ${priority}`,
    linkedTaskId: id,
  });
}

export function getSmartSuggestions() {
  return [
    {
      id: "new-quote",
      icon: "💰",
      title: "Build a New Quote",
      description: "Create a quote for a customer",
      action: "/chat?task=quote",
      actionLabel: "Start Quote",
    },
    {
      id: "new-materials",
      icon: "📦",
      title: "Create Materials List",
      description: "Generate a materials list for a project",
      action: "/chat?task=materials",
      actionLabel: "Create List",
    },
    {
      id: "new-task",
      icon: "✓",
      title: "Add a Task",
      description: "Create a new task or reminder",
      action: "/chat?task=task",
      actionLabel: "Add Task",
    },
    {
      id: "new-email",
      icon: "📧",
      title: "Draft an Email",
      description: "Write an email to a customer",
      action: "/chat?task=email",
      actionLabel: "Draft Email",
    },
  ];
}

// ============================================================================
// Export / Import Actions
// ============================================================================
export function exportAllData() {
  return {
    profile: storage.getProfile(),
    outputs: storage.getOutputs(),
    tasks: storage.getTasks(),
    activityFeed: storage.getActivityFeed(100),
    exportedAt: new Date().toISOString(),
  };
}

export function importData(data: ReturnType<typeof exportAllData>): void {
  if (data.profile) {
    storage.saveProfile(data.profile);
  }
  // Note: In a real app, would batch import outputs and tasks
  console.log("Data imported successfully");
}

// ============================================================================
// Utility Actions
// ============================================================================
export function getAssistantReadiness() {
  return {
    profileComplete: !!storage.getProfile(),
    hasOutputs: storage.getOutputs().length > 0,
    hasTasks: storage.getTasks().length > 0,
    storageStats: storage.getStorageStats(),
  };
}

export function logAction(
  action: string,
  details?: Record<string, any>
): void {
  addActivityFeedItem({
    type: "chat",
    title: action,
    description: details ? JSON.stringify(details) : undefined,
  });
}
