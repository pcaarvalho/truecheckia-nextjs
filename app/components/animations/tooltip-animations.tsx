'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  offset?: number;
  animation?: 'fade' | 'scale' | 'slide' | 'bounce' | 'flip';
  theme?: 'dark' | 'light' | 'colorful' | 'minimal';
  maxWidth?: number;
  disabled?: boolean;
  trigger?: 'hover' | 'click' | 'focus';
}

// Position calculations
function getTooltipPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  position: string,
  offset: number
) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  
  let x = 0;
  let y = 0;

  switch (position) {
    case 'top':
      x = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.top + scrollY - tooltipRect.height - offset;
      break;
    case 'bottom':
      x = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.bottom + scrollY + offset;
      break;
    case 'left':
      x = triggerRect.left + scrollX - tooltipRect.width - offset;
      y = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
      break;
    case 'right':
      x = triggerRect.right + scrollX + offset;
      y = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
      break;
  }

  // Keep tooltip within viewport
  const padding = 8;
  x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
  y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

  return { x, y };
}

// Animation variants
const tooltipVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  slide: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  },
  flip: {
    initial: { opacity: 0, rotateX: -90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 }
  }
};

// Theme styles
const themes = {
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    arrow: 'border-gray-900'
  },
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    arrow: 'border-white'
  },
  colorful: {
    bg: 'bg-gradient-to-r from-purple-600 to-blue-600',
    text: 'text-white',
    border: 'border-transparent',
    arrow: 'border-purple-600'
  },
  minimal: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    arrow: 'border-gray-100'
  }
};

// Arrow component
function TooltipArrow({ 
  position, 
  theme 
}: { 
  position: string; 
  theme: keyof typeof themes; 
}) {
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  };

  const arrowSizes = {
    top: 'border-l-4 border-r-4 border-t-4',
    bottom: 'border-l-4 border-r-4 border-b-4',
    left: 'border-t-4 border-b-4 border-l-4',
    right: 'border-t-4 border-b-4 border-r-4'
  };

  return (
    <div
      className={`absolute w-0 h-0 ${arrowClasses[position as keyof typeof arrowClasses]} ${arrowSizes[position as keyof typeof arrowSizes]} ${themes[theme].arrow}`}
    />
  );
}

// Main tooltip component
export default function AnimatedTooltip({
  children,
  content,
  position = 'top',
  delay = 500,
  offset = 8,
  animation = 'fade',
  theme = 'dark',
  maxWidth = 200,
  disabled = false,
  trigger = 'hover'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      const pos = getTooltipPosition(triggerRect, tooltipRect, position, offset);
      setTooltipPosition(pos);
    }
  }, [isVisible, position, offset]);

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleTrigger = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const triggerProps = {
    onMouseEnter: trigger === 'hover' ? showTooltip : undefined,
    onMouseLeave: trigger === 'hover' ? hideTooltip : undefined,
    onFocus: trigger === 'focus' ? showTooltip : undefined,
    onBlur: trigger === 'focus' ? hideTooltip : undefined,
    onClick: trigger === 'click' ? handleTrigger : undefined,
  };

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && typeof document !== 'undefined' && (
        <motion.div
          ref={tooltipRef}
          className={`fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg border ${themes[theme].bg} ${themes[theme].text} ${themes[theme].border}`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: maxWidth,
            pointerEvents: 'none'
          }}
          variants={tooltipVariants[animation]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {content}
          <TooltipArrow position={position} theme={theme} />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div ref={triggerRef} className="inline-block" {...triggerProps}>
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Interactive tooltip with rich content
export function InteractiveTooltip({
  children,
  title,
  description,
  action,
  onAction,
  position = 'top',
  delay = 300
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}) {
  const content = (
    <div className="space-y-2 max-w-xs">
      <h4 className="font-semibold text-white">{title}</h4>
      {description && (
        <p className="text-sm text-gray-300">{description}</p>
      )}
      {action && onAction && (
        <motion.button
          className="text-xs bg-white text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          onClick={onAction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action}
        </motion.button>
      )}
    </div>
  );

  return (
    <AnimatedTooltip
      content={content}
      position={position}
      delay={delay}
      animation="scale"
      theme="dark"
      maxWidth={300}
      trigger="hover"
    >
      {children}
    </AnimatedTooltip>
  );
}

// Progress tooltip
export function ProgressTooltip({
  children,
  progress,
  total,
  label,
  position = 'top'
}: {
  children: React.ReactNode;
  progress: number;
  total: number;
  label?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const percentage = Math.round((progress / total) * 100);
  
  const content = (
    <div className="space-y-2 min-w-32">
      {label && <div className="text-xs font-medium text-white">{label}</div>}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300">{progress}/{total}</span>
        <span className="font-medium text-white">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <motion.div
          className="bg-blue-500 h-1.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );

  return (
    <AnimatedTooltip
      content={content}
      position={position}
      animation="slide"
      theme="dark"
      maxWidth={200}
    >
      {children}
    </AnimatedTooltip>
  );
}

// Floating tooltip with custom positioning
export function FloatingTooltip({
  children,
  content,
  isVisible,
  x,
  y,
  animation = 'fade'
}: {
  children?: React.ReactNode;
  content: React.ReactNode;
  isVisible: boolean;
  x: number;
  y: number;
  animation?: 'fade' | 'scale' | 'slide' | 'bounce';
}) {
  const tooltipContent = (
    <AnimatePresence>
      {isVisible && typeof document !== 'undefined' && (
        <motion.div
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 pointer-events-none"
          style={{ left: x, top: y }}
          variants={tooltipVariants[animation]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {children}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Multi-step tooltip for tutorials
export function TutorialTooltip({
  children,
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  position = 'bottom'
}: {
  children: React.ReactNode;
  steps: { title: string; content: string }[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const step = steps[currentStep];
  
  const content = (
    <div className="space-y-3 max-w-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white">{step.title}</h4>
        <span className="text-xs text-gray-400">
          {currentStep + 1}/{steps.length}
        </span>
      </div>
      
      <p className="text-sm text-gray-300">{step.content}</p>
      
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onSkip}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Pular tutorial
        </button>
        
        <div className="flex space-x-2">
          {currentStep > 0 && (
            <motion.button
              onClick={onPrev}
              className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Anterior
            </motion.button>
          )}
          
          <motion.button
            onClick={onNext}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
          </motion.button>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="flex space-x-1">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 rounded-full ${
              index <= currentStep ? 'bg-blue-500' : 'bg-gray-600'
            }`}
            style={{ flex: 1 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <AnimatedTooltip
      content={content}
      position={position}
      animation="bounce"
      theme="dark"
      maxWidth={400}
      trigger="hover"
      delay={0}
    >
      {children}
    </AnimatedTooltip>
  );
}