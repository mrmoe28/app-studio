import { NextRequest, NextResponse } from "next/server";
import { generateVoiceover } from "@/lib/text-to-speech";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const ttsSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log("[TTS API] Received request");
    const body = await request.json();
    console.log("[TTS API] Request body:", {
      textLength: body.text?.length,
      voiceId: body.voiceId
    });

    const { text, voiceId } = ttsSchema.parse(body);
    console.log("[TTS API] Validation passed, generating voiceover");

    const audioUrl = await generateVoiceover(text, voiceId);

    console.log("[TTS API] Success, audio URL:", audioUrl);
    return NextResponse.json({
      success: true,
      audioUrl
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[TTS API] Validation error:", error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.format()
        },
        { status: 400 }
      );
    }

    console.error("[TTS API] Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate voiceover"
      },
      { status: 500 }
    );
  }
}
