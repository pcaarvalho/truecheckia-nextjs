'use client';

import * as React from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DelightfulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  hoverEffect?: 'tilt' | 'lift' | 'glow' | 'scale' | 'rotate' | 'none';
  clickEffect?: 'ripple' | 'bounce' | 'pulse' | 'none';
  interactive?: boolean;
  glowColor?: string;
  tiltStrength?: number;
  animateOnView?: boolean;
  delay?: number;
  borderGradient?: boolean;
}

// Tilt Effect Hook
function useTiltEffect(strength: number = 10, enabled: boolean = true) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [strength, -strength]);
  const rotateY = useTransform(x, [-100, 100], [-strength, strength]);

  const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }, [x, y, enabled]);

  const handleMouseLeave = React.useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    style: { rotateX, rotateY },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}

// Ripple Effect Component
function RippleEffect({ 
  color = 'rgba(59, 130, 246, 0.3)',
  enabled = true 
}: { 
  color?: string;
  enabled?: boolean;
}) {
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, [enabled]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden rounded-lg" onClick={addRipple} />
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - 2,
              top: ripple.y - 2,
              backgroundColor: color,
            }}
            initial={{ width: 4, height: 4, opacity: 1 }}
            animate={{ 
              width: 200, 
              height: 200, 
              opacity: 0,
              x: -98,
              y: -98,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

// Floating Particles Effect
function FloatingParticles({ count = 3 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    size: Math.random() * 3 + 2,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-blue-400 rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [-10, -30, -10],
            x: [-5, 5, -5],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 2, particle.opacity],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

// Border Gradient Animation
function AnimatedBorder({ color = 'blue' }: { color?: string }) {
  const colors = {
    blue: 'from-blue-500 via-purple-500 to-blue-500',
    purple: 'from-purple-500 via-pink-500 to-purple-500',
    green: 'from-green-500 via-blue-500 to-green-500',
    gold: 'from-yellow-400 via-orange-500 to-yellow-400',
  };

  return (
    <motion.div
      className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colors[color as keyof typeof colors] || colors.blue} opacity-75`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundSize: '200% 200%',
      }}
    />
  );
}

const DelightfulCard = React.forwardRef<HTMLDivElement, DelightfulCardProps>(
  ({
    className,
    children,
    hoverEffect = 'lift',
    clickEffect = 'none',
    interactive = true,
    glowColor = 'rgba(59, 130, 246, 0.2)',
    tiltStrength = 10,
    animateOnView = true,
    delay = 0,
    borderGradient = false,
    onClick,
    onDrag,
    onDragEnd,
    onDragStart,
    onAnimationStart,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isClicked, setIsClicked] = React.useState(false);
    
    const tiltProps = useTiltEffect(tiltStrength, hoverEffect === 'tilt' && interactive);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive) return;
      
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
      
      onClick?.(e);
    };

    const getHoverAnimation = () => {
      if (!interactive) return {};
      
      switch (hoverEffect) {
        case 'lift':
          return {
            whileHover: { 
              y: -8, 
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              transition: { duration: 0.3 }
            }
          };
        case 'glow':
          return {
            whileHover: { 
              boxShadow: `0 0 30px ${glowColor}`,
              transition: { duration: 0.3 }
            }
          };
        case 'scale':
          return {
            whileHover: { 
              scale: 1.03,
              transition: { duration: 0.2 }
            }
          };
        case 'rotate':
          return {
            whileHover: { 
              rotate: 1,
              scale: 1.02,
              transition: { duration: 0.3 }
            }
          };
        default:
          return {};
      }
    };

    const getClickAnimation = () => {
      if (!interactive) return {};
      
      switch (clickEffect) {
        case 'bounce':
          return {
            whileTap: { 
              scale: 0.95,
              transition: { duration: 0.1 }
            }
          };
        case 'pulse':
          return {
            animate: isClicked ? {
              scale: [1, 1.05, 1],
              transition: { duration: 0.3 }
            } : {}
          };
        default:
          return {};
      }
    };

    const cardVariants = {
      hidden: { 
        opacity: 0, 
        y: 20,
        scale: 0.95 
      },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          delay,
          ease: 'easeOut'
        }
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden transition-all duration-300',
          interactive && 'cursor-pointer',
          className
        )}
        variants={animateOnView ? cardVariants : undefined}
        initial={animateOnView ? 'hidden' : undefined}
        animate={animateOnView ? 'visible' : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (hoverEffect === 'tilt' && tiltProps.onMouseLeave) {
            tiltProps.onMouseLeave();
          }
        }}
        onClick={handleClick}
        style={hoverEffect === 'tilt' ? tiltProps.style : undefined}
        onMouseMove={hoverEffect === 'tilt' ? tiltProps.onMouseMove : undefined}
        {...getHoverAnimation()}
        {...getClickAnimation()}
      >
        {/* Animated Border */}
        {borderGradient && isHovered && (
          <div className="absolute inset-0 p-[2px] rounded-lg">
            <AnimatedBorder />
            <div className="w-full h-full bg-white rounded-lg relative z-10">
              {children}
            </div>
          </div>
        )}

        {/* Floating Particles */}
        {hoverEffect === 'glow' && isHovered && <FloatingParticles />}

        {/* Ripple Effect */}
        {clickEffect === 'ripple' && (
          <RippleEffect enabled={interactive} />
        )}

        {/* Gradient Overlay */}
        {hoverEffect === 'glow' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Content */}
        {!borderGradient && (
          <div className="relative z-10">
            {children}
          </div>
        )}

        {/* Shine Effect */}
        {isHovered && hoverEffect === 'lift' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </motion.div>
    );
  }
);

DelightfulCard.displayName = 'DelightfulCard';

// Card Sub-components with micro-interactions
const DelightfulCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
  >
    {children}
  </motion.div>
));
DelightfulCardHeader.displayName = 'DelightfulCardHeader';

const DelightfulCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <motion.h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
    whileHover={{ scale: 1.02 }}
  >
    {children}
  </motion.h3>
));
DelightfulCardTitle.displayName = 'DelightfulCardTitle';

const DelightfulCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <motion.p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    {children}
  </motion.p>
));
DelightfulCardDescription.displayName = 'DelightfulCardDescription';

const DelightfulCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn('p-6 pt-0', className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    {children}
  </motion.div>
));
DelightfulCardContent.displayName = 'DelightfulCardContent';

const DelightfulCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.4 }}
  >
    {children}
  </motion.div>
));
DelightfulCardFooter.displayName = 'DelightfulCardFooter';

export {
  DelightfulCard,
  DelightfulCardHeader,
  DelightfulCardFooter,
  DelightfulCardTitle,
  DelightfulCardDescription,
  DelightfulCardContent,
};

// Preset card variants
export const TiltCard = React.forwardRef<HTMLDivElement, DelightfulCardProps>(
  (props, ref) => (
    <DelightfulCard ref={ref} hoverEffect="tilt" clickEffect="ripple" {...props} />
  )
);

export const GlowCard = React.forwardRef<HTMLDivElement, DelightfulCardProps>(
  (props, ref) => (
    <DelightfulCard ref={ref} hoverEffect="glow" borderGradient {...props} />
  )
);

export const LiftCard = React.forwardRef<HTMLDivElement, DelightfulCardProps>(
  (props, ref) => (
    <DelightfulCard ref={ref} hoverEffect="lift" clickEffect="bounce" {...props} />
  )
);

TiltCard.displayName = 'TiltCard';
GlowCard.displayName = 'GlowCard';
LiftCard.displayName = 'LiftCard';