'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Star, 
  Sparkles, 
  Zap, 
  Trophy, 
  Crown,
  Rocket,
  Cat,
  Coffee,
  Pizza,
  Gamepad2,
  Music
} from 'lucide-react';

interface EasterEggProps {
  onActivate?: () => void;
  disabled?: boolean;
}

// Konami Code Sequence: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

// Click sequences for various easter eggs
const CLICK_PATTERNS = {
  triangle: [1, 3, 2], // Top, bottom-right, bottom-left (triangle pattern)
  square: [1, 2, 4, 3], // Clockwise square
  heart: [2, 1, 4, 3, 2], // Heart shape pattern
};

// Special dates for seasonal easter eggs
const SPECIAL_DATES = {
  christmas: { month: 12, start: 20, end: 31 },
  newYear: { month: 1, start: 1, end: 7 },
  valentine: { month: 2, start: 10, end: 20 },
  halloween: { month: 10, start: 25, end: 31 },
  easter: { month: 4, start: 1, end: 15 }, // Approximate
};

// Konami Code Easter Egg
export function KonamiEasterEgg({ onActivate, disabled = false }: EasterEggProps) {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      setInputSequence(prev => {
        const newSequence = [...prev, event.code].slice(-KONAMI_CODE.length);
        
        if (newSequence.length === KONAMI_CODE.length && 
            newSequence.every((key, index) => key === KONAMI_CODE[index])) {
          setIsActivated(true);
          onActivate?.();
          
          // Reset after activation
          setTimeout(() => {
            setIsActivated(false);
            setInputSequence([]);
          }, 5000);
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActivate, disabled]);

  return (
    <AnimatePresence>
      {isActivated && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Rainbow Particles */}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                backgroundColor: `hsl(${i * 12}, 70%, 60%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: 3,
                ease: "easeOut",
                delay: i * 0.1,
              }}
            />
          ))}
          
          {/* Secret Message */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-yellow-400">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-300" />
                <div>
                  <h3 className="text-xl font-bold">Código Konami!</h3>
                  <p className="text-sm opacity-90">Você descobriu nosso segredo!</p>
                </div>
                <Crown className="w-8 h-8 text-yellow-300" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Click Pattern Easter Egg
export function ClickPatternEasterEgg({ onActivate, disabled = false }: EasterEggProps) {
  const [clickSequence, setClickSequence] = useState<number[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  const [corners, setCornersClickable] = useState(false);

  // Enable corner detection on triple click
  useEffect(() => {
    if (disabled) return;

    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    const handleClick = () => {
      clickCount++;
      clearTimeout(clickTimer);
      
      clickTimer = setTimeout(() => {
        if (clickCount >= 3) {
          setCornersClickable(true);
          setTimeout(() => setCornersClickable(false), 10000); // 10 seconds to complete pattern
        }
        clickCount = 0;
      }, 500);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      clearTimeout(clickTimer);
    };
  }, [disabled]);

  const handleCornerClick = useCallback((cornerIndex: number) => {
    if (!corners) return;

    setClickSequence(prev => {
      const newSequence = [...prev, cornerIndex];
      
      // Check for heart pattern
      if (newSequence.length === CLICK_PATTERNS.heart.length) {
        if (newSequence.every((click, index) => click === CLICK_PATTERNS.heart[index])) {
          setIsActivated(true);
          onActivate?.();
          
          setTimeout(() => {
            setIsActivated(false);
            setClickSequence([]);
            setCornersClickable(false);
          }, 3000);
        } else {
          setClickSequence([]);
        }
      }
      
      return newSequence;
    });
  }, [corners, onActivate]);

  return (
    <>
      {/* Corner Click Areas */}
      {corners && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[1, 2, 3, 4].map((corner) => (
            <motion.div
              key={corner}
              className={`absolute w-16 h-16 pointer-events-auto cursor-pointer ${
                corner === 1 ? 'top-4 left-1/2 transform -translate-x-1/2' :
                corner === 2 ? 'bottom-4 left-4' :
                corner === 3 ? 'bottom-4 right-4' :
                'top-1/2 right-4 transform -translate-y-1/2'
              }`}
              onClick={() => handleCornerClick(corner)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              whileHover={{ opacity: 0.6, scale: 1.1 }}
            >
              <div className="w-full h-full bg-pink-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Heart Explosion */}
      <AnimatePresence>
        {isActivated && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 360],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                  delay: i * 0.1,
                }}
              >
                <Heart className="w-6 h-6 text-pink-500 fill-current" />
              </motion.div>
            ))}
            
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-medium">Muito amor! ❤️</span>
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Long Hover Easter Egg
export function LongHoverEasterEgg({ 
  children, 
  onActivate, 
  hoverDuration = 5000,
  disabled = false 
}: EasterEggProps & { 
  children: React.ReactNode; 
  hoverDuration?: number; 
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (disabled) return;

    let timer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (isHovering) {
      const startTime = Date.now();
      
      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / hoverDuration) * 100, 100);
        setProgress(newProgress);
      }, 50);

      timer = setTimeout(() => {
        setIsActivated(true);
        onActivate?.();
        
        setTimeout(() => {
          setIsActivated(false);
          setProgress(0);
        }, 2000);
      }, hoverDuration);
    } else {
      setProgress(0);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [isHovering, hoverDuration, onActivate, disabled]);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      
      {/* Progress Ring */}
      {isHovering && progress > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="2"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              className="origin-center -rotate-90"
            />
          </svg>
        </motion.div>
      )}

      {/* Secret Tooltip */}
      <AnimatePresence>
        {isActivated && (
          <motion.div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Você tem paciência! 🎉</span>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-purple-600"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Seasonal Easter Eggs
export function SeasonalEasterEgg({ onActivate, disabled = false }: EasterEggProps) {
  const [currentSeason, setCurrentSeason] = useState<string | null>(null);
  const [showSeasonalEffect, setShowSeasonalEffect] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    for (const [season, dates] of Object.entries(SPECIAL_DATES)) {
      if (month === dates.month && day >= dates.start && day <= dates.end) {
        setCurrentSeason(season);
        break;
      }
    }
  }, [disabled]);

  useEffect(() => {
    if (currentSeason && !disabled) {
      // Auto-trigger seasonal effect on page load during special dates
      const timer = setTimeout(() => {
        setShowSeasonalEffect(true);
        onActivate?.();
        
        setTimeout(() => setShowSeasonalEffect(false), 5000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentSeason, onActivate, disabled]);

  const getSeasonalContent = () => {
    switch (currentSeason) {
      case 'christmas':
        return {
          icon: '🎄',
          message: 'Feliz Natal!',
          color: 'from-red-500 to-green-500',
          particles: ['❄️', '🎁', '⭐', '🔔'],
        };
      case 'newYear':
        return {
          icon: '🎊',
          message: 'Feliz Ano Novo!',
          color: 'from-purple-500 to-yellow-500',
          particles: ['🎆', '🎉', '✨', '🥳'],
        };
      case 'valentine':
        return {
          icon: '💝',
          message: 'Feliz Dia dos Namorados!',
          color: 'from-pink-500 to-red-500',
          particles: ['💖', '💕', '🌹', '💘'],
        };
      case 'halloween':
        return {
          icon: '🎃',
          message: 'Feliz Halloween!',
          color: 'from-orange-500 to-purple-500',
          particles: ['👻', '🦇', '🕷️', '🍭'],
        };
      case 'easter':
        return {
          icon: '🐰',
          message: 'Feliz Páscoa!',
          color: 'from-yellow-400 to-pink-400',
          particles: ['🥚', '🐣', '🌸', '🌷'],
        };
      default:
        return null;
    }
  };

  const seasonalContent = getSeasonalContent();

  return (
    <AnimatePresence>
      {showSeasonalEffect && seasonalContent && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Seasonal Particles */}
          {Array.from({ length: 15 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
              }}
              initial={{ y: -50, opacity: 0, rotate: 0 }}
              animate={{
                y: window.innerHeight + 50,
                opacity: [0, 1, 1, 0],
                rotate: 360,
                x: [0, Math.sin(i) * 50],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                ease: "easeOut",
                delay: i * 0.2,
              }}
            >
              {seasonalContent.particles[i % seasonalContent.particles.length]}
            </motion.div>
          ))}
          
          {/* Seasonal Message */}
          <motion.div
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={`bg-gradient-to-r ${seasonalContent.color} text-white px-8 py-4 rounded-2xl shadow-2xl`}>
              <div className="text-4xl mb-2">{seasonalContent.icon}</div>
              <h3 className="text-xl font-bold">{seasonalContent.message}</h3>
              <p className="text-sm opacity-90">Uma surpresa especial para você!</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Easter Eggs Manager
export default function EasterEggs({ disabled = false }: { disabled?: boolean }) {
  const handleEasterEggActivation = useCallback(() => {
    console.log('🥚 Easter egg activated!');
    // You can add analytics tracking here
  }, []);

  return (
    <>
      <KonamiEasterEgg onActivate={handleEasterEggActivation} disabled={disabled} />
      <ClickPatternEasterEgg onActivate={handleEasterEggActivation} disabled={disabled} />
      <SeasonalEasterEgg onActivate={handleEasterEggActivation} disabled={disabled} />
    </>
  );
}

// Fun Tooltips Component
export function FunTooltip({ 
  children, 
  tooltip, 
  delay = 2000,
  disabled = false 
}: {
  children: React.ReactNode;
  tooltip: string;
  delay?: number;
  disabled?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (disabled) return;

    let timer: NodeJS.Timeout;
    
    if (isHovering) {
      timer = setTimeout(() => {
        setShowTooltip(true);
      }, delay);
    } else {
      setShowTooltip(false);
    }

    return () => clearTimeout(timer);
  }, [isHovering, delay, disabled]);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4" />
                <span>{tooltip}</span>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}