'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Link as LinkIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FABAction {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FABProps {
  actions?: FABAction[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const defaultActions: FABAction[] = [
  {
    icon: FileText,
    label: 'Text Analysis',
    onClick: () => console.log('Text analysis'),
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    icon: LinkIcon,
    label: 'URL Analysis',
    onClick: () => console.log('URL analysis'),
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    icon: Upload,
    label: 'Upload de Arquivo',
    onClick: () => console.log('File upload'),
    color: 'bg-purple-600 hover:bg-purple-700',
  },
];

export default function FAB({ 
  actions = defaultActions, 
  className = '',
  size = 'md',
  position = 'bottom-right'
}: FABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const handleMainClick = () => {
    if (actions.length === 1) {
      actions[0].onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && actions.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-4 flex flex-col-reverse space-y-reverse space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 20 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                  className="flex items-center space-x-3"
                >
                  {/* Action Label */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
                  >
                    {action.label}
                  </motion.div>

                  {/* Action Button */}
                  <Button
                    onClick={() => {
                      action.onClick();
                      setIsExpanded(false);
                    }}
                    className={`${sizeClasses.md} rounded-full shadow-lg ${
                      action.color || 'bg-blue-600 hover:bg-blue-700'
                    } text-white border-none min-h-0 p-0`}
                    style={{ minHeight: '44px', minWidth: '44px' }}
                    aria-label={action.label}
                  >
                    <Icon className={iconSizes.md} />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Button
          onClick={handleMainClick}
          className={`${sizeClasses[size]} rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-none min-h-0 p-0`}
          style={{ 
            minHeight: size === 'sm' ? '44px' : size === 'md' ? '48px' : '52px',
            minWidth: size === 'sm' ? '44px' : size === 'md' ? '48px' : '52px'
          }}
          aria-label={isExpanded ? 'Close menu' : 'New analysis'}
        >
          {isExpanded && actions.length > 1 ? (
            <X className={iconSizes[size]} />
          ) : (
            <Plus className={iconSizes[size]} />
          )}
        </Button>
      </motion.div>

      {/* Backdrop for closing */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized FAB for dashboard
interface DashboardFABProps {
  onTextAnalysis: () => void;
  onUrlAnalysis: () => void;
  onFileUpload: () => void;
}

export function DashboardFAB({ 
  onTextAnalysis, 
  onUrlAnalysis, 
  onFileUpload 
}: DashboardFABProps) {
  const actions: FABAction[] = [
    {
      icon: FileText,
      label: 'Text Analysis',
      onClick: onTextAnalysis,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: LinkIcon,
      label: 'URL Analysis',
      onClick: onUrlAnalysis,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: Upload,
      label: 'Upload de Arquivo',
      onClick: onFileUpload,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return <FAB actions={actions} />;
}

// Simple FAB for single action
interface SimpleFABProps {
  onClick: () => void;
  icon?: React.ComponentType<any>;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SimpleFAB({ 
  onClick, 
  icon: Icon = Plus, 
  label = 'Nova ação',
  className = '',
  size = 'md'
}: SimpleFABProps) {
  const actions: FABAction[] = [
    {
      icon: Icon,
      label,
      onClick,
    },
  ];

  return <FAB actions={actions} className={className} size={size} />;
}