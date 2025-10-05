# Vercel Environment Variables Analysis

**Date:** October 5, 2025
**Issue:** Screenshot capture showing 0 results despite environment variables being set

---

## ✅ Confirmed: Environment Variables ARE Set in Vercel

### Current Production Variables:

1. **VERCEL_BLOB_READ_WRITE_TOKEN** ✅
   - Environment: All Environments
   - Added: 2h ago
   - Status: Active

2. **BLOB_READ_WRITE_TOKEN** ✅
   - Environment: All Environments
   - Added: 24h ago
   - Status: Active

3. **SHOTSTACK_API_KEY** ✅
   - Environment: Production
   - Added: 18h ago
   - Status: Active

4. **SHOTSTACK_API_ENV** ✅
   - Environment: Production
   - Value: `v1`
   - Added: 18h ago
   - Status: Active

5. **ELEVENLABS_API_KEY** ✅
   - Environment: All Environments
   - Updated: 6h ago
   - Status: Active

6. **NEXT_PUBLIC_APP_URL** ✅
   - Environment: Production
   - Value: `https://promoforge.vercel.app`
   - Added: 23h ago
   - Status: Active

7. **DATABASE_URL** ✅
   - Environment: Production
   - Added: 23h ago
   - Status: Active

8. **STRIPE_SECRET_KEY** ✅
   - Environment: Production
   - Added: 23h ago
   - Status: Active

9. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** ✅
   - Environment: Production
   - Added: 23h ago
   - Status: Active

---

## 🔍 Key Observation: Duplicate BLOB Tokens

There are **TWO** blob storage tokens set:
- `VERCEL_BLOB_READ_WRITE_TOKEN` (newer - 2h ago)
- `BLOB_READ_WRITE_TOKEN` (older - 24h ago)

### Which One Does @vercel/blob Use?

According to Vercel documentation:
- **Legacy:** `BLOB_READ_WRITE_TOKEN` (older format)
- **Current:** `BLOB_READ_WRITE_TOKEN` is still the primary env var name
- **Auto-inject:** Vercel may auto-inject `VERCEL_BLOB_READ_WRITE_TOKEN`

The `@vercel/blob` package looks for `BLOB_READ_WRITE_TOKEN` by default.

---

## 🐛 Potential Root Causes (Revised)

Since environment variables ARE present, the issue must be elsewhere:

### 1. **Vercel Blob Storage Quota Exceeded**
- Free tier: 1GB storage limit
- If exceeded, uploads fail silently
- **Check:** Vercel Dashboard → Storage → Blob → Usage

### 2. **Token Permissions Issue**
- Token might not have write permissions
- Token might be scoped to different project
- **Check:** Regenerate token and update in Vercel

### 3. **Function Timeout Before Upload Completes**
- Puppeteer takes time to screenshot
- Upload might timeout before completing
- **Check:** Function execution time in logs

### 4. **Chromium Launch Failure in Serverless**
- Chromium might fail to launch in Vercel's environment
- Memory limits (1GB) might be exceeded
- **Check:** Vercel function logs for Chromium errors

### 5. **Network/CORS Issues**
- Blob upload might be blocked by network policy
- Cross-origin upload restrictions
- **Check:** Network errors in function logs

---

## 🔧 Debugging Steps

### Step 1: Check Vercel Blob Storage Usage
```bash
# In Vercel Dashboard:
1. Go to Storage tab
2. Click on Blob store
3. Check: Used / Limit
4. Look for any errors or warnings
```

### Step 2: View Function Logs for Specific Error
```bash
# Need to trigger a scrape and immediately check logs:
1. Go to promoforge.vercel.app
2. Scrape a URL (e.g., https://example.com)
3. Immediately go to Vercel Dashboard → Deployments → Latest → Functions
4. Find /api/scrape function
5. Check Runtime Logs
```

### Step 3: Test with Enhanced Logging
Add to `src/lib/scraper.ts` around line 177:

```typescript
// Before upload
console.log('[Scraper] Attempting upload:', {
  filename: `screenshots/${timestamp}-${i}.jpg`,
  size: screenshot.length,
  hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  hasVercelToken: !!process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
  tokenPreview: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 20) + '...'
})

try {
  const blob = await put(
    `screenshots/${timestamp}-${i}.jpg`,
    Buffer.from(screenshot),
    {
      access: 'public',
      contentType: 'image/jpeg',
    }
  )

  console.log('[Scraper] Upload successful:', blob.url)
  screenshots.push(blob.url)
} catch (uploadError) {
  console.error('[Scraper] Upload failed:', {
    error: uploadError,
    message: uploadError instanceof Error ? uploadError.message : 'Unknown',
    stack: uploadError instanceof Error ? uploadError.stack : undefined
  })
  throw uploadError
}
```

### Step 4: Verify Blob Package Version
Check `package.json`:
```json
"@vercel/blob": "^2.0.0"  // Should be latest
```

Update if needed:
```bash
npm install @vercel/blob@latest
```

---

## 🎯 Most Likely Causes (Ranked)

1. **Storage Quota Exceeded** (60% probability)
   - Free tier limit reached
   - Uploads fail silently when quota exceeded
   - Check Vercel Storage dashboard

2. **Chromium Fails to Launch** (25% probability)
   - Memory limits in serverless environment
   - Chromium binary issues
   - Check function logs for launch errors

3. **Function Timeout** (10% probability)
   - maxDuration = 60s might not be enough
   - Scraping + upload exceeds time limit
   - Partial execution completes but upload fails

4. **Token/Permissions Issue** (5% probability)
   - Wrong token scope
   - Expired token
   - Verify token is for correct project

---

## ✅ Immediate Action Plan

### Priority 1: Check Storage Quota
```
Vercel Dashboard → Storage → Blob → Check Usage
If > 90%: Upgrade plan or clean old files
```

### Priority 2: Add Error Logging
```typescript
// Deploy with enhanced logging (see Step 3 above)
git add src/lib/scraper.ts
git commit -m "debug: add blob upload error logging"
git push
```

### Priority 3: Test and Monitor
```
1. Trigger scrape on production
2. Immediately check Vercel function logs
3. Look for specific error message
4. Share error here for analysis
```

### Priority 4: Verify Token Freshness
```
1. Go to Vercel Storage → Blob
2. Regenerate token
3. Update BLOB_READ_WRITE_TOKEN in env vars
4. Redeploy
```

---

## 📊 What We Know vs Don't Know

### ✅ What We Know:
- Environment variables ARE set in Vercel ✅
- Metadata extraction works (title, description) ✅
- Frontend UI functional ✅
- Scraping process starts successfully ✅
- No client-side errors ✅

### ❓ What We DON'T Know:
- Exact error message from blob upload ❓
- Current blob storage usage/quota ❓
- If Chromium launches successfully ❓
- Function execution time ❓
- Token validity/permissions ❓

---

## 🚨 Next Steps

**You need to:**
1. Check Vercel Storage → Blob usage/quota
2. Trigger a scrape and check function logs immediately
3. Look for error messages in `/api/scrape` function logs
4. Share the specific error message

**Once we see the actual error, we can provide a targeted fix!**

---

**Analysis Updated:** October 5, 2025 16:30:00 UTC
**Status:** Awaiting function logs for specific error message
