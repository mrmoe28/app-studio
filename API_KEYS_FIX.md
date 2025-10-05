# API Keys Configuration - PromoForge

## Current Issues & Solutions

### 1. ElevenLabs Voiceover API (401 Error) ❌

**Problem:** Your current API key is missing the `voices_read` permission required for TTS operations.

**Error:** `"Failed to generate voice preview: Failed to generate voiceover: Status code: 401#Body: {}"`

**Solution:**
1. Go to [ElevenLabs API Keys Settings](https://elevenlabs.io/app/settings/api-keys)
2. Create a **NEW** API key with **full permissions** including:
   - ✅ Text-to-Speech
   - ✅ Voice Reading
   - ✅ Voice Library Access
3. Copy the new API key
4. Update `.env.local`:
   ```bash
   ELEVENLABS_API_KEY=your_new_api_key_here
   ```
5. Update Vercel environment variables (if deployed):
   - Go to [Vercel Dashboard](https://vercel.com/) → Your Project → Settings → Environment Variables
   - Add/Update: `ELEVENLABS_API_KEY` with the new key

**Current Key:** Invalid (missing permissions)

**Test Your New Key:**
```bash
curl -X GET 'https://api.elevenlabs.io/v1/voices' \
  -H 'xi-api-key: YOUR_NEW_KEY_HERE' \
  -H 'Content-Type: application/json'
```

If successful, you should see a list of available voices instead of a permissions error.

---

### 2. Background Music Upload Issues ❌

**Problem:** Music uploads may fail if Vercel Blob token is not configured in production.

**Solution:**

#### For Local Development:
Your `.env.local` already has:
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_wGPlEtTftdo0wwBx_jg25rXrYgaZ7QHv5pGxry2KUaazNoj"
```

#### For Production (Vercel):
1. Go to [Vercel Dashboard](https://vercel.com/) → Your Project → Settings → Environment Variables
2. Ensure these are set:
   ```
   BLOB_READ_WRITE_TOKEN = (automatically set by Vercel if you have Blob Storage enabled)
   ```
3. If not present, enable Vercel Blob Storage:
   - Go to Storage tab in your project
   - Create a Blob store
   - Token will be automatically added to environment variables

---

### 3. Shotstack Production API ✅

**Status:** Already configured correctly!

**Current Configuration:**
```bash
SHOTSTACK_API_KEY=AGkLcdJdR1lBBWLGlkltMNibTL81pal3P0xzkkgQ
SHOTSTACK_API_ENV=v1
```

**For Production (Vercel):**
Ensure these environment variables are set in Vercel:
- `SHOTSTACK_API_KEY` = `AGkLcdJdR1lBBWLGlkltMNibTL81pal3P0xzkkgQ`
- `SHOTSTACK_API_ENV` = `v1`

---

## Complete Environment Variables Checklist

### Required for All Features to Work:

#### Local Development (`.env.local`):
```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Shotstack API (Video Generation) ✅
SHOTSTACK_API_KEY=AGkLcdJdR1lBBWLGlkltMNibTL81pal3P0xzkkgQ
SHOTSTACK_API_ENV=v1

# ElevenLabs API (Voiceover) ❌ NEEDS NEW KEY
ELEVENLABS_API_KEY=your_new_elevenlabs_key_with_full_permissions

# Vercel Blob Storage (Screenshots & Music) ✅
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Database (Optional)
DATABASE_URL=your_neon_database_url_here

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

#### Production (Vercel Environment Variables):
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add/verify these variables for **Production** environment:
   - ✅ `SHOTSTACK_API_KEY` = `AGkLcdJdR1lBBWLGlkltMNibTL81pal3P0xzkkgQ`
   - ✅ `SHOTSTACK_API_ENV` = `v1`
   - ❌ `ELEVENLABS_API_KEY` = (needs new key with full permissions)
   - ✅ `BLOB_READ_WRITE_TOKEN` = (auto-set if Blob Storage enabled)
   - ✅ `NEXT_PUBLIC_APP_URL` = `https://promoforge.vercel.app` (or your domain)

---

## Quick Fix Steps

### To Fix Voiceover (Highest Priority):

1. **Get New ElevenLabs API Key:**
   - Visit: https://elevenlabs.io/app/settings/api-keys
   - Click "Create New API Key"
   - Enable ALL permissions
   - Copy the key

2. **Update Local Environment:**
   ```bash
   # Edit .env.local
   ELEVENLABS_API_KEY=your_new_key_here
   ```

3. **Update Vercel (Production):**
   ```bash
   # Using Vercel CLI
   vercel env add ELEVENLABS_API_KEY production
   # Paste your new key when prompted

   # Then redeploy
   vercel --prod
   ```

   **OR** via Dashboard:
   - Go to Vercel → Settings → Environment Variables
   - Edit `ELEVENLABS_API_KEY`
   - Paste new key
   - Click "Save"
   - Redeploy your app

### To Fix Background Music:

1. **Verify Vercel Blob Storage:**
   - Go to Vercel Dashboard → Storage tab
   - Ensure Blob Storage is enabled
   - Token should auto-populate in Environment Variables

2. **If not enabled:**
   - Click "Create Database" → Choose "Blob"
   - Follow setup wizard
   - Token will be automatically added

---

## Testing After Fixes

### Test Voiceover:
1. Open PromoForge app
2. Enable "AI Voiceover"
3. Select a voice
4. Click preview button
5. Should hear: "Hello! This is a preview of how this voice will sound in your video."

### Test Background Music:
1. Enable "Background Music"
2. Try uploading a music file (MP3, WAV, etc.)
3. Should see success message with file name

### Test Video Generation:
1. Complete all settings
2. Click "Generate Video"
3. Should see progress updates
4. Video should be clean (no watermarks with production Shotstack key)

---

## Support Links

- **ElevenLabs API Keys:** https://elevenlabs.io/app/settings/api-keys
- **ElevenLabs Documentation:** https://elevenlabs.io/docs/api-reference
- **Vercel Dashboard:** https://vercel.com/
- **Vercel Blob Storage:** https://vercel.com/docs/storage/vercel-blob
- **Shotstack Dashboard:** https://dashboard.shotstack.io/

---

**Last Updated:** January 2025
**Status:** Awaiting ElevenLabs API key update
