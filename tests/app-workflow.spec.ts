import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://promoforge.vercel.app';

test.describe('PromoForge Production App Workflow', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console errors and warnings
    consoleErrors = [];
    consoleWarnings = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        consoleErrors.push(text);
        console.log('❌ CONSOLE ERROR:', text);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.log('⚠️  CONSOLE WARNING:', text);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(`Page Error: ${error.message}`);
      console.log('💥 PAGE ERROR:', error.message);
    });

    // Capture failed network requests
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      consoleErrors.push(`Request Failed: ${request.url()} - ${failure?.errorText}`);
      console.log('🔴 REQUEST FAILED:', request.url(), failure?.errorText);
    });
  });

  test('Initial page load and UI elements', async ({ page }) => {
    console.log('\n🚀 Testing initial page load...');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/PromoForge/i);
    console.log('✅ Page title loaded correctly');

    // Check for main heading
    const heading = page.locator('h1:has-text("PromoForge")');
    await expect(heading).toBeVisible();
    console.log('✅ Main heading visible');

    // Check for URL input mode toggle buttons
    const singleModeButton = page.locator('button:has-text("Single URL")');
    const multipleModeButton = page.locator('button:has-text("Multiple URLs")');
    await expect(singleModeButton).toBeVisible();
    await expect(multipleModeButton).toBeVisible();
    console.log('✅ Mode toggle buttons visible');

    // Check for URL input field
    const urlInput = page.locator('input[placeholder*="example.com"]');
    await expect(urlInput).toBeVisible();
    console.log('✅ URL input field visible');

    // Check for analyze button (slider only visible in specific mode)
    const analyzeButton = page.locator('button:has-text("Analyze & Extract")');
    await expect(analyzeButton).toBeVisible();
    console.log('✅ Analyze button visible');

    console.log(`\n📊 Console Errors: ${consoleErrors.length}`);
    console.log(`📊 Console Warnings: ${consoleWarnings.length}`);
  });

  test('Single URL mode workflow', async ({ page }) => {
    console.log('\n🔍 Testing single URL mode workflow...');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Ensure we're in single mode
    const singleModeButton = page.locator('button:has-text("Single URL")');
    await singleModeButton.click();
    await page.waitForTimeout(500);

    // Enter a test URL
    const testUrl = 'https://example.com';
    const urlInput = page.locator('input[placeholder*="example.com"]').first();
    await urlInput.fill(testUrl);
    console.log(`✅ Entered test URL: ${testUrl}`);

    // Click analyze button (slider not visible in production single mode)
    const analyzeButton = page.locator('button:has-text("Analyze & Extract")');
    await analyzeButton.click();
    console.log('✅ Clicked Analyze button');

    // Wait for loading state
    const loadingIndicator = page.locator('text="Analyzing URL..."');
    if (await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('⏳ Loading indicator appeared');
    }

    console.log(`\n📊 Console Errors: ${consoleErrors.length}`);
    console.log(`📊 Console Warnings: ${consoleWarnings.length}`);
  });

  test('Multiple URL mode workflow', async ({ page }) => {
    console.log('\n📚 Testing multiple URL mode workflow...');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Switch to multiple mode
    const multipleModeButton = page.locator('button:has-text("Multiple URLs")');
    await multipleModeButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Switched to Multiple URL mode');

    // Check for multiple URL inputs
    const firstUrlInput = page.locator('input[placeholder*="example1.com"]');
    await expect(firstUrlInput).toBeVisible();
    console.log('✅ First URL input visible');

    // Check for Add URL button
    const addUrlButton = page.locator('button:has-text("Add URL")');
    await expect(addUrlButton).toBeVisible();
    console.log('✅ Add URL button visible');

    // Add a second URL input
    await addUrlButton.click();
    await page.waitForTimeout(300);
    console.log('✅ Clicked Add URL button');

    // Check if second input appeared
    const urlInputs = page.locator('input[placeholder*="example"]');
    const inputCount = await urlInputs.count();
    console.log(`✅ Number of URL inputs: ${inputCount}`);

    // Check for Scrape All button
    const scrapeAllButton = page.locator('button:has-text("Scrape All")');
    await expect(scrapeAllButton).toBeVisible();
    console.log('✅ Scrape All button visible');

    console.log(`\n📊 Console Errors: ${consoleErrors.length}`);
    console.log(`📊 Console Warnings: ${consoleWarnings.length}`);
  });

  test('Audio controls visibility', async ({ page }) => {
    console.log('\n🎵 Testing audio controls...');

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Initially audio controls should not be visible
    const audioControlsCard = page.locator('text="Audio Settings"');
    const isAudioVisible = await audioControlsCard.isVisible({ timeout: 1000 }).catch(() => false);

    if (isAudioVisible) {
      console.log('⚠️  Audio controls visible on initial load (should only show after scraping)');
    } else {
      console.log('✅ Audio controls hidden initially (correct behavior)');
    }

    console.log(`\n📊 Console Errors: ${consoleErrors.length}`);
    console.log(`📊 Console Warnings: ${consoleWarnings.length}`);
  });

  test('Network requests monitoring', async ({ page }) => {
    console.log('\n🌐 Monitoring network requests...');

    const apiRequests: { url: string; status: number; method: string }[] = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiRequests.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
        console.log(`📡 API Request: ${response.request().method()} ${url} - Status: ${response.status()}`);
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log(`\n📊 Total API requests: ${apiRequests.length}`);
    apiRequests.forEach((req) => {
      console.log(`  - ${req.method} ${req.url} (${req.status})`);
    });

    console.log(`\n📊 Console Errors: ${consoleErrors.length}`);
    console.log(`📊 Console Warnings: ${consoleWarnings.length}`);
  });

  test.afterEach(async () => {
    // Report all errors and warnings at the end of each test
    if (consoleErrors.length > 0) {
      console.log('\n🔴 ERRORS FOUND:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log('\n⚠️  WARNINGS FOUND:');
      consoleWarnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
      console.log('\n✨ No console errors or warnings detected!');
    }
  });
});
