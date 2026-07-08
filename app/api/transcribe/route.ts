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

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // For now, return a placeholder
    // In production, you'd integrate with a speech-to-text API
    // Options: Google Cloud Speech-to-Text, AWS Transcribe, or AssemblyAI
    console.log("Audio transcription requested for:", audioFile.name);

    return NextResponse.json({
      text: "[Voice transcription would be processed here - requires speech-to-text API]",
      note: "Configure SPEECH_TO_TEXT_API (Google Cloud, AWS Transcribe, or AssemblyAI) for full functionality",
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
