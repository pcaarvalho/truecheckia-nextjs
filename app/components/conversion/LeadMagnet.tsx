'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, BookOpen, Video, Calculator, CheckCircle, ArrowRight, Mail, FileText, Zap, Users, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analytics } from '@/app/lib/analytics/events';
import { experimentTracker } from '@/app/lib/experiments/tracking';

interface LeadMagnetProps {
  type: 'guide' | 'course' | 'video' | 'calculator' | 'checklist' | 'template' | 'comparison';
  title: string;
  description: string;
  benefits: string[];
  ctaText?: string;
  onEmailCapture?: (email: string, leadMagnet: string) => void;
  className?: string;
  compact?: boolean;
  inline?: boolean;
}

// Free Guide Download Component
function FreeGuideDownload({ title, description, benefits, onEmailCapture, compact }: {
  title: string;
  description: string;
  benefits: string[];
  onEmailCapture?: (email: string, leadMagnet: string) => void;
  compact?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      experimentTracker.trackEmailCapture(email, 'free_guide');
      analytics.track('lead_magnet_download', {
        type: 'guide',
        title,
        email
      });
      
      onEmailCapture?.(email, title);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Failed to capture email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Check Your Email!
          </h3>
          <p className="text-green-700">
            We've sent you the download link for "{title}"
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 ${compact ? 'max-w-md' : 'max-w-lg'}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          {!compact && (
            <ul className="space-y-2 mb-6">
              {benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Download Free Guide'}
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            🔒 No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </Card>
  );
}

// Email Course Component
function EmailCourse({ title, description, benefits, onEmailCapture, compact }: {
  title: string;
  description: string;
  benefits: string[];
  onEmailCapture?: (email: string, leadMagnet: string) => void;
  compact?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      experimentTracker.trackEmailCapture(email, 'email_course');
      analytics.track('lead_magnet_signup', {
        type: 'course',
        title,
        email
      });
      
      onEmailCapture?.(email, title);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Failed to capture email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Welcome to the Course!
          </h3>
          <p className="text-green-700">
            Your first lesson will arrive in your inbox within the next few minutes.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 ${compact ? 'max-w-md' : 'max-w-lg'}`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-purple-600" />
        </div>
        
        <Badge className="mb-3 bg-purple-100 text-purple-800">
          FREE 5-Day Course
        </Badge>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {!compact && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">You'll learn:</h4>
            <ul className="space-y-2 text-sm text-left">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-xs">{index + 1}</span>
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
          
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enrolling...' : 'Start Free Course'}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          📧 One lesson per day for 5 days
        </p>
      </div>
    </Card>
  );
}

// ROI Calculator Component
function ROICalculator({ title, description, onEmailCapture }: {
  title: string;
  description: string;
  onEmailCapture?: (email: string, leadMagnet: string) => void;
}) {
  const [hours, setHours] = useState('10');
  const [hourlyRate, setHourlyRate] = useState('50');
  const [monthlyContent, setMonthlyContent] = useState('100');
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const calculateROI = useCallback(() => {
    const hoursNum = parseFloat(hours) || 0;
    const rateNum = parseFloat(hourlyRate) || 0;
    const contentNum = parseFloat(monthlyContent) || 0;
    
    const timePerContent = 0.5; // 30 seconds per content piece
    const timeSaved = contentNum * timePerContent;
    const costSaved = timeSaved * rateNum;
    const monthlyROI = costSaved - 12; // Assuming $12/month subscription
    
    return {
      timeSaved: Math.round(timeSaved),
      costSaved: Math.round(costSaved),
      monthlyROI: Math.round(monthlyROI),
      yearlyROI: Math.round(monthlyROI * 12)
    };
  }, [hours, hourlyRate, monthlyContent]);

  const handleCalculate = () => {
    setShowResults(true);
    analytics.track('roi_calculator_used', {
      hours,
      hourlyRate,
      monthlyContent
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    experimentTracker.trackEmailCapture(email, 'roi_calculator');
    analytics.track('lead_magnet_calculator', {
      type: 'roi',
      email,
      calculatorResults: calculateROI()
    });
    
    onEmailCapture?.(email, 'ROI Calculator Results');
  };

  const results = calculateROI();

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200 max-w-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="h-8 w-8 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours spent reviewing content per week:
          </label>
          <Input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your hourly rate ($):
          </label>
          <Input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content pieces reviewed per month:
          </label>
          <Input
            type="number"
            value={monthlyContent}
            onChange={(e) => setMonthlyContent(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <Button
        onClick={handleCalculate}
        className="w-full bg-green-600 hover:bg-green-700 mb-4"
      >
        <Calculator className="h-4 w-4 mr-2" />
        Calculate My Savings
      </Button>
      
      {showResults && (
        <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">Your Potential Savings:</h4>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{results.timeSaved}h</div>
              <div className="text-xs text-gray-600">Time Saved Monthly</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">${results.costSaved}</div>
              <div className="text-xs text-gray-600">Cost Savings Monthly</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded col-span-2">
              <div className="text-3xl font-bold text-purple-600">${results.yearlyROI}</div>
              <div className="text-sm text-gray-600">Net ROI Yearly</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Want a detailed breakdown sent to your email?
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
              
              <Button type="submit" size="sm" className="w-full">
                Send Detailed Report
              </Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

// Comparison Chart Component
function ComparisonChart({ title, description, onEmailCapture }: {
  title: string;
  description: string;
  onEmailCapture?: (email: string, leadMagnet: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const competitors = [
    { name: 'TrueCheckIA', price: '$12', accuracy: '99%', speed: '< 1s', support: '24/7', features: '✓ All' },
    { name: 'Competitor A', price: '$25', accuracy: '85%', speed: '3-5s', support: 'Email', features: '✓ Basic' },
    { name: 'Competitor B', price: '$19', accuracy: '82%', speed: '5-10s', support: 'Ticket', features: '✓ Limited' },
    { name: 'Manual Review', price: '$50/hr', accuracy: '70%', speed: '10+ min', support: 'N/A', features: 'Variable' }
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    experimentTracker.trackEmailCapture(email, 'comparison_chart');
    analytics.track('lead_magnet_comparison', {
      email,
      type: 'comparison_chart'
    });
    
    onEmailCapture?.(email, 'AI Detection Tool Comparison');
  };

  return (
    <Card className="p-6 max-w-4xl">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold">Tool</th>
              <th className="text-left p-3 font-semibold">Price</th>
              <th className="text-left p-3 font-semibold">Accuracy</th>
              <th className="text-left p-3 font-semibold">Speed</th>
              <th className="text-left p-3 font-semibold">Support</th>
              <th className="text-left p-3 font-semibold">Features</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, index) => (
              <tr key={index} className={`border-b ${index === 0 ? 'bg-blue-50 border-blue-200' : ''}`}>
                <td className="p-3 font-medium">
                  {comp.name}
                  {index === 0 && (
                    <Badge className="ml-2 bg-blue-600 text-white text-xs">
                      Recommended
                    </Badge>
                  )}
                </td>
                <td className="p-3">{comp.price}</td>
                <td className="p-3">
                  <div className="flex items-center">
                    {comp.accuracy}
                    {index === 0 && <Star className="h-4 w-4 text-yellow-400 ml-1" />}
                  </div>
                </td>
                <td className="p-3">{comp.speed}</td>
                <td className="p-3">{comp.support}</td>
                <td className="p-3">{comp.features}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Want the complete comparison with detailed analysis?
        </p>
        
        <form onSubmit={handleEmailSubmit} className="max-w-sm mx-auto space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Get Full Comparison
          </Button>
        </form>
      </div>
    </Card>
  );
}

// Main Lead Magnet Component
export function LeadMagnet({
  type,
  title,
  description,
  benefits,
  ctaText,
  onEmailCapture,
  className,
  compact = false,
  inline = false
}: LeadMagnetProps) {
  useEffect(() => {
    analytics.track('lead_magnet_viewed', {
      type,
      title
    });
  }, [type, title]);

  const renderMagnet = () => {
    switch (type) {
      case 'guide':
      case 'template':
      case 'checklist':
        return (
          <FreeGuideDownload
            title={title}
            description={description}
            benefits={benefits}
            onEmailCapture={onEmailCapture}
            compact={compact}
          />
        );
      
      case 'course':
        return (
          <EmailCourse
            title={title}
            description={description}
            benefits={benefits}
            onEmailCapture={onEmailCapture}
            compact={compact}
          />
        );
      
      case 'calculator':
        return (
          <ROICalculator
            title={title}
            description={description}
            onEmailCapture={onEmailCapture}
          />
        );
      
      case 'comparison':
        return (
          <ComparisonChart
            title={title}
            description={description}
            onEmailCapture={onEmailCapture}
          />
        );
      
      default:
        return (
          <FreeGuideDownload
            title={title}
            description={description}
            benefits={benefits}
            onEmailCapture={onEmailCapture}
            compact={compact}
          />
        );
    }
  };

  return (
    <div className={className}>
      {renderMagnet()}
    </div>
  );
}

// Predefined Lead Magnets for TrueCheckIA
export const TrueCheckIALeadMagnets = {
  aiDetectionGuide: {
    type: 'guide' as const,
    title: 'Ultimate AI Content Detection Guide',
    description: 'Learn to spot AI-generated content with 99% accuracy',
    benefits: [
      'Identify AI patterns in text, images, and audio',
      'Step-by-step detection workflow',
      'Tools and techniques used by professionals',
      'Real-world examples and case studies'
    ]
  },
  
  aiDetectionCourse: {
    type: 'course' as const,
    title: 'AI Detection Mastery Course',
    description: 'Master AI content detection in 5 days with daily email lessons',
    benefits: [
      'Day 1: Understanding AI-generated content',
      'Day 2: Manual detection techniques',
      'Day 3: Using automated tools effectively',
      'Day 4: Advanced detection strategies',
      'Day 5: Building detection workflows'
    ]
  },
  
  roiCalculator: {
    type: 'calculator' as const,
    title: 'AI Detection ROI Calculator',
    description: 'Calculate how much time and money you can save with automated AI detection'
  },
  
  toolComparison: {
    type: 'comparison' as const,
    title: 'AI Detection Tools Comparison',
    description: 'Compare top AI detection tools: features, pricing, and accuracy'
  }
};
