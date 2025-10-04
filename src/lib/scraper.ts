import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import type { ScrapedAsset } from '@/types'

/**
 * Scrape app information and screenshots from a URL
 */
export async function scrapeAppUrl(url: string): Promise<ScrapedAsset> {
  // Configure chromium for serverless
  const browser = await puppeteer.launch({
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: { width: 1920, height: 1080 },
    executablePath: await chromium.executablePath(),
    headless: true,
  })

  try {
    const page = await browser.newPage()

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Extract metadata
    const title = await page.title()
    const description =
      (await page.$eval(
        'meta[name="description"]',
        (el) => el.getAttribute('content')
      ).catch(() => null)) ||
      (await page.$eval(
        'meta[property="og:description"]',
        (el) => el.getAttribute('content')
      ).catch(() => null)) ||
      'No description available'

    // Extract theme color
    const themeColor =
      (await page.$eval(
        'meta[name="theme-color"]',
        (el) => el.getAttribute('content')
      ).catch(() => null)) || '#3B82F6'

    // Extract logo/icon
    const logo =
      (await page.$eval(
        'link[rel="icon"]',
        (el) => el.getAttribute('href')
      ).catch(() => null)) ||
      (await page.$eval(
        'link[rel="apple-touch-icon"]',
        (el) => el.getAttribute('href')
      ).catch(() => null)) ||
      undefined

    // Make logo URL absolute if it's relative
    const absoluteLogo = logo && !logo.startsWith('http')
      ? new URL(logo, url).toString()
      : logo

    // Extract keywords
    const keywordsContent = await page.$eval(
      'meta[name="keywords"]',
      (el) => el.getAttribute('content')
    ).catch(() => null)
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
      encoding: 'base64',
    })
    screenshots.push(`data:image/jpeg;base64,${fullScreenshot}`)

    // Scroll and capture more sections
    const scrollPositions = [0.33, 0.66]
    for (const position of scrollPositions) {
      await page.evaluate((pos) => {
        window.scrollTo({
          top: document.documentElement.scrollHeight * pos,
          behavior: 'smooth',
        })
      }, position)

      await new Promise(resolve => setTimeout(resolve, 1000))

      const screenshot = await page.screenshot({
        fullPage: false,
        type: 'jpeg',
        quality: 90,
        encoding: 'base64',
      })
      screenshots.push(`data:image/jpeg;base64,${screenshot}`)
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
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true,
    })
    const page = await browser.newPage()

    await page.goto(url, { timeout: 10000, waitUntil: 'domcontentloaded' })
    await browser.close()

    return true
  } catch {
    return false
  }
}
