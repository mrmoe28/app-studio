# Shotstack Studio - Full Feature Integration

**Date**: October 5, 2025
**Integration**: Complete Shotstack Studio SDK with all features enabled

---

## Overview

PromoForge now includes the **complete Shotstack Studio SDK** with all professional video editing features. This upgrade provides browser-based video export, advanced editing tools, event-driven workflows, and custom theming.

## New Features Added

### 1. **Browser-Based Video Export (VideoExporter)**

Export videos directly in the browser without using the Shotstack API.

**Features:**
- Export to MP4 format (H.264 + AAC)
- Configurable FPS (default: 25fps)
- Progress feedback during export
- Direct download to user's computer

**Usage:**
```typescript
const exporter = new VideoExporter(edit, canvas)
await exporter.export('my-video.mp4', 25) // filename, fps
```

**UI Location:** Toolbar → "Export MP4" button

---

### 2. **Edit API Methods**

Complete programmatic control over the timeline.

**Available Methods:**

#### Clip Operations
```typescript
// Add clip to timeline
edit.addClip(trackIndex, {
  asset: {
    type: 'image',
    src: 'https://example.com/image.jpg'
  },
  start: 0,
  length: 5
})

// Delete clip
edit.deleteClip(trackIndex, clipIndex)

// Get clip
const clip = edit.getClip(trackIndex, clipIndex)
```

#### Track Operations
```typescript
// Add track
edit.addTrack(trackIndex, { clips: [] })

// Delete track
edit.deleteTrack(trackIndex)

// Get track
const track = edit.getTrack(trackIndex)
```

#### History Operations
```typescript
// Undo last change
edit.undo()

// Redo last undone change
edit.redo()
```

#### Playback Control
```typescript
// Play/pause
edit.play()
edit.pause()

// Seek to time (milliseconds)
edit.seek(2000) // 2 seconds

// Stop and return to beginning
edit.stop()
```

#### Get Edit Data
```typescript
// Get full edit configuration as JSON
const editJson = edit.getEdit()

// Get duration
const duration = edit.totalDuration // in milliseconds
```

**UI Location:**
- Toolbar → Undo/Redo buttons
- Toolbar → Add Track button
- Toolbar → Delete Clip button (when clip selected)

---

### 3. **Event System**

Listen to edit events for reactive UI updates.

**Available Events:**

#### Clip Selection
```typescript
edit.events.on('clip:selected', (data) => {
  console.log('Clip selected:', data.clip)
  console.log('Track index:', data.trackIndex)
  console.log('Clip index:', data.clipIndex)
})
```

#### Clip Updates
```typescript
edit.events.on('clip:updated', (data) => {
  console.log('Previous state:', data.previous)
  console.log('Current state:', data.current)
})
```

#### Edit History
```typescript
edit.events.on('edit:undo', () => {
  console.log('Undo performed')
})

edit.events.on('edit:redo', () => {
  console.log('Redo performed')
})
```

**Current Implementation:**
- Toast notifications for clip selection
- Toast notifications for clip updates
- Toast notifications for undo/redo
- Selected clip state tracking

---

### 4. **Dark Theme for Timeline**

Professional dark theme matching modern video editing software.

**Theme Configuration:**
```typescript
const darkTheme = {
  timeline: {
    background: '#1e1e1e',
    playhead: '#3b82f6',
    toolbar: {
      background: '#1a1a1a',
      surface: '#2a2a2a',
      hover: '#3a3a3a',
      active: '#3b82f6',
      icon: '#888888',
      text: '#ffffff'
    },
    ruler: {
      background: '#404040',
      text: '#ffffff',
      markers: '#666666'
    },
    tracks: {
      surface: '#2d2d2d',
      surfaceAlt: '#252525',
      border: '#3a3a3a'
    },
    clips: {
      image: '#f5a623',
      video: '#4a9eff',
      audio: '#00d4aa',
      selected: '#3b82f6'
    }
  }
}
```

**Features:**
- Asset-specific clip colors (image, video, audio, text, etc.)
- Customizable toolbar appearance
- Ruler styling
- Track backgrounds
- Selection highlighting

---

### 5. **Keyboard Shortcuts**

Full keyboard control via Controls component.

**Playback:**
- `Space` - Play/Pause
- `J` - Stop
- `K` - Pause
- `L` - Play
- `Left Arrow` - Seek backward
- `Right Arrow` - Seek forward
- `Shift + Arrow` - Seek larger amount
- `Comma (,)` - Step backward one frame
- `Period (.)` - Step forward one frame

**Editing:**
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + E` - Export/download video

---

## Updated Toolbar

The toolbar now includes all professional editing tools:

### **Sections:**

1. **Playback Controls**
   - Skip Back (-1s)
   - Play/Pause
   - Skip Forward (+1s)

2. **Timeline Zoom**
   - Zoom Out
   - Zoom Slider (50%-200%)
   - Zoom Percentage Display
   - Zoom In
   - Fit to Screen

3. **Editing Tools**
   - Split Clip
   - Trim Clip

4. **History**
   - Undo (Cmd/Ctrl+Z)
   - Redo (Cmd/Ctrl+Shift+Z)

5. **Track & Clip Management**
   - Add Track
   - Delete Selected Clip

6. **Export Options**
   - Save JSON (download edit configuration)
   - Export MP4 (browser-based video export)
   - Render API (Shotstack cloud rendering)

---

## Usage Examples

### Export Video in Browser

```typescript
// User clicks "Export MP4" button
const handleExportVideo = async () => {
  const exporter = new VideoExporter(edit, canvas)
  await exporter.export('promo-video.mp4', 25)
  // Downloads MP4 to user's computer
}
```

### Add Screenshot to Timeline

```typescript
// Add dragged screenshot to timeline
const handleDrop = () => {
  edit.addClip(0, {
    asset: {
      type: 'image',
      src: draggedScreenshot
    },
    start: 0,
    length: 3 // 3 seconds
  })
}
```

### Delete Selected Clip

```typescript
// User selects clip in timeline, then clicks delete
const handleDeleteClip = () => {
  if (selectedClip) {
    edit.deleteClip(selectedClip.trackIndex, selectedClip.clipIndex)
  }
}
```

### Add New Track

```typescript
// Add track for additional layer
const handleAddTrack = () => {
  const trackCount = edit.getEdit().timeline?.tracks?.length || 0
  edit.addTrack(trackCount, { clips: [] })
}
```

---

## Comparison: Export Options

| Feature | Browser Export (VideoExporter) | API Render (Shotstack) |
|---------|-------------------------------|------------------------|
| Speed | Slower (client-side) | Faster (cloud) |
| Quality | Good | Excellent |
| File Size | Larger | Optimized |
| Server Cost | Free | Requires API credits |
| Internet Required | No (after assets load) | Yes |
| Advanced Effects | Limited | Full support |
| Best For | Quick previews, testing | Production videos |

---

## Technical Details

### Dependencies
```json
{
  "@shotstack/shotstack-studio": "^1.6.0",
  "sonner": "^1.5.0" // For toast notifications
}
```

### File Changes
- **Modified**: `src/components/VideoEditor.tsx`
  - Added VideoExporter integration
  - Added event listeners
  - Added Edit API method handlers
  - Implemented dark theme
  - Enhanced toolbar with all features

### State Management
```typescript
const [selectedClip, setSelectedClip] = useState<{trackIndex: number, clipIndex: number} | null>(null)
const [isExporting, setIsExporting] = useState(false)
const [canUndo, setCanUndo] = useState(false)
const [canRedo, setCanRedo] = useState(false)
```

### Refs
```typescript
const editRef = useRef<Edit | null>(null)
const canvasRef = useRef<Canvas | null>(null)
const timelineRef = useRef<Timeline | null>(null)
const controlsRef = useRef<Controls | null>(null)
const exporterRef = useRef<VideoExporter | null>(null)
const templateRef = useRef<unknown>(null)
```

---

## Performance Considerations

### Browser Export
- Encodes video in browser using Web APIs
- Memory intensive for long videos
- Recommended max: 30 seconds @ 1080p
- FPS impacts export time (25fps recommended)

### Event Listeners
- Minimal performance impact
- Events fire only on actual changes
- Toast notifications debounced

### Theme
- Applied at initialization
- No runtime performance cost
- CSS-based rendering

---

## Future Enhancements

### Phase 2
- [ ] Custom transition effects
- [ ] Text overlay editor
- [ ] Audio mixer
- [ ] Effect presets
- [ ] Template library

### Phase 3
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Asset library management
- [ ] Batch export
- [ ] Social media format presets

---

## Troubleshooting

### Issue: Export fails or stalls
**Solution:** Reduce video duration or resolution. Browser export has memory limitations.

### Issue: Undo/Redo not working
**Solution:** Ensure Controls component is loaded. Check browser console for errors.

### Issue: Events not firing
**Solution:** Verify event listeners are attached after `edit.load()` completes.

### Issue: Theme not applying
**Solution:** Theme must be passed during Timeline construction, not after.

---

## Resources

- [Shotstack Studio SDK Docs](https://shotstack.io/docs/guide/studio-sdk/)
- [Shotstack Studio GitHub](https://github.com/shotstack/shotstack-studio-sdk)
- [API Reference](https://shotstack.io/docs/api/)
- [Example Demos](https://studio.shotstack.io/)

---

**Status**: ✅ Complete and Tested
**Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
**Breaking Changes**: None (backward compatible)
