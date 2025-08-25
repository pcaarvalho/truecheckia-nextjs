'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Component error caught:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center">
          {/* Error Icon */}
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          {/* Error Message */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para corrigir o problema.
          </p>
          
          {/* Error Details (dev mode only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-2">
                Detalhes do erro (desenvolvimento)
              </summary>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-xs text-red-800 dark:text-red-200 font-mono overflow-auto">
                <div className="mb-2">
                  <strong>Erro:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={resetError}
              className="w-full flex items-center justify-center gap-2"
              variant="default"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Home className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>
          
          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            If the problem persists, contact our support team.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorBoundary;
export { DefaultErrorFallback };