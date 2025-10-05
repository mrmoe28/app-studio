import { ElevenLabsClient } from "elevenlabs";
import { put } from "@vercel/blob";

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

// Shotstack TTS voices (native built-in voices)
export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: "Joanna",
    name: "Joanna",
    description: "Clear, professional female voice"
  },
  {
    id: "Kendra",
    name: "Kendra",
    description: "Neutral, pleasant female voice"
  },
  {
    id: "Kimberly",
    name: "Kimberly",
    description: "Warm, friendly female voice"
  },
  {
    id: "Ivy",
    name: "Ivy",
    description: "Young, casual female voice"
  },
  {
    id: "Salli",
    name: "Salli",
    description: "Confident, articulate female voice"
  },
  {
    id: "Matthew",
    name: "Matthew",
    description: "Deep, authoritative male voice"
  },
  {
    id: "Joey",
    name: "Joey",
    description: "Young, energetic male voice"
  },
  {
    id: "Justin",
    name: "Justin",
    description: "Mature, professional male voice"
  }
];

/**
 * Generate voiceover audio from text using ElevenLabs API
 * NOTE: This function is deprecated and should not be used.
 * Use Shotstack's built-in text-to-speech instead.
 */
export async function generateVoiceover(
  text: string,
  voiceId: string = "Joanna" // Default to Joanna (Shotstack voice)
): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const client = new ElevenLabsClient({ apiKey });

  try {
    console.log("[TTS] Generating voiceover with ElevenLabs", {
      voiceId,
      textLength: text.length,
      apiKeySet: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 8) + "..."
    });

    // Generate audio from text
    const audio = await client.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_monolingual_v1"
    });

    console.log("[TTS] Audio generation successful, converting to buffer");

    // Convert audio stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    console.log("[TTS] Buffer created, size:", audioBuffer.length, "bytes");

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const blob = await put(
      `voiceovers/${timestamp}-voiceover.mp3`,
      audioBuffer,
      {
        access: "public",
        contentType: "audio/mpeg"
      }
    );

    console.log("[TTS] Upload successful:", blob.url);
    return blob.url;
  } catch (error) {
    console.error("[TTS] ElevenLabs error details:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorName: error instanceof Error ? error.name : undefined,
      errorStack: error instanceof Error ? error.stack : undefined,
      // @ts-expect-error - Check for API response details
      statusCode: error?.statusCode,
      // @ts-expect-error - Check for API response details
      body: error?.body
    });

    // Check if it's an API key permission error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("missing_permissions") || errorMessage.includes("401")) {
      throw new Error(
        "ElevenLabs API key is missing required permissions. Please create a new API key with full TTS permissions at https://elevenlabs.io/app/settings/api-keys"
      );
    }

    throw new Error(`Failed to generate voiceover: ${errorMessage}`);
  }
}

/**
 * Get available voices for Shotstack TTS
 */
export async function getAvailableVoices(): Promise<VoiceOption[]> {
  // Return Shotstack TTS voices
  return AVAILABLE_VOICES;
}
