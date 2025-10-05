'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Volume2, Music, Play, Pause, Upload, Loader2 } from 'lucide-react'
import { AVAILABLE_VOICES } from '@/lib/text-to-speech'

export interface AudioSettings {
  enableVoiceover: boolean
  voiceoverScript: string
  selectedVoice: string
  voiceoverVolume: number
  enableMusic: boolean
  selectedMusic: string
  musicVolume: number
  customMusicUrl?: string
  customMusicName?: string
}

interface AudioControlsProps {
  settings: AudioSettings
  onSettingsChange: (settings: Partial<AudioSettings>) => void
}

export const MUSIC_TRACKS = [
  { id: 'upbeat-1', name: 'Upbeat Corporate', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 'calm-1', name: 'Calm Ambient', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5c2e788c03.mp3' },
  { id: 'energetic-1', name: 'Energetic Pop', url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_2dde668d05.mp3' }
]

export function AudioControls({ settings, onSettingsChange }: AudioControlsProps) {
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isPreviewingMusic, setIsPreviewingMusic] = useState(false)
  const [isUploadingMusic, setIsUploadingMusic] = useState(false)

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleVoiceoverToggle = () => {
    onSettingsChange({ enableVoiceover: !settings.enableVoiceover })
  }

  const handleMusicToggle = () => {
    onSettingsChange({ enableMusic: !settings.enableMusic })
  }

  const handleVoiceoverVolumeChange = (value: number[]) => {
    onSettingsChange({ voiceoverVolume: value[0] })
  }

  const handleMusicVolumeChange = (value: number[]) => {
    onSettingsChange({ musicVolume: value[0] })
  }

  const previewVoice = async () => {
    if (isPreviewingVoice) {
      // Stop current preview
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause()
        voiceAudioRef.current = null
      }
      setIsPreviewingVoice(false)
      return
    }

    setIsGeneratingPreview(true)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello! This is a preview of how this voice will sound in your video.',
          voiceId: settings.selectedVoice
        })
      })

      const data = await response.json()

      if (data.success && data.audioUrl) {
        const audio = new Audio(data.audioUrl)
        audio.volume = settings.voiceoverVolume / 100

        audio.onended = () => {
          setIsPreviewingVoice(false)
          voiceAudioRef.current = null
        }

        audio.onerror = () => {
          setIsPreviewingVoice(false)
          voiceAudioRef.current = null
        }

        voiceAudioRef.current = audio
        await audio.play()
        setIsPreviewingVoice(true)
      }
    } catch (error) {
      console.error('Error previewing voice:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const previewMusic = () => {
    if (isPreviewingMusic) {
      // Stop current preview
      if (musicAudioRef.current) {
        musicAudioRef.current.pause()
        musicAudioRef.current = null
      }
      setIsPreviewingMusic(false)
      return
    }

    const musicUrl = settings.selectedMusic === 'custom' && settings.customMusicUrl
      ? settings.customMusicUrl
      : MUSIC_TRACKS.find(t => t.id === settings.selectedMusic)?.url

    if (!musicUrl) return

    const audio = new Audio(musicUrl)
    audio.volume = settings.musicVolume / 100

    audio.onended = () => {
      setIsPreviewingMusic(false)
      musicAudioRef.current = null
    }

    audio.onerror = () => {
      setIsPreviewingMusic(false)
      musicAudioRef.current = null
    }

    musicAudioRef.current = audio
    audio.play()
    setIsPreviewingMusic(true)
  }

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploadingMusic(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-music', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success && data.url) {
        onSettingsChange({
          selectedMusic: 'custom',
          customMusicUrl: data.url,
          customMusicName: file.name
        })
      } else {
        alert('Failed to upload music file')
      }
    } catch (error) {
      console.error('Error uploading music:', error)
      alert('Failed to upload music file')
    } finally {
      setIsUploadingMusic(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Settings</CardTitle>
        <CardDescription>
          Add voiceover and background music to your video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voiceover Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <Label htmlFor="voiceover-toggle" className="text-base font-semibold">
                AI Voiceover
              </Label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="voiceover-toggle"
                className="sr-only peer"
                checked={settings.enableVoiceover}
                onChange={handleVoiceoverToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.enableVoiceover && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="voiceover-script">Voiceover Script</Label>
                <Textarea
                  id="voiceover-script"
                  placeholder="Enter the text you want to be spoken in the video..."
                  value={settings.voiceoverScript}
                  onChange={(e) => onSettingsChange({ voiceoverScript: e.target.value })}
                  rows={4}
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500">
                  {settings.voiceoverScript.length} / 5000 characters
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-select">Voice</Label>
                  <Button
                    onClick={previewVoice}
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingPreview}
                  >
                    {isGeneratingPreview ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : isPreviewingVoice ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Stop Preview
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Preview Voice
                      </>
                    )}
                  </Button>
                </div>
                <Select
                  value={settings.selectedVoice}
                  onValueChange={(value) => onSettingsChange({ selectedVoice: value })}
                >
                  <SelectTrigger id="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voiceover-volume">Voiceover Volume</Label>
                  <span className="text-sm text-gray-500">{settings.voiceoverVolume}%</span>
                </div>
                <Slider
                  id="voiceover-volume"
                  min={0}
                  max={100}
                  step={5}
                  value={[settings.voiceoverVolume]}
                  onValueChange={handleVoiceoverVolumeChange}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Background Music Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <Label htmlFor="music-toggle" className="text-base font-semibold">
                Background Music
              </Label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="music-toggle"
                className="sr-only peer"
                checked={settings.enableMusic}
                onChange={handleMusicToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.enableMusic && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-select">Music Track</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={previewMusic}
                      variant="outline"
                      size="sm"
                      disabled={!settings.selectedMusic}
                    >
                      {isPreviewingMusic ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Preview
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      disabled={isUploadingMusic}
                    >
                      {isUploadingMusic ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleMusicUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <Select
                  value={settings.selectedMusic}
                  onValueChange={(value) => onSettingsChange({ selectedMusic: value })}
                >
                  <SelectTrigger id="music-select">
                    <SelectValue placeholder="Select background music" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSIC_TRACKS.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                    {settings.customMusicUrl && (
                      <SelectItem value="custom">
                        {settings.customMusicName || 'Custom Upload'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {settings.selectedMusic === 'custom' && settings.customMusicName && (
                  <p className="text-xs text-gray-500">
                    Using custom music: {settings.customMusicName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-volume">Music Volume</Label>
                  <span className="text-sm text-gray-500">{settings.musicVolume}%</span>
                </div>
                <Slider
                  id="music-volume"
                  min={0}
                  max={100}
                  step={5}
                  value={[settings.musicVolume]}
                  onValueChange={handleMusicVolumeChange}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
