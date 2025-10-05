import { NextRequest, NextResponse } from 'next/server'
import { scrapeMultipleUrls } from '@/lib/scraper'
import { z } from 'zod'

export const maxDuration = 180 // Allow up to 3 minutes for multiple pages

const scrapeMultipleSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10), // Max 10 URLs at once
  screenshotCount: z.number().min(1).max(10).optional().default(3)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = scrapeMultipleSchema.parse(body)

    // Scrape all URLs
    const scrapedData = await scrapeMultipleUrls(validatedData.urls, validatedData.screenshotCount)

    return NextResponse.json({
      success: true,
      data: scrapedData,
      count: scrapedData.length
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

    console.error('Multi-scraping API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape URLs',
      },
      { status: 500 }
    )
  }
}
