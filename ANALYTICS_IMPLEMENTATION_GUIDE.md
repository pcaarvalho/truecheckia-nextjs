# 📊 TrueCheckIA Analytics Implementation Guide

## 🎯 Overview

This guide documents the comprehensive Google Analytics 4 and multi-platform tracking system implemented for TrueCheckIA. The system provides complete user journey tracking, conversion measurement, and GDPR-compliant analytics across multiple platforms.

## 🏗️ Architecture

### Core Components

1. **Analytics Core** (`app/lib/analytics/`)
   - `gtag.ts` - Google Analytics 4 configuration and utilities
   - `events.ts` - Centralized event definitions and tracking functions
   - `clarity.ts` - Microsoft Clarity integration for heatmaps
   - `facebook-pixel.ts` - Facebook Pixel for advertising and retargeting
   - `linkedin-insight.ts` - LinkedIn Insight Tag for B2B tracking
   - `mixpanel.ts` - Product analytics and user journey tracking

2. **React Components** (`app/components/analytics/`)
   - `GoogleAnalytics.tsx` - GA4 script injection with consent management
   - `TrackingScripts.tsx` - Third-party tracking scripts loader
   - `ConsentManager.tsx` - GDPR-compliant consent management
   - `AnalyticsDashboard.tsx` - Development debugging interface

3. **React Hooks** (`app/hooks/`)
   - `use-analytics.ts` - Main analytics hook with unified API
   - `use-page-view.ts` - Automatic page view tracking
   - `use-conversion.ts` - Conversion tracking utilities

## 🔧 Environment Setup

### Required Environment Variables

```env
# Analytics - Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GA_DEBUG="false"

# Analytics - Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID="XXXXXXXXXX"

# Analytics - Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID="XXXXXXXXXX"

# Analytics - LinkedIn Insight Tag
NEXT_PUBLIC_LINKEDIN_PARTNER_ID="XXXXXXXXXX"

# Analytics - Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN="XXXXXXXXXX"

# Optional Analytics
NEXT_PUBLIC_HOTJAR_ID="XXXXXXXXXX"
NEXT_PUBLIC_INTERCOM_APP_ID="XXXXXXXXXX"
NEXT_PUBLIC_CRISP_WEBSITE_ID="XXXXXXXXXX"

# Development
NEXT_PUBLIC_ANALYTICS_DEBUG="false"
```

### Platform Setup Instructions

#### 1. Google Analytics 4
1. Create a new GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Set up custom dimensions:
   - `user_plan` - Custom Dimension 1
   - `user_role` - Custom Dimension 2
   - `signup_method` - Custom Dimension 3
   - `analysis_count` - Custom Dimension 4
   - `credits_remaining` - Custom Dimension 5

#### 2. Microsoft Clarity
1. Sign up at [clarity.microsoft.com](https://clarity.microsoft.com)
2. Create a new project
3. Get your Project ID

#### 3. Facebook Pixel
1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Create a new Pixel in Events Manager
3. Get your Pixel ID

#### 4. LinkedIn Insight Tag
1. Access [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager)
2. Create an Insight Tag
3. Get your Partner ID

#### 5. Mixpanel
1. Sign up at [mixpanel.com](https://mixpanel.com)
2. Create a new project
3. Get your Project Token

## 📋 Implementation Examples

### Basic Analytics Tracking

```typescript
import { useAnalytics } from '@/app/hooks/use-analytics'

function MyComponent() {
  const analytics = useAnalytics()

  const handleButtonClick = () => {
    // Track button click
    analytics.trackCTA('Get Started', 'hero_section')
  }

  const handleAnalysisComplete = (result: AnalysisResult) => {
    // Track analysis completion
    analytics.trackAnalysis.completed({
      text_length: result.text.length,
      detection_confidence: result.confidence,
      ai_probability: result.aiScore,
      processing_time: result.processingTime,
      credits_used: 1,
      analysis_type: 'text',
      user_plan: user?.plan
    })
  }

  return (
    <div>
      <button onClick={handleButtonClick}>
        Get Started
      </button>
    </div>
  )
}
```

### Page View Tracking

```typescript
import { usePageView, useAnalysisPageView } from '@/app/hooks/use-page-view'

function AnalysisPage() {
  // Automatic page view tracking with custom properties
  useAnalysisPageView()

  // Or custom page view tracking
  usePageView({
    customProperties: {
      page_type: 'tool',
      conversion_goal: 'analysis_completion'
    }
  })

  return <div>Analysis Page Content</div>
}
```

### User Identification

```typescript
function App() {
  const analytics = useAnalytics()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      analytics.identifyUser(user.id, {
        email: user.email,
        name: user.name,
        plan: user.plan,
        signupMethod: user.signupMethod,
        creditsRemaining: user.credits,
        totalAnalyses: user.totalAnalyses
      })
    }
  }, [user, analytics])
}
```

### Conversion Tracking

```typescript
import { useConversion } from '@/app/hooks/use-conversion'

function CheckoutPage() {
  const { trackSubscriptionConversion } = useConversion()

  const handleSubscriptionSuccess = (subscriptionData) => {
    trackSubscriptionConversion({
      plan: subscriptionData.plan,
      billingCycle: subscriptionData.billingCycle,
      price: subscriptionData.price,
      currency: 'USD',
      transactionId: subscriptionData.transactionId,
      userId: user.id,
      userEmail: user.email,
      previousPlan: user.currentPlan
    })
  }
}
```

## 🎯 Event Tracking Categories

### 1. User Authentication
- `signup_initiated` - User starts signup process
- `signup_completed` - User successfully creates account
- `login_completed` - User logs in
- `google_oauth_initiated` - User clicks Google sign-in

### 2. Content Analysis
- `analysis_started` - User begins content analysis
- `analysis_completed` - Analysis finishes successfully
- `analysis_failed` - Analysis encounters error
- `analysis_shared` - User shares analysis results

### 3. Subscription & Billing
- `subscription_viewed` - User views pricing page
- `subscription_initiated` - User clicks upgrade button
- `subscription_completed` - Successful payment
- `trial_started` - User begins trial period

### 4. Feature Usage
- `feature_used` - User interacts with specific features
- `api_key_generated` - User creates API key
- `credits_low_warning` - User receives low credits alert

### 5. User Engagement
- `help_accessed` - User opens help documentation
- `support_contacted` - User contacts support
- `feedback_submitted` - User provides feedback

## 🔒 GDPR Compliance

### Consent Management

The system includes a comprehensive consent manager that:

1. **Default State**: All non-essential cookies are disabled by default
2. **Granular Control**: Users can enable/disable different cookie categories:
   - **Necessary**: Always enabled (required for functionality)
   - **Analytics**: Google Analytics tracking
   - **Marketing**: Facebook Pixel, LinkedIn Insight
   - **Functional**: Mixpanel, Clarity

3. **Consent Storage**: Preferences are saved in localStorage
4. **Easy Access**: Cookie settings link in footer for preference updates

### Implementation

```typescript
import { ConsentManager } from '@/app/components/analytics/ConsentManager'

function App() {
  const handleConsentChange = (consent) => {
    console.log('User consent updated:', consent)
    // Update analytics services based on consent
  }

  return (
    <ConsentManager
      onConsentChange={handleConsentChange}
      showBanner={true}
      position="bottom"
    />
  )
}
```

## 🐛 Development & Debugging

### Analytics Dashboard

A development-only dashboard (`AnalyticsDashboard.tsx`) provides:

1. **Service Status**: Shows which analytics services are active
2. **Event Log**: Real-time event tracking for debugging
3. **Test Events**: Fire test events to verify tracking

### Enable Debug Mode

```bash
# In development
NODE_ENV=development npm run dev

# Or enable manually
localStorage.setItem('analytics-debug', 'true')
```

### Console Debugging

Enable GA4 debug mode:
```env
NEXT_PUBLIC_GA_DEBUG=true
```

## 📊 Custom Events

### Adding New Events

1. **Define Event in `events.ts`**:
```typescript
export function trackCustomFeature(featureName: string, userData: any) {
  trackEvent({
    action: 'custom_feature_used',
    category: 'features',
    label: featureName,
    custom_parameters: userData
  })
}
```

2. **Add to Analytics Hook**:
```typescript
// In use-analytics.ts
const trackCustomFeature = useCallback((featureName: string) => {
  if (analyticsConfig.ga4Enabled) trackCustomFeatureGA(featureName)
  if (analyticsConfig.mixpanelEnabled) trackMixpanelEvent({
    event_name: 'Custom Feature Used',
    properties: { feature_name: featureName }
  })
}, [analyticsConfig])
```

## 🚀 Best Practices

### 1. Performance
- All tracking scripts load asynchronously
- Analytics doesn't block page render
- Consent manager loads after critical content

### 2. Privacy
- No PII tracked without explicit consent
- User data is hashed when required
- Clear privacy policy and cookie notice

### 3. Accuracy
- Track both client and server-side events when possible
- Use unique transaction IDs for e-commerce events
- Implement proper error handling

### 4. Maintenance
- Regular audit of tracked events
- Monitor for tracking errors in console
- Update tracking for new features

## 🔍 Analytics Reports

### Key Metrics to Monitor

1. **User Acquisition**
   - New user registrations by source
   - Google OAuth vs email signup conversion
   - Referral traffic analysis

2. **Feature Usage**
   - Analysis completion rates
   - Average analyses per user
   - API usage statistics

3. **Conversion Funnel**
   - Pricing page → Checkout → Subscription
   - Free trial → Paid conversion
   - Feature adoption rates

4. **User Experience**
   - Page load times and Core Web Vitals
   - Error rates and failed actions
   - Session recordings for UX insights

## 🔧 Troubleshooting

### Common Issues

1. **Events Not Tracking**
   - Check environment variables are set
   - Verify consent has been granted
   - Check browser console for errors

2. **GDPR Compliance Issues**
   - Ensure default consent is set to 'denied'
   - Verify consent banner appears on first visit
   - Test cookie preferences functionality

3. **Performance Impact**
   - Monitor Core Web Vitals in GA4
   - Use development dashboard to identify heavy tracking
   - Consider lazy loading non-critical tracking

### Debug Commands

```javascript
// Check GA4 status
console.log('GA4 Loaded:', typeof window.gtag !== 'undefined')

// Check Mixpanel status
console.log('Mixpanel Loaded:', typeof window.mixpanel !== 'undefined')

// View current consent state
console.log('Consent:', localStorage.getItem('truecheckia-consent'))

// Enable debug mode
localStorage.setItem('analytics-debug', 'true')
window.location.reload()
```

## 📚 Additional Resources

- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Facebook Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Mixpanel JavaScript SDK](https://developer.mixpanel.com/docs/javascript)
- [Microsoft Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [GDPR Compliance Guide](https://gdpr.eu/cookies/)

---

**Implementation Status**: ✅ Complete
**GDPR Compliant**: ✅ Yes
**Development Ready**: ✅ Yes
**Production Ready**: ✅ Yes

For questions or issues, refer to the development team or create an issue in the project repository.