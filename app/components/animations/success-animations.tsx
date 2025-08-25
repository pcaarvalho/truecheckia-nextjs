'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Star, Sparkles, Zap } from 'lucide-react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

interface SuccessAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
  type?: 'confetti' | 'checkmark' | 'stars' | 'minimal';
  soundEnabled?: boolean;
}

// Confetti Explosion Component
export function ConfettiExplosion({ 
  isVisible, 
  onComplete,
  particleCount = 50 
}: { 
  isVisible: boolean; 
  onComplete?: () => void;
  particleCount?: number;
}) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'][
          Math.floor(Math.random() * 6)
        ],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 6,
          y: -(Math.random() * 8 + 8),
        },
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, particleCount, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
              }}
              initial={{
                x: particle.x,
                y: particle.y,
                rotate: particle.rotation,
                opacity: 1,
              }}
              animate={{
                x: particle.x + particle.velocity.x * 100,
                y: particle.y + particle.velocity.y * 100,
                rotate: particle.rotation + 720,
                opacity: 0,
              }}
              transition={{
                duration: 3,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Bouncing Success Checkmark
export function SuccessCheckmark({ 
  isVisible, 
  onComplete 
}: { 
  isVisible: boolean; 
  onComplete?: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <motion.div
            className="bg-green-500 rounded-full p-4 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.6,
              times: [0, 0.7, 1],
              type: 'spring',
              stiffness: 200,
              damping: 10,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating Stars Animation
export function FloatingStars({ 
  isVisible, 
  onComplete 
}: { 
  isVisible: boolean; 
  onComplete?: () => void;
}) {
  const stars = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute text-yellow-400"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 1, 0],
                opacity: [0, 1, 1, 0],
                rotate: [0, 180, 360],
                y: [-20, -40, -60],
              }}
              transition={{
                duration: 2,
                delay: star.delay,
                ease: 'easeOut',
              }}
              onAnimationComplete={star.id === 0 ? onComplete : undefined}
            >
              <Star className="w-6 h-6 fill-current" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Particle Trail Effect
export function ParticleTrail({ 
  isVisible, 
  onComplete 
}: { 
  isVisible: boolean; 
  onComplete?: () => void;
}) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.05,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              initial={{ 
                scale: 0,
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((particle.id * 30) * Math.PI / 180) * 100,
                y: Math.sin((particle.id * 30) * Math.PI / 180) * 100,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              onAnimationComplete={particle.id === 0 ? onComplete : undefined}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Main Success Animation Component
export default function SuccessAnimation({
  isVisible,
  onComplete,
  message = 'Sucesso!',
  type = 'confetti',
  soundEnabled = false,
}: SuccessAnimationProps) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowMessage(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [isVisible]);

  // Play sound effect (optional)
  useEffect(() => {
    if (isVisible && soundEnabled && typeof window !== 'undefined') {
      // Create a simple success beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, [isVisible, soundEnabled]);

  const renderAnimation = () => {
    switch (type) {
      case 'checkmark':
        return <SuccessCheckmark isVisible={isVisible} onComplete={onComplete} />;
      case 'stars':
        return <FloatingStars isVisible={isVisible} onComplete={onComplete} />;
      case 'minimal':
        return <ParticleTrail isVisible={isVisible} onComplete={onComplete} />;
      case 'confetti':
      default:
        return <ConfettiExplosion isVisible={isVisible} onComplete={onComplete} />;
    }
  };

  return (
    <>
      {renderAnimation()}
      
      {/* Success Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for easy success animation usage
export function useSuccessAnimation() {
  const [isVisible, setIsVisible] = useState(false);

  const triggerSuccess = (type?: 'confetti' | 'checkmark' | 'stars' | 'minimal') => {
    setIsVisible(true);
  };

  const hideSuccess = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    triggerSuccess,
    hideSuccess,
  };
}