'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Zap, Users, TrendingUp, Clock, Gift, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analytics } from '@/lib/analytics/events';

interface NotificationToast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'promo' | 'social' | 'urgency';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  persistent?: boolean;
}

interface ToastContextType {
  toasts: NotificationToast[];
  addToast: (toast: Omit<NotificationToast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const addToast = useCallback((toast: Omit<NotificationToast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: NotificationToast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
      dismissible: toast.dismissible ?? true,
      position: toast.position ?? 'top-right'
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast if not persistent
    if (!toast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    analytics.track('notification_toast_shown', {
      type: toast.type,
      title: toast.title,
      position: toast.position
    });

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual Toast Component
function ToastItem({ toast, onRemove }: { toast: NotificationToast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    analytics.track('notification_toast_dismissed', {
      toastId: toast.id,
      type: toast.type,
      title: toast.title
    });
    
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const handleActionClick = () => {
    analytics.track('notification_toast_action_clicked', {
      toastId: toast.id,
      type: toast.type,
      title: toast.title,
      action: toast.action?.label
    });
    
    toast.action?.onClick();
    handleDismiss();
  };

  const getTypeConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: toast.icon || <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'warning':
        return {
          icon: toast.icon || <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: toast.icon || <Info className="h-5 w-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      case 'promo':
        return {
          icon: toast.icon || <Gift className="h-5 w-5" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-800',
          messageColor: 'text-purple-700'
        };
      case 'social':
        return {
          icon: toast.icon || <Users className="h-5 w-5" />,
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          iconColor: 'text-indigo-600',
          titleColor: 'text-indigo-800',
          messageColor: 'text-indigo-700'
        };
      case 'urgency':
        return {
          icon: toast.icon || <Clock className="h-5 w-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      default:
        return {
          icon: toast.icon || <Bell className="h-5 w-5" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : toast.position?.includes('right')
          ? 'translate-x-full opacity-0 scale-95'
          : '-translate-x-full opacity-0 scale-95'
      }`}
    >
      <Card 
        className={`p-4 shadow-lg border ${config.bgColor} ${config.borderColor} max-w-sm w-full`}
      >
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${config.titleColor}`}>
              {toast.title}
            </h4>
            <p className={`text-sm ${config.messageColor} mt-1`}>
              {toast.message}
            </p>
            
            {toast.action && (
              <Button
                onClick={handleActionClick}
                size="sm"
                className="mt-3 h-8 text-xs"
              >
                {toast.action.label}
              </Button>
            )}
          </div>
          
          {toast.dismissible && (
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Toast Container
function ToastContainer() {
  const { toasts, removeToast } = useToast();
  
  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) acc[position] = [];
    acc[position].push(toast);
    return acc;
  }, {} as Record<string, NotificationToast[]>);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed ${getPositionClasses(position)} z-50 space-y-3`}
        >
          {positionToasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </div>
      ))}
    </>
  );
}

// Conversion-focused toast templates
export function useConversionToasts() {
  const { addToast } = useToast();

  const showSuccessStory = useCallback((story: string, location?: string) => {
    return addToast({
      type: 'social',
      title: 'Success Story',
      message: story,
      duration: 6000,
      icon: <TrendingUp className="h-5 w-5" />,
      position: 'bottom-left'
    });
  }, [addToast]);

  const showLimitedOffer = useCallback((offer: string, timeLeft?: string) => {
    return addToast({
      type: 'urgency',
      title: 'Limited Time Offer!',
      message: offer,
      duration: 8000,
      icon: <Clock className="h-5 w-5" />,
      action: {
        label: 'Claim Now',
        onClick: () => {
          window.location.href = '/pricing';
        }
      },
      position: 'top-center'
    });
  }, [addToast]);

  const showSocialProof = useCallback((activity: string) => {
    return addToast({
      type: 'social',
      title: 'Live Activity',
      message: activity,
      duration: 5000,
      icon: <Users className="h-5 w-5" />,
      position: 'bottom-left'
    });
  }, [addToast]);

  const showPromotion = useCallback((promo: { title: string; message: string; ctaLabel: string; ctaAction: () => void }) => {
    return addToast({
      type: 'promo',
      title: promo.title,
      message: promo.message,
      duration: 10000,
      icon: <Gift className="h-5 w-5" />,
      action: {
        label: promo.ctaLabel,
        onClick: promo.ctaAction
      },
      position: 'top-right'
    });
  }, [addToast]);

  const showFeatureAnnouncement = useCallback((feature: string, description: string) => {
    return addToast({
      type: 'info',
      title: `New: ${feature}`,
      message: description,
      duration: 7000,
      icon: <Zap className="h-5 w-5" />,
      action: {
        label: 'Try It Now',
        onClick: () => {
          window.location.href = '/dashboard';
        }
      },
      position: 'top-right'
    });
  }, [addToast]);

  const showWelcomeBonus = useCallback((bonus: string) => {
    return addToast({
      type: 'success',
      title: 'Welcome Bonus!',
      message: bonus,
      duration: 8000,
      icon: <Gift className="h-5 w-5" />,
      position: 'top-center'
    });
  }, [addToast]);

  return {
    showSuccessStory,
    showLimitedOffer,
    showSocialProof,
    showPromotion,
    showFeatureAnnouncement,
    showWelcomeBonus
  };
}

// Automated notification manager
export function NotificationManager() {
  const { showSocialProof, showLimitedOffer, showSuccessStory } = useConversionToasts();

  useEffect(() => {
    const activities = [
      'Someone from New York just signed up for PRO',
      'Mike from London completed an AI detection analysis',
      'Sarah from Tokyo upgraded to Enterprise plan',
      'Alex from Berlin analyzed 50+ documents today',
      'Emma from Sydney discovered AI content in her blog post'
    ];

    const successStories = [
      '"TrueCheckIA helped me catch plagiarized content!" - Content Manager',
      '"Saved 10 hours per week with automated detection" - Editor',
      '"99% accuracy rate, incredible tool!" - Marketing Director'
    ];

    // Show social proof every 30 seconds
    const socialProofInterval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      showSocialProof(randomActivity);
    }, 30000);

    // Show success story every 2 minutes
    const successStoryInterval = setInterval(() => {
      const randomStory = successStories[Math.floor(Math.random() * successStories.length)];
      showSuccessStory(randomStory);
    }, 120000);

    // Show limited offer after 5 minutes
    const offerTimer = setTimeout(() => {
      showLimitedOffer('50% off your first month - Limited time only!');
    }, 300000);

    return () => {
      clearInterval(socialProofInterval);
      clearInterval(successStoryInterval);
      clearTimeout(offerTimer);
    };
  }, [showSocialProof, showLimitedOffer, showSuccessStory]);

  return null; // This component only manages notifications
}

// Predefined notification templates for TrueCheckIA
export const TrueCheckIANotifications = {
  welcome: {
    type: 'success' as const,
    title: 'Welcome to TrueCheckIA!',
    message: 'Your account has been created. Start detecting AI content now!',
    action: {
      label: 'Start Analysis',
      onClick: () => window.location.href = '/analysis'
    }
  },
  
  firstAnalysis: {
    type: 'success' as const,
    title: 'Great job!',
    message: 'You completed your first AI detection analysis.',
    duration: 6000
  },
  
  creditsLow: {
    type: 'warning' as const,
    title: 'Credits Running Low',
    message: 'You have less than 10 credits remaining.',
    action: {
      label: 'Upgrade Now',
      onClick: () => window.location.href = '/pricing'
    }
  },
  
  upgradeSuggestion: {
    type: 'promo' as const,
    title: 'Unlock More Features',
    message: 'Upgrade to PRO for unlimited analyses and advanced features.',
    action: {
      label: 'See Plans',
      onClick: () => window.location.href = '/pricing'
    }
  }
};
