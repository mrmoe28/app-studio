# PromoForge - Project Context & Memory

## Current Project State

**PromoForge** is a Next.js 15 application that automatically generates professional promotional videos. The app supports two workflows:
1. **URL-based**: Scrapes website content and generates promo video
2. **Image-based**: Creates videos from uploaded images with custom captions

- **Status**: ✅ Core functionality complete with advanced features
- **Created**: 2025-10-04
- **Stage**: Production-ready MVP
- **Repository**: https://github.com/mrmoe28/app-studio
- **Branch**: main
- **Deployment**: Vercel (auto-deploy on git push)

## Core Features Implemented

### 1. **URL Scraping** (Puppeteer - Vercel Compatible)
- Captures page title, description, and metadata
- Multi-page scraping with screenshot gallery
- Extracts logo/favicon and theme color
- Gathers keywords for context
- Migrated from Playwright to Puppeteer for Vercel compatibility

### 2. **Video Generation** (Shotstack REST API)
- Automated video editing using JSON templates
- Ken Burns effect (slow zoom) on images
- Title and description overlays with custom styling
- Logo watermarking in corner
- Fade transitions between scenes
- **Voiceover support** with text-to-speech
- **Background music** with custom upload capability
- Multiple aspect ratio support (9:16, 1:1, 16:9)

### 3. **Real-time Status Monitoring**
- Polls Shotstack API every 5 seconds
- Shows progress to user
- Downloads video when complete
- Max 5-minute timeout with user notification

### 4. **Modern UI** (ShadCN + Tailwind)
- Clean, professional interface
- Form validation with React Hook Form + Zod
- Loading states and progress indicators
- Responsive design
- Video preview and download
- Voice and music preview players

## Tech Stack

- **Framework**: Next.js 15 + React 19 + App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3 + ShadCN UI (migrated from v4 for compatibility)
- **Scraping**: Puppeteer (headless Chrome)
- **Video**: Shotstack REST API (not SDK - better compatibility)
- **Storage**: Vercel Blob for screenshots
- **Validation**: Zod
- **Forms**: React Hook Form
- **Database**: NeonDB (configured but optional)
- **Deployment**: Vercel (auto-deploy on git push)

## Recent Decisions

### Video Generation API Selection (January 2025)

**Research Conducted**: Evaluated 5+ video generation solutions
- Shotstack (Official SDK + REST API)
- Creatomate (Template-based)
- Remotion (React-based rendering)
- FFmpeg.wasm (Client-side)
- Mux (Video hosting only)
- HeyGen/Synthesia (Avatar-focused)

**Decision**: Use **Shotstack REST API** (not SDK)

**Rationale**:
1. Already have active Shotstack API key
2. Official SDK has CommonJS/ES module compatibility issues with Next.js 15
3. REST API provides full control with TypeScript types
4. Better error handling and logging capabilities
5. Proven reliability in production environments
6. Best fit for template-based promotional videos
7. Free sandbox for testing, $49/month for 200 minutes (affordable)

**Alternative**: Creatomate configured as fallback (env flag: `VIDEO_PROVIDER`)

**Rejected alternatives:**
- ❌ **Mux**: Video hosting only, not generation
- ❌ **Remotion**: Requires React coding + self-hosted infrastructure
- ❌ **HeyGen/Synthesia**: Avatar-focused, overkill for app promos

### Architecture (Next.js API Routes Only)

**Why NO Express:**
- ✅ Simpler deployment (single Vercel instance)
- ✅ Serverless auto-scaling
- ✅ Built-in hot reload and TypeScript support
- ✅ Perfect for our short, task-oriented API calls

**Video Library Structure**:
```
src/lib/video/
├── index.ts          # Provider switching logic
├── shotstack.ts      # Shotstack REST API implementation
└── creatomate.ts     # Creatomate alternative (future)
```

## Architecture Details

### API Routes
```
POST /api/scrape
  → Input: { url: string }
  → Output: ScrapedAsset (title, description, screenshots, logo, etc.)
  → Storage: Vercel Blob for screenshots (not base64)
  → Timeout: 60s

POST /api/generate
  → Input: VideoGeneration (title, description, images, theme, voiceover, music, etc.)
  → Output: { renderId: string }
  → Triggers: Shotstack render job
  → Features: Voiceover, background music, multi-page screenshots

GET /api/status/[renderId]
  → Input: renderId (URL param)
  → Output: { status: string, url?: string }
  → Polls: Shotstack render status

POST /api/test-generate
  → Test endpoint for video generation
  → Input validation using Zod schemas
  → Comprehensive error handling and logging
```

### Data Flow
```
User enters URL or uploads images
  ↓
Scrape API (Puppeteer) [if URL workflow]
  ↓
Upload screenshots to Vercel Blob
  ↓
Display preview with voice/music options
  ↓
User clicks "Generate"
  ↓
Generate API (Shotstack REST)
  ↓
Poll Status API every 5s
  ↓
Display video when done
```

### File Structure
```
/promoforge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape/route.ts              # URL scraping endpoint
│   │   │   ├── generate/route.ts            # Video generation endpoint
│   │   │   ├── status/[renderId]/route.ts   # Status polling
│   │   │   └── test-generate/route.ts       # Test endpoint
│   │   ├── page.tsx                         # Main UI (client component)
│   │   ├── layout.tsx                       # Root layout
│   │   └── globals.css
│   ├── components/ui/                       # ShadCN components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── scraper.ts                       # Puppeteer scraping logic
│   │   ├── shotstack.ts                     # Shotstack REST API
│   │   ├── video/
│   │   │   ├── index.ts                     # Provider switching
│   │   │   ├── shotstack.ts                 # Shotstack implementation
│   │   │   └── creatomate.ts                # Creatomate alternative
│   │   ├── schemas.ts                       # Zod validation schemas
│   │   └── utils.ts                         # Utility functions
│   └── types/
│       ├── index.ts                         # Core type definitions
│       └── shotstack-sdk.d.ts               # Shotstack SDK types
├── .env.local                               # API keys (gitignored)
├── .env.example                             # Template for env vars
├── next.config.ts                           # Next.js configuration
├── vercel.json                              # Vercel deployment config
├── package.json
├── components.json                          # ShadCN config
└── tsconfig.json
```

## Technical Implementation Notes

### Scraping Strategy
- Uses Puppeteer (not Playwright) for Vercel compatibility
- Multi-page screenshot capture with gallery
- Vercel Blob storage for screenshots (not base64)
- Absolute URL resolution for logos
- 30-second timeout with error handling
- Environment-specific Chromium executable paths

### Video Template Design
- Duration: 15 seconds default (customizable)
- Layout: Images with Ken Burns effect (1.1x scale)
- Text: Title + Description overlays
- Logo: Top-right corner, 15% size
- Transitions: Fade in/out
- Output: 1080p MP4, 25fps
- Voiceover: Text-to-speech with multiple voice options
- Music: Background audio with custom upload support

### Shotstack API Best Practices

**Resolution Configuration**:
```typescript
{
  resolution: 'hd',          // Use standard: preview|mobile|sd|hd|1080
  aspectRatio: '9:16',       // Optional: 9:16|1:1|16:9
  format: 'mp4'              // Output format
}
```

**Timeline Structure**:
- Each shot gets 2 seconds duration
- Text overlays start 0.2s after image, last 1.6s
- Effects: `zoomIn` for dynamic feel
- Text position: `bottom` with `minimal` style

**Error Handling**:
- Always log full error response from API
- Parse and display validation errors
- Include request ID in error messages for debugging
- Use proper TypeScript error handling (avoid `any`)
- Zod validation on all API inputs
- Try/catch blocks with proper HTTP status codes
- User-friendly error messages
- Timeout handling for long-running operations

### Type Safety
- Custom TypeScript definitions for Shotstack SDK
- Strict mode enabled
- No `any` types without justification
- Zod runtime validation + TypeScript compile-time checking

## Environment Variables

### Required
```bash
SHOTSTACK_API_KEY=your_key_here
SHOTSTACK_API_ENV=sandbox  # or 'v1' for production
```

### Optional
```bash
DATABASE_URL=postgresql://neondb_owner:...
NEXT_PUBLIC_APP_URL=http://localhost:3000
VIDEO_PROVIDER=shotstack   # or 'creatomate'
CREATOMATE_API_KEY=        # If using Creatomate
VIDEO_ASPECT=9:16          # Default aspect ratio
```

## Known Issues & Solutions

### Fixed Issues ✅

1. **Shotstack 500 Error** (Fixed: Jan 2025)
   - **Problem**: Using wrong API endpoint (`/stage/render` instead of `/edit/v1/render`)
   - **Solution**: Updated to correct endpoint structure

2. **SDK Import Errors** (Fixed: Jan 2025)
   - **Problem**: Shotstack SDK uses CommonJS, causing import errors in Next.js 15 ES modules
   - **Solution**: Switched to REST API with custom TypeScript types

3. **Resolution Validation Errors** (Fixed: Jan 2025)
   - **Problem**: Used non-existent resolution values (`vertical-720p`, `square-720p`)
   - **Solution**: Use standard resolutions (`hd`, `sd`, `1080`) + `aspectRatio` field
   - **Valid Resolutions**: `preview`, `mobile`, `sd`, `hd`, `1080`
   - **Aspect Ratios**: `9:16` (vertical), `1:1` (square), `16:9` (widescreen - default)

4. **Playwright Vercel Compatibility** (Fixed: Jan 2025)
   - **Problem**: Playwright requires special buildpack configuration on Vercel
   - **Solution**: Migrated to Puppeteer with environment-specific Chromium paths

5. **Base64 Screenshot Issues** (Fixed: Jan 2025)
   - **Problem**: Large base64 strings causing performance issues
   - **Solution**: Use Vercel Blob storage for screenshots

6. **Tailwind v4 Compatibility** (Fixed: Jan 2025)
   - **Problem**: Tailwind v4 caused deployment issues
   - **Solution**: Downgraded to Tailwind v3 for stability

### Current Limitations
- Shotstack sandbox has watermarks (production key needed for clean videos)
- No user authentication yet
- No video storage/history
- Limited customization options in UI

### Testing Needed
- Real-world URL scraping (different website structures)
- Shotstack rendering in sandbox environment
- Performance under load
- Error edge cases

## Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000 or 3002)

# Quality Checks
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint (must pass before commit)

# Production
npm run build            # Build for production
npm run start            # Start production server

# Git
git add -A
git commit -m "..."
git push                 # Auto-triggers Vercel deployment
```

## Testing

### Manual Testing

Test video generation:
```bash
curl -X POST http://localhost:3002/api/test-generate \
  -H "Content-Type: application/json" \
  -d '{
    "shots": [
      {
        "imageUrl": "https://shotstack-assets.s3.amazonaws.com/images/beach1.jpg",
        "caption": "Beautiful Beach"
      }
    ],
    "aspect": "9:16"
  }'
```

Expected Response:
```json
{
  "success": true,
  "provider": "shotstack",
  "data": {
    "success": true,
    "message": "Render queued successfully",
    "response": {
      "message": "Render Successfully Queued",
      "id": "uuid-here"
    }
  }
}
```

### Test Coverage
- ✅ Single image with caption (9:16)
- ✅ Multiple images (3 shots) with square aspect (1:1)
- ✅ Multi-page scraping with screenshot gallery
- ✅ Voiceover and background music
- ✅ Input validation (Zod schema)
- ✅ Error handling (400, 500 errors)
- ✅ ESLint passes with no errors
- ✅ TypeScript strict mode compliance

## Feature Status Checklist

- ✅ Project initialization
- ✅ ShadCN UI installation
- ✅ TypeScript types and Zod schemas
- ✅ Puppeteer scraping implementation (Vercel compatible)
- ✅ Shotstack video generation (REST API)
- ✅ Multi-page scraping with gallery
- ✅ Voiceover support
- ✅ Background music support
- ✅ API routes (scrape, generate, status, test-generate)
- ✅ Frontend UI with real-time updates
- ✅ Error handling and validation
- ✅ Vercel Blob storage for screenshots
- ✅ All linting and type checking passing
- ✅ Pushed to GitHub
- ✅ Vercel deployment configuration
- ⏳ Production testing
- ⏳ User authentication
- ⏳ Database integration
- ⏳ Enhanced video customization UI

## Next Steps

### Immediate
1. ✅ Complete git push to GitHub
2. Verify Vercel auto-deployment
3. Test in production environment
4. Test URL scraping with real app URLs

### Future Enhancements

1. **Customization Options**:
   - Duration selector (5-60 seconds)
   - Music library selection
   - Custom color themes
   - Logo upload
   - More voice options

2. **Database Integration**:
   - Save generated videos
   - User accounts
   - Video history

3. **Production Readiness**:
   - Rate limiting
   - Authentication
   - Usage analytics
   - Error reporting (Sentry)
   - Webhook handling for render completion

4. **Features**:
   - Video templates
   - Custom transitions between shots
   - Brand watermark overlay
   - Cache rendered videos
   - Progress indicators

## Key Learnings & Best Practices

1. **Research First**: Compared 5+ video APIs before choosing Shotstack
2. **Keep It Simple**: Chose Next.js API routes over Express (less complexity)
3. **Type Safety**: Created custom Shotstack SDK types for full TypeScript support
4. **Error Handling**: Comprehensive validation with Zod + proper HTTP status codes
5. **User Experience**: Real-time polling keeps users informed of progress
6. **Image Optimization**: Used Next.js Image component for better performance
7. **NO Turbopack**: Using standard builds for maximum compatibility
8. **Always research API documentation first** - Saved hours by checking actual valid values
9. **Use REST over SDK when module compatibility is unclear** - More control, better debugging
10. **Validate early with Zod** - Catches errors before API calls
11. **Log complete error objects** - Shotstack returns detailed validation errors
12. **Test all aspect ratios** - Different ratios require different configuration
13. **Puppeteer over Playwright on Vercel** - Better compatibility without buildpacks
14. **Vercel Blob for assets** - Better than base64 for large files

## Common Errors & Solutions

**Error**: `Shotstack API Error (400): Validation failed for output`
- **Cause**: Invalid resolution or aspectRatio value
- **Fix**: Use valid values (see Resolution Configuration above)

**Error**: `SHOTSTACK_API_KEY environment variable is not set`
- **Cause**: Missing API key in .env.local
- **Fix**: Add key to .env.local file

**Error**: `Attempted import error: 'shotstack-sdk' does not contain a default export`
- **Cause**: CommonJS/ES module incompatibility
- **Fix**: Use REST API implementation instead of SDK

**Error**: `Cannot find Chromium executable`
- **Cause**: Puppeteer executable path not configured for environment
- **Fix**: Use environment-specific paths (see scraper.ts)

## Resources

- [Shotstack API Docs](https://shotstack.io/docs/api/)
- [Shotstack Node SDK](https://github.com/shotstack/shotstack-sdk-node)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Zod Validation](https://zod.dev/)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Puppeteer Docs](https://pptr.dev/)

---

**Last Updated**: January 2025
**Status**: Production-ready with advanced features ✅
**Next Review**: After production deployment and testing
