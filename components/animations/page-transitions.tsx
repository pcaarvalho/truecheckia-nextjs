'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip' | 'blur' | 'slide-up';
  duration?: number;
  delay?: number;
}

// Fade transition
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Slide transition
const slideVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 }
};

// Slide up transition
const slideUpVariants = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -50, opacity: 0 }
};

// Scale transition
const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.2, opacity: 0 }
};

// Rotate transition
const rotateVariants = {
  initial: { rotate: -180, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 }
};

// Flip transition
const flipVariants = {
  initial: { rotateY: -90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 }
};

// Blur transition
const blurVariants = {
  initial: { filter: 'blur(10px)', opacity: 0 },
  animate: { filter: 'blur(0px)', opacity: 1 },
  exit: { filter: 'blur(10px)', opacity: 0 }
};

// Main Page Transition Component
export default function PageTransition({
  children,
  type = 'fade',
  duration = 0.5,
  delay = 0
}: PageTransitionProps) {
  const getVariants = () => {
    switch (type) {
      case 'slide':
        return slideVariants;
      case 'slide-up':
        return slideUpVariants;
      case 'scale':
        return scaleVariants;
      case 'rotate':
        return rotateVariants;
      case 'flip':
        return flipVariants;
      case 'blur':
        return blurVariants;
      case 'fade':
      default:
        return fadeVariants;
    }
  };

  const transition = {
    duration,
    delay,
    ease: 'easeInOut'
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

// Staggered Children Animation
export function StaggeredContainer({
  children,
  staggerDelay = 0.1,
  duration = 0.5
}: {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
}) {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration, ease: 'easeOut' }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { duration: duration / 2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}

// Hero Section Animation
export function HeroAnimation({ children }: { children: ReactNode }) {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="relative"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Card Grid Animation
export function CardGridAnimation({ 
  children, 
  columns = 3 
}: { 
  children: ReactNode; 
  columns?: number; 
}) {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    initial: { 
      y: 50, 
      opacity: 0,
      scale: 0.9
    },
    animate: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`grid grid-cols-1 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns} gap-6`}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={cardVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={cardVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}

// List Animation
export function ListAnimation({ 
  children,
  direction = 'up' 
}: { 
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'down':
        return { y: -20 };
      case 'left':
        return { x: 20 };
      case 'right':
        return { x: -20 };
      case 'up':
      default:
        return { y: 20 };
    }
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { 
      ...getInitialPosition(),
      opacity: 0
    },
    animate: { 
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>
      }
    </motion.div>
  );
}

// Modal/Dialog Animation
export function ModalAnimation({ 
  children, 
  isOpen 
}: { 
  children: ReactNode; 
  isOpen: boolean; 
}) {
  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    initial: { 
      scale: 0.8, 
      opacity: 0,
      y: 50
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          transition={{ duration: 0.3 }}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-lg max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Scroll Animation Trigger
export function ScrollAnimation({ 
  children,
  threshold = 0.1,
  triggerOnce = true
}: { 
  children: ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
}) {
  const variants = {
    hidden: { 
      y: 30, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: triggerOnce, amount: threshold }}
    >
      {children}
    </motion.div>
  );
}

// Navigation Animation
export function NavAnimation({ children }: { children: ReactNode }) {
  const variants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

// Loading State Animation
export function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        
        {/* Pulsing center */}
        <motion.div
          className="absolute inset-4 bg-blue-600 rounded-full"
          animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

// Error State Animation
export function ErrorAnimation({ children }: { children: ReactNode }) {
  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className="text-center"
    >
      <motion.div
        animate={{ 
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 0.5, delay: 0.5 }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}