# PromoForge - Project Context

## Current Project State

PromoForge is a Next.js 15 application for creating promotional videos from images. The app uses Shotstack API for video generation with support for multiple aspect ratios.

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Video Generation**: Shotstack API (with Creatomate as alternative)
- **Deployment**: Vercel (configured for automatic deployment on git push)

## Active Goals

- ✅ **Video Generation**: Implemented working video generation from images using Shotstack API
- 🔄 **Testing**: Endpoint tested and working for all aspect ratios (9:16, 1:1, 16:9)
- 📋 **Next Steps**: Integrate video generation into main application workflow

## Recent Decisions

### Video Generation API Selection (January 2025)

**Research Conducted**: Evaluated 5+ video generation solutions
- Shotstack (Official SDK + REST API)
- Creatomate (Template-based)
- Remotion (React-based rendering)
- FFmpeg.wasm (Client-side)
- videoshow (npm package - outdated)

**Decision**: Use **Shotstack REST API** (not SDK)

**Rationale**:
1. Already have active Shotstack API key
2. Official SDK has CommonJS/ES module compatibility issues with Next.js 15
3. REST API provides full control with TypeScript types
4. Better error handling and logging capabilities
5. Proven reliability in production environments

**Alternative**: Creatomate configured as fallback (env flag: `VIDEO_PROVIDER`)

### Architecture Decisions

**Video Library Structure**:
```
src/lib/video/
├── index.ts          # Provider switching logic
├── shotstack.ts      # Shotstack REST API implementation
└── creatomate.ts     # Creatomate alternative (future)
```

**API Route**:
- `POST /api/test-generate` - Test endpoint for video generation
- Input validation using Zod schemas
- Comprehensive error handling and logging

## Known Issues

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

### Active Issues
- None currently

## Implementation Notes

### Shotstack API Best Practices

**Resolution Configuration**:
```typescript
{
  resolution: 'hd',          // Use standard: preview|mobile|sd|hd|1080
  aspectRatio: '9:16',       // Optional: 9:16|1:1|16:9
  format: 'mp4'              // Output format
}
```

**Error Handling**:
- Always log full error response from API
- Parse and display validation errors
- Include request ID in error messages for debugging
- Use proper TypeScript error handling (avoid `any`)

**Timeline Structure**:
- Each shot gets 2 seconds duration
- Text overlays start 0.2s after image, last 1.6s
- Effects: `zoomIn` for dynamic feel
- Text position: `bottom` with `minimal` style

### Environment Variables

Required:
```bash
SHOTSTACK_API_KEY=your_key_here
SHOTSTACK_API_ENV=sandbox  # or 'v1' for production
```

Optional:
```bash
VIDEO_PROVIDER=shotstack   # or 'creatomate'
CREATOMATE_API_KEY=        # If using Creatomate
VIDEO_ASPECT=9:16          # Default aspect ratio
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
- ✅ Input validation (Zod schema)
- ✅ Error handling (400, 500 errors)
- ✅ ESLint passes with no errors
- ✅ TypeScript strict mode compliance

## Deployment

### Vercel Configuration
- Auto-deployment on git push (when connected to repo)
- Environment variables set in Vercel dashboard
- Build command: `npm run build`
- No Turbopack in production builds

### Git Workflow
- Use conventional commits format
- Never reference Claude/Anthropic in commits
- Always run ESLint before commits

## Next Steps

1. **Integration**:
   - Add video generation to main app UI
   - Create video status polling endpoint
   - Download/display completed videos

2. **Features**:
   - Add music/audio tracks
   - Custom transitions between shots
   - Brand watermark overlay
   - Video templates

3. **Optimization**:
   - Cache rendered videos
   - Progress indicators
   - Webhook handling for render completion

## Error Documentation

### Common Errors & Solutions

**Error**: `Shotstack API Error (400): Validation failed for output`
- **Cause**: Invalid resolution or aspectRatio value
- **Fix**: Use valid values (see Resolution Configuration above)

**Error**: `SHOTSTACK_API_KEY environment variable is not set`
- **Cause**: Missing API key in .env.local
- **Fix**: Add key to .env.local file

**Error**: `Attempted import error: 'shotstack-sdk' does not contain a default export`
- **Cause**: CommonJS/ES module incompatibility
- **Fix**: Use REST API implementation instead of SDK

## Lessons Learned

1. **Always research API documentation first** - Saved hours by checking actual valid values
2. **Use REST over SDK when module compatibility is unclear** - More control, better debugging
3. **Validate early with Zod** - Catches errors before API calls
4. **Log complete error objects** - Shotstack returns detailed validation errors
5. **Test all aspect ratios** - Different ratios require different configuration

## Resources

- [Shotstack API Docs](https://shotstack.io/docs/api/)
- [Shotstack Node SDK](https://github.com/shotstack/shotstack-sdk-node)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Zod Validation](https://zod.dev/)

---

**Last Updated**: January 2025
**Status**: Video generation working ✅
**Next Review**: After UI integration
