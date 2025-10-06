'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Volume2 } from 'lucide-react'
import { toast } from 'sonner'

interface TTSClipData {
  text: string
  voice: string
}

interface TextToSpeechPanelProps {
  onAddTTSClip?: (clipData: TTSClipData) => void
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
        <Button
          onClick={handleAddToTimeline}
          disabled={!text.trim()}
          className="w-full"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Add to Timeline
        </Button>

        <p className="text-xs text-muted-foreground">
          TTS will be generated during video rendering. No preview available.
        </p>
      </CardContent>
    </Card>
  )
}
