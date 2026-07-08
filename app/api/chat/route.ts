export const runtime = "nodejs";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  message: string;
  history: Message[];
  profile?: {
    role?: string;
    businessName?: string;
    industry?: string;
    teamSize?: string;
    workMode?: string;
  };
  currentTask?: string;
};

type ConversationState = {
  currentTask: string | null;
  collectedInfo: Record<string, string>;
  decisions: string[];
  stage: "discovery" | "planning" | "building" | "refining" | "complete";
};

const roleSystemPrompts: Record<string, string> = {
  contractor: `You are a knowledgeable personal assistant who can answer general questions as well as help a contractor. For work topics, think like someone who understands quotes, materials lists, labor estimates, job scheduling, and customer follow-ups. For non-work topics, answer naturally and helpfully without forcing the conversation back to work. Be practical, specific, and focused on useful next steps. Ask clarifying questions when needed. Keep responses concise but helpful.`,

  business_owner: `You are a helpful personal assistant who can answer general questions as well as business questions. You help with client management, proposals, follow-ups, task prioritization, and business growth strategies when those topics come up. For non-work topics, answer directly and naturally without steering back to business. Think clearly, be encouraging, and focus on useful answers.`,

  stay_at_home_parent: `You are a helpful personal assistant who can answer general questions as well as household questions. You help organize routines, meal planning, appointments, budgeting, and reminders when those topics come up. For non-household topics, answer directly and naturally. Be warm, supportive, and practical.`,

  freelancer: `You are a helpful personal assistant who can answer general questions as well as freelance work questions. You help manage clients, track deadlines, create invoices, build proposals, and handle project follow-ups when those topics come up. For non-work topics, answer directly and naturally. Be detail-oriented and useful.`,

  student: `You are a helpful personal assistant who can answer general questions as well as school questions. You help organize assignments, build study plans, manage deadlines, prepare for exams, and stay on top of coursework when those topics come up. For non-school topics, answer directly and naturally. Be encouraging and clear.`,

  other: `You are a helpful general-purpose personal assistant. You can answer questions about everyday life, work, learning, planning, technology, writing, and ideas. Be flexible, direct, and responsive to whatever the user needs.`
};

type ChatProviderMessage = {
  role: "user" | "assistant";
  content: string;
};

// Extract conversation state from message history
function analyzeConversationState(history: Message[], currentMessage: string): ConversationState {
  const fullConversation = [...history.map(m => m.content), currentMessage].join(" ").toLowerCase();
  
  // Detect current task
  let currentTask: string | null = null;
  if (fullConversation.includes("quote")) currentTask = "quote";
  else if (fullConversation.includes("email") || fullConversation.includes("message")) currentTask = "email";
  else if (fullConversation.includes("task") || fullConversation.includes("todo")) currentTask = "task";
  else if (fullConversation.includes("material")) currentTask = "materials";
  else if (fullConversation.includes("schedule") || fullConversation.includes("calendar")) currentTask = "scheduling";

  // Extract collected information
  const collectedInfo: Record<string, string> = {};
  
  // Look for common fields
  const customerMatch = fullConversation.match(/(?:customer|client|for):\s*([^,.\n]+)/i);
  if (customerMatch) collectedInfo["customer"] = customerMatch[1].trim();
  
  const dateMatch = fullConversation.match(/(?:due|date|deadline):\s*([^,.\n]+)/i);
  if (dateMatch) collectedInfo["deadline"] = dateMatch[1].trim();
  
  const amountMatch = fullConversation.match(/\$[\d,]+(?:\.\d{2})?/);
  if (amountMatch) collectedInfo["amount"] = amountMatch[0];
  
  const locationMatch = fullConversation.match(/(?:location|address|site):\s*([^,.\n]+)/i);
  if (locationMatch) collectedInfo["location"] = locationMatch[1].trim();

  // Detect conversation stage
  let stage: ConversationState["stage"] = "discovery";
  const messageCount = history.length;
  
  if (messageCount > 6 && Object.keys(collectedInfo).length > 2) stage = "planning";
  if (messageCount > 10 && Object.keys(collectedInfo).length > 3) stage = "building";
  if (messageCount > 14 && fullConversation.includes("confirm") || fullConversation.includes("ready")) stage = "refining";
  if (fullConversation.includes("done") || fullConversation.includes("complete") || fullConversation.includes("save")) stage = "complete";

  // Track decisions
  const decisions: string[] = [];
  if (fullConversation.includes("will")) decisions.push("Commitment made");
  if (fullConversation.includes("agreed") || fullConversation.includes("confirm")) decisions.push("Agreement reached");
  if (fullConversation.includes("change")) decisions.push("Modification requested");

  return { currentTask, collectedInfo, decisions, stage };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { message, history, profile, currentTask: taskHint } = body;

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";

    // Analyze conversation state
    const state = analyzeConversationState(history, message);
    const activeTask = taskHint || state.currentTask;

    // Build system prompt
    const userRole = profile?.role || "other";
    const baseSystemPrompt = roleSystemPrompts[userRole] || roleSystemPrompts.other;

    const profileContext = profile
      ? `\n\nUser Profile:\n- Business/Work: ${profile.businessName || "N/A"}\n- Industry: ${profile.industry || "N/A"}\n- Team Size: ${profile.teamSize || "N/A"}\n- Work Mode: ${profile.workMode || "N/A"}`
      : "";

    // Build state context
    const stateContext = `\n\nCurrent Workflow State:
- Active Task: ${activeTask || "General assistance"}
- Conversation Stage: ${state.stage}
- Information Collected: ${Object.entries(state.collectedInfo).map(([k, v]) => `${k}: ${v}`).join(", ") || "None yet"}
- Decisions Made: ${state.decisions.length > 0 ? state.decisions.join("; ") : "None yet"}`;

    const systemPrompt = `${baseSystemPrompt}${profileContext}${stateContext}

Behavior Guidelines:
- GENERAL QUESTIONS: Answer any ordinary question directly, whether or not it is about work
- DON'T FORCE WORK CONTEXT: Use project/work context only when it helps; otherwise ignore it
- UNDERSTAND STATE: Remember what task we're working on and what info you already have
- AVOID REPETITION: Don't ask for info you already collected
- PROGRESS FOCUS: Move the conversation forward based on the current stage
- CONTEXT AWARE: Reference previous decisions and info naturally
- PROACTIVE: Suggest next steps based on what's already collected
- CLARIFY ONCE: Ask clarifying questions early, then work with what you have
- DECISION TRACKING: Acknowledge and remember choices the user makes
- AUTHENTIC: Never repeat the exact same response; vary your approach
- EMPATHETIC: Match the user's energy and urgency
- CONCISE: Keep responses short (2-4 sentences) unless explaining complex ideas`;

    // Convert history to API format
    const messages: Array<{ role: "user" | "assistant"; content: string }> =
      history.map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

    // Add the current message
    messages.push({
      role: "user",
      content: message
    });

    const assistantMessage = await generateAssistantResponse(systemPrompt, messages, ollamaUrl);

    return Response.json({
      response: assistantMessage,
      success: true,
      state: {
        task: activeTask,
        stage: state.stage,
        collectedInfo: state.collectedInfo
      }
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function generateAssistantResponse(
  systemPrompt: string,
  messages: ChatProviderMessage[],
  ollamaUrl: string
): Promise<string> {
  const errors: string[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await generateWithAnthropic(systemPrompt, messages);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      return await generateWithGroq(systemPrompt, messages);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  try {
    return await generateWithOllama(systemPrompt, messages, ollamaUrl);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  throw new Error(`No AI provider responded. ${errors.join(" | ")}`);
}

async function generateWithAnthropic(
  systemPrompt: string,
  messages: ChatProviderMessage[]
): Promise<string> {
  const anthropicMessages: ChatProviderMessage[] =
    messages[0]?.role === "assistant"
      ? [
          {
            role: "user",
            content: "Use the existing conversation as context and answer my latest question.",
          },
          ...messages,
        ]
      : messages;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 700,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json() as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = data.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned no text response");
  return text;
}

async function generateWithGroq(
  systemPrompt: string,
  messages: ChatProviderMessage[]
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no text response");
  return text;
}

async function generateWithOllama(
  systemPrompt: string,
  messages: ChatProviderMessage[],
  ollamaUrl: string
): Promise<string> {
  const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: false,
    }),
  });

  if (!ollamaResponse.ok) {
    throw new Error("Ollama API error. Make sure Ollama is running: ollama serve");
  }

  const ollamaData = await ollamaResponse.json() as { message?: { content: string } };
  const text = ollamaData.message?.content;
  if (!text) throw new Error("Ollama returned no text response");
  return text;
}
