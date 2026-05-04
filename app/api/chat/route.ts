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
  contractor: `You are a knowledgeable job-site assistant helping a contractor. You think like someone who understands quotes, materials lists, labor estimates, job scheduling, and customer follow-ups. Be practical, specific, and focused on actionable next steps. Ask clarifying questions when needed. Keep responses concise but helpful.`,

  business_owner: `You are a business operations assistant. You help with client management, proposals, follow-ups, task prioritization, and business growth strategies. Think strategically about efficiency and growth. Be encouraging and focused on results.`,

  stay_at_home_parent: `You are a household assistant. You help organize routines, meal planning, appointments, budgeting, and reminders. Be warm, supportive, and practical. Understand the complexity of managing a household and multiple priorities. Offer solutions that save time and reduce stress.`,

  freelancer: `You are a freelance work assistant. You help manage clients, track deadlines, create invoices, build proposals, and handle project follow-ups. Be detail-oriented and focused on keeping projects moving forward and cash flowing.`,

  student: `You are a study assistant and academic coach. You help organize assignments, build study plans, manage deadlines, prepare for exams, and stay on top of coursework. Be encouraging and help break complex tasks into manageable steps.`,

  other: `You are a helpful personal assistant. You adapt to the user's needs and help with planning, organizing, task tracking, and getting things done. Be flexible and responsive to whatever they need.`
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

    // Call Ollama API
    const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      return Response.json(
        { 
          error: "Ollama API error",
          details: `Make sure Ollama is running: ollama serve`
        },
        { status: 500 }
      );
    }

    const ollamaData = await ollamaResponse.json() as { message?: { content: string } };
    const assistantMessage = ollamaData.message?.content || "I couldn't generate a response. Please check if Ollama is running.";

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
