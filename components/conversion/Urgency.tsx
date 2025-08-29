'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Clock, AlertTriangle, Zap, Users, TrendingUp, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics/events';

interface UrgencyElementProps {
  type: 'countdown' | 'limited-stock' | 'price-increase' | 'expiring-discount' | 'limited-time' | 'social-urgency';
  title?: string;
  description?: string;
  endDate?: Date;
  initialCount?: number;
  discountPercent?: number;
  onExpire?: () => void;
  onAction?: (action: string) => void;
  className?: string;
}

// Countdown Timer Component
function CountdownTimer({ 
  endDate, 
  onExpire, 
  onAction, 
  title = "Limited Time Offer!",
  description = "Don't miss out on this exclusive deal"
}: {
  endDate: Date;
  onExpire?: () => void;
  onAction?: (action: string) => void;
  title?: string;
  description?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        setHasExpired(true);
        onExpire?.();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  useEffect(() => {
    analytics.track('urgency_countdown_viewed', {
      title,
      timeRemaining: `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
    });
  }, [title, timeLeft]);

  if (hasExpired) return null;

  const handleClick = () => {
    onAction?.('countdown_click');
    analytics.track('urgency_countdown_clicked', {
      title,
      timeRemaining: `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        
        <p className="text-white/90 mb-4">{description}</p>
        
        <div className="flex justify-center space-x-4 mb-4">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs text-white/80">DAYS</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-xs text-white/80">HOURS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs text-white/80">MINUTES</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs text-white/80">SECONDS</div>
          </div>
        </div>
        
        <Button 
          onClick={handleClick}
          className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
        >
          Claim Offer Now
        </Button>
      </div>
    </Card>
  );
}

// Limited Stock Component
function LimitedStock({ 
  initialCount = 50, 
  onAction,
  title = "Limited Spots Available!",
  description = "Secure your spot before it's gone"
}: {
  initialCount?: number;
  onAction?: (action: string) => void;
  title?: string;
  description?: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    // Simulate decreasing stock
    const interval = setInterval(() => {
      setCount(prev => {
        const newCount = Math.max(0, prev - Math.floor(Math.random() * 3));
        setIsLow(newCount <= 10);
        return newCount;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    analytics.track('urgency_stock_viewed', {
      remainingStock: count,
      isLow
    });
  }, [count, isLow]);

  const handleClick = () => {
    onAction?.('stock_click');
    analytics.track('urgency_stock_clicked', {
      remainingStock: count
    });
  };

  const getStockColor = () => {
    if (count <= 5) return 'text-red-600';
    if (count <= 10) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressWidth = () => {
    return Math.max(5, (count / initialCount) * 100);
  };

  return (
    <Card className="p-4 border-l-4 border-l-orange-500 bg-orange-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{description}</p>
          
          <div className="flex items-center space-x-3 mb-3">
            <span className={`font-bold text-lg ${getStockColor()}`}>
              {count} left
            </span>
            {isLow && (
              <Badge variant="destructive" className="animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                Almost Gone!
              </Badge>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressWidth()}%` }}
            />
          </div>
          
          <Button 
            onClick={handleClick}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            Reserve Spot Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Price Increase Warning
function PriceIncreaseWarning({ 
  increaseDate,
  currentPrice = "$12",
  newPrice = "$19",
  onAction
}: {
  increaseDate: Date;
  currentPrice?: string;
  newPrice?: string;
  onAction?: (action: string) => void;
}) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const updateDaysLeft = () => {
      const now = new Date();
      const timeDiff = increaseDate.getTime() - now.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setDaysLeft(Math.max(0, days));
    };

    updateDaysLeft();
    const interval = setInterval(updateDaysLeft, 1000 * 3600); // Update hourly

    return () => clearInterval(interval);
  }, [increaseDate]);

  useEffect(() => {
    analytics.track('urgency_price_warning_viewed', {
      currentPrice,
      newPrice,
      daysLeft
    });
  }, [currentPrice, newPrice, daysLeft]);

  const handleClick = () => {
    onAction?.('price_warning_click');
    analytics.track('urgency_price_warning_clicked', {
      currentPrice,
      newPrice,
      daysLeft
    });
  };

  if (daysLeft <= 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6" />
          <div>
            <h4 className="font-bold">Price Increasing Soon!</h4>
            <p className="text-sm text-white/90">
              Lock in {currentPrice}/month before it goes to {newPrice}/month
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{daysLeft}</div>
          <div className="text-xs text-white/80">DAYS LEFT</div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={handleClick}
          className="w-full bg-white text-orange-600 hover:bg-gray-100 font-semibold"
        >
          Lock In Current Price
        </Button>
      </div>
    </Card>
  );
}

// Expiring Discount
function ExpiringDiscount({ 
  discountPercent = 50,
  expiryDate,
  onAction
}: {
  discountPercent?: number;
  expiryDate: Date;
  onAction?: (action: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryDate.getTime() - now;

      if (distance < 0) {
        setHasExpired(true);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryDate]);

  useEffect(() => {
    if (!hasExpired) {
      analytics.track('urgency_discount_viewed', {
        discountPercent,
        timeLeft
      });
    }
  }, [discountPercent, timeLeft, hasExpired]);

  const handleClick = () => {
    onAction?.('discount_click');
    analytics.track('urgency_discount_clicked', {
      discountPercent,
      timeLeft
    });
  };

  if (hasExpired) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white border-0 shadow-lg">
      <div className="text-center">
        <Badge className="mb-2 bg-white text-green-600 text-lg font-bold px-3 py-1">
          {discountPercent}% OFF
        </Badge>
        
        <h3 className="text-xl font-bold mb-2">
          Special Launch Discount
        </h3>
        
        <div className="flex items-center justify-center mb-3">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-white/90">Expires in {timeLeft}</span>
        </div>
        
        <Button 
          onClick={handleClick}
          className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
        >
          Use Code: SAVE{discountPercent}
        </Button>
      </div>
    </Card>
  );
}

// Social Urgency (other users taking action)
function SocialUrgency({ onAction }: { onAction?: (action: string) => void }) {
  const [recentActions, setRecentActions] = useState([
    { action: 'signed up for PRO', time: '2 minutes ago', location: 'San Francisco' },
    { action: 'started free trial', time: '5 minutes ago', location: 'New York' },
    { action: 'upgraded account', time: '8 minutes ago', location: 'London' }
  ]);

  useEffect(() => {
    // Simulate new actions
    const interval = setInterval(() => {
      const actions = ['signed up for PRO', 'started free trial', 'upgraded account', 'analyzed content'];
      const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Sydney'];
      
      const newAction = {
        action: actions[Math.floor(Math.random() * actions.length)],
        time: 'just now',
        location: locations[Math.floor(Math.random() * locations.length)]
      };
      
      setRecentActions(prev => [newAction, ...prev.slice(0, 2)]);
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    analytics.track('urgency_social_viewed', {
      actionsCount: recentActions.length
    });
  }, [recentActions]);

  const handleClick = () => {
    onAction?.('social_urgency_click');
    analytics.track('urgency_social_clicked');
  };

  return (
    <Card className="p-4 bg-blue-50 border-l-4 border-l-blue-500">
      <div className="flex items-center mb-3">
        <Users className="h-5 w-5 text-blue-600 mr-2" />
        <h4 className="font-semibold text-gray-900">Live Activity</h4>
      </div>
      
      <div className="space-y-2 mb-4">
        {recentActions.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
            <span className="text-gray-700">
              Someone from <strong>{item.location}</strong> {item.action} {item.time}
            </span>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={handleClick}
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Join Others - Start Now
      </Button>
    </Card>
  );
}

// Main Urgency Element Component
export function UrgencyElement({
  type,
  title,
  description,
  endDate,
  initialCount,
  discountPercent,
  onExpire,
  onAction,
  className
}: UrgencyElementProps) {
  const renderUrgencyType = () => {
    switch (type) {
      case 'countdown':
        return (
          <CountdownTimer
            endDate={endDate || new Date(Date.now() + 24 * 60 * 60 * 1000)}
            onExpire={onExpire}
            onAction={onAction}
            title={title}
            description={description}
          />
        );
      
      case 'limited-stock':
        return (
          <LimitedStock
            initialCount={initialCount}
            onAction={onAction}
            title={title}
            description={description}
          />
        );
      
      case 'price-increase':
        return (
          <PriceIncreaseWarning
            increaseDate={endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
            onAction={onAction}
          />
        );
      
      case 'expiring-discount':
        return (
          <ExpiringDiscount
            discountPercent={discountPercent}
            expiryDate={endDate || new Date(Date.now() + 6 * 60 * 60 * 1000)}
            onAction={onAction}
          />
        );
      
      case 'social-urgency':
        return <SocialUrgency onAction={onAction} />;
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderUrgencyType()}
    </div>
  );
}

// Multi-urgency manager component
export function UrgencyManager({ elements }: { elements: UrgencyElementProps[] }) {
  const [visibleElements, setVisibleElements] = useState(elements);

  const handleExpire = (index: number) => {
    setVisibleElements(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {visibleElements.map((element, index) => (
        <UrgencyElement
          key={index}
          {...element}
          onExpire={() => handleExpire(index)}
        />
      ))}
    </div>
  );
}
