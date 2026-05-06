/**
 * Central types for the AI Assistant
 * Single source of truth for all data structures
 */

// ============================================================================
// User Profile
// ============================================================================
export type UserRole = 
  | "general_contractor"
  | "carpenter"
  | "electrician"
  | "plumber"
  | "hvac"
  | "roofer"
  | "general";

export interface OnboardingProfile {
  id: string;
  role: UserRole;
  businessName: string;
  businessType: string;
  yearsInBusiness: number;
  specializations: string[];
  completedAt: string;
}

// ============================================================================
// Chat & Memory
// ============================================================================
export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp?: string;
}

export interface ChatMemory {
  roleKey: string; // "assistant_chat_memory_${role}"
  messages: ChatMessage[];
  context?: string;
}

// ============================================================================
// Outputs (Drafts/Generated Content)
// ============================================================================
export type OutputType = "quote" | "materials" | "email" | "task" | "note";
export type OutputStatus = "draft" | "sent" | "completed";

export interface SavedOutput {
  id: string;
  type: OutputType;
  title: string;
  content: string;
  status?: OutputStatus;
  createdAt: string;
  updatedAt?: string;
  linkedTaskId?: string;
  metadata?: {
    customerName?: string;
    projectName?: string;
    amount?: number;
    recipient?: string;
  };
}

// ============================================================================
// Tasks & Reminders
// ============================================================================
export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType = 
  | "quote_followup"
  | "materials_order"
  | "email_send"
  | "task_reminder"
  | "custom";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  linkedOutputId?: string;
  assignedTo?: string;
}

// ============================================================================
// Activity Feed
// ============================================================================
export type ActivityType = 
  | "chat"
  | "draft_created"
  | "task_created"
  | "quote_sent"
  | "materials_ordered"
  | "email_sent"
  | "task_completed";

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  linkedOutputId?: string;
  linkedTaskId?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Assistant Status & Configuration
// ============================================================================
export interface AssistantStatus {
  isReady: boolean;
  currentTask?: string; // "quote" | "email" | "materials" | "task" | "chat"
  lastAction?: string;
  lastActionTime?: string;
  isProcessing: boolean;
}

// ============================================================================
// Unified Assistant State
// ============================================================================
export interface AssistantState {
  profile: OnboardingProfile | null;
  chatMemory: ChatMemory | null;
  outputs: SavedOutput[];
  tasks: Task[];
  activityFeed: ActivityFeedItem[];
  status: AssistantStatus;
}

// ============================================================================
// API Response Types
// ============================================================================
export interface GenerateReplyResult {
  response: string;
  task?: Task;
  status?: Partial<AssistantStatus>;
}

export interface DashboardSummary {
  profile: OnboardingProfile | null;
  recentOutputs: SavedOutput[];
  pendingTasks: Task[];
  activityFeed: ActivityFeedItem[];
  stats: {
    totalQuotes: number;
    totalTasks: number;
    completedTasks: number;
    openTasks: number;
  };
}

// ============================================================================
// Customization & Preferences
// ============================================================================

// Available actions for each output type
export type OutputAction = 
  | "copy" 
  | "download" 
  | "email" 
  | "send"
  | "print"
  | "share"
  | "duplicate"
  | "export_pdf"
  | "delete"
  | "complete"
  | "mark_sent"
  | "edit_status"
  | "add_notes";

// Which actions to show for each output type
export interface ActionVisibility {
  quote: OutputAction[];
  materials: OutputAction[];
  email: OutputAction[];
  task: OutputAction[];
  note: OutputAction[];
}

// User display preferences
export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showMetadata: boolean; // Show created date, status, etc.
  showLineNumbers?: boolean; // For code/detailed content
  defaultSort: "newest" | "oldest" | "title";
}

// Custom template for generating outputs
export interface CustomTemplate {
  id: string;
  name: string; // "Residential Quote", "Emergency Task", etc.
  type: OutputType;
  templateContent: string; // Template with {{placeholders}}
  description?: string;
  isDefault?: boolean;
  createdAt: string;
}

// Custom workflow/status for each type
export interface CustomWorkflow {
  id: string;
  type: OutputType;
  statuses: string[]; // e.g., ["Draft", "Sent", "Approved", "Invoiced"]
  defaultStatus: string;
  createdAt: string;
}

// Master customization settings
export interface OutputCustomization {
  userId?: string;
  actionVisibility: ActionVisibility;
  preferences: UserPreferences;
  templates: CustomTemplate[];
  workflows: CustomWorkflow[];
  defaultTemplate?: Record<OutputType, string>; // templateId for each type
  createdAt: string;
  updatedAt: string;
}
