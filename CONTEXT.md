# CONTEXT.md - PromoForge Project Memory

## Current Project State
- **Status**: ✅ Core functionality complete and deployed to GitHub
- **Created**: 2025-10-04
- **Stage**: MVP ready for testing
- **Repository**: https://github.com/mrmoe28/app-studio
- **Branch**: main

## Project Overview
**PromoForge** is a Next.js 15 application that automatically generates professional promotional videos for apps and websites. Users simply paste a URL, and the app:
1. Scrapes the website for content (title, description, screenshots)
2. Generates a polished promo video using Shotstack API
3. Provides download link when ready

## Core Features Implemented
### 1. **URL Scraping** (Playwright)
- Captures page title, description, and metadata
- Takes 3 screenshots at different scroll positions
- Extracts logo/favicon and theme color
- Gathers keywords for context

### 2. **Video Generation** (Shotstack API)
- Automated video editing using JSON templates
- Ken Burns effect (slow zoom) on images
- Title and description overlays with custom styling
- Logo watermarking in corner
- Fade transitions between scenes
- Background music support (optional)

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

## Recent Decisions

### Video API Selection (Shotstack)
**Why Shotstack:**
- ✅ Best fit for template-based promotional videos
- ✅ Free sandbox for testing
- ✅ $49/month for 200 minutes (affordable)
- ✅ JSON API for automation
- ✅ Built-in transitions, overlays, music mixing

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

### Tech Stack
- **Framework**: Next.js 15 + React 19 + App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + ShadCN UI
- **Scraping**: Playwright (headless Chrome)
- **Video**: Shotstack API
- **Validation**: Zod
- **Forms**: React Hook Form
- **Database**: NeonDB (configured but optional)
- **Deployment**: Vercel (auto-deploy on git push)

## Architecture Details

### API Routes
```
POST /api/scrape
  → Input: { url: string }
  → Output: ScrapedAsset (title, description, screenshots, logo, etc.)
  → Timeout: 60s

POST /api/generate
  → Input: VideoGeneration (title, description, images, theme, etc.)
  → Output: { renderId: string }
  → Triggers: Shotstack render job

GET /api/status/[renderId]
  → Input: renderId (URL param)
  → Output: { status: string, url?: string }
  → Polls: Shotstack render status
```

### Data Flow
```
User enters URL
  ↓
Scrape API (Playwright)
  ↓
Display preview
  ↓
User clicks "Generate"
  ↓
Generate API (Shotstack)
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
│   │   │   ├── scrape/route.ts       # URL scraping endpoint
│   │   │   ├── generate/route.ts     # Video generation endpoint
│   │   │   └── status/[renderId]/route.ts  # Status polling
│   │   ├── page.tsx                  # Main UI (client component)
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   ├── components/ui/                # ShadCN components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── scraper.ts                # Playwright scraping logic
│   │   ├── shotstack.ts              # Shotstack API integration
│   │   ├── schemas.ts                # Zod validation schemas
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       ├── index.ts                  # Core type definitions
│       └── shotstack-sdk.d.ts        # Shotstack SDK types
├── .env.local                        # API keys (gitignored)
├── .env.example                      # Template for env vars
├── next.config.ts                    # Next.js configuration
├── package.json
├── components.json                   # ShadCN config
└── tsconfig.json
```

## Technical Implementation Notes

### Scraping Strategy
- Uses Playwright with headless Chrome
- 3-position screenshot capture (top, 33%, 66% scroll)
- Base64 image encoding for instant preview
- Absolute URL resolution for logos
- 30-second timeout with error handling

### Video Template Design
- Duration: 15 seconds default
- Layout: Images with Ken Burns effect (1.1x scale)
- Text: Title (3s) + Description (12s)
- Logo: Top-right corner, 15% size
- Transitions: Fade in/out
- Output: 1080p MP4, 25fps

### Error Handling
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

```bash
# Required
SHOTSTACK_API_KEY=JfLy53hAnEB7kXHuX0x3acqlv1itoabFC5l2LRT6
SHOTSTACK_API_ENV=sandbox  # or 'v1' for production

# Optional
DATABASE_URL=postgresql://neondb_owner:...
PLAYWRIGHT_HEADLESS=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

### Immediate
1. ✅ Test locally: `npm run dev`
2. Test URL scraping with real app URLs
3. Test video generation with Shotstack sandbox
4. Deploy to Vercel (will auto-trigger on git push)

### Future Enhancements
1. **Customization Options**:
   - Duration selector (5-60 seconds)
   - Music library selection
   - Custom color themes
   - Logo upload
2. **Database Integration**:
   - Save generated videos
   - User accounts
   - Video history
3. **Production Readiness**:
   - Rate limiting
   - Authentication
   - Usage analytics
   - Error reporting (Sentry)
4. **Vercel Deployment**:
   - Configure Playwright buildpack
   - Set up environment variables in Vercel dashboard
   - Test in production environment

## Known Issues & Considerations

### Current Limitations
- Playwright may need special configuration on Vercel
- Shotstack sandbox has watermarks (production key needed for clean videos)
- No user authentication yet
- No video storage/history
- Limited customization options

### Testing Needed
- Real-world URL scraping (different website structures)
- Shotstack rendering in sandbox environment
- Vercel deployment with Playwright
- Performance under load
- Error edge cases

## Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

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

## Feature Status Checklist

- ✅ Project initialization
- ✅ ShadCN UI installation
- ✅ TypeScript types and Zod schemas
- ✅ Playwright scraping implementation
- ✅ Shotstack video generation
- ✅ API routes (scrape, generate, status)
- ✅ Frontend UI with real-time updates
- ✅ Error handling and validation
- ✅ Image optimization (Next.js Image)
- ✅ All linting and type checking passing
- ✅ Pushed to GitHub
- ⏳ Vercel deployment
- ⏳ Production testing
- ⏳ User authentication
- ⏳ Database integration
- ⏳ Video customization UI

## Key Learnings & Best Practices

1. **Research First**: Compared 5+ video APIs before choosing Shotstack
2. **Keep It Simple**: Chose Next.js API routes over Express (less complexity)
3. **Type Safety**: Created custom Shotstack SDK types for full TypeScript support
4. **Error Handling**: Comprehensive validation with Zod + proper HTTP status codes
5. **User Experience**: Real-time polling keeps users informed of progress
6. **Image Optimization**: Used Next.js Image component for better performance
7. **NO Turbopack**: Using standard builds for maximum compatibility

---

**Last Updated**: 2025-10-04
**Status**: Ready for deployment and testing 🚀
