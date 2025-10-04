'use client'

import { useState } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { urlSchema, type UrlInput } from '@/lib/schemas'
import type { ScrapedAsset } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, Video, Sparkles } from 'lucide-react'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedAsset | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [renderId, setRenderId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const form = useForm<UrlInput>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  })

  async function onSubmit(values: UrlInput) {
    setIsLoading(true)
    setScrapedData(null)
    setRenderId(null)
    setVideoUrl(null)

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        setScrapedData(data.data)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function generateVideo() {
    if (!scrapedData) return

    setIsGenerating(true)
    setRenderId(null)
    setVideoUrl(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scrapedData.title,
          description: scrapedData.description,
          duration: 15,
          images: scrapedData.screenshots,
          logo: scrapedData.logo,
          themeColor: scrapedData.themeColor,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRenderId(data.renderId)
        // Start polling for status
        pollRenderStatus(data.renderId)
      } else {
        alert(`Error: ${data.error}`)
        setIsGenerating(false)
      }
    } catch (error) {
      alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsGenerating(false)
    }
  }

  async function pollRenderStatus(id: string) {
    const maxAttempts = 60 // Poll for up to 5 minutes (60 attempts * 5 seconds)
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++

      try {
        const response = await fetch(`/api/status/${id}`)
        const data = await response.json()

        if (data.success) {
          if (data.status === 'done') {
            setVideoUrl(data.url)
            setIsGenerating(false)
            clearInterval(interval)
          } else if (data.status === 'failed') {
            alert(`Video generation failed: ${data.error || 'Unknown error'}`)
            setIsGenerating(false)
            clearInterval(interval)
          }
        }

        if (attempts >= maxAttempts) {
          alert('Video generation is taking longer than expected. Please check back later.')
          setIsGenerating(false)
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Status polling error:', error)
      }
    }, 5000) // Poll every 5 seconds
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Video className="w-12 h-12 text-blue-600" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PromoForge
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Generate stunning promotional videos for your apps in seconds
            </p>
          </div>

          {/* URL Input Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Your App URL</CardTitle>
              <CardDescription>
                Paste the URL of your app or website to automatically extract content for your promo video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the full URL including https://
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing URL...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze & Extract
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Scraped Data Preview */}
          {scrapedData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Extracted Content</CardTitle>
                <CardDescription>
                  Review the content we found from your app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Title</h3>
                  <p className="text-gray-700 dark:text-gray-300">{scrapedData.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{scrapedData.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Screenshots ({scrapedData.screenshots.length})</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {scrapedData.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative aspect-video">
                        <Image
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="rounded-lg border shadow-sm object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={generateVideo}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Promo Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Render Status */}
          {renderId && !videoUrl && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Your video is being rendered... (Render ID: {renderId})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Result */}
          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Your Promo Video is Ready! 🎉</CardTitle>
                <CardDescription>
                  Download your video or share it on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="flex gap-4">
                  <Button asChild className="flex-1">
                    <a href={videoUrl} download>
                      Download Video
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
