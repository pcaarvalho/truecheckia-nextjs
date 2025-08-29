'use client'

// Simplified analytics hook for build purposes
export function useAnalytics() {
  return {
    identifyUser: () => {},
    trackAnalysis: {
      started: () => {},
      completed: () => {},
      failed: () => {}
    },
    trackAuth: {
      signupStarted: () => {},
      signupCompleted: () => {},
      loginCompleted: () => {}
    },
    trackSubscription: {
      viewed: (plan: any) => {},
      started: () => {},
      initiated: (params: any) => {},
      completed: () => {}
    },
    trackFeature: (featureName: string, properties?: any) => {},
    trackCTA: (text: string, location: string) => {},
    trackError: () => {},
    trackSupport: () => {},
    trackCredits: {
      lowWarning: () => {},
      apiKeyGenerated: () => {}
    },
    trackCustomEvent: (eventName: string, properties?: any) => {}
  }
}

export default useAnalytics