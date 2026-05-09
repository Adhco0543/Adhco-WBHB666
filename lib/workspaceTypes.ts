/**
 * Workspace/Operating System Types
 * Extended project model with full resource management
 */

import type { Job, ActivityEntry } from "@/lib/jobTypes";
export type { AISuggestion } from "@/lib/aiSuggestions";
export type { ClientProfile } from "@/lib/clientDatabase";
export type { ConversationSummary } from "@/lib/conversationSummary";
export type { Notification as ProjectNotification } from "@/lib/notifications";

export type ProjectStatus = "planning" | "active" | "on-hold" | "completed" | "archived";

export interface WorkspaceProject {
  // Core fields
  id: string;
  title: string;
  description?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  status: ProjectStatus;
  budget?: number;
  spent?: number;
  scope?: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  
  // Enhanced fields
  
  // Workspace resources
  quotes: ProjectQuote[];
  invoices: ProjectInvoice[];
  materialsList: ProjectMaterial[];
  tasks: ProjectTask[];
  notes: ProjectNote[];
  documents: ProjectDocument[];
  chatMemory: ChatMessage[];
  activityFeed: ActivityEntry[];
  
  // Metadata
  color?: string; // For visual identification
  icon?: string; // Project icon/emoji
  isArchived: boolean;
  isPinned: boolean;
  lastAccessedAt: Date;
}

export interface ProjectQuote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  recipient?: string;
  status: "draft" | "sent" | "accepted" | "declined";
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
  createdFrom?: "assistant"; // Track if AI-generated
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface ProjectInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface ProjectInvoice {
  id: string;
  projectId: string;
  quoteId?: string;
  invoiceNumber: string;
  title: string;
  content: string;
  recipient?: string;
  status: InvoiceStatus;
  amount: number;
  depositAmount?: number;
  balanceDue: number;
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
  lineItems: ProjectInvoiceLineItem[];
  paymentTerms: string;
  createdAt: Date;
  updatedAt: Date;
  createdFrom?: "quote" | "assistant";
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost?: number;
  vendor?: string;
  notes?: string;
}

export interface ProjectMaterial {
  id: string;
  projectId: string;
  title: string;
  items: MaterialItem[];
  totalEstimatedCost?: number;
  createdAt: Date;
  createdFrom?: "assistant";
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  completedAt?: Date;
  assignedTo?: string;
  createdAt: Date;
  createdFrom?: "assistant";
}

export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: "general" | "meeting" | "idea" | "issue" | "decision";
  isPinned: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdFrom?: "assistant";
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  type: "email" | "quote" | "invoice" | "proposal" | "bid" | "file" | "note";
  content?: string;
  url?: string;
  createdAt: Date;
  createdFrom?: "assistant";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  projectId?: string; // Tag messages with project
  timestamp: Date;
  resourceId?: string; // Link to generated resource (quote, task, etc)
}

export interface AttachmentPrompt {
  type: "quote" | "materials" | "task" | "note";
  title: string;
  preview: string;
  projectId?: string; // If attaching to existing
  showCreateNew: boolean;
}

export interface ProjectWorkspace {
  project: WorkspaceProject;
  activeTab: "overview" | "quotes" | "invoices" | "materials" | "tasks" | "notes" | "chat" | "activity";
  searchQuery?: string;
  filters?: WorkspaceFilters;
}

export interface WorkspaceFilters {
  status?: string[];
  priority?: string[];
  dateRange?: { from: Date; to: Date };
  tags?: string[];
}
