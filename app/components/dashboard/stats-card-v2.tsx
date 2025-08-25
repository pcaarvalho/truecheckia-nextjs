'use client';

import * as React from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingUp, TrendingDown, Minus, type LucideIcon, Loader2 } from 'lucide-react';

import { cn } from '@/app/lib/utils';
import { CardV2, CardV2Content, CardV2Header } from '@/components/ui/card-v2';

const statsCardVariants = cva(
  'relative overflow-hidden transition-all duration-300',
  {
    variants: {
      status: {
        default: '',
        success: 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20',
        warning: 'border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20',
        error: 'border-red-500/20 bg-red-50/50 dark:bg-red-950/20',
        info: 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  }
);

// Simple sparkline component using SVG
const Sparkline = ({ 
  data, 
  width = 60, 
  height = 20,
  color = 'currentColor',
  className 
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.7, ease: "easeInOut" }}
      />
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <motion.polygon
        fill={`url(#gradient-${Math.random()})`}
        points={`0,${height} ${points} ${width},${height}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      />
    </motion.svg>
  );
};

// Animated counter hook
const useAnimatedCounter = (value: number, duration: number = 1000) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return displayValue;
};

// Format number for display
const formatValue = (value: number, format?: 'number' | 'currency' | 'percentage') => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
};

// Trend indicator component
const TrendIndicator = ({ 
  value, 
  showIcon = true, 
  className 
}: { 
  value: number; 
  showIcon?: boolean; 
  className?: string; 
}) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral 
    ? 'text-muted-foreground' 
    : isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';

  return (
    <motion.div
      className={cn('flex items-center gap-1', colorClass, className)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-xs font-medium">
        {isPositive && '+'}
        {value.toFixed(1)}%
      </span>
    </motion.div>
  );
};

export interface StatsCardV2Props extends VariantProps<typeof statsCardVariants> {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: LucideIcon;
  trend?: number;
  trendData?: number[];
  loading?: boolean;
  className?: string;
  description?: string;
}

const StatsCardV2 = React.forwardRef<HTMLDivElement, StatsCardV2Props>(
  ({
    title,
    value,
    previousValue,
    format = 'number',
    icon: Icon,
    trend,
    trendData,
    loading = false,
    status,
    className,
    description,
    ...props
  }, ref) => {
    const animatedValue = useAnimatedCounter(value, 1500);
    const calculatedTrend = trend ?? (previousValue ? ((value - previousValue) / previousValue) * 100 : 0);

    const iconVariants = {
      initial: { scale: 0, rotate: -180 },
      animate: { scale: 1, rotate: 0 },
      hover: { scale: 1.1, rotate: 5 }
    };

    if (loading) {
      return (
        <CardV2 
          ref={ref}
          className={cn(statsCardVariants({ status }), className)}
          loading={true}
          {...props}
        />
      );
    }

    return (
      <CardV2 
        ref={ref}
        className={cn(statsCardVariants({ status }), className)}
        variant="elevated"
        animation="glow"
        interactive={true}
        {...props}
      >
        <CardV2Header className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && (
                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  className={cn(
                    'p-2 rounded-lg',
                    status === 'success' && 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
                    status === 'warning' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
                    status === 'error' && 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
                    status === 'info' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                    !status && 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
              )}
              <motion.h3
                className="text-sm font-medium text-muted-foreground"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h3>
            </div>
            
            {trendData && trendData.length > 1 && (
              <Sparkline 
                data={trendData} 
                color={
                  status === 'success' ? '#10b981' :
                  status === 'warning' ? '#f59e0b' :
                  status === 'error' ? '#ef4444' :
                  status === 'info' ? '#3b82f6' :
                  'currentColor'
                }
                className="opacity-60"
              />
            )}
          </div>
        </CardV2Header>

        <CardV2Content className="pt-0">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <motion.div
                className="text-2xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {formatValue(animatedValue, format)}
              </motion.div>
              
              {description && (
                <motion.p
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  {description}
                </motion.p>
              )}
            </div>

            {(trend !== undefined || previousValue !== undefined) && (
              <TrendIndicator value={calculatedTrend} />
            )}
          </div>
        </CardV2Content>

        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
          initial={false}
          transition={{ duration: 0.3 }}
        />
      </CardV2>
    );
  }
);

StatsCardV2.displayName = 'StatsCardV2';

export { StatsCardV2, statsCardVariants };