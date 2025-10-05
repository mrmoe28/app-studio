import { z } from 'zod'

// URL validation schema
export const urlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
})

// Video customization schema
export const videoCustomizationSchema = z.object({
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Theme color must be a valid hex color',
  }).optional(),
  duration: z.number().min(5).max(60).optional(),
  logo: z.instanceof(File).optional(),
})

// Scraping request schema
export const scrapeRequestSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid app URL' }),
  screenshotCount: z.number().min(1).max(10).optional().default(3),
  searchQuery: z.string().optional(),
  searchSelector: z.string().optional(),
  submitSelector: z.string().optional(),
  waitAfterSearch: z.number().min(0).max(10000).optional().default(3000),
})

// Video generation request schema
export const videoGenerationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  duration: z.number().min(5).max(60).default(15),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  logo: z.string().url().optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  musicUrl: z.string().url().optional(),
  musicVolume: z.number().min(0).max(1).default(0.5),
})

// Type exports
export type UrlInput = z.infer<typeof urlSchema>
export type VideoCustomization = z.infer<typeof videoCustomizationSchema>
export type ScrapeRequest = z.infer<typeof scrapeRequestSchema>
export type VideoGeneration = z.infer<typeof videoGenerationSchema>
