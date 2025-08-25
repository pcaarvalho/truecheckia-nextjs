'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
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
  Zap,
  Plus,
  Filter,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  stats?: Array<{ label: string; value: string | number; change?: number; icon?: React.ComponentType<{ className?: string }> }>;
  className?: string;
  isCollapsed?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

// Generate real-time notifications based on user data
function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const realNotifications: Notification[] = [];
    
    // Credit warning notification
    if (user.credits !== undefined && user.credits <= 5) {
      realNotifications.push({
        id: 'credits-low',
        title: 'Credits Running Low',
        message: `You have ${user.credits} credits remaining`,
        type: 'warning',
        time: '1h',
        read: false,
      });
    }
    
    // Welcome notification for new users
    if (user && user.credits === 10) {
      realNotifications.push({
        id: 'welcome',
        title: 'Welcome to TrueCheckIA',
        message: 'Start analyzing your first text content',
        type: 'info',
        time: '5 min',
        read: false,
      });
    }
    
    // Add more notifications based on actual user activity
    setNotifications(realNotifications);
  }, [user]);
  
  return notifications;
}

export function DashboardHeader({ 
  title = 'Dashboard',
  breadcrumbs = [],
  stats = [],
  className,
  isCollapsed = false
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  const notifications = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would toggle the theme
    document.documentElement.classList.toggle('dark');
  };

  const headerVariants = {
    expanded: { paddingLeft: '1.5rem' },
    collapsed: { paddingLeft: '5rem' }
  };

  return (
    <motion.header
      variants={headerVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'sticky top-0 z-30 flex flex-col',
        'bg-white/80 backdrop-blur-xl border-b border-neutral-200/60',
        'dark:bg-neutral-950/80 dark:border-neutral-800/60',
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
              className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 mb-1"
            >
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className={cn(
                    'hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors',
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
            className="text-2xl font-bold text-neutral-900 dark:text-neutral-100"
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
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Notificações
                    </h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer',
                          !notification.read && 'bg-brand-50/50 dark:bg-brand-950/30'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            notification.type === 'success' && 'bg-success-500',
                            notification.type === 'warning' && 'bg-warning-500',
                            notification.type === 'error' && 'bg-error-500',
                            notification.type === 'info' && 'bg-brand-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {notification.title}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                              {notification.time} ago
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50">
                    <Button variant="ghost" size="sm" className="w-full text-sm">
                      View all notifications
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 relative"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 border-2 border-white dark:border-neutral-950 rounded-full" />
            </Button>
            
            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {user?.name || user?.email || 'User'}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                      <User className="w-4 h-4" />
                      Perfil
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Button>
                    <hr className="my-2 border-neutral-200 dark:border-neutral-800" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={logout}
                      className="w-full justify-start gap-3 text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-950/50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                <div className="p-2 bg-brand-50 dark:bg-brand-950/50 rounded-xl">
                  <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {stat.value}
                    </p>
                    {stat.change !== undefined && (
                      <span className={cn(
                        'text-xs font-medium flex items-center gap-1',
                        isPositive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
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

export default DashboardHeader;