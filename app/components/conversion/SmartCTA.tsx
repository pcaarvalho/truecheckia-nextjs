'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowRight, Zap, Shield, Clock, Users, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCTAExperiment } from '@/app/hooks/use-experiment';
import { useMobileDetect } from '@/app/hooks/use-mobile-detect';
import { analytics } from '@/app/lib/analytics/events';

interface SmartCTAProps {
  id: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  // Smart features
  sticky?: boolean;
  contextual?: boolean;
  progressive?: boolean;
  exitIntent?: boolean;
  scrollTrigger?: number; // Percentage of scroll before showing
  timeTrigger?: number; // Seconds before showing
  userType?: 'anonymous' | 'registered' | 'subscriber';
  location: string;
}

interface CTAConfig {
  buttonText: string;
  buttonColor: string;
  buttonSize: string;
  animation: string | boolean;
  icon?: string;
  urgencyIndicator?: boolean;
  subtext?: string;
}

// Progressive CTA that changes based on user behavior
function ProgressiveCTA({ 
  id, 
  config, 
  trackView, 
  trackClick, 
  location,
  onClick,
  href 
}: {
  id: string;
  config: CTAConfig;
  trackView: () => void;
  trackClick: () => void;
  location: string;
  onClick?: () => void;
  href?: string;
}) {
  const [stage, setStage] = useState<'initial' | 'engaged' | 'urgent'>('initial');
  const [viewTime, setViewTime] = useState(0);
  const viewStartRef = useRef<number | null>(null);

  useEffect(() => {
    trackView();
    viewStartRef.current = Date.now();
    
    const timer = setInterval(() => {
      if (viewStartRef.current) {
        const elapsed = (Date.now() - viewStartRef.current) / 1000;
        setViewTime(elapsed);
        
        // Progress through stages based on engagement
        if (elapsed > 10 && stage === 'initial') {
          setStage('engaged');
        } else if (elapsed > 30 && stage === 'engaged') {
          setStage('urgent');
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (viewStartRef.current) {
        analytics.track('cta_view_duration', {
          ctaId: id,
          location,
          viewDuration: (Date.now() - viewStartRef.current) / 1000
        });
      }
    };
  }, [id, location, trackView, stage]);

  const getStageConfig = () => {
    switch (stage) {
      case 'initial':
        return {
          text: config.buttonText,
          className: 'bg-blue-600 hover:bg-blue-700',
          icon: <ArrowRight className="h-4 w-4 ml-2" />,
          urgency: false
        };
      case 'engaged':
        return {
          text: 'Get Started Free - No Credit Card',
          className: 'bg-green-600 hover:bg-green-700',
          icon: <Shield className="h-4 w-4 ml-2" />,
          urgency: false
        };
      case 'urgent':
        return {
          text: 'Join 25K+ Users - Start Now!',
          className: 'bg-red-600 hover:bg-red-700 animate-pulse',
          icon: <Zap className="h-4 w-4 ml-2" />,
          urgency: true
        };
      default:
        return {
          text: config.buttonText,
          className: 'bg-blue-600 hover:bg-blue-700',
          icon: <ArrowRight className="h-4 w-4 ml-2" />,
          urgency: false
        };
    }
  };

  const stageConfig = getStageConfig();

  const handleClick = () => {
    trackClick();
    analytics.track('progressive_cta_clicked', {
      ctaId: id,
      stage,
      viewTime,
      location
    });
    onClick?.();
  };

  const ButtonComponent = href ? 'a' : 'button';
  
  return (
    <ButtonComponent
      href={href}
      onClick={handleClick}
      className={`inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ${stageConfig.className}`}
    >
      {stageConfig.text}
      {stageConfig.icon}
      {stageConfig.urgency && (
        <Badge className="ml-2 bg-yellow-400 text-black animate-bounce">
          <Clock className="h-3 w-3 mr-1" />
          Limited Time
        </Badge>
      )}
    </ButtonComponent>
  );
}

// Sticky CTA that follows user scroll
function StickyCTA({
  id,
  config,
  trackView,
  trackClick,
  location,
  onClick,
  href,
  scrollTrigger = 50
}: {
  id: string;
  config: CTAConfig;
  trackView: () => void;
  trackClick: () => void;
  location: string;
  onClick?: () => void;
  href?: string;
  scrollTrigger?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { isMobile } = useMobileDetect();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > scrollTrigger);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollTrigger]);

  useEffect(() => {
    if (isVisible) {
      trackView();
    }
  }, [isVisible, trackView]);

  const handleClick = () => {
    trackClick();
    analytics.track('sticky_cta_clicked', {
      ctaId: id,
      location,
      isMinimized
    });
    onClick?.();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    analytics.track('sticky_cta_minimized', {
      ctaId: id,
      minimized: !isMinimized
    });
  };

  if (!isVisible) return null;

  const ButtonComponent = href ? 'a' : 'button';

  return (
    <div 
      className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-6 right-6'} z-50 transition-all duration-300 ${isMinimized ? 'scale-75' : 'scale-100'}`}
    >
      <Card className="p-4 shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${isMinimized ? 'hidden' : 'block'}`}>
            <h4 className="font-semibold text-sm mb-1">
              Ready to detect AI content?
            </h4>
            <p className="text-xs text-white/80">
              Join thousands of professionals using TrueCheckIA
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <ButtonComponent
                href={href}
                onClick={handleClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                {config.buttonText}
              </ButtonComponent>
            )}
            
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {isMinimized && (
          <ButtonComponent
            href={href}
            onClick={handleClick}
            className="w-full bg-white text-blue-600 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm mt-2"
          >
            Start Free Trial
          </ButtonComponent>
        )}
      </Card>
    </div>
  );
}

// Floating Action Button
function FloatingActionButton({
  id,
  config,
  trackView,
  trackClick,
  location,
  onClick,
  href
}: {
  id: string;
  config: CTAConfig;
  trackView: () => void;
  trackClick: () => void;
  location: string;
  onClick?: () => void;
  href?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useMobileDetect();

  useEffect(() => {
    // Show FAB after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      trackView();
    }, 5000);

    return () => clearTimeout(timer);
  }, [trackView]);

  const handleClick = () => {
    trackClick();
    analytics.track('fab_clicked', {
      ctaId: id,
      location
    });
    onClick?.();
  };

  if (!isVisible) return null;

  const ButtonComponent = href ? 'a' : 'button';

  return (
    <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'} z-50`}>
      <ButtonComponent
        href={href}
        onClick={handleClick}
        className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Zap className="h-6 w-6" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            {config.buttonText}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75"></div>
      </ButtonComponent>
    </div>
  );
}

// Contextual CTA that adapts to page content
function ContextualCTA({
  id,
  config,
  trackView,
  trackClick,
  location,
  onClick,
  href,
  userType = 'anonymous'
}: {
  id: string;
  config: CTAConfig;
  trackView: () => void;
  trackClick: () => void;
  location: string;
  onClick?: () => void;
  href?: string;
  userType?: string;
}) {
  const [contextualText, setContextualText] = useState(config.buttonText);
  const [contextualIcon, setContextualIcon] = useState(<ArrowRight className="h-4 w-4 ml-2" />);

  useEffect(() => {
    trackView();
    
    // Adapt based on page location
    switch (location) {
      case 'pricing':
        setContextualText('Start Your Free Trial');
        setContextualIcon(<Shield className="h-4 w-4 ml-2" />);
        break;
      case 'features':
        setContextualText('See It In Action');
        setContextualIcon(<Zap className="h-4 w-4 ml-2" />);
        break;
      case 'about':
        setContextualText('Join Our Community');
        setContextualIcon(<Users className="h-4 w-4 ml-2" />);
        break;
      case 'blog':
        setContextualText('Try TrueCheckIA Free');
        setContextualIcon(<ArrowRight className="h-4 w-4 ml-2" />);
        break;
      default:
        // Keep default
        break;
    }
    
    // Adapt based on user type
    if (userType === 'registered') {
      setContextualText('Upgrade to PRO');
    } else if (userType === 'subscriber') {
      setContextualText('Go to Dashboard');
    }
  }, [location, userType, config.buttonText, trackView]);

  const handleClick = () => {
    trackClick();
    analytics.track('contextual_cta_clicked', {
      ctaId: id,
      location,
      userType,
      contextualText
    });
    onClick?.();
  };

  const ButtonComponent = href ? 'a' : 'button';
  
  return (
    <div className="inline-block">
      <ButtonComponent
        href={href}
        onClick={handleClick}
        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
          config.animation === 'glow' 
            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25' 
            : config.animation === 'pulse'
            ? 'bg-blue-600 hover:bg-blue-700 animate-pulse'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        style={{ backgroundColor: config.buttonColor }}
      >
        {contextualText}
        {contextualIcon}
        {config.urgencyIndicator && (
          <Badge className="ml-2 bg-red-500 text-white animate-bounce">
            Limited!
          </Badge>
        )}
      </ButtonComponent>
      
      {config.subtext && (
        <p className="text-xs text-gray-600 mt-1 text-center">
          {config.subtext}
        </p>
      )}
    </div>
  );
}

// Main Smart CTA Component
export function SmartCTA({
  id,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  children,
  sticky = false,
  contextual = false,
  progressive = false,
  exitIntent = false,
  scrollTrigger = 50,
  timeTrigger,
  userType = 'anonymous',
  location
}: SmartCTAProps) {
  const { config, trackView, trackClick, buttonConfig } = useCTAExperiment(id);
  const ctaConfig = buttonConfig as CTAConfig;
  
  const [shouldShow, setShouldShow] = useState(!timeTrigger);
  
  // Handle time-based trigger
  useEffect(() => {
    if (timeTrigger) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, timeTrigger * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeTrigger]);

  if (!shouldShow) return null;

  // Determine which CTA variant to render
  const renderCTA = () => {
    if (sticky) {
      return (
        <StickyCTA
          id={id}
          config={ctaConfig}
          trackView={trackView}
          trackClick={trackClick}
          location={location}
          onClick={onClick}
          href={href}
          scrollTrigger={scrollTrigger}
        />
      );
    }
    
    if (progressive) {
      return (
        <ProgressiveCTA
          id={id}
          config={ctaConfig}
          trackView={trackView}
          trackClick={trackClick}
          location={location}
          onClick={onClick}
          href={href}
        />
      );
    }
    
    if (contextual) {
      return (
        <ContextualCTA
          id={id}
          config={ctaConfig}
          trackView={trackView}
          trackClick={trackClick}
          location={location}
          onClick={onClick}
          href={href}
          userType={userType}
        />
      );
    }
    
    // Default CTA
    const ButtonComponent = href ? 'a' : 'button';
    
    return (
      <ButtonComponent
        href={href}
        onClick={() => {
          trackClick();
          onClick?.();
        }}
        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      >
        {children || ctaConfig.buttonText || 'Get Started'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </ButtonComponent>
    );
  };

  return renderCTA();
}

// CTA Manager for multiple CTAs on a page
export function CTAManager({ ctas }: { ctas: SmartCTAProps[] }) {
  return (
    <>
      {ctas.map((cta, index) => (
        <SmartCTA key={`${cta.id}-${index}`} {...cta} />
      ))}
    </>
  );
}

// Floating Action Button component
export function SmartFAB({ id, onClick, href, location }: {
  id: string;
  onClick?: () => void;
  href?: string;
  location: string;
}) {
  const { config, trackView, trackClick, buttonConfig } = useCTAExperiment(id);
  const ctaConfig = buttonConfig as CTAConfig;
  
  return (
    <FloatingActionButton
      id={id}
      config={ctaConfig}
      trackView={trackView}
      trackClick={trackClick}
      location={location}
      onClick={onClick}
      href={href}
    />
  );
}
