'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Zap, Clock, Gift, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useExitIntentPopup } from '@/hooks/use-experiment';
import { useMobileDetect } from '@/hooks/use-mobile-detect';
import { analytics } from '@/lib/analytics/events';

interface ExitIntentPopupProps {
  onEmailCapture?: (email: string) => void;
  onClose?: () => void;
}

interface PopupConfig {
  showPopup: boolean;
  popupType: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  offerDetails: string;
  backgroundColor: string;
  textColor: string;
  urgency?: boolean;
  countdown?: number;
}

export function ExitIntentPopup({ onEmailCapture, onClose }: ExitIntentPopupProps) {
  const { config, isInExperiment, showPopup, trackConversion } = useExitIntentPopup();
  const { isMobile } = useMobileDetect();
  
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const exitAttemptRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popupConfig = config as PopupConfig;

  // Check if popup should be shown based on cookie
  const shouldShowPopup = useCallback(() => {
    if (!isInExperiment || !popupConfig.showPopup || hasBeenShown) return false;
    
    // Check cookie to prevent showing too frequently
    const lastShown = localStorage.getItem('truecheckia_exit_popup_shown');
    if (lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < 7) return false; // Don't show more than once per week
    }
    
    return true;
  }, [isInExperiment, popupConfig?.showPopup, hasBeenShown]);

  // Exit intent detection for desktop
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (isMobile || !shouldShowPopup() || exitAttemptRef.current) return;
    
    // Check if mouse is leaving from the top of the page
    if (e.clientY <= 0) {
      exitAttemptRef.current = true;
      if (showPopup('exit_intent')) {
        setIsVisible(true);
        setHasBeenShown(true);
        localStorage.setItem('truecheckia_exit_popup_shown', Date.now().toString());
        
        if (popupConfig.countdown) {
          setCountdown(popupConfig.countdown);
        }
      }
    }
  }, [isMobile, shouldShowPopup, showPopup, popupConfig]);

  // Scroll-based trigger for mobile
  const handleScroll = useCallback(() => {
    if (!isMobile || !shouldShowPopup()) return;
    
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    setScrollPosition(scrollPercent);
    
    // Trigger at 70% scroll on mobile
    if (scrollPercent > 70 && !exitAttemptRef.current) {
      exitAttemptRef.current = true;
      if (showPopup('scroll_based')) {
        setIsVisible(true);
        setHasBeenShown(true);
        localStorage.setItem('truecheckia_exit_popup_shown', Date.now().toString());
        
        if (popupConfig.countdown) {
          setCountdown(popupConfig.countdown);
        }
      }
    }
  }, [isMobile, shouldShowPopup, showPopup, popupConfig]);

  // Time-based trigger as fallback
  useEffect(() => {
    if (!shouldShowPopup()) return;
    
    const timeBasedTimer = setTimeout(() => {
      if (!exitAttemptRef.current) {
        exitAttemptRef.current = true;
        if (showPopup('time_based')) {
          setIsVisible(true);
          setHasBeenShown(true);
          localStorage.setItem('truecheckia_exit_popup_shown', Date.now().toString());
          
          if (popupConfig.countdown) {
            setCountdown(popupConfig.countdown);
          }
        }
      }
    }, 45000); // 45 seconds

    return () => clearTimeout(timeBasedTimer);
  }, [shouldShowPopup, showPopup, popupConfig]);

  // Setup event listeners
  useEffect(() => {
    if (!isInExperiment || !popupConfig.showPopup) return;
    
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseLeave, handleScroll, isInExperiment, popupConfig?.showPopup]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Track conversion
      trackConversion('email_signup');
      analytics.track('exit_intent_email_capture', {
        email,
        popupType: popupConfig.popupType,
        source: 'exit_intent'
      });
      
      // Call parent callback
      onEmailCapture?.(email);
      
      // Close popup after success
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to capture email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    trackConversion('close');
    setIsVisible(false);
    onClose?.();
  };

  const handleCTAClick = () => {
    trackConversion('cta_click');
    analytics.track('exit_intent_cta_click', {
      popupType: popupConfig.popupType,
      ctaText: popupConfig.ctaText
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIcon = () => {
    switch (popupConfig.popupType) {
      case 'free-credits':
        return <Zap className="h-8 w-8" />;
      case 'discount':
        return <Gift className="h-8 w-8" />;
      case 'email-course':
        return <BookOpen className="h-8 w-8" />;
      default:
        return <Zap className="h-8 w-8" />;
    }
  };

  if (!isInExperiment || !popupConfig.showPopup || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300">
        {/* Popup Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Card 
            className="relative w-full max-w-md mx-auto transform transition-all duration-300 scale-100"
            style={{
              backgroundColor: popupConfig.backgroundColor,
              color: popupConfig.textColor
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close popup"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-4 text-white">
                {getIcon()}
              </div>

              {/* Headline */}
              <h2 className="text-2xl font-bold text-center mb-2 text-white">
                {popupConfig.headline}
              </h2>

              {/* Subheadline */}
              <p className="text-center mb-4 text-white/90">
                {popupConfig.subheadline}
              </p>

              {/* Countdown Timer */}
              {popupConfig.urgency && countdown > 0 && (
                <div className="flex items-center justify-center mb-4 text-white">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-mono text-lg font-bold">
                    {formatTime(countdown)}
                  </span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-gray-900"
                  required
                />
                
                <Button
                  type="submit"
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                  disabled={isSubmitting}
                  onClick={handleCTAClick}
                >
                  {isSubmitting ? 'Please wait...' : popupConfig.ctaText}
                </Button>
              </form>

              {/* Offer Details */}
              <p className="text-center text-sm mt-4 text-white/80">
                {popupConfig.offerDetails}
              </p>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center mt-6 space-x-4 text-xs text-white/70">
                <span>🔒 No spam, ever</span>
                <span>✉️ Unsubscribe anytime</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Hook to easily integrate with any page
export function useExitIntentManager() {
  const [showPopup, setShowPopup] = useState(false);
  
  const handleEmailCapture = useCallback((email: string) => {
    // Handle email capture logic here
    console.log('Email captured:', email);
  }, []);

  const handleClose = useCallback(() => {
    setShowPopup(false);
  }, []);

  return {
    PopupComponent: () => (
      <ExitIntentPopup 
        onEmailCapture={handleEmailCapture}
        onClose={handleClose}
      />
    ),
    showPopup,
    setShowPopup
  };
}
