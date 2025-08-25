'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2, Share, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCardSwipe } from '@/app/hooks/use-touch-gestures';

interface MobileCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  expandable?: boolean;
  swipeActions?: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftAction?: {
      icon: React.ComponentType<any>;
      label: string;
      color: string;
    };
    rightAction?: {
      icon: React.ComponentType<any>;
      label: string;
      color: string;
    };
  };
  className?: string;
  onTap?: () => void;
}

export default function MobileCard({
  children,
  title,
  subtitle,
  badge,
  expandable = false,
  swipeActions,
  className = '',
  onTap,
}: MobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeRevealed, setIsSwipeRevealed] = useState(false);

  const swipeRef = useCardSwipe(
    swipeActions?.onSwipeLeft,
    swipeActions?.onSwipeRight
  );

  const handleTap = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
    onTap?.();
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe Action Background */}
      {swipeActions && (
        <div className="absolute inset-0 flex">
          {/* Left Action */}
          {swipeActions.leftAction && (
            <div 
              className={`flex items-center justify-center w-20 ${swipeActions.leftAction.color}`}
            >
              <swipeActions.leftAction.icon className="w-6 h-6 text-white" />
            </div>
          )}
          
          <div className="flex-1" />
          
          {/* Right Action */}
          {swipeActions.rightAction && (
            <div 
              className={`flex items-center justify-center w-20 ${swipeActions.rightAction.color}`}
            >
              <swipeActions.rightAction.icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Main Card */}
      <motion.div
        ref={swipeRef}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-white"
      >
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${className}`}
          onClick={handleTap}
          style={{ 
            // Ensure minimum touch target size
            minHeight: '64px' 
          }}
        >
          {(title || subtitle || badge) && (
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {subtitle}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-3">
                  {badge && (
                    <Badge variant={badge.variant || 'default'} className="text-xs">
                      {badge.text}
                    </Badge>
                  )}
                  
                  {expandable && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  )}
                </div>
              </div>
            </CardHeader>
          )}

          <CardContent className={title || subtitle || badge ? 'pt-0' : ''}>
            <div className="space-y-3">
              {children}
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {expandable && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    {/* Additional content when expanded */}
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        Informações detalhadas aparecem aqui quando o card é expandido.
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share className="w-4 h-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Analysis Result Card specifically for mobile
interface AnalysisResultCardProps {
  id: string;
  title: string;
  content: string;
  score: number;
  createdAt: string;
  onShare?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function AnalysisResultCard({
  id,
  title,
  content,
  score,
  createdAt,
  onShare,
  onDelete,
  onView,
}: AnalysisResultCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Muito Provável IA';
    if (score >= 50) return 'Possível IA';
    return 'Humano';
  };

  return (
    <MobileCard
      title={title}
      subtitle={content.substring(0, 100) + '...'}
      badge={{
        text: getScoreLabel(score),
        variant: score >= 80 ? 'destructive' : score >= 50 ? 'secondary' : 'default',
      }}
      expandable
      swipeActions={{
        onSwipeLeft: onDelete,
        onSwipeRight: onShare,
        leftAction: {
          icon: Trash2,
          label: 'Deletar',
          color: 'bg-red-500',
        },
        rightAction: {
          icon: Share,
          label: 'Compartilhar',
          color: 'bg-blue-500',
        },
      }}
      onTap={onView}
      className="mb-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Score de IA</span>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {score}%
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-2 rounded-full ${
              score >= 80 ? 'bg-red-500' : score >= 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          />
        </div>
      </div>
    </MobileCard>
  );
}

// Stats Card for dashboard
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<any>;
}

export function StatsCard({ title, value, subtitle, trend, icon: Icon }: StatsCardProps) {
  return (
    <MobileCard className="text-center">
      <div className="space-y-2">
        {Icon && (
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
        
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-500">{subtitle}</div>
          )}
        </div>

        {trend && (
          <div className={`text-xs font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </MobileCard>
  );
}