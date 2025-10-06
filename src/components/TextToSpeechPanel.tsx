'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Volume2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface TextToSpeechPanelProps {
  onAudioGenerated?: (audioUrl: string) => void
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

export function TextToSpeechPanel({ onAudioGenerated }: TextToSpeechPanelProps) {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('Joanna')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to convert to speech')
      return
    }

    try {
      setIsGenerating(true)
      toast.info('Generating speech...')

      const response = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech')
      }

      setAudioUrl(data.audioUrl)
      toast.success('Speech generated successfully!')

      // Notify parent component
      if (onAudioGenerated) {
        onAudioGenerated(data.audioUrl)
      }
    } catch (error) {
      console.error('TTS generation failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate speech')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank')
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
          <Label htmlFor="voice">Voice</Label>
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
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Generate Speech
              </>
            )}
          </Button>
          {audioUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              title="Download audio file"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Audio Preview */}
        {audioUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
