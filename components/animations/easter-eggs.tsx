'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { rainbowMode } from '@/lib/animations'
import { toast } from 'sonner'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

export function EasterEggs() {
  const [sequence, setSequence] = useState<string[]>([])
  const [rainbowActive, setRainbowActive] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)

  // Konami Code detection
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      setSequence(prev => {
        const newSequence = [...prev, event.code].slice(-KONAMI_CODE.length)
        
        if (JSON.stringify(newSequence) === JSON.stringify(KONAMI_CODE)) {
          triggerKonamiEasterEgg()
          return []
        }
        
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Logo click counter reset
  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000)
      return () => clearTimeout(timer)
    }
  }, [logoClickCount])

  const triggerKonamiEasterEgg = () => {
    setRainbowActive(true)
    toast.success('🎉 Konami Code Activated!', {
      description: 'Rainbow mode enabled for 10 seconds!',
      duration: 3000
    })
    
    setTimeout(() => {
      setRainbowActive(false)
    }, 10000)
  }

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1
    setLogoClickCount(newCount)
    
    if (newCount === 5) {
      setRainbowActive(true)
      toast.success('🌈 Logo Master!', {
        description: 'You found the rainbow secret!',
        duration: 3000
      })
      
      setTimeout(() => {
        setRainbowActive(false)
        setLogoClickCount(0)
      }, 5000)
    }
  }

  return (
    <>
      {/* Invisible overlay for global easter eggs */}
      <div 
        className="fixed inset-0 pointer-events-none z-40"
        style={{ 
          ...(rainbowActive && {
            background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
            backgroundSize: '400% 400%',
            animation: 'rainbow 2s ease infinite',
            opacity: 0.1
          })
        }}
      />
      
      {/* Rainbow mode indicator */}
      {rainbowActive && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🌈
            </motion.div>
            <span className="text-sm font-medium">Rainbow Mode!</span>
          </div>
        </motion.div>
      )}
      
      {/* Logo click detector */}
      <style jsx global>{`
        .logo-clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .logo-clickable:hover {
          transform: scale(1.05);
        }
        
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {/* Inject logo click handler */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('click', function(e) {
              if (e.target.closest('[data-logo]')) {
                window.dispatchEvent(new CustomEvent('logoClick'));
              }
            });
          `
        }}
      />
    </>
  )
}

// Hook to use easter eggs in components
export function useEasterEggs() {
  const [isRainbowMode, setIsRainbowMode] = useState(false)
  
  useEffect(() => {
    const handleLogoClick = () => {
      // This would be handled by the EasterEggs component
    }
    
    window.addEventListener('logoClick', handleLogoClick)
    return () => window.removeEventListener('logoClick', handleLogoClick)
  }, [])
  
  return {
    isRainbowMode
  }
}