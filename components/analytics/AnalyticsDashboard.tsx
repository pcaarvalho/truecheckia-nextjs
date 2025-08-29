'use client'

/**
 * Analytics Dashboard Component
 * Shows analytics tracking status and events for development/debugging
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Activity, 
  Users, 
  TrendingUp, 
  Eye,
  MousePointer,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { 
  GA_MEASUREMENT_ID,
  trackEvent as trackGAEvent,
  setUserProperties as setGAUserProperties
} from '@/lib/analytics/gtag'
import { 
  CLARITY_PROJECT_ID,
  trackClarityEvent
} from '@/lib/analytics/clarity'
import { 
  FB_PIXEL_ID,
  trackFacebookEvent
} from '@/lib/analytics/facebook-pixel'
import { 
  LINKEDIN_PARTNER_ID,
  trackLinkedInConversion
} from '@/lib/analytics/linkedin-insight'
import { 
  MIXPANEL_TOKEN,
  trackMixpanelEvent
} from '@/lib/analytics/mixpanel'
import { useAnalytics } from '@/hooks/use-analytics'

interface AnalyticsService {
  name: string
  id: string
  status: 'active' | 'inactive' | 'error'
  enabled: boolean
  icon: React.ReactNode
  description: string
}

export function AnalyticsDashboard() {
  const [isVisible, setIsVisible] = useState(false)
  const [eventLog, setEventLog] = useState<Array<{
    timestamp: string
    service: string
    event: string
    data?: any
  }>>([])
  const analytics = useAnalytics()

  // Check which analytics services are configured
  const services: AnalyticsService[] = [
    {
      name: 'Google Analytics 4',
      id: GA_MEASUREMENT_ID,
      status: GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' ? 'active' : 'inactive',
      enabled: true,
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Website analytics and user behavior tracking'
    },
    {
      name: 'Microsoft Clarity',
      id: CLARITY_PROJECT_ID,
      status: CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== 'XXXXXXXXXX' ? 'active' : 'inactive',
      enabled: true,
      icon: <Eye className="h-4 w-4" />,
      description: 'Heatmaps and session recordings'
    },
    {
      name: 'Facebook Pixel',
      id: FB_PIXEL_ID,
      status: FB_PIXEL_ID && FB_PIXEL_ID !== 'XXXXXXXXXX' ? 'active' : 'inactive',
      enabled: true,
      icon: <Users className="h-4 w-4" />,
      description: 'Social media advertising and retargeting'
    },
    {
      name: 'LinkedIn Insight',
      id: LINKEDIN_PARTNER_ID,
      status: LINKEDIN_PARTNER_ID && LINKEDIN_PARTNER_ID !== 'XXXXXXXXXX' ? 'active' : 'inactive',
      enabled: true,
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'B2B marketing and lead generation'
    },
    {
      name: 'Mixpanel',
      id: MIXPANEL_TOKEN,
      status: MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'XXXXXXXXXX' ? 'active' : 'inactive',
      enabled: true,
      icon: <Activity className="h-4 w-4" />,
      description: 'Product analytics and user journey tracking'
    },
  ]

  const activeServices = services.filter(s => s.status === 'active')
  const totalServices = services.length

  // Test events for development
  const testEvents = [
    {
      name: 'Test Page View',
      action: () => {
        analytics.trackCustomEvent('test_page_view', {
          page: 'analytics_dashboard',
          user_type: 'developer'
        })
        logEvent('All Services', 'test_page_view', { test: true })
      }
    },
    {
      name: 'Test Analysis',
      action: () => {
        // analytics.trackAnalysis.completed({
        //   text_length: 500,
        //   detection_confidence: 85,
        //   ai_probability: 78,
        //   processing_time: 1500,
        //   credits_used: 1,
        //   analysis_type: 'text',
        //   user_plan: 'FREE'
        // })
        logEvent('All Services', 'test_analysis_completed', { test: true })
      }
    },
    {
      name: 'Test Subscription',
      action: () => {
        // analytics.trackSubscription.viewed('PRO')
        logEvent('All Services', 'subscription_viewed', { plan: 'PRO', test: true })
      }
    },
    {
      name: 'Test Feature Usage',
      action: () => {
        analytics.trackFeature('analytics_dashboard', { 
          feature_type: 'debug',
          user_role: 'developer'
        })
        logEvent('All Services', 'feature_used', { feature: 'analytics_dashboard', test: true })
      }
    }
  ]

  const logEvent = (service: string, event: string, data?: any) => {
    setEventLog(prev => [...prev.slice(-9), {
      timestamp: new Date().toLocaleTimeString(),
      service,
      event,
      data
    }])
  }

  // Show only in development or when explicitly enabled
  useEffect(() => {
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('analytics-debug') === 'true'
    setIsVisible(shouldShow)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-black/80 text-white border-gray-600 hover:bg-black/90"
        >
          <Activity className="h-4 w-4 mr-1" />
          Analytics
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
      <Card className="bg-black/90 text-white border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle className="text-lg">Analytics Debug</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/10"
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-gray-300">
            {activeServices.length}/{totalServices} services active
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
              <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
              <TabsTrigger value="test" className="text-xs">Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-2 max-h-60 overflow-y-auto">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center gap-2">
                    {service.icon}
                    <div>
                      <div className="text-sm font-medium">{service.name}</div>
                      <div className="text-xs text-gray-400 truncate" title={service.id}>
                        {service.id.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={service.status === 'active' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        service.status === 'active' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {service.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="events" className="space-y-2 max-h-60 overflow-y-auto">
              {eventLog.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">
                  No events logged yet
                </div>
              ) : (
                eventLog.reverse().map((event, index) => (
                  <div key={index} className="p-2 bg-gray-800/50 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-blue-400">{event.service}</span>
                      <span className="text-gray-400">{event.timestamp}</span>
                    </div>
                    <div className="text-white font-medium">{event.event}</div>
                    {event.data && (
                      <div className="text-gray-300 mt-1 truncate">
                        {JSON.stringify(event.data)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="test" className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">
                Test analytics events (development only)
              </div>
              {testEvents.map((test) => (
                <Button
                  key={test.name}
                  variant="outline"
                  size="sm"
                  onClick={test.action}
                  className="w-full text-xs bg-gray-800/50 text-white border-gray-600 hover:bg-gray-700/50"
                >
                  {test.name}
                </Button>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}