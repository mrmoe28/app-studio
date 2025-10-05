# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type

This is a Next.js 15 application using the App Router with React 19, TypeScript, and Tailwind CSS.

## Key Commands

### Development
```bash
npm run dev --turbopack    # Start development server with Turbopack
npm run dev               # Start development server (standard)
```

### Code Quality
```bash
npm run lint              # Run ESLint (mandatory after changes)
npx tsc --noEmit         # Type check without emitting files
npm run check            # Run all quality checks (if configured)
```

### Build & Deploy
```bash
npm run build            # Build for production
npm run start            # Start production server
```

### Testing
```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run e2e              # Run Playwright E2E tests (if configured)
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **React**: Version 19 with Server Components
- **Styling**: Tailwind CSS v4 + ShadCN UI components
- **TypeScript**: Strict mode enabled
- **Database**: NeonDB with Drizzle ORM (when applicable)
- **Payments**: Stripe (when applicable)

### Project Structure
```
/src
  /app              # Next.js App Router pages and layouts
  /components
    /ui             # ShadCN components (MANDATORY for all UI)
    /features       # Feature-specific components
    /layouts        # Layout components
  /lib              # Utility functions and configurations
  /hooks            # Custom React hooks
  /types            # TypeScript type definitions
  /providers        # React Context providers
  /styles           # Global styles
/public             # Static assets
```

### Component Architecture
- **Server Components**: Default for all components unless client interactivity needed
- **Client Components**: Mark with 'use client' for hooks, event handlers, browser APIs
- **Layouts**: Use nested layouts for shared UI across routes
- **Loading States**: Implement loading.tsx for Suspense boundaries
- **Error Handling**: Use error.tsx for error boundaries

## Critical Development Rules

### Build Configuration
- **NEVER** use Turbopack in production builds (deployment issues)
- **ALWAYS** use standard Next.js builds for Vercel deployment
- Exception: Turbopack OK for local development (`npm run dev --turbopack`)

### Deployment
- **NEVER** create Vercel projects without explicit permission
- **NEVER** deploy without being asked
- **ALWAYS** ask before deployment-related changes

### Code Quality
- **ALWAYS** run ESLint after feature additions or changes
- **MANDATORY**: Fix all ESLint errors before task completion
- **NO** workarounds, hacks, or temporary fixes allowed
- **ASK** when uncertain - don't assume or guess

### Component Development
- **ALWAYS** use ShadCN components for UI (not basic HTML/CSS)
- **ALWAYS** use SuperDesign principles for layouts
- **PREFER** Server Components over Client Components
- **USE** TypeScript strict mode - no `any` without justification

### Error Handling
- **ZERO TOLERANCE**: Every error must be addressed immediately
- **FIX BEFORE PROCEEDING**: Cannot move to next task until resolved
- **DOCUMENT**: Add error solutions to project knowledge base
- **NO SILENT FAILURES**: Always acknowledge and fix errors

## Configuration Files

### next.config.ts Template
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typedRoutes: true,
}

export default nextConfig
```

### Required Dependencies
```json
{
  "dependencies": {
    "next": "^15.5.3",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "typescript": "^5.9.2",
    "@shadcn/ui": "latest",
    "tailwindcss": "^4.1.13",
    "zod": "^3.23.8",
    "next-themes": "^0.3.0"
  }
}
```

## Development Workflow

### For New Features
1. Research web best practices first (mandatory)
2. Check CONTEXT.md for project state and decisions
3. Use appropriate component template (Server/Client/Layout)
4. Implement with ShadCN + SuperDesign
5. Run ESLint and fix all errors
6. Update CONTEXT.md with progress and decisions

### Tool Awareness
- Desktop Commander is available for file operations
- Playwright available for automation
- Use available tools instead of asking user for manual tasks

## Project Memory System

### CONTEXT.md (Mandatory)
- **ALWAYS UPDATE**: After every significant change
- **ALWAYS REFERENCE**: Before starting any task
- **MUST INCLUDE**:
  - Current project state
  - Active goals and next steps
  - Recent decisions and rationale
  - Known issues and status
  - Architecture notes

### When to Update CONTEXT.md
1. After completing features
2. After making architectural decisions
3. After encountering and solving issues
4. Before and after research sessions
5. When changing project direction

## Git Workflow

### Commit Messages
- **MUST** use Conventional Commits format
- **SHOULD NOT** reference Claude or Anthropic
- Format: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore, etc.

### Git Safety
- **NEVER** update git config
- **NEVER** run destructive commands without approval
- **NEVER** rewrite history on shared branches
- **NEVER** skip hooks (--no-verify) unless explicitly requested

## Performance & SEO

### Required Optimizations
- Use `next/image` for all images with proper sizing
- Use `next/font` for Google Fonts
- Export metadata from every page
- Implement streaming with Suspense
- Add proper loading and error states

## Testing Standards

### Unit Tests
- Colocate in `*.test.ts` files
- Test pure logic separately from DB/API calls
- Prefer integration tests over heavy mocking

### E2E Tests
- Place in `/e2e` directory
- Use Playwright for browser automation
- Keep tests minimal but realistic

## API Development

### Server Actions
- Use for data mutations
- Validate inputs with Zod
- Return typed responses
- Handle errors explicitly

### API Routes
- Version your APIs (`/api/v1/...`)
- Use middleware for auth/validation
- Return proper HTTP status codes

## Environment Variables

Required env vars documented in `.env.example`:
- `NEXT_PUBLIC_APP_URL`: Application URL
- `DATABASE_URL`: Database connection (if using DB)
- Stripe keys: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (if using Stripe)

## Common Patterns

### Data Fetching (Server Component)
```typescript
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // or 'no-store' for dynamic
  })
  return <div>{/* render data */}</div>
}
```

### Client Interactivity
```typescript
'use client'
import { useState } from 'react'

export default function Interactive() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

### Forms with ShadCN
- Use `react-hook-form` + `zod` for validation
- Use ShadCN Form components
- Handle submission with Server Actions

## Remember

- **Research first**: Check best practices before implementing
- **Ask don't assume**: Get clarification when uncertain
- **Fix before proceeding**: Address all errors immediately
- **Document everything**: Keep CONTEXT.md updated
- **Use the stack**: ShadCN + SuperDesign + Next.js 15 + React 19
