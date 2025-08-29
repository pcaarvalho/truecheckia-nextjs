'use client'

/**
 * GDPR Consent Manager
 * Handles user consent for all tracking services
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  grantConsent as grantGAConsent, 
  denyConsent as denyGAConsent 
} from '@/lib/analytics/gtag'
import { 
  grantFacebookConsent, 
  revokeFacebookConsent 
} from '@/lib/analytics/facebook-pixel'
import { 
  grantLinkedInConsent, 
  revokeLinkedInConsent 
} from '@/lib/analytics/linkedin-insight'
import { 
  optInMixpanelTracking, 
  optOutMixpanelTracking 
} from '@/lib/analytics/mixpanel'
import { 
  startClarityWithConsent, 
  stopClarityTracking 
} from '@/lib/analytics/clarity'

interface ConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

interface ConsentManagerProps {
  onConsentChange?: (consent: ConsentSettings) => void
  showBanner?: boolean
  position?: 'bottom' | 'top'
}

const DEFAULT_CONSENT: ConsentSettings = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  functional: false,
}

export function ConsentManager({ 
  onConsentChange = () => {}, 
  showBanner = true,
  position = 'bottom' 
}: ConsentManagerProps) {
  const [consent, setConsent] = useState<ConsentSettings>(DEFAULT_CONSENT)
  const [showSettings, setShowSettings] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('truecheckia-consent')
    const hasConsented = localStorage.getItem('truecheckia-consent-given')
    
    if (savedConsent && hasConsented) {
      const parsedConsent = JSON.parse(savedConsent)
      setConsent(parsedConsent)
      setHasInteracted(true)
      onConsentChange(parsedConsent)
    }
  }, [onConsentChange])

  // Apply consent settings to all tracking services
  const applyConsent = useCallback((newConsent: ConsentSettings) => {
    // GA4 Consent
    if (newConsent.analytics) {
      grantGAConsent()
    } else {
      denyGAConsent()
    }

    // Marketing consent (Facebook, LinkedIn)
    if (newConsent.marketing) {
      grantFacebookConsent()
      grantLinkedInConsent()
    } else {
      revokeFacebookConsent()
      revokeLinkedInConsent()
    }

    // Functional consent (Mixpanel, Clarity)
    if (newConsent.functional) {
      optInMixpanelTracking()
      startClarityWithConsent()
    } else {
      optOutMixpanelTracking()
      stopClarityTracking()
    }

    // Save to localStorage
    localStorage.setItem('truecheckia-consent', JSON.stringify(newConsent))
    localStorage.setItem('truecheckia-consent-given', 'true')
    
    setConsent(newConsent)
    setHasInteracted(true)
    onConsentChange(newConsent)
  }, [onConsentChange])

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const allConsent: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    applyConsent(allConsent)
  }, [applyConsent])

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    applyConsent(DEFAULT_CONSENT)
  }, [applyConsent])

  // Save custom settings
  const saveSettings = useCallback(() => {
    applyConsent(consent)
    setShowSettings(false)
  }, [consent, applyConsent])

  // Update individual consent setting
  const updateConsent = useCallback((key: keyof ConsentSettings, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }))
  }, [])

  // Don't show banner if user has already interacted
  if (!showBanner || hasInteracted) {
    return null
  }

  return (
    <div className={`fixed left-0 right-0 z-50 p-4 ${position === 'bottom' ? 'bottom-0' : 'top-0'}`}>
      <Card className="mx-auto max-w-4xl bg-white dark:bg-gray-900 shadow-lg border">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  We use cookies to improve your experience
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We use cookies and similar technologies to analyze our website traffic, personalize content, 
                  and provide social media features. We also share information about your use of our site 
                  with our analytics and advertising partners.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="whitespace-nowrap"
                >
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                  className="whitespace-nowrap"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="whitespace-nowrap"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cookie Preferences</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Necessary Cookies</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Essential for the website to function properly. Cannot be disabled.
                  </div>
                </div>
                <Switch checked={true} disabled />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Analytics Cookies</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Help us understand how visitors interact with our website (Google Analytics).
                  </div>
                </div>
                <Switch
                  checked={consent.analytics}
                  onCheckedChange={(checked) => updateConsent('analytics', checked)}
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Marketing Cookies</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Used for advertising and retargeting (Facebook Pixel, LinkedIn Insight).
                  </div>
                </div>
                <Switch
                  checked={consent.marketing}
                  onCheckedChange={(checked) => updateConsent('marketing', checked)}
                />
              </div>

              {/* Functional Cookies */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Functional Cookies</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Enable enhanced functionality and personalization (Mixpanel, Clarity).
                  </div>
                </div>
                <Switch
                  checked={consent.functional}
                  onCheckedChange={(checked) => updateConsent('functional', checked)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                variant="outline"
                onClick={rejectAll}
                className="flex-1"
              >
                Reject All
              </Button>
              <Button
                onClick={saveSettings}
                className="flex-1"
              >
                Save Preferences
              </Button>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>
                You can change your preferences at any time by clicking the cookie settings 
                link in our footer. For more information, please read our{' '}
                <a href="/privacy-policy" className="underline hover:no-underline">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Cookie settings link component for footer
export function CookieSettingsLink() {
  const [showManager, setShowManager] = useState(false)

  const handleConsentChange = useCallback((consent: ConsentSettings) => {
    setShowManager(false)
  }, [])

  return (
    <>
      <button
        onClick={() => setShowManager(true)}
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline hover:no-underline"
      >
        Cookie Settings
      </button>

      {showManager && (
        <ConsentManager
          onConsentChange={handleConsentChange}
          showBanner={true}
        />
      )}
    </>
  )
}