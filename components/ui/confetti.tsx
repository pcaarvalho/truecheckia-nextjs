'use client'

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
  duration?: number
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  delay: number
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
]

export const Confetti = ({ active, onComplete, duration = 3000 }: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = []
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          delay: Math.random() * 1000
        })
      }
      setPieces(newPieces)

      // Clear after duration
      const timeout = setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [active, duration, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              scale: 0
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: piece.rotation + 720,
              scale: 1
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: 3,
              delay: piece.delay / 1000,
              ease: "easeIn"
            }}
            className="absolute rounded-full"
            style={{
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Sparkle effect component
interface SparkleProps {
  children: React.ReactNode
  className?: string
}

export const Sparkle = ({ children, className }: SparkleProps) => {
  const [sparkles, setSparkles] = useState<{ id: number; top: string; left: string }[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const sparkle = {
        id: Math.random(),
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`
      }
      setSparkles(prev => [...prev, sparkle])
      
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== sparkle.id))
      }, 1000)
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {children}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none animate-magic-sparkle"
          style={{ top: sparkle.top, left: sparkle.left }}
        >
          ✨
        </div>
      ))}
    </div>
  )
}

// Magic button with special effects
interface MagicButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'rainbow' | 'glow'
  className?: string
  disabled?: boolean
}

export const MagicButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false 
}: MagicButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)

  const getVariantClasses = () => {
    switch (variant) {
      case 'rainbow':
        return 'btn-magic text-white font-bold'
      case 'glow':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white hover-glow'
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover-lift'
    }
  }

  return (
    <motion.button
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${getVariantClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <motion.div
        animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.button>
  )
}

// Floating elements for background
export const FloatingElements = () => {
  const elements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 10 + 10}s`
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 animate-float blur-xl"
          style={{
            width: element.size,
            height: element.size,
            left: element.left,
            top: `${Math.random() * 100}%`,
            animationDelay: element.animationDelay,
            animationDuration: element.duration,
          }}
        />
      ))}
    </div>
  )
}