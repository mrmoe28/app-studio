# Vercel Configuration - PromoForge

## ✅ Configuration Status

### Project Details
- **Project Name:** promoforge
- **Project ID:** prj_zhsZEKmZ5XNHMIJQXjn61HVxTjxi
- **Organization:** ekoapps (team_FFRrO5azOZd2n35vLPL64lag)
- **Vercel CLI:** Installed and authenticated ✅

---

## 🔐 Environment Variables (Production)

### ✅ Configured Correctly

| Variable | Status | Value | Purpose |
|----------|--------|-------|---------|
| `SHOTSTACK_API_KEY` | ✅ Updated | `AGkLcd...kkgQ` | Production Shotstack API (clean videos) |
| `SHOTSTACK_API_ENV` | ✅ Updated | `v1` | Shotstack production environment |
| `BLOB_READ_WRITE_TOKEN` | ✅ Set | Encrypted | Vercel Blob Storage for screenshots/music |
| `NEXT_PUBLIC_APP_URL` | ✅ Set | Encrypted | Production app URL |
| `DATABASE_URL` | ✅ Set | Encrypted | NeonDB connection (optional) |
| `STRIPE_SECRET_KEY` | ✅ Set | Encrypted | Stripe payments (optional) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Set | Encrypted | Stripe public key (optional) |

### ⚠️ Needs Update

| Variable | Status | Issue | Action Required |
|----------|--------|-------|-----------------|
| `ELEVENLABS_API_KEY` | ⚠️ Invalid | Missing `voices_read` permission | Update with new key from ElevenLabs |

---

## 🚨 Critical: Update ElevenLabs API Key

Your voiceover feature won't work until you update this key!

### Steps to Fix:

1. **Get New API Key:**
   - Visit: https://elevenlabs.io/app/settings/api-keys
   - Click "Create New API Key"
   - Enable ALL permissions (especially TTS and voice reading)
   - Copy the key

2. **Update in Vercel:**
   ```bash
   # Remove old key
   vercel env rm ELEVENLABS_API_KEY production --yes

   # Add new key (paste when prompted)
   vercel env add ELEVENLABS_API_KEY production
   ```

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## 📦 Vercel Blob Storage

**Status:** ✅ Enabled and configured

- Token is automatically set for Production, Preview, and Development
- Used for:
  - Screenshot uploads from URL scraping
  - Custom background music uploads
  - Voiceover audio files

**No action needed** - Already working!

---

## 🚀 Deployment Commands

### Deploy to Production
```bash
cd /Users/ekodevapps/Desktop/app-studio/promoforge
vercel --prod
```

### Preview Deployment (Testing)
```bash
vercel
```

### Check Deployment Status
```bash
vercel ls
```

### View Environment Variables
```bash
vercel env ls
```

### Pull Environment Variables Locally
```bash
vercel env pull .env.production
```

---

## 📊 What's Working Now

### ✅ Ready Features
- **Video Generation**: Shotstack production API configured for clean videos
- **Screenshot Capture**: Puppeteer with Vercel Blob storage
- **Background Music**: Upload and use custom music tracks
- **Multi-page Scraping**: Screenshot gallery from URLs
- **Database**: NeonDB connection ready (optional)
- **Payments**: Stripe integration ready (optional)

### ⚠️ Partially Working
- **Voiceover**: API configured but needs new ElevenLabs key with proper permissions

---

## 🔄 Deployment Workflow

### Automatic Deployment (Recommended)
When you push to GitHub, Vercel automatically deploys:
```bash
git add .
git commit -m "your message"
git push
```

Vercel will:
1. Detect the push
2. Build your app
3. Deploy to production
4. Update https://promoforge.vercel.app (or your custom domain)

### Manual Deployment
```bash
vercel --prod
```

---

## 🧪 Testing After Deployment

### 1. Test Video Generation
- Visit your production URL
- Paste a website URL
- Click "Scrape Website"
- Verify screenshots load
- Click "Generate Video"
- ✅ Should produce clean video (no watermarks)

### 2. Test Background Music
- Upload a custom music file
- ✅ Should upload successfully to Vercel Blob

### 3. Test Voiceover
- Enable AI Voiceover
- Select a voice
- Click preview
- ⚠️ Will fail until ElevenLabs key is updated

---

## 🌐 Production URL

Your app will be available at:
- **Vercel URL:** https://promoforge.vercel.app
- **Custom Domain:** (if configured in Vercel dashboard)

---

## 🛠️ Troubleshooting

### Build Fails on Vercel
```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

### Environment Variable Issues
```bash
# List all env vars
vercel env ls

# Pull to local for inspection
vercel env pull .env.test
```

### Deployment Stuck
```bash
# Cancel deployment
vercel cancel

# Force redeploy
vercel --prod --force
```

---

## 📞 Support Resources

- **Vercel Dashboard:** https://vercel.com/ekoapps/promoforge
- **Vercel Docs:** https://vercel.com/docs
- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Blob Storage:** https://vercel.com/docs/storage/vercel-blob
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables

---

## ✅ Next Steps

1. **Update ElevenLabs API Key** (see instructions above)
2. **Deploy to Production:**
   ```bash
   vercel --prod
   ```
3. **Test All Features** on production URL
4. **Monitor Deployment:**
   ```bash
   vercel logs --follow
   ```

---

**Last Updated:** January 2025
**Configuration Status:** Ready for deployment (pending ElevenLabs key update)
