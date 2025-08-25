'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'relative rounded-xl text-card-foreground transition-all duration-300 group',
  {
    variants: {
      variant: {
        default: 'bg-card border shadow-sm hover:shadow-md',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-xl',
        gradient: 'bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-border bg-transparent hover:bg-accent/5',
        elevated: 'bg-card border shadow-lg hover:shadow-2xl transform hover:-translate-y-1',
      },
      animation: {
        none: '',
        hover: 'hover:scale-[1.02]',
        lift: 'hover:-translate-y-2 hover:shadow-2xl',
        glow: 'hover:shadow-lg hover:shadow-primary/25',
      },
    },
    defaultVariants: {
      variant: 'default',
      animation: 'hover',
    },
  }
);

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
};

const ShimmerOverlay = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
    variants={shimmerVariants}
    initial="initial"
    animate="animate"
    transition={{
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 2,
    }}
  />
);

const SkeletonPulse = ({ className }: { className?: string }) => (
  <motion.div
    className={cn('bg-muted rounded animate-pulse', className)}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />
);

export interface CardV2Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean;
  interactive?: boolean;
  gradientBorder?: boolean;
}

const CardV2 = React.forwardRef<HTMLDivElement, CardV2Props>(
  ({ 
    className, 
    variant, 
    animation, 
    loading = false, 
    interactive = false,
    gradientBorder = false,
    children,
    onClick,
    onDrag,
    onDragEnd,
    onDragStart,
    onAnimationStart,
    ...props 
  }, ref) => {
    const cardVariantsMotion = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      hover: {
        y: animation === 'lift' ? -8 : animation === 'hover' ? -2 : 0,
        scale: animation === 'hover' ? 1.02 : 1,
      }
    };

    const CardComponent = interactive ? motion.div : 'div';

    if (loading) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, animation, className }))}
          variants={cardVariantsMotion}
          initial="initial"
          animate="animate"
        >
          <div className="relative overflow-hidden">
            <ShimmerOverlay />
            <div className="p-6 space-y-4">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-full" />
              <SkeletonPulse className="h-3 w-2/3" />
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <CardComponent
        ref={ref}
        className={cn(
          cardVariants({ variant, animation, className }),
          interactive && 'cursor-pointer',
          gradientBorder && 'p-[1px] bg-gradient-to-br from-primary to-secondary'
        )}
        variants={interactive ? cardVariantsMotion : undefined}
        initial={interactive ? "initial" : undefined}
        animate={interactive ? "animate" : undefined}
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        transition={interactive ? { type: "spring", stiffness: 300, damping: 20 } : undefined}
        onClick={onClick}
        {...props}
      >
        {gradientBorder ? (
          <div className="bg-card rounded-[11px] h-full w-full">
            {children}
          </div>
        ) : (
          children
        )}
      </CardComponent>
    );
  }
);
CardV2.displayName = 'CardV2';

const CardV2Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardV2Header.displayName = 'CardV2Header';

const CardV2Title = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <motion.h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
  >
    {children}
  </motion.h3>
));
CardV2Title.displayName = 'CardV2Title';

const CardV2Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <motion.p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
  >
    {children}
  </motion.p>
));
CardV2Description.displayName = 'CardV2Description';

const CardV2Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div 
    ref={ref} 
    className={cn('p-6 pt-0', className)} 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
    {children}
  </motion.div>
));
CardV2Content.displayName = 'CardV2Content';

const CardV2Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    {children}
  </motion.div>
));
CardV2Footer.displayName = 'CardV2Footer';

export { 
  CardV2, 
  CardV2Header, 
  CardV2Footer, 
  CardV2Title, 
  CardV2Description, 
  CardV2Content,
  cardVariants 
};