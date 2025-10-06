'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Edit, Canvas, Controls, Timeline, VideoExporter } from '@shotstack/shotstack-studio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Loader2, Play, Download, Save, ZoomIn, ZoomOut, Maximize2, Scissors, SkipBack, SkipForward, Split, Undo2, Redo2, Pause, Video, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface TTSClipData {
  text: string
  voice: string
}

interface VideoEditorProps {
  screenshots?: string[]
  onExport?: (editData: unknown) => void
  onRegisterAddTTSClip?: (fn: (clipData: TTSClipData) => void) => void
}

export function VideoEditor({ screenshots = [], onExport, onRegisterAddTTSClip }: VideoEditorProps) {

  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineZoom, setTimelineZoom] = useState([100])
  const [draggedScreenshot, setDraggedScreenshot] = useState<string | null>(null)
  const [selectedClip, setSelectedClip] = useState<{ trackIndex: number; clipIndex: number } | null>(null)
  const [isBrowserExporting, setIsBrowserExporting] = useState(false)
  const [isCloudRendering, setIsCloudRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState<string>('')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const editRef = useRef<Edit | null>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const controlsRef = useRef<Controls | null>(null)
  const exporterRef = useRef<VideoExporter | null>(null)
  const templateRef = useRef<unknown>(null)

  // Function to add TTS clip to timeline
  const addTTSClipToTimeline = useCallback((clipData: TTSClipData) => {
    if (!editRef.current) {
      toast.error('Editor not ready')
      return
    }

    try {
      // Check if we have an audio track (track 1 typically)
      const tracks = editRef.current.getEdit().timeline?.tracks || []

      // If no audio track exists, create one
      if (tracks.length < 2) {
        editRef.current.addTrack(1, { clips: [] })
      }

      // Add TTS clip to track 1 (audio track)
      // Calculate start position based on existing clips
      const audioTrack = tracks[1] || { clips: [] }
      const existingClips = (audioTrack as { clips?: unknown[] }).clips || []

      // Start after the last clip, or at 0 if no clips
      let startPosition = 0
      if (existingClips.length > 0) {
        const lastClip = existingClips[existingClips.length - 1] as { start?: number; length?: number }
        startPosition = (lastClip.start || 0) + (lastClip.length || 3)
      }

      // Add TTS clip with text-to-speech asset type
      editRef.current.addClip(1, {
        asset: {
          type: 'text-to-speech',
          text: clipData.text,
          voice: clipData.voice,
        },
        start: startPosition,
        length: 'auto', // Auto-detect audio duration during render
      })

      toast.success('TTS clip added to timeline')
    } catch (error) {
      console.error('Failed to add TTS clip to timeline:', error)
      toast.error('Failed to add TTS clip to timeline')
    }
  }, [])

  // Register the addTTSClipToTimeline function with parent
  useEffect(() => {
    if (onRegisterAddTTSClip) {
      onRegisterAddTTSClip(addTTSClipToTimeline)
    }
  }, [onRegisterAddTTSClip, addTTSClipToTimeline])

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

        // Initialize timeline with dark theme
        const darkTheme = {
          timeline: {
            background: '#1e1e1e',
            divider: '#1a1a1a',
            playhead: '#3b82f6',
            snapGuide: '#888888',
            dropZone: '#3b82f6',
            trackInsertion: '#3b82f6',
            toolbar: {
              background: '#1a1a1a',
              surface: '#2a2a2a',
              hover: '#3a3a3a',
              active: '#3b82f6',
              divider: '#3a3a3a',
              icon: '#888888',
              text: '#ffffff',
              height: 36
            },
            ruler: {
              background: '#404040',
              text: '#ffffff',
              markers: '#666666',
              height: 40
            },
            tracks: {
              surface: '#2d2d2d',
              surfaceAlt: '#252525',
              border: '#3a3a3a',
              height: 60
            },
            clips: {
              video: '#4a9eff',
              audio: '#00d4aa',
              image: '#f5a623',
              text: '#d0021b',
              shape: '#9013fe',
              html: '#50e3c2',
              luma: '#b8e986',
              default: '#8e8e93',
              selected: '#3b82f6',
              radius: 4
            }
          }
        }

        const timeline = new Timeline(edit, { width: 1280, height: 300 }, { theme: darkTheme })
        await timeline.load()
        timelineRef.current = timeline

        // Add keyboard controls
        const controls = new Controls(edit)
        await controls.load()
        controlsRef.current = controls

        // Initialize VideoExporter
        const exporter = new VideoExporter(edit, canvas)
        exporterRef.current = exporter

        // Set up event listeners
        edit.events.on('clip:selected', (data: { clip: unknown; trackIndex: number; clipIndex: number }) => {
          setSelectedClip({ trackIndex: data.trackIndex, clipIndex: data.clipIndex })
          toast.info(`Clip selected: Track ${data.trackIndex}, Clip ${data.clipIndex}`)
        })

        edit.events.on('clip:updated', () => {
          toast.success('Clip updated')
        })

        edit.events.on('edit:undo', () => {
          toast.info('Undo')
          setCanUndo(false) // Update based on edit history
          setCanRedo(true)
        })

        edit.events.on('edit:redo', () => {
          toast.info('Redo')
          setCanRedo(false)
          setCanUndo(true)
        })

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

  const handleExport = async () => {
    if (!editRef.current) {
      toast.error('Editor not ready')
      return
    }

    try {
      setIsCloudRendering(true)
      setRenderProgress('Preparing video...')

      const editData = editRef.current.getEdit()

      // Submit render job
      const response = await fetch('/api/render-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeline: editData.timeline,
          output: editData.output || {
            format: 'mp4',
            resolution: 'hd',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit render')
      }

      const renderId = data.renderId
      toast.success('Render job submitted!')
      setRenderProgress('Rendering video...')

      // Poll for status
      const pollStatus = async () => {
        const statusResponse = await fetch(`/api/render-status/${renderId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'done' && statusData.url) {
          setRenderProgress('Complete!')
          toast.success('Video rendered successfully!')

          // Open video in new tab
          window.open(statusData.url, '_blank')

          // Call parent export handler if provided
          if (onExport) {
            onExport(editData)
          }

          setIsCloudRendering(false)
          setRenderProgress('')
          return
        }

        if (statusData.status === 'failed') {
          throw new Error('Render failed')
        }

        // Update progress
        if (statusData.status === 'rendering') {
          setRenderProgress('Rendering video... (this may take 10-30 seconds)')
        } else if (statusData.status === 'queued') {
          setRenderProgress('Queued for rendering...')
        }

        // Continue polling
        setTimeout(pollStatus, 2000)
      }

      // Start polling after 2 seconds
      setTimeout(pollStatus, 2000)
    } catch (error) {
      console.error('Render failed:', error)
      toast.error(error instanceof Error ? error.message : 'Render failed')
      setIsCloudRendering(false)
      setRenderProgress('')
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

  const handleUndo = () => {
    if (editRef.current) {
      editRef.current.undo()
    }
  }

  const handleRedo = () => {
    if (editRef.current) {
      editRef.current.redo()
    }
  }

  const handleDeleteClip = () => {
    if (editRef.current && selectedClip) {
      editRef.current.deleteClip(selectedClip.trackIndex, selectedClip.clipIndex)
      setSelectedClip(null)
      toast.success('Clip deleted')
    }
  }

  const handleAddTrack = () => {
    if (editRef.current) {
      const trackCount = editRef.current.getEdit().timeline?.tracks?.length || 0
      editRef.current.addTrack(trackCount, { clips: [] })
      toast.success('Track added')
    }
  }

  const handleExportVideo = async () => {
    if (!exporterRef.current) {
      toast.error('Exporter not initialized')
      return
    }

    try {
      setIsBrowserExporting(true)
      toast.info('Exporting video... This may take a few minutes')

      const filename = `promo-video-${Date.now()}.mp4`
      await exporterRef.current.export(filename, 25) // 25 fps

      toast.success('Video exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export video')
    } finally {
      setIsBrowserExporting(false)
    }
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
                onClick={handleUndo}
                disabled={isLoading || !canUndo}
                size="sm"
                variant="ghost"
                title="Undo (Cmd/Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleRedo}
                disabled={isLoading || !canRedo}
                size="sm"
                variant="ghost"
                title="Redo (Cmd/Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Track & Clip Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                onClick={handleAddTrack}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                title="Add track"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleDeleteClip}
                disabled={isLoading || !selectedClip}
                size="sm"
                variant="ghost"
                title="Delete selected clip"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Export Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                size="sm"
                variant="outline"
                title="Save edit as JSON"
              >
                <Save className="w-4 h-4 mr-1" />
                Save JSON
              </Button>
              <Button
                onClick={handleExportVideo}
                disabled={isLoading || isBrowserExporting || isCloudRendering}
                size="sm"
                variant="outline"
                title="Export video to MP4 (browser)"
              >
                {isBrowserExporting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Video className="w-4 h-4 mr-1" />
                )}
                {isBrowserExporting ? 'Exporting...' : 'Export MP4'}
              </Button>
              <Button
                onClick={handleExport}
                disabled={isLoading || isBrowserExporting || isCloudRendering}
                size="sm"
                title="Cloud render with Shotstack API (best quality)"
              >
                {isCloudRendering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    {renderProgress || 'Rendering...'}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Cloud Render
                  </>
                )}
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
