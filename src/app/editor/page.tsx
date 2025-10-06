'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { VideoEditor } from '@/components/VideoEditor'
import { ScreenshotUpload } from '@/components/ScreenshotUpload'
import { TextToSpeechPanel } from '@/components/TextToSpeechPanel'
import { Video, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface TTSClipData {
  text: string
  voice: string
}

function EditorContent() {
  const searchParams = useSearchParams()
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [addTTSClipFn, setAddTTSClipFn] = useState<((clipData: TTSClipData) => void) | undefined>(undefined)

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
    // Export is handled by VideoEditor via cloud rendering
  }

  const handleRegisterAddTTSClip = (fn: (clipData: TTSClipData) => void) => {
    setAddTTSClipFn(() => fn)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Compact Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Video Editor
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
              Professional editing powered by Shotstack Studio
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full px-2 py-2">
          {/* Upload Section */}
          {screenshots.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Card className="w-full max-w-2xl">
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
            </div>
          )}

          {/* Editor - Full Height with TTS Panel */}
          {screenshots.length > 0 && (
            <div className="h-full grid grid-cols-1 xl:grid-cols-4 gap-2">
              {/* Main Editor - Takes 3/4 width on XL screens */}
              <div className="xl:col-span-3 h-full">
                <VideoEditor
                  screenshots={screenshots}
                  onExport={handleExport}
                  onRegisterAddTTSClip={handleRegisterAddTTSClip}
                />
              </div>

              {/* TTS Panel - Takes 1/4 width on XL screens */}
              <div className="xl:col-span-1 overflow-auto">
                <Tabs defaultValue="tts" className="h-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="tts" className="flex-1">Voice</TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tts" className="mt-2">
                    <TextToSpeechPanel onAddTTSClip={addTTSClipFn} />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Screenshots</CardTitle>
                        <CardDescription>
                          Upload more screenshots ({screenshots.length} total)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScreenshotUpload onUploadComplete={handleUploadComplete} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
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
