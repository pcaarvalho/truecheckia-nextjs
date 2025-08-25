'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain, Zap, Sparkles, Bot, Search, FileText } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  type?: 'analysis' | 'upload' | 'search' | 'default' | 'minimal';
  showProgress?: boolean;
  progress?: number;
}

// Creative loading messages that change
const analysisMessages = [
  "Analisando cada palavra com cuidado...",
  "Detectando padrões linguísticos...",
  "Comparando com nossa base de dados...",
  "Aplicando algoritmos de ML...",
  "Refinando os resultados...",
  "Quase finalizando a análise...",
];

const uploadMessages = [
  "Recebendo seu arquivo...",
  "Processando o conteúdo...",
  "Extraindo o texto...",
  "Preparando para análise...",
  "Validando a qualidade...",
  "Finalizando o upload...",
];

const searchMessages = [
  "Procurando nos registros...",
  "Organizando os resultados...",
  "Filtrando conteúdo relevante...",
  "Classificando por relevância...",
  "Preparando a visualização...",
  "Concluindo a busca...",
];

// Animated Logo with Pulse
function PulsingLogo() {
  return (
    <motion.div
      className="relative w-16 h-16 mx-auto mb-6"
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0] 
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" 
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl shadow-lg"
        animate={{
          boxShadow: [
            "0 4px 20px rgba(59, 130, 246, 0.3)",
            "0 8px 30px rgba(147, 51, 234, 0.4)",
            "0 4px 20px rgba(59, 130, 246, 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="flex items-center justify-center h-full text-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Brain className="w-8 h-8" />
        </motion.div>
      </motion.div>
      
      {/* Orbiting particles */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
        animate={{
          x: [0, 20, 0, -20, 0],
          y: [0, -20, 0, 20, 0],
        }}
        style={{ transformOrigin: '0 0' }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Skeleton Screen with Shimmer
export function SkeletonLoader({ 
  lines = 3, 
  showAvatar = false 
}: { 
  lines?: number; 
  showAvatar?: boolean; 
}) {
  return (
    <div className="space-y-4 p-4">
      {showAvatar && (
        <div className="flex items-start space-x-4">
          <motion.div
            className="w-12 h-12 bg-gray-200 rounded-full relative overflow-hidden"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: [-100, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <div className="flex-1 space-y-2">
            {Array.from({ length: 2 }, (_, i) => (
              <motion.div
                key={i}
                className="h-4 bg-gray-200 rounded relative overflow-hidden"
                style={{ width: i === 0 ? '60%' : '40%' }}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {Array.from({ length: lines }, (_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded relative overflow-hidden"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: [-100, 200] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Progress Bar with Personality
export function PersonalityProgressBar({ 
  progress = 0, 
  showPercentage = true,
  animated = true 
}: { 
  progress?: number; 
  showPercentage?: boolean;
  animated?: boolean;
}) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{ x: [-20, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
        
        {/* Progress trail effect */}
        {animated && (
          <motion.div
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent to-white opacity-30 rounded-full"
            animate={{ x: [0, 300] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
      
      {showPercentage && (
        <motion.div
          className="text-center mt-2 text-sm font-medium text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(displayProgress)}%
        </motion.div>
      )}
    </div>
  );
}

// Rotating Messages Component
function RotatingMessages({ messages }: { messages: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="relative h-8 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          className="text-gray-600 text-center absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {messages[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// Floating Particles Animation
function FloatingParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    initialX: Math.random() * 200,
    initialY: Math.random() * 200,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-blue-400 rounded-full opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.initialX,
            top: particle.initialY,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Bouncing Dots Loader
function BouncingDots() {
  return (
    <div className="flex space-x-2 justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-blue-500 rounded-full"
          animate={{
            y: [-8, 0, -8],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Main Loading Component
export default function LoadingState({
  isLoading,
  message,
  type = 'default',
  showProgress = false,
  progress = 0,
}: LoadingStateProps) {
  const getMessages = () => {
    switch (type) {
      case 'analysis':
        return analysisMessages;
      case 'upload':
        return uploadMessages;
      case 'search':
        return searchMessages;
      default:
        return analysisMessages;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'analysis':
        return <Brain className="w-8 h-8 text-blue-500" />;
      case 'upload':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'search':
        return <Search className="w-8 h-8 text-purple-500" />;
      default:
        return <Bot className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-sm mx-4 relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <FloatingParticles />
            
            <div className="relative z-10 text-center">
              {type === 'minimal' ? (
                <BouncingDots />
              ) : (
                <>
                  {/* Icon or Logo */}
                  <motion.div
                    className="mb-6"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    {type === 'default' ? <PulsingLogo /> : (
                      <div className="flex justify-center">
                        {getIcon()}
                      </div>
                    )}
                  </motion.div>

                  {/* Progress Bar */}
                  {showProgress && (
                    <div className="mb-6">
                      <PersonalityProgressBar progress={progress} />
                    </div>
                  )}

                  {/* Messages */}
                  <div className="mb-4">
                    {message ? (
                      <motion.p
                        className="text-gray-800 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {message}
                      </motion.p>
                    ) : (
                      <RotatingMessages messages={getMessages()} />
                    )}
                  </div>

                  {/* Subtitle */}
                  <motion.p
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Isso pode levar alguns segundos...
                  </motion.p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized Loading States
export function AnalysisLoader(props: Omit<LoadingStateProps, 'type'>) {
  return <LoadingState type="analysis" {...props} />;
}

export function UploadLoader(props: Omit<LoadingStateProps, 'type'>) {
  return <LoadingState type="upload" {...props} />;
}

export function SearchLoader(props: Omit<LoadingStateProps, 'type'>) {
  return <LoadingState type="search" {...props} />;
}

export function MinimalLoader(props: Omit<LoadingStateProps, 'type'>) {
  return <LoadingState type="minimal" {...props} />;
}

// Inline Loading Components
export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`inline-block ${sizeClasses[size]} border-2 border-blue-500 border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function PulseLoader() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}