/**
 * Assistant Memory Management
 * Handles task memory, saved outputs, and activity tracking
 */

export type SavedOutput = {
  id: string;
  type: "quote" | "materials" | "email" | "task" | "note";
  title: string;
  content: string;
  createdAt: string;
  status?: "draft" | "completed" | "sent";
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  type: "quote_followup" | "materials_order" | "email_send" | "task_reminder" | "custom";
  createdAt: string;
  linkedOutputId?: string; // Link to associated output (quote, materials list, etc.)
};

export type ActivityFeedItem = {
  id: string;
  type: "chat" | "draft_created" | "task_created" | "quote_sent" | "materials_ordered";
  title: string;
  description?: string;
  timestamp: string;
  linkedOutputId?: string;
  linkedTaskId?: string;
};

// ============================================================================
// Saved Outputs (Quotes, Materials Lists, etc.)
// ============================================================================

export function saveOutput(output: SavedOutput): void {
  const saved = localStorage.getItem("assistant_outputs");
  const outputs: SavedOutput[] = saved ? JSON.parse(saved) : [];
  localStorage.setItem("assistant_outputs", JSON.stringify([output, ...outputs]));

  // Add to activity feed
  addActivityFeedItem({
    id: crypto.randomUUID(),
    type: "draft_created",
    title: `${output.type.toUpperCase()} DRAFT created: ${output.title}`,
    description: output.content.substring(0, 100),
    timestamp: new Date().toISOString(),
    linkedOutputId: output.id
  });
}

export function getOutputs(type?: SavedOutput["type"]): SavedOutput[] {
  const saved = localStorage.getItem("assistant_outputs");
  const outputs: SavedOutput[] = saved ? JSON.parse(saved) : [];

  if (type) {
    return outputs.filter((o) => o.type === type);
  }

  return outputs;
}

export function getOutput(id: string): SavedOutput | null {
  const outputs = getOutputs();
  return outputs.find((o) => o.id === id) || null;
}

export function updateOutput(id: string, updates: Partial<SavedOutput>): void {
  const saved = localStorage.getItem("assistant_outputs");
  const outputs: SavedOutput[] = saved ? JSON.parse(saved) : [];

  const index = outputs.findIndex((o) => o.id === id);
  if (index !== -1) {
    outputs[index] = { ...outputs[index], ...updates };
    localStorage.setItem("assistant_outputs", JSON.stringify(outputs));
  }
}

export function deleteOutput(id: string): void {
  const saved = localStorage.getItem("assistant_outputs");
  const outputs: SavedOutput[] = saved ? JSON.parse(saved) : [];
  const filtered = outputs.filter((o) => o.id !== id);
  localStorage.setItem("assistant_outputs", JSON.stringify(filtered));
}

export function getRecentOutputs(limit: number = 5): SavedOutput[] {
  return getOutputs().slice(0, limit);
}

// ============================================================================
// Tasks (Pending Quotes, Follow-ups, Materials Orders, etc.)
// ============================================================================

export function saveTask(task: Task): void {
  const saved = localStorage.getItem("assistant_tasks");
  const tasks: Task[] = saved ? JSON.parse(saved) : [];
  localStorage.setItem("assistant_tasks", JSON.stringify([task, ...tasks]));

  // Add to activity feed
  addActivityFeedItem({
    id: crypto.randomUUID(),
    type: "task_created",
    title: `Task created: ${task.title}`,
    description: task.description,
    timestamp: new Date().toISOString(),
    linkedTaskId: task.id
  });
}

export function getTasks(status?: Task["status"]): Task[] {
  const saved = localStorage.getItem("assistant_tasks");
  const tasks: Task[] = saved ? JSON.parse(saved) : [];

  if (status) {
    return tasks.filter((t) => t.status === status);
  }

  return tasks;
}

export function getTask(id: string): Task | null {
  const tasks = getTasks();
  return tasks.find((t) => t.id === id) || null;
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const saved = localStorage.getItem("assistant_tasks");
  const tasks: Task[] = saved ? JSON.parse(saved) : [];

  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem("assistant_tasks", JSON.stringify(tasks));
  }
}

export function deleteTask(id: string): void {
  const saved = localStorage.getItem("assistant_tasks");
  const tasks: Task[] = saved ? JSON.parse(saved) : [];
  const filtered = tasks.filter((t) => t.id !== id);
  localStorage.setItem("assistant_tasks", JSON.stringify(filtered));
}

export function getPendingTasks(): Task[] {
  return getTasks("pending");
}

export function getRecentTasks(limit: number = 5): Task[] {
  return getTasks().slice(0, limit);
}

// Get tasks by type
export function getTasksByType(type: Task["type"]): Task[] {
  return getTasks().filter((t) => t.type === type);
}

// ============================================================================
// Activity Feed
// ============================================================================

export function addActivityFeedItem(item: ActivityFeedItem): void {
  const saved = localStorage.getItem("assistant_activity_feed");
  const items: ActivityFeedItem[] = saved ? JSON.parse(saved) : [];
  localStorage.setItem("assistant_activity_feed", JSON.stringify([item, ...items]));
}

export function getActivityFeed(limit: number = 20): ActivityFeedItem[] {
  const saved = localStorage.getItem("assistant_activity_feed");
  const items: ActivityFeedItem[] = saved ? JSON.parse(saved) : [];
  return items.slice(0, limit);
}

export function clearActivityFeed(): void {
  localStorage.removeItem("assistant_activity_feed");
}

// ============================================================================
// Dashboard Summary
// ============================================================================

export function getDashboardSummary() {
  const recentOutputs = getRecentOutputs(5);
  const pendingTasks = getPendingTasks();
  const activityFeed = getActivityFeed(10);

  const quotes = getOutputs("quote");
  const materials = getOutputs("materials");
  const emails = getOutputs("email");

  return {
    recentOutputs,
    pendingTasks,
    activityFeed,
    stats: {
      totalQuotes: quotes.length,
      totalMaterials: materials.length,
      totalEmails: emails.length,
      totalTasks: getTasks().length,
      pendingTaskCount: pendingTasks.length,
      completedTaskCount: getTasks("completed").length
    }
  };
}
