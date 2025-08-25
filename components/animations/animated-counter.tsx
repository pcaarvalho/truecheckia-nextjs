'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
  onComplete?: () => void
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 2, 
  className = "",
  suffix = "",
  prefix = "",
  onComplete
}: AnimatedCounterProps) {
  const count = useMotionValue(from)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onComplete
    })

    return controls.stop
  }, [count, to, duration, onComplete])

  return (
    <motion.span 
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.1
      }}
    >
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  )
}