'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { loadingMessages } from '@/lib/animations'

interface LoadingMessagesProps {
  isLoading: boolean
  className?: string
}

export function LoadingMessages({ isLoading, className = "" }: LoadingMessagesProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => 
        (prev + 1) % loadingMessages.length
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className={`text-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="text-sm text-gray-600 font-medium"
        >
          {loadingMessages[currentMessageIndex]}
        </motion.div>
      </AnimatePresence>
      
      <motion.div
        className="flex justify-center mt-3 space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-purple-600 rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}