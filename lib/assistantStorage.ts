/**
 * Assistant Storage Layer
 * Handles all read/write operations to localStorage
 * Single point of access for persistent data
 */

import {
  OnboardingProfile,
  ChatMemory,
  SavedOutput,
  Task,
  ActivityFeedItem,
  AssistantStatus,
  ChatMessage,
} from "./assistantTypes";

// ============================================================================
// Storage Keys
// ============================================================================
const STORAGE_KEYS = {
  profile: "onboarding_profile",
  chatMemory: (roleKey: string) => `assistant_chat_memory_${roleKey}`,
  outputs: "assistant_outputs",
  tasks: "assistant_tasks",
  activityFeed: "assistant_activity_feed",
  status: "assistant_status",
};

// ============================================================================
// Profile Storage
// ============================================================================
export function getProfile(): OnboardingProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.profile);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading profile:", error);
    return null;
  }
}

export function saveProfile(profile: OnboardingProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving profile:", error);
  }
}

// ============================================================================
// Chat Memory Storage
// ============================================================================
export function getChatMemory(roleKey: string): ChatMessage[] {
  try {
    const key = STORAGE_KEYS.chatMemory(roleKey);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading chat memory:", error);
    return [];
  }
}

export function saveChatMemory(roleKey: string, messages: ChatMessage[]): void {
  try {
    const key = STORAGE_KEYS.chatMemory(roleKey);
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving chat memory:", error);
  }
}

export function clearChatMemory(roleKey: string): void {
  try {
    const key = STORAGE_KEYS.chatMemory(roleKey);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing chat memory:", error);
  }
}

// ============================================================================
// Outputs (Quotes, Materials, Emails, Notes) Storage
// ============================================================================
export function getOutputs(typeFilter?: string): SavedOutput[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.outputs);
    let outputs: SavedOutput[] = stored ? JSON.parse(stored) : [];
    
    if (typeFilter) {
      outputs = outputs.filter(o => o.type === typeFilter);
    }
    
    return outputs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error reading outputs:", error);
    return [];
  }
}

export function getRecentOutputs(limit: number = 5): SavedOutput[] {
  return getOutputs().slice(0, limit);
}

export function saveOutput(output: SavedOutput): void {
  try {
    const outputs = getOutputs();
    outputs.push(output);
    localStorage.setItem(STORAGE_KEYS.outputs, JSON.stringify(outputs));
  } catch (error) {
    console.error("Error saving output:", error);
  }
}

export function updateOutput(id: string, updates: Partial<SavedOutput>): void {
  try {
    const outputs = getOutputs();
    const index = outputs.findIndex(o => o.id === id);
    if (index !== -1) {
      outputs[index] = {
        ...outputs[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.outputs, JSON.stringify(outputs));
    }
  } catch (error) {
    console.error("Error updating output:", error);
  }
}

export function deleteOutput(id: string): void {
  try {
    const outputs = getOutputs().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.outputs, JSON.stringify(outputs));
  } catch (error) {
    console.error("Error deleting output:", error);
  }
}

// ============================================================================
// Tasks Storage
// ============================================================================
export function getTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.tasks);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
}

export function getTask(id: string): Task | undefined {
  return getTasks().find(t => t.id === id);
}

export function getPendingTasks(): Task[] {
  return getTasks()
    .filter(t => t.status !== "completed")
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function saveTask(task: Task): void {
  try {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

export function updateTask(id: string, updates: Partial<Task>): void {
  try {
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

export function deleteTask(id: string): void {
  try {
    const tasks = getTasks().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// ============================================================================
// Activity Feed Storage
// ============================================================================
export function getActivityFeed(limit: number = 20): ActivityFeedItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.activityFeed);
    let items: ActivityFeedItem[] = stored ? JSON.parse(stored) : [];
    return items
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error reading activity feed:", error);
    return [];
  }
}

export function addActivityFeedItem(item: ActivityFeedItem): void {
  try {
    const items = getActivityFeed(100); // Keep last 100
    items.push(item);
    localStorage.setItem(STORAGE_KEYS.activityFeed, JSON.stringify(items));
  } catch (error) {
    console.error("Error adding activity feed item:", error);
  }
}

// ============================================================================
// Assistant Status Storage
// ============================================================================
export function getStatus(): AssistantStatus {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.status);
    return stored
      ? JSON.parse(stored)
      : {
          isReady: true,
          isProcessing: false,
        };
  } catch (error) {
    console.error("Error reading status:", error);
    return { isReady: true, isProcessing: false };
  }
}

export function updateStatus(updates: Partial<AssistantStatus>): void {
  try {
    const status = getStatus();
    const updated = {
      ...status,
      ...updates,
      lastActionTime: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.status, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (typeof key === "string") {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing all data:", error);
  }
}

export function getStorageStats(): {
  profileSize: number;
  outputsCount: number;
  tasksCount: number;
  activityCount: number;
  totalSize: number;
} {
  const profile = getProfile();
  const outputs = getOutputs();
  const tasks = getTasks();
  const activity = getActivityFeed(100);

  const estimateSize = (obj: any) =>
    new Blob([JSON.stringify(obj)]).size;

  return {
    profileSize: profile ? estimateSize(profile) : 0,
    outputsCount: outputs.length,
    tasksCount: tasks.length,
    activityCount: activity.length,
    totalSize:
      (profile ? estimateSize(profile) : 0) +
      estimateSize(outputs) +
      estimateSize(tasks) +
      estimateSize(activity),
  };
}

// ============================================================================
// Customization Storage
// ============================================================================
import type { OutputCustomization, ActionVisibility, UserPreferences, CustomTemplate, CustomWorkflow, OutputAction } from "./assistantTypes";

const DEFAULT_ACTION_VISIBILITY: ActionVisibility = {
  quote: ["copy", "download", "email", "send", "print", "share", "duplicate", "delete"],
  materials: ["copy", "download", "print", "share", "duplicate", "delete"],
  email: ["copy", "send", "edit_status", "delete"],
  task: ["complete", "edit_status", "delete"],
  note: ["copy", "download", "delete"],
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  fontSize: "medium",
  compactMode: false,
  showMetadata: true,
  defaultSort: "newest",
};

export function getCustomization(): OutputCustomization {
  try {
    const stored = localStorage.getItem("output_customization");
    if (stored) return JSON.parse(stored);
    
    return {
      actionVisibility: DEFAULT_ACTION_VISIBILITY,
      preferences: DEFAULT_PREFERENCES,
      templates: [],
      workflows: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error reading customization:", error);
    return {
      actionVisibility: DEFAULT_ACTION_VISIBILITY,
      preferences: DEFAULT_PREFERENCES,
      templates: [],
      workflows: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveCustomization(customization: OutputCustomization): void {
  try {
    localStorage.setItem("output_customization", JSON.stringify(customization));
  } catch (error) {
    console.error("Error saving customization:", error);
  }
}

export function getActionVisibility(): ActionVisibility {
  return getCustomization().actionVisibility;
}

export function updateActionVisibility(updates: Partial<ActionVisibility>): void {
  const customization = getCustomization();
  customization.actionVisibility = { ...customization.actionVisibility, ...updates };
  customization.updatedAt = new Date().toISOString();
  saveCustomization(customization);
}

export function getPreferences(): UserPreferences {
  return getCustomization().preferences;
}

export function updatePreferences(updates: Partial<UserPreferences>): void {
  const customization = getCustomization();
  customization.preferences = { ...customization.preferences, ...updates };
  customization.updatedAt = new Date().toISOString();
  saveCustomization(customization);
}

export function getTemplates(): CustomTemplate[] {
  return getCustomization().templates;
}

export function getTemplateById(id: string): CustomTemplate | undefined {
  return getTemplates().find(t => t.id === id);
}

export function saveTemplate(template: CustomTemplate): void {
  const customization = getCustomization();
  const index = customization.templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    customization.templates[index] = template;
  } else {
    customization.templates.push(template);
  }
  customization.updatedAt = new Date().toISOString();
  saveCustomization(customization);
}

export function deleteTemplate(id: string): void {
  const customization = getCustomization();
  customization.templates = customization.templates.filter(t => t.id !== id);
  customization.updatedAt = new Date().toISOString();
  saveCustomization(customization);
}

export function getWorkflows(): CustomWorkflow[] {
  return getCustomization().workflows;
}

export function getWorkflowByType(type: string): CustomWorkflow | undefined {
  return getWorkflows().find(w => w.type === type);
}

export function saveWorkflow(workflow: CustomWorkflow): void {
  const customization = getCustomization();
  const index = customization.workflows.findIndex(w => w.id === workflow.id);
  if (index >= 0) {
    customization.workflows[index] = workflow;
  } else {
    customization.workflows.push(workflow);
  }
  customization.updatedAt = new Date().toISOString();
  saveCustomization(customization);
}

export function deleteWorkflow(id: string): void {
  const customization = getCustomization();
  customization.workflows = customization.workflows.filter(w => w.id !== id);
  customization.updatedAt = new Date().toISOString();
  saveCustomization(customization);
}
