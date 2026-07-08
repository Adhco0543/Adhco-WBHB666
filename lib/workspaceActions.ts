/**
 * Workspace Storage Actions
 * Unified storage for projects with all resources
 */

import type {
  WorkspaceProject,
  ProjectQuote,
  ProjectInvoice,
  ProjectInvoiceLineItem,
  ProjectTask,
  ProjectMaterial,
  ProjectNote,
  ChatMessage,
} from "@/lib/workspaceTypes";
import { upsertClient, addProjectToClient } from "@/lib/clientDatabase";
import { createNotification, generateProjectNotifications } from "@/lib/notifications";

const WORKSPACE_PROJECTS_KEY = "workspace_projects";

export function getAllWorkspaceProjects(): WorkspaceProject[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(WORKSPACE_PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getWorkspaceProjectById(projectId: string): WorkspaceProject | null {
  const projects = getAllWorkspaceProjects();
  return projects.find((p) => p.id === projectId) || null;
}

export function createWorkspaceProject(
  title: string,
  clientName: string,
  initialData?: Partial<WorkspaceProject>
): WorkspaceProject {
  const now = new Date();
  const jobId = `project_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const project: WorkspaceProject = {
    id: jobId,
    title,
    clientName,
    status: "planning",
    startDate: now,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    isPinned: false,
    lastAccessedAt: now,
    quotes: [],
    invoices: [],
    materialsList: [],
    tasks: [],
    notes: [],
    documents: [],
    chatMemory: [],
    activityFeed: [
      {
        id: `activity_${Date.now()}`,
        jobId,
        type: "created",
        title: `Project created: ${title}`,
        description: `New workspace project created`,
        createdAt: now,
      },
    ],
    ...initialData,
  };

  const projects = getAllWorkspaceProjects();
  projects.push(project);
  localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));

  // Auto-create client profile if it doesn't exist
  if (clientName.trim()) {
    const client = upsertClient(clientName, {
      email: "",
      phone: "",
      company: "",
      address: "",
      tags: [],
    });

    // Link project to client
    addProjectToClient(client.id, jobId, title);
  }

  return project;
}

function ensureProjectCollections(project: WorkspaceProject): void {
  project.quotes = project.quotes || [];
  project.invoices = project.invoices || [];
  project.materialsList = project.materialsList || [];
  project.tasks = project.tasks || [];
  project.notes = project.notes || [];
  project.documents = project.documents || [];
  project.chatMemory = project.chatMemory || [];
  project.activityFeed = project.activityFeed || [];
}

export function attachQuoteToProject(projectId: string, quote: ProjectQuote): void {
  const projects = getAllWorkspaceProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    ensureProjectCollections(project);
    project.quotes.push(quote);
    project.updatedAt = new Date();

    // Add activity
    project.activityFeed.push({
      id: `activity_${Date.now()}`,
      jobId: projectId,
      type: "document_added",
      title: `Quote created: ${quote.title}`,
      description: `Quote attached to project`,
      metadata: { quoteId: quote.id },
      createdAt: new Date(),
    });

    localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));

    // Integrate with client database
    if (project.clientName) {
      // Ensure client exists in database
      const client = upsertClient(project.clientName, {
        email: "", // Can be updated via client database UI
        phone: "",
        company: "",
        address: "",
        tags: [],
      });

      // Link project to client and update stats
      addProjectToClient(client.id, projectId, quote.title, quote.amount);

      // Generate notifications for this quote creation
      generateProjectNotifications(project);
    }
  }
}

export function convertQuoteToInvoice(projectId: string, quoteId: string): ProjectInvoice | null {
  const projects = getAllWorkspaceProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return null;

  ensureProjectCollections(project);

  const quote = project.quotes.find((item) => item.id === quoteId);
  if (!quote) return null;

  const existingInvoice = project.invoices.find((invoice) => invoice.quoteId === quoteId);
  if (existingInvoice) return existingInvoice;

  const now = new Date();
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + 30);

  const amount = quote.amount || 0;
  const depositAmount = amount > 0 ? Math.round(amount * 0.5 * 100) / 100 : undefined;
  const balanceDue = amount > 0 ? Math.round((amount - (depositAmount || 0)) * 100) / 100 : 0;
  const invoiceNumber = `INV-${now.getFullYear()}-${String(project.invoices.length + 1).padStart(4, "0")}`;
  const lineItems = createInvoiceLineItemsFromQuote(quote, amount);

  const invoice: ProjectInvoice = {
    id: `invoice_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    projectId,
    quoteId,
    invoiceNumber,
    title: quote.title.replace(/quote/i, "Invoice"),
    content: buildInvoiceContent(project, quote, invoiceNumber, dueAt, amount, depositAmount, balanceDue),
    recipient: quote.recipient || project.clientName,
    status: "draft",
    amount,
    depositAmount,
    balanceDue,
    issuedAt: now,
    dueAt,
    lineItems,
    paymentTerms: "50% deposit due to schedule work, remaining balance due upon completion.",
    createdAt: now,
    updatedAt: now,
    createdFrom: "quote",
  };

  project.invoices.push(invoice);
  quote.status = quote.status === "draft" ? "accepted" : quote.status;
  quote.updatedAt = now;
  project.updatedAt = now;

  project.documents.push({
    id: `document_${invoice.id}`,
    projectId,
    title: invoice.title,
    type: "invoice",
    content: invoice.content,
    createdAt: now,
    createdFrom: "assistant",
  });

  project.activityFeed.push({
    id: `activity_${Date.now()}`,
    jobId: projectId,
    type: "document_added",
    title: `Invoice created: ${invoice.invoiceNumber}`,
    description: `Converted from quote "${quote.title}"`,
    metadata: { quoteId, invoiceId: invoice.id },
    createdAt: now,
  });

  localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));
  return invoice;
}

function createInvoiceLineItemsFromQuote(quote: ProjectQuote, amount: number): ProjectInvoiceLineItem[] {
  if (amount <= 0) {
    return [
      {
        id: `invoice_line_${Date.now()}`,
        description: quote.title,
        quantity: 1,
        unit: "project",
        unitCost: 0,
        subtotal: 0,
      },
    ];
  }

  return [
    {
      id: `invoice_line_${Date.now()}`,
      description: quote.title,
      quantity: 1,
      unit: "project",
      unitCost: amount,
      subtotal: amount,
    },
  ];
}

function buildInvoiceContent(
  project: WorkspaceProject,
  quote: ProjectQuote,
  invoiceNumber: string,
  dueAt: Date,
  amount: number,
  depositAmount: number | undefined,
  balanceDue: number
): string {
  const depositLine = depositAmount
    ? `Deposit Due: $${depositAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "Deposit Due: To be confirmed";
  const balanceLine = amount > 0
    ? `Balance Due: $${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "Balance Due: To be confirmed";

  return `Invoice ${invoiceNumber}
Project: ${project.title}
Client: ${quote.recipient || project.clientName}
Issued: ${new Date().toLocaleDateString()}
Due: ${dueAt.toLocaleDateString()}

Source Quote: ${quote.title}

Total: $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
${depositLine}
${balanceLine}

Payment Terms:
50% deposit due to schedule work, remaining balance due upon completion.

Scope Summary:
${quote.content}`;
}

export function attachTaskToProject(projectId: string, task: ProjectTask): void {
  const projects = getAllWorkspaceProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    ensureProjectCollections(project);
    project.tasks.push(task);
    project.updatedAt = new Date();

    project.activityFeed.push({
      id: `activity_${Date.now()}`,
      jobId: projectId,
      type: "document_added",
      title: `Task created: ${task.title}`,
      description: `Task attached to project`,
      metadata: { taskId: task.id },
      createdAt: new Date(),
    });

    localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));
  }
}

export function attachMaterialsToProject(projectId: string, materials: ProjectMaterial[]): void {
  const projects = getAllWorkspaceProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    ensureProjectCollections(project);
    project.materialsList.push(...materials);
    project.updatedAt = new Date();

    project.activityFeed.push({
      id: `activity_${Date.now()}`,
      jobId: projectId,
      type: "document_added",
      title: `Materials list created: ${materials.length} items`,
      description: `Materials list attached to project`,
      metadata: { count: materials.length },
      createdAt: new Date(),
    });

    localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));
  }
}

export function addChatMessage(projectId: string | undefined, message: ChatMessage): void {
  const projects = getAllWorkspaceProjects();

  if (projectId) {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      ensureProjectCollections(project);
      project.chatMemory.push({ ...message, projectId });
    }
  }

  // Also store globally for global chat
  const globalChat = localStorage.getItem("global_chat_memory");
  const chatHistory = globalChat ? JSON.parse(globalChat) : [];
  chatHistory.push(message);
  localStorage.setItem("global_chat_memory", JSON.stringify(chatHistory.slice(-100))); // Keep last 100
}

export function getProjectChatHistory(projectId: string): ChatMessage[] {
  const project = getWorkspaceProjectById(projectId);
  return project?.chatMemory || [];
}

export function getGlobalChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("global_chat_memory");
  return data ? JSON.parse(data) : [];
}

export function updateProjectLastAccessed(projectId: string): void {
  const projects = getAllWorkspaceProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    project.lastAccessedAt = new Date();
    localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));
  }
}

export function archiveProject(projectId: string): void {
  const projects = getAllWorkspaceProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    project.isArchived = true;
    project.status = "archived";
    project.updatedAt = new Date();
    localStorage.setItem(WORKSPACE_PROJECTS_KEY, JSON.stringify(projects));
  }
}

export function getRecentProjects(limit: number = 5): WorkspaceProject[] {
  const projects = getAllWorkspaceProjects();
  return projects
    .filter((p) => !p.isArchived)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, limit);
}

export function searchProjects(query: string): WorkspaceProject[] {
  const projects = getAllWorkspaceProjects();
  const lower = query.toLowerCase();
  return projects.filter(
    (p) =>
      p.title.toLowerCase().includes(lower) ||
      p.clientName.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower)
  );
}
