'use client'

import { useEffect, useRef, useState } from 'react'
import { Edit, Canvas, Controls, Timeline } from '@shotstack/shotstack-studio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Download, Save } from 'lucide-react'

interface VideoEditorProps {
  screenshots?: string[]
  onExport?: (editData: unknown) => void
}

export function VideoEditor({ screenshots = [], onExport }: VideoEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const editRef = useRef<Edit | null>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const controlsRef = useRef<Controls | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeEditor() {
      try {
        // Load template
        const response = await fetch(
          'https://shotstack-assets.s3.amazonaws.com/templates/hello-world/hello.json'
        )
        const template = await response.json()

        if (!mounted) return

        // Initialize the edit
        const edit = new Edit(template.output.size, template.timeline.background)
        await edit.load()
        editRef.current = edit

        // Create canvas
        const canvas = new Canvas(template.output.size, edit)
        await canvas.load()
        canvasRef.current = canvas

        // Load template into editor
        await edit.loadEdit(template)

        // If screenshots provided, replace template images
        if (screenshots.length > 0) {
          await replaceTemplateImages(edit, screenshots)
        }

        // Initialize timeline
        const timeline = new Timeline(edit, { width: 1280, height: 300 })
        await timeline.load()
        timelineRef.current = timeline

        // Add keyboard controls
        const controls = new Controls(edit)
        await controls.load()
        controlsRef.current = controls

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize editor:', error)
        setIsLoading(false)
      }
    }

    initializeEditor()

    return () => {
      mounted = false
      // Cleanup if needed
    }
  }, [screenshots])

  async function replaceTemplateImages(edit: Edit, images: string[]) {
    try {
      // Get all clips from the timeline
      const tracks = edit.timeline?.tracks || []

      let imageIndex = 0
      for (const track of tracks) {
        for (const clip of track.clips || []) {
          // Replace image assets
          if (clip.asset?.type === 'image' && imageIndex < images.length) {
            clip.asset.src = images[imageIndex]
            imageIndex++
          }
        }
      }

      // Refresh the canvas
      if (canvasRef.current) {
        await canvasRef.current.load()
      }
    } catch (error) {
      console.error('Failed to replace images:', error)
    }
  }

  const handlePlay = () => {
    if (editRef.current) {
      if (isPlaying) {
        editRef.current.pause()
      } else {
        editRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleExport = () => {
    if (editRef.current && onExport) {
      const editData = editRef.current.getEdit()
      onExport(editData)
    }
  }

  const handleSave = () => {
    if (editRef.current) {
      const editData = editRef.current.getEdit()
      const json = JSON.stringify(editData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video-edit-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-4">
      {/* Video Canvas */}
      <Card>
        <CardHeader>
          <CardTitle>Video Editor</CardTitle>
          <CardDescription>
            Edit your promotional video with Shotstack Studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Canvas container - Shotstack will render here */}
          <div
            data-shotstack-studio
            className="w-full bg-black rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Timeline container - Shotstack will render here */}
          <div
            data-shotstack-timeline
            className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden"
          />
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              onClick={handlePlay}
              disabled={isLoading}
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Edit
            </Button>

            <Button
              onClick={handleExport}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
