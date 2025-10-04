import { NextRequest, NextResponse } from 'next/server';
import { renderVideo } from '@/lib/video';
import { z } from 'zod';

// Input validation schema
const shotSchema = z.object({
  imageUrl: z.string().url('Must be a valid URL'),
  caption: z.string().optional(),
});

const requestSchema = z.object({
  shots: z.array(shotSchema).min(1, 'At least one shot is required'),
  templateId: z.string().optional(),
  aspect: z.enum(['9:16', '1:1', '16:9']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { shots, templateId, aspect } = validationResult.data;

    // Call video rendering function
    const result = await renderVideo({
      shots,
      templateId,
      aspect,
    });

    return NextResponse.json({
      success: true,
      provider: process.env.VIDEO_PROVIDER || 'shotstack',
      data: result,
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Video generation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return detailed error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred during video generation',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
