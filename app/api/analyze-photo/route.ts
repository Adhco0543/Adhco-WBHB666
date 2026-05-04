import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Call Claude API with vision
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
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64,
                },
              },
              {
                type: "text",
                text: `You are an expert construction and carpentry assistant. Analyze this job site photo and provide:
1. **Estimated Materials Needed** - List specific materials with quantities
2. **Labor Estimate** - Estimated hours and crew size
3. **Potential Issues** - Any concerns or challenges you spot
4. **Safety Notes** - Any safety considerations
5. **Quick Quote Starting Point** - A rough estimate range

Format as a clear, actionable checklist that a contractor can use immediately.`,
              },
            ],
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
    const analysis =
      data.content[0].type === "text" ? data.content[0].text : "";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Photo analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
