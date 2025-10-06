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
    const { timeline, output } = body

    if (!timeline || !output) {
      return NextResponse.json(
        { error: 'Timeline and output are required' },
        { status: 400 }
      )
    }

    // Submit render job to Shotstack Edit API
    const response = await fetch(`https://api.shotstack.io/${SHOTSTACK_API_ENV}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY,
      },
      body: JSON.stringify({
        timeline,
        output,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Shotstack Render API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Failed to submit render job' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const renderId = data.response?.id

    if (!renderId) {
      console.error('No render ID returned:', data)
      return NextResponse.json(
        { error: 'Failed to get render ID' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      renderId,
      message: 'Render job submitted successfully',
    })
  } catch (error) {
    console.error('Render submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
