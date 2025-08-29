'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { DelightfulCard } from '@/components/ui/delightful-card';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  animated?: boolean;
  showProgress?: boolean;
  progressValue?: number;
  maxValue?: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  onClick?: () => void;
}

// Number counting animation hook
function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0
) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = start + (end - start) * easeOutExpo;
      
      setCount(Math.floor(currentCount));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return count;
}

// Skeleton loading component
function StatsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="w-16 h-4 bg-gray-300 rounded"></div>
      </div>
      <div className="w-24 h-8 bg-gray-300 rounded mb-2"></div>
      <div className="w-32 h-4 bg-gray-300 rounded"></div>
    </div>
  );
}

// Progress bar component
function ProgressBar({ 
  value, 
  maxValue, 
  color 
}: { 
  value: number; 
  maxValue: number; 
  color: string; 
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
    yellow: 'from-yellow-400 to-yellow-600',
    purple: 'from-purple-400 to-purple-600',
    indigo: 'from-indigo-400 to-indigo-600',
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
      <motion.div
        className={`h-2 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-full relative`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ x: [-20, 200] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'linear',
            delay: 1 
          }}
        />
      </motion.div>
    </div>
  );
}

// Trend indicator component
function TrendIndicator({ 
  trend, 
  color 
}: { 
  trend: { value: number; isPositive: boolean; period?: string };
  color: string;
}) {
  const trendColorClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
  };

  return (
    <motion.div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        trendColorClasses[trend.isPositive ? 'positive' : 'negative']
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={{ rotate: trend.isPositive ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        <TrendingUp className="w-3 h-3 mr-1" />
      </motion.div>
      
      <span>{Math.abs(trend.value)}%</span>
      
      {trend.period && (
        <span className="ml-1 opacity-70">vs {trend.period}</span>
      )}
    </motion.div>
  );
}

// Floating background particles
function BackgroundParticles({ color }: { color: string }) {
  const particleColors = {
    blue: 'bg-blue-200',
    green: 'bg-green-200',
    red: 'bg-red-200',
    yellow: 'bg-yellow-200',
    purple: 'bg-purple-200',
    indigo: 'bg-indigo-200',
  };

  const particles = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    size: Math.random() * 4 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full opacity-20 ${particleColors[color as keyof typeof particleColors]}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${20 + particle.id * 30}%`,
            top: `${30 + particle.id * 20}%`,
          }}
          animate={{
            y: [-10, -20, -10],
            x: [-5, 5, -5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random(),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function EnhancedStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  animated = true,
  showProgress = false,
  progressValue = 0,
  maxValue = 100,
  prefix = '',
  suffix = '',
  loading = false,
  onClick,
}: EnhancedStatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Convert value to number for counting animation
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) || 0 : value;
  const animatedValue = useCountUp(numericValue, 2000);
  
  // Color schemes
  const colorSchemes = {
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
    },
    green: {
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-200',
    },
    red: {
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600',
      gradient: 'from-red-50 to-red-100',
      border: 'border-red-200',
    },
    yellow: {
      icon: 'bg-yellow-100 text-yellow-600',
      text: 'text-yellow-600',
      gradient: 'from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
    },
    purple: {
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
    },
    indigo: {
      icon: 'bg-indigo-100 text-indigo-600',
      text: 'text-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
    },
  };

  const scheme = colorSchemes[color];

  if (loading) {
    return (
      <DelightfulCard className="p-6">
        <StatsSkeleton />
      </DelightfulCard>
    );
  }

  return (
    <DelightfulCard
      className={`p-6 relative overflow-hidden border-2 ${scheme.border} transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      hoverEffect="lift"
      clickEffect="bounce"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background particles */}
      <BackgroundParticles color={color} />

      <div className="relative z-10">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className={`p-3 rounded-xl ${scheme.icon}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2,
              type: 'spring',
              stiffness: 200 
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              transition: { duration: 0.2 }
            }}
          >
            {Icon && <Icon className="w-6 h-6" />}
          </motion.div>

          {trend && (
            <TrendIndicator trend={trend} color={color} />
          )}
        </div>

        {/* Main value */}
        <motion.div
          className="mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="text-3xl font-bold text-gray-900 flex items-baseline"
            whileHover={{ scale: 1.02 }}
          >
            {prefix && (
              <span className="text-lg text-gray-600 mr-1">{prefix}</span>
            )}
            
            <AnimatePresence mode="wait">
              <motion.span
                key={animatedValue}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {animated ? animatedValue.toLocaleString() : value}
              </motion.span>
            </AnimatePresence>
            
            {suffix && (
              <span className="text-lg text-gray-600 ml-1">{suffix}</span>
            )}
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h3
          className="text-sm font-medium text-gray-600 mb-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {title}
        </motion.h3>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="text-xs text-gray-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Progress bar */}
        {showProgress && (
          <ProgressBar 
            value={progressValue} 
            maxValue={maxValue} 
            color={color} 
          />
        )}

        {/* Pulse effect on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className={`absolute inset-0 border-2 ${scheme.border} rounded-lg`}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ 
                scale: [1, 1.05, 1.02],
                opacity: [0.5, 0, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </div>
    </DelightfulCard>
  );
}

// Preset stat card variants
export function MetricCard(props: EnhancedStatsCardProps) {
  return (
    <EnhancedStatsCard
      color="blue"
      animated
      showProgress
      {...props}
    />
  );
}

export function SuccessCard(props: EnhancedStatsCardProps) {
  return (
    <EnhancedStatsCard
      color="green"
      animated
      {...props}
    />
  );
}

export function WarningCard(props: EnhancedStatsCardProps) {
  return (
    <EnhancedStatsCard
      color="yellow"
      animated
      {...props}
    />
  );
}

export function DangerCard(props: EnhancedStatsCardProps) {
  return (
    <EnhancedStatsCard
      color="red"
      animated
      {...props}
    />
  );
}