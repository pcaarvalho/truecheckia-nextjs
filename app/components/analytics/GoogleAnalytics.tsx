'use client'

/**
 * Google Analytics 4 Component
 * Handles GA4 initialization with GDPR compliance
 */

import Script from 'next/script'
import { useEffect } from 'react'
import { initGA, setDefaultConsent, GA_MEASUREMENT_ID } from '@/lib/analytics/gtag'

interface GoogleAnalyticsProps {
  consent?: boolean
}

export function GoogleAnalytics({ consent = false }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Set default consent state
    setDefaultConsent(consent)
    
    // Initialize GA when consent is granted
    if (consent) {
      initGA()
    }
  }, [consent])

  // Don't render in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_GA_DEBUG) {
    return null
  }

  // Don't render if no measurement ID is provided
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      {/* Google Tag Manager / GA4 */}
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Set default consent state
            gtag('consent', 'default', {
              'analytics_storage': '${consent ? 'granted' : 'denied'}',
              'ad_storage': '${consent ? 'granted' : 'denied'}',
              'ad_user_data': '${consent ? 'granted' : 'denied'}',
              'ad_personalization': '${consent ? 'granted' : 'denied'}',
              'wait_for_update': 2000,
            });
            
            // Configure GA4
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              anonymize_ip: true,
              cookie_flags: 'secure;samesite=strict',
              cookie_expires: 63072000,
              send_page_view: false,
              debug_mode: ${process.env.NODE_ENV === 'development' ? 'true' : 'false'},
            });
            
            // Set custom dimensions for TrueCheckIA
            gtag('config', '${GA_MEASUREMENT_ID}', {
              custom_map: {
                'user_plan': 'custom_dimension_1',
                'user_role': 'custom_dimension_2',
                'signup_method': 'custom_dimension_3',
                'analysis_count': 'custom_dimension_4',
                'credits_remaining': 'custom_dimension_5',
              }
            });
          `,
        }}
      />
    </>
  )
}