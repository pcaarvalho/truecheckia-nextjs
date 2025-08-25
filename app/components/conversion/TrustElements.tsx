'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Lock, Award, Users, CheckCircle, Star, TrendingUp, Clock, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { analytics } from '@/app/lib/analytics/events';

interface TrustElementsProps {
  variant?: 'badges' | 'testimonials' | 'stats' | 'guarantees' | 'certifications' | 'all';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showAnimations?: boolean;
  className?: string;
}

// Security and Compliance Badges
function SecurityBadges({ showAnimations = true }: { showAnimations?: boolean }) {
  const badges = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'SSL Secured',
      description: '256-bit encryption',
      color: 'text-green-600'
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'GDPR Compliant',
      description: 'Data protection',
      color: 'text-blue-600'
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: 'ISO 27001',
      description: 'Security certified',
      color: 'text-purple-600'
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: '99.9% Uptime',
      description: 'Reliable service',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className={`flex flex-col items-center p-4 bg-gray-50 rounded-lg border ${
            showAnimations ? 'hover:shadow-md transition-shadow duration-300' : ''
          }`}
        >
          <div className={`${badge.color} mb-2`}>
            {badge.icon}
          </div>
          <h4 className="font-semibold text-sm text-gray-900">{badge.title}</h4>
          <p className="text-xs text-gray-600 text-center">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}

// Customer Testimonials with Photos
function CustomerTestimonials({ layout = 'horizontal' }: { layout?: 'horizontal' | 'vertical' | 'grid' }) {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Manager',
      company: 'TechCorp',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
      text: 'TrueCheckIA has revolutionized our content review process. We catch AI-generated content with 99% accuracy now.',
      verified: true
    },
    {
      name: 'Michael Rodriguez',
      role: 'Editor-in-Chief',
      company: 'Digital Media Co.',
      avatar: '/avatars/michael.jpg',
      rating: 5,
      text: 'The speed and accuracy are incredible. What used to take hours now takes seconds.',
      verified: true
    },
    {
      name: 'Emily Watson',
      role: 'Marketing Director',
      company: 'Creative Agency',
      avatar: '/avatars/emily.jpg',
      rating: 5,
      text: 'Essential tool for maintaining content authenticity. Highly recommended!',
      verified: true
    }
  ];

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'space-y-6';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      default:
        return 'space-y-6';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={testimonial.avatar} />
              <AvatarFallback>
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                {testimonial.verified && (
                  <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {testimonial.role} at {testimonial.company}
              </p>
              
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 italic">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Trust Statistics
function TrustStatistics({ showAnimations = true }: { showAnimations?: boolean }) {
  const [counts, setCounts] = useState({
    users: 25000,
    analyses: 150000,
    accuracy: 99,
    countries: 50
  });

  useEffect(() => {
    if (showAnimations) {
      // Animate counters
      const animationDuration = 2000;
      const steps = 60;
      const stepDuration = animationDuration / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounts({
          users: Math.floor(25000 * progress),
          analyses: Math.floor(150000 * progress),
          accuracy: Math.floor(99 * progress),
          countries: Math.floor(50 * progress)
        });
        
        if (step >= steps) clearInterval(interval);
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [showAnimations]);

  const stats = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      value: `${(counts.users / 1000).toFixed(0)}K+`,
      label: 'Happy Users',
      color: 'bg-blue-50'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      value: `${(counts.analyses / 1000).toFixed(0)}K+`,
      label: 'Analyses Completed',
      color: 'bg-green-50'
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      value: `${counts.accuracy}%`,
      label: 'Accuracy Rate',
      color: 'bg-purple-50'
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-600" />,
      value: `${counts.countries}+`,
      label: 'Countries',
      color: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`text-center p-6 rounded-lg ${stat.color} ${
            showAnimations ? 'hover:scale-105 transition-transform duration-300' : ''
          }`}
        >
          <div className="flex justify-center mb-3">
            {stat.icon}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Money-Back Guarantee
function MoneyBackGuarantee({ days = 30 }: { days?: number }) {
  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {days}-Day Money-Back Guarantee
          </h3>
          <p className="text-gray-600 text-sm">
            Try TrueCheckIA risk-free. If you're not completely satisfied within {days} days, 
            we'll refund your money - no questions asked.
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <Badge className="bg-green-600 text-white px-3 py-2">
            100% Guaranteed
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// Industry Certifications
function IndustryCertifications() {
  const certifications = [
    {
      name: 'ISO 27001',
      description: 'Information Security Management',
      logo: '/certifications/iso27001.svg',
      verified: true
    },
    {
      name: 'SOC 2 Type II',
      description: 'Security & Availability Controls',
      logo: '/certifications/soc2.svg',
      verified: true
    },
    {
      name: 'GDPR Compliant',
      description: 'Data Protection Regulation',
      logo: '/certifications/gdpr.svg',
      verified: true
    },
    {
      name: 'Privacy Shield',
      description: 'EU-US Data Transfer Framework',
      logo: '/certifications/privacy-shield.svg',
      verified: true
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Trusted & Certified
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {certifications.map((cert, index) => (
          <div key={index} className="text-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-gray-600" />
            </div>
            
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {cert.name}
            </h4>
            
            <p className="text-xs text-gray-600 mb-2">
              {cert.description}
            </p>
            
            {cert.verified && (
              <div className="flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Company Logos (Social Proof)
function CompanyLogos() {
  const companies = [
    { name: 'TechCorp', logo: '/logos/techcorp.svg' },
    { name: 'Digital Media Co', logo: '/logos/digital-media.svg' },
    { name: 'Creative Agency', logo: '/logos/creative-agency.svg' },
    { name: 'Content Hub', logo: '/logos/content-hub.svg' },
    { name: 'Marketing Pro', logo: '/logos/marketing-pro.svg' },
    { name: 'Publisher Inc', logo: '/logos/publisher.svg' }
  ];

  return (
    <div className="py-8 bg-gray-50">
      <div className="text-center mb-6">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
          Trusted by leading companies
        </h3>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
        {companies.map((company, index) => (
          <div key={index} className="flex items-center justify-center h-12 px-4">
            <span className="text-gray-400 font-semibold">{company.name}</span>
            {/* In a real implementation, you'd use actual logo images */}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Trust Elements Component
export function TrustElements({ 
  variant = 'all', 
  layout = 'vertical', 
  showAnimations = true,
  className 
}: TrustElementsProps) {
  useEffect(() => {
    analytics.track('trust_elements_viewed', {
      variant,
      layout
    });
  }, [variant, layout]);

  const renderElements = () => {
    switch (variant) {
      case 'badges':
        return <SecurityBadges showAnimations={showAnimations} />;
      
      case 'testimonials':
        return <CustomerTestimonials layout={layout} />;
      
      case 'stats':
        return <TrustStatistics showAnimations={showAnimations} />;
      
      case 'guarantees':
        return <MoneyBackGuarantee />;
      
      case 'certifications':
        return <IndustryCertifications />;
      
      case 'all':
      default:
        return (
          <div className="space-y-12">
            <TrustStatistics showAnimations={showAnimations} />
            <CustomerTestimonials layout={layout} />
            <SecurityBadges showAnimations={showAnimations} />
            <MoneyBackGuarantee />
            <IndustryCertifications />
            <CompanyLogos />
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderElements()}
    </div>
  );
}

// Individual Trust Components for flexible use
export {
  SecurityBadges,
  CustomerTestimonials,
  TrustStatistics,
  MoneyBackGuarantee,
  IndustryCertifications,
  CompanyLogos
};

// Trust Elements for specific pages
export function PricingPageTrust() {
  return (
    <div className="space-y-8">
      <TrustStatistics showAnimations={true} />
      <MoneyBackGuarantee days={30} />
      <SecurityBadges showAnimations={true} />
    </div>
  );
}

export function LandingPageTrust() {
  return (
    <div className="space-y-12">
      <CompanyLogos />
      <TrustStatistics showAnimations={true} />
      <CustomerTestimonials layout="grid" />
    </div>
  );
}

export function CheckoutPageTrust() {
  return (
    <div className="space-y-6">
      <SecurityBadges showAnimations={false} />
      <MoneyBackGuarantee days={30} />
    </div>
  );
}
