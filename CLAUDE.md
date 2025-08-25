# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev                      # Start development server (http://localhost:3000)
npm run build                    # Build for production
npm run start                    # Start production server
npm run preview                  # Build and start production server

# Code Quality - ALWAYS run before completing tasks
npm run lint                     # Run ESLint
npm run lint:fix                 # Run ESLint with automatic fixes
npm run type-check               # Run TypeScript type checking

# Database Operations
npx prisma migrate dev --name [name]  # Create new migration
npx prisma generate                    # Generate Prisma client after schema changes
npx prisma studio                      # Open Prisma Studio GUI
npx prisma db push                     # Push schema changes without migration (dev only)

# Testing & Analysis
npm run analyze                  # Analyze bundle size with Next.js Bundle Analyzer

# Script Utilities
node scripts/create-test-user.js        # Create test user in database
node scripts/setup-stripe-products.js   # Setup Stripe products
```

## High-Level Architecture

This is a **Next.js 15** AI content detection SaaS platform. The application uses modern React patterns with App Router, server components, and comprehensive authentication/payment systems.

### Critical Architecture Decisions

1. **App Router with Route Groups**: The app uses Next.js 15's App Router with three main route groups:
   - `(auth)` - Public authentication pages
   - `(marketing)` - Public landing/marketing pages  
   - `(dashboard)` - Protected user dashboard area

2. **JWT Authentication with Middleware**: Authentication is handled via JWT tokens with refresh token rotation. The `middleware.ts` validates tokens and protects routes at the edge.

3. **Prisma + SQLite/PostgreSQL**: Database abstraction via Prisma ORM, using SQLite for development and PostgreSQL for production. All database operations go through the Prisma client.

4. **Component Organization**: Three-tier component structure:
   - `components/ui/` - Base ShadCN/UI primitives (button, card, input)
   - `components/features/` - Feature-specific business components
   - `components/layout/` - Layout and navigation components

5. **AI Detection System**: The core AI detection logic is centralized in `lib/ai-detection.ts` with multiple provider support and unified response format.

### Authentication & Security Flow

```
User Login → JWT Access Token (15min) + Refresh Token (7d) 
           → Stored in httpOnly cookies
           → Middleware validates on each request
           → Auto-refresh via /api/auth/refresh
```

Protected routes check for valid JWT in middleware before rendering. Invalid tokens trigger redirect to login with return URL preservation.

### Database Schema Core Models

- **User**: Authentication, credits, subscription, role (USER/ADMIN)
- **Analysis**: AI detection results with confidence scores
- **Subscription**: Stripe integration for PRO/ENTERPRISE plans

Credit system: FREE users get 10 credits/month, auto-reset via cron job.

### API Routes Pattern

All API routes follow RESTful conventions in `app/api/`:
- Authentication: `/api/auth/[login|register|refresh|logout]`
- Analysis: `/api/analysis` (POST for new, GET for history)
- Stripe: `/api/stripe/[checkout|webhook|portal]`

### State Management Strategy

- **Server State**: TanStack Query for API data caching/synchronization
- **Form State**: React Hook Form + Zod validation
- **UI State**: Local component state, Context API for themes
- **Auth State**: Custom auth context with JWT management

## Development Patterns

### File Naming & Import Conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Path alias: `@/` maps to root (use absolute imports)
- Import order: External → UI → Features → Hooks → Utils → Types

### Adding New Features Checklist
1. Create feature components in `components/features/[feature]/`
2. Add API route in `app/api/[feature]/route.ts`
3. Create custom hook in `hooks/[feature]/use-[feature].ts`
4. Update Prisma schema if needed → migrate → generate
5. Add route to protected/public arrays in `middleware.ts`

### Common Pitfalls to Avoid
- Don't import server-only code in client components
- Always use `NEXT_PUBLIC_` prefix for client-side env vars
- Run `npx prisma generate` after any schema changes
- Clear cookies when debugging auth issues
- PWA features only work in production builds

### Testing & Debugging
- Auth issues: Check JWT expiry, cookie settings, middleware logs
- Database issues: Use `npx prisma studio` for visual debugging
- API issues: Check CORS settings, JWT validation
- Build issues: Run `npm run type-check` first

## Migration Context

This project was migrated from Vite to Next.js 15. Key differences:
- React Router → Next.js App Router with file-based routing
- Vite env vars (`VITE_*`) → Next.js env vars (`NEXT_PUBLIC_*`)
- Client-side routing → Server components + client components
- Manual SSR → Built-in SSR/SSG/ISR support

## Production Deployment

The app is optimized for Vercel deployment with:
- Edge middleware for auth
- Automatic image optimization
- PWA support (production only)
- PostgreSQL via Vercel Postgres or Supabase
- Stripe webhook handling