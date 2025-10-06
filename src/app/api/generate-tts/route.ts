import { NextRequest, NextResponse } from 'next/server'

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY
const SHOTSTACK_API_ENV = process.env.SHOTSTACK_API_ENV || 'v1'

export async function POST(request: NextRequest) {
  try {
    if (!SHOTSTACK_API_KEY) {
      return NextResponse.json(
        { error: 'Shotstack API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { text, voice = 'Joanna' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Generate TTS using Shotstack Create API
    const response = await fetch(`https://api.shotstack.io/${SHOTSTACK_API_ENV}/create/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY,
      },
      body: JSON.stringify({
        provider: 'shotstack',
        options: {
          type: 'text-to-speech',
          text,
          voice,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Shotstack TTS API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Failed to generate speech' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Shotstack returns the audio URL directly
    return NextResponse.json({
      success: true,
      audioUrl: data.data?.url || data.url,
      data: data.data,
    })
  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
