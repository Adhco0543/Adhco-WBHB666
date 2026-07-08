"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { convertQuoteToInvoice, getWorkspaceProjectById, getAllWorkspaceProjects } from "@/lib/workspaceActions";
import type { ProjectQuote, WorkspaceProject } from "@/lib/workspaceTypes";
import { colors, spacing } from "@/lib/designSystem";
import { ConversationSummaryPanel } from "@/components/ConversationSummaryPanel";
import { AISuggestionsPanel } from "@/components/AISuggestionsPanel";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { ExportShareMenu } from "@/components/ExportShareMenu";
import { ClientDatabaseBrowser } from "@/components/ClientDatabaseBrowser";

type TabId = "overview" | "quotes" | "invoices" | "tasks" | "materials" | "notes" | "clients" | "activity";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<WorkspaceProject | null>(null);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLoading, setIsLoading] = useState(true);

  const refreshProject = () => {
    const allProjects = getAllWorkspaceProjects();
    setProjects(allProjects);

    if (projectId) {
      const proj = getWorkspaceProjectById(projectId as string);
      setProject(proj);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshProject();
  }, [projectId]);

  const handleConvertQuoteToInvoice = (quoteId: string) => {
    const invoice = convertQuoteToInvoice(projectId, quoteId);
    if (invoice) {
      refreshProject();
      setActiveTab("invoices");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <h1>Project not found</h1>
        <Link href="/workspace/chat">
          <button style={{ marginTop: spacing[4], padding: spacing[3] }}>← Back to Chat</button>
        </Link>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "quotes", label: `Quotes (${project.quotes?.length || 0})`, icon: "💰" },
    { id: "invoices", label: `Invoices (${project.invoices?.length || 0})`, icon: "$" },
    { id: "tasks", label: `Tasks (${project.tasks?.length || 0})`, icon: "✅" },
    { id: "materials", label: `Materials (${project.materialsList?.length || 0})`, icon: "📦" },
    { id: "notes", label: `Notes (${project.notes?.length || 0})`, icon: "📝" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "activity", label: "Activity", icon: "⏱️" },
  ];

  const statusColors: Record<string, string> = {
    planning: colors.primary[400],
    active: colors.success || "#10b981",
    "on-hold": colors.warning || "#f59e0b",
    completed: colors.neutral[400],
    archived: colors.neutral[300],
  };

  return (
    <div className="workspace-shell" style={{ display: "flex", height: "100vh", backgroundColor: colors.neutral[50] }}>
      {/* Sidebar */}
      <div
        className="workspace-sidebar"
        style={{
          width: "250px",
          backgroundColor: colors.white,
          borderRight: `1px solid ${colors.neutral[200]}`,
          padding: spacing[6],
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link href="/workspace/chat" style={{ textDecoration: "none", marginBottom: spacing[6] }}>
          <button
            style={{
              width: "100%",
              padding: spacing[2],
              backgroundColor: colors.neutral[100],
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: colors.neutral[700],
            }}
          >
            ← Back to Projects
          </button>
        </Link>

        <h3 style={{ margin: 0, marginBottom: spacing[4], fontSize: "0.85rem", textTransform: "uppercase", color: colors.neutral[600] }}>
          Other Projects
        </h3>

        <div className="workspace-sidebar-list" style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing[2], overflowY: "auto" }}>
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/workspace/${proj.id}`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  width: "100%",
                  padding: spacing[2],
                  backgroundColor: proj.id === projectId ? colors.primary[50] : "transparent",
                  border: proj.id === projectId ? `1px solid ${colors.primary[300]}` : "1px solid transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  color: colors.neutral[700],
                  fontWeight: proj.id === projectId ? 600 : 400,
                }}
              >
                {proj.title}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="workspace-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          className="workspace-header"
          style={{
            padding: spacing[6],
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem", marginBottom: spacing[2] }}>{project.title}</h1>
            <p style={{ margin: 0, color: colors.neutral[600], marginBottom: spacing[3] }}>
              {project.clientName}
            </p>
            <div style={{ display: "flex", gap: spacing[3], alignItems: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: statusColors[project.status],
                  color: colors.white,
                }}
              >
                {project.status}
              </div>
              {project.budget && (
                <div style={{ fontSize: "0.9rem", color: colors.neutral[600] }}>
                  Budget: ${project.budget?.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <div className="workspace-actions" style={{ display: "flex", gap: spacing[2] }}>
            <button
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.neutral[100],
                border: "1px solid transparent",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              📝 Edit
            </button>
            <button
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[500],
                color: colors.white,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ↗️ Go to Chat
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="workspace-tabs"
          style={{
            display: "flex",
            gap: spacing[4],
            padding: `${spacing[4]} ${spacing[6]}`,
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              className="workspace-tab-button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? `2px solid ${colors.primary[500]}` : "2px solid transparent",
                color: activeTab === tab.id ? colors.primary[500] : colors.neutral[600],
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="workspace-content" style={{ flex: 1, overflowY: "auto", padding: spacing[6] }}>
          {activeTab === "overview" && <OverviewTab project={project} />}
          {activeTab === "quotes" && <QuotesTab project={project} onConvertQuote={handleConvertQuoteToInvoice} />}
          {activeTab === "invoices" && <InvoicesTab project={project} />}
          {activeTab === "tasks" && <TasksTab project={project} />}
          {activeTab === "materials" && <MaterialsTab project={project} />}
          {activeTab === "notes" && <NotesTab project={project} />}
          {activeTab === "clients" && <ClientsTab project={project} />}
          {activeTab === "activity" && <ActivityTab project={project} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ project }: { project: WorkspaceProject }) {
  return (
    <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[6] }}>
      {/* AI Suggestions */}
      <div style={{ gridColumn: "1 / -1" }}>
        <AISuggestionsPanel project={project} maxSuggestions={5} />
      </div>

      {/* Stats Grid */}
      <div style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ marginTop: 0, marginBottom: spacing[4] }}>Quick Stats</h2>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: spacing[4] }}>
          <StatCard icon="💰" label="Quotes" value={project.quotes?.length || 0} />
          <StatCard icon="$" label="Invoices" value={project.invoices?.length || 0} />
          <StatCard icon="✅" label="Tasks" value={project.tasks?.length || 0} />
          <StatCard icon="📦" label="Materials" value={project.materialsList?.length || 0} />
          <StatCard icon="📝" label="Notes" value={project.notes?.length || 0} />
        </div>
      </div>

      {/* Project Details */}
      <div className="workspace-card" style={{ backgroundColor: colors.white, padding: spacing[6], borderRadius: "8px", border: `1px solid ${colors.neutral[200]}` }}>
        <h3 style={{ marginTop: 0, marginBottom: spacing[4] }}>Project Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.description && (
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: colors.neutral[600], marginBottom: spacing[1] }}>
                Description
              </p>
              <p style={{ margin: 0, color: colors.neutral[900] }}>{project.description}</p>
            </div>
          )}
          {project.startDate && (
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: colors.neutral[600], marginBottom: spacing[1] }}>
                Start Date
              </p>
              <p style={{ margin: 0, color: colors.neutral[900] }}>
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {project.endDate && (
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: colors.neutral[600], marginBottom: spacing[1] }}>
                Due Date
              </p>
              <p style={{ margin: 0, color: colors.neutral[900] }}>
                {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Info */}
      <div className="workspace-card" style={{ backgroundColor: colors.white, padding: spacing[6], borderRadius: "8px", border: `1px solid ${colors.neutral[200]}` }}>
        <h3 style={{ marginTop: 0, marginBottom: spacing[4] }}>Budget</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.budget && (
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: colors.neutral[600], marginBottom: spacing[1] }}>
                Total Budget
              </p>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: colors.primary[500] }}>
                ${project.budget.toLocaleString()}
              </p>
            </div>
          )}
          {project.spent && (
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: colors.neutral[600], marginBottom: spacing[1] }}>
                Amount Spent
              </p>
              <p style={{ margin: 0, fontSize: "1.1rem", color: colors.neutral[900] }}>
                ${project.spent.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div
      className="stat-card"
      style={{
        backgroundColor: colors.white,
        padding: spacing[4],
        borderRadius: "8px",
        border: `1px solid ${colors.neutral[200]}`,
        textAlign: "center",
      }}
    >
      <div className="stat-card-icon" style={{ fontSize: "2rem", marginBottom: spacing[2] }}>{icon}</div>
      <div className="stat-card-value" style={{ fontSize: "2rem", fontWeight: 700, color: colors.primary[500], marginBottom: spacing[1] }}>
        {value}
      </div>
      <div style={{ fontSize: "0.85rem", color: colors.neutral[600] }}>{label}</div>
    </div>
  );
}

function QuotesTab({
  project,
  onConvertQuote,
}: {
  project: WorkspaceProject;
  onConvertQuote: (quoteId: string) => void;
}) {
  const hasInvoiceForQuote = (quote: ProjectQuote) =>
    Boolean(project.invoices?.some((invoice) => invoice.quoteId === quote.id));

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: spacing[4] }}>Quotes ({project.quotes?.length || 0})</h2>
      {(!project.quotes || project.quotes.length === 0) ? (
        <div style={{ backgroundColor: colors.neutral[50], padding: spacing[6], borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: colors.neutral[500] }}>No quotes yet. Ask the assistant to create one!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
          {project.quotes.map((quote) => (
            <div
              className="quote-card"
              key={quote.id}
              style={{
                backgroundColor: colors.white,
                padding: spacing[6],
                borderRadius: "8px",
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <div className="quote-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: spacing[4], marginBottom: spacing[4] }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: spacing[2] }}>{quote.title}</h3>
                  {quote.recipient && (
                    <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.9rem" }}>
                      To: {quote.recipient}
                    </p>
                  )}
                </div>
                <div className="quote-card-actions" style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
                  <div
                    style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: quote.status === "draft" ? colors.neutral[100] : colors.success + "20",
                      color: quote.status === "draft" ? colors.neutral[700] : colors.success,
                    }}
                  >
                    {quote.status}
                  </div>
                  <ExportShareMenu project={project} quote={quote} materials={project.materialsList} />
                  <button
                    onClick={() => onConvertQuote(quote.id)}
                    disabled={hasInvoiceForQuote(quote)}
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor: hasInvoiceForQuote(quote) ? colors.neutral[100] : colors.primary[500],
                      color: hasInvoiceForQuote(quote) ? colors.neutral[500] : colors.white,
                      border: "none",
                      borderRadius: "6px",
                      cursor: hasInvoiceForQuote(quote) ? "default" : "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hasInvoiceForQuote(quote) ? "Invoice created" : "Convert to invoice"}
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, color: colors.neutral[700], lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {quote.content.substring(0, 300)}...
              </p>
              {quote.amount && (
                <div style={{ marginTop: spacing[4], paddingTop: spacing[4], borderTop: `1px solid ${colors.neutral[200]}` }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: colors.primary[500] }}>
                    ${quote.amount.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoicesTab({ project }: { project: WorkspaceProject }) {
  const invoices = project.invoices || [];
  const openBalance = invoices
    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "void")
    .reduce((sum, invoice) => sum + invoice.balanceDue, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: spacing[4], marginBottom: spacing[4] }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: spacing[1] }}>Invoices ({invoices.length})</h2>
          <p style={{ margin: 0, color: colors.neutral[600] }}>
            Open balance: ${openBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div style={{ backgroundColor: colors.neutral[50], padding: spacing[6], borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: colors.neutral[500] }}>
            No invoices yet. Convert an approved quote from the Quotes tab.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
          {invoices.map((invoice) => (
            <div
              className="invoice-card"
              key={invoice.id}
              style={{
                backgroundColor: colors.white,
                padding: spacing[6],
                borderRadius: "8px",
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <div className="invoice-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: spacing[4], marginBottom: spacing[4] }}>
                <div>
                  <p style={{ margin: 0, marginBottom: spacing[1], fontSize: "0.85rem", color: colors.neutral[500], fontWeight: 700 }}>
                    {invoice.invoiceNumber}
                  </p>
                  <h3 style={{ margin: 0, marginBottom: spacing[2] }}>{invoice.title}</h3>
                  <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.9rem" }}>
                    To: {invoice.recipient || project.clientName}
                  </p>
                </div>
                <div
                  style={{
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: invoice.status === "paid" ? colors.success + "20" : colors.warning + "20",
                    color: invoice.status === "paid" ? colors.success : colors.warning,
                  }}
                >
                  {invoice.status}
                </div>
              </div>

              <div className="invoice-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: spacing[4], marginBottom: spacing[4] }}>
                <InvoiceMetric label="Total" value={`$${invoice.amount.toLocaleString()}`} />
                <InvoiceMetric label="Deposit" value={invoice.depositAmount ? `$${invoice.depositAmount.toLocaleString()}` : "TBD"} />
                <InvoiceMetric label="Balance" value={`$${invoice.balanceDue.toLocaleString()}`} />
                <InvoiceMetric label="Due" value={new Date(invoice.dueAt).toLocaleDateString()} />
              </div>

              <div style={{ borderTop: `1px solid ${colors.neutral[200]}`, paddingTop: spacing[4] }}>
                <p style={{ margin: 0, marginBottom: spacing[2], fontWeight: 700 }}>Payment terms</p>
                <p style={{ margin: 0, color: colors.neutral[700], lineHeight: 1.6 }}>
                  {invoice.paymentTerms}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoiceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: spacing[3], backgroundColor: colors.neutral[50], borderRadius: "8px" }}>
      <p style={{ margin: 0, marginBottom: spacing[1], fontSize: "0.8rem", color: colors.neutral[500], fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: colors.neutral[900] }}>{value}</p>
    </div>
  );
}

function TasksTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: spacing[4] }}>Tasks ({project.tasks?.length || 0})</h2>
      {(!project.tasks || project.tasks.length === 0) ? (
        <div style={{ backgroundColor: colors.neutral[50], padding: spacing[6], borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: colors.neutral[500] }}>No tasks yet. Ask the assistant to create one!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.tasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: colors.white,
                padding: spacing[4],
                borderRadius: "8px",
                border: `1px solid ${colors.neutral[200]}`,
                display: "flex",
                alignItems: "start",
                gap: spacing[4],
              }}
            >
              <input
                type="checkbox"
                checked={task.status === "completed"}
                readOnly
                style={{ marginTop: spacing[1], cursor: "pointer", width: "20px", height: "20px" }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, marginBottom: spacing[1], textDecoration: task.status === "completed" ? "line-through" : "none" }}>
                  {task.title}
                </h4>
                {task.description && (
                  <p style={{ margin: 0, fontSize: "0.9rem", color: colors.neutral[600], marginBottom: spacing[2] }}>
                    {task.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: spacing[3], fontSize: "0.85rem", color: colors.neutral[600] }}>
                  <span>🎯 {task.priority}</span>
                  {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialsTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[4] }}>
        <h2 style={{ margin: 0 }}>Materials ({project.materialsList?.length || 0})</h2>
        {project.materialsList && project.materialsList.length > 0 && (
          <ExportShareMenu project={project} materials={project.materialsList} />
        )}
      </div>
      {(!project.materialsList || project.materialsList.length === 0) ? (
        <div style={{ backgroundColor: colors.neutral[50], padding: spacing[6], borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: colors.neutral[500] }}>No materials lists yet. Ask the assistant to create one!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
          {project.materialsList.map((materials) => (
            <div
              className="materials-card"
              key={materials.id}
              style={{
                backgroundColor: colors.white,
                padding: spacing[6],
                borderRadius: "8px",
                border: `1px solid ${colors.neutral[200]}`,
              }}
            >
              <h3 style={{ margin: 0, marginBottom: spacing[4] }}>{materials.title}</h3>
              <div className="materials-table-wrap">
              <table className="materials-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.neutral[200]}` }}>
                    <th style={{ textAlign: "left", padding: spacing[2], fontWeight: 600, color: colors.neutral[600] }}>Item</th>
                    <th style={{ textAlign: "center", padding: spacing[2], fontWeight: 600, color: colors.neutral[600] }}>Qty</th>
                    <th style={{ textAlign: "center", padding: spacing[2], fontWeight: 600, color: colors.neutral[600] }}>Unit</th>
                    <th style={{ textAlign: "right", padding: spacing[2], fontWeight: 600, color: colors.neutral[600] }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${colors.neutral[100]}` }}>
                      <td style={{ padding: spacing[2] }}>{item.name}</td>
                      <td style={{ textAlign: "center", padding: spacing[2] }}>{item.quantity}</td>
                      <td style={{ textAlign: "center", padding: spacing[2] }}>{item.unit}</td>
                      <td style={{ textAlign: "right", padding: spacing[2] }}>
                        ${item.estimatedCost?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {materials.totalEstimatedCost && (
                <div style={{ marginTop: spacing[4], paddingTop: spacing[4], borderTop: `1px solid ${colors.neutral[200]}` }}>
                  <div style={{ textAlign: "right", fontSize: "1.1rem", fontWeight: 700 }}>
                    Total: ${materials.totalEstimatedCost.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesTab({ project }: { project: WorkspaceProject }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[6] }}>
      {/* Conversation Summary */}
      <div style={{ gridColumn: "1 / -1", marginBottom: spacing[4] }}>
        <ConversationSummaryPanel project={project} />
      </div>

      {/* Notes List */}
      <div style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ marginTop: 0, marginBottom: spacing[4] }}>Notes ({project.notes?.length || 0})</h2>
        {(!project.notes || project.notes.length === 0) ? (
          <div style={{ backgroundColor: colors.neutral[50], padding: spacing[6], borderRadius: "8px", textAlign: "center" }}>
            <p style={{ color: colors.neutral[500] }}>No notes yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
            {project.notes.map((note) => (
              <div
                className="note-card"
                key={note.id}
                style={{
                  backgroundColor: colors.white,
                  padding: spacing[6],
                  borderRadius: "8px",
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <h3 style={{ margin: 0, marginBottom: spacing[2] }}>{note.title}</h3>
                <p style={{ margin: 0, color: colors.neutral[700], lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientsTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: spacing[4] }}>Clients</h2>
      <div className="workspace-card" style={{ backgroundColor: colors.white, padding: spacing[6], borderRadius: "8px", border: `1px solid ${colors.neutral[200]}` }}>
        <ClientDatabaseBrowser maxClients={12} />
      </div>
    </div>
  );
}

function ActivityTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: spacing[4] }}>Activity Feed</h2>
      {(!project.activityFeed || project.activityFeed.length === 0) ? (
        <div style={{ backgroundColor: colors.neutral[50], padding: spacing[6], borderRadius: "8px", textAlign: "center" }}>
          <p style={{ color: colors.neutral[500] }}>No activity yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.activityFeed.slice().reverse().map((activity, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: colors.white,
                padding: spacing[4],
                borderRadius: "8px",
                border: `1px solid ${colors.neutral[200]}`,
                borderLeft: `4px solid ${colors.primary[500]}`,
              }}
            >
              <div className="activity-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing[2] }}>
                <h4 style={{ margin: 0 }}>{activity.title}</h4>
                <span style={{ fontSize: "0.8rem", color: colors.neutral[500] }}>
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
              {activity.description && (
                <p style={{ margin: 0, fontSize: "0.9rem", color: colors.neutral[600] }}>
                  {activity.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
