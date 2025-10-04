import { chromium } from 'playwright'
import type { ScrapedAsset } from '@/types'

/**
 * Scrape app information and screenshots from a URL
 */
export async function scrapeAppUrl(url: string): Promise<ScrapedAsset> {
  const browser = await chromium.launch({
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  })

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const page = await context.newPage()

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    // Wait for content to load
    await page.waitForTimeout(2000)

    // Extract metadata
    const title = await page.title()
    const description =
      (await page
        .locator('meta[name="description"]')
        .getAttribute('content')) ||
      (await page
        .locator('meta[property="og:description"]')
        .getAttribute('content')) ||
      'No description available'

    // Extract theme color
    const themeColor =
      (await page
        .locator('meta[name="theme-color"]')
        .getAttribute('content')) || '#3B82F6'

    // Extract logo/icon
    const logo =
      (await page
        .locator('link[rel="icon"]')
        .first()
        .getAttribute('href')) ||
      (await page
        .locator('link[rel="apple-touch-icon"]')
        .first()
        .getAttribute('href')) ||
      undefined

    // Make logo URL absolute if it's relative
    const absoluteLogo = logo && !logo.startsWith('http')
      ? new URL(logo, url).toString()
      : logo

    // Extract keywords
    const keywordsContent = await page
      .locator('meta[name="keywords"]')
      .getAttribute('content')
    const keywords = keywordsContent
      ? keywordsContent.split(',').map((k) => k.trim())
      : []

    // Take screenshots
    const screenshots: string[] = []

    // Full page screenshot
    const fullScreenshot = await page.screenshot({
      fullPage: false,
      type: 'jpeg',
      quality: 90,
    })
    screenshots.push(`data:image/jpeg;base64,${fullScreenshot.toString('base64')}`)

    // Scroll and capture more sections
    const scrollPositions = [0.33, 0.66]
    for (const position of scrollPositions) {
      await page.evaluate((pos) => {
        window.scrollTo({
          top: document.documentElement.scrollHeight * pos,
          behavior: 'smooth',
        })
      }, position)

      await page.waitForTimeout(1000)

      const screenshot = await page.screenshot({
        fullPage: false,
        type: 'jpeg',
        quality: 90,
      })
      screenshots.push(`data:image/jpeg;base64,${screenshot.toString('base64')}`)
    }

    await browser.close()

    return {
      url,
      title,
      description,
      screenshots,
      logo: absoluteLogo,
      themeColor,
      keywords,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    await browser.close()
    console.error('Scraping error:', error)
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate if a URL is accessible
 */
export async function validateUrl(url: string): Promise<boolean> {
  try {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(url, { timeout: 10000, waitUntil: 'domcontentloaded' })
    await browser.close()

    return true
  } catch {
    return false
  }
}
