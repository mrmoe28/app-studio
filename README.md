# 🎬 PromoForge

**Automatically generate professional promotional videos for your apps and websites**

PromoForge scrapes any URL and creates a polished promo video using AI-powered video generation.

## ✨ Features

- **🔍 Automatic Content Extraction** - Scrapes title, description, screenshots, and branding
- **🎥 Professional Video Generation** - Creates engaging promo videos with Shotstack API
- **⚡ Real-time Progress** - Live status updates during video rendering
- **🎨 Modern UI** - Built with Next.js 15, React 19, and ShadCN components
- **📱 Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- Shotstack API key ([Get one free](https://shotstack.io))
- Optional: NeonDB database for storing projects

### Installation

```bash
# Clone the repository
git clone https://github.com/mrmoe28/app-studio.git
cd app-studio/promoforge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔑 Environment Variables

Create a `.env.local` file with:

```bash
# Shotstack API (Required)
SHOTSTACK_API_KEY=your_shotstack_api_key_here
SHOTSTACK_API_ENV=sandbox  # or 'v1' for production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Playwright (Optional)
PLAYWRIGHT_HEADLESS=true

# Database (Optional - for saving projects)
DATABASE_URL=your_neon_postgres_connection_string_here
```

## 📖 How It Works

1. **Enter URL** - Paste your app or website URL
2. **Extract Content** - Playwright scrapes screenshots and metadata
3. **Generate Video** - Shotstack creates a professional promo video
4. **Download** - Get your video when rendering is complete

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI**: [ShadCN UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Scraping**: [Playwright](https://playwright.dev/)
- **Video Generation**: [Shotstack API](https://shotstack.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Database**: [NeonDB](https://neon.tech/) (PostgreSQL)

## 📁 Project Structure

```
/promoforge
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── scrape/       # URL scraping endpoint
│   │   │   ├── generate/     # Video generation
│   │   │   └── status/       # Render status polling
│   │   ├── page.tsx          # Main UI
│   │   └── layout.tsx
│   ├── components/ui/        # ShadCN components
│   ├── lib/
│   │   ├── scraper.ts        # Playwright logic
│   │   ├── shotstack.ts      # Video generation
│   │   └── schemas.ts        # Zod validation
│   └── types/                # TypeScript definitions
├── .env.local                # Environment variables
└── package.json
```

## 🎯 API Routes

### POST `/api/scrape`
Extract content from a URL
```json
{
  "url": "https://example.com"
}
```

### POST `/api/generate`
Generate a promotional video
```json
{
  "title": "App Title",
  "description": "App description",
  "images": ["base64_image1", "base64_image2"],
  "themeColor": "#3B82F6",
  "duration": 15
}
```

### GET `/api/status/[renderId]`
Check video render status
```json
{
  "status": "done",
  "url": "https://shotstack.io/video.mp4"
}
```

## 🧪 Development

```bash
# Run development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy! (auto-deploys on every push)

**Note**: Playwright may require additional configuration on Vercel. See [Vercel Playwright docs](https://vercel.com/docs/functions/runtimes/node-js#playwright).

## 📝 License

MIT

## 🙏 Credits

- Built with [Claude Code](https://claude.com/claude-code)
- Video generation powered by [Shotstack](https://shotstack.io)
- UI components from [ShadCN](https://ui.shadcn.com)

---

**Made with ❤️ by PromoForge Team**
