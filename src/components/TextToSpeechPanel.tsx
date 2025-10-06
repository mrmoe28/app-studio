'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Volume2, Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TTSClipData {
  text: string
  voice: string
}

interface TextToSpeechPanelProps {
  onAddTTSClip?: (clipData: TTSClipData) => void
}

// Sample preview text for each language
const PREVIEW_TEXTS: Record<string, string> = {
  'en-US': 'Hello, this is a voice preview.',
  'en-GB': 'Hello, this is a voice preview.',
  'en-AU': 'Hello, this is a voice preview.',
  'es-ES': 'Hola, esta es una vista previa de voz.',
  'fr-FR': 'Bonjour, ceci est un aperçu vocal.',
  'de-DE': 'Hallo, dies ist eine Sprachvorschau.',
  'it-IT': 'Ciao, questa è un\'anteprima vocale.',
}

// Common voices from Shotstack TTS
const VOICES = [
  // English voices
  { id: 'Matthew', name: 'Matthew (Male, US English)', language: 'en-US' },
  { id: 'Joanna', name: 'Joanna (Female, US English)', language: 'en-US' },
  { id: 'Amy', name: 'Amy (Female, British English)', language: 'en-GB' },
  { id: 'Brian', name: 'Brian (Male, British English)', language: 'en-GB' },
  { id: 'Emma', name: 'Emma (Female, British English)', language: 'en-GB' },
  { id: 'Joey', name: 'Joey (Male, US English)', language: 'en-US' },
  { id: 'Justin', name: 'Justin (Male, US English)', language: 'en-US' },
  { id: 'Kendra', name: 'Kendra (Female, US English)', language: 'en-US' },
  { id: 'Salli', name: 'Salli (Female, US English)', language: 'en-US' },
  // Australian English
  { id: 'Nicole', name: 'Nicole (Female, Australian English)', language: 'en-AU' },
  { id: 'Russell', name: 'Russell (Male, Australian English)', language: 'en-AU' },
  // Spanish
  { id: 'Miguel', name: 'Miguel (Male, Spanish)', language: 'es-ES' },
  { id: 'Penelope', name: 'Penélope (Female, Spanish)', language: 'es-ES' },
  // French
  { id: 'Celine', name: 'Céline (Female, French)', language: 'fr-FR' },
  { id: 'Mathieu', name: 'Mathieu (Male, French)', language: 'fr-FR' },
  // German
  { id: 'Hans', name: 'Hans (Male, German)', language: 'de-DE' },
  { id: 'Marlene', name: 'Marlene (Female, German)', language: 'de-DE' },
  // Italian
  { id: 'Giorgio', name: 'Giorgio (Male, Italian)', language: 'it-IT' },
  { id: 'Carla', name: 'Carla (Female, Italian)', language: 'it-IT' },
]

export function TextToSpeechPanel({ onAddTTSClip }: TextToSpeechPanelProps) {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('Joanna')
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false)
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null)

  const handlePreviewVoice = async () => {
    const selectedVoice = VOICES.find(v => v.id === voice)
    const previewText = selectedVoice ? PREVIEW_TEXTS[selectedVoice.language] : PREVIEW_TEXTS['en-US']

    try {
      setIsPreviewingVoice(true)
      toast.info('Generating voice preview...')

      const response = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, voice }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate preview')
      }

      setPreviewAudioUrl(data.audioUrl)
      toast.success('Preview ready!')
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error(error instanceof Error ? error.message : 'Preview failed')
    } finally {
      setIsPreviewingVoice(false)
    }
  }

  const handleAddToTimeline = () => {
    if (!text.trim()) {
      toast.error('Please enter text to convert to speech')
      return
    }

    if (onAddTTSClip) {
      onAddTTSClip({
        text: text.trim(),
        voice,
      })
      toast.success('TTS clip added to timeline!')
      // Clear text after adding
      setText('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Text to Speech
        </CardTitle>
        <CardDescription>
          Generate AI voiceovers for your video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice">Voice</Label>
            <Button
              onClick={handlePreviewVoice}
              disabled={isPreviewingVoice}
              size="sm"
              variant="outline"
            >
              {isPreviewingVoice ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Preview Voice
                </>
              )}
            </Button>
          </div>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger id="voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {previewAudioUrl && (
            <audio controls className="w-full mt-2" key={previewAudioUrl}>
              <source src={previewAudioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text">Script</Label>
          <Textarea
            id="text"
            placeholder="Enter your script here... Example: Good evening, in Sydney tonight we're tracking a developing story as..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {text.length} characters
          </p>
        </div>

        {/* Actions */}
        <Button
          onClick={handleAddToTimeline}
          disabled={!text.trim()}
          className="w-full"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Add to Timeline
        </Button>

        <p className="text-xs text-muted-foreground">
          TTS audio will be generated during video rendering.
        </p>
      </CardContent>
    </Card>
  )
}
