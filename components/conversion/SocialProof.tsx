'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Users, CheckCircle, Star, Shield, Eye, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSocialProof } from '@/hooks/use-experiment';
import { analytics } from '@/lib/analytics/events';

interface SocialProofWidgetProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-center' | 'center-banner' | 'footer';
  className?: string;
}

interface SocialProofConfig {
  showSocialProof: boolean;
  type: string;
  position: string;
  messages?: string[];
  interval?: number;
  fadeTime?: number;
  counters?: {
    totalUsers: number;
    totalAnalyses: number;
    activeUsers: number;
  };
  updateInterval?: number;
  testimonials?: Array<{
    text: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
  }>;
  autoRotate?: boolean;
  rotateInterval?: number;
  badges?: Array<{
    name: string;
    icon: string;
  }>;
}

// Recent Activity Notification Component
function RecentActivityNotification({ config, trackView, trackClick }: { 
  config: SocialProofConfig; 
  trackView: (location: string) => void;
  trackClick: (location: string) => void;
}) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messages = config.messages || [];

  useEffect(() => {
    if (messages.length === 0) return;

    let messageIndex = 0;

    const showNextMessage = () => {
      setCurrentMessage(messages[messageIndex]);
      setIsVisible(true);
      trackView('notification');
      
      // Hide message after fadeTime
      fadeTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, config.fadeTime || 4000);
      
      messageIndex = (messageIndex + 1) % messages.length;
    };

    // Show first message immediately
    showNextMessage();
    
    // Set up interval for subsequent messages
    intervalRef.current = setInterval(showNextMessage, config.interval || 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [messages, config.interval, config.fadeTime, trackView]);

  if (!isVisible || !currentMessage) return null;

  const position = config.position === 'bottom-left' 
    ? 'bottom-4 left-4' 
    : 'bottom-4 right-4';

  return (
    <div 
      className={`fixed ${position} z-40 max-w-sm animate-in slide-in-from-bottom-4 duration-300`}
      onClick={() => trackClick('notification')}
    >
      <Card className="p-4 bg-white shadow-lg border cursor-pointer hover:shadow-xl transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">
              {currentMessage}
            </p>
          </div>
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
        </div>
      </Card>
    </div>
  );
}

// User Counter Component
function UserCounter({ config, trackView }: { 
  config: SocialProofConfig; 
  trackView: (location: string) => void;
}) {
  const [counters, setCounters] = useState(config.counters || {
    totalUsers: 25000,
    totalAnalyses: 150000,
    activeUsers: 1250
  });

  useEffect(() => {
    trackView('counter');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setCounters(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        totalAnalyses: prev.totalAnalyses + Math.floor(Math.random() * 10),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2
      }));
    }, config.updateInterval || 30000);

    return () => clearInterval(interval);
  }, [config.updateInterval, trackView]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <Card className="p-4 bg-white shadow-lg border">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {formatNumber(counters.totalUsers)}
            </span>
            <span className="text-gray-600">users</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-gray-900">
              {formatNumber(counters.totalAnalyses)}
            </span>
            <span className="text-gray-600">analyses</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-900">
              {formatNumber(counters.activeUsers)}
            </span>
            <span className="text-gray-600">online now</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Testimonials Carousel Component
function TestimonialsCarousel({ config, trackView, trackClick }: { 
  config: SocialProofConfig;
  trackView: (location: string) => void;
  trackClick: (location: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = config.testimonials || [];

  useEffect(() => {
    if (!config.autoRotate || testimonials.length <= 1) return;
    
    trackView('testimonial');
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, config.rotateInterval || 8000);

    return () => clearInterval(interval);
  }, [config.autoRotate, config.rotateInterval, testimonials.length, trackView]);

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="w-full py-8 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <Card 
          className="max-w-2xl mx-auto p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => trackClick('testimonial')}
        >
          <div className="text-center">
            {/* Stars */}
            <div className="flex justify-center mb-4">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            
            {/* Quote */}
            <blockquote className="text-lg text-gray-900 mb-4">
              &ldquo;{currentTestimonial.text}&rdquo;
            </blockquote>
            
            {/* Author */}
            <div className="flex items-center justify-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentTestimonial.avatar} />
                <AvatarFallback>
                  {currentTestimonial.author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  {currentTestimonial.author}
                </div>
                <div className="text-sm text-gray-600">
                  {currentTestimonial.role}
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Dots indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Trust Badges Component
function TrustBadges({ config, trackView }: { 
  config: SocialProofConfig;
  trackView: (location: string) => void;
}) {
  const badges = config.badges || [];

  useEffect(() => {
    trackView('badges');
  }, [trackView]);

  if (badges.length === 0) return null;

  return (
    <div className="w-full py-6 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {badge.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Additional trust indicators */}
        <div className="flex justify-center mt-4 space-x-8 text-xs text-gray-600">
          <span className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            99.9% Uptime
          </span>
          <span className="flex items-center">
            <Shield className="h-4 w-4 mr-1 text-blue-500" />
            Bank-level Security
          </span>
          <span className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
            Trusted by 25K+ Users
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Social Proof Widget
export function SocialProofWidget({ position, className }: SocialProofWidgetProps) {
  const { config, isInExperiment, trackView, trackClick } = useSocialProof();
  const socialProofConfig = config as SocialProofConfig;

  useEffect(() => {
    if (isInExperiment && socialProofConfig.showSocialProof) {
      analytics.track('social_proof_displayed', {
        type: socialProofConfig.type,
        position: position || socialProofConfig.position
      });
    }
  }, [isInExperiment, socialProofConfig, position]);

  if (!isInExperiment || !socialProofConfig.showSocialProof) {
    return null;
  }

  const renderWidget = () => {
    switch (socialProofConfig.type) {
      case 'recent-activity':
        return (
          <RecentActivityNotification
            config={socialProofConfig}
            trackView={trackView}
            trackClick={trackClick}
          />
        );
      
      case 'user-counter':
        return (
          <UserCounter
            config={socialProofConfig}
            trackView={trackView}
          />
        );
      
      case 'testimonials':
        return (
          <TestimonialsCarousel
            config={socialProofConfig}
            trackView={trackView}
            trackClick={trackClick}
          />
        );
      
      case 'trust-badges':
        return (
          <TrustBadges
            config={socialProofConfig}
            trackView={trackView}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderWidget()}
    </div>
  );
}

// Composite component that can show multiple social proof types
export function SocialProofManager({ enabledTypes }: { enabledTypes?: string[] }) {
  return (
    <>
      {(!enabledTypes || enabledTypes.includes('recent-activity')) && (
        <SocialProofWidget position="bottom-left" />
      )}
      {(!enabledTypes || enabledTypes.includes('user-counter')) && (
        <SocialProofWidget position="top-center" />
      )}
      {(!enabledTypes || enabledTypes.includes('testimonials')) && (
        <SocialProofWidget position="center-banner" />
      )}
      {(!enabledTypes || enabledTypes.includes('trust-badges')) && (
        <SocialProofWidget position="footer" />
      )}
    </>
  );
}

// Simple social proof indicators for inline use
export function InlineSocialProof() {
  return (
    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 py-4">
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4" />
        <span>25,000+ users</span>
      </div>
      <div className="flex items-center space-x-1">
        <Eye className="h-4 w-4" />
        <span>150K+ analyses</span>
      </div>
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
        <span>4.9/5 rating</span>
      </div>
    </div>
  );
}
