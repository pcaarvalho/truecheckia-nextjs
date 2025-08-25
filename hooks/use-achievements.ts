'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_analysis',
    title: 'First Steps',
    description: 'Complete your first AI analysis',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'high_ai_detector',
    title: 'AI Detective',
    description: 'Find content with 90%+ AI probability',
    icon: '🕵️',
    unlocked: false
  },
  {
    id: 'analysis_streak_5',
    title: 'Getting Warmed Up',
    description: 'Complete 5 analyses',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'analysis_streak_25',
    title: 'AI Hunter',
    description: 'Complete 25 analyses',
    icon: '🏹',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete analysis in under 3 seconds',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'word_master',
    title: 'Word Master',
    description: 'Analyze text with 1000+ words',
    icon: '📚',
    unlocked: false
  },
  {
    id: 'multilingual',
    title: 'Multilingual',
    description: 'Analyze content in both Portuguese and English',
    icon: '🌍',
    unlocked: false
  }
]

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([])

  // Load achievements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('truecheckia_achievements')
    if (saved) {
      try {
        const savedAchievements = JSON.parse(saved)
        setAchievements(savedAchievements)
      } catch (error) {
        console.warn('Failed to parse saved achievements:', error)
      }
    }
  }, [])

  // Save achievements to localStorage
  useEffect(() => {
    localStorage.setItem('truecheckia_achievements', JSON.stringify(achievements))
  }, [achievements])

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          const unlockedAchievement = { ...achievement, unlocked: true }
          
          // Show celebration toast
          toast.success(
            `🏆 Achievement Unlocked: ${achievement.title}!`,
            {
              description: achievement.description,
              duration: 5000
            }
          )
          
          // Add to new unlocks for confetti
          setNewUnlocks(current => [...current, unlockedAchievement])
          
          return unlockedAchievement
        }
        return achievement
      })
      
      return updated
    })
  }, [])

  const updateProgress = useCallback((achievementId: string, progress: number) => {
    setAchievements(prev => 
      prev.map(achievement => {
        if (achievement.id === achievementId && achievement.maxProgress) {
          const updatedProgress = Math.min(progress, achievement.maxProgress)
          const shouldUnlock = updatedProgress >= achievement.maxProgress && !achievement.unlocked
          
          if (shouldUnlock) {
            unlockAchievement(achievementId)
          }
          
          return {
            ...achievement,
            progress: updatedProgress
          }
        }
        return achievement
      })
    )
  }, [unlockAchievement])

  const checkAnalysisAchievements = useCallback((analysisData: {
    isFirst: boolean
    aiScore: number
    processingTime: number
    wordCount: number
    language: string
    totalAnalyses: number
  }) => {
    const { isFirst, aiScore, processingTime, wordCount, language, totalAnalyses } = analysisData

    // First analysis
    if (isFirst) {
      unlockAchievement('first_analysis')
    }

    // High AI detection
    if (aiScore >= 90) {
      unlockAchievement('high_ai_detector')
    }

    // Speed demon (processing time in milliseconds)
    if (processingTime < 3000) {
      unlockAchievement('speed_demon')
    }

    // Word master
    if (wordCount >= 1000) {
      unlockAchievement('word_master')
    }

    // Analysis streaks
    updateProgress('analysis_streak_5', totalAnalyses)
    updateProgress('analysis_streak_25', totalAnalyses)

    // Check multilingual (simplified - could be more sophisticated)
    const hasAnalyzedBothLanguages = localStorage.getItem('truecheckia_languages_used')
    if (hasAnalyzedBothLanguages) {
      const languages = JSON.parse(hasAnalyzedBothLanguages)
      if (languages.includes('pt') && languages.includes('en')) {
        unlockAchievement('multilingual')
      }
    } else {
      localStorage.setItem('truecheckia_languages_used', JSON.stringify([language]))
    }
  }, [unlockAchievement, updateProgress])

  const clearNewUnlocks = useCallback(() => {
    setNewUnlocks([])
  }, [])

  const resetAchievements = () => {
    setAchievements(ACHIEVEMENTS)
    localStorage.removeItem('truecheckia_achievements')
    localStorage.removeItem('truecheckia_languages_used')
  }

  const getUnlockedCount = () => {
    return achievements.filter(a => a.unlocked).length
  }

  const getTotalCount = () => {
    return achievements.length
  }

  const getCompletionPercentage = () => {
    return Math.round((getUnlockedCount() / getTotalCount()) * 100)
  }

  return {
    achievements,
    newUnlocks,
    unlockAchievement,
    updateProgress,
    checkAnalysisAchievements,
    clearNewUnlocks,
    resetAchievements,
    getUnlockedCount,
    getTotalCount,
    getCompletionPercentage
  }
}