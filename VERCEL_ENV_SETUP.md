# Vercel Environment Variables Setup

## Required Environment Variables for Production

Copy these environment variables to your Vercel project settings:

### 1. Database Configuration
```bash
# PostgreSQL Connection (Vercel Postgres or Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### 2. Authentication
```bash
# JWT Secrets (Generate using: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-token-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
BCRYPT_ROUNDS="12"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Application URLs
```bash
# Must be absolute URLs
NEXT_PUBLIC_APP_URL="https://truecheckia.com"
FRONTEND_URL="https://truecheckia.com"
NEXTAUTH_URL="https://truecheckia.com"
```

### 4. OpenAI Integration
```bash
# OpenAI API Key for AI detection
OPENAI_API_KEY="sk-..."
```

### 5. Stripe Payments
```bash
# Stripe Keys (from Stripe Dashboard)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."
```

### 6. Email Service (Resend)
```bash
# Resend API Key
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="support@truecheckia.com"
```

### 7. Optional Services
```bash
# Redis for rate limiting (optional)
REDIS_URL="redis://..."

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
NEXT_PUBLIC_MIXPANEL_TOKEN="..."
NEXT_PUBLIC_CLARITY_PROJECT_ID="..."
```

## Setting Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate scope:
   - **Production**: Live site
   - **Preview**: Branch deployments
   - **Development**: Local development with `vercel dev`

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variable
vercel env add JWT_SECRET production
vercel env add DATABASE_URL production preview

# List all environment variables
vercel env ls

# Pull environment variables to .env.local
vercel env pull .env.local
```

### Method 3: Using vercel.json (NOT Recommended for Secrets)
Only use for non-sensitive configuration:
```json
{
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```

## Environment Variable Scopes

- **Production**: Applied to production deployments (main branch)
- **Preview**: Applied to preview deployments (pull requests)
- **Development**: Used with `vercel dev` command

## Generating Secure Secrets

### JWT Secrets
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

### Database URL Format
```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require

# Example for Vercel Postgres:
postgresql://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require

# Example for Supabase:
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

## Vercel System Environment Variables

These are automatically provided by Vercel:

- `VERCEL`: "1" when running on Vercel
- `VERCEL_ENV`: "production" | "preview" | "development"
- `VERCEL_URL`: The deployment URL
- `VERCEL_REGION`: Deployment region
- `VERCEL_GIT_COMMIT_SHA`: Git commit SHA
- `VERCEL_GIT_COMMIT_REF`: Git branch name
- `VERCEL_GIT_COMMIT_MESSAGE`: Commit message
- `VERCEL_GIT_REPO_OWNER`: GitHub username/org
- `VERCEL_GIT_REPO_SLUG`: Repository name

## Pre-deployment Checklist

- [ ] All required environment variables are set in Vercel
- [ ] Database is provisioned and accessible
- [ ] Stripe products and prices are created
- [ ] Google OAuth credentials are configured with correct redirect URLs
- [ ] Resend API key is active
- [ ] All URLs use HTTPS in production
- [ ] Secrets are not committed to git

## Common Issues and Solutions

### Issue: JWT_SECRET not found
**Solution**: Ensure JWT_SECRET is set in Production environment variables

### Issue: Database connection failed
**Solution**: Check DATABASE_URL format and SSL requirements

### Issue: Google OAuth redirect mismatch
**Solution**: Add `https://truecheckia.com/api/auth/google/callback` to Google Console

### Issue: Stripe webhook fails
**Solution**: Update webhook endpoint secret after creating webhook in Stripe Dashboard

## Security Best Practices

1. Never commit `.env` files to git
2. Use different secrets for different environments
3. Rotate secrets regularly
4. Use strong, randomly generated secrets
5. Limit environment variable access by scope
6. Monitor failed authentication attempts
7. Enable 2FA on Vercel account

## Next Steps

1. Set all required environment variables in Vercel Dashboard
2. Test with `vercel dev` locally
3. Deploy to preview branch first
4. Verify all features work in preview
5. Deploy to production