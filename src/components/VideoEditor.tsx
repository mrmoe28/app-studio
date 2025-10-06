'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Edit, Canvas, Controls, Timeline } from '@shotstack/shotstack-studio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Loader2, Play, Download, Save, ZoomIn, ZoomOut, Maximize2, Scissors, SkipBack, SkipForward, Split, Undo2, Redo2, Pause } from 'lucide-react'

interface VideoEditorProps {
  screenshots?: string[]
  onExport?: (editData: unknown) => void
}

export function VideoEditor({ screenshots = [], onExport }: VideoEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineZoom, setTimelineZoom] = useState([100])
  const [draggedScreenshot, setDraggedScreenshot] = useState<string | null>(null)
  const editRef = useRef<Edit | null>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const controlsRef = useRef<Controls | null>(null)
  const templateRef = useRef<unknown>(null)

  useEffect(() => {
    let mounted = true

    async function initializeEditor() {
      try {
        // Load template
        const response = await fetch(
          'https://shotstack-assets.s3.amazonaws.com/templates/hello-world/hello.json'
        )
        const template = await response.json()
        templateRef.current = template

        if (!mounted) return

        // Initialize the edit
        const edit = new Edit(template.output.size, template.timeline.background)
        await edit.load()
        editRef.current = edit

        // Create canvas
        const canvas = new Canvas(template.output.size, edit)
        await canvas.load()
        canvasRef.current = canvas

        // If screenshots provided, replace template images before loading
        let finalTemplate = template
        if (screenshots.length > 0) {
          finalTemplate = replaceImagesInTemplate(template, screenshots)
        }

        // Load template into editor
        await edit.loadEdit(finalTemplate)

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

  function replaceImagesInTemplate(template: Record<string, unknown>, images: string[]): Record<string, unknown> {
    // Deep clone the template
    const newTemplate = JSON.parse(JSON.stringify(template))

    const tracks = (newTemplate.timeline as { tracks?: unknown[] })?.tracks || []
    let imageIndex = 0

    for (const track of tracks as Array<{ clips?: Array<{ asset?: { type?: string; src?: string } }> }>) {
      for (const clip of track.clips || []) {
        // Replace image assets
        if (clip.asset?.type === 'image' && imageIndex < images.length) {
          clip.asset.src = images[imageIndex]
          imageIndex++
        }
      }
    }

    return newTemplate
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

  const handleZoomIn = () => {
    setTimelineZoom([Math.min(timelineZoom[0] + 25, 200)])
  }

  const handleZoomOut = () => {
    setTimelineZoom([Math.max(timelineZoom[0] - 25, 50)])
  }

  const handleFitToScreen = () => {
    setTimelineZoom([100])
  }

  const handleSkipBack = () => {
    if (editRef.current) {
      const currentTime = editRef.current.getTime()
      editRef.current.setTime(Math.max(0, currentTime - 1))
    }
  }

  const handleSkipForward = () => {
    if (editRef.current) {
      const currentTime = editRef.current.getTime()
      editRef.current.setTime(currentTime + 1)
    }
  }

  const handleDragStart = (screenshot: string) => {
    setDraggedScreenshot(screenshot)
  }

  const handleDragEnd = () => {
    setDraggedScreenshot(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedScreenshot && templateRef.current) {
      // Add screenshot to timeline at drop position
      console.log('Dropped screenshot:', draggedScreenshot)
      // TODO: Implement adding clip to timeline at specific position
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Enhanced Toolbar */}
      <Card className="sticky top-0 z-10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Playback Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                onClick={handleSkipBack}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Skip backward 1 second"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={handlePlay}
                disabled={isLoading}
                size="sm"
                variant={isPlaying ? "default" : "ghost"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleSkipForward}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Skip forward 1 second"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Timeline Zoom Controls */}
            <div className="flex items-center gap-2 border-r pr-2">
              <Button
                onClick={handleZoomOut}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="w-24">
                <Slider
                  value={timelineZoom}
                  onValueChange={setTimelineZoom}
                  min={50}
                  max={200}
                  step={25}
                  className="cursor-pointer"
                />
              </div>
              <span className="text-xs text-muted-foreground w-12">{timelineZoom[0]}%</span>
              <Button
                onClick={handleZoomIn}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleFitToScreen}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Fit to screen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Editing Tools */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Split clip"
              >
                <Split className="w-4 h-4" />
              </Button>
              <Button
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Trim clip"
              >
                <Scissors className="w-4 h-4" />
              </Button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Export Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleExport}
                disabled={isLoading}
                size="sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 min-h-0">
        {/* Screenshots Panel (Draggable) */}
        <Card className="lg:col-span-1 overflow-auto">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Screenshots</CardTitle>
            <CardDescription className="text-xs">Drag to timeline</CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(screenshot)}
                onDragEnd={handleDragEnd}
                className="relative group cursor-move hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
              >
                <Image
                  src={screenshot}
                  alt={`Screenshot ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-lg"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Drag to add</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Canvas & Timeline */}
        <div className="lg:col-span-3 flex flex-col gap-2 min-h-0">
          {/* Video Canvas */}
          <Card className="flex-1">
            <CardContent className="p-3 h-full">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
              {/* Canvas container - Shotstack will render here */}
              <div
                data-shotstack-studio
                className="w-full h-full bg-black rounded-lg overflow-hidden"
                style={{ minHeight: '300px' }}
              />
            </CardContent>
          </Card>

          {/* Timeline with Drop Zone */}
          <Card className="h-64">
            <CardContent
              className="p-3 h-full"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {/* Timeline container - Shotstack will render here */}
              <div
                data-shotstack-timeline
                className={`w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden transition-all ${
                  draggedScreenshot ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                style={{ transform: `scale(${timelineZoom[0] / 100})`, transformOrigin: 'top left' }}
              />
              {draggedScreenshot && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-lg p-4">
                    <span className="text-blue-600 font-medium">Drop here to add to timeline</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
