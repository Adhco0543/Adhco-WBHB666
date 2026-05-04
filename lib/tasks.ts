// Task Management System
// Supports all user roles with persistent localStorage

export type TaskStatus = "open" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO 8601 format
  createdAt: string;
  completedAt?: string;
  assignedTo?: string;
  role?: string; // Role when task was created (for filtering)
  tags?: string[]; // e.g., "project-name", "client-name"
  integrations?: {
    googleCalendarId?: string;
    slackId?: string;
    quickbooksId?: string;
  };
};

export type TaskGroup = {
  status: TaskStatus;
  tasks: Task[];
};

const STORAGE_KEY = "assistant_tasks";

/**
 * Get all tasks from localStorage
 */
export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get tasks filtered by status or role
 */
export function getTasksByStatus(status: TaskStatus): Task[] {
  return getTasks().filter((t) => t.status === status);
}

export function getTasksByRole(role: string): Task[] {
  return getTasks().filter((t) => t.role === role);
}

export function getTasksByPriority(priority: TaskPriority): Task[] {
  return getTasks().filter((t) => t.priority === priority);
}

/**
 * Create a new task
 */
export function createTask(
  title: string,
  options?: {
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assignedTo?: string;
    role?: string;
    tags?: string[];
  }
): Task {
  const task: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    description: options?.description,
    status: "open",
    priority: options?.priority || "medium",
    dueDate: options?.dueDate,
    createdAt: new Date().toISOString(),
    assignedTo: options?.assignedTo,
    role: options?.role,
    tags: options?.tags || [],
    integrations: {}
  };

  const allTasks = getTasks();
  allTasks.push(task);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));

  return task;
}

/**
 * Update a task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const allTasks = getTasks();
  const index = allTasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  const updated = { ...allTasks[index], ...updates };
  allTasks[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));

  return updated;
}

/**
 * Complete a task
 */
export function completeTask(id: string): Task | null {
  return updateTask(id, {
    status: "completed",
    completedAt: new Date().toISOString()
  });
}

/**
 * Delete a task
 */
export function deleteTask(id: string): boolean {
  const allTasks = getTasks();
  const filtered = allTasks.filter((t) => t.id !== id);

  if (filtered.length === allTasks.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get task stats for dashboard
 */
export function getTaskStats() {
  const tasks = getTasks();
  return {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "open").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return new Date(t.dueDate) < new Date();
    }).length,
    highPriority: tasks.filter((t) => t.priority === "high" && t.status !== "completed").length
  };
}

/**
 * Group tasks by status
 */
export function groupTasksByStatus(): TaskGroup[] {
  const tasks = getTasks();
  return [
    {
      status: "open",
      tasks: tasks.filter((t) => t.status === "open")
    },
    {
      status: "in_progress",
      tasks: tasks.filter((t) => t.status === "in_progress")
    },
    {
      status: "completed",
      tasks: tasks.filter((t) => t.status === "completed")
    }
  ];
}

/**
 * Clear all tasks (for development/testing)
 */
export function clearAllTasks(): void {
  localStorage.removeItem(STORAGE_KEY);
}
