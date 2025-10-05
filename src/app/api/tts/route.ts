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
    const body = await request.json();
    const { text, voiceId } = ttsSchema.parse(body);

    const audioUrl = await generateVoiceover(text, voiceId);

    return NextResponse.json({
      success: true,
      audioUrl
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.format()
        },
        { status: 400 }
      );
    }

    console.error("TTS API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate voiceover"
      },
      { status: 500 }
    );
  }
}
