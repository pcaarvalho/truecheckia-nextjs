// TrueCheckIA Animation Library
// Collection of delightful animations and micro-interactions

import { Variants } from 'framer-motion'

// Page transition animations
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 20, 
    scale: 0.98 
  },
  in: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  out: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.085, 0.68, 0.53]
    }
  }
}

// Stagger animation for dashboard cards
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Button animations
export const buttonHover = {
  scale: 1.05,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
}

export const buttonTap = {
  scale: 0.95,
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 10
  }
}

export const buttonPress = {
  scale: 0.98,
  rotate: 1,
  transition: {
    type: "spring",
    stiffness: 600,
    damping: 15
  }
}

// Card animations
export const cardHover = {
  y: -4,
  scale: 1.02,
  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20
  }
}

export const cardTap = {
  scale: 0.98,
  transition: {
    type: "spring",
    stiffness: 600,
    damping: 15
  }
}

// Loading animations
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const bounceAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const wobbleAnimation = {
  rotate: [0, -3, 3, -3, 0],
  transition: {
    duration: 0.8,
    repeat: Infinity,
    repeatDelay: 3
  }
}

// Success animations
export const successPop: Variants = {
  initial: { 
    scale: 0, 
    rotate: -180 
  },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.2
    }
  }
}

export const confettiVariants: Variants = {
  initial: {
    scale: 0,
    y: 0,
    opacity: 1
  },
  animate: {
    scale: [0, 1, 0.8],
    y: [-100, -200, -300],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Score reveal animation
export const scoreReveal: Variants = {
  initial: { 
    scale: 0.5, 
    opacity: 0,
    rotate: -10
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.3
    }
  }
}

// Typewriter effect
export const typewriterVariants: Variants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  }
}

// Empty state animations
export const emptyStateRobot = {
  rotate: [0, 5, -5, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Input focus animations
export const inputFocus = {
  scale: 1.02,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20
  }
}

// Progress bar animations
export const progressGlow = {
  boxShadow: [
    "0 0 0 rgba(139, 92, 246, 0)",
    "0 0 20px rgba(139, 92, 246, 0.4)",
    "0 0 0 rgba(139, 92, 246, 0)"
  ],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Chart animations
export const chartLineVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: "easeInOut" },
      opacity: { duration: 0.3 }
    }
  }
}

// Loading messages for analysis
export const loadingMessages = [
  "Analisando neurônios artificiais...",
  "Detectando padrões quânticos...",
  "Consultando a matrix...",
  "Decodificando algoritmos...",
  "Processando sinapses digitais...",
  "Calibrando sensores de IA...",
  "Investigando assinaturas digitais...",
  "Escaneando estruturas linguísticas..."
]

// Easter egg animations
export const rainbowMode = {
  background: [
    "linear-gradient(45deg, #ff0000, #ff7f00)",
    "linear-gradient(45deg, #ff7f00, #ffff00)",
    "linear-gradient(45deg, #ffff00, #00ff00)",
    "linear-gradient(45deg, #00ff00, #0000ff)",
    "linear-gradient(45deg, #0000ff, #4b0082)",
    "linear-gradient(45deg, #4b0082, #9400d3)",
    "linear-gradient(45deg, #9400d3, #ff0000)"
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "linear"
  }
}

// Particle animations for celebrations
export const particleFloat = {
  y: [0, -20, 0],
  x: [0, Math.random() * 20 - 10, 0],
  rotate: [0, 360],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
    delay: Math.random() * 2
  }
}

// Utility function to create custom spring animations
export const createSpringAnimation = (stiffness = 300, damping = 20, delay = 0) => ({
  type: "spring",
  stiffness,
  damping,
  delay
})

// Utility function for reduced motion
export const createReducedMotionAnimation = (animation: any) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      ...animation,
      transition: {
        duration: 0.01
      }
    }
  }
  return animation
}