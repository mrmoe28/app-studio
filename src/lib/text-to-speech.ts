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
    // Generate audio from text
    const audio = await client.generate({
      voice: voiceId,
      text: text,
      model_id: "eleven_monolingual_v1"
    });

    // Convert audio stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

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

    return blob.url;
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);

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
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<VoiceOption[]> {
  // For now, return predefined voices
  // In the future, we can fetch from ElevenLabs API
  return AVAILABLE_VOICES;
}
