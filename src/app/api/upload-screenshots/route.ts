import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SCREENSHOTS = 10

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('screenshots') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      )
    }

    if (files.length > MAX_SCREENSHOTS) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${MAX_SCREENSHOTS} screenshots allowed`
        },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`
          },
          { status: 400 }
        )
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds 10MB limit`
          },
          { status: 400 }
        )
      }

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Determine content type
      const contentType = file.type

      // Upload to Vercel Blob
      const blob = await put(
        `uploads/${timestamp}-${i}-${file.name}`,
        buffer,
        {
          access: 'public',
          contentType,
        }
      )

      uploadedUrls.push(blob.url)
      console.log(`[Upload] Screenshot ${i + 1}/${files.length} uploaded: ${blob.url}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        screenshots: uploadedUrls,
        count: uploadedUrls.length,
      },
    })
  } catch (error) {
    console.error('Screenshot upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload screenshots',
      },
      { status: 500 }
    )
  }
}
