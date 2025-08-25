# TrueCheckIA Theme System

A comprehensive dark mode theme system built for TrueCheckIA with Next.js App Router, featuring smooth animations, accessibility, and modern design patterns.

## 🎨 Features

### Core Features
- **Light/Dark/System modes** - Automatic system preference detection
- **Smooth animations** - Framer Motion powered transitions
- **SSR compatible** - Proper hydration handling for Next.js
- **Accessibility first** - WCAG compliant with keyboard navigation
- **LocalStorage persistence** - User preferences saved across sessions
- **Mobile optimized** - Touch-friendly interactions and responsive design

### Design System Integration
- **Theme-aware shadows** - Adaptive shadow system for light/dark modes
- **Glass morphism effects** - Backdrop blur with theme adaptation
- **Gradient system** - Brand-consistent gradients that work in all themes
- **Typography scales** - Consistent text sizing and weights
- **Component variants** - Multiple toggle styles for different use cases

## 📁 File Structure

```
app/
├── providers/
│   └── theme-provider.tsx          # Custom theme provider with enhanced hooks
├── globals.css                     # Enhanced theme styles and transitions
└── theme-demo/
    └── page.tsx                    # Theme system showcase page

components/ui/
├── theme-toggle.tsx                # Main theme toggle components
└── separator.tsx                   # Supporting UI component

tailwind.config.ts                  # Enhanced with dark mode and custom utilities
```

## 🚀 Quick Start

### 1. Theme Provider Setup

The theme system is already integrated into the app. The provider is configured in `app/providers.tsx`:

```tsx
import { ThemeProvider } from './providers/theme-provider'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
```

### 2. Using Theme Toggles

Import and use the theme toggle components:

```tsx
import { ThemeToggle, ThemeStatusIndicator } from '@/components/ui/theme-toggle'

// Enhanced dropdown toggle (default)
<ThemeToggle />

// Simple button toggle
<ThemeToggle variant="button" />

// With label
<ThemeToggle variant="button" showLabel />

// Theme status indicator
<ThemeStatusIndicator />
```

### 3. Theme Hooks

Use the custom hooks for theme state management:

```tsx
import { useTheme, useThemeDetection } from '@/app/providers/theme-provider'

function MyComponent() {
  const { theme, isDark, toggleTheme, setLightTheme, setDarkTheme } = useTheme()
  const { mounted } = useThemeDetection()
  
  if (!mounted) return <div>Loading...</div>
  
  return (
    <div className={isDark ? 'dark-specific-class' : 'light-specific-class'}>
      Current theme: {theme}
    </div>
  )
}
```

## 🎯 Component Variants

### 1. Enhanced Dropdown Toggle
The default theme toggle with a beautiful dropdown menu:
- Animated gradient background that changes with theme
- Dropdown with Light/Dark/System options
- Smooth icon transitions with Framer Motion
- Active state indicators

### 2. Simple Button Toggle
Direct toggle between light and dark modes:
- One-click theme switching
- Animated background orb effect
- Hover glow effects
- Optional label display

### 3. Legacy Simple Toggle
Backward compatible version:
- Classic CSS-only animations
- Maintains existing functionality
- Lightweight implementation

### 4. Advanced Multi-Theme Toggle
Segmented control style:
- Multiple theme options in one control
- Smooth sliding active state
- Customizable theme presets
- Professional appearance

### 5. Theme Status Indicator
Small badge showing current theme:
- Compact design for status display
- Color-coded for different themes
- Scale-in animation on mount

## 🎨 Styling System

### CSS Custom Properties

The theme system uses CSS custom properties for consistent theming:

```css
:root {
  /* Light theme */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}

.dark {
  /* Dark theme */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... more variables */
}
```

### Theme-Aware Utilities

Custom Tailwind utilities for theme-aware styling:

```css
/* Theme-aware shadows */
.shadow-theme-light { /* Adaptive shadow */ }
.shadow-theme-medium { /* Adaptive shadow */ }
.shadow-theme-large { /* Adaptive shadow */ }

/* Glow effects */
.glow-primary { /* Theme-aware glow */ }
.glow-accent { /* Theme-aware glow */ }

/* Glass morphism */
.glass { /* Backdrop blur with theme adaptation */ }
.backdrop-blur-theme { /* Enhanced backdrop blur */ }
```

### Animation Classes

Pre-built animation classes for theme transitions:

```css
.theme-transition { /* Smooth color transitions */ }
.theme-transition-all { /* All property transitions */ }
.theme-transition-colors { /* Color-only transitions */ }
.theme-glow-light { /* Light theme glow animation */ }
.theme-glow-dark { /* Dark theme glow animation */ }
```

## 🔧 Configuration

### Tailwind Configuration

Enhanced `tailwind.config.ts` with:
- Dark mode class strategy
- Custom animations and keyframes
- Theme-aware color system
- Responsive design tokens
- Glass morphism utilities

### Theme Provider Options

Customize the theme provider:

```tsx
<ThemeProvider
  attribute="class"              // HTML attribute for theme
  defaultTheme="system"          // Default theme selection
  enableSystem                   // Enable system theme detection
  storageKey="truecheckia-theme" // LocalStorage key
  themes={['light', 'dark', 'system']} // Available themes
>
  {children}
</ThemeProvider>
```

## 📱 Mobile Optimization

### Touch Interactions
- Minimum 44px touch targets
- Haptic feedback ready
- Smooth gesture responses
- Safe area inset support

### Performance
- Optimized animations for mobile
- Reduced motion support
- Efficient re-renders
- Minimal bundle impact

## ♿ Accessibility

### WCAG Compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast support

### Implementation
```tsx
<Button
  aria-label="Toggle theme"
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <span className="sr-only">Toggle theme</span>
</Button>
```

## 🔄 State Management

### Theme State
- Current theme selection (light/dark/system)
- Resolved theme (actual applied theme)
- System theme detection
- Mount state for SSR compatibility

### Persistence
- LocalStorage integration
- Cross-tab synchronization
- Server-side rendering support
- Graceful fallbacks

## 🎬 Animations

### Framer Motion Integration
```tsx
const iconVariants = {
  initial: { scale: 0, rotate: -90 },
  animate: { scale: 1, rotate: 0 },
  exit: { scale: 0, rotate: 90 },
}

<motion.div
  variants={iconVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {themeIcon}
</motion.div>
```

### CSS Animations
- Smooth theme transitions
- Hover effects and interactions
- Loading state animations
- Gradient animations
- Glow pulse effects

## 📊 Demo Page

Visit `/theme-demo` to see the complete theme system in action:
- All component variants
- Visual examples
- Theme-aware effects
- Interactive demonstrations
- Technical documentation

## 🛠 Development

### Adding New Themes

1. Update the theme provider configuration
2. Add CSS custom properties for the new theme
3. Update component variants if needed
4. Test accessibility and animations

### Customizing Animations

1. Modify animation variants in components
2. Update CSS keyframes in globals.css
3. Adjust timing and easing functions
4. Test across different devices

### Performance Optimization

1. Use `useThemeDetection` hook to prevent hydration mismatches
2. Implement proper loading states
3. Optimize re-renders with React.memo where needed
4. Minimize animation complexity on lower-end devices

## 🐛 Troubleshooting

### Hydration Mismatches
- Always use `useThemeDetection` hook
- Implement proper loading states
- Check SSR/client-side rendering differences

### Animation Performance
- Reduce motion for accessibility
- Optimize for mobile devices
- Use hardware acceleration where appropriate

### Theme Persistence
- Check LocalStorage availability
- Handle private browsing modes
- Implement fallback mechanisms

## 📚 API Reference

### useTheme Hook
```tsx
const {
  theme,           // Current theme selection
  setTheme,        // Set theme function
  resolvedTheme,   // Actual applied theme
  systemTheme,     // System preference
  isDark,          // Boolean for dark mode
  isLight,         // Boolean for light mode
  isSystem,        // Boolean for system mode
  toggleTheme,     // Toggle between light/dark
  setLightTheme,   // Set to light mode
  setDarkTheme,    // Set to dark mode
  setSystemTheme,  // Set to system mode
} = useTheme()
```

### useThemeDetection Hook
```tsx
const {
  mounted,         // Boolean indicating if component is mounted
  theme,           // Safe theme value for SSR
} = useThemeDetection()
```

## 🎯 Best Practices

1. **Always handle SSR** - Use `useThemeDetection` for hydration safety
2. **Provide loading states** - Show appropriate fallbacks during mount
3. **Test accessibility** - Verify keyboard navigation and screen readers
4. **Optimize animations** - Consider reduced motion preferences
5. **Mobile first** - Design for touch interfaces
6. **Performance aware** - Monitor bundle size and render performance

## 🔄 Updates and Maintenance

The theme system is designed to be:
- **Extensible** - Easy to add new themes and variants
- **Maintainable** - Clean separation of concerns
- **Future-proof** - Built on stable technologies
- **Scalable** - Supports complex applications

For updates and improvements, focus on:
- User feedback and usability
- Performance optimizations
- Accessibility enhancements
- New animation patterns
- Mobile experience improvements