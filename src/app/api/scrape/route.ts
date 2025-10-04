import { NextRequest, NextResponse } from 'next/server'
import { scrapeAppUrl } from '@/lib/scraper'
import { scrapeRequestSchema } from '@/lib/schemas'
import { z } from 'zod'

export const maxDuration = 60 // Allow up to 60 seconds for scraping

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = scrapeRequestSchema.parse(body)

    // Scrape the URL
    const scrapedData = await scrapeAppUrl(validatedData.url)

    return NextResponse.json({
      success: true,
      data: scrapedData,
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

    console.error('Scraping API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape URL',
      },
      { status: 500 }
    )
  }
}
