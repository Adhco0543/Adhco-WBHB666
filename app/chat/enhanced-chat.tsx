"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createOutput, createTask } from "@/lib/assistantActions";
import { getJobById, addActivity } from "@/lib/jobActions";
import type { OnboardingProfile, Task } from "@/lib/assistantTypes";
import type { Job } from "@/lib/jobTypes";
import {
  parseDraftCommand,
  generateDraft,
  type GeneratedDraft,
  type DraftRequest,
} from "@/lib/draftGenerator";
import { DraftPreview, DraftSuggestion } from "@/components/ui/DraftPreview";
import { colors, spacing } from "@/lib/designSystem";

type Message = {
  role: "assistant" | "user";
  content: string;
  draft?: GeneratedDraft;
};

const roleOpeners: Record<string, string> = {
  business_owner:
    "I'll think like an operations assistant: clients, proposals, follow-ups, tasks, and business growth.",
  contractor:
    "I'll think like a job-site assistant: quotes, materials, labor, follow-ups, and job tracking.",
  stay_at_home_parent:
    "I'll think like a household assistant: routines, meals, appointments, budgeting, and reminders.",
  freelancer:
    "I'll think like a freelance assistant: clients, deadlines, invoices, projects, and follow-ups.",
  student:
    "I'll think like a study assistant: assignments, notes, deadlines, study plans, and exam prep.",
  other:
    "I'll adapt to your workflow and help organize tasks, reminders, planning, and next steps.",
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

/**
 * Parse user input for draft commands
 * This is the key function that detects draft requests
 */
function detectDraftCommand(input: string): DraftRequest | null {
  return parseDraftCommand(input);
}

export default function EnhancedChatContent() {
  const searchParams = useSearchParams();
  const task = searchParams.get("task") || "chat";
  const taskName = searchParams.get("name");
  const jobId = searchParams.get("job_id");

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<GeneratedDraft | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load profile
  useEffect(() => {
    const savedProfile = localStorage.getItem("onboarding_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed as OnboardingProfile);
      } catch (e) {
        console.error("Failed to parse profile", e);
        // Fallback to default profile
        setProfile({
          id: "default-profile",
          role: "general_contractor",
          businessName: "My Business",
          businessType: "Construction",
          yearsInBusiness: 1,
          specializations: [],
          completedAt: new Date().toISOString(),
        });
      }
    } else {
      // No saved profile - use default for demo
      setProfile({
        id: "default-profile",
        role: "general_contractor",
        businessName: "My Business",
        businessType: "Construction",
        yearsInBusiness: 1,
        specializations: [],
        completedAt: new Date().toISOString(),
      });
    }
  }, []);

  // Load job if job_id provided
  useEffect(() => {
    if (jobId) {
      const loadedJob = getJobById(jobId);
      console.log("Job loading effect triggered:", { jobId, jobLoaded: !!loadedJob, job: loadedJob ? { id: loadedJob.id, title: loadedJob.title } : null });
      if (loadedJob) {
        setJob(loadedJob);
      }
    }
  }, [jobId]);

  // Initialize messages
  useEffect(() => {
    if (!profile) return;

    const memoryKey = `assistant_chat_memory_${profile.role}`;
    const saved = localStorage.getItem(memoryKey);

    if (saved && JSON.parse(saved).length > 0) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          role: "assistant",
          content: getGreeting(profile),
        },
      ]);
    }
  }, [profile]);

  // Save messages to localStorage
  useEffect(() => {
    if (!profile || messages.length === 0) return;
    const memoryKey = `assistant_chat_memory_${profile.role}`;
    localStorage.setItem(memoryKey, JSON.stringify(messages));
  }, [messages, profile]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setInput("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !profile) return;

    const userText = input.trim();
    const userMessage: Message = {
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if this is a draft command
      const draftRequest = detectDraftCommand(userText);

      if (draftRequest) {
        // Generate a professional draft
        const draft = generateDraft(draftRequest, profile);
        setPendingDraft(draft);

        const response = `I've created a ${draft.type} draft for you based on your request. Review it below and let me know if you'd like to make any changes.`;

        const assistantMessage: Message = {
          role: "assistant",
          content: response,
          draft,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Regular conversation - just add to chat
        const assistantMessage: Message = {
          role: "assistant",
          content: `I received your message: "${userText}"

Here are some things I can help with:
- **📧 Emails:** "Send an email to [name] about [topic]"
- **💰 Quotes:** "Create a quote for [details]"
- **🧾 Invoices:** "Draft an invoice for [customer]"
- **💼 Bids:** "Write a bid for [project]"
- **📋 Tasks:** "Create a task: [description]"

What would you like to do?`,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error in chat:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "I had trouble processing your request. Please try again or rephrase your message.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = (draft: GeneratedDraft) => {
    // DEBUG: Log to localStorage for inspection
    const debug: any = {
      timestamp: new Date().toISOString(),
      action: "handleSaveDraft called",
      jobId,
      draftType: draft.type,
    };
    const debugLog = JSON.parse(localStorage.getItem("debug_log") || "[]");
    debugLog.push(debug);
    localStorage.setItem("debug_log", JSON.stringify(debugLog.slice(-10))); // Keep last 10

    // Save to outputs
    createOutput(draft.type as any, draft.title, draft.content, {
      customerName: draft.recipient || "Unknown",
      projectName: draft.title,
    });

    // Log activity to job if this is a job-linked chat
    // FIX: Refetch job directly instead of relying on state that might not be loaded yet
    if (jobId) {
      const currentJob = getJobById(jobId);
      debug.jobFound = !!currentJob;
      if (currentJob) {
        debug.activityAdded = "attempting";
        addActivity(jobId, {
          type: "document_added",
          title: `${draft.type.toUpperCase()} created: ${draft.title}`,
          description: `${draft.type} for ${draft.recipient || "client"}`,
          metadata: { draftType: draft.type, recipient: draft.recipient },
        });
        debug.activityAdded = "success";
      } else {
        debug.jobFound = false;
      }
    }
    debugLog.push(debug);
    localStorage.setItem("debug_log", JSON.stringify(debugLog.slice(-10)));

    setPendingDraft(null);

    // Use the refetched job for the message
    const currentJob = jobId ? getJobById(jobId) : null;
    const jobMessage = currentJob ? ` and logged to **${currentJob.title}**` : "";
    const confirmation: Message = {
      role: "assistant",
      content: `✅ **${draft.type.toUpperCase()} Saved!**

Your ${draft.type} draft has been saved to your Outputs${jobMessage}. You can:
- View it in the Outputs section
- Edit it anytime
- Send it when ready

What else can I help with?`,
    };

    setMessages((prev) => [...prev, confirmation]);
  };

  const handleDiscardDraft = () => {
    setPendingDraft(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: colors.neutral[50],
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.neutral[200]}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
            🤖 AI Assistant
          </h1>
          {job && (
            <p
              style={{
                margin: `${spacing[1]} 0 0 0`,
                fontSize: "0.9rem",
                color: colors.primary[600],
                fontWeight: 600,
              }}
            >
              📋 Working on: {job.title}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing[2] }}>
          {job && (
            <Link href={`/jobs/${job.id}`}>
              <button
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: colors.primary[500],
                  color: colors.white,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                📋 View Job
              </button>
            </Link>
          )}
          <Link href="/dashboard">
            <button
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.neutral[100],
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: spacing[6],
          display: "flex",
          flexDirection: "column",
          gap: spacing[4],
          pointerEvents: "none",
        }}
      >
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
              style={{
                maxWidth: "min(85%, 600px)",
                padding: spacing[4],
                borderRadius: "8px",
                backgroundColor:
                  msg.role === "user" ? colors.primary[500] : colors.white,
                color: msg.role === "user" ? colors.white : colors.neutral[900],
                border:
                  msg.role === "assistant"
                    ? `1px solid ${colors.neutral[200]}`
                    : "none",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Draft Preview */}
        {pendingDraft && (
          <DraftPreview
            draft={pendingDraft}
            onSave={handleSaveDraft}
            onEdit={() => {}}
            onDiscard={handleDiscardDraft}
          />
        )}

        {isLoading && (
          <div style={{ display: "flex", gap: spacing[2], alignItems: "center" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors.primary[500],
                animation: "bounce 1.4s infinite",
              }}
            />
            <span style={{ color: colors.neutral[500], fontSize: "0.9rem" }}>
              Generating draft...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.white,
          borderTop: `1px solid ${colors.neutral[200]}`,
          display: "flex",
          gap: spacing[3],
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message or describe what you need (e.g., 'send an email to john about...')"
          style={{
            flex: 1,
            padding: spacing[3],
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: "6px",
            fontFamily: "inherit",
            fontSize: "0.95rem",
            resize: "none",
            minHeight: "50px",
            maxHeight: "120px",
          }}
        />

        <div style={{ display: "flex", gap: spacing[2], flexDirection: "column" }}>
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.primary[500],
              color: colors.white,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 150ms ease",
              opacity: isLoading || !input.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>

          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: isListening ? colors.error : colors.neutral[200],
              color: isListening ? colors.white : colors.neutral[700],
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 150ms ease",
            }}
          >
            {isListening ? "🛑 Stop" : "🎤 Speak"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          40% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}
