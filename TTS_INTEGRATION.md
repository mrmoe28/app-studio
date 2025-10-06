# Text-to-Speech Integration

**Date**: October 5, 2025
**Feature**: AI Voice Generation for Video Voiceovers
**Provider**: Shotstack Create API + Built-in TTS

---

## Overview

PromoForge now includes professional AI text-to-speech capabilities for generating voiceovers. Users can convert written scripts into natural-sounding speech in multiple languages and voices, then integrate them into their video timeline.

## Features

### ✅ Implemented

1. **Multi-Voice Selection**
   - 19 professional voices across 7 languages
   - Male and female voice options
   - Regional accents (US, UK, Australian English)

2. **TTS Panel Interface**
   - Script text area with character counter
   - Voice selection dropdown
   - Real-time audio preview
   - Download generated audio

3. **Integrated Workflow**
   - Side panel in video editor
   - Tabbed interface (Voice/Upload)
   - Automatic audio URL tracking
   - Toast notifications for feedback

4. **API Integration**
   - Shotstack Create API for TTS generation
   - Secure server-side API key handling
   - Error handling and validation

### 🔄 Planned

- [ ] Automatic addition of audio clips to timeline
- [ ] Audio waveform visualization
- [ ] Multiple voiceover layers
- [ ] Script timing synchronization
- [ ] Batch TTS generation
- [ ] ElevenLabs integration option

---

## Available Voices

### English (US)
- **Matthew** - Male, natural American accent
- **Joanna** - Female, professional news anchor style
- **Joey** - Male, casual conversational
- **Justin** - Male, young adult
- **Kendra** - Female, warm and friendly
- **Salli** - Female, clear and articulate

### English (British)
- **Amy** - Female, received pronunciation
- **Brian** - Male, British news reader
- **Emma** - Female, soft British accent

### English (Australian)
- **Nicole** - Female, Australian accent
- **Russell** - Male, Australian accent

### Spanish (Spain)
- **Miguel** - Male, Castilian Spanish
- **Penélope** - Female, Castilian Spanish

### French (France)
- **Céline** - Female, Parisian French
- **Mathieu** - Male, Parisian French

### German
- **Hans** - Male, standard German
- **Marlene** - Female, standard German

### Italian
- **Giorgio** - Male, standard Italian
- **Carla** - Female, standard Italian

---

## Usage Guide

### 1. Access TTS Panel

Navigate to the Video Editor and look for the side panel on the right. Switch to the "Voice" tab.

### 2. Write Your Script

```
Example script:
"Good evening, in Sydney tonight we're tracking a developing story
as residents prepare for the approaching storm system."
```

### 3. Select Voice

Choose from the dropdown menu based on:
- **Language** of your target audience
- **Gender** preference
- **Accent** (US, UK, Australian for English)

### 4. Generate Speech

Click "Generate Speech" and wait for the API to process (usually 3-10 seconds depending on script length).

### 5. Preview & Download

- Use the audio player to preview
- Download the audio file using the download button
- Audio is automatically tracked for future timeline integration

---

## API Implementation

### Route: `/api/generate-tts`

**Method:** POST

**Request Body:**
```json
{
  "text": "Your script text here",
  "voice": "Joanna"
}
```

**Response (Success):**
```json
{
  "success": true,
  "audioUrl": "https://shotstack-cdn.s3.amazonaws.com/...",
  "data": {
    "url": "https://shotstack-cdn.s3.amazonaws.com/...",
    "duration": 5.2,
    "size": 83456
  }
}
```

**Response (Error):**
```json
{
  "error": "Text is required"
}
```

### Shotstack Create API Call

```typescript
POST https://api.shotstack.io/v1/create/tts
Headers:
  Content-Type: application/json
  x-api-key: YOUR_API_KEY

Body:
{
  "provider": "shotstack",
  "options": {
    "type": "text-to-speech",
    "text": "Your script text",
    "voice": "Joanna"
  }
}
```

---

## Component Architecture

### `TextToSpeechPanel.tsx`

**Location:** `src/components/TextToSpeechPanel.tsx`

**Props:**
```typescript
interface TextToSpeechPanelProps {
  onAudioGenerated?: (audioUrl: string) => void
}
```

**State Management:**
```typescript
const [text, setText] = useState('')              // Script text
const [voice, setVoice] = useState('Joanna')      // Selected voice
const [isGenerating, setIsGenerating] = useState(false)  // Loading state
const [audioUrl, setAudioUrl] = useState<string | null>(null)  // Generated audio
```

**Key Functions:**
- `handleGenerate()` - Calls TTS API and handles response
- `handleDownload()` - Opens audio URL in new tab for download

### Integration in Editor

**Location:** `src/app/editor/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Video Editor Header                                │
└─────────────────────────────────────────────────────┘
┌─────────────────────┬───────────────────────────────┐
│                     │  ┌─────────────────────────┐  │
│                     │  │ [Voice] [Upload]       │  │
│                     │  ├─────────────────────────┤  │
│   Video Editor      │  │ Text to Speech         │  │
│   (3/4 width)       │  │                        │  │
│                     │  │ Voice: [Dropdown]      │  │
│   - Toolbar         │  │                        │  │
│   - Canvas          │  │ Script:                │  │
│   - Timeline        │  │ [Text Area]            │  │
│                     │  │                        │  │
│                     │  │ [Generate Speech]      │  │
│                     │  │                        │  │
│                     │  │ Preview:               │  │
│                     │  │ [Audio Player]         │  │
│                     │  └─────────────────────────┘  │
│                     │          (1/4 width)          │
└─────────────────────┴───────────────────────────────┘
```

**Audio Tracking:**
```typescript
const [audioUrls, setAudioUrls] = useState<string[]>([])

const handleAudioGenerated = (audioUrl: string) => {
  setAudioUrls(prev => [...prev, audioUrl])
}
```

---

## Environment Variables

**Required:**
```bash
SHOTSTACK_API_KEY=your_api_key_here
SHOTSTACK_API_ENV=v1
```

**Get API Key:**
1. Sign up at https://dashboard.shotstack.io
2. Navigate to API Keys
3. Copy your production or staging key
4. Add to `.env.local` (local) or Vercel (production)

---

## Error Handling

### Common Errors

**Error:** "Shotstack API key not configured"
**Solution:** Set `SHOTSTACK_API_KEY` in environment variables

**Error:** "Text is required"
**Solution:** Enter text in the script field before generating

**Error:** "Failed to generate speech"
**Causes:**
- API rate limiting
- Invalid voice selection
- Network connectivity issues
- Text too long (>3000 characters typically)

**Solution:** Check API quotas, verify voice exists, retry with shorter text

---

## API Limits & Pricing

### Shotstack Create API

- **Free Tier:** 20 renders/month
- **Developer:** 500 renders/month ($29/mo)
- **Business:** 2,000 renders/month ($99/mo)

### TTS Specifics

- **Max Text Length:** ~3,000 characters per request
- **Audio Format:** MP3, AAC
- **Quality:** Professional broadcast quality
- **Processing Time:** 3-10 seconds typical
- **File Size:** ~80KB per 5 seconds of audio

---

## Best Practices

### 1. Script Writing

- **Natural Language:** Write as you would speak
- **Punctuation:** Use periods and commas for natural pauses
- **Acronyms:** Spell out or hyphenate (e.g., "U.S." or "U-S")
- **Numbers:** Write out small numbers ("five" not "5")
- **Emphasis:** Use CAPS sparingly for emphasis

### 2. Voice Selection

- **Match Content:** News = professional voices (Joanna, Matthew)
- **Target Audience:** Use regional accents appropriately
- **Consistency:** Use same voice throughout video
- **Gender Balance:** Consider audience preferences

### 3. Performance

- **Keep Scripts Short:** Under 500 characters for quick generation
- **Batch Generation:** Generate all audio before editing
- **Cache Audio:** Download and reuse generated files
- **Preview First:** Always preview before adding to timeline

---

## Future Enhancements

### Phase 2: Timeline Integration
```typescript
// Automatically add audio to timeline when generated
const handleAudioGenerated = (audioUrl: string) => {
  if (editRef.current) {
    editRef.current.addClip(1, {  // Track 1 = audio track
      asset: {
        type: 'audio',
        src: audioUrl
      },
      start: 0,
      length: 'auto'  // Match audio duration
    })
  }
  setAudioUrls(prev => [...prev, audioUrl])
}
```

### Phase 3: Advanced Features

**Script Timing:**
```typescript
// Sync voiceover with specific clips
interface TimedScript {
  clipIndex: number
  text: string
  voice: string
  start: number  // When to start in video
}
```

**Multi-Voice Dialogue:**
```typescript
// Different voices for different speakers
const dialogue = [
  { speaker: 'narrator', voice: 'Joanna', text: '...' },
  { speaker: 'character', voice: 'Matthew', text: '...' }
]
```

**Waveform Visualization:**
- Display audio waveform in timeline
- Visual editing of audio clips
- Fade in/out controls

---

## Testing

### Manual Test Checklist

- [ ] Open video editor with screenshots
- [ ] Switch to "Voice" tab in side panel
- [ ] Enter test script (e.g., "Hello world")
- [ ] Select different voices
- [ ] Click "Generate Speech"
- [ ] Verify loading state shows
- [ ] Verify success toast appears
- [ ] Preview audio in player
- [ ] Download audio file
- [ ] Verify multiple generations work
- [ ] Test with long text (>1000 characters)
- [ ] Test with special characters
- [ ] Test error handling (empty text)

### Automated Tests (TODO)

```typescript
describe('TextToSpeechPanel', () => {
  it('generates speech with valid input', async () => {
    const onAudioGenerated = jest.fn()
    render(<TextToSpeechPanel onAudioGenerated={onAudioGenerated} />)

    // Enter text
    const textarea = screen.getByPlaceholderText(/enter your script/i)
    fireEvent.change(textarea, { target: { value: 'Test script' } })

    // Generate
    const button = screen.getByText(/generate speech/i)
    fireEvent.click(button)

    // Verify callback
    await waitFor(() => {
      expect(onAudioGenerated).toHaveBeenCalledWith(expect.stringContaining('http'))
    })
  })
})
```

---

## Troubleshooting

### Issue: No audio generated

**Checks:**
1. Verify SHOTSTACK_API_KEY is set
2. Check browser console for errors
3. Verify Shotstack API quota not exceeded
4. Test API key in Shotstack dashboard

### Issue: Poor audio quality

**Solutions:**
- Try different voices
- Check text for formatting issues
- Ensure no special characters causing problems
- Contact Shotstack support for voice quality issues

### Issue: Generation too slow

**Causes:**
- Long text (>1000 characters)
- API server load
- Network latency

**Solutions:**
- Split long scripts into segments
- Generate during off-peak hours
- Cache frequently used audio

---

## Security Considerations

### API Key Protection

✅ **Correct:**
```typescript
// Server-side API route
const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY
```

❌ **Incorrect:**
```typescript
// Client-side - NEVER DO THIS
const apiKey = 'sk_xxx'  // Exposed to users!
```

### Input Validation

```typescript
// Sanitize and validate user input
if (!text || typeof text !== 'string') {
  return error
}

if (text.length > 3000) {
  return error('Text too long')
}

// Trim and clean
const cleanText = text.trim()
```

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// Example with upstash/ratelimit
const { success } = await ratelimit.limit(
  `tts_${request.ip}`,
  '10 per hour'
)

if (!success) {
  return error('Rate limit exceeded')
}
```

---

## Summary

**Features Added:**
- ✅ TTS Panel with 19 voices in 7 languages
- ✅ Real-time audio generation via Shotstack Create API
- ✅ Audio preview and download
- ✅ Integrated side panel in video editor
- ✅ Tabbed interface for Voice/Upload
- ✅ Toast notifications and error handling
- ✅ Secure server-side API integration

**Files Created:**
- `src/components/TextToSpeechPanel.tsx` - TTS UI component
- `src/app/api/generate-tts/route.ts` - API route
- `TTS_INTEGRATION.md` - This documentation

**Files Modified:**
- `src/app/editor/page.tsx` - Added TTS panel integration
- `src/components/VideoEditor.tsx` - Added audioUrls prop
- `package.json` - Added @radix-ui/react-tabs

**Dependencies Added:**
- `@radix-ui/react-tabs` - For tabbed interface

---

**Status**: ✅ Complete and Ready for Testing
**Next Steps**: Test TTS generation → Implement timeline audio integration
