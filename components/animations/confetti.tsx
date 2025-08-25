'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { confettiVariants } from '@/lib/animations'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
  colors?: string[]
  particleCount?: number
}

const defaultColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
  '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'
]

export function Confetti({ 
  trigger, 
  onComplete, 
  colors = defaultColors,
  particleCount = 50 
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    color: string
    x: number
    size: number
    delay: number
  }>>([])

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * window.innerWidth,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5
      }))
      
      setParticles(newParticles)
      
      // Clear particles after animation
      setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 2500)
    }
  }, [trigger, colors, particleCount, onComplete])

  if (!trigger || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            left: particle.x,
            width: particle.size,
            height: particle.size,
            top: '100vh'
          }}
          variants={confettiVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 2,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: particle.delay
          }}
        />
      ))}
    </div>
  )
}