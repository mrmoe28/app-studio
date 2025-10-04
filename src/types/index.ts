// Type definitions for PromoForge

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
