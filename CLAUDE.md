# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Setup & Essential Commands

```bash
# Development
npm install                      # Install dependencies
npm run dev                      # Start dev server (http://localhost:3000)
npm run build                    # Build for production (includes Prisma generate)
npm run start                    # Start production server

# Code Quality - ALWAYS run before completing tasks
npm run lint                     # Run ESLint
npm run lint:fix                 # Fix ESLint issues automatically
npm run type-check               # Run TypeScript type checking

# Database Operations
npx prisma migrate dev --name [name]  # Create new migration
npx prisma generate                    # Generate Prisma client after schema changes
npx prisma studio                      # Open Prisma Studio GUI
npx prisma db push                     # Push schema changes without migration (dev only)

# Testing & Utilities
node scripts/create-test-user.js       # Create test user in database
node scripts/test-middleware.js        # Test JWT middleware
node scripts/pre-deploy-validation.js  # Run pre-deployment checks
npm run analyze                         # Analyze bundle size
node e2e/run-tests.ts                  # Run e2e tests

# Deployment
NODE_OPTIONS='--max-old-space-size=8192' npm run build  # Build with increased memory
npm run vercel-build                                    # Vercel production build
```

## High-Level Architecture

This is a **Next.js 15 SaaS platform** for AI content detection with modern patterns:

### Tech Stack
- **Framework**: Next.js 15.5 with App Router
- **Database**: Prisma 6.14 with PostgreSQL (SQLite in dev)
- **Auth**: JWT with httpOnly cookies + refresh token rotation
- **Payments**: Stripe subscriptions
- **UI**: TailwindCSS + ShadCN/UI components
- **State**: TanStack Query for server state
- **API**: OpenAI for content analysis

### Critical Architecture Decisions

1. **App Router with Route Groups**: Three main route groups:
   - `(auth)` - Public authentication pages
   - `(marketing)` - Public landing/marketing pages  
   - `(dashboard)` - Protected user dashboard area

2. **JWT Authentication Flow**: 
   ```
   Login → JWT Access (15min) + Refresh (7d) → httpOnly cookies
   → Middleware validates on each request → Auto-refresh via /api/auth/refresh
   ```
   Middleware (`middleware.ts`) protects routes at the edge level.

3. **Database Schema Core**:
   - **User**: Auth fields, role (USER/ADMIN), plan (FREE/PRO/ENTERPRISE), credits system
   - **Analysis**: AI detection results with confidence levels
   - **Subscription**: Stripe subscription tracking
   - Credit system: FREE users get 10 credits/month, auto-reset via cron

4. **Component Architecture**:
   - `components/ui/` - Base ShadCN primitives
   - `components/features/` - Business logic components
   - `components/dashboard/` - Dashboard-specific components

### API Routes Pattern

All API routes in `app/api/` follow RESTful conventions:

**Core Routes**:
- `/api/auth/*` - Authentication (login, register, refresh, OAuth)
- `/api/analysis` - AI content analysis
- `/api/stripe/*` - Payment processing
- `/api/dashboard/stats` - User statistics
- `/api/cron/reset-credits` - Monthly credit reset

**Response Format**:
```typescript
// Success: { success: true, data: T }
// Error: { success: false, error: string }
```

## Development Patterns

### File & Import Conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Use `@/` path alias for absolute imports
- Import order: External → UI → Features → Hooks → Utils → Types

### Adding New Features Checklist
1. Create feature components in `components/features/[feature]/`
2. Add API route in `app/api/[feature]/route.ts`
3. Create custom hook in `hooks/[feature]/use-[feature].ts`
4. Update Prisma schema if needed → migrate → generate
5. Add route to protected/public arrays in `middleware.ts`

### Common Pitfalls to Avoid
- Don't import server-only code in client components
- Use `NEXT_PUBLIC_` prefix for client-side env vars
- Run `npx prisma generate` after schema changes
- JWT tokens expire after 15 minutes - handle refresh properly
- Stripe webhooks require `rawBody` - don't parse request body
- Clear cookies when debugging auth issues
- Build failures often need: `NODE_OPTIONS='--max-old-space-size=8192'`

## Key Library Files

- **lib/auth.ts** - JWT token generation/validation
- **lib/auth-edge.ts** - Edge-compatible auth for middleware
- **lib/prisma.ts** - Prisma client singleton
- **lib/api-client.ts** - Frontend API client with auth
- **lib/stripe/client.ts** - Stripe configuration
- **lib/credits/credit-manager.ts** - Credit system logic
- **lib/ai-detection.ts** - OpenAI integration for analysis

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

**Required**:
- `DATABASE_URL` - PostgreSQL connection (SQLite for dev)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` - Auth secrets
- `OPENAI_API_KEY` - For AI detection

**Optional**:
- Google OAuth credentials
- Stripe keys for payments
- Resend/SMTP for emails

## Production Deployment

Optimized for Vercel with:
- Edge middleware for auth
- PostgreSQL via Vercel Postgres/Supabase
- Automatic image optimization
- PWA support (production only)

## Migration Context

This project was migrated from Vite to Next.js 15:
- React Router → App Router with file-based routing
- Vite env vars (`VITE_*`) → Next.js (`NEXT_PUBLIC_*`)
- Client-only → Server/Client components
- Manual SSR → Built-in SSR/SSG/ISR

## Current Known Issues

1. **ESLint temporarily disabled** in `next.config.js` - re-enable after fixing violations
2. **Theme persistence** - Default theme may not apply correctly on first load
3. **Memory usage** - Large builds require increased Node memory limit

## Permissions

Claude has authorization for the following operations without confirmation:
- **Execute any command** - All bash commands can be run without asking for permission
- **Vercel deployments** - Automatic deployments to Vercel are authorized
- **Direct code changes** - Modifications to code including production environments are permitted
- **Test package installation** - Installation and execution of test packages (e.g., MCP Playwright) are authorized