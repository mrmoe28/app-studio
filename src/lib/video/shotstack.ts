export type Shot = { imageUrl: string; caption?: string };

interface ShotstackClip {
  asset: {
    type: string;
    src: string;
    text?: string;
    style?: string;
    position?: string;
  };
  start: number;
  length: number;
  fit?: string;
  effect?: string;
}

interface ShotstackTimeline {
  tracks: Array<{
    clips: ShotstackClip[];
  }>;
}

interface ShotstackOutput {
  format: string;
  resolution: string;
  aspectRatio?: string;
}

interface ShotstackEdit {
  timeline: ShotstackTimeline;
  output: ShotstackOutput;
}

interface ShotstackResponse {
  success: boolean;
  message: string;
  response: {
    id: string;
    owner: string;
    url: string | null;
    status: string;
    error?: string;
  };
}

export async function renderWithShotstack(
  shots: Shot[],
  aspect = '9:16'
): Promise<ShotstackResponse> {
  // Validate environment variables
  if (!process.env.SHOTSTACK_API_KEY) {
    throw new Error('SHOTSTACK_API_KEY environment variable is not set');
  }

  const apiUrl =
    process.env.SHOTSTACK_API_ENV === 'v1'
      ? 'https://api.shotstack.io/v1'
      : 'https://api.shotstack.io/stage';

  // Build clips for each shot
  const clips: ShotstackClip[] = [];

  shots.forEach((shot, index) => {
    const startTime = index * 2; // 2 seconds per slide

    // Image clip
    clips.push({
      asset: {
        type: 'image',
        src: shot.imageUrl,
      },
      start: startTime,
      length: 2,
      fit: 'cover',
      effect: 'zoomIn',
    });

    // Text overlay clip (if caption provided)
    if (shot.caption) {
      clips.push({
        asset: {
          type: 'title',
          text: shot.caption,
          style: 'minimal',
          position: 'bottom',
        },
        start: startTime + 0.2,
        length: 1.6,
      });
    }
  });

  // Create timeline with single track
  const timeline: ShotstackTimeline = {
    tracks: [
      {
        clips,
      },
    ],
  };

  // Build the edit request with proper resolution and aspect ratio
  const output: ShotstackOutput = {
    format: 'mp4',
    resolution: 'hd', // Use HD resolution (1280x720)
  };

  // Add aspect ratio if not 16:9 (default)
  if (aspect === '9:16' || aspect === '1:1') {
    output.aspectRatio = aspect;
  }

  const edit: ShotstackEdit = {
    timeline,
    output,
  };

  try {
    // Make API request
    const response = await fetch(`${apiUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SHOTSTACK_API_KEY,
      },
      body: JSON.stringify(edit),
    });

    // Parse response
    const responseData = await response.json();

    // Check for errors
    if (!response.ok) {
      console.error('Shotstack API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });

      throw new Error(
        `Shotstack API Error (${response.status}): ${
          responseData.message || response.statusText
        }`
      );
    }

    return {
      success: true,
      message: 'Render queued successfully',
      response: responseData.response,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Shotstack Request Failed:', {
      message: errorMessage,
      stack: errorStack,
    });

    throw error;
  }
}
