import { NextRequest, NextResponse } from 'next/server'
import { createPromoVideo } from '@/lib/shotstack'
import { videoGenerationSchema } from '@/lib/schemas'
import { z } from 'zod'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = videoGenerationSchema.parse(body)

    // Generate video using Shotstack
    const result = await createPromoVideo({
      title: validatedData.title,
      description: validatedData.description,
      duration: validatedData.duration,
      images: validatedData.images,
      logo: validatedData.logo,
      themeColor: validatedData.themeColor,
      musicUrl: validatedData.musicUrl,
      musicVolume: validatedData.musicVolume,
    })

    return NextResponse.json({
      success: true,
      renderId: result.renderId,
      message: result.message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Video generation API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate video',
      },
      { status: 500 }
    )
  }
}
