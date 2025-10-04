import { NextRequest, NextResponse } from 'next/server'
import { getRenderStatus } from '@/lib/shotstack'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ renderId: string }> }
) {
  try {
    const { renderId } = await params

    if (!renderId) {
      return NextResponse.json(
        { success: false, error: 'Render ID is required' },
        { status: 400 }
      )
    }

    const status = await getRenderStatus(renderId)

    return NextResponse.json({
      success: true,
      status: status.status,
      url: status.url,
      error: status.error,
    })
  } catch (error) {
    console.error('Status check API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check status',
      },
      { status: 500 }
    )
  }
}
