# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Build and start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with automatic fixes
npm run type-check   # Run TypeScript type checking

# Database
npx prisma migrate dev     # Run database migrations
npx prisma generate       # Generate Prisma client
npx prisma studio         # Open Prisma Studio

# Bundle Analysis
npm run analyze      # Analyze bundle size with Next.js Bundle Analyzer
```

## Project Architecture

This is a **Next.js 15** AI content detection SaaS platform migrated from Vite. The project uses the **App Router** with TypeScript and follows a feature-based organization pattern.

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.0
- **Database**: Prisma ORM with SQLite (development)
- **Styling**: Tailwind CSS + ShadCN/UI components
- **Authentication**: JWT + Google OAuth
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives via ShadCN/UI
- **PWA**: @ducanh2912/next-pwa (production only)

### Route Structure
The app uses Next.js 15 App Router with route groups:

- `app/(auth)/` - Authentication pages (login, register, password reset)
- `app/(marketing)/` - Public marketing/landing pages  
- `app/(dashboard)/` - Protected dashboard pages (analysis, profile, history)
- `app/api/` - API routes for backend functionality

### Database Schema
The Prisma schema includes:
- **User**: Authentication, credits, subscription management
- **Analysis**: AI content detection results and metadata
- **Subscription**: Stripe subscription tracking

Key user roles: `USER`, `ADMIN`
Plans: `FREE`, `PRO`, `ENTERPRISE`

### Component Organization

```
components/
├── ui/              # ShadCN/UI base components (button, card, input, etc.)
├── features/        # Feature-specific components (auth/, analysis/, marketing/)
└── layout/          # Layout components (header/, footer/)
```

### Environment Variables
Uses `NEXT_PUBLIC_*` prefix for client-side variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_BASE_URL` - Frontend base URL
- `DATABASE_URL` - Prisma database connection

## Development Guidelines

### File Naming Conventions
- Files: `kebab-case.tsx` (e.g., `analysis-form.tsx`)
- Components: `PascalCase` (e.g., `AnalysisForm`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAnalysis`)

### Import Order
1. External libraries (React, Next.js)
2. UI components (`@/components/ui/*`)
3. Feature components (`@/components/features/*`)
4. Hooks (`@/hooks/*`)
5. Utilities (`@/lib/*`)
6. Types (`@/types/*`)

### Path Aliases
- `@/*` maps to project root
- Use absolute imports: `@/components/ui/button` instead of relative paths

### Authentication Flow
- JWT-based authentication with refresh tokens
- Google OAuth integration
- Route protection via middleware
- Role-based access control

### API Routes Structure
```
app/api/
├── auth/           # Authentication endpoints
├── analysis/       # AI content detection endpoints
├── health/         # Health check
└── test/          # Development testing
```

## Common Development Tasks

### Adding New UI Components
1. Use ShadCN CLI: `npx shadcn-ui@latest add [component]`
2. Components auto-install to `components/ui/`
3. Follow existing component patterns for variants and styling

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [migration-name]`
3. Run `npx prisma generate` to update client

### Adding API Routes
1. Create route handlers in `app/api/[route]/route.ts`
2. Export named functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use Prisma client for database operations

### Testing Locally
- Development server runs on `http://localhost:3000`
- Database file: `prisma/dev.db` (SQLite)
- PWA features disabled in development mode

## Migration Notes

This project was migrated from Vite to Next.js 15. Key changes:
- React Router → Next.js App Router
- `VITE_*` → `NEXT_PUBLIC_*` environment variables
- `react-helmet-async` → Next.js Metadata API
- Custom bundler → Next.js built-in optimization