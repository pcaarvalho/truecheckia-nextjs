# 🚀 Vercel Deployment Guide for TrueCheckIA

## Prerequisites

- [x] GitHub repository with code (https://github.com/pcaarvalho/truecheckia-nextjs)
- [ ] Vercel account (https://vercel.com)
- [ ] PostgreSQL database (Neon, Supabase, or Vercel Postgres)
- [ ] Stripe account with products configured
- [ ] Google OAuth credentials
- [ ] OpenAI API key
- [ ] Resend API key for emails

## 📋 Step-by-Step Deployment

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from GitHub repository
4. Select `pcaarvalho/truecheckia-nextjs`
5. Click "Import"

### Step 2: Configure Project Settings

In the Vercel project configuration:

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `prisma generate && next build`
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install`

### Step 3: Set Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

#### 🌍 Core Configuration
```
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
FRONTEND_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app
```

#### 🗄️ Database (PostgreSQL)
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require
```

#### 🔐 Authentication
```
JWT_SECRET=[generate with: openssl rand -base64 64]
JWT_REFRESH_SECRET=[generate with: openssl rand -base64 64]
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

#### 🔑 Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback
```

#### 🛒 Stripe
```
STRIPE_SECRET_KEY=sk_live_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
STRIPE_PRO_PRODUCT_ID=prod_xxx
STRIPE_ENTERPRISE_PRODUCT_ID=prod_xxx
STRIPE_PRO_PRICE_MONTHLY=price_xxx
STRIPE_PRO_PRICE_ANNUAL=price_xxx
```

#### 📧 Email (Resend)
```
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=TrueCheckIA <noreply@yourdomain.com>
```

#### 🤖 OpenAI
```
OPENAI_API_KEY=sk-your-key
```

#### 🛡️ Security
```
CRON_SECRET=[generate with: openssl rand -base64 64]
WEBHOOK_SECRET=[generate with: openssl rand -base64 64]
```

### Step 4: Database Setup

#### Option A: Vercel Postgres
1. Go to Storage tab in Vercel Dashboard
2. Create new Postgres database
3. Copy connection strings to environment variables

#### Option B: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection strings
4. Add to Vercel environment variables

#### Option C: Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy connection strings
4. Add to Vercel environment variables

### Step 5: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations in production
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Step 6: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to Vercel environment variables

### Step 7: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services > Credentials
4. Update OAuth 2.0 Client ID:
   - Add authorized redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
   - Add authorized JavaScript origins: `https://your-app.vercel.app`

### Step 8: Deploy

1. Click "Deploy" in Vercel Dashboard
2. Wait for build to complete (~2-5 minutes)
3. Check deployment logs for any errors

## 🔧 Post-Deployment

### Verify Deployment

1. Visit your app URL
2. Test critical paths:
   - [ ] Homepage loads
   - [ ] Login/Register works
   - [ ] Google OAuth works
   - [ ] Analysis feature works
   - [ ] Stripe checkout works
   - [ ] Dashboard accessible

### Setup Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your domain
3. Configure DNS as instructed
4. Update environment variables with new domain

### Enable Analytics (Optional)

1. Go to Analytics tab
2. Enable Web Analytics
3. Enable Speed Insights

### Setup Monitoring

1. Check Functions tab for API performance
2. Monitor Build & Development logs
3. Set up error alerts in Settings > Integrations

## 🐛 Troubleshooting

### Build Errors

**Prisma Client issues:**
```bash
# Add to build command:
prisma generate && next build
```

**Module not found:**
- Check all imports use correct paths
- Verify dependencies in package.json

### Runtime Errors

**Database connection failed:**
- Verify DATABASE_URL is correct
- Check SSL settings (`?sslmode=require`)
- Ensure database is accessible

**Authentication not working:**
- Verify JWT_SECRET is set
- Check cookie settings for production
- Ensure NEXTAUTH_URL matches your domain

**Stripe webhooks failing:**
- Verify webhook secret
- Check endpoint URL
- Ensure raw body parsing

### Performance Issues

**Slow initial load:**
- Enable Edge Runtime for API routes
- Optimize images with next/image
- Use ISR for static pages

**High serverless function usage:**
- Implement caching
- Optimize database queries
- Use Edge functions where possible

## 📊 Monitoring & Maintenance

### Daily Checks
- Monitor error rates in Functions tab
- Check database connection pool
- Review API response times

### Weekly Tasks
- Review analytics data
- Check for security updates
- Optimize slow queries

### Monthly Tasks
- Update dependencies
- Review and optimize costs
- Backup database

## 🔐 Security Checklist

- [x] All secrets in environment variables
- [x] No sensitive data in code
- [x] HTTPS enforced
- [x] Rate limiting configured
- [x] Input validation on all forms
- [x] SQL injection prevention (Prisma)
- [x] XSS protection (React)
- [x] CSRF protection (SameSite cookies)

## 📚 Additional Resources

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## 🆘 Support

For deployment issues:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review deployment logs
3. Contact Vercel support
4. Open issue on [GitHub repository](https://github.com/pcaarvalho/truecheckia-nextjs/issues)

---

**Last Updated**: August 29, 2025
**Deployment Status**: ✅ Ready for Production