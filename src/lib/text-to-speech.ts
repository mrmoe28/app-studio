import { ElevenLabsClient } from "elevenlabs";
import { put } from "@vercel/blob";

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

// Popular ElevenLabs voices
export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    description: "Calm, young female voice"
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    description: "Strong, confident female voice"
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    description: "Soft, gentle female voice"
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    description: "Well-rounded male voice"
  },
  {
    id: "VR6AewLTigWG4xSOukaG",
    name: "Arnold",
    description: "Crisp, authoritative male voice"
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    description: "Deep, resonant male voice"
  }
];

/**
 * Generate voiceover audio from text using ElevenLabs API
 */
export async function generateVoiceover(
  text: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM" // Default to Rachel
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

    throw new Error(
      `Failed to generate voiceover: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<VoiceOption[]> {
  // For now, return predefined voices
  // In the future, we can fetch from ElevenLabs API
  return AVAILABLE_VOICES;
}
