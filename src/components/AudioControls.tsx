'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Volume2, Music } from 'lucide-react'
import { AVAILABLE_VOICES } from '@/lib/text-to-speech'

export interface AudioSettings {
  enableVoiceover: boolean
  voiceoverScript: string
  selectedVoice: string
  voiceoverVolume: number
  enableMusic: boolean
  selectedMusic: string
  musicVolume: number
}

interface AudioControlsProps {
  settings: AudioSettings
  onSettingsChange: (settings: Partial<AudioSettings>) => void
}

const MUSIC_TRACKS = [
  { id: 'upbeat-1', name: 'Upbeat Corporate', url: '/music/upbeat-corporate.mp3' },
  { id: 'calm-1', name: 'Calm Ambient', url: '/music/calm-ambient.mp3' },
  { id: 'energetic-1', name: 'Energetic Pop', url: '/music/energetic-pop.mp3' }
]

export function AudioControls({ settings, onSettingsChange }: AudioControlsProps) {

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
                <Label htmlFor="voice-select">Voice</Label>
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
                <Label htmlFor="music-select">Music Track</Label>
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
                  </SelectContent>
                </Select>
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
