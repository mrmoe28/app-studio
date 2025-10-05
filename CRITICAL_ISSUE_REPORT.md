# 🚨 Critical Issue Report: Screenshot Capture Failure

**Date:** October 5, 2025
**Issue:** Screenshots (0) displayed in production after URL scraping
**Severity:** HIGH - Core functionality broken
**Status:** Under Investigation

---

## Issue Description

When scraping URLs in production (promoforge.vercel.app), the app successfully extracts metadata (title, description) but **fails to capture any screenshots**, showing "Screenshots (0)".

### Observed Behavior:
- ✅ URL scraping completes without error
- ✅ Title extracted: "Permit Office Search - Georgia"
- ✅ Description extracted: "Find local permit offices in Georgia for building permits, planning, and zoning services"
- ❌ **Screenshots: 0 (should be 3 by default)**

---

## Root Cause Analysis

### Potential Causes:

#### 1. **Vercel Blob Upload Failure** (MOST LIKELY)
**Evidence:**
- Scraper code at `src/lib/scraper.ts:177-185` uploads screenshots to Vercel Blob
- If `BLOB_READ_WRITE_TOKEN` is missing/invalid in Vercel production environment, upload fails
- Error might be caught but screenshots array remains empty

**Code Location:**
```typescript
// src/lib/scraper.ts:177-185
const blob = await put(
  `screenshots/${timestamp}-${i}.jpg`,
  Buffer.from(screenshot),
  {
    access: 'public',
    contentType: 'image/jpeg',
  }
)
screenshots.push(blob.url)
```

**Diagnosis Steps:**
1. Check Vercel Dashboard → Environment Variables
2. Verify `BLOB_READ_WRITE_TOKEN` is set for production
3. Check Vercel Blob storage quotas/limits

**Fix:**
```bash
# In Vercel Dashboard
1. Go to project settings
2. Environment Variables
3. Add/verify: BLOB_READ_WRITE_TOKEN=vercel_blob_***
4. Redeploy
```

---

#### 2. **Puppeteer/Chromium Execution Failure**
**Evidence:**
- Vercel serverless functions have strict memory/execution limits
- Chromium might fail to launch or timeout
- Error caught at line 202-206 but returns generic message

**Code Location:**
```typescript
// src/lib/scraper.ts:202-206
catch (error) {
  await browser.close()
  console.error('Scraping error:', error)
  throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
}
```

**Diagnosis Steps:**
1. Check Vercel function logs for errors
2. Look for "Scraping error:" or timeout messages
3. Verify Chromium binary size within Vercel limits

**Fix:**
```typescript
// Add better error logging
catch (error) {
  console.error('[CRITICAL] Scraping failed:', {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    url,
    screenshotCount: validScreenshotCount,
    screenshotsCaptured: screenshots.length
  })
  throw error
}
```

---

#### 3. **API Route Timeout**
**Evidence:**
- API route at `/api/scrape` has `maxDuration = 60` seconds
- Complex pages might exceed this
- Partial execution might extract metadata but fail on screenshots

**Code Location:**
```typescript
// src/app/api/scrape/route.ts:6
export const maxDuration = 60
```

**Diagnosis Steps:**
1. Test with simple/fast-loading URLs
2. Monitor execution time in Vercel logs
3. Check if timeout occurs after metadata extraction

**Fix:**
```typescript
// Increase timeout for Pro plan
export const maxDuration = 300 // 5 minutes
```

---

#### 4. **Silent Error in Screenshot Loop**
**Evidence:**
- Screenshots are captured in a loop (line 156-188)
- If one fails, the loop might continue but array stays empty
- No per-screenshot error handling

**Code Location:**
```typescript
// src/lib/scraper.ts:156-188
for (let i = 0; i < scrollPositions.length; i++) {
  // ... screenshot logic
  screenshots.push(blob.url)
}
```

**Diagnosis Steps:**
1. Add try-catch around each screenshot
2. Log each screenshot attempt
3. Check if loop executes at all

**Fix:**
```typescript
for (let i = 0; i < scrollPositions.length; i++) {
  try {
    const position = scrollPositions[i]
    // ... existing code ...

    const screenshot = await page.screenshot({
      fullPage: false,
      type: 'jpeg',
      quality: 80,
      encoding: 'binary',
    })

    console.log(`[Scraper] Screenshot ${i} captured, size: ${screenshot.length} bytes`)

    const blob = await put(
      `screenshots/${timestamp}-${i}.jpg`,
      Buffer.from(screenshot),
      {
        access: 'public',
        contentType: 'image/jpeg',
      }
    )

    console.log(`[Scraper] Screenshot ${i} uploaded to: ${blob.url}`)
    screenshots.push(blob.url)

  } catch (screenshotError) {
    console.error(`[Scraper] Failed to capture screenshot ${i}:`, screenshotError)
    // Continue with next screenshot instead of failing completely
  }
}
```

---

## Immediate Action Items

### 1. Check Vercel Environment Variables ⚠️
```bash
# Required env vars for screenshot upload:
BLOB_READ_WRITE_TOKEN=vercel_blob_***

# Verify in Vercel Dashboard:
Project → Settings → Environment Variables → Production
```

### 2. Review Vercel Function Logs 📋
```bash
# In Vercel Dashboard:
Deployments → Latest → Functions → /api/scrape → Logs

# Look for:
- "Scraping error:"
- "Blob upload failed"
- Timeout messages
- Memory errors
```

### 3. Test with Simple URL 🧪
```bash
# Test with a lightweight page:
https://example.com
https://google.com

# Compare results with complex pages like:
https://ptoagent.app
```

### 4. Add Enhanced Error Logging 🔍
```typescript
// In src/lib/scraper.ts, add detailed logging:
console.log(`[Scraper] Starting scrape for: ${url}`)
console.log(`[Scraper] Screenshot count: ${validScreenshotCount}`)
console.log(`[Scraper] Environment: ${process.env.NODE_ENV}`)
console.log(`[Scraper] Blob token present: ${!!process.env.BLOB_READ_WRITE_TOKEN}`)
```

---

## Testing Protocol

### Local Testing:
```bash
# 1. Set environment variables
export BLOB_READ_WRITE_TOKEN=your_token_here

# 2. Run local dev server
npm run dev

# 3. Test scraping
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","screenshotCount":3}'
```

### Production Testing:
```bash
# 1. Deploy with enhanced logging
git add .
git commit -m "fix: add enhanced scraper logging"
git push

# 2. Test via browser or curl
curl -X POST https://promoforge.vercel.app/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","screenshotCount":1}'

# 3. Check Vercel logs immediately
```

---

## Expected vs Actual Behavior

### Expected:
```json
{
  "success": true,
  "data": {
    "url": "https://ptoagent.app",
    "title": "Permit Office Search - Georgia",
    "description": "Find local permit offices...",
    "screenshots": [
      "https://blob.vercel-storage.com/screenshots/1234-0.jpg",
      "https://blob.vercel-storage.com/screenshots/1234-1.jpg",
      "https://blob.vercel-storage.com/screenshots/1234-2.jpg"
    ],
    "themeColor": "#3B82F6"
  }
}
```

### Actual:
```json
{
  "success": true,
  "data": {
    "url": "https://ptoagent.app",
    "title": "Permit Office Search - Georgia",
    "description": "Find local permit offices...",
    "screenshots": [],  // ❌ EMPTY!
    "themeColor": "#3B82F6"
  }
}
```

---

## Impact Assessment

### User Impact:
- 🔴 **Video generation impossible** without screenshots
- 🔴 **Core functionality broken** in production
- 🟡 **Metadata extraction still works** (partial success)

### Business Impact:
- Cannot create promotional videos
- Users cannot complete primary workflow
- Demo/trial effectiveness reduced to 0%

---

## Recommended Fixes (Priority Order)

### Fix #1: Verify Blob Token (5 min) ⭐⭐⭐
```bash
# Vercel Dashboard steps:
1. Project Settings → Environment Variables
2. Check if BLOB_READ_WRITE_TOKEN exists for Production
3. If missing, add from Vercel Blob storage settings
4. Redeploy
```

### Fix #2: Add Error Logging (15 min) ⭐⭐
```typescript
// src/lib/scraper.ts - Enhanced error handling
try {
  const blob = await put(/* ... */)
  screenshots.push(blob.url)
  console.log(`✅ Screenshot ${i} uploaded successfully`)
} catch (uploadError) {
  console.error(`❌ Screenshot ${i} upload failed:`, {
    error: uploadError,
    index: i,
    hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
  })
  throw uploadError // Fail fast to see the error
}
```

### Fix #3: Fallback Strategy (30 min) ⭐
```typescript
// Option A: Return base64 screenshots if upload fails
const screenshotData = screenshot.toString('base64')
screenshots.push(`data:image/jpeg;base64,${screenshotData}`)

// Option B: Retry logic
let uploadSuccess = false
let retries = 3
while (!uploadSuccess && retries > 0) {
  try {
    const blob = await put(/* ... */)
    screenshots.push(blob.url)
    uploadSuccess = true
  } catch (err) {
    retries--
    if (retries === 0) throw err
    await new Promise(r => setTimeout(r, 1000))
  }
}
```

### Fix #4: Increase Timeout (2 min) ⭐
```typescript
// src/app/api/scrape/route.ts
export const maxDuration = 300 // Increase from 60 to 300 seconds
```

---

## Prevention Strategies

1. **Health Check Endpoint:** Add `/api/health` that verifies all services
2. **Monitoring:** Set up Vercel log alerts for scraper errors
3. **Graceful Degradation:** Continue with partial screenshots if some fail
4. **Better Error Messages:** Return specific error codes to frontend
5. **E2E Testing:** Add Playwright test for full scrape → video workflow

---

## Next Steps

1. ✅ **Immediate:** Check Vercel environment variables
2. ✅ **Today:** Add enhanced logging and redeploy
3. ✅ **This Week:** Implement retry logic and fallbacks
4. ✅ **Ongoing:** Add monitoring and alerts

---

## Additional Notes

### Vercel Limits to Consider:
- **Function Timeout:** 60s (Hobby), 300s (Pro)
- **Memory:** 1GB (Hobby), 3GB (Pro)
- **Blob Storage:** 1GB free, then paid
- **Chromium Binary:** ~100MB (within limits)

### Alternative Solutions:
1. **Use different storage:** AWS S3, Cloudinary, etc.
2. **Screenshot service:** Use external API (ApiFlash, ScreenshotAPI)
3. **Client-side capture:** Use browser's screenshot API (limited)

---

**Report Generated:** 2025-10-05 16:00:00 UTC
**Next Review:** After implementing Fix #1 and Fix #2
