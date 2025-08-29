'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentages of screen height [50, 100]
  initialSnap?: number; // Index of initial snap point
  showDragHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [50, 100],
  initialSnap = 0,
  showDragHandle = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
}: BottomSheetProps) {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate current height based on snap point
  const currentHeight = snapPoints[currentSnapIndex];

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: any, info: PanInfo) => {
      setIsDragging(false);
      
      const { offset, velocity } = info;
      const threshold = 50;
      const swipeThreshold = 500;

      // Close if dragged down significantly or with high velocity
      if (
        offset.y > threshold && velocity.y > 0 ||
        velocity.y > swipeThreshold
      ) {
        onClose();
        return;
      }

      // Find the nearest snap point
      let targetSnapIndex = currentSnapIndex;
      
      if (offset.y < -threshold || velocity.y < -swipeThreshold) {
        // Dragged up - go to next snap point
        targetSnapIndex = Math.min(currentSnapIndex + 1, snapPoints.length - 1);
      } else if (offset.y > threshold || velocity.y > swipeThreshold) {
        // Dragged down - go to previous snap point
        targetSnapIndex = Math.max(currentSnapIndex - 1, 0);
      }

      setCurrentSnapIndex(targetSnapIndex);
    },
    [currentSnapIndex, snapPoints.length, onClose]
  );

  const sheetVariants = {
    hidden: {
      y: '100%',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    visible: {
      y: `${100 - currentHeight}%`,
      transition: {
        type: 'spring',
        damping: isDragging ? 0 : 25,
        stiffness: isDragging ? 300 : 200,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm ${overlayClassName}`}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl ${className}`}
            style={{
              height: `${currentHeight}vh`,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Drag Handle */}
            {showDragHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-auto p-2"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>

            {/* Snap Point Indicators */}
            {snapPoints.length > 1 && (
              <div className="flex justify-center space-x-2 py-3">
                {snapPoints.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSnapIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSnapIndex
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                    aria-label={`Ir para posição ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick analysis bottom sheet component
interface QuickAnalysisSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAnalysisSheet({ isOpen, onClose }: QuickAnalysisSheetProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      onClose();
    }, 2000);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Analysis"
      snapPoints={[60, 90]}
      className="max-w-md mx-auto"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Text for analysis
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole ou digite o texto que deseja analisar..."
            className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 text-right">
            {text.length}/1000 caracteres
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          className="w-full py-3 text-base"
          style={{ minHeight: '44px' }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          The analysis will be processed with advanced AI to detect artificially generated content.
        </div>
      </div>
    </BottomSheet>
  );
}