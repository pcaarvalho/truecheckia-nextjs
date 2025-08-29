/**
 * TrueCheckIA Design System
 * 
 * Centralized export of all design system components, tokens, and utilities.
 * This file serves as the main entry point for the design system.
 */

// Design Tokens
export * from './tokens'

// Theme Provider
export * from './theme-provider'

// UI Components
export * from '@/components/ui/button'
export * from '@/components/ui/card'
export * from '@/components/ui/input'

// Type definitions for better TypeScript support
export type { 
  DesignTokens,
} from './tokens'

export type {
  ButtonProps,
} from '@/components/ui/button'

// Card component types are not exported

// Input component types are not exported

// Design System Utilities
export const designSystem = {
  // Quick access to commonly used values
  colors: {
    primary: '#667eea',
    secondary: '#06b6d4',
    accent: '#d946ef',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const

// Brand Guidelines (for documentation)
export const brandGuidelines = {
  name: 'TrueCheckIA',
  description: 'AI-powered fact-checking platform with a focus on trust and accuracy',
  
  colorUsage: {
    primary: 'Primary brand color for main CTAs, links, and brand elements',
    secondary: 'Secondary actions, supporting elements, info states',
    accent: 'Highlight elements, special features, premium content',
    success: 'Positive feedback, successful operations, verified content',
    warning: 'Caution states, pending actions, attention needed',
    error: 'Error states, failed operations, critical issues',
    info: 'Information, tips, neutral notifications',
  },
  
  typographyGuidelines: {
    headings: 'Use semibold weight for all headings with tight tracking',
    body: 'Regular weight for body text with optimal line height',
    labels: 'Medium weight for form labels and UI text',
    captions: 'Small text for metadata and supplementary information',
  },
  
  spacingPrinciples: {
    component: 'Use 24px (lg) for component internal padding',
    layout: 'Use 32px (xl) for section spacing',
    element: 'Use 16px (md) for element spacing',
    tight: 'Use 8px (sm) for tight spacing',
  },
  
  animationPrinciples: {
    hover: 'Use 200ms for hover states',
    page: 'Use 300ms for page transitions',
    modal: 'Use 500ms for modal animations',
    easing: 'Use spring easing for playful interactions',
  },
} as const

// Component Usage Examples (for documentation)
export const componentExamples = {
  button: {
    primary: '<Button variant="default">Primary Action</Button>',
    secondary: '<Button variant="secondary">Secondary Action</Button>',
    outline: '<Button variant="outline">Outline Button</Button>',
    withIcon: '<Button leftIcon={<Icon />}>With Icon</Button>',
    loading: '<Button loading>Processing...</Button>',
    cosmic: '<Button variant="cosmic">Special Action</Button>',
  },
  
  card: {
    basic: '<Card><CardContent>Content</CardContent></Card>',
    withHeader: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>',
    stats: '<StatsCard title="Users" value="1,234" trend="up" />',
    feature: '<FeatureCard icon={<Icon />} title="Feature" description="Description" />',
    glass: '<Card variant="glass">Glass Effect</Card>',
  },
  
  input: {
    basic: '<Input placeholder="Enter text" />',
    withLabel: '<Input label="Email" type="email" />',
    withIcon: '<Input leftIcon={<Icon />} placeholder="Search" />',
    error: '<Input variant="error" message="Required field" />',
    password: '<PasswordInput placeholder="Password" />',
    search: '<SearchInput placeholder="Search..." />',
  },
} as const