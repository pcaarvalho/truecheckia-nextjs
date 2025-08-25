'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Sparkles, Zap, Heart, Star } from 'lucide-react';

import { cn } from '@/lib/utils';

const delightfulButtonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden group',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 active:scale-95',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 active:scale-95',
        outline:
          'border-2 border-blue-200 bg-white/80 backdrop-blur shadow-md hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg active:scale-95',
        secondary:
          'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 shadow-md hover:shadow-lg hover:from-gray-300 hover:to-gray-400 active:scale-95',
        ghost: 
          'hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95',
        link: 
          'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 active:scale-95',
        magnetic:
          'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-2xl active:scale-95',
        sparkle:
          'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl active:scale-95',
        success:
          'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl active:scale-95',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
        xl: 'h-14 rounded-xl px-10 text-lg',
      },
      effect: {
        none: '',
        glow: 'hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]',
        bounce: 'hover:animate-bounce',
        pulse: 'hover:animate-pulse',
        wiggle: '',
        magnetic: '',
        ripple: '',
        confetti: '',
        sparkle: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      effect: 'none',
    },
  }
);

export interface DelightfulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof delightfulButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
  showConfetti?: boolean;
  magneticStrength?: number;
  rippleColor?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// Magnetic Mouse Follow Effect
function useMagneticEffect(
  ref: React.RefObject<HTMLElement>,
  strength: number = 0.3,
  enabled: boolean = false
) {
  React.useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0px, 0px) scale(1)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, enabled]);
}

// Ripple Effect Component
function RippleEffect({ color = 'rgba(255, 255, 255, 0.6)' }: { color?: string }) {
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  return (
    <>
      <div className="absolute inset-0" onClick={addRipple} />
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ 
            width: 300, 
            height: 300, 
            opacity: 0,
            x: -150,
            y: -150,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

// Confetti Burst Effect
function ConfettiBurst({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 4],
                width: 4,
                height: 4,
                borderRadius: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * 30) * Math.PI / 180) * 50,
                y: Math.sin((i * 30) * Math.PI / 180) * 50,
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: i * 0.02,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <motion.div
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// Success Checkmark Animation
function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-4 h-4"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      </svg>
    </motion.div>
  );
}

// Floating Sparkles Effect
function FloatingSparkles() {
  const sparkles = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${20 + sparkle.id * 30}%`,
            top: `${20 + sparkle.id * 20}%`,
          }}
          animate={{
            y: [-5, -15, -5],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-3 h-3 text-yellow-300" />
        </motion.div>
      ))}
    </div>
  );
}

const DelightfulButton = React.forwardRef<HTMLButtonElement, DelightfulButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    effect,
    asChild = false, 
    loading = false,
    success = false,
    showConfetti = false,
    magneticStrength = 0.3,
    rippleColor,
    icon,
    endIcon,
    children,
    onClick,
    onDrag,
    onDragEnd,
    onDragStart,
    onAnimationStart,
    ...props 
  }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [isClicked, setIsClicked] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Combine refs
    React.useImperativeHandle(ref, () => buttonRef.current!);

    // Magnetic effect
    useMagneticEffect(
      buttonRef, 
      magneticStrength, 
      effect === 'magnetic' && !loading && !props.disabled
    );

    // Handle success state
    React.useEffect(() => {
      if (success) {
        setShowSuccess(true);
        const timer = setTimeout(() => setShowSuccess(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [success]);

    // Wiggle animation for specific effects
    const wiggleAnimation = effect === 'wiggle' ? {
      animate: { rotate: [0, -3, 3, -3, 0] },
      transition: { duration: 0.5 }
    } : {};

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || props.disabled) return;
      
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
      
      onClick?.(e);
    };

    const Comp = asChild ? Slot : motion.button;

    return (
      <Comp
        ref={buttonRef}
        className={cn(delightfulButtonVariants({ variant, size, effect, className }))}
        onClick={handleClick}
        disabled={loading || props.disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...wiggleAnimation}
        type={props.type}
        form={props.form}
        name={props.name}
        value={props.value}
      >
        {/* Background Effects */}
        {effect === 'sparkle' && <FloatingSparkles />}
        
        {/* Ripple Effect */}
        {effect === 'ripple' && <RippleEffect color={rippleColor} />}
        
        {/* Confetti Effect */}
        <ConfettiBurst isVisible={showConfetti || isClicked} />
        
        {/* Glow Effect */}
        {effect === 'glow' && (
          <motion.div
            className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Button Content */}
        <span className="relative z-10 flex items-center space-x-2">
          {/* Loading State */}
          {loading && <LoadingSpinner />}
          
          {/* Success State */}
          {showSuccess && <SuccessCheckmark />}
          
          {/* Icon */}
          {!loading && !showSuccess && icon && (
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.span>
          )}
          
          {/* Text Content */}
          {!loading && !showSuccess && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: loading ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.span>
          )}
          
          {/* Success Text */}
          {showSuccess && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              Sucesso!
            </motion.span>
          )}
          
          {/* End Icon */}
          {!loading && !showSuccess && endIcon && (
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, x: 2 }}
              transition={{ duration: 0.2 }}
            >
              {endIcon}
            </motion.span>
          )}
        </span>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"
          initial={false}
        />
      </Comp>
    );
  }
);

DelightfulButton.displayName = 'DelightfulButton';

export { DelightfulButton, delightfulButtonVariants };

// Preset button variants for common use cases
export const MagneticButton = React.forwardRef<HTMLButtonElement, DelightfulButtonProps>(
  (props, ref) => (
    <DelightfulButton 
      ref={ref} 
      variant="magnetic" 
      effect="magnetic" 
      {...props} 
    />
  )
);

export const SparkleButton = React.forwardRef<HTMLButtonElement, DelightfulButtonProps>(
  (props, ref) => (
    <DelightfulButton 
      ref={ref} 
      variant="sparkle" 
      effect="sparkle" 
      {...props} 
    />
  )
);

export const SuccessButton = React.forwardRef<HTMLButtonElement, DelightfulButtonProps>(
  (props, ref) => (
    <DelightfulButton 
      ref={ref} 
      variant="success" 
      effect="confetti" 
      showConfetti 
      {...props} 
    />
  )
);

export const GlowButton = React.forwardRef<HTMLButtonElement, DelightfulButtonProps>(
  (props, ref) => (
    <DelightfulButton 
      ref={ref} 
      variant="default" 
      effect="glow" 
      {...props} 
    />
  )
);

MagneticButton.displayName = 'MagneticButton';
SparkleButton.displayName = 'SparkleButton';
SuccessButton.displayName = 'SuccessButton';
GlowButton.displayName = 'GlowButton';