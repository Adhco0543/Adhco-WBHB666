"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { OnboardingData } from "@/lib/onboarding";
import { saveOutput, saveTask, type SavedOutput, type Task } from "@/lib/assistantMemory";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const roleOpeners: Record<string, string> = {
  contractor:
    "I'll think like a job-site assistant: quotes, materials, labor, follow-ups, and job tracking.",
  business_owner:
    "I'll think like an operations assistant: clients, proposals, follow-ups, tasks, and business growth.",
  stay_at_home_parent:
    "I'll think like a household assistant: routines, meals, appointments, budgeting, and reminders.",
  freelancer:
    "I'll think like a freelance assistant: clients, deadlines, invoices, projects, and follow-ups.",
  student:
    "I'll think like a study assistant: assignments, notes, deadlines, study plans, and exam prep.",
  other:
    "I'll adapt to your workflow and help organize tasks, reminders, planning, and next steps."
};

function getTaskPrompt(task: string, taskName: string | null, profile: OnboardingData | null) {
  const role = profile?.role || "other";
  const businessName = profile?.businessName || "your work";

  if (taskName) {
    return `Let's work on: ${taskName}. ${roleOpeners[role] || roleOpeners.other}`;
  }

  if (task === "quote") {
    return `Let's build a quote for ${businessName}. Send me the customer name, job type, location, scope, materials, labor estimate, and deadline if you have one.`;
  }

  if (task === "materials") {
    return `Let's make a materials list. Send me the project type, measurements, quantities, and preferred materials.`;
  }

  if (task === "email") {
    return `Let's draft an email. Who is it for, what do you need to say, and what tone should it have?`;
  }

  if (task === "task") {
    return `Let's organize a task. What needs to be done, who is it for, and when is it due?`;
  }

  return `${roleOpeners[role] || roleOpeners.other} Tell me what you want help with.`;
}

function generateQuote(input: string, profile: OnboardingData | null) {
  const businessName = profile?.businessName || "Your Business";

  return `QUOTE DRAFT

Business: ${businessName}
Prepared for: [Customer name]
Project: [Project / job type]
Location: [Job location]

Scope of Work:
${input}

Materials & Labor:
[Details from your input]

Total Estimate: $[Amount]
Valid Until: [Date, typically 30 days]

Next Steps:
1. Review with client
2. Adjust if needed
3. Send for approval`;
}

function generateMaterialsList(input: string) {
  return `MATERIALS LIST DRAFT

Project: [From your input]

Materials:
${input}

Supplier Recommendations:
[Based on your project type]

Estimated Total Cost: $[Amount]
Delivery Time: [Typical timeframe]

Next Steps:
1. Get quotes from suppliers
2. Confirm delivery dates
3. Order when ready`;
}

function generateEmail(input: string, profile: OnboardingData | null) {
  const businessName = profile?.businessName || "Your Business";

  return `EMAIL DRAFT

Subject: [Suggested subject based on: ${input.substring(0, 30)}...]

---

Hi [Recipient name],

[Opening based on your details: ${input}]

[Body with key points and call-to-action]

Best regards,
${businessName}

---

Send this? Make any edits above before sending.`;
}

function generateTask(input: string) {
  return `TASK CREATED

Title: ${input.substring(0, 50)}...
Status: To Do
Priority: [Based on context]
Due Date: [From your input if specified]

Description:
${input}

Checklist:
[ ] Start
[ ] Progress
[ ] Complete

Next Steps:
1. Add to calendar
2. Set reminders
3. Track progress`;
}

function generateReply(input: string, history: Message[], profile: OnboardingData | null, currentTask: string): { response: string; task?: Task } | null {
  const lower = input.toLowerCase();
  const memory = history.map((m) => m.content.toLowerCase()).join(" ");

  // ============================================================================
  // Pattern 1: Dimensions Follow-up (after materials discussion)
  // ============================================================================
  const gaveDimensions =
    /\d+\s?(ft|feet|in|inch|inches|'|")/i.test(input) ||
    /\d+\s?x\s?\d+/i.test(input) ||
    lower.includes("wide") ||
    lower.includes("long") ||
    lower.includes("tall") ||
    lower.includes("dimensions");

  const wasBuildingMaterials =
    memory.includes("materials list") ||
    memory.includes("measurements") ||
    memory.includes("shopping-ready list") ||
    memory.includes("project details");

  if (wasBuildingMaterials && gaveDimensions) {
    return {
      response: `Perfect — now I can turn that into a usable next step.

SHOPPING LIST DRAFT

Based on your dimensions:
${input}

Materials to check:
- Primary material sized to fit the project
- Framing or support material if needed
- Fasteners: screws, nails, brackets, anchors
- Finish materials: paint, stain, sealant, trim, or edge pieces
- Safety supplies: gloves, glasses, masks if cutting or sanding
- Cleanup supplies: bags, shop towels, scraper, broom

Next questions to tighten this list:
1. What exactly are we building or repairing?
2. Is it indoor or outdoor?
3. What material do you prefer?
4. Do you want this priced as budget, standard, or premium?`
    };
  }

  // ============================================================================
  // Pattern 2: Customer Info → Quote Draft
  // ============================================================================
  // Much simpler: if user mentions "quote" or "estimate", generate it
  const hasQuoteKeyword = lower.includes("quote") || lower.includes("estimate") || lower.includes("pricing");
  
  if (hasQuoteKeyword || (currentTask === "quote" && input.length > 10)) {
    const businessName = profile?.businessName || "Your Business";
    return {
      response: `Got it! Here's a quote draft based on what you provided:

QUOTE DRAFT

Business: ${businessName}
Prepared for: [Customer name]
Project: [From your input]
Location: [Job location]

Scope of Work:
${input}

Materials & Labor:
[Refine with specific materials and labor costs]

Total Estimate: $[Amount]
Valid Until: [Date, typically 30 days]

Next Steps:
1. Review estimate details above
2. Get materials pricing confirmed
3. Send to customer for approval
4. Schedule follow-up for questions`,
      task: {
        id: crypto.randomUUID(),
        title: `Follow up on quote draft`,
        description: `Review and send quote draft to customer`,
        status: "pending",
        priority: "high",
        type: "quote_followup",
        createdAt: new Date().toISOString()
      }
    };
  }

  // ============================================================================
  // Pattern 3: Email Details → Email Draft
  // ============================================================================
  // Simple: if user mentions "email" or "send", generate email draft
  const hasEmailKeyword = lower.includes("email") || lower.includes("send") || lower.includes("message");

  if ((hasEmailKeyword || currentTask === "email") && input.length > 10) {
    const businessName = profile?.businessName || "Your Business";
    return {
      response: `Perfect! Here's an email draft ready to send:

EMAIL DRAFT

Subject: [Suggested subject based on: ${input.substring(0, 40)}...]

---

Hi [Recipient name],

${input}

[Add any additional details or call-to-action]

Best regards,
${businessName}

---

Ready to send? You can copy this, make any edits, and send when ready.`
    };
  }

  // ============================================================================
  // Pattern 4: Due Date → Task/Reminder
  // ============================================================================
  // Simple: if user mentions "task", "remind", "reminder", or "schedule", create task
  const hasTaskKeyword = lower.includes("task") || lower.includes("remind") || lower.includes("reminder") || lower.includes("schedule") || lower.includes("todo");

  if ((hasTaskKeyword || currentTask === "task") && input.length > 10) {
    const dueDate = input.match(/\d+-\d+-\d+|\d+\/\d+/)?.[0] || "To be confirmed";
    return {
      response: `Great! I've noted this task with the due date.

TASK CREATED

Title: ${input.substring(0, 50)}...
Status: To Do
Priority: [Based on timing]
Due Date: ${dueDate}

Description:
${input}

Checklist:
[ ] Prepare
[ ] Execute
[ ] Complete
[ ] Follow up

Next Steps:
1. Add to calendar
2. Set reminders
3. Track progress`,
      task: {
        id: crypto.randomUUID(),
        title: input.substring(0, 50),
        description: input,
        dueDate: dueDate,
        status: "pending",
        priority: /urgent|asap|critical|high/i.test(input) ? "high" : /important|medium/i.test(input) ? "medium" : "low",
        type: "task_reminder",
        createdAt: new Date().toISOString()
      }
    };
  }

  // ============================================================================
  // Pattern 5: Materials Task Context
  // ============================================================================
  // Simple: if user mentions "materials", "supplies", or "shopping", generate materials list
  const hasMaterialsKeyword = lower.includes("materials") || lower.includes("supplies") || lower.includes("shopping") || lower.includes("equipment");

  if ((hasMaterialsKeyword || currentTask === "materials") && input.length > 10) {
    return {
      response: `Great! Here's a materials list draft based on what you provided:

MATERIALS LIST DRAFT

Project: [From your input]

Materials:
${input}

Supplier Recommendations:
[Based on your project type]

Estimated Total Cost: $[Amount]
Delivery Time: [Typical timeframe]

Next Steps:
1. Get quotes from suppliers
2. Confirm delivery dates
3. Order when ready

Need quantities or specific measurements? Just provide those details and I'll refine this list.`
    };
  }

  // If no local logic matches, return null to fallback to API
  return null;
}

export default function ChatContent() {
  const searchParams = useSearchParams();
  const task = searchParams.get("task") || "chat";
  const taskName = searchParams.get("name");

  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("onboarding_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const openingMessage = useMemo(
    () => getTaskPrompt(task, taskName, profile),
    [task, taskName, profile]
  );

  useEffect(() => {
    const memoryKey = `assistant_chat_memory_${profile?.role || "general"}`;
    const saved = localStorage.getItem(memoryKey);

    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: "assistant", content: openingMessage }]);
    }
  }, [openingMessage, profile?.role]);

  useEffect(() => {
    if (!profile || messages.length === 0) return;
    const memoryKey = `assistant_chat_memory_${profile.role || "general"}`;
    localStorage.setItem(memoryKey, JSON.stringify(messages));
  }, [messages, profile]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setInput((prev) => prev + transcript + " ");
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
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
      setInput(""); // Clear input to start fresh
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();

    const userMessage: Message = {
      role: "user",
      content: userText
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try local generateReply first
      const localResult = generateReply(userText, messages, profile, task);
      
      if (localResult) {
        // Use local response
        const assistantMessage: Message = {
          role: "assistant",
          content: localResult.response
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save output if it's a draft
        if (localResult.response.includes("SHOPPING LIST DRAFT")) {
          saveOutput({
            id: crypto.randomUUID(),
            type: "materials",
            title: "Shopping List Draft",
            content: localResult.response,
            createdAt: new Date().toISOString()
          });
        } else if (localResult.response.includes("QUOTE DRAFT")) {
          saveOutput({
            id: crypto.randomUUID(),
            type: "quote",
            title: "Quote Draft",
            content: localResult.response,
            createdAt: new Date().toISOString()
          });
        } else if (localResult.response.includes("EMAIL DRAFT")) {
          saveOutput({
            id: crypto.randomUUID(),
            type: "email",
            title: "Email Draft",
            content: localResult.response,
            createdAt: new Date().toISOString()
          });
        } else if (localResult.response.includes("TASK CREATED")) {
          saveOutput({
            id: crypto.randomUUID(),
            type: "task",
            title: "Task Created",
            content: localResult.response,
            createdAt: new Date().toISOString()
          });
        }

        // Save associated task if provided
        if (localResult.task) {
          saveTask(localResult.task);
        }

        setIsLoading(false);
        return;
      }

      // Fallback to API if local logic doesn't match
      let response;
      try {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            history: messages,
            profile,
            currentTask: task
          })
        });

        if (!response.ok) {
          // Check if it's a connection error (Ollama not running)
          if (response.status >= 500) {
            throw new Error(
              "Can't reach the AI service. To enable chat responses, please start Ollama in a terminal:\n\n$ ollama serve\n\nFor now, try asking about quotes, emails, materials, or tasks - those work locally without Ollama!"
            );
          }
          throw new Error("Failed to get response from API");
        }
      } catch (error) {
        if (error instanceof TypeError) {
          // Network error - likely Ollama not running
          throw new Error(
            "Can't reach the AI service. To enable open-ended chat, please start Ollama:\n\n$ ollama serve\n\nQuotes, emails, materials, and tasks work without it!"
          );
        }
        throw error;
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response
      };

      // Store state info for future reference
      if (data.state) {
        const stateKey = `assistant_state_${profile?.role || "general"}`;
        localStorage.setItem(stateKey, JSON.stringify(data.state));
      }

      setMessages((prev) => [...prev, assistantMessage]);

      // Save output if it's a draft
      if (
        data.response.includes("QUOTE DRAFT") ||
        data.response.includes("MATERIALS LIST DRAFT") ||
        data.response.includes("EMAIL DRAFT") ||
        data.response.includes("TASK CREATED")
      ) {
        let outputType: "quote" | "materials" | "email" | "task" | "note" = "note";
        let title = "Assistant Output";

        if (data.response.includes("QUOTE DRAFT")) {
          outputType = "quote";
          title = "Quote Draft";
        } else if (data.response.includes("MATERIALS LIST DRAFT")) {
          outputType = "materials";
          title = "Materials List Draft";
        } else if (data.response.includes("EMAIL DRAFT")) {
          outputType = "email";
          title = "Email Draft";
        } else if (data.response.includes("TASK CREATED")) {
          outputType = "task";
          title = "Task Created";
        }

        saveOutput({
          id: crypto.randomUUID(),
          type: outputType,
          title: title,
          content: data.response,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I had trouble generating a response. Error: ${error instanceof Error ? error.message : String(error)}. Make sure Ollama is running: ollama serve`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMemory = () => {
    const memoryKey = `assistant_chat_memory_${profile?.role || "general"}`;
    localStorage.removeItem(memoryKey);
    setMessages([{ role: "assistant", content: openingMessage }]);
  };

  return (
    <main className="page">
      <div className="stack">
        <Link className="back" href="/dashboard">
          ← Dashboard
        </Link>

        <section className="card">
          <p className="eyebrow">
            {profile?.role ? profile.role.replaceAll("_", " ").toUpperCase() : "AI"} ASSISTANT
          </p>

          <h1>{taskName || (task === "chat" ? "Assistant Chat" : `Assistant: ${task}`)}</h1>

          <div className="chat-box">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <strong>{message.role === "assistant" ? "Assistant" : "You"}:</strong>
                <p>{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <strong>Assistant:</strong>
                <p>Thinking...</p>
              </div>
            )}
          </div>

          <textarea
            placeholder="Type the details here..."
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey && !isLoading) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isLoading}
            style={{ width: "100%", marginTop: "1rem" }}
          />

          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>

            <button
              className={`button ${isListening ? "listening" : ""}`}
              type="button"
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop listening" : "Click to speak"}
            >
              {isListening ? "🎤 Listening..." : "🎤 Talk"}
            </button>

            <button className="button ghost" type="button" onClick={clearMemory}>
              Clear Memory
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .chat-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .message {
          padding: 1rem;
          border-radius: 12px;
          background: #f3f4f6;
          white-space: pre-wrap;
        }

        .message.assistant {
          background: #111827;
          color: white;
        }

        .message.user {
          background: #e8f0ff;
        }

        .message p {
          margin: 0.5rem 0 0;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        button.button {
          border: none;
          cursor: pointer;
        }

        button.button.listening {
          background: #ef4444;
          color: white;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </main>
  );
}
