// Type definitions for PromoForge

export interface ScrapeOptions {
  url: string
  screenshotCount?: number // Number of screenshots to capture (default: 3, max: 10)
  searchQuery?: string // Optional text to type into a search field
  searchSelector?: string // CSS selector for the search input field
  submitSelector?: string // CSS selector for submit button (optional)
  waitAfterSearch?: number // Milliseconds to wait after search submission (default: 3000)
}

export interface ScrapedAsset {
  url: string
  title: string
  description: string
  screenshots: string[]
  logo?: string
  themeColor?: string
  keywords: string[]
  timestamp: string
}

export interface VideoConfig {
  title: string
  description: string
  duration: number
  assets: {
    images: string[]
    logo?: string
  }
  theme: {
    primaryColor: string
    secondaryColor?: string
  }
  music?: {
    url: string
    volume: number
  }
}

export interface ShotstackResponse {
  success: boolean
  message: string
  response: {
    id: string
    owner: string
    url?: string
    status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed'
    created: string
    updated: string
  }
}

export interface VideoGenerationRequest {
  assetId: string
  customizations?: {
    logo?: File
    themeColor?: string
    duration?: number
  }
}

export interface VideoGenerationResponse {
  success: boolean
  videoId: string
  status: string
  videoUrl?: string
  error?: string
}
