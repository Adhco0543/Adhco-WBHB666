/**
 * Jobs/Projects Types
 * Central data model for the Jobs/Projects system
 */

export type JobStatus = "prospect" | "active" | "completed" | "archived";

export interface Job {
  id: string;
  title: string;
  description?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  status: JobStatus;
  budget?: number;
  spent?: number;
  scope?: string;
  startDate: Date;
  endDate?: Date;
  dueDate?: Date;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export interface JobDetail {
  job: Job;
  quotes: QuoteItem[];
  tasks: TaskItem[];
  materials: MaterialItem[];
  documents: DocumentItem[];
  activityFeed: ActivityEntry[];
  teamMembers?: TeamMember[];
  attachments?: Attachment[];
}

export interface QuoteItem {
  id: string;
  jobId: string;
  title: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "declined";
  sentDate?: Date;
  acceptedDate?: Date;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskItem {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialItem {
  id: string;
  jobId: string;
  name: string;
  quantity: number;
  unit: string; // "hours", "boxes", "sq ft", etc
  unitPrice?: number;
  notes?: string;
  obtained: boolean;
  createdAt: Date;
}

export interface DocumentItem {
  id: string;
  jobId: string;
  title: string;
  type: "email" | "quote" | "invoice" | "note" | "file" | "photo";
  content?: string;
  url?: string;
  createdAt: Date;
}

export interface ActivityEntry {
  id: string;
  jobId: string;
  type: "created" | "updated" | "quote_sent" | "task_completed" | "material_added" | "note_added" | "status_changed" | "document_added";
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "collaborator" | "viewer";
}

export interface Attachment {
  id: string;
  jobId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

/**
 * Helper functions for job management
 */

export function getJobStatus(job: Job): JobStatus {
  return job.status;
}

export function calculateJobProgress(job: Job, taskItems: TaskItem[]): number {
  if (taskItems.length === 0) return 0;
  const completed = taskItems.filter((t) => t.status === "completed").length;
  return Math.round((completed / taskItems.length) * 100);
}

export function calculateJobBudget(job: Job, items: any[]): { spent: number; remaining: number; percentage: number } {
  if (!job.budget) return { spent: 0, remaining: 0, percentage: 0 };

  const spent = job.spent || 0;
  const remaining = job.budget - spent;
  const percentage = Math.round((spent / job.budget) * 100);

  return { spent, remaining, percentage };
}

export function formatJobDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
