# PromoForge Scraper - Enhanced Features

## Overview
The scraper now supports configurable screenshot counts and automatic search/form filling, allowing you to capture more pages and interact with websites before taking screenshots.

## Features

### 1. Configurable Screenshot Count
Capture anywhere from 1 to 10 screenshots instead of the default 3.

### 2. Search/Form Interaction
Automatically type into search fields, submit forms, and wait for results before capturing screenshots.

## API Usage

### Basic Usage (Default 3 Screenshots)
```bash
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Custom Screenshot Count
```bash
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "screenshotCount": 5
}
```

### With Search Query (e.g., Google Maps)
```bash
POST /api/scrape
Content-Type: application/json

{
  "url": "https://www.google.com/maps",
  "screenshotCount": 6,
  "searchQuery": "123 Main St, New York, NY",
  "searchSelector": "input#searchboxinput",
  "submitSelector": "button#searchbox-searchbutton",
  "waitAfterSearch": 4000
}
```

### With Search Query (Enter Key)
```bash
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com/search",
  "screenshotCount": 4,
  "searchQuery": "real estate property",
  "searchSelector": "input.search-box",
  "waitAfterSearch": 3000
}
```
*Note: Omit `submitSelector` to press Enter instead of clicking a button*

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | - | The URL to scrape |
| `screenshotCount` | number | No | 3 | Number of screenshots (1-10) |
| `searchQuery` | string | No | - | Text to type into search field |
| `searchSelector` | string | No | - | CSS selector for search input |
| `submitSelector` | string | No | - | CSS selector for submit button (optional) |
| `waitAfterSearch` | number | No | 3000 | Milliseconds to wait after search (0-10000) |

## How It Works

### Screenshot Distribution
Screenshots are evenly distributed across the page:
- **1 screenshot**: Top of page (0%)
- **2 screenshots**: Top (0%), Bottom (100%)
- **3 screenshots**: Top (0%), Middle (50%), Bottom (100%)
- **5 screenshots**: 0%, 25%, 50%, 75%, 100%
- **10 screenshots**: 0%, 11%, 22%, 33%, 44%, 55%, 66%, 77%, 88%, 100%

### Search Workflow
1. Navigate to URL
2. Wait for page load (2 seconds)
3. Find search input using `searchSelector`
4. Type `searchQuery` into input
5. Either click `submitSelector` button OR press Enter
6. Wait `waitAfterSearch` milliseconds
7. Capture screenshots at calculated positions

## Real-World Examples

### Example 1: Real Estate Listing
```json
{
  "url": "https://www.zillow.com",
  "screenshotCount": 8,
  "searchQuery": "90210",
  "searchSelector": "input#search-box-input"
}
```

### Example 2: Google Maps Address
```json
{
  "url": "https://www.google.com/maps",
  "screenshotCount": 6,
  "searchQuery": "Empire State Building, New York",
  "searchSelector": "input#searchboxinput",
  "submitSelector": "button#searchbox-searchbutton",
  "waitAfterSearch": 5000
}
```

### Example 3: Product Search
```json
{
  "url": "https://www.amazon.com",
  "screenshotCount": 5,
  "searchQuery": "wireless headphones",
  "searchSelector": "input#twotabsearchtextbox",
  "submitSelector": "input#nav-search-submit-button"
}
```

### Example 4: Multiple Page Scroll (No Search)
```json
{
  "url": "https://your-long-landing-page.com",
  "screenshotCount": 10
}
```

## Finding CSS Selectors

### Method 1: Browser DevTools
1. Right-click the search input → Inspect
2. Look for `id` attribute: `<input id="search-box">`
3. Selector: `input#search-box` or `#search-box`

### Method 2: Common Patterns
- `input[type="search"]` - Generic search input
- `input[name="q"]` - Common for search queries
- `input#searchboxinput` - Google Maps
- `.search-input` - Class-based selector

### Method 3: Use Browser Console
```javascript
// Test your selector in browser console
document.querySelector('input#search-box')
```

## Error Handling

If search interaction fails:
- The scraper will log the error
- Continue with normal screenshot capture
- No fatal error - you'll still get screenshots

## Tips for Best Results

1. **Wait Time**: Increase `waitAfterSearch` for slow-loading results (maps, search engines)
2. **Screenshot Count**: Use 5-8 for comprehensive page coverage
3. **Selectors**: Use ID selectors when available (most reliable)
4. **Testing**: Test selectors in browser console first
5. **Long Pages**: Increase screenshot count for long landing pages

## TypeScript Usage

```typescript
import type { ScrapeOptions } from '@/types'

const options: ScrapeOptions = {
  url: 'https://example.com',
  screenshotCount: 6,
  searchQuery: '123 Main St',
  searchSelector: 'input.search',
  submitSelector: 'button.submit',
  waitAfterSearch: 4000
}

const result = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(options)
})
```

## Limitations

- Maximum 10 screenshots per scrape (performance)
- Maximum 10 seconds wait time after search
- Search feature requires valid CSS selectors
- Page must load within 30 seconds

## Troubleshooting

**Problem**: Search not working
- **Solution**: Verify CSS selector in browser console
- **Solution**: Try using ID selector instead of class
- **Solution**: Increase `waitAfterSearch` time

**Problem**: Not enough screenshots
- **Solution**: Increase `screenshotCount` (max 10)

**Problem**: Screenshots look the same
- **Solution**: Page might be short - reduce `screenshotCount`
- **Solution**: Ensure page has enough content to scroll
