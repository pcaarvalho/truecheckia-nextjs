'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        solid:
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5',
        outline:
          'border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 backdrop-blur-sm',
        ghost: 
          'hover:bg-accent hover:text-accent-foreground backdrop-blur-sm',
        glass:
          'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 hover:shadow-xl transform hover:-translate-y-0.5',
        destructive:
          'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-rose-700 transform hover:-translate-y-0.5',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 backdrop-blur-sm',
        link: 
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 py-2 text-sm',
        sm: 'h-8 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  }
);

export interface ButtonV2Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
}

const RippleEffect = ({ 
  x, 
  y 
}: { 
  x: number; 
  y: number; 
}) => (
  <motion.span
    className="absolute rounded-full bg-white/30"
    style={{
      left: x - 35,
      top: y - 35,
    }}
    initial={{ width: 0, height: 0, opacity: 1 }}
    animate={{ width: 70, height: 70, opacity: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  />
);

const ButtonV2 = React.forwardRef<HTMLButtonElement, ButtonV2Props>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    ripple = true,
    children,
    onClick,
    disabled,
    onDrag,
    onDragEnd,
    onDragStart,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => buttonRef.current!);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const newRipple = {
          id: Date.now(),
          x,
          y,
        };

        setRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }

      onClick?.(event);
    };

    const Comp = asChild ? Slot : motion.button;

    const iconVariants = {
      initial: { scale: 1, rotate: 0 },
      hover: { scale: 1.1, rotate: loading ? 360 : 0 },
      tap: { scale: 0.95 }
    };

    const content = (
      <>
        {/* Background gradient overlay for hover effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />

        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
          ))}
        </AnimatePresence>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          )}
          
          {Icon && !loading && iconPosition === 'left' && (
            <motion.div variants={iconVariants}>
              <Icon className="h-4 w-4" />
            </motion.div>
          )}
          
          {children && (
            <motion.span
              animate={{
                opacity: loading ? 0.7 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.span>
          )}
          
          {Icon && !loading && iconPosition === 'right' && (
            <motion.div variants={iconVariants}>
              <Icon className="h-4 w-4" />
            </motion.div>
          )}
        </span>
      </>
    );

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          onClick={handleClick}
          {...props}
        >
          {content}
        </Slot>
      );
    }

    return (
      <Comp
        ref={buttonRef}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        type={props.type}
        form={props.form}
        name={props.name}
        value={props.value}
      >
        {content}
      </Comp>
    );
  }
);

ButtonV2.displayName = 'ButtonV2';

export { ButtonV2, buttonVariants };