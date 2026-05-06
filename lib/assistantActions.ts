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

export function updateTaskPriority(id: string, priority: TaskPriority): void {
  storage.updateTask(id, { priority });
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
