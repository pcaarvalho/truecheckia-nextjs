'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { emptyStateRobot } from '@/lib/animations'

interface EmptyStateRobotProps {
  message?: string
  className?: string
}

export function EmptyStateRobot({ 
  message = "Estou entediado... Me dê algo para analisar!",
  className = ""
}: EmptyStateRobotProps) {
  return (
    <motion.div 
      className={`text-center py-12 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        animate={emptyStateRobot}
        className="inline-block mb-4"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
          <Bot className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.p 
          className="text-gray-600 text-lg font-medium mb-2"
          animate={{
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
        
        <motion.div
          className="flex justify-center items-center space-x-2 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="w-2 h-2 bg-indigo-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}