'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { ButtonV2 as Button } from '@/components/ui/button-v2';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Search,
  Bell,
  Moon,
  Sun,
  Command,
  ChevronRight,
  User,
  Settings,
  LogOut,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface SimpleHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  stats?: Array<{ label: string; value: string | number; change?: number; icon?: React.ComponentType<{ className?: string }> }>;
  className?: string;
  isCollapsed?: boolean;
  onLogout?: () => void;
}

export function SimpleHeader({ 
  title = 'Dashboard',
  breadcrumbs = [],
  stats = [],
  className,
  isCollapsed = false,
  onLogout
}: SimpleHeaderProps) {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.header
      animate={{ paddingLeft: isCollapsed ? '1.5rem' : '1.5rem' }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'sticky top-0 z-30 flex flex-col',
        'bg-white/80 backdrop-blur-xl border-b border-gray-200',
        'dark:bg-gray-900/80 dark:border-gray-800',
        className
      )}
    >
      {/* Main Header Row */}
      <div className="flex items-center justify-between py-4 pr-6">
        {/* Left Section - Breadcrumbs & Title */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1"
            >
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className={cn(
                    'hover:text-gray-700 dark:hover:text-gray-300 transition-colors',
                    crumb.href && 'cursor-pointer'
                  )}>
                    {crumb.label}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </React.Fragment>
              ))}
            </motion.nav>
          )}
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            {title}
          </motion.h1>
        </div>
        
        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Command Palette Button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
          >
            <Command className="w-4 h-4" />
            <span className="text-xs">⌘K</span>
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThemeToggle}
            className="p-2"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                3
              </span>
            </Button>
            
            {/* Simple notification dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Notificações
                  </h3>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Analysis Complete
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Sua análise foi processada com sucesso
                      </p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Limite de Uso
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Você está próximo do limite mensal
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 relative"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </Button>
            
            {/* User Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.name || user?.email || 'User'}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLogout || logout}
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Stats Row */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-6 pb-4 pr-6 overflow-x-auto"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon || TrendingUp;
            const isPositive = (stat.change || 0) >= 0;
            
            return (
              <div key={index} className="flex items-center gap-3 min-w-0 flex-shrink-0">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-xl">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    {stat.change !== undefined && (
                      <span className={cn(
                        'text-xs font-medium flex items-center gap-1',
                        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        <TrendingUp className={cn(
                          'w-3 h-3',
                          !isPositive && 'rotate-180'
                        )} />
                        {Math.abs(stat.change)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.header>
  );
}

export default SimpleHeader;