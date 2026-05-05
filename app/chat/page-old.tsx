"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { OnboardingData } from "@/lib/onboarding";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type SavedOutput = {
  id: string;
  type: "quote" | "materials" | "note";
  title: string;
  content: string;
  createdAt: string;
};

const roleOpeners: Record<string, string> = {
  contractor:
    "I’ll think like a job-site assistant: quotes, materials, labor, follow-ups, and job tracking.",
  business_owner:
    "I’ll think like an operations assistant: clients, proposals, follow-ups, tasks, and business growth.",
  stay_at_home_parent:
    "I’ll think like a household assistant: routines, meals, appointments, budgeting, and reminders.",
  freelancer:
    "I’ll think like a freelance assistant: clients, deadlines, invoices, projects, and follow-ups.",
  student:
    "I’ll think like a study assistant: assignments, notes, deadlines, study plans, and exam prep.",
  other:
    "I’ll adapt to your workflow and help organize tasks, reminders, planning, and next steps."
};

function saveOutput(output: SavedOutput) {
  const saved = localStorage.getItem("assistant_outputs");
  const outputs: SavedOutput[] = saved ? JSON.parse(saved) : [];
  localStorage.setItem("assistant_outputs", JSON.stringify([output, ...outputs]));
}

function getTaskPrompt(task: string, taskName: string | null, profile: OnboardingData | null) {
  const role = profile?.role || "other";
  const businessName = profile?.businessName || "your work";

  if (taskName) {
    return `Let's work on: ${taskName}. ${roleOpeners[role] || roleOpeners.other}`;
  }

  if (task === "quote") {
    return `Let’s build a quote for ${businessName}. Send me the customer name, job type, location, scope, materials, labor estimate, and deadline if you have one.`;
  }

  if (task === "materials") {
    return `Let’s make a materials list. Send me the project type, measurements, quantities, and preferred materials.`;
  }

  if (task === "email") {
    return `Let’s draft an email. Who is it for, what do you need to say, and what tone should it have?`;
  }

  if (task === "task") {
    return `Let’s organize a task. What needs to be done, who is it for, and when is it due?`;
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

Materials:
- List main materials here
- Add quantities when known
- Add preferred brands/specs if needed

Labor:
- Estimated labor: [hours/days]
- Crew size: [number of people]
- Notes: Adjust based on site conditions

Estimated Total:
$[Add price]

Terms:
- Quote valid for 14 days
- Material prices may change
- Final price may change if scope changes

Next Step:
Confirm details, add pricing, then send to customer.`;
}

function generateMaterials(input: string) {
  return `MATERIALS LIST DRAFT

Project Details:
${input}

Materials:
- Lumber / main structural materials
- Fasteners / screws / nails
- Adhesive / sealant if needed
- Finish materials
- Safety supplies
- Cleanup supplies

Measurements Needed:
- Overall dimensions
- Quantity / count
- Material thickness or grade
- Any customer preferences

Next Step:
Add exact dimensions and I’ll help tighten this into a shopping-ready list.`;
}

function _generateReply(input: string, history: Message[], profile: OnboardingData | null) {
  const lower = input.toLowerCase();
  const memory = history.map((m) => m.content.toLowerCase()).join(" ");
  const role = profile?.role || "other";

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isGreeting =
    lower === "hey" ||
    lower === "hi" ||
    lower === "hello" ||
    lower.includes("hey assistant") ||
    lower.includes("hey chat");

  const soundsStressed =
    lower.includes("stressed") ||
    lower.includes("overwhelmed") ||
    lower.includes("tired") ||
    lower.includes("frustrated") ||
    lower.includes("anxious") ||
    lower.includes("too much");

  const soundsHappy =
    lower.includes("happy") ||
    lower.includes("excited") ||
    lower.includes("great") ||
    lower.includes("awesome") ||
    lower.includes("good news");

  if (isGreeting) {
    if (role === "contractor") {
      return `${timeGreeting}. What job are we working on today — quote, materials, follow-up, or schedule?`;
    }

    if (role === "stay_at_home_parent") {
      return `${timeGreeting} 🙂 What do you want help organizing today — schedule, meals, errands, budget, or reminders?`;
    }

    if (role === "student") {
      return `${timeGreeting}. What are we working on — assignments, studying, notes, or deadlines?`;
    }

    return `${timeGreeting}. What can I help you with?`;
  }

  if (soundsStressed) {
    return "I hear you. Let’s simplify it. What is the one thing we need to handle first?";
  }

  if (soundsHappy) {
    return "Love that. Want to turn that momentum into the next useful step?";
  }

  if (lower.includes("make quote") || lower.includes("build quote") || lower.includes("estimate")) {
    return generateQuote(input, profile);
  }
  
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
  return `Perfect — now I can turn that into a usable next step.

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
4. Do you want this priced as budget, standard, or premium?`;
}

  if (lower.includes("material") || lower.includes("materials")) {
    return generateMaterials(input);
  }

  if (role === "contractor") {
    if (memory.includes("quote")) {
      return "Send me the customer name, job type, scope, materials, labor hours, and deadline. I’ll shape it into a clean bid.";
    }

    return "I’m tracking this like a contractor assistant. Send me the job details, and I’ll help with quote, materials, follow-up, or next steps.";
  }

  return "I’m following. Tell me a little more, and I’ll turn it into a useful next step.";
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const task = searchParams.get("task") || "chat";
  const taskName = searchParams.get("name");

  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch("/api/chat", {
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
        throw new Error("Failed to get response");
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
        data.response.includes("MATERIALS LIST DRAFT")
      ) {
        saveOutput({
          id: crypto.randomUUID(),
          type: data.response.includes("QUOTE DRAFT") ? "quote" : "materials",
          title: data.response.includes("QUOTE DRAFT")
            ? "Quote Draft"
            : "Materials List Draft",
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
      `}</style>
    </main>
  );
}