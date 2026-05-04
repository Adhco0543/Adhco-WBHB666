import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { userDescription, businessName } = await request.json();

    if (!userDescription) {
      return NextResponse.json(
        { error: "User description required" },
        { status: 400 }
      );
    }

    // Use Claude to analyze the user's work and generate personalized profile
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Analyze this person's work and provide a JSON response. Be specific and helpful.

User input: "${userDescription}"
${businessName ? `Business name: "${businessName}"` : ""}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "workType": "service|product|hybrid|freelance",
  "revenueModel": "hourly|per_item|per_project|subscription|variable|mixed",
  "teamSize": "solo|small_team",
  "workLocation": "home|on_site|client_site|remote|hybrid",
  "suggestedTasks": ["task1", "task2", "task3", "task4"],
  "painPoints": ["pain1", "pain2", "pain3"],
  "professionalContext": "A 2-3 sentence summary of their work for an AI assistant to understand their situation",
  "adaptivePrompt": "A specific system instruction for the AI assistant tailored to their type of work"
}

Make suggestions that match THEIR actual work, not generic tasks.
Examples:
- "Stay-at-home tutor" → tasks: ["Schedule Lesson", "Track Hours", "Create Invoice", "Manage Student Progress"]
- "Etsy seller" → tasks: ["Create Listing", "Manage Inventory", "Track Order", "Plan Shipping"]
- "Freelance designer" → tasks: ["Create Proposal", "Track Project", "Invoice Client", "Manage Revisions"]
- "Personal trainer" → tasks: ["Schedule Client", "Track Workout", "Send Program", "Invoice Client"]
- "Handyman" → tasks: ["Create Estimate", "Track Job", "Schedule Follow-up", "Invoice"]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || "Claude API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysisText =
      data.content[0].type === "text" ? data.content[0].text : "";

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error("Failed to parse Claude response:", analysisText);
      return NextResponse.json(
        { error: "Failed to analyze profile. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Profile analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
