import { NextRequest, NextResponse } from 'next/server'

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY
const SHOTSTACK_API_ENV = process.env.SHOTSTACK_API_ENV || 'v1'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!SHOTSTACK_API_KEY) {
      return NextResponse.json(
        { error: 'Shotstack API key not configured' },
        { status: 500 }
      )
    }

    const renderId = params.id

    if (!renderId) {
      return NextResponse.json(
        { error: 'Render ID is required' },
        { status: 400 }
      )
    }

    // Get render status from Shotstack
    const response = await fetch(
      `https://api.shotstack.io/${SHOTSTACK_API_ENV}/render/${renderId}`,
      {
        headers: {
          'x-api-key': SHOTSTACK_API_KEY,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Shotstack Status API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Failed to get render status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const status = data.response?.status
    const url = data.response?.url
    const error = data.response?.error

    return NextResponse.json({
      success: true,
      status,
      url,
      error,
      data: data.response,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
