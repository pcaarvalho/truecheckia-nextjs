'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAchievements } from '@/hooks/use-achievements'
import { AchievementBadge } from '@/components/animations/achievement-badge'
import { Confetti } from '@/components/animations/confetti'
import { staggerContainer, staggerItem } from '@/lib/animations'

export function AchievementsDemo() {
  const {
    achievements,
    newUnlocks,
    checkAnalysisAchievements,
    clearNewUnlocks,
    resetAchievements,
    getUnlockedCount,
    getTotalCount,
    getCompletionPercentage
  } = useAchievements()
  
  const [showConfetti, setShowConfetti] = useState(false)

  const simulateFirstAnalysis = () => {
    checkAnalysisAchievements({
      isFirst: true,
      aiScore: 65,
      processingTime: 2500,
      wordCount: 150,
      language: 'pt',
      totalAnalyses: 1
    })
    setShowConfetti(true)
  }

  const simulateHighAIDetection = () => {
    checkAnalysisAchievements({
      isFirst: false,
      aiScore: 95,
      processingTime: 1800,
      wordCount: 500,
      language: 'en',
      totalAnalyses: 3
    })
    setShowConfetti(true)
  }

  const simulateSpeedAnalysis = () => {
    checkAnalysisAchievements({
      isFirst: false,
      aiScore: 45,
      processingTime: 2800,
      wordCount: 1200,
      language: 'pt',
      totalAnalyses: 5
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
      <Confetti 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />
      
      <AchievementBadge 
        achievements={newUnlocks}
        onClose={clearNewUnlocks}
      />
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TrueCheckIA Achievements Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Experience the delightful animations and micro-interactions!
          </p>
          
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {getUnlockedCount()} / {getTotalCount()} Unlocked
            </Badge>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${getCompletionPercentage()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
          </div>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card animated whileHover={{ scale: 1.02, y: -4 }}>
            <CardHeader>
              <CardTitle>Simulate Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={simulateFirstAnalysis}
                className="w-full"
                variant="default"
              >
                🎯 Trigger First Analysis
              </Button>
              
              <Button 
                onClick={simulateHighAIDetection}
                className="w-full"
                variant="secondary"
              >
                🕵️ Trigger High AI Detection
              </Button>
              
              <Button 
                onClick={simulateSpeedAnalysis}
                className="w-full"
                variant="outline"
              >
                ⚡ Trigger Speed + Word Master
              </Button>
              
              <Button 
                onClick={resetAchievements}
                className="w-full"
                variant="destructive"
              >
                🔄 Reset All Achievements
              </Button>
            </CardContent>
          </Card>

          <Card animated whileHover={{ scale: 1.02, y: -4 }}>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <motion.div
                  className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {getCompletionPercentage()}%
                </motion.div>
                <p className="text-gray-600 mb-4">Completion Rate</p>
                <Badge 
                  variant={getCompletionPercentage() === 100 ? "default" : "secondary"}
                  className="text-sm"
                >
                  {getCompletionPercentage() === 100 ? "Achievement Master!" : "Keep Going!"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {achievements.map((achievement) => (
            <motion.div key={achievement.id} variants={staggerItem}>
              <Card 
                animated
                className={`transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                whileHover={achievement.unlocked ? { 
                  scale: 1.05, 
                  rotate: [0, -1, 1, 0],
                  transition: { duration: 0.3 }
                } : { scale: 1.02 }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.div 
                      className="text-3xl"
                      animate={achievement.unlocked ? {
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      {achievement.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h3>
                      <Badge 
                        variant={achievement.unlocked ? "default" : "secondary"}
                        className="text-xs mt-1"
                      >
                        {achievement.unlocked ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%` 
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}