/**
 * Variant Management System
 * Defines all experiment variants for TrueCheckIA conversion optimization
 */

import { Experiment, Variant, createExperiment, createVariant } from './ab-test';

// Exit Intent Popup Variants
export const exitIntentExperiment = createExperiment({
  name: 'Exit Intent Popup',
  description: 'Test different exit intent popup strategies to capture abandoning users',
  status: 'running',
  variants: [
    createVariant({
      name: 'Control - No Popup',
      description: 'No exit intent popup shown',
      weight: 25,
      isControl: true,
      config: {
        showPopup: false
      }
    }),
    createVariant({
      name: 'Free Credits Offer',
      description: 'Popup offering 10 free credits',
      weight: 25,
      isControl: false,
      config: {
        showPopup: true,
        popupType: 'free-credits',
        headline: 'Wait! Get 10 Free AI Detections',
        subheadline: 'Don\'t miss out on accurate AI content detection',
        ctaText: 'Claim Free Credits',
        offerDetails: '10 free AI detections + email tips',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff'
      }
    }),
    createVariant({
      name: 'Discount Offer',
      description: 'Popup offering 50% discount',
      weight: 25,
      isControl: false,
      config: {
        showPopup: true,
        popupType: 'discount',
        headline: '50% Off Your First Month!',
        subheadline: 'Limited time offer for new users',
        ctaText: 'Get 50% Discount',
        offerDetails: 'Use code SAVE50 at checkout',
        backgroundColor: '#ef4444',
        textColor: '#ffffff',
        urgency: true,
        countdown: 300 // 5 minutes
      }
    }),
    createVariant({
      name: 'Email Course',
      description: 'Popup offering free AI detection course',
      weight: 25,
      isControl: false,
      config: {
        showPopup: true,
        popupType: 'email-course',
        headline: 'Free 5-Day AI Detection Mastery Course',
        subheadline: 'Learn to spot AI content like a pro',
        ctaText: 'Start Free Course',
        offerDetails: 'Daily email lessons + expert tips',
        backgroundColor: '#10b981',
        textColor: '#ffffff'
      }
    })
  ],
  trafficAllocation: 80, // 80% of users
  startDate: new Date(),
  targetMetric: 'email_signup',
  hypothesis: 'Exit intent popups with valuable offers will capture 15-25% of abandoning users',
  minimumSampleSize: 1000,
  confidenceLevel: 0.95,
  conditions: [
    {
      type: 'url',
      operator: 'contains',
      value: 'truecheckia.com'
    }
  ]
});

// Social Proof Variants
export const socialProofExperiment = createExperiment({
  name: 'Social Proof Widget',
  description: 'Test different social proof strategies to build trust',
  status: 'running',
  variants: [
    createVariant({
      name: 'Control - No Social Proof',
      description: 'No social proof elements shown',
      weight: 20,
      isControl: true,
      config: {
        showSocialProof: false
      }
    }),
    createVariant({
      name: 'Recent Activity',
      description: 'Show recent user activity notifications',
      weight: 20,
      isControl: false,
      config: {
        showSocialProof: true,
        type: 'recent-activity',
        position: 'bottom-left',
        messages: [
          'Sarah from New York just analyzed content',
          'Mike from London detected AI-generated text',
          'Lisa from Toronto signed up for PRO plan'
        ],
        interval: 15000, // 15 seconds
        fadeTime: 4000
      }
    }),
    createVariant({
      name: 'User Counter',
      description: 'Show total users and analyses count',
      weight: 20,
      isControl: false,
      config: {
        showSocialProof: true,
        type: 'user-counter',
        position: 'top-center',
        counters: {
          totalUsers: 25000,
          totalAnalyses: 150000,
          activeUsers: 1250
        },
        updateInterval: 30000
      }
    }),
    createVariant({
      name: 'Testimonials Carousel',
      description: 'Rotating customer testimonials',
      weight: 20,
      isControl: false,
      config: {
        showSocialProof: true,
        type: 'testimonials',
        position: 'center-banner',
        testimonials: [
          {
            text: 'TrueCheckIA saved me hours of manual review',
            author: 'David Chen',
            role: 'Content Manager',
            avatar: '/avatars/david.jpg',
            rating: 5
          },
          {
            text: 'The accuracy is incredible - 99% detection rate',
            author: 'Sarah Wilson',
            role: 'Editor',
            avatar: '/avatars/sarah.jpg',
            rating: 5
          }
        ],
        autoRotate: true,
        rotateInterval: 8000
      }
    }),
    createVariant({
      name: 'Trust Badges',
      description: 'Security and compliance badges',
      weight: 20,
      isControl: false,
      config: {
        showSocialProof: true,
        type: 'trust-badges',
        position: 'footer',
        badges: [
          { name: 'SSL Secured', icon: '/badges/ssl.svg' },
          { name: 'GDPR Compliant', icon: '/badges/gdpr.svg' },
          { name: '99.9% Uptime', icon: '/badges/uptime.svg' }
        ]
      }
    })
  ],
  trafficAllocation: 100,
  startDate: new Date(),
  targetMetric: 'signup_rate',
  hypothesis: 'Social proof elements will increase trust and conversion rates by 10-20%',
  minimumSampleSize: 2000,
  confidenceLevel: 0.95
});

// CTA Button Variants
export const ctaButtonExperiment = createExperiment({
  name: 'CTA Button Optimization',
  description: 'Test different CTA button designs and copy',
  status: 'running',
  variants: [
    createVariant({
      name: 'Control - Standard Button',
      description: 'Current button design',
      weight: 25,
      isControl: true,
      config: {
        buttonText: 'Start Free Trial',
        buttonColor: '#3b82f6',
        buttonSize: 'medium',
        animation: false
      }
    }),
    createVariant({
      name: 'Urgency Copy',
      description: 'Button with urgency messaging',
      weight: 25,
      isControl: false,
      config: {
        buttonText: 'Get Instant Access Now',
        buttonColor: '#ef4444',
        buttonSize: 'large',
        animation: 'pulse',
        urgencyIndicator: true
      }
    }),
    createVariant({
      name: 'Benefit-Focused',
      description: 'Button highlighting key benefit',
      weight: 25,
      isControl: false,
      config: {
        buttonText: 'Detect AI Content in Seconds',
        buttonColor: '#10b981',
        buttonSize: 'large',
        animation: 'glow',
        icon: 'zap'
      }
    }),
    createVariant({
      name: 'Risk-Free Copy',
      description: 'Button emphasizing no risk',
      weight: 25,
      isControl: false,
      config: {
        buttonText: 'Try Free - No Credit Card',
        buttonColor: '#8b5cf6',
        buttonSize: 'medium',
        animation: false,
        subtext: '100% Free Forever Plan'
      }
    })
  ],
  trafficAllocation: 75,
  startDate: new Date(),
  targetMetric: 'cta_click_rate',
  hypothesis: 'Action-oriented and benefit-focused CTAs will increase click rates by 15-30%',
  minimumSampleSize: 1500,
  confidenceLevel: 0.95
});

// Pricing Page Variants
export const pricingPageExperiment = createExperiment({
  name: 'Pricing Page Optimization',
  description: 'Test different pricing page layouts and strategies',
  status: 'running',
  variants: [
    createVariant({
      name: 'Control - 3 Tier Pricing',
      description: 'Current 3-tier pricing layout',
      weight: 33,
      isControl: true,
      config: {
        layout: '3-tier',
        highlightPlan: 'pro',
        showAnnualDiscount: true,
        testimonials: false
      }
    }),
    createVariant({
      name: 'Simplified 2-Tier',
      description: 'Simplified pricing with only 2 options',
      weight: 33,
      isControl: false,
      config: {
        layout: '2-tier',
        highlightPlan: 'pro',
        showAnnualDiscount: true,
        testimonials: true,
        comparisonTable: true
      }
    }),
    createVariant({
      name: 'Value-First Presentation',
      description: 'Lead with value proposition before pricing',
      weight: 34,
      isControl: false,
      config: {
        layout: '3-tier',
        highlightPlan: 'pro',
        showAnnualDiscount: true,
        valuePropsFirst: true,
        socialProof: true,
        moneyBackGuarantee: true,
        faq: true
      }
    })
  ],
  trafficAllocation: 90,
  startDate: new Date(),
  targetMetric: 'subscription_conversion',
  hypothesis: 'Simplified pricing with strong value props will increase conversions by 20%',
  minimumSampleSize: 800,
  confidenceLevel: 0.95,
  conditions: [
    {
      type: 'url',
      operator: 'contains',
      value: '/pricing'
    }
  ]
});

// Onboarding Flow Variants
export const onboardingExperiment = createExperiment({
  name: 'User Onboarding Optimization',
  description: 'Test different onboarding flows to improve activation',
  status: 'running',
  variants: [
    createVariant({
      name: 'Control - Direct Dashboard',
      description: 'Users go directly to dashboard after signup',
      weight: 25,
      isControl: true,
      config: {
        skipOnboarding: true,
        welcomeModal: false
      }
    }),
    createVariant({
      name: 'Quick Setup Wizard',
      description: '3-step setup wizard',
      weight: 25,
      isControl: false,
      config: {
        onboardingType: 'wizard',
        steps: 3,
        includeDemo: true,
        personalizeContent: true
      }
    }),
    createVariant({
      name: 'Interactive Tutorial',
      description: 'Guided tutorial with sample analysis',
      weight: 25,
      isControl: false,
      config: {
        onboardingType: 'tutorial',
        sampleContent: true,
        progressIndicator: true,
        achievementBadges: true
      }
    }),
    createVariant({
      name: 'Video Walkthrough',
      description: 'Short video introduction',
      weight: 25,
      isControl: false,
      config: {
        onboardingType: 'video',
        videoLength: 90, // seconds
        skipOption: true,
        followUpChecklist: true
      }
    })
  ],
  trafficAllocation: 100,
  startDate: new Date(),
  targetMetric: 'user_activation',
  hypothesis: 'Guided onboarding will increase activation rate from 60% to 80%',
  minimumSampleSize: 1000,
  confidenceLevel: 0.95
});

// Export all experiments
export const allExperiments = [
  exitIntentExperiment,
  socialProofExperiment,
  ctaButtonExperiment,
  pricingPageExperiment,
  onboardingExperiment
];

// Utility function to get variant config
export const getVariantConfig = (experimentId: string, variantId: string): Record<string, any> => {
  const experiment = allExperiments.find(exp => exp.id === experimentId);
  const variant = experiment?.variants.find(v => v.id === variantId);
  return variant?.config || {};
};

// Helper to get experiment by name
export const getExperimentByName = (name: string): Experiment | undefined => {
  return allExperiments.find(exp => exp.name === name);
};
