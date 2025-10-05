# Screenshot Upload Feature

**Added:** October 5, 2025
**Feature:** Direct screenshot upload capability

---

## Overview

Users can now upload their own screenshots directly instead of scraping websites. This provides more flexibility and control over the content used in promotional videos.

## Features

### 📤 Upload Capability
- **Direct Upload:** Upload up to 10 screenshots at once
- **Supported Formats:** JPEG, JPG, PNG, WebP
- **File Size Limit:** 10MB per image
- **Preview:** See uploaded images before generating video

### 🎯 Three Input Modes

1. **Single URL** - Scrape one website
2. **Multiple URLs** - Scrape multiple websites
3. **Upload** - Upload your own screenshots ✨ NEW!

---

## How It Works

### User Flow

1. **Select Upload Mode**
   - Click "Upload" button in mode selector
   - Upload mode interface appears

2. **Choose Files**
   - Click "Choose Files" button
   - Select 1-10 images from your device
   - Preview appears immediately

3. **Upload Screenshots**
   - Review previews
   - Remove unwanted images (click X)
   - Click "Upload X Images" button
   - Screenshots upload to Vercel Blob storage

4. **Generate Video**
   - Configure audio settings (optional)
   - Click "Generate Promo Video"
   - Video created using uploaded screenshots

### Technical Flow

```
User selects files
    ↓
Client validates (type, size)
    ↓
FormData created with files
    ↓
POST /api/upload-screenshots
    ↓
Server validates each file
    ↓
Upload to Vercel Blob storage
    ↓
Return public URLs
    ↓
Display preview to user
    ↓
Use in video generation
```

---

## API Endpoint

### `POST /api/upload-screenshots`

**Request:**
```typescript
Content-Type: multipart/form-data

FormData {
  screenshots: File[]  // 1-10 image files
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "screenshots": [
      "https://blob.vercel-storage.com/uploads/1696512000000-0-image1.jpg",
      "https://blob.vercel-storage.com/uploads/1696512000000-1-image2.jpg"
    ],
    "count": 2
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid file type: image/gif. Allowed: JPEG, PNG, WebP"
}
```

**Validation Rules:**
- Max 10 files per upload
- Max 10MB per file
- Allowed types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- Files stored with timestamp prefix: `uploads/{timestamp}-{index}-{filename}`

---

## Component Structure

### New Components

#### 1. `ScreenshotUpload.tsx`
**Purpose:** Upload interface component

**Features:**
- File input with drag-drop support
- Image preview grid (2-5 columns responsive)
- Remove individual images
- Upload progress indication
- File size and count display

**Props:**
```typescript
interface ScreenshotUploadProps {
  onUploadComplete: (screenshots: string[]) => void
}
```

#### 2. Upload API Route
**File:** `src/app/api/upload-screenshots/route.ts`

**Features:**
- File validation (type, size, count)
- Vercel Blob upload
- Error handling
- Logging

---

## UI Changes

### Mode Selector
**Before:**
```
[ Single URL ] [ Multiple URLs ]
```

**After:**
```
[ Single URL ] [ Multiple URLs ] [ Upload ]
```

### Upload Mode Interface

```
┌─────────────────────────────────────┐
│ Upload Screenshots                  │
│ Upload your own screenshots         │
├─────────────────────────────────────┤
│                                     │
│  [ Choose Files ] [ Upload X Images]│
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ IMG │ │ IMG │ │ IMG │           │
│  │  1  │ │  2  │ │  3  │           │
│  └─────┘ └─────┘ └─────┘           │
│                                     │
│  3 files selected • 2.45 MB total   │
└─────────────────────────────────────┘
```

### Uploaded Preview

```
┌─────────────────────────────────────┐
│ Uploaded Screenshots (3)            │
│ These will be used for your video   │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │         │ │         │ │         ││
│  │ Image 1 │ │ Image 2 │ │ Image 3 ││
│  │         │ │         │ │         ││
│  └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────┘
```

---

## Code Changes

### Files Added
1. ✅ `/src/app/api/upload-screenshots/route.ts` - Upload API
2. ✅ `/src/components/ScreenshotUpload.tsx` - Upload UI

### Files Modified
1. ✅ `/src/app/page.tsx` - Added upload mode and state
   - New state: `uploadedScreenshots`
   - New mode: `'upload'`
   - Updated `generateVideo()` to handle uploaded screenshots
   - Added Upload mode toggle button
   - Added preview section for uploaded screenshots

### State Management

```typescript
// New state
const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([])
const [inputMode, setInputMode] = useState<'single' | 'multiple' | 'upload'>('single')

// Updated video generation logic
const screenshots = inputMode === 'single'
  ? (scrapedData?.screenshots.slice(0, 10) || [])
  : inputMode === 'multiple'
  ? selectedScreenshots.slice(0, 10)
  : uploadedScreenshots.slice(0, 10)  // ← New!
```

---

## Use Cases

### 1. Existing Screenshots
**Scenario:** User already has screenshots from their app
**Benefit:** No need to scrape website, faster workflow

### 2. Edited/Branded Screenshots
**Scenario:** User wants custom-designed screenshots
**Benefit:** Upload pre-edited images with branding

### 3. Mixed Content
**Scenario:** User wants screenshots + custom graphics
**Benefit:** Upload combination of different image types

### 4. Offline Workflow
**Scenario:** App not yet deployed/public
**Benefit:** Generate promo video before launch

### 5. Private/Protected Content
**Scenario:** App requires authentication
**Benefit:** Manually screenshot and upload instead of scraping

---

## Testing

### Manual Testing Checklist

- [ ] Select Upload mode
- [ ] Choose 1 image - verify preview
- [ ] Choose 10 images - verify max limit
- [ ] Try 11+ images - verify only 10 selected
- [ ] Try invalid format (GIF) - verify error
- [ ] Try >10MB file - verify error
- [ ] Remove image from preview - verify removed
- [ ] Upload images - verify success
- [ ] Check uploaded preview - verify all images
- [ ] Generate video with uploaded screenshots - verify works
- [ ] Switch modes - verify state preserved
- [ ] Upload then switch mode - verify upload persists

### Test Cases

```typescript
// Test 1: Valid upload
const files = [
  new File(['content'], 'test1.jpg', { type: 'image/jpeg' }),
  new File(['content'], 'test2.png', { type: 'image/png' })
]
// Expected: Success, 2 URLs returned

// Test 2: Invalid type
const file = new File(['content'], 'test.gif', { type: 'image/gif' })
// Expected: Error "Invalid file type"

// Test 3: Too large
const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg')
// Expected: Error "exceeds 10MB limit"

// Test 4: Too many files
const files = Array(11).fill(null).map((_, i) =>
  new File(['content'], `test${i}.jpg`, { type: 'image/jpeg' })
)
// Expected: Error "Maximum 10 screenshots allowed"
```

---

## Performance Considerations

### Client-Side
- **Preview Generation:** Creates object URLs (minimal overhead)
- **File Reading:** Done by browser (native performance)
- **State Updates:** Efficient React state management

### Server-Side
- **File Processing:** Minimal (just validation + upload)
- **Upload Time:** ~1-3 seconds for 10 images (depends on size)
- **Storage:** Vercel Blob (fast, CDN-backed)

### Optimization Tips
1. Compress images before upload (reduce file size)
2. Use WebP format for better compression
3. Limit to necessary screenshots only
4. Upload in batches if needed

---

## Security

### Implemented Protections
✅ File type validation (whitelist)
✅ File size limits (10MB per file)
✅ File count limits (max 10)
✅ Server-side validation (not just client)
✅ Public access URLs (no auth bypass risk)

### Potential Improvements
- [ ] Virus/malware scanning
- [ ] Image dimension validation
- [ ] Rate limiting per user/IP
- [ ] Content moderation (AI-based)
- [ ] Watermark detection

---

## Future Enhancements

### Phase 2 Ideas
1. **Drag & Drop Upload**
   - Drag files directly into upload area
   - Better UX than file picker

2. **Image Editing**
   - Crop/resize before upload
   - Add text overlays
   - Apply filters

3. **Bulk Actions**
   - Select multiple to remove
   - Reorder screenshots
   - Download all

4. **Templates**
   - Pre-defined screenshot layouts
   - Brand templates
   - Social media formats

5. **Cloud Integration**
   - Upload from Google Drive
   - Upload from Dropbox
   - Upload from URL

---

## Troubleshooting

### Issue: Upload fails silently
**Cause:** BLOB_READ_WRITE_TOKEN missing
**Solution:** Verify env var in Vercel Dashboard

### Issue: Preview not showing
**Cause:** Object URL revoked too early
**Solution:** Keep URLs in state until upload completes

### Issue: Large files timeout
**Cause:** 60s serverless function limit
**Solution:** Compress images client-side first

### Issue: Upload succeeds but video fails
**Cause:** Invalid image URLs or formats
**Solution:** Validate URLs before video generation

---

## Deployment

### Environment Variables Required
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_***  # Required for uploads
```

### Build Commands
```bash
npm run build          # Build with upload feature
npm run lint          # Verify no errors
npm run typecheck     # Check TypeScript
```

### Deployment Checklist
- [x] API endpoint created
- [x] Component added
- [x] State management updated
- [x] UI integrated
- [x] ESLint passing
- [x] TypeScript passing
- [x] Documentation complete

---

## Summary

The screenshot upload feature provides users with:
- ✅ More flexibility in content creation
- ✅ Faster workflow (no scraping needed)
- ✅ Better control over final output
- ✅ Support for custom/branded content
- ✅ Offline capability

**Total Files Changed:** 3
**Lines Added:** ~300
**Breaking Changes:** None
**Backward Compatible:** Yes

---

**Feature Status:** ✅ Complete and Ready for Deployment
**Documentation:** ✅ Complete
**Testing:** ⏳ Pending user testing
