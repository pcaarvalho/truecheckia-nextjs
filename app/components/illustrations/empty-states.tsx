'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Bot, 
  FileText, 
  Search, 
  Upload, 
  Brain, 
  Zap,
  Sparkles,
  Heart,
  Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type?: 'no-data' | 'no-results' | 'no-files' | 'error' | 'loading';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAnimation?: boolean;
}

// Rotating encouraging messages
const encouragingMessages = [
  "Seus dados vão aparecer aqui em breve!",
  "Que tal começar uma nova análise?",
  "Estamos ansiosos para ver seus resultados!",
  "Vamos descobrir algo incrível juntos!",
  "Sua próxima análise pode ser a melhor!",
  "Estamos aqui para ajudar você!",
  "Cada análise é uma nova descoberta!",
];

const loadingMessages = [
  "Analisando com carinho...",
  "Fazendo a mágica acontecer...",
  "Desvendando os mistérios...",
  "Processando com amor...",
  "Quase lá...",
  "Trabalhando duro para você...",
];

// Animated Robot Illustration
function AnimatedRobot() {
  return (
    <div className="relative">
      {/* Robot Body */}
      <motion.div
        className="relative"
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 1, -1, 0] 
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        {/* Head */}
        <motion.div 
          className="w-16 h-14 bg-gradient-to-b from-blue-400 to-blue-500 rounded-2xl mx-auto mb-2 relative shadow-lg"
          animate={{ 
            scaleX: [1, 1.05, 1],
            scaleY: [1, 0.98, 1] 
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          {/* Eyes */}
          <motion.div 
            className="flex space-x-2 pt-4 justify-center"
            animate={{ 
              scale: [1, 0.8, 1] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </motion.div>
          
          {/* Antenna */}
          <motion.div 
            className="absolute -top-2 left-1/2 transform -translate-x-1/2"
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <div className="w-0.5 h-4 bg-blue-600"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full -mt-0.5"></div>
          </motion.div>
        </motion.div>

        {/* Body */}
        <div className="w-20 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl mx-auto relative shadow-lg">
          {/* Screen */}
          <motion.div 
            className="w-12 h-8 bg-green-400 rounded-lg mx-auto pt-3"
            animate={{ 
              opacity: [0.7, 1, 0.7],
              backgroundColor: ['#4ade80', '#22c55e', '#4ade80'] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <div className="text-center text-xs text-green-900 font-mono">AI</div>
          </motion.div>
          
          {/* Control Buttons */}
          <div className="flex justify-center space-x-1 mt-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-red-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            ></motion.div>
            <motion.div 
              className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            ></motion.div>
            <motion.div 
              className="w-1.5 h-1.5 bg-green-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            ></motion.div>
          </div>
        </div>

        {/* Arms */}
        <motion.div 
          className="absolute top-16 -left-6 w-4 h-2 bg-blue-500 rounded-full"
          animate={{ rotate: [0, 20, 0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute top-16 -right-6 w-4 h-2 bg-blue-500 rounded-full"
          animate={{ rotate: [0, -20, 0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-8 -left-8"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles className="w-4 h-4 text-yellow-400" />
      </motion.div>

      <motion.div
        className="absolute -top-4 -right-6"
        animate={{
          y: [0, -15, 0],
          x: [0, -3, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Zap className="w-3 h-3 text-blue-400" />
      </motion.div>

      <motion.div
        className="absolute top-12 -right-10"
        animate={{
          y: [0, -8, 0],
          x: [0, 8, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <Heart className="w-3 h-3 text-pink-400" />
      </motion.div>
    </div>
  );
}

// Floating Files Animation
function FloatingFiles() {
  const files = [
    { icon: FileText, delay: 0, color: 'text-blue-500' },
    { icon: Search, delay: 0.5, color: 'text-green-500' },
    { icon: Upload, delay: 1, color: 'text-purple-500' },
  ];

  return (
    <div className="relative w-32 h-32 mx-auto">
      {files.map((file, index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 flex items-center justify-center ${file.color}`}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: file.delay,
          }}
        >
          <file.icon className="w-8 h-8" />
        </motion.div>
      ))}
    </div>
  );
}

// Rotating Messages Component
function RotatingMessage({ messages }: { messages: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

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

// Main Empty State Component
export default function EmptyState({
  type = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  showAnimation = true,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-results':
        return {
          title: title || 'Nenhum resultado encontrado',
          description: description || 'Tente ajustar seus filtros ou fazer uma nova busca.',
          illustration: <FloatingFiles />,
          actionLabel: actionLabel || 'Nova Busca',
        };
      case 'no-files':
        return {
          title: title || 'Nenhum arquivo ainda',
          description: description || 'Faça upload do seu primeiro arquivo para começar!',
          illustration: <FloatingFiles />,
          actionLabel: actionLabel || 'Fazer Upload',
        };
      case 'error':
        return {
          title: title || 'Oops! Algo deu errado',
          description: description || 'Mas não se preocupe, estamos trabalhando para resolver isso.',
          illustration: <AnimatedRobot />,
          actionLabel: actionLabel || 'Tentar Novamente',
        };
      case 'loading':
        return {
          title: title || 'Carregando...',
          description: description || 'Preparando tudo para você.',
          illustration: <AnimatedRobot />,
          actionLabel: null,
        };
      case 'no-data':
      default:
        return {
          title: title || 'Ainda não há dados aqui',
          description: description || 'Mas isso vai mudar em breve!',
          illustration: <AnimatedRobot />,
          actionLabel: actionLabel || 'Começar Análise',
        };
    }
  };

  const content = getContent();

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-8 text-center max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Illustration */}
      {showAnimation && (
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {content.illustration}
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        className="text-xl font-semibold text-gray-900 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {content.title}
      </motion.h3>

      {/* Description */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {type === 'loading' ? (
          <RotatingMessage messages={loadingMessages} />
        ) : (
          content.description && (
            <div>
              <p className="text-gray-600 mb-4">{content.description}</p>
              <RotatingMessage messages={encouragingMessages} />
            </div>
          )
        )}
      </motion.div>

      {/* Action Button */}
      {content.actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={onAction} className="group relative overflow-hidden">
            <motion.span
              className="relative z-10 flex items-center"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              {content.actionLabel}
              <motion.div
                className="ml-2"
                animate={{ x: [0, 3, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                →
              </motion.div>
            </motion.span>
            
            {/* Hover effect background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
        </motion.div>
      )}

      {/* Coffee animation for long waits */}
      {type === 'loading' && (
        <motion.div
          className="mt-8 flex items-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Coffee className="w-4 h-4 mr-2" />
          </motion.div>
          Talvez seja hora de um café...
        </motion.div>
      )}
    </motion.div>
  );
}

// Specialized Empty States
export function NoDataState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="no-data" {...props} />;
}

export function NoResultsState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="no-results" {...props} />;
}

export function NoFilesState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="no-files" {...props} />;
}

export function ErrorState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="error" {...props} />;
}

export function LoadingState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="loading" {...props} />;
}