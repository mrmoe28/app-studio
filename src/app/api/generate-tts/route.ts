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
    const response = await fetch(`https://api.shotstack.io/create/${SHOTSTACK_API_ENV}/assets`, {
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

    const createData = await response.json()
    const assetId = createData.data?.id

    if (!assetId) {
      console.error('No asset ID returned:', createData)
      return NextResponse.json(
        { error: 'Failed to create TTS asset' },
        { status: 500 }
      )
    }

    // Poll for asset status (max 30 seconds, check every 1 second)
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(
        `https://api.shotstack.io/create/${SHOTSTACK_API_ENV}/assets/${assetId}`,
        {
          headers: {
            'x-api-key': SHOTSTACK_API_KEY,
          },
        }
      )

      if (!statusResponse.ok) {
        throw new Error('Failed to check asset status')
      }

      const statusData = await statusResponse.json()
      const status = statusData.data?.status
      const audioUrl = statusData.data?.url

      if (status === 'done' && audioUrl) {
        return NextResponse.json({
          success: true,
          audioUrl,
          assetId,
          data: statusData.data,
        })
      }

      if (status === 'failed') {
        return NextResponse.json(
          { error: 'TTS generation failed' },
          { status: 500 }
        )
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    // Timeout
    return NextResponse.json(
      { error: 'TTS generation timed out' },
      { status: 408 }
    )
  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
