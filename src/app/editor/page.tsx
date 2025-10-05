'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { VideoEditor } from '@/components/VideoEditor'
import { ScreenshotUpload } from '@/components/ScreenshotUpload'
import { Video, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function EditorContent() {
  const searchParams = useSearchParams()
  const [screenshots, setScreenshots] = useState<string[]>([])

  useEffect(() => {
    // Get screenshots from URL params (if passed from main page)
    const screenshotsParam = searchParams.get('screenshots')
    if (screenshotsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(screenshotsParam))
        setScreenshots(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Failed to parse screenshots:', error)
      }
    }
  }, [searchParams])

  const handleUploadComplete = (uploadedUrls: string[]) => {
    setScreenshots(prev => [...prev, ...uploadedUrls])
  }

  const handleExport = async (editData: unknown) => {
    console.log('Exporting video with data:', editData)

    // TODO: Send to Shotstack render API
    // This will be similar to the existing generateVideo function
    // but using the Shotstack Studio edit data

    alert('Export functionality coming soon! Edit data logged to console.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Video className="w-12 h-12 text-blue-600" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Video Editor
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Professional video editing powered by Shotstack Studio
            </p>
          </div>

          {/* Upload Section */}
          {screenshots.length === 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Upload screenshots to begin editing your video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScreenshotUpload onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          )}

          {/* Editor */}
          {screenshots.length > 0 && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Screenshots ({screenshots.length})</CardTitle>
                  <CardDescription>
                    Add more screenshots or start editing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScreenshotUpload onUploadComplete={handleUploadComplete} />
                </CardContent>
              </Card>

              <VideoEditor
                screenshots={screenshots}
                onExport={handleExport}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
