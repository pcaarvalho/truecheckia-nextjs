'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

interface AchievementBadgeProps {
  achievements: Achievement[]
  onClose: () => void
}

export function AchievementBadge({ achievements, onClose }: AchievementBadgeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (achievements.length === 0) {
      setIsVisible(false)
      return
    }

    // Auto-advance through achievements
    if (currentIndex < achievements.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 3000)
      
      return () => clearTimeout(timer)
    } else {
      // Auto-close after showing all achievements
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [currentIndex, achievements.length, onClose])

  if (achievements.length === 0 || !isVisible) return null

  const currentAchievement = achievements[currentIndex]

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 max-w-sm"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-2xl border-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Achievement Unlocked!
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                className="text-3xl"
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut"
                }}
              >
                {currentAchievement.icon}
              </motion.div>
              
              <div className="flex-1">
                <motion.h4 
                  className="font-bold text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentAchievement.title}
                </motion.h4>
                <motion.p 
                  className="text-sm text-white/90"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentAchievement.description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {achievements.length > 1 && (
            <motion.div 
              className="flex justify-center mt-3 space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {achievements.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                  animate={{
                    scale: index === currentIndex ? 1.2 : 1
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 2) * 80}%`
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}