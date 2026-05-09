"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createOutput } from "@/lib/assistantActions";
import { getAllWorkspaceProjects, createWorkspaceProject, attachQuoteToProject, attachTaskToProject, attachMaterialsToProject, addChatMessage, getWorkspaceProjectById } from "@/lib/workspaceActions";
import type { OnboardingProfile } from "@/lib/assistantTypes";
import { parseDraftCommand, generateDraft, type GeneratedDraft, type DraftRequest } from "@/lib/draftGenerator";
import { DraftPreview } from "@/components/ui/DraftPreview";
import { ProjectAttachmentModal } from "@/components/ui/ProjectAttachmentModal";
import { QuoteBuilderChat } from "@/components/ui/QuoteBuilderChat";
import { colors, spacing } from "@/lib/designSystem";
import type { AttachmentPrompt, ProjectQuote, ProjectTask, ProjectMaterial } from "@/lib/workspaceTypes";

type Message = {
  role: "assistant" | "user";
  content: string;
  draft?: GeneratedDraft;
};

const roleOpeners: Record<string, string> = {
  business_owner: "I'll think like an operations assistant: clients, proposals, follow-ups, tasks, and business growth.",
  contractor: "I'll think like a job-site assistant: quotes, materials, labor, follow-ups, and job tracking.",
  stay_at_home_parent: "I'll think like a household assistant: routines, meals, appointments, budgeting, and reminders.",
  freelancer: "I'll think like a freelance assistant: clients, deadlines, invoices, projects, and follow-ups.",
  student: "I'll think like a study assistant: assignments, notes, deadlines, study plans, and exam prep.",
  other: "I'll adapt to your workflow and help organize tasks, reminders, planning, and next steps.",
};

function getGreeting(profile: OnboardingProfile | null) {
  const role = (profile?.role as keyof typeof roleOpeners) || "other";
  const businessName = profile?.businessName || "your work";

  return `Hi! I'm your ${businessName} assistant. ${roleOpeners[role] || roleOpeners.other}

**What I can help with:**
- 📧 Draft professional emails
- 💰 Create quotes and estimates
- 💼 Generate bids and proposals
- 🧾 Build invoices
- 📋 Organize tasks and reminders
- 📦 Build materials lists
- 💡 Get business advice

**Try saying:**
- "Send an email to John about the barn project"
- "Create a quote for 8 hours of work at $50/hr"
- "Draft an invoice to Sarah for this week's services"`;
}

function WorkspaceChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<GeneratedDraft | null>(null);
  
  // Workspace-specific state
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentPrompt, setAttachmentPrompt] = useState<AttachmentPrompt | null>(null);
  const [pendingAttachmentData, setPendingAttachmentData] = useState<any>(null);
  
  // New project modal state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  
  // Guided quote builder state
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profile
  useEffect(() => {
    const savedProfile = localStorage.getItem("onboarding_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed as OnboardingProfile);
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  // Load projects and current project
  useEffect(() => {
    const allProjects = getAllWorkspaceProjects();
    setProjects(allProjects);

    if (projectId) {
      const proj = getWorkspaceProjectById(projectId);
      setCurrentProject(proj);
    }
  }, [projectId]);

  // Initialize messages
  useEffect(() => {
    if (!profile) return;
    
    if (currentProject?.chatMemory && currentProject.chatMemory.length > 0) {
      setMessages(currentProject.chatMemory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })));
    } else {
      setMessages([{
        role: "assistant",
        content: getGreeting(profile),
      }]);
    }
  }, [profile, currentProject]);

  // Save messages
  useEffect(() => {
    if (!profile || messages.length === 0) return;
    
    if (currentProject) {
      messages.forEach((msg) => {
        addChatMessage(currentProject.id, {
          role: msg.role,
          content: msg.content,
          projectId: currentProject.id,
          timestamp: new Date(),
        });
      });
    }
  }, [messages, profile, currentProject]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const draftRequest = detectDraftCommand(input);

      if (draftRequest) {
        const draft = generateDraft(draftRequest, profile);
        setPendingDraft(draft);

        const assistantMessage: Message = {
          role: "assistant",
          content: `I've created a ${draft.type} draft for you. Review it below and let me know if you'd like to make any changes.`,
          draft,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Trigger attachment modal after short delay
        setTimeout(() => {
          setAttachmentPrompt({
            type: draft.type as any,
            title: draft.title,
            preview: draft.preview,
            projectId: currentProject?.id,
            showCreateNew: true,
          });
          setPendingAttachmentData(draft);
          setShowAttachmentModal(true);
        }, 500);
      } else {
        const chatHistory = [...messages, userMessage].slice(-12);
        const apiResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            history: chatHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            profile,
            currentTask: currentProject
              ? `General question in project workspace: ${currentProject.title}`
              : "General question",
          }),
        });

        if (!apiResponse.ok) {
          throw new Error("Chat API failed");
        }

        const data = await apiResponse.json() as { response?: string };
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response || "I can answer that, but I need a little more detail first.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I can answer general questions, but the AI provider is not responding right now. Check that your Anthropic or Groq API key is valid, or start Ollama locally with `ollama serve`.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachToProject = (projectId: string) => {
    if (!pendingAttachmentData) return;

    const data = pendingAttachmentData;
    const project = getWorkspaceProjectById(projectId);
    
    if (project) {
      // Handle quote builder generated quote
      if (data.quote && data.materials) {
        // Update projectId before attaching
        const quoteWithProjectId = { ...data.quote, projectId };
        const materialsWithProjectId = [{ ...data.materials, projectId }];
        attachQuoteToProject(projectId, quoteWithProjectId);
        attachMaterialsToProject(projectId, materialsWithProjectId);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `✅ Quote and materials list attached to **${project.title}**!\n\nYou can view them in the project workspace.`,
        }]);
      } else {
        // Handle regular draft
        const draft = data;
        if (draft.type === "quote") {
          attachQuoteToProject(projectId, {
            id: `quote_${Date.now()}`,
            projectId,
            title: draft.title,
            content: draft.content,
            recipient: draft.recipient,
            status: "draft",
            createdAt: new Date(),
            createdFrom: "assistant",
          } as ProjectQuote);
        }
      }

      if (!data.quote) {
        // Only set message for non-quote items
        const draft = data;
        if (draft.type === "task") {
        attachTaskToProject(projectId, {
          id: `task_${Date.now()}`,
          projectId,
          title: draft.title,
          description: draft.content,
          status: "pending",
          priority: "medium",
          createdAt: new Date(),
          createdFrom: "assistant",
        } as ProjectTask);
      } else if (draft.type === "email" || draft.type === "invoice") {
            // Handle these similarly
          }

          setMessages((prev) => [...prev, {
            role: "assistant",
            content: `✅ ${draft.type.toUpperCase()} attached to **${project.title}**!\n\nYou can view it in the project workspace.`,
          }]);
        }
      }

    setShowAttachmentModal(false);
    setPendingAttachmentData(null);
    setPendingDraft(null);
  };

  const handleCreateNewProject = (projectTitle: string) => {
    const newProject = createWorkspaceProject(projectTitle, "New Client");
    setProjects((prev) => [...prev, newProject]);
    
    if (pendingAttachmentData) {
      handleAttachToProject(newProject.id);
    }

    setShowAttachmentModal(false);
  };

  function detectDraftCommand(input: string): DraftRequest | null {
    return parseDraftCommand(input);
  }

  const handleQuoteGenerated = (quote: any, materials: any) => {
    // Show attachment modal with the generated quote and materials
    setAttachmentPrompt({
      type: "quote",
      title: quote.title,
      preview: quote.content.substring(0, 200) + "...",
      projectId: currentProject?.id,
      showCreateNew: true,
    });
    setPendingAttachmentData({ quote, materials });
    setShowAttachmentModal(true);
    setShowQuoteBuilder(false);

    // Add system message
    setMessages((prev) => [...prev, {
      role: "assistant",
      content: `✅ Quote generated with ${quote.amount ? `$${quote.amount.toLocaleString()}` : ''} total estimate and ${materials.items.length} material items. Would you like to attach this to a project?`,
    }]);
  };

  return (
    <div className="chat-shell" style={{ display: "flex", height: "100vh", backgroundColor: colors.neutral[50] }}>
      {/* Projects Sidebar */}
      <div className="chat-sidebar" style={{ width: "280px", backgroundColor: colors.white, borderRight: `1px solid ${colors.neutral[200]}`, padding: spacing[4], display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: 0, marginBottom: spacing[4] }}>📂 Projects</h3>
        
        <div className="chat-project-list" style={{ flex: 1, overflowY: "auto", marginBottom: spacing[4] }}>
          {projects.map((proj) => (
            <Link key={proj.id} href={`/workspace/chat?project_id=${proj.id}`} style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%",
                  padding: spacing[3],
                  marginBottom: spacing[2],
                  border: currentProject?.id === proj.id ? `2px solid ${colors.primary[500]}` : "1px solid transparent",
                  backgroundColor: currentProject?.id === proj.id ? colors.primary[50] : "transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                  color: colors.neutral[900],
                  fontWeight: currentProject?.id === proj.id ? 600 : 400,
                }}
              >
                {proj.title}
              </button>
            </Link>
          ))}
        </div>

        <button
          style={{
            width: "100%",
            padding: spacing[3],
            backgroundColor: colors.primary[500],
            color: colors.white,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => {
            setShowNewProjectModal(true);
            setNewProjectName("");
          }}
        >
          + New Project
        </button>

        {currentProject && (
          <Link href={`/workspace/${currentProject.id}`} style={{ textDecoration: "none", marginTop: spacing[4] }}>
            <button
              style={{
                width: "100%",
                padding: spacing[2],
                backgroundColor: colors.neutral[100],
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              → Open Workspace
            </button>
          </Link>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-main" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="chat-header" style={{ padding: spacing[4], backgroundColor: colors.white, borderBottom: `1px solid ${colors.neutral[200]}` }}>
          <h1 className="chat-title" style={{ margin: 0, fontSize: "1.5rem" }}>
            🤖 {currentProject ? `Chat - ${currentProject.title}` : "Workspace Chat"}
          </h1>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: spacing[6], display: "flex", flexDirection: "column", gap: spacing[4] }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                pointerEvents: "none",
              }}
            >
              <div
                className="chat-bubble"
                style={{
                  maxWidth: "70%",
                  padding: spacing[4],
                  borderRadius: "8px",
                  backgroundColor: msg.role === "user" ? colors.primary[500] : colors.white,
                  color: msg.role === "user" ? colors.white : colors.neutral[900],
                  border: msg.role === "assistant" ? `1px solid ${colors.neutral[200]}` : "none",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {pendingDraft && (
            <DraftPreview
              draft={pendingDraft}
              onSave={() => {
                setShowAttachmentModal(true);
              }}
              onEdit={() => {}}
              onDiscard={() => setPendingDraft(null)}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-panel" style={{ padding: spacing[4], backgroundColor: colors.white, borderTop: `1px solid ${colors.neutral[200]}` }}>
          {showQuoteBuilder ? (
            <div>
              <div style={{ marginBottom: spacing[3] }}>
                <button
                  onClick={() => setShowQuoteBuilder(false)}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: colors.neutral[200],
                    color: colors.neutral[900],
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  ← Back to Chat
                </button>
              </div>
              <QuoteBuilderChat
                onQuoteGenerated={handleQuoteGenerated}
                onCancel={() => setShowQuoteBuilder(false)}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
              <div className="chat-input-row" style={{ display: "flex", gap: spacing[3] }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask me to create a quote, task, materials list, or anything else..."
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    border: `1px solid ${colors.neutral[300]}`,
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "1rem",
                    resize: "none",
                    minHeight: "60px",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: input.trim() && !isLoading ? colors.primary[500] : colors.neutral[300],
                    color: colors.white,
                    border: "none",
                    borderRadius: "8px",
                    cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    alignSelf: "flex-end",
                    minWidth: "100px",
                  }}
                >
                  Send
                </button>
              </div>
              <button
                onClick={() => setShowQuoteBuilder(true)}
                style={{
                  width: "100%",
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: colors.accent.emerald,
                  color: colors.white,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                💰 Start Guided Quote
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attachment Modal */}
      {showAttachmentModal && attachmentPrompt && (
        <ProjectAttachmentModal
          prompt={attachmentPrompt}
          existingProjects={projects.filter((p) => !p.isArchived).map((p) => ({ id: p.id, title: p.title }))}
          onAttach={handleAttachToProject}
          onCreate={handleCreateNewProject}
          onSkip={() => {
            setShowAttachmentModal(false);
            setPendingAttachmentData(null);
          }}
        />
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNewProjectModal(false)}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: colors.white,
              borderRadius: "12px",
              padding: spacing[6],
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: spacing[4] }}>Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newProjectName.trim()) {
                  const proj = createWorkspaceProject(newProjectName, "New Client");
                  setProjects((prev) => [...prev, proj]);
                  setShowNewProjectModal(false);
                  setNewProjectName("");
                }
              }}
              placeholder="Project name (e.g., Kitchen Remodel)"
              autoFocus
              style={{
                width: "100%",
                padding: spacing[3],
                border: `1px solid ${colors.neutral[300]}`,
                borderRadius: "8px",
                fontSize: "1rem",
                marginBottom: spacing[4],
                boxSizing: "border-box",
              }}
            />
            <div className="modal-actions" style={{ display: "flex", gap: spacing[3], justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowNewProjectModal(false)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[100],
                  border: "1px solid transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: colors.neutral[700],
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newProjectName.trim()) {
                    const proj = createWorkspaceProject(newProjectName, "New Client");
                    setProjects((prev) => [...prev, proj]);
                    setShowNewProjectModal(false);
                    setNewProjectName("");
                  }
                }}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: newProjectName.trim() ? colors.primary[500] : colors.neutral[300],
                  border: "none",
                  borderRadius: "8px",
                  cursor: newProjectName.trim() ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  color: colors.white,
                }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkspaceChat() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>}>
      <WorkspaceChatContent />
    </Suspense>
  );
}
