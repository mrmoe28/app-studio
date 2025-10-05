# Troubleshooting: Bad Request / 502 Error

## Issue Analysis

You're getting a **502 Bad Gateway** error (not 400 Bad Request) when trying to generate videos. This indicates the error is coming from the Shotstack API, not from your application's validation.

## Workflow Breakdown

1. ✅ **Scraping** - Working (you can see screenshots)
2. ❓ **TTS Generation** - May be failing silently if voiceover is enabled
3. ❌ **Shotstack Render** - Returns 502 error

## Most Likely Causes

### 1. ElevenLabs API Key Issue (if voiceover enabled)
- The TTS might be failing to generate audio
- Previously, the code would silently continue without checking if TTS failed
- **Fixed**: Now properly validates TTS response and shows clear error

### 2. Invalid Audio URLs
- Shotstack cannot access the voiceover URL (if not publicly accessible)
- Music URLs might be blocked or unavailable
- **Fixed**: Added logging to show all URLs being sent

### 3. Shotstack API Key Issue
- Your Shotstack API key might not have permissions
- You're using the staging environment (default)

## Testing Strategy

### Step 1: Test WITHOUT Audio (Simplest)
1. **Turn OFF AI Voiceover**
2. **Turn OFF Background Music**
3. Try to generate video with ONLY screenshots
4. Check browser console (F12 → Console) for logs

**Expected Console Output:**
```
Starting video generation...
Screenshots to use: [array of URLs]
Video duration: X seconds
Number of image clips: Y
Sending payload to Shotstack: {...}
```

**If this works**: The issue is with audio (TTS or music)
**If this fails**: The issue is with Shotstack API key or screenshot URLs

### Step 2: Test WITH Music Only
1. **Turn OFF AI Voiceover**
2. **Turn ON Background Music**
3. Try to generate video

**If this works**: The issue is with TTS/ElevenLabs
**If this fails**: The issue is with music URLs or Shotstack

### Step 3: Test WITH Voiceover Only
1. **Turn ON AI Voiceover**
2. **Turn OFF Background Music**
3. Try to generate video

**Watch Console Output:**
```
Generating voiceover...
TTS Response: {success: true/false, audioUrl: "..."}
```

**If TTS fails**: You'll see an alert with the specific ElevenLabs error
**If TTS succeeds but video fails**: The issue is Shotstack can't access the audio URL

## Diagnostic Console Logs

After deploying the latest changes, you'll see detailed logs:

1. **Video Generation Start**
   - Screenshots being used
   - Video duration
   - Number of clips

2. **TTS Generation** (if enabled)
   - Request status
   - Audio URL
   - Any errors

3. **Music Addition** (if enabled)
   - Music URL being used

4. **Shotstack Payload**
   - Complete JSON being sent
   - All track configurations

5. **Shotstack Response**
   - Success or error details
   - Full error object from Shotstack

## Environment Variables Check

Verify in Vercel:
```bash
✅ SHOTSTACK_API_KEY (set)
✅ SHOTSTACK_API_ENV (set)
✅ ELEVENLABS_API_KEY (set)
✅ BLOB_READ_WRITE_TOKEN (set)
❓ SHOTSTACK_HOST (not set - using default: https://api.shotstack.io/stage)
```

## Possible Quick Fixes

### Fix 1: Disable Audio Temporarily
- Test video generation WITHOUT audio features
- This will help isolate if the issue is TTS/music-related

### Fix 2: Check ElevenLabs API Key
1. Go to https://elevenlabs.io/app/settings/api-keys
2. Verify your API key has TTS permissions
3. Try regenerating the key if needed
4. Update in Vercel: `vercel env add ELEVENLABS_API_KEY production`

### Fix 3: Check Shotstack API Key
1. Go to https://shotstack.io/account/api-keys
2. Verify your API key is active
3. Check if you're using the right environment (stage vs v1)
4. Update in Vercel if needed

### Fix 4: Use Production Shotstack API
Add this environment variable to Vercel:
```bash
vercel env add SHOTSTACK_HOST production
# Enter value: https://api.shotstack.io/v1
```

## Next Steps

1. **Wait 2 minutes** for the latest deployment to complete
2. **Open browser console** (F12 → Console tab)
3. **Try generating a video** (start with NO audio)
4. **Check the console logs** - you'll see exactly where it fails
5. **Report back** with:
   - What you see in the console
   - Which test scenario you tried
   - The exact error message from Shotstack

## Error Messages You Might See

### "Voiceover generation failed"
- **Cause**: ElevenLabs API key issue
- **Fix**: Check ElevenLabs API key permissions

### "Failed to generate voiceover: 401"
- **Cause**: Invalid ElevenLabs API key
- **Fix**: Regenerate API key in ElevenLabs dashboard

### "No audio URL in TTS response"
- **Cause**: TTS succeeded but didn't return a URL
- **Fix**: Check BLOB_READ_WRITE_TOKEN in Vercel

### Shotstack specific errors (in console)
- Look for `errorFromShotstack` object in console
- This will show the exact Shotstack validation error

## Logging Added

The latest deployment includes:
- ✅ Full payload logging before sending to Shotstack
- ✅ TTS request/response logging
- ✅ Music URL validation
- ✅ Screenshot validation
- ✅ Enhanced error messages with context
- ✅ Early exit on TTS failure (no silent failures)

## Support

If the issue persists after testing:
1. Share the console logs (screenshot or copy)
2. Specify which test scenario you tried
3. Include any error messages from alerts

